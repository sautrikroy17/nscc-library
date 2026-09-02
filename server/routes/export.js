const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const db = require('../db');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

function getTransactions(filters = {}) {
  let sql = `
    SELECT
      t.id as transaction_id,
      b.title as book_title,
      b.author,
      b.isbn,
      t.book_id,
      t.borrower_name,
      t.borrower_reg as borrower_id,
      t.borrower_dept as department,
      t.issue_date,
      t.due_date,
      t.return_date,
      t.status,
      t.fine_amount,
      t.fine_collected
    FROM transactions t
    JOIN books b ON b.id = t.book_id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status && filters.status !== 'all') {
    sql += ' AND t.status = ?';
    params.push(filters.status);
  }

  sql += ' ORDER BY t.issue_date DESC';
  return db.prepare(sql).all(...params);
}

// GET /api/export/csv
router.get('/csv', authenticateToken, requireLibrarian, (req, res) => {
  const rows = getTransactions(req.query);

  const headers = [
    'Transaction ID', 'Book Title', 'Author', 'ISBN', 'Book ID',
    'Borrower Name', 'Borrower ID', 'Department',
    'Issue Date', 'Due Date', 'Return Date',
    'Status', 'Fine Amount (₹)', 'Fine Collected'
  ];

  const csvRows = [
    headers.join(','),
    ...rows.map(r => [
      r.transaction_id, `"${r.book_title}"`, `"${r.author}"`, r.isbn || '',
      r.book_id, `"${r.borrower_name}"`, r.borrower_id, r.department || '',
      r.issue_date ? new Date(r.issue_date).toLocaleDateString('en-IN') : '',
      r.due_date ? new Date(r.due_date).toLocaleDateString('en-IN') : '',
      r.return_date ? new Date(r.return_date).toLocaleDateString('en-IN') : '',
      r.status, r.fine_amount || 0, r.fine_collected ? 'Yes' : 'No'
    ].join(','))
  ];

  const csv = csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="nscc-library-transactions-${Date.now()}.csv"`);
  res.send(csv);
});

// GET /api/export/excel
router.get('/excel', authenticateToken, requireLibrarian, (req, res) => {
  const rows = getTransactions(req.query);

  const wb = XLSX.utils.book_new();

  // Transactions sheet
  const txData = [
    ['Transaction ID', 'Book Title', 'Author', 'ISBN', 'Book ID', 'Borrower Name', 'Borrower ID', 'Department', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine Amount (₹)', 'Fine Collected'],
    ...rows.map(r => [
      r.transaction_id, r.book_title, r.author, r.isbn || '',
      r.book_id, r.borrower_name, r.borrower_id, r.department || '',
      r.issue_date ? new Date(r.issue_date).toLocaleDateString('en-IN') : '',
      r.due_date ? new Date(r.due_date).toLocaleDateString('en-IN') : '',
      r.return_date ? new Date(r.return_date).toLocaleDateString('en-IN') : '',
      r.status.toUpperCase(), r.fine_amount || 0, r.fine_collected ? 'Yes' : 'No'
    ])
  ];
  const txSheet = XLSX.utils.aoa_to_sheet(txData);
  txSheet['!cols'] = [
    { wch: 38 }, { wch: 40 }, { wch: 25 }, { wch: 18 }, { wch: 8 },
    { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 12 }, { wch: 16 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions');

  // Summary sheet
  const stats = {
    total: rows.length,
    issued: rows.filter(r => r.status === 'issued').length,
    returned: rows.filter(r => r.status === 'returned').length,
    overdue: rows.filter(r => r.status === 'overdue').length,
    fines: rows.reduce((sum, r) => sum + (r.fine_amount || 0), 0),
  };

  const summaryData = [
    ['NSCC SRM IST Library System — Transaction Report'],
    [`Generated: ${new Date().toLocaleString('en-IN')}`],
    [],
    ['Total Transactions', stats.total],
    ['Currently Issued', stats.issued],
    ['Returned', stats.returned],
    ['Overdue', stats.overdue],
    ['Total Fines Accrued (₹)', stats.fines],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="nscc-library-report-${Date.now()}.xlsx"`);
  res.send(buf);
});

module.exports = router;
