import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  BookOpen, 
  ArrowUpRight, 
  RotateCcw, 
  CheckCircle2, 
  Keyboard, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Download,
  Copy,
  CreditCard,
  User,
  ShieldCheck,
  ExternalLink
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
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
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
          background: '#0d1527',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#ffffff' }}>{book.title}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{book.author} · {book.id}</div>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8', fontSize: 18, cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', padding: '16px 24px 0', gap: 10 }}>
          <button
            onClick={() => { playClick(); setMode('issue'); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              background: mode === 'issue' ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
              color: mode === 'issue' ? '#080c14' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            Issue to Student
          </button>
          <button
            onClick={() => { playClick(); setMode('return'); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              background: mode === 'return' ? '#06b6d4' : 'rgba(255, 255, 255, 0.04)',
              color: mode === 'return' ? '#080c14' : '#94a3b8',
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
              <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Borrower Name</label>
              <input
                type="text"
                value={form.borrower_name}
                onChange={e => setForm({ ...form, borrower_name: e.target.value })}
                placeholder="e.g. Sautrik Roy"
                required
                style={{
                  width: '100%',
                  background: 'rgba(8, 12, 20, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#ffffff',
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Reg Number</label>
                <input
                  type="text"
                  value={form.borrower_reg}
                  onChange={e => setForm({ ...form, borrower_reg: e.target.value })}
                  placeholder="RA2311..."
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(8, 12, 20, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: '#ffffff',
                    fontSize: 13,
                    textTransform: 'uppercase'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Department</label>
                <select
                  value={form.borrower_dept}
                  onChange={e => setForm({ ...form, borrower_dept: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(8, 12, 20, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: '#ffffff',
                    fontSize: 13
                  }}
                >
                  {['CSE', 'ECE', 'IT', 'EEE', 'ME', 'AI & DS', 'Other'].map(d => (
                    <option key={d} value={d} style={{ background: '#0e1628' }}>{d}</option>
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
                background: '#10b981',
                border: 'none',
                color: '#080c14',
                fontWeight: 800,
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
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>
                Zero active loans recorded for this volume. All copies in stock!
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Select Active Loan Record</label>
                {activeLoans.map(loan => (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoan(loan.id)}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: selectedLoan === loan.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(8, 12, 20, 0.6)',
                      border: `1px solid ${selectedLoan === loan.id ? '#06b6d4' : 'rgba(255, 255, 255, 0.06)'}`,
                      marginBottom: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 13 }}>{loan.borrower_name} ({loan.borrower_reg})</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Due: {loan.due_date?.split('T')[0]}</div>
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
                    background: '#06b6d4',
                    border: 'none',
                    color: '#080c14',
                    fontWeight: 800,
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

// ── Student Digital Pass QR Card ──
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
      {/* Turnstile Access Granted Alert Banner */}
      <AnimatePresence>
        {turnstilePassed && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              borderRadius: 14,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 24,
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080c14'
            }}>
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: 14 }}>
                TURNSTILE PASS VERIFIED
              </div>
              <div style={{ fontSize: 12, color: '#a7f3d0' }}>
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
        background: 'linear-gradient(145deg, #0d1627 0%, #152238 60%, #0d1627 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: 22,
        padding: '28px 26px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Holographic corner accent */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 15,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.3px'
              }}>
                SRM IST CENTRAL LIBRARY
              </div>
              <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                LibraX Digital Scholar Pass
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Active Member
          </div>
        </div>

        {/* Center Section: Student Profile & High-Res QR Code */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 20,
          alignItems: 'center',
          background: 'rgba(8, 12, 20, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: '20px 18px',
          marginBottom: 20
        }}>
          {/* Left Details */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Student Scholar
            </div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: '#ffffff',
              marginTop: 2,
              marginBottom: 8
            }}>
              {studentName}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div>
                <span style={{ color: '#64748b' }}>Reg No: </span>
                <span style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  {studentReg}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Dept: </span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{studentDept}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Quota: </span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>3 of 4 Books Borrowed</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Valid Till: </span>
                <span style={{ color: '#94a3b8' }}>June 2027</span>
              </div>
            </div>
          </div>

          {/* Right Sharp QR Matrix */}
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
          }}>
            <svg viewBox="0 0 110 110" width="130" height="130">
              {/* Corner Position Detection Patterns */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="#080c14" />
              <rect x="10" y="10" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="14" y="14" width="10" height="10" rx="1" fill="#080c14" />

              <rect x="77" y="5" width="28" height="28" rx="4" fill="#080c14" />
              <rect x="82" y="10" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="86" y="14" width="10" height="10" rx="1" fill="#080c14" />

              <rect x="5" y="77" width="28" height="28" rx="4" fill="#080c14" />
              <rect x="10" y="82" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="14" y="86" width="10" height="10" rx="1" fill="#080c14" />

              {/* Data Grid Simulation with Emerald NSCC Core */}
              <rect x="42" y="10" width="8" height="8" fill="#080c14" />
              <rect x="55" y="10" width="8" height="8" fill="#080c14" />
              <rect x="42" y="24" width="8" height="8" fill="#080c14" />
              <rect x="60" y="24" width="8" height="8" fill="#080c14" />
              <rect x="10" y="42" width="8" height="8" fill="#080c14" />
              <rect x="24" y="42" width="8" height="8" fill="#080c14" />
              <rect x="77" y="42" width="8" height="8" fill="#080c14" />
              <rect x="92" y="42" width="8" height="8" fill="#080c14" />

              {/* Center Holographic Core */}
              <rect x="42" y="42" width="26" height="26" rx="4" fill="#10b981" />
              <text x="55" y="58" fontSize="9" fontWeight="900" textAnchor="middle" fill="#080c14" fontFamily="sans-serif">LX</text>

              <rect x="10" y="60" width="8" height="8" fill="#080c14" />
              <rect x="24" y="60" width="8" height="8" fill="#080c14" />
              <rect x="77" y="60" width="8" height="8" fill="#080c14" />
              <rect x="92" y="60" width="8" height="8" fill="#080c14" />
              <rect x="42" y="77" width="8" height="8" fill="#080c14" />
              <rect x="55" y="77" width="8" height="8" fill="#080c14" />
              <rect x="72" y="77" width="8" height="8" fill="#080c14" />
              <rect x="42" y="92" width="8" height="8" fill="#080c14" />
              <rect x="60" y="92" width="8" height="8" fill="#080c14" />
              <rect x="80" y="92" width="8" height="8" fill="#080c14" />
            </svg>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: '#080c14', marginTop: 4, letterSpacing: '0.4px' }}>
              SCAN AT KIOSK
            </span>
          </div>
        </div>

        {/* Barcode Graphic Footer */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}>
          <div style={{ display: 'flex', gap: 2, height: 26, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {[4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: '100%',
                  background: i % 2 === 0 ? '#10b981' : 'rgba(255, 255, 255, 0.8)'
                }}
              />
            ))}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10.5,
            color: '#94a3b8',
            letterSpacing: '3px'
          }}>
            {studentReg}
          </div>
        </div>
      </div>

      {/* Interactive Actions for Student Pass */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 520
      }}>
        <button
          onClick={handleSimulateTurnstile}
          style={{
            flex: 1,
            minWidth: 160,
            padding: '12px 18px',
            borderRadius: 10,
            background: '#10b981',
            border: 'none',
            color: '#080c14',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
          }}
        >
          <Zap size={16} />
          <span>Simulate Turnstile Scan</span>
        </button>

        <button
          onClick={handleCopyPayload}
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}
        >
          {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
          <span>{copied ? 'Copied!' : 'Copy QR Token'}</span>
        </button>

        <button
          onClick={() => {
            playClick();
            toast.success('Library Pass card ready for physical wallet printing');
            window.print?.();
          }}
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}
        >
          <Download size={15} />
          <span>Save / Print</span>
        </button>
      </div>
    </div>
  );
}

