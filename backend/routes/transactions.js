const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

const FINE_PER_DAY = 5; // ₹5 per overdue day
const DEFAULT_LOAN_DAYS = 14;

function calcOverdue(due_date) {
  const now = new Date();
  const due = new Date(due_date);
  const diffMs = now - due;
  if (diffMs <= 0) return { overdue_days: 0, fine: 0 };
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { overdue_days: days, fine: days * FINE_PER_DAY };
}

// GET /api/transactions — all transactions with filters
router.get('/', authenticateToken, (req, res) => {
  const { status, book_id, borrower_reg, q, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE 1=1';
  const filterParams = [];

  if (status && status !== 'all') { where += ' AND t.status = ?'; filterParams.push(status); }
  if (book_id) { where += ' AND t.book_id = ?'; filterParams.push(book_id); }
  if (borrower_reg) { where += ' AND t.borrower_reg = ?'; filterParams.push(borrower_reg); }
  if (q) {
    where += ' AND (LOWER(t.borrower_name) LIKE ? OR LOWER(t.borrower_reg) LIKE ? OR LOWER(b.title) LIKE ?)';
    const term = `%${q.toLowerCase()}%`;
    filterParams.push(term, term, term);
  }

  const rows = db.prepare(`
    SELECT t.*, b.title as book_title, b.author as book_author, b.isbn as book_isbn, b.category as book_category
    FROM transactions t JOIN books b ON b.id = t.book_id
    ${where}
    ORDER BY t.issue_date DESC LIMIT ? OFFSET ?
  `).all(...filterParams, parseInt(limit), offset);

  // Recalculate overdue status for active loans in real time
  const transactions = rows.map(tx => {
    if (tx.status === 'issued') {
      const { overdue_days, fine } = calcOverdue(tx.due_date);
      if (overdue_days > 0) {
        db.prepare("UPDATE transactions SET status='overdue', fine_amount=? WHERE id=?").run(fine, tx.id);
        return { ...tx, status: 'overdue', fine_amount: fine, overdue_days, is_overdue: true };
      }
    }
    if (tx.status === 'overdue') {
      const { overdue_days, fine } = calcOverdue(tx.due_date);
      return { ...tx, fine_amount: fine, overdue_days, is_overdue: true };
    }
    return { ...tx, overdue_days: 0, is_overdue: false };
  });

  const total = db.prepare(`
    SELECT COUNT(*) as cnt FROM transactions t JOIN books b ON b.id = t.book_id ${where}
  `).get(...filterParams).cnt;

  res.json({ transactions, total });
});

// GET /api/transactions/:id
router.get('/:id', authenticateToken, (req, res) => {
  const tx = db.prepare(`
    SELECT t.*, b.title as book_title, b.author as book_author, b.isbn as book_isbn
    FROM transactions t JOIN books b ON b.id = t.book_id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ transaction: tx });
});

// POST /api/transactions/issue — issue a book (librarian only)
router.post('/issue', authenticateToken, requireLibrarian, (req, res) => {
  const { book_id, borrower_name, borrower_reg, borrower_dept, loan_days } = req.body;

  if (!book_id || !borrower_name || !borrower_reg) {
    return res.status(400).json({ error: 'Book ID, borrower name, and registration number are required' });
  }

  // Validate book exists
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  // Validate availability
  if (book.available_copies <= 0) {
    return res.status(409).json({ error: `"${book.title}" has no available copies. All ${book.total_copies} copies are currently issued.` });
  }

  // Prevent duplicate active loan for same borrower + book
  const existingLoan = db.prepare(
    "SELECT id FROM transactions WHERE book_id = ? AND borrower_reg = ? AND status IN ('issued','overdue')"
  ).get(book_id, borrower_reg.trim());
  if (existingLoan) {
    return res.status(409).json({ error: `${borrower_reg} already has an active loan for "${book.title}". They must return it first.` });
  }

  const days = parseInt(loan_days) || DEFAULT_LOAN_DAYS;
  const due_date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const id = uuidv4();

  const issueTransaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO transactions (id, book_id, borrower_id, borrower_name, borrower_reg, borrower_dept, issued_by, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, 'issued')
    `).run(
      id, book_id, req.user.id,
      borrower_name.trim(), borrower_reg.trim(), borrower_dept || 'General',
      req.user.id, due_date
    );

    db.prepare('UPDATE books SET available_copies = available_copies - 1, updated_at = datetime(\'now\') WHERE id = ?').run(book_id);
  });

  issueTransaction();

  const tx = db.prepare(`
    SELECT t.*, b.title as book_title, b.author as book_author
    FROM transactions t JOIN books b ON b.id = t.book_id WHERE t.id = ?
  `).get(id);

  res.status(201).json({ transaction: tx, message: `"${book.title}" successfully issued to ${borrower_name}` });
});

