const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

// GET /api/stats — admin dashboard stats
router.get('/', authenticateToken, (req, res) => {
  const totalBooks = db.prepare('SELECT COUNT(*) as cnt FROM books').get().cnt;
  const totalCopies = db.prepare('SELECT SUM(total_copies) as cnt FROM books').get().cnt || 0;
  const availableCopies = db.prepare('SELECT SUM(available_copies) as cnt FROM books').get().cnt || 0;
  const issuedCount = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE status IN ('issued','overdue')").get().cnt;
  const overdueCount = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE status = 'overdue'").get().cnt;

  // Recalculate live overdue from due dates
  const activeLoans = db.prepare("SELECT id, due_date FROM transactions WHERE status IN ('issued','overdue')").all();
  let liveOverdue = 0;
  for (const loan of activeLoans) {
    const diff = new Date() - new Date(loan.due_date);
    if (diff > 0) {
      liveOverdue++;
      db.prepare("UPDATE transactions SET status='overdue' WHERE id=?").run(loan.id);
    }
  }

  const finesTotal = db.prepare("SELECT SUM(fine_amount) as total FROM transactions WHERE fine_amount > 0").get().total || 0;
  const finesCollected = db.prepare("SELECT SUM(fine_amount) as total FROM transactions WHERE fine_collected = 1").get().total || 0;
  const totalTransactions = db.prepare('SELECT COUNT(*) as cnt FROM transactions').get().cnt;
  const returnedCount = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE status = 'returned'").get().cnt;

  // Category distribution
  const categoryStats = db.prepare(`
    SELECT category, COUNT(*) as count, SUM(total_copies) as copies, SUM(available_copies) as available
    FROM books GROUP BY category ORDER BY count DESC
  `).all();

  // Day-wise circulation activity (last 14 days timeline)
  const dailyActivity = [];
  const DAYS_TRACKED = 14;
  for (let i = DAYS_TRACKED - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const issued = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE DATE(issue_date) = ?").get(dateStr).cnt || 0;
    const returned = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE DATE(return_date) = ?").get(dateStr).cnt || 0;
    dailyActivity.push({
      date: dateStr,
      day: dayName,
      label,
      issued,
      returned,
      net: issued - returned
    });
  }

  // Recent overdue books
  const overdueBooks = db.prepare(`
    SELECT t.*, b.title, b.author, b.isbn
    FROM transactions t JOIN books b ON b.id = t.book_id
    WHERE t.status = 'overdue'
    ORDER BY t.due_date ASC LIMIT 10
  `).all().map(t => {
    const days = Math.floor((new Date() - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
    return { ...t, overdue_days: days, fine: days * 5 };
  });

  res.json({
    overview: {
      total_books: totalBooks,
      total_copies: totalCopies,
      available_copies: availableCopies,
      issued_count: issuedCount,
      overdue_count: liveOverdue,
      fines_total: finesTotal,
      fines_collected: finesCollected,
      total_transactions: totalTransactions,
      returned_count: returnedCount,
    },
    category_stats: categoryStats,
    daily_activity: dailyActivity,
    overdue_books: overdueBooks,
  });
});

module.exports = router;