export default function Scanner() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'pass'
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [scannedBook, setScannedBook] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    playClick();
    setCameraActive(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
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
        // Fetch active loans
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
    <div className="page" style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 40 }}>
      {/* ── Title & Subtitle matching Screen 6 ── */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color: '#ffffff',
          marginBottom: 6,
          letterSpacing: '-0.5px'
        }}>
          QR Scanner & Digital Passes
        </h1>
        <p style={{ fontSize: 13.5, color: '#94a3b8' }}>
          Scan books and barcodes for instant transactions, or display your student library pass
        </p>
      </div>

      {/* ── Prominent Tab Switcher (Book Scanner vs Digital Pass) ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 28
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(15, 22, 38, 0.85)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => { playClick(); setActiveTab('scanner'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === 'scanner' ? 800 : 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'scanner' ? '#10b981' : 'transparent',
              color: activeTab === 'scanner' ? '#080c14' : '#94a3b8',
              boxShadow: activeTab === 'scanner' ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 150ms'
            }}
          >
            <Camera size={16} />
            <span>Book Scanner</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('pass'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === 'pass' ? 800 : 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'pass' ? '#10b981' : 'transparent',
              color: activeTab === 'pass' ? '#080c14' : '#94a3b8',
              boxShadow: activeTab === 'pass' ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 150ms'
            }}
          >
            <QrCode size={16} />
            <span>My Digital Student Pass</span>
          </button>
        </div>
      </div>

      {activeTab === 'pass' ? (
        <StudentPassView />
      ) : (
        /* ── Viewfinder Station (Screen 6 Layout) ── */
        <div style={{
          background: 'rgba(14, 22, 38, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}>
          {/* Scanner Viewport with Glowing Corner Reticles */}
          <div style={{
            width: 260,
            height: 260,
            borderRadius: 20,
            background: '#080c14',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: 28
          }}>
            {/* Top-Left Corner Reticle */}
            <div style={{
              position: 'absolute', top: 12, left: 12, width: 24, height: 24,
              borderTop: '3px solid #10b981', borderLeft: '3px solid #10b981',
              borderRadius: '4px 0 0 0', boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
            }} />
            {/* Top-Right Corner Reticle */}
            <div style={{
              position: 'absolute', top: 12, right: 12, width: 24, height: 24,
              borderTop: '3px solid #10b981', borderRight: '3px solid #10b981',
              borderRadius: '0 4px 0 0', boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
            }} />
            {/* Bottom-Left Corner Reticle */}
            <div style={{
              position: 'absolute', bottom: 12, left: 12, width: 24, height: 24,
              borderBottom: '3px solid #10b981', borderLeft: '3px solid #10b981',
              borderRadius: '0 0 0 4px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
            }} />
            {/* Bottom-Right Corner Reticle */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12, width: 24, height: 24,
              borderBottom: '3px solid #10b981', borderRight: '3px solid #10b981',
              borderRadius: '0 0 4px 0', boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
            }} />

            {/* Camera Stream Target Container */}
            <div id="qr-reader" style={{ width: '100%', height: '100%', display: cameraActive ? 'block' : 'none' }} />

            {/* Fallback Viewfinder Graphic */}
            {!cameraActive && (
              <>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  marginBottom: 14,
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
                }}>
                  <QrCode size={36} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', textAlign: 'center', maxWidth: 180 }}>
                  Position the QR code within the frame
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                  Waiting for scan...
                </div>
              </>
            )}
          </div>

          {/* Action Buttons Row matching Screen 6 */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
            <button
              onClick={() => { playClick(); setShowManualModal(true); }}
              style={{
                padding: '12px 22px',
                borderRadius: 10,
                background: 'rgba(8, 12, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 150ms'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <Keyboard size={16} color="#10b981" />
              <span>Enter Book ID Manually</span>
            </button>

            <button
              onClick={cameraActive ? stopScanner : startScanner}
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                background: '#10b981',
                border: 'none',
                color: '#080c14',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Camera size={16} />
              <span>{cameraActive ? 'Stop Camera' : 'Use Camera'}</span>
            </button>
          </div>

          {/* Instant Testing Simulator Chips */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
              Instant Testing Triggers (Simulate QR Detection)
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { id: 'BK002', name: 'Clean Code' },
                { id: 'BK006', name: 'OS Concepts' },
                { id: 'BK007', name: 'Database Systems' },
                { id: 'BK001', name: 'Algorithms' }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => handleScanSuccess(b.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Scan {b.name} ({b.id})
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Pill matching Screen 6 */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11.5,
            color: '#94a3b8',
            background: 'rgba(8, 12, 20, 0.5)',
            padding: '4px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Supports QR codes and barcodes</span>
          </div>
        </div>
      )}

      {/* Manual Book ID Input Modal */}
      {showManualModal && (
        <div className="modal-overlay" onClick={() => setShowManualModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 400,
              padding: 24
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
              Manual Identification
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
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
                  background: 'rgba(8, 12, 20, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: 13
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
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
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
                    background: '#10b981',
                    border: 'none',
                    color: '#080c14',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanned Book Checkout / Return Modal */}
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
