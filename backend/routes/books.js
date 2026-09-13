const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// GET /api/books — list all books with optional filters
router.get('/', authenticateToken, (req, res) => {
  const { q, category, availability, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Build shared WHERE clause (reused for both data + count)
  let where = 'WHERE 1=1';
  const filterParams = [];

  if (q) {
    where += ' AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR isbn LIKE ? OR id LIKE ?)';
    const term = `%${q.toLowerCase()}%`;
    filterParams.push(term, term, term, term);
  }
  if (category && category !== 'All') {
    where += ' AND category = ?';
    filterParams.push(category);
  }
  if (availability === 'available') {
    where += ' AND available_copies > 0';
  } else if (availability === 'unavailable') {
    where += ' AND available_copies = 0';
  }

  const books = db.prepare(`SELECT * FROM books ${where} ORDER BY title ASC LIMIT ? OFFSET ?`)
    .all(...filterParams, parseInt(limit), offset);

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM books ${where}`)
    .get(...filterParams).cnt;

  res.json({ books, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/books/categories
router.get('/categories', authenticateToken, (req, res) => {
  const cats = db.prepare('SELECT DISTINCT category FROM books ORDER BY category').all().map(r => r.category);
  res.json({ categories: ['All', ...cats] });
});

// GET /api/books/:id
router.get('/:id', authenticateToken, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({ book });
});

// POST /api/books — add new book (librarian only)
router.post('/', authenticateToken, requireLibrarian, (req, res) => {
  const { title, author, isbn, category, total_copies, shelf_location, description, cover_color, published_year } = req.body;

  if (!title || !author || !category) {
    return res.status(400).json({ error: 'Title, author, and category are required' });
  }

  const copies = parseInt(total_copies) || 1;
  const id = 'BK' + String(db.prepare("SELECT COUNT(*)+1 as cnt FROM books").get().cnt).padStart(3, '0');

  db.prepare(`
    INSERT INTO books (id, title, author, isbn, category, total_copies, available_copies, shelf_location, description, cover_color, published_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title.trim(), author.trim(), isbn || null, category,
    copies, copies, shelf_location || null, description || null,
    cover_color || '#10b981', published_year || null
  );

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  res.status(201).json({ book });
});

// PUT /api/books/:id — update book (librarian only)
router.put('/:id', authenticateToken, requireLibrarian, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const { title, author, isbn, category, total_copies, shelf_location, description, cover_color, published_year } = req.body;

  const newTotal = parseInt(total_copies) || book.total_copies;
  const diff = newTotal - book.total_copies;
  const newAvailable = Math.max(0, book.available_copies + diff);

  db.prepare(`
    UPDATE books SET
      title = ?, author = ?, isbn = ?, category = ?,
      total_copies = ?, available_copies = ?,
      shelf_location = ?, description = ?, cover_color = ?,
      published_year = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title || book.title, author || book.author, isbn !== undefined ? isbn : book.isbn,
    category || book.category, newTotal, newAvailable,
    shelf_location !== undefined ? shelf_location : book.shelf_location,
    description !== undefined ? description : book.description,
    cover_color || book.cover_color, published_year || book.published_year,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  res.json({ book: updated });
});

// DELETE /api/books/:id — soft-delete/remove book (librarian only)
router.delete('/:id', authenticateToken, requireLibrarian, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const activeLoans = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE book_id = ? AND status IN ('issued','overdue')").get(req.params.id).cnt;
  if (activeLoans > 0) {
    return res.status(409).json({ error: `Cannot delete book with ${activeLoans} active loan(s). Return all copies first.` });
  }

  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.json({ message: 'Book deleted successfully' });
});

module.exports = router;
