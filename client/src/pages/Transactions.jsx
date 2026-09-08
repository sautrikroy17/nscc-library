import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  Download, 
  FileSpreadsheet, 
  Search, 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  User, 
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { transactions as txApi, exportData, stats as statsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

const STATUS_CONFIG = {
  all:      { label: 'All Records', color: 'var(--text-3)', bg: 'transparent' },
  issued:   { label: 'Active Loans', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.25)' },
  returned: { label: 'Returned',     color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.25)' },
  overdue:  { label: 'Overdue Alert',color: '#f87171', bg: 'rgba(248, 113, 113, 0.14)', border: 'rgba(248, 113, 113, 0.3)' },
};

function StatusPill({ status, isOverdue }) {
  const currentStatus = isOverdue ? 'overdue' : status;
  const cfg = STATUS_CONFIG[currentStatus] || { label: currentStatus, color: 'var(--text-3)', bg: 'var(--bg-elevated)' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '0.3px',
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border || 'transparent'}`,
      boxShadow: currentStatus === 'overdue' ? '0 0 10px rgba(248, 113, 113, 0.2)' : 'none'
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: cfg.color,
        boxShadow: `0 0 6px ${cfg.color}`
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
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      style={{
        borderBottom: '1px solid var(--border)',
        transition: 'background 150ms'
      }}
    >
      {/* Tx Hash */}
      <td>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11.5,
          color: 'var(--text-3)',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid var(--border)'
        }}>
          <Hash size={11} color="var(--text-4)" />
          {tx.id?.slice(0, 8)}
        </div>
      </td>

      {/* Book details */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 38,
            borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={15} color="var(--accent-bright)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>
              {tx.book_title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace' }}>
              {tx.book_id}
            </div>
          </div>
        </div>
      </td>

      {/* Borrower */}
      <td>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
            {tx.borrower_name}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
              {tx.borrower_reg}
            </span>
            {tx.borrower_dept && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-3)'
              }}>
                {tx.borrower_dept}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Issue Date */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-2)' }}>
          <Calendar size={13} color="var(--text-4)" />
          {new Date(tx.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </td>

      {/* Due Date */}
      <td>
        <div>
          <div style={{
            fontSize: 12.5,
            color: isOverdue ? 'var(--danger)' : 'var(--text-2)',
            fontWeight: isOverdue ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <Clock size={13} color={isOverdue ? 'var(--danger)' : 'var(--text-4)'} />
            {new Date(tx.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          {isOverdue && (
            <div style={{
              fontSize: 11,
              color: 'var(--danger)',
              fontWeight: 700,
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}>
              <AlertTriangle size={11} /> {overdueDays}d overdue
            </div>
          )}
        </div>
      </td>

      {/* Status */}
      <td>
        <StatusPill status={tx.status} isOverdue={isOverdue} />
      </td>

      {/* Penalty Fine */}
      {isLibrarian && (
        <td>
          {fine > 0 ? (
            <span style={{
              color: 'var(--danger)',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              background: 'rgba(248, 113, 113, 0.1)',
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid rgba(248, 113, 113, 0.25)'
            }}>
              ₹{fine}
            </span>
          ) : (
            <span style={{ color: 'var(--text-4)', fontSize: 13 }}>₹0</span>
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
  const [overviewStats, setOverviewStats] = useState({ issued: 0, overdue: 0 });
  const LIMIT = 15;

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

  const handleExportExcel = () => {
    playClick();
    exportData.excel({ status });
    toast.success('Excel workbook exported');
  };

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Cinematic Header */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowLeftRight size={20} color="var(--accent-bright)" />
            </div>
            <h1 className="page-title" style={{ margin: 0 }}>Circulation Ledger</h1>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {isLibrarian 
              ? 'Real-time auditable stream of all book loans, returns, and penalty calculations' 
              : `Viewing personal borrowing ledger for registration #${user?.reg_number || 'N/A'}`}
          </p>
        </div>

        {/* Action Buttons */}
        {isLibrarian && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExportCsv}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExportExcel}
              style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <FileSpreadsheet size={14} color="var(--accent-bright)" /> Export Excel (.xlsx)
            </button>
          </div>
        )}
      </div>

      {/* Mini Telemetry Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 20
      }}>
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border)'
          }}>
            <Hash size={18} color="var(--text-2)" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ledger Volume
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
              {total}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <Clock size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Currently Issued
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>
              {overviewStats.issued}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(248, 113, 113, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(248, 113, 113, 0.25)'
          }}>
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overdue Accounts
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171' }}>
              {overviewStats.overdue}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Station */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div className="search-bar" style={{ flex: 1, minWidth: 260, maxWidth: 480 }}>
          <Search size={16} color="var(--text-4)" />
          <input
            placeholder="Filter by borrower name, reg #, book title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(15, 22, 35, 0.6)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid var(--border)'
        }}>
          {['all', 'issued', 'returned', 'overdue'].map(s => {
            const active = status === s;
            const labels = { all: 'All', issued: 'Issued', returned: 'Returned', overdue: 'Overdue' };
            return (
              <button
                key={s}
                onClick={() => {
                  playClick();
                  setStatus(s);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-3)',
                  transition: 'all 150ms',
                  boxShadow: active ? '0 0 12px rgba(16, 185, 129, 0.35)' : 'none'
                }}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 14 }}>
            <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }} />
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Querying circulation ledger...</div>
          </div>
        ) : txList.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid var(--border)'
            }}>
              <ArrowLeftRight size={24} color="var(--text-4)" />
            </div>
            <div className="empty-state-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
              No transactions matched
            </div>
            <div className="empty-state-desc" style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
              Try loosening your search keywords or switching the status filter tab
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 22, 35, 0.4)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Hash ID</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Book Details</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Borrower</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Issued On</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Due Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Ledger Status</th>
                  {isLibrarian && (
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Fine Assessment</th>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            background: 'rgba(15, 22, 35, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
              Showing page <strong style={{ color: 'var(--text)' }}>{page}</strong> of <strong style={{ color: 'var(--text)' }}>{totalPages}</strong> ({total} total ledger records)
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => { playClick(); setPage(p => p - 1); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { playClick(); setPage(p); }}
                    style={{ minWidth: 32, padding: '4px 10px', fontWeight: p === page ? 800 : 500 }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className="btn btn-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => { playClick(); setPage(p => p + 1); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
