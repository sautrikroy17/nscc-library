import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { transactions as txApi, exportData } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';

const STATUS_MAP = {
  issued:   { label: 'Issued',   className: 'badge-info' },
  returned: { label: 'Returned', className: 'badge-success' },
  overdue:  { label: 'Overdue',  className: 'badge-danger' },
};

function TransactionRow({ tx, index, isLibrarian }) {
  const status = tx.is_overdue ? 'overdue' : tx.status;
  const { label, className } = STATUS_MAP[status] || { label: status, className: 'badge-neutral' };
  const overdueDays = tx.overdue_days || 0;
  const fine = overdueDays * 5;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <td>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-3)' }}>{tx.id?.slice(0, 8)}…</div>
      </td>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{tx.book_title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{tx.book_id}</div>
      </td>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.borrower_name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{tx.borrower_reg}</div>
      </td>
      <td>
        <div style={{ fontSize: 13 }}>{new Date(tx.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
      </td>
      <td>
        <div style={{
          fontSize: 13,
          color: tx.is_overdue ? 'var(--danger)' : 'var(--text-2)',
          fontWeight: tx.is_overdue ? 700 : 400,
        }}>
          {new Date(tx.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
          {tx.is_overdue && <span className="overdue-blink" style={{ marginLeft: 4 }}>⚠️</span>}
        </div>
      </td>
      <td>
        <span className={`badge ${className}`}>{label}</span>
      </td>
      {isLibrarian && (
        <td>
          {fine > 0 ? (
            <span style={{ color: 'var(--danger)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>₹{fine}</span>
          ) : (
            <span style={{ color: 'var(--text-4)', fontSize: 13 }}>—</span>
          )}
        </td>
      )}
    </motion.tr>
  );
}

export default function Transactions() {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian';

  const [txList, setTxList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchTx = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, status };
      if (search.trim()) params.q = search.trim();
      if (!isLibrarian) params.borrower_reg = user?.reg_number;
      const data = await txApi.list(params);
      setTxList(data.transactions);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchTx, 200);
    return () => clearTimeout(timeout);
  }, [page, status, search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">🔄 Transactions</h1>
          <p className="page-subtitle">{total} total records</p>
        </div>
        {isLibrarian && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportData.csv({ status })}
            >
              📥 Export CSV
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportData.excel({ status })}
            >
              📊 Export Excel
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span style={{ color: 'var(--text-4)', fontSize: 16 }}>🔍</span>
          <input
            placeholder="Search by name, reg number, book title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          )}
        </div>
        <select className="input" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : txList.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 56 }}>📭</span>
            <div className="empty-state-title">No transactions found</div>
            <div className="empty-state-desc">Try adjusting your filters or search term</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Book</th>
                  <th>Borrower</th>
                  <th>Issued On</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  {isLibrarian && <th>Fine</th>}
                </tr>
              </thead>
              <tbody>
                {txList.map((tx, i) => (
                  <TransactionRow key={tx.id} tx={tx} index={i} isLibrarian={isLibrarian} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
              Page {page} of {totalPages} · {total} records
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                );
              })}
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >Next →</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
