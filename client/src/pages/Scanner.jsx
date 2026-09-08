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
  Check
} from 'lucide-react';
import { transactions as txApi, books as booksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playScanBeep, playSuccessChime, playErrorBeep, playReturnChime, playClick } from '../utils/audio';

function IssueModal({ book, activeLoans, onClose, onIssueSuccess, onReturnSuccess }) {
  const [mode, setMode] = useState(activeLoans.length === 0 ? 'issue' : 'return');
  const [form, setForm] = useState({ borrower_name: '', borrower_reg: '', borrower_dept: 'CSE', loan_days: 14 });
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
          <button onClick={onClose} style={{ color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
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
                placeholder="e.g. Pranav Sharma"
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

export default function Scanner() {
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
      const allBooks = await booksApi.getAll();
      const matched = allBooks.find(b => b.id.toUpperCase() === cleanId || b.isbn === cleanId || b.title.toLowerCase().includes(cleanId.toLowerCase()));

      if (matched) {
        playSuccessChime();
        toast.success(`Identified: ${matched.title}`);
        // Fetch active loans
        const txs = await txApi.getAll();
        const bookLoans = (txs || []).filter(t => t.book_id === matched.id && t.status === 'issued');
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
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color: '#ffffff',
          marginBottom: 6,
          letterSpacing: '-0.5px'
        }}>
          QR / Barcode Scanner
        </h1>
        <p style={{ fontSize: 13.5, color: '#94a3b8' }}>
          Scan a book or student ID to quickly perform transactions
        </p>
      </div>

      {/* ── Viewfinder Station (Screen 6 Layout) ── */}
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
