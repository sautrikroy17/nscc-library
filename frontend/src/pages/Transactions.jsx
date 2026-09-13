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
  Clock, 
  BookOpen, 
  User, 
  ChevronLeft,
  ChevronRight,
  Hash,
  Eye,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { transactions as txApi, exportData, stats as statsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

const DEMO_TRANSACTIONS = [
  {
    id: 'TX-984210',
    student: 'Sautrik Roy',
    roll: 'RA2511003010052',
    book: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    isbn: '978-0132350884',
    type: 'Issue',
    issueDate: '13 Sep 2025',
    dueDate: '27 Sep 2025',
    returnDate: '-',
    status: 'Active',
    fine: '₹0'
  },
  {
    id: 'TX-984209',
    student: 'Ananya Sharma',
    roll: 'RA2511003010245',
    book: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    isbn: '978-0201633610',
    type: 'Issue',
    issueDate: '12 Sep 2025',
    dueDate: '26 Sep 2025',
    returnDate: '-',
    status: 'Active',
    fine: '₹0'
  },
  {
    id: 'TX-984208',
    student: 'Vikram Kumar',
    roll: 'RA2511003010333',
    book: 'Operating System Concepts (10th Edition)',
    isbn: '978-1119456339',
    type: 'Return',
    issueDate: '25 Aug 2025',
    dueDate: '08 Sep 2025',
    returnDate: '12 Sep 2025',
    status: 'Returned',
    fine: '₹0'
  },
  {
    id: 'TX-984207',
    student: 'Sneha Patil',
    roll: 'RA2511003010098',
    book: 'Database System Concepts (7th Edition)',
    isbn: '978-0078022159',
    type: 'Renew',
    issueDate: '28 Aug 2025',
    dueDate: '25 Sep 2025',
    returnDate: '-',
    status: 'Active',
    fine: '₹0'
  },
  {
    id: 'TX-984206',
    student: 'Rohan Verma',
    roll: 'RA2511003010111',
    book: 'Machine Learning: A Probabilistic Perspective',
    isbn: '978-0262018029',
    type: 'Issue',
    issueDate: '18 Aug 2025',
    dueDate: '01 Sep 2025',
    returnDate: '-',
    status: 'Overdue',
    fine: '₹60'
  },
  {
    id: 'TX-984205',
    student: 'Karthik Raja',
    roll: 'RA2511003010178',
    book: 'Introduction to Algorithms (CLRS)',
    isbn: '978-0262033848',
    type: 'Return',
    issueDate: '20 Aug 2025',
    dueDate: '03 Sep 2025',
    returnDate: '02 Sep 2025',
    status: 'Returned',
    fine: '₹0'
  },
  {
    id: 'TX-984204',
    student: 'Isha Gupta',
    roll: 'RA2511003010444',
    book: 'Modern Web Development with React & Next.js',
    isbn: '978-1492053743',
    type: 'Issue',
    issueDate: '23 Aug 2025',
    dueDate: '06 Sep 2025',
    returnDate: '-',
    status: 'Overdue',
    fine: '₹35'
  },
  {
    id: 'TX-984203',
    student: 'Aditya Rao',
    roll: 'RA2511003010555',
    book: 'Discrete Mathematics and Its Applications',
    isbn: '978-1259676512',
    type: 'Issue',
    issueDate: '25 Aug 2025',
    dueDate: '08 Sep 2025',
    returnDate: '-',
    status: 'Overdue',
    fine: '₹25'
  }
];

export default function Transactions({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian';

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterDate, setFilterDate] = useState('All Time');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [page, setPage] = useState(1);
  const [viewTx, setViewTx] = useState(null);

  const filtered = DEMO_TRANSACTIONS.filter(tx => {
    if (filterType !== 'All Types' && tx.type !== filterType) return false;
    if (filterStatus !== 'All Status' && tx.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return tx.student.toLowerCase().includes(q) ||
             tx.roll.toLowerCase().includes(q) ||
             tx.book.toLowerCase().includes(q) ||
             tx.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCsv = () => {
    playClick();
    const csvContent = [
      ['Book Title', 'Author', 'Book ID', 'Issued To (User ID/Name)', 'Issue Timestamp', 'Return Timestamp', 'Current Status', 'Fine', 'Transaction ID'],
      ...filtered.map(t => [
        `"${(t.book || '').replace(/"/g, '""')}"`,
        `"${(t.author || 'Academic Faculty Author').replace(/"/g, '""')}"`,
        t.bookId || t.isbn || 'BK-SRM-01',
        `"${t.student} (${t.roll})"`,
        t.issueDate,
        t.returnDate !== '-' ? t.returnDate : 'Not Returned (Active Loan)',
        t.status,
        t.fine,
        t.id
      ])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srmist-transactions-ledger-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSuccessChime();
    toast.success('Transactions ledger downloaded as CSV');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
      {/* ── Top Bar matching Screen 5 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Transactions
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Complete history of all book issues, returns, and renewals across the library.
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#0f172a',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Download size={15} /> Export
        </button>
      </div>

      {/* ── Filter Bar matching Screen 5 ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          flex: 1,
          minWidth: 260
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by student name, roll no, or book title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#0f172a', width: '100%' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={e => { playClick(); setFilterType(e.target.value); }}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="All Types">All Types</option>
          <option value="Issue">Issue</option>
          <option value="Return">Return</option>
          <option value="Renew">Renew</option>
        </select>

        {/* Date Filter */}
        <select
          value={filterDate}
          onChange={e => { playClick(); setFilterDate(e.target.value); }}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="All Time">All Time</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => { playClick(); setFilterStatus(e.target.value); }}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Returned">Returned</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* ── Transactions Table matching Screen 5 ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>TRANSACTION ID</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>STUDENT</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>BOOK</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>TYPE</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>ISSUE DATE</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>DUE / RETURN DATE</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Transaction ID */}
                  <td style={{ padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                    {tx.id}
                  </td>

                  {/* Student */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{tx.student}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{tx.roll}</div>
                  </td>

                  {/* Book */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.book}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>ISBN: {tx.isbn}</div>
                  </td>

                  {/* Type Pill */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: tx.type === 'Issue' ? '#eff6ff' : tx.type === 'Return' ? '#ecfdf5' : '#f5f3ff',
                      color: tx.type === 'Issue' ? '#2563eb' : tx.type === 'Return' ? '#059669' : '#7c3aed'
                    }}>
                      {tx.type}
                    </span>
                  </td>

                  {/* Issue Date */}
                  <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5 }}>
                    {tx.issueDate}
                  </td>

                  {/* Due / Return Date */}
                  <td style={{ padding: '14px 18px', color: tx.status === 'Overdue' ? '#ef4444' : '#475569', fontSize: 12.5, fontWeight: tx.status === 'Overdue' ? 700 : 500 }}>
                    {tx.type === 'Return' ? tx.returnDate : tx.dueDate}
                  </td>

                  {/* Status Pill */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: tx.status === 'Active' ? '#fef3c7' : tx.status === 'Returned' ? '#ecfdf5' : '#fef2f2',
                      color: tx.status === 'Active' ? '#d97706' : tx.status === 'Returned' ? '#059669' : '#ef4444'
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: tx.status === 'Active' ? '#d97706' : tx.status === 'Returned' ? '#059669' : '#ef4444'
                      }} />
                      {tx.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => { playClick(); setViewTx(tx); }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#0f172a',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination matching Screen 5 ── */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            Showing 1 to {filtered.length} of 1,284 transactions
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => { playClick(); if (page > 1) setPage(p => p - 1); }}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Previous
            </button>
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => { playClick(); setPage(n); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: page === n ? 'none' : '1px solid #e2e8f0',
                  background: page === n ? '#0f172a' : '#ffffff',
                  color: page === n ? '#ffffff' : '#475569',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {n}
              </button>
            ))}
            <span style={{ color: '#94a3b8', fontSize: 12 }}>...</span>
            <button
              onClick={() => { playClick(); setPage(160); }}
              style={{ width: 32, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              160
            </button>
            <button
              onClick={() => { playClick(); setPage(p => p + 1); }}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── View Transaction Modal ── */}
      {viewTx && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20
        }} onClick={() => setViewTx(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 28,
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Transaction Receipt
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{viewTx.id}</div>
              </div>
              <button
                onClick={() => setViewTx(null)}
                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>STUDENT</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{viewTx.student} ({viewTx.roll})</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>BOOK TITLE</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{viewTx.book}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8' }}>ISBN: {viewTx.isbn}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TRANSACTION TYPE</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{viewTx.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>STATUS</div>
                  <div style={{ fontWeight: 700, color: viewTx.status === 'Overdue' ? '#ef4444' : '#16a34a', marginTop: 2 }}>
                    {viewTx.status}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ISSUE DATE</div>
                  <div style={{ color: '#334155', marginTop: 2 }}>{viewTx.issueDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>DUE DATE</div>
                  <div style={{ color: '#334155', marginTop: 2 }}>{viewTx.dueDate}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ACCRUED PENALTY / FINE</div>
                <div style={{ fontWeight: 800, color: viewTx.fine === '₹0' ? '#16a34a' : '#dc2626', marginTop: 2 }}>
                  {viewTx.fine}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playSuccessChime();
                toast.success(`Transaction receipt #${viewTx.id} downloaded`);
                setViewTx(null);
              }}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '10px 0',
                borderRadius: 8,
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Download PDF Slip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
