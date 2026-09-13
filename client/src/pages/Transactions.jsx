import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftRight, 
  Download, 
  FileSpreadsheet, 
  Search, 
  X, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  User, 
  ChevronLeft,
  ChevronRight,
  Hash
} from 'lucide-react';
import { transactions as txApi, exportData, stats as statsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick } from '../utils/audio';

const STATUS_CONFIG = {
  all:      { label: 'All Records', color: '#64748b', bg: '#f1f5f9' },
  issued:   { label: 'Active Loans', color: '#f59e0b', bg: '#fef3c7' },
  returned: { label: 'Returned',     color: '#10b981', bg: '#ecfdf5' },
  overdue:  { label: 'Overdue Alert',color: '#ef4444', bg: '#fef2f2' },
};

function StatusPill({ status, isOverdue }) {
  const currentStatus = isOverdue ? 'overdue' : status;
  const cfg = STATUS_CONFIG[currentStatus] || { label: currentStatus, color: '#64748b', bg: '#f1f5f9' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      color: cfg.color,
      background: cfg.bg
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: cfg.color
      }} />
      {cfg.label}
    </span>
  );
}

function TransactionRow({ tx, index, isLibrarian }) {
  const isOverdue = tx.is_overdue;
  const overdueDays = tx.overdue_days || 0;
  const fine = overdueDays * 5;

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
      {/* Tx Hash */}
      <td style={{ padding: '14px 18px' }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11.5,
          color: '#64748b',
          background: '#f8fafc',
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #e2e8f0'
        }}>
          #{tx.id?.slice(0, 8)}
        </span>
      </td>

      {/* Book details */}
      <td style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 38,
            borderRadius: 6,
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#0f172a'
          }}>
            <BookOpen size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>
              {tx.book_title}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
              ID: {tx.book_id}
            </div>
          </div>
        </div>
      </td>

      {/* Borrower */}
      <td style={{ padding: '14px 18px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
            {tx.borrower_name}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
              {tx.borrower_reg}
            </span>
            {tx.borrower_dept && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 4,
                background: '#f1f5f9',
                color: '#475569'
              }}>
                {tx.borrower_dept}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Issue Date */}
      <td style={{ padding: '14px 18px', fontSize: 12.5, color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} color="#94a3b8" />
          {new Date(tx.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </td>

      {/* Due Date */}
      <td style={{ padding: '14px 18px' }}>
        <div>
          <div style={{
            fontSize: 12.5,
            color: isOverdue ? '#ef4444' : '#475569',
            fontWeight: isOverdue ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <Clock size={13} color={isOverdue ? '#ef4444' : '#94a3b8'} />
            {new Date(tx.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          {isOverdue && (
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginTop: 2 }}>
              {overdueDays}d overdue
            </div>
          )}
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '14px 18px' }}>
        <StatusPill status={tx.status} isOverdue={isOverdue} />
      </td>

      {/* Fine */}
      {isLibrarian && (
        <td style={{ padding: '14px 18px' }}>
          {fine > 0 ? (
            <span style={{
              color: '#dc2626',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              background: '#fef2f2',
              padding: '2px 7px',
              borderRadius: 4
            }}>
              ₹{fine}
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: 13 }}>₹0</span>
          )}
        </td>
      )}
    </tr>
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
  const [overviewStats, setOverviewStats] = useState({ issued: 0, overdue: 0 });
  const LIMIT = 12;

  const fetchTx = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, status };
      if (search.trim()) params.q = search.trim();
      if (!isLibrarian) params.borrower_reg = user?.reg_number;
      const data = await txApi.list(params);
      setTxList(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await statsApi.get();
      if (data?.overview) {
        setOverviewStats({
          issued: data.overview.issued_books || 0,
          overdue: data.overview.overdue_count || 0
        });
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchTx, 200);
    return () => clearTimeout(timeout);
  }, [page, status, search]);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const handleExportCsv = () => {
    playClick();
    exportData.csv({ status });
    toast.success('CSV export initiated');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Top Header matching Screen 12 */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: '#0f172a',
            margin: 0,
            marginBottom: 4,
            letterSpacing: '-0.5px'
          }}>
            Transaction History
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            {isLibrarian 
              ? 'Real-time log of book issues, returns, and overdue fees' 
              : `Viewing personal borrowing ledger for registration #${user?.reg_number || 'N/A'}`}
          </p>
        </div>

        {isLibrarian && (
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Mini Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Records</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{total}</div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Currently Issued</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>{overviewStats.issued}</div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Overdue Accounts</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>{overviewStats.overdue}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: 14,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '8px 14px',
          flex: 1,
          maxWidth: 420
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            placeholder="Search borrower name, reg #, title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#0f172a',
              fontSize: 13,
              flex: 1
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: '#f1f5f9',
          padding: 3,
          borderRadius: 10
        }}>
          {['all', 'issued', 'returned', 'overdue'].map(s => {
            const active = status === s;
            const labels = { all: 'All', issued: 'Issued', returned: 'Returned', overdue: 'Overdue' };
            return (
              <button
                key={s}
                onClick={() => { playClick(); setStatus(s); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            Querying circulation ledger...
          </div>
        ) : txList.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No transactions found</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Try clearing the search query or status filter</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Tx ID</th>
                  <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Book Details</th>
                  <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Borrower</th>
                  <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Issue Date</th>
                  <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Due Date</th>
                  <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Status</th>
                  {isLibrarian && (
                    <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Fine</th>
                  )}
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
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total records)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={page === 1}
                onClick={() => { playClick(); setPage(p => p - 1); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: 12.5,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => { playClick(); setPage(p => p + 1); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: 12.5,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
