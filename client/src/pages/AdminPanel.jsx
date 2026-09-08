import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, FileSpreadsheet, BookOpen, ShieldCheck } from 'lucide-react';
import { books as booksApi, transactions as txApi, stats as statsApi, exportData } from '../api';
import { toast } from '../context/ToastContext';
import { playClick } from '../utils/audio';

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </h2>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{subtitle}</p>}
    </div>
  );
}

function OverdueManagement() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const data = await statsApi.get();
      setOverdue(data.overdue_books || []);
    } catch (err) {
      toast.error('Failed to load overdue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverdue(); }, []);

  const handleReturn = async (txId, waive = false) => {
    try {
      const res = await txApi.return({ transaction_id: txId, waive_fine: waive });
      toast.success(res.message);
      fetchOverdue();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      <div className="card-header">
        <div className="card-title">
          <span className="overdue-blink">⚠️</span> Overdue Management
          {overdue.length > 0 && <span className="nav-badge warning">{overdue.length}</span>}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchOverdue}>🔄 Refresh</button>
      </div>
      {overdue.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: 48 }}>🎉</span>
          <div className="empty-state-title">No overdue books!</div>
          <div className="empty-state-desc">All books returned on time. Excellent!</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Fine (₹)</th>
                <th>Actions</th>
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
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>{item.book_id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.borrower_name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{item.borrower_reg}</div>
                    </td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      {new Date(item.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      <span className="badge badge-danger overdue-blink">{days} day{days !== 1 ? 's' : ''}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--danger)', fontSize: 15 }}>₹{fine}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReturn(item.transaction_id, false)}
                        >
                          ✅ Collect & Return
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleReturn(item.transaction_id, true)}
                          style={{ color: 'var(--text-3)', fontSize: 11.5 }}
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

  const DEPTS = ['CSE','ECE','EEE','ME','CE','IT','BBA','MBA','MBA Tech','Other'];

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!bookId.trim()) { toast.error('Enter a Book ID'); return; }
    setLoading(true);
    try {
      const res = await txApi.issue({ book_id: bookId.trim().toUpperCase(), ...form });
      toast.success(res.message || 'Book issued successfully!');
      setBookId(''); setForm({ borrower_name: '', borrower_reg: '', borrower_dept: 'CSE', loan_days: 14 });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!txId.trim()) { toast.error('Enter a Transaction ID'); return; }
    setLoading(true);
    try {
      const res = await txApi.return({ transaction_id: txId.trim(), waive_fine: false });
      toast.success(res.message || 'Book returned successfully!');
      setTxId('');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      <div className="card-header">
        <div className="card-title">⚡ Quick Issue / Return</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['issue','return'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: mode === m ? (m === 'issue' ? 'var(--accent)' : 'var(--cyan)') : 'var(--bg-elevated)',
                color: mode === m ? 'white' : 'var(--text-3)',
                transition: 'all 200ms',
              }}
            >
              {m === 'issue' ? '📤 Issue' : '↩️ Return'}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <AnimatePresence mode="wait">
          {mode === 'issue' ? (
            <motion.form key="issue" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              onSubmit={handleIssue} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div className="input-group form-full" style={{ gridColumn: '1/-1' }}>
                <label className="input-label">Book ID *</label>
                <input className="input" required placeholder="e.g. BK001" value={bookId}
                  onChange={e => setBookId(e.target.value.toUpperCase())}
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }} />
              </div>
              <div className="input-group">
                <label className="input-label">Student Name *</label>
                <input className="input" required placeholder="Full name" value={form.borrower_name}
                  onChange={e => setForm(p => ({ ...p, borrower_name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Reg Number *</label>
                <input className="input" required placeholder="RA2311..." value={form.borrower_reg}
                  onChange={e => setForm(p => ({ ...p, borrower_reg: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Dept</label>
                <select className="input" value={form.borrower_dept}
                  onChange={e => setForm(p => ({ ...p, borrower_dept: e.target.value }))}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Loan Days</label>
                <input className="input" type="number" min="1" max="60" value={form.loan_days}
                  onChange={e => setForm(p => ({ ...p, loan_days: parseInt(e.target.value)||14 }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
                  {loading ? <><div className="spinner" /> Issuing...</> : '📤 Issue Book'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form key="return" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              onSubmit={handleReturn} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Transaction ID *</label>
                <input className="input" required placeholder="Paste transaction UUID"
                  value={txId} onChange={e => setTxId(e.target.value)}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }} />
              </div>
              <button type="submit" className="btn btn-cyan" disabled={loading}>
                {loading ? <><div className="spinner" /> Returning...</> : '↩️ Return Book'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExportSection() {
  return (
    <div className="card" style={{ marginBottom: 28 }}>
      <div className="card-header">
        <div className="card-title">📤 Data Export</div>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'All Transactions (CSV)', icon: '📋', type: 'csv', params: {} },
            { label: 'Overdue Report (CSV)', icon: '⚠️', type: 'csv', params: { status: 'overdue' } },
            { label: 'Issued Books (Excel)', icon: '📊', type: 'excel', params: { status: 'issued' } },
            { label: 'Full Report (Excel)', icon: '📑', type: 'excel', params: {} },
          ].map(item => (
            <motion.button
              key={item.label}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => item.type === 'csv' ? exportData.csv(item.params) : exportData.excel(item.params)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '18px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textAlign: 'left',
                transition: 'all 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{item.label}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{item.type.toUpperCase()} download</span>
            </motion.button>
          ))}
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
      .then(d => setAllBooks(d.books))
      .catch(() => toast.error('Failed to load books'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (book) => {
    if (!confirm(`Delete "${book.title}"? All transaction history for this book will be removed.`)) return;
    try {
      await booksApi.delete(book.id);
      toast.success('Book deleted');
      setAllBooks(prev => prev.filter(b => b.id !== book.id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">📚 All Books Overview</div>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{allBooks.length} titles</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Title</th><th>Category</th><th>Copies</th><th>Available</th><th>Shelf</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {allBooks.map((book, i) => (
                <motion.tr key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--text-3)' }}>{book.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{book.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{book.author}</div>
                  </td>
                  <td><span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--bg-elevated)', borderRadius: 20, color: 'var(--text-2)' }}>{book.category}</span></td>
                  <td style={{ textAlign: 'center' }}>{book.total_copies}</td>
                  <td>
                    <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {book.available_copies}
                    </span>
                  </td>
                  <td><span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{book.shelf_location || '—'}</span></td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(book)}
                    >🗑️</button>
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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={24} color="var(--accent)" />
          <span>Administrative Control Hub</span>
        </h1>
        <p className="page-subtitle">Central management station for circulation, fines, inventory and institutional reporting</p>
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
