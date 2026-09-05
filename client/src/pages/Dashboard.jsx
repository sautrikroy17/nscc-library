import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { stats as statsApi } from '../api';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

function StatCard({ icon, label, value, color, index }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`stat-card ${color}`}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

function OverdueRow({ book, index }) {
  const days = book.overdue_days || 0;
  const fine = days * 5;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <td>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{book.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{book.author}</div>
      </td>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{book.borrower_name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{book.borrower_reg}</div>
      </td>
      <td>
        <span className="badge badge-danger overdue-blink">
          {days} day{days !== 1 ? 's' : ''} overdue
        </span>
      </td>
      <td>
        <span style={{ color: 'var(--danger)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
          ₹{fine}
        </span>
      </td>
    </motion.tr>
  );
}

function CategoryBar({ name, count, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{name}</span>
        <span style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ background: 'linear-gradient(90deg, var(--accent), var(--cyan))' }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Refresh every 30s
    const interval = setInterval(() => {
      statsApi.get().then(setData).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const ov = data?.overview || {};
  const cats = data?.category_stats || [];
  const maxCat = Math.max(...cats.map(c => c.count), 1);
  const overdue = data?.overdue_books || [];

  const kpiCards = [
    { icon: '📚', label: 'Total Book Titles', value: ov.total_books, color: 'emerald' },
    { icon: '📦', label: 'Total Copies', value: ov.total_copies, color: 'cyan' },
    { icon: '✅', label: 'Available Now', value: ov.available_copies, color: 'emerald' },
    { icon: '📤', label: 'Currently Issued', value: ov.issued_count, color: 'purple' },
    { icon: '⚠️', label: 'Overdue Books', value: ov.overdue_count, color: 'danger' },
    { icon: '💰', label: 'Total Fines (₹)', value: `₹${ov.fines_total || 0}`, color: 'warning' },
    { icon: '📋', label: 'Total Transactions', value: ov.total_transactions, color: 'cyan' },
    { icon: '↩️', label: 'Returned', value: ov.returned_count, color: 'emerald' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          📊 Dashboard
        </motion.h1>
        <p className="page-subtitle">Live overview of library operations</p>
      </div>

      {/* KPI Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpiCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Bottom section: overdue list + category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Overdue books */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <div className="card-title">
              <span className="overdue-blink">⚠️</span>
              Overdue Books
              {overdue.length > 0 && <span className="nav-badge warning">{overdue.length}</span>}
            </div>
          </div>
          {overdue.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 48 }}>🎉</span>
              <div className="empty-state-title">No overdue books!</div>
              <div className="empty-state-desc">All books are returned on time. Great job!</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Borrower</th>
                    <th>Status</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((book, i) => (
                    <OverdueRow key={book.id} book={book} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <div className="card-title">📂 By Category</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cats.slice(0, 10).map(cat => (
              <CategoryBar key={cat.category} name={cat.category} count={cat.count} maxCount={maxCat} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
