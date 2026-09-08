import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  ScanLine, 
  BookOpen, 
  ArrowUpRight, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Keyboard, 
  Info, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { transactions as txApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playScanBeep, playSuccessChime, playErrorBeep, playReturnChime, playClick } from '../utils/audio';

const DEMO_BOOK_IDS = ['BK001','BK002','BK003','BK004','BK005','BK006','BK007','BK008','BK009','BK010'];

function IssueModal({ book, activeLoans, onClose, onIssue, onReturn }) {
  const [mode, setMode] = useState(activeLoans.length === 0 ? 'issue' : 'return');
  const [form, setForm] = useState({ borrower_name: '', borrower_reg: '', borrower_dept: '', loan_days: 14 });
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(activeLoans[0]?.id || null);

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await txApi.issue({ book_id: book.id, ...form });
      playSuccessChime();
      toast.success(result.message);
      onClose();
    } catch (err) {
      playErrorBeep();
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (waive = false) => {
    setLoading(true);
    try {
      const result = await txApi.return({ transaction_id: selectedLoan, waive_fine: waive });
      playReturnChime();
      toast.success(result.message);
      onClose();
    } catch (err) {
      playErrorBeep();
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const DEPTS = ['CSE','ECE','EEE','ME','CE','IT','BBA','MBA','MBA Tech','Physics','Chemistry','Other'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Book info header */}
        <div style={{
          padding: '18px 22px',
          background: `linear-gradient(135deg, ${book.cover_color}22, ${book.cover_color}11)`,
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <div style={{
            width: 48, height: 60, borderRadius: 8,
            background: `linear-gradient(135deg, ${book.cover_color}66, ${book.cover_color}33)`,
            border: `1px solid ${book.cover_color}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{book.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{book.author}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {book.available_copies}/{book.total_copies} available
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace' }}>
                {book.id}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ marginLeft: 'auto' }}>✕</button>
        </div>

        {/* Mode tabs */}
        <div style={{ padding: '12px 22px 0', display: 'flex', gap: 8 }}>
          {book.available_copies > 0 && (
            <button
              onClick={() => { playClick(); setMode('issue'); }}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: mode === 'issue' ? 'var(--accent)' : 'var(--bg-elevated)',
                color: mode === 'issue' ? 'white' : 'var(--text-3)',
                transition: 'all 200ms',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <ArrowUpRight size={14} /> Issue Book
            </button>
          )}
          {activeLoans.length > 0 && (
            <button
              onClick={() => { playClick(); setMode('return'); }}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: mode === 'return' ? 'var(--cyan)' : 'var(--bg-elevated)',
                color: mode === 'return' ? 'white' : 'var(--text-3)',
                transition: 'all 200ms',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <RotateCcw size={14} /> Return Book
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'issue' ? (
            <motion.form
              key="issue"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleIssue}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Borrower Name *</label>
                  <input className="input" required placeholder="Full name"
                    value={form.borrower_name} onChange={e => setForm(p => ({ ...p, borrower_name: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Reg Number *</label>
                    <input className="input" required placeholder="RA2311003030001"
                      value={form.borrower_reg} onChange={e => setForm(p => ({ ...p, borrower_reg: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Department</label>
                    <select className="input" value={form.borrower_dept} onChange={e => setForm(p => ({ ...p, borrower_dept: e.target.value }))}>
                      <option value="">Select dept...</option>
                      {DEPTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Loan Period (Days)</label>
                  <input className="input" type="number" min="1" max="60"
                    value={form.loan_days} onChange={e => setForm(p => ({ ...p, loan_days: parseInt(e.target.value) || 14 }))} />
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--accent-soft)', borderRadius: 10, fontSize: 12.5, color: 'var(--accent)' }}>
                  📅 Due date: <strong>{new Date(Date.now() + form.loan_days * 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                  &nbsp;• Fine: <strong>₹5/day</strong> if overdue
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner" /> Issuing...</> : '📤 Issue Now'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="return"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeLoans.length > 1 && (
                  <div className="input-group">
                    <label className="input-label">Select Active Loan</label>
                    <select className="input" value={selectedLoan} onChange={e => setSelectedLoan(e.target.value)}>
                      {activeLoans.map(loan => (
                        <option key={loan.id} value={loan.id}>
                          {loan.borrower_name} ({loan.borrower_reg}) — issued {new Date(loan.issue_date).toLocaleDateString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {activeLoans.map(loan => {
                  if (loan.id !== selectedLoan && activeLoans.length > 1) return null;
                  const days = Math.max(0, Math.floor((new Date() - new Date(loan.due_date)) / 86400000));
                  const fine = days * 5;
                  return (
                    <div key={loan.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{loan.borrower_name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                          {loan.borrower_reg} · {loan.borrower_dept}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text-3)' }}>
                          Issued: {new Date(loan.issue_date).toLocaleDateString('en-IN')} · Due: {new Date(loan.due_date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      {days > 0 ? (
                        <div className="fine-display">
                          <span style={{ fontSize: 14, color: 'var(--text-2)' }}>⚠️ Overdue {days} day{days !== 1 ? 's' : ''} — Fine:</span>
                          <span className="fine-amount">₹{fine}</span>
                        </div>
                      ) : (
                        <div style={{ padding: '10px 14px', background: 'var(--success-soft)', borderRadius: 10, fontSize: 12.5, color: 'var(--success)', textAlign: 'center' }}>
                          ✅ Returned on time — No fine!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                {(() => {
                  const loan = activeLoans.find(l => l.id === selectedLoan) || activeLoans[0];
                  const days = Math.max(0, Math.floor((new Date() - new Date(loan?.due_date)) / 86400000));
                  return days > 0 ? (
                    <>
                      <button className="btn btn-ghost btn-sm" disabled={loading} onClick={() => handleReturn(true)}>
                        Waive Fine & Return
                      </button>
                      <button className="btn btn-danger" disabled={loading} onClick={() => handleReturn(false)}>
                        {loading ? <><div className="spinner" /> Processing...</> : `↩️ Collect ₹${days * 5} & Return`}
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-cyan" disabled={loading} onClick={() => handleReturn(false)}>
                      {loading ? <><div className="spinner" /> Processing...</> : '↩️ Return Book'}
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function Scanner() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [html5Qr, setHtml5Qr] = useState(null);
  const scannerDivId = 'html5-qr-scanner';

  const processBookId = async (bookId) => {
    if (loadingScan) return;
    setLoadingScan(true);
    playScanBeep();
    try {
      const data = await txApi.scan(bookId);
      setScanResult(data);
      setShowModal(true);
      playSuccessChime();
    } catch (err) {
      playErrorBeep();
      toast.error(err.message);
    } finally {
      setLoadingScan(false);
    }
  };

  const startScanner = async () => {
    try {
      const qr = new Html5Qrcode(scannerDivId);
      setHtml5Qr(qr);
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (!loadingScan) processBookId(decodedText.trim());
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      toast.error('Camera access denied or not available. Use manual input below.');
    }
  };

  const stopScanner = async () => {
    if (html5Qr) {
      try { await html5Qr.stop(); } catch {}
      setHtml5Qr(null);
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { if (html5Qr) html5Qr.stop().catch(() => {}); };
  }, [html5Qr]);

  const handleClose = () => {
    setShowModal(false);
    setScanResult(null);
  };

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
            <ScanLine size={22} color="var(--accent-bright)" />
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>QR Vision Scanner Station</h1>
        </div>
        <p className="page-subtitle" style={{ margin: 0 }}>
          High-speed optical scanning for zero-touch book issuance, automated return logging, and fine audit
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Scanner viewport */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: scanning ? 'var(--accent)' : 'var(--text-4)',
                boxShadow: scanning ? '0 0 10px var(--accent)' : 'none'
              }} />
              <span>{scanning ? 'Live Hardware Sensor Stream' : 'Camera Feed Offline'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {scanning ? (
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => { playClick(); stopScanner(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <CameraOff size={13} /> Deactivate Sensor
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => { playClick(); startScanner(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Camera size={13} /> Initialize Camera
                </button>
              )}
            </div>
          </div>

          {/* Scanner area */}
          <div style={{ padding: 20 }}>
            <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
              <div
                id={scannerDivId}
                style={{
                  width: '100%',
                  minHeight: 320,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#04070d',
                  border: `2px solid ${scanning ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'border-color 400ms',
                }}
              />
              {scanning && <div className="scanner-laser" />}
              {!scanning && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 14,
                  background: 'var(--bg-elevated)', borderRadius: 14,
                  border: '2px dashed var(--border)',
                }}>
                  <Camera size={56} style={{ opacity: 0.25 }} color="var(--text-3)" />
                  <div style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 700 }}>Hardware Camera Inactive</div>
                  <div style={{ fontSize: 13, color: 'var(--text-4)' }}>Click "Initialize Camera" or enter Book ID on right</div>
                </div>
              )}
            </div>

            {loadingScan && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 16, color: 'var(--accent-bright)' }}
              >
                <div className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Decoding Book Signature...</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right panel: manual + demo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Manual input */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Keyboard size={16} color="var(--accent-bright)" />
                <span>Manual Hardware Entry</span>
              </div>
            </div>
            <div className="card-body">
              <ManualEntry onSubmit={processBookId} loading={loadingScan} />
            </div>
          </motion.div>

          {/* Demo book IDs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#eab308" />
                <span>Rapid Simulation Stream</span>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ width: '100%', fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
                Simulate a QR laser detection hit:
              </p>
              {DEMO_BOOK_IDS.map(id => (
                <button
                  key={id}
                  onClick={() => { playClick(); processBookId(id); }}
                  disabled={loadingScan}
                  style={{
                    padding: '6px 12px', borderRadius: 20,
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
                    color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)'; e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.25)'; }}
                >
                  {id}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={16} color="#38bdf8" />
                <span>Scanning Protocol</span>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['1', Camera, 'Initialize camera feed or select simulated ID'],
                ['2', ScanLine, 'Align QR code barcode directly within laser crosshairs'],
                ['3', ArrowUpRight, 'Issue book to borrower or check-in return instantly'],
                ['4', AlertTriangle, 'Automated fine calculation applies to overdue days'],
              ].map(([num, Icon, text]) => (
                <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-bright)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{num}</div>
                  <Icon size={15} color="var(--accent-bright)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.35 }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Issue/Return modal */}
      <AnimatePresence>
        {showModal && scanResult && (
          <IssueModal
            book={scanResult.book}
            activeLoans={scanResult.active_loans || []}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ManualEntry({ onSubmit, loading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim().toUpperCase());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        className="input"
        placeholder="Book ID (e.g. BK001)"
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ flex: 1 }}
      />
      <button type="submit" className="btn btn-primary" disabled={loading || !value.trim()}>
        {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : '→'}
      </button>
    </form>
  );
}
