import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Zap, 
  FileSpreadsheet, 
  BookOpen, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Trash2, 
  ArrowUpRight, 
  RotateCcw, 
  FileText, 
  Layers, 
  Check, 
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { books as booksApi, transactions as txApi, stats as statsApi, exportData } from '../api';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

function OverdueManagement() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const data = await statsApi.get();
      setOverdue(data.overdue_books || []);
    } catch (err) {
      toast.error('Failed to load overdue radar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverdue(); }, []);

  const handleReturn = async (txId, waive = false) => {
    try {
      const res = await txApi.return({ transaction_id: txId, waive_fine: waive });
      playSuccessChime();
      toast.success(res.message);
      fetchOverdue();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 14 }}>
      <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }} />
      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Auditing circulation ledger...</div>
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: 28, padding: 0, overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(248, 113, 113, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <span>Active Overdue Audit</span>
          {overdue.length > 0 && (
            <span style={{
              background: 'rgba(248, 113, 113, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 999,
              padding: '2px 8px',
              fontSize: 12,
              fontWeight: 700
            }}>
              {overdue.length} flagged
            </span>
          )}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { playClick(); fetchOverdue(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} /> Refresh Audit
        </button>
      </div>

      {overdue.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={28} color="var(--accent-bright)" />
          </div>
          <div className="empty-state-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
            Zero Overdue Loans Detected
          </div>
          <div className="empty-state-desc" style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            All circulating books are within active loan periods or have been returned. Institutional fine ledger is clear.
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 22, 35, 0.4)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Book</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Borrower</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Due Date</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Overdue Time</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Fine Assessment</th>
                <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((item, i) => {
                const days = item.overdue_days || 0;
                const fine = days * 5;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{item.book_id}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.borrower_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{item.borrower_reg}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--danger)', fontWeight: 600, fontSize: 13 }}>
                      {new Date(item.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: 'rgba(248, 113, 113, 0.12)',
                        color: '#f87171',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {days} day{days !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: 'var(--danger)', fontSize: 15 }}>₹{fine}</span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReturn(item.transaction_id, false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px' }}
                        >
                          <CheckCircle2 size={13} /> Collect & Return
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleReturn(item.transaction_id, true)}
                          style={{ color: 'var(--text-3)', fontSize: 12 }}
                        >
                          Waive
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuickIssueReturn() {
  const [bookId, setBookId] = useState('');
  const [form, setForm] = useState({ borrower_name: '', borrower_reg: '', borrower_dept: 'CSE', loan_days: 14 });
  const [mode, setMode] = useState('issue');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);

  const DEPTS = ['CSE','ECE','EEE','ME','CE','IT','BBA','MBA','MBA Tech','Physics','Chemistry','Other'];

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!bookId.trim()) { toast.error('Enter a Book ID'); return; }
    setLoading(true);
    try {
      const res = await txApi.issue({ book_id: bookId.trim().toUpperCase(), ...form });
      playSuccessChime();
      toast.success(res.message || 'Book issued successfully!');
      setBookId(''); 
      setForm({ borrower_name: '', borrower_reg: '', borrower_dept: 'CSE', loan_days: 14 });
    } catch (err) { 
      toast.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!txId.trim()) { toast.error('Enter a Transaction ID'); return; }
    setLoading(true);
    try {
      const res = await txApi.return({ transaction_id: txId.trim(), waive_fine: false });
      playSuccessChime();
      toast.success(res.message || 'Book returned successfully!');
      setTxId('');
    } catch (err) { 
      toast.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      <div className="card-header" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(234, 179, 8, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} color="#eab308" />
          </div>
          <span>Rapid Desk Operations</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['issue','return'].map(m => (
            <button 
              key={m} 
              onClick={() => { playClick(); setMode(m); }}
              style={{
                padding: '6px 16px', 
                borderRadius: 8, 
                fontSize: 12.5, 
                fontWeight: 700,
                cursor: 'pointer', 
                border: 'none',
                background: mode === m ? (m === 'issue' ? 'var(--accent)' : 'var(--cyan)') : 'var(--bg-elevated)',
                color: mode === m ? 'white' : 'var(--text-3)',
                transition: 'all 200ms',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {m === 'issue' ? <><ArrowUpRight size={14} /> Rapid Issue</> : <><RotateCcw size={14} /> Rapid Return</>}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <AnimatePresence mode="wait">
          {mode === 'issue' ? (
            <motion.form 
              key="issue" 
              initial={{ opacity: 0, x: 8 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -8 }}
              onSubmit={handleIssue} 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}
            >
              <div className="input-group" style={{ gridColumn: '1/-1' }}>
                <label className="input-label">Book Identification Number (ID) *</label>
                <input 
                  className="input" 
                  required 
                  placeholder="e.g. BK001" 
                  value={bookId}
                  onChange={e => setBookId(e.target.value.toUpperCase())}
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Borrower Full Name *</label>
                <input 
                  className="input" 
                  required 
                  placeholder="e.g. Sautrik Roy" 
                  value={form.borrower_name}
                  onChange={e => setForm(p => ({ ...p, borrower_name: e.target.value }))} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Registration / Roll # *</label>
                <input 
                  className="input" 
                  required 
                  placeholder="RA2311..." 
                  value={form.borrower_reg}
                  onChange={e => setForm(p => ({ ...p, borrower_reg: e.target.value }))} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Academic Department</label>
                <select 
                  className="input" 
                  value={form.borrower_dept}
                  onChange={e => setForm(p => ({ ...p, borrower_dept: e.target.value }))}
                >
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Loan Duration (Days)</label>
                <input 
                  className="input" 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={form.loan_days}
                  onChange={e => setForm(p => ({ ...p, loan_days: parseInt(e.target.value)||14 }))} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1/-1', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }} disabled={loading}>
                  {loading ? <><div className="spinner" /> Issuing Book...</> : <><ArrowUpRight size={16} /> Execute Book Checkout</>}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="return" 
              initial={{ opacity: 0, x: 8 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -8 }}
              onSubmit={handleReturn} 
              style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}
            >
              <div className="input-group" style={{ flex: 1, minWidth: 280 }}>
                <label className="input-label">Transaction UUID *</label>
                <input 
                  className="input" 
                  required 
                  placeholder="Paste transaction UUID"
                  value={txId} 
                  onChange={e => setTxId(e.target.value)}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }} 
                />
              </div>
              <button type="submit" className="btn btn-cyan" disabled={loading} style={{ height: 44, padding: '0 24px' }}>
                {loading ? <><div className="spinner" /> Processing Return...</> : <><RotateCcw size={16} /> Check-In Return</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExportSection() {
  const exportCards = [
    { label: 'All Transactions (CSV)', icon: FileText, type: 'csv', params: {}, desc: 'Full transaction ledger history' },
    { label: 'Overdue Audit (CSV)', icon: AlertTriangle, type: 'csv', params: { status: 'overdue' }, desc: 'List of all delinquent accounts and fines' },
    { label: 'Active Loans (Excel)', icon: FileSpreadsheet, type: 'excel', params: { status: 'issued' }, desc: 'Currently checked out books & due dates' },
    { label: 'Complete Ledger (Excel)', icon: Layers, type: 'excel', params: {}, desc: 'Formatted multi-sheet institutional ledger' },
  ];

  const handleExport = (item) => {
    playClick();
    if (item.type === 'csv') {
      exportData.csv(item.params);
    } else {
      exportData.excel(item.params);
    }
    toast.success(`Exporting ${item.label}`);
  };

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      <div className="card-header" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Download size={18} color="#38bdf8" />
          </div>
          <span>Institutional Reporting & Exports</span>
        </div>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {exportCards.map(item => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleExport(item)}
                style={{
                  background: 'rgba(15, 22, 35, 0.6)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '20px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  textAlign: 'left',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.borderColor = 'var(--accent)'; 
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.borderColor = 'var(--border)'; 
                  e.currentTarget.style.background = 'rgba(15, 22, 35, 0.6)'; 
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)'
                }}>
                  <Icon size={20} color="var(--accent-bright)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
                <div style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  letterSpacing: '0.6px', 
                  color: 'var(--accent-bright)', 
                  textTransform: 'uppercase',
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Download size={12} /> Download {item.type.toUpperCase()}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BooksManagement() {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksApi.list({ limit: 100 })
      .then(d => setAllBooks(d.books || []))
      .catch(() => toast.error('Failed to load catalog inventory'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (book) => {
    if (!confirm(`Delete "${book.title}"? All transaction history for this book will be removed.`)) return;
    try {
      await booksApi.delete(book.id);
      toast.success('Book removed from database');
      setAllBooks(prev => prev.filter(b => b.id !== book.id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={18} color="var(--accent-bright)" />
          </div>
          <span>Inventory Master Table</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
          {allBooks.length} cataloged titles
        </span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 14 }}>
          <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }} />
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading inventory...</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 22, 35, 0.4)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Book ID</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Title & Author</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Category</th>
                <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Total</th>
                <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Available</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Shelf Coordinates</th>
                <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allBooks.map((book, i) => (
                <motion.tr 
                  key={book.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-3)' }}>{book.id}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{book.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{book.author}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11.5, padding: '3px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      {book.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 600 }}>{book.total_copies}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {book.available_copies}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {book.shelf_location || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(book)}
                      style={{ padding: '6px 10px', borderRadius: 6 }}
                      title="Delete title"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('overdue');

  const SECTIONS = [
    { id: 'overdue', label: 'Overdue Audit', icon: AlertTriangle, desc: 'Manage overdue books & collect fines' },
    { id: 'quick', label: 'Quick Operations', icon: Zap, desc: 'Issue or return books by ID' },
    { id: 'export', label: 'Data Exporter', icon: FileSpreadsheet, desc: 'Download reports as CSV or Excel' },
    { id: 'books', label: 'Inventory DB', icon: BookOpen, desc: 'Full books database overview' },
  ];

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
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
            <ShieldCheck size={22} color="var(--accent-bright)" />
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>Administrative Control Hub</h1>
        </div>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Central management station for circulation, fines, inventory and institutional reporting
        </p>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { playClick(); setActiveSection(s.id); }}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--r-md)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
                color: isActive ? '#ffffff' : 'var(--text-3)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                transition: 'all 200ms',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--accent-bright)' : 'currentColor'} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === 'overdue' && <OverdueManagement />}
          {activeSection === 'quick' && <QuickIssueReturn />}
          {activeSection === 'export' && <ExportSection />}
          {activeSection === 'books' && <BooksManagement />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