// POST /api/transactions/return — return a book (librarian only)
router.post('/return', authenticateToken, requireLibrarian, (req, res) => {
  const { transaction_id, book_id, borrower_reg, waive_fine } = req.body;

  // Find the active transaction either by ID or by book+borrower
  let tx;
  if (transaction_id) {
    tx = db.prepare("SELECT * FROM transactions WHERE id = ? AND status IN ('issued','overdue')").get(transaction_id);
  } else if (book_id && borrower_reg) {
    tx = db.prepare("SELECT * FROM transactions WHERE book_id = ? AND borrower_reg = ? AND status IN ('issued','overdue')").get(book_id, borrower_reg);
  }

  if (!tx) {
    return res.status(404).json({ error: 'No active loan found for this book/borrower combination' });
  }

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(tx.book_id);
  const { overdue_days, fine } = calcOverdue(tx.due_date);
  const finalFine = waive_fine ? 0 : fine;

  const returnTransaction = db.transaction(() => {
    db.prepare(`
      UPDATE transactions SET
        status = 'returned',
        return_date = datetime('now'),
        fine_amount = ?,
        fine_collected = ?
      WHERE id = ?
    `).run(finalFine, waive_fine ? 0 : (finalFine > 0 ? 1 : 0), tx.id);

    db.prepare("UPDATE books SET available_copies = available_copies + 1, updated_at = datetime('now') WHERE id = ?").run(tx.book_id);
  });

  returnTransaction();

  const updated = db.prepare(`
    SELECT t.*, b.title as book_title FROM transactions t JOIN books b ON b.id = t.book_id WHERE t.id = ?
  `).get(tx.id);

  res.json({
    transaction: updated,
    overdue_days,
    fine: finalFine,
    message: `"${book.title}" returned successfully.${overdue_days > 0 ? ` Overdue by ${overdue_days} days. Fine: ₹${finalFine}` : ' Returned on time!'}`
  });
});

// POST /api/transactions/scan — smart scan: figure out if book should be issued/returned
router.post('/scan', authenticateToken, requireLibrarian, (req, res) => {
  const { book_id } = req.body;
  if (!book_id) return res.status(400).json({ error: 'Book ID is required' });

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
  if (!book) return res.status(404).json({ error: 'Book not found. Invalid QR code.' });

  const activeLoans = db.prepare(`
    SELECT t.*, b.title as book_title FROM transactions t JOIN books b ON b.id = t.book_id
    WHERE t.book_id = ? AND t.status IN ('issued','overdue') ORDER BY t.issue_date DESC LIMIT 5
  `).all(book_id);

  res.json({
    book,
    action: book.available_copies > 0 ? 'can_issue' : 'must_return',
    active_loans: activeLoans,
    message: book.available_copies > 0
      ? `"${book.title}" is available. ${book.available_copies} of ${book.total_copies} copies available.`
      : `"${book.title}" has no available copies. Showing active loans for return.`
  });
});

module.exports = router;
