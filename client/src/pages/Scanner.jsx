import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  QrCode, 
  BookOpen, 
  Keyboard, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Download,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { transactions as txApi, books as booksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playScanBeep, playSuccessChime, playErrorBeep, playReturnChime, playClick } from '../utils/audio';

function IssueModal({ book, activeLoans, onClose, onIssueSuccess, onReturnSuccess }) {
  const [mode, setMode] = useState(activeLoans.length === 0 ? 'issue' : 'return');
  const [form, setForm] = useState({ borrower_name: 'Sautrik Roy', borrower_reg: 'RA2511003010052', borrower_dept: 'CSE', loan_days: 14 });
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(activeLoans[0]?.id || null);

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await txApi.issue({ book_id: book.id, ...form });
      playSuccessChime();
      toast.success(result.message || 'Book issued successfully');
      onIssueSuccess?.();
      onClose();
    } catch (err) {
      playErrorBeep();
      toast.error(err.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      const result = await txApi.return({ transaction_id: selectedLoan });
      playReturnChime();
      toast.success(result.message || 'Book returned successfully');
      onReturnSuccess?.();
      onClose();
    } catch (err) {
      playErrorBeep();
      toast.error(err.message || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{book.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{book.author} · ID: {book.id}</div>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8', fontSize: 18, cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', padding: '16px 24px 0', gap: 10 }}>
          <button
            onClick={() => { playClick(); setMode('issue'); }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              background: mode === 'issue' ? '#111827' : '#f1f5f9',
              color: mode === 'issue' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Issue to Student
          </button>
          <button
            onClick={() => { playClick(); setMode('return'); }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              background: mode === 'return' ? '#111827' : '#f1f5f9',
              color: mode === 'return' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Check-In Return
          </button>
        </div>

        {/* Form Body */}
        {mode === 'issue' ? (
          <form onSubmit={handleIssue} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Borrower Name</label>
              <input
                type="text"
                value={form.borrower_name}
                onChange={e => setForm({ ...form, borrower_name: e.target.value })}
                placeholder="e.g. Sautrik Roy"
                required
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: '#0f172a',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Reg Number</label>
                <input
                  type="text"
                  value={form.borrower_reg}
                  onChange={e => setForm({ ...form, borrower_reg: e.target.value })}
                  placeholder="RA2511003010052"
                  required
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: 13,
                    textTransform: 'uppercase',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Department</label>
                <select
                  value={form.borrower_dept}
                  onChange={e => setForm({ ...form, borrower_dept: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: 13,
                    outline: 'none'
                  }}
                >
                  {['CSE', 'ECE', 'IT', 'EEE', 'ME', 'AI & DS', 'Other'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                padding: '12px 0',
                borderRadius: 8,
                background: '#111827',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Confirm Loan Issue'}
            </button>
          </form>
        ) : (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeLoans.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: '20px 0' }}>
                Zero active loans recorded for this volume. All copies in stock!
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Select Active Loan Record</label>
                {activeLoans.map(loan => (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoan(loan.id)}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: selectedLoan === loan.id ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${selectedLoan === loan.id ? '#16a34a' : '#e2e8f0'}`,
                      marginBottom: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{loan.borrower_name} ({loan.borrower_reg})</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Due: {loan.due_date?.split('T')[0]}</div>
                  </div>
                ))}

                <button
                  onClick={handleReturn}
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: 10,
                    padding: '12px 0',
                    borderRadius: 8,
                    background: '#111827',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Processing...' : 'Confirm Check-In Return'}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Student Digital Pass View ──
function StudentPassView() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [turnstilePassed, setTurnstilePassed] = useState(false);

  const studentName = user?.name || 'Sautrik Roy';
  const studentReg = user?.reg_number || 'RA2511003010052';
  const studentDept = user?.department || 'Computer Science & Engineering';
  const passPayload = `LIBRAX:PASS:${studentReg}:${studentName.replace(/\s+/g, '_')}:${studentDept}:VALID_2027`;

  const handleCopyPayload = () => {
    playClick();
    navigator.clipboard?.writeText(passPayload);
    setCopied(true);
    toast.success('Digital Pass token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateTurnstile = () => {
    playScanBeep();
    setTimeout(() => {
      playSuccessChime();
      setTurnstilePassed(true);
      toast.success(`Turnstile Authorized: Welcome, ${studentName}! Access Granted.`);
      setTimeout(() => setTurnstilePassed(false), 4000);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AnimatePresence>
        {turnstilePassed && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: 12,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 24,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}
          >
            <CheckCircle2 size={22} color="#059669" />
            <div>
              <div style={{ fontWeight: 800, color: '#065f46', fontSize: 14 }}>
                TURNSTILE PASS VERIFIED
              </div>
              <div style={{ fontSize: 12, color: '#047857' }}>
                SRM IST Central Library Gate B · RFID / QR Reader Check-in Successful
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Physical Smart Card Representation */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: '28px 26px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                SRM IST CENTRAL LIBRARY
              </div>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                LibraX Digital Scholar Pass
              </div>
            </div>
          </div>

          <div style={{
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700
          }}>
            Active Member
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 20,
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 18px',
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Student Scholar</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2, marginBottom: 8 }}>
              {studentName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
              <div><span style={{ color: '#64748b' }}>Reg No: </span><span style={{ fontWeight: 700, color: '#0f172a' }}>{studentReg}</span></div>
              <div><span style={{ color: '#64748b' }}>Dept: </span><span style={{ fontWeight: 600, color: '#334155' }}>{studentDept}</span></div>
              <div><span style={{ color: '#64748b' }}>Quota: </span><span style={{ fontWeight: 600, color: '#2563eb' }}>3 of 4 Books Borrowed</span></div>
              <div><span style={{ color: '#64748b' }}>Valid Till: </span><span style={{ color: '#64748b' }}>June 2027</span></div>
            </div>
          </div>

          {/* QR Box */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 8,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <svg viewBox="0 0 110 110" width="120" height="120">
              <rect x="5" y="5" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="10" y="10" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="14" y="14" width="10" height="10" rx="1" fill="#0f172a" />
              <rect x="77" y="5" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="82" y="10" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="86" y="14" width="10" height="10" rx="1" fill="#0f172a" />
              <rect x="5" y="77" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="10" y="82" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="14" y="86" width="10" height="10" rx="1" fill="#0f172a" />
              <rect x="42" y="10" width="8" height="8" fill="#0f172a" />
              <rect x="55" y="10" width="8" height="8" fill="#0f172a" />
              <rect x="42" y="24" width="8" height="8" fill="#0f172a" />
              <rect x="60" y="24" width="8" height="8" fill="#0f172a" />
              <rect x="10" y="42" width="8" height="8" fill="#0f172a" />
              <rect x="24" y="42" width="8" height="8" fill="#0f172a" />
              <rect x="77" y="42" width="8" height="8" fill="#0f172a" />
              <rect x="42" y="42" width="26" height="26" rx="4" fill="#0f172a" />
              <text x="55" y="58" fontSize="9" fontWeight="900" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif">LX</text>
              <rect x="10" y="60" width="8" height="8" fill="#0f172a" />
              <rect x="77" y="60" width="8" height="8" fill="#0f172a" />
              <rect x="42" y="77" width="8" height="8" fill="#0f172a" />
              <rect x="55" y="77" width="8" height="8" fill="#0f172a" />
              <rect x="42" y="92" width="8" height="8" fill="#0f172a" />
              <rect x="60" y="92" width="8" height="8" fill="#0f172a" />
            </svg>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', marginTop: 3 }}>SCAN AT KIOSK</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSimulateTurnstile}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#111827',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Zap size={14} /> Simulate Scan
          </button>
          <button
            onClick={handleCopyPayload}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />} Copy Token
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Recent Scans Mock Data matching Panel 6 ──
const INITIAL_RECENT_SCANS = [
  { id: '1', title: 'Introduction to Algorithms', type: 'book', sub: 'BK001 · Cormen et al.', time: '2 mins ago', status: 'Issued', statusColor: '#f59e0b', statusBg: '#fef3c7' },
  { id: '2', title: 'Rahul Verma', type: 'student', sub: 'RA2111003010124 · CSE', time: '14 mins ago', status: 'Valid', statusColor: '#10b981', statusBg: '#ecfdf5' },
  { id: '3', title: 'Clean Code', type: 'book', sub: 'BK002 · Robert C. Martin', time: '32 mins ago', status: 'Returned', statusColor: '#3b82f6', statusBg: '#eff6ff' },
  { id: '4', title: 'Operating System Concepts', type: 'book', sub: 'BK006 · Silberschatz', time: '1 hour ago', status: 'Available', statusColor: '#10b981', statusBg: '#ecfdf5' },
  { id: '5', title: 'Priya Sharma', type: 'student', sub: 'RA2211003010452 · IT', time: '2 hours ago', status: 'Valid', statusColor: '#10b981', statusBg: '#ecfdf5' },
];

export default function Scanner() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'pass'
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [scannedBook, setScannedBook] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const [recentScans, setRecentScans] = useState(INITIAL_RECENT_SCANS);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    playClick();
    setCameraActive(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      toast.info('Camera unavailable. Use manual ID entry or quick simulation buttons below.');
      setCameraActive(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScanSuccess = async (rawId) => {
    playScanBeep();
    stopScanner();
    const cleanId = rawId.trim().toUpperCase();

    try {
      const rawBooks = await booksApi.getAll();
      const allBooks = Array.isArray(rawBooks) ? rawBooks : (rawBooks?.books || []);
      const matched = allBooks.find(b => b.id.toUpperCase() === cleanId || b.isbn === cleanId || b.title.toLowerCase().includes(cleanId.toLowerCase()));

      if (matched) {
        playSuccessChime();
        toast.success(`Identified: ${matched.title}`);
        
        // Add to recent scans list
        setRecentScans(prev => [
          {
            id: Date.now().toString(),
            title: matched.title,
            type: 'book',
            sub: `${matched.id} · ${matched.author}`,
            time: 'Just now',
            status: matched.available_copies > 0 ? 'Available' : 'Issued',
            statusColor: matched.available_copies > 0 ? '#10b981' : '#f59e0b',
            statusBg: matched.available_copies > 0 ? '#ecfdf5' : '#fef3c7'
          },
          ...prev.slice(0, 5)
        ]);

        const rawTxs = await txApi.getAll();
        const txs = Array.isArray(rawTxs) ? rawTxs : (rawTxs?.transactions || []);
        const bookLoans = txs.filter(t => t.book_id === matched.id && t.status === 'issued');
        setActiveLoans(bookLoans);
        setScannedBook(matched);
      } else {
        playErrorBeep();
        toast.error(`No record found for ID: ${cleanId}`);
      }
    } catch (err) {
      playErrorBeep();
      toast.error('Failed to lookup book record');
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualInput.trim()) return;
    setShowManualModal(false);
    handleScanSuccess(manualInput.trim());
    setManualInput('');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* ── Title matching Panel 6 ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color: '#0f172a',
          marginBottom: 4,
          letterSpacing: '-0.5px'
        }}>
          QR / Barcode Scanner
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Scan a book or student ID to quickly perform transactions
        </p>
      </div>

      {/* ── Tab Switcher: Scanner vs Digital Pass ── */}
      <div style={{ display: 'flex', marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          background: '#e2e8f0',
          padding: 3,
          borderRadius: 10
        }}>
          <button
            onClick={() => { playClick(); setActiveTab('scanner'); }}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === 'scanner' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'scanner' ? '#ffffff' : 'transparent',
              color: activeTab === 'scanner' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'scanner' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Camera size={15} /> Book Scanner
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('pass'); }}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === 'pass' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'pass' ? '#ffffff' : 'transparent',
              color: activeTab === 'pass' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'pass' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <QrCode size={15} /> My Student Pass
          </button>
        </div>
      </div>

      {activeTab === 'pass' ? (
        <StudentPassView />
      ) : (
        /* ── 2-Column Grid Layout matching Screen 6 Mockup ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'start'
        }}>
          {/* Left Column: Viewfinder Container */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '36px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {/* Dark Viewfinder Screen with Illuminated Corner Reticles */}
            <div style={{
              width: 280,
              height: 280,
              borderRadius: 16,
              background: '#0f172a',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: 24
            }}>
              {/* Corner Reticles */}
              <div style={{ position: 'absolute', top: 16, left: 16, width: 28, height: 28, borderTop: '3px solid #10b981', borderLeft: '3px solid #10b981', borderRadius: '4px 0 0 0' }} />
              <div style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderTop: '3px solid #10b981', borderRight: '3px solid #10b981', borderRadius: '0 4px 0 0' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16, width: 28, height: 28, borderBottom: '3px solid #10b981', borderLeft: '3px solid #10b981', borderRadius: '0 0 0 4px' }} />
              <div style={{ position: 'absolute', bottom: 16, right: 16, width: 28, height: 28, borderBottom: '3px solid #10b981', borderRight: '3px solid #10b981', borderRadius: '0 0 4px 0' }} />

              {/* Camera Stream target */}
              <div id="qr-reader" style={{ width: '100%', height: '100%', display: cameraActive ? 'block' : 'none' }} />

              {/* Fallback Viewfinder Graphic */}
              {!cameraActive && (
                <>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    marginBottom: 14
                  }}>
                    <QrCode size={40} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', textAlign: 'center' }}>
                    Position code in frame
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                    Auto-detection active
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons Row matching Screen 6 */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                onClick={cameraActive ? stopScanner : startScanner}
                style={{
                  padding: '11px 22px',
                  borderRadius: 10,
                  background: '#0f172a',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'opacity 150ms'
                }}
              >
                <Camera size={16} />
                <span>{cameraActive ? 'Stop Camera' : 'Use Camera'}</span>
              </button>

              <button
                onClick={() => { playClick(); setShowManualModal(true); }}
                style={{
                  padding: '11px 20px',
                  borderRadius: 10,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Keyboard size={16} color="#64748b" />
                <span>Enter ID Manually</span>
              </button>
            </div>

            {/* Quick Test Simulator Chips */}
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
                Quick Test Triggers
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { id: 'BK002', label: 'Clean Code' },
                  { id: 'BK006', label: 'OS Concepts' },
                  { id: 'BK001', label: 'Algorithms' },
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleScanSuccess(b.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {b.label} ({b.id})
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#64748b',
              background: '#f8fafc',
              padding: '4px 14px',
              borderRadius: 999,
              border: '1px solid #e2e8f0'
            }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Supports QR codes and barcodes</span>
            </div>
          </div>

          {/* Right Column: Recent Scans Card matching Screen 6 */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Scans</h2>
              <button
                onClick={() => toast.info('Displaying latest 5 scanning log events')}
                style={{ fontSize: 12.5, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View All →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentScans.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: item.type === 'book' ? '#eff6ff' : '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.type === 'book' ? '#2563eb' : '#16a34a'
                    }}>
                      {item.type === 'book' ? <BookOpen size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                        {item.sub} · <span style={{ color: '#94a3b8' }}>{item.time}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: item.statusBg,
                    color: item.statusColor
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Dialog Modal */}
      {showManualModal && (
        <div className="modal-overlay" onClick={() => setShowManualModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              width: '100%',
              maxWidth: 400,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Manual Identification
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 16 }}>
              Input Book Identifier (e.g. BK002) or ISBN number:
            </p>

            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="e.g. BK002 or Clean Code"
                autoFocus
                required
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: '#0f172a',
                  fontSize: 13,
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: '#111827',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Identify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanned Book Modal */}
      {scannedBook && (
        <IssueModal
          book={scannedBook}
          activeLoans={activeLoans}
          onClose={() => setScannedBook(null)}
          onIssueSuccess={() => {}}
          onReturnSuccess={() => {}}
        />
      )}
    </div>
  );
}
