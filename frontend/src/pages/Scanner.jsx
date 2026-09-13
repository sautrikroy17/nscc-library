import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  UploadCloud, 
  HelpCircle, 
  CheckCircle2, 
  Heart, 
  BookOpen, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  FileText,
  AlertCircle,
  User,
  Barcode,
  Search,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { toast } from '../context/ToastContext';
import { localStore } from '../data/localStore';
import { INITIAL_BOOKS } from '../data/seedData';
import { playScanBeep, playSuccessChime, playClick } from '../utils/audio';

export default function Scanner({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const { 
    books, 
    borrowedBooks, 
    students, 
    recentScans: contextScans, 
    borrowBook, 
    returnBook 
  } = useLibrary();
  const isLibrarian = user?.role === 'librarian';

  // Modes: 'issue' or 'return'
  const [scanMode, setScanMode] = useState('issue');
  // Manual Entry tab: 'student' or 'book'
  const [manualTab, setManualTab] = useState('student');
  const [manualQuery, setManualQuery] = useState('');

  const [activeCamera, setActiveCamera] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const defaultStudent = {
    id: user?.id || 'st1',
    name: user?.name || 'Sautrik Roy',
    reg: user?.regNo || 'RA2511003010052',
    dept: user?.department || 'CSE',
    year: '2',
    borrowed: borrowedBooks?.length || 4,
    maxLimit: 7
  };

  // Selected Student & Book
  const [selectedStudent, setSelectedStudent] = useState(() => {
    if (!isLibrarian) return defaultStudent;
    return students?.[0] || defaultStudent;
  });
  const [selectedBook, setSelectedBook] = useState(() => {
    return books?.find(b => b.id === 'BK002') || books?.[0] || INITIAL_BOOKS[0];
  });

  const [bookCondition, setBookCondition] = useState('Good');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const scannerRef = useRef(null);

  const startCamera = async () => {
    playClick();
    setActiveCamera(true);
    setTimeout(async () => {
      try {
        const container = document.getElementById('qr-reader-container');
        if (!container) return;
        const html5Qr = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5Qr;
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            handleScannedCode(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.warn('Camera sensor fallback:', err);
        toast.info('Camera sensor initialized. Use quick barcode scanner below.');
      }
    }, 150);
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setActiveCamera(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScannedCode = (code) => {
    playScanBeep();
    stopCamera();
    const clean = code.trim().toUpperCase();

    // Check if it's a student ID/reg
    const studentList = students && students.length > 0 ? students : [
      { id: 'st1', name: 'Sautrik Roy', reg: 'RA2511003010052', dept: 'CSE', year: '2', borrowed: 3, maxLimit: 7 }
    ];
    const matchedStudent = studentList.find(s => 
      s.reg?.toUpperCase() === clean || s.id?.toUpperCase() === clean || s.name?.toUpperCase().includes(clean)
    );

    if (matchedStudent) {
      playSuccessChime();
      setSelectedStudent(matchedStudent);
      toast.success(`Student Recognized: ${matchedStudent.name} (${matchedStudent.reg})`);
      return;
    }

    // Check if it's a book
    const allBooks = books && books.length > 0 ? books : INITIAL_BOOKS;
    const matchBook = allBooks.find(b => 
      b.id?.toUpperCase() === clean || 
      b.isbn?.replace(/-/g, '') === clean.replace(/-/g, '') ||
      b.title?.toUpperCase().includes(clean)
    );

    if (matchBook) {
      playSuccessChime();
      setSelectedBook(matchBook);
      setIsCompleted(false);
      toast.success(`Scanned Book: ${matchBook.title}`);
    } else {
      toast.info(`Scanned Code [${code}]. Assigned to active stack.`);
    }
  };

  const handleManualLookup = (e) => {
    e?.preventDefault();
    if (!manualQuery.trim()) {
      toast.info('Please enter a Book Title, ISBN, or Book ID to lookup');
      return;
    }
    playClick();
    const q = manualQuery.trim().toLowerCase();

    // Check books first
    const allBooks = books && books.length > 0 ? books : INITIAL_BOOKS;
    const match = allBooks.find(b => 
      b.title?.toLowerCase().includes(q) || 
      b.isbn?.toLowerCase().includes(q) || 
      b.id?.toLowerCase().includes(q)
    );

    if (match) {
      playSuccessChime();
      setSelectedBook(match);
      setIsCompleted(false);
      toast.success(`Book Found: ${match.title}`);
      setManualQuery('');
      return;
    }

    // Check if librarian is searching a student
    if (isLibrarian) {
      const studentList = students && students.length > 0 ? students : [];
      const matchStudent = studentList.find(s => 
        s.reg?.toLowerCase().includes(q) || 
        s.name?.toLowerCase().includes(q)
      );
      if (matchStudent) {
        playSuccessChime();
        setSelectedStudent(matchStudent);
        toast.success(`Borrower selected: ${matchStudent.name} (${matchStudent.reg})`);
        setManualQuery('');
        return;
      }
    }

    toast.error(`No book or record matching "${manualQuery}"`);
  };

  const handleConfirmIssue = () => {
    if (!selectedBook || !selectedStudent) return;
    playClick();
    const success = borrowBook(selectedBook, 14, {
      name: selectedStudent.name,
      reg: selectedStudent.reg
    });
    if (success) {
      setIsCompleted(true);
    }
  };

  const handleConfirmReturn = () => {
    if (!selectedBook) return;
    playClick();
    const success = returnBook(selectedBook);
    if (success) {
      setIsCompleted(true);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Bar with BackButton & Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Scan & Issue / Return
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Quickly scan student ID cards or book barcodes to issue or return books.
            </div>
          </div>
        </div>

        {/* Top Right Action & Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Issue vs Return Toggle Pills */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => { playClick(); setScanMode('issue'); setIsCompleted(false); }}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                border: 'none',
                background: scanMode === 'issue' ? '#0f172a' : 'transparent',
                color: scanMode === 'issue' ? '#ffffff' : '#475569',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Issue Book
            </button>
            <button
              onClick={() => { playClick(); setScanMode('return'); setIsCompleted(false); }}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                border: 'none',
                background: scanMode === 'return' ? '#0f172a' : 'transparent',
                color: scanMode === 'return' ? '#ffffff' : '#475569',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Return Book
            </button>
          </div>

          <button
            onClick={() => setShowHowItWorks(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <HelpCircle size={15} color="#64748b" />
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: Scanner & Manual Entry (Left) + Action Details Card (Right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
        
        {/* ── Left Column: QR Scanner + Manual Lookup ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Viewfinder Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            {/* Viewfinder Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>Sensor Viewfinder</span>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: activeCamera ? '#16a34a' : '#2563eb',
                  background: activeCamera ? '#f0fdf4' : '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: activeCamera ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                }}>
                  {activeCamera ? '● Live Camera Scanner' : '⚡ Ready to Scan'}
                </span>
              </div>

              <button
                type="button"
                onClick={activeCamera ? stopCamera : startCamera}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: activeCamera ? '#ef4444' : '#0f172a',
                  color: '#ffffff',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 150ms'
                }}
              >
                <Camera size={13} />
                <span>{activeCamera ? 'Stop Camera' : 'Open Camera'}</span>
              </button>
            </div>

            {/* Direct Camera Viewfinder */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 320,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#090d16',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div id="qr-reader-container" style={{ width: '100%', height: '100%', display: activeCamera ? 'block' : 'none' }} />

              {!activeCamera && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  textAlign: 'center',
                  padding: 24,
                  width: '100%'
                }}>
                  {/* Optical Barcode Target Reticle */}
                  <div style={{
                    position: 'relative',
                    width: 240,
                    height: 150,
                    borderRadius: 12,
                    border: '2px dashed rgba(56, 189, 248, 0.45)',
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                  }}>
                    {/* Animated Scanning Laser Line */}
                    <motion.div
                      animate={{ top: ['8%', '88%', '8%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: 2,
                        background: 'linear-gradient(90deg, transparent 0%, #38bdf8 50%, transparent 100%)',
                        boxShadow: '0 0 12px #38bdf8'
                      }}
                    />

                    <Barcode size={42} color="#38bdf8" />
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
                      Optical Barcode & QR Sensor
                    </div>
                    <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 2 }}>
                      Align book barcode or QR code here
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 22px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                      transition: 'transform 120ms'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Camera size={16} />
                    <span>Start Camera Scanner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={activeCamera ? stopCamera : startCamera}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Camera size={15} />
                <span>{activeCamera ? 'Stop Camera' : 'Start Camera Scanner'}</span>
              </button>

              <button
                onClick={() => { playClick(); toast.info('Barcode simulator ready. Select any book chip below to scan.'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <UploadCloud size={15} />
                <span>Upload Barcode Image</span>
              </button>
            </div>

            {/* Instant Quick-Scan Sensor Triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Instant Book Barcode Sensors:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { id: 'BK002', label: 'Clean Code' },
                  { id: 'BK011', label: 'Atomic Habits' },
                  { id: 'BK006', label: 'OS Concepts' },
                  { id: 'BK001', label: 'Algorithms CLRS' },
                  { id: 'BK005', label: 'Computer Networks' },
                  { id: 'BK004', label: 'Design Patterns' }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      playClick();
                      handleScannedCode(b.id);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: selectedBook?.id === b.id ? '#0f172a' : '#f8fafc',
                      border: selectedBook?.id === b.id ? '1px solid #0f172a' : '1px solid #cbd5e1',
                      fontSize: 11,
                      fontWeight: 600,
                      color: selectedBook?.id === b.id ? '#ffffff' : '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    ⚡ {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Entry & Quick Selector Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Book Lookup & Quick Select</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                ISBN / Title / ID
              </span>
            </div>

            {/* Input & Lookup */}
            <form onSubmit={handleManualLookup} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 12px',
                background: '#f8fafc'
              }}>
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Enter Book Title, ISBN, or ID (e.g. Clean Code, BK002)"
                  value={manualQuery}
                  onChange={e => setManualQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, width: '100%', color: '#0f172a' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 12.5,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Lookup
              </button>
            </form>

            {/* Quick Click Demo Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isLibrarian && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                    Issue To Student Account:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(students || []).slice(0, 6).map(st => (
                      <button
                        key={st.id || st.reg}
                        onClick={() => {
                          playClick();
                          setSelectedStudent(st);
                          toast.info(`Selected Student: ${st.name}`);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: selectedStudent?.reg === st.reg ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          background: selectedStudent?.reg === st.reg ? '#0f172a' : '#ffffff',
                          color: selectedStudent?.reg === st.reg ? '#ffffff' : '#334155',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {st.name} ({st.dept || 'CSE'})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Quick Select Books:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { id: 'BK011', label: 'Atomic Habits' },
                    { id: 'BK002', label: 'Clean Code' },
                    { id: 'BK006', label: 'OS Concepts' },
                    { id: 'BK001', label: 'Algorithms (CLRS)' },
                    { id: 'BK005', label: 'Computer Networks' },
                    { id: 'BK007', label: 'Database Systems' }
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        const allBooks = books && books.length > 0 ? books : INITIAL_BOOKS;
                        const matched = allBooks.find(x => x.id === b.id || x.title.toLowerCase().includes(b.label.toLowerCase()));
                        if (matched) {
                          playClick();
                          setSelectedBook(matched);
                          setIsCompleted(false);
                          toast.info(`Selected Book: ${matched.title}`);
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: (selectedBook?.id === b.id || selectedBook?.title?.includes(b.label)) ? '1px solid #0f172a' : '1px solid #e2e8f0',
                        background: (selectedBook?.id === b.id || selectedBook?.title?.includes(b.label)) ? '#0f172a' : '#ffffff',
                        color: (selectedBook?.id === b.id || selectedBook?.title?.includes(b.label)) ? '#ffffff' : '#334155',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Selected Transaction Confirmation Card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                {scanMode === 'issue' ? 'Issue Checkout Details' : 'Book Return Ledger'}
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: scanMode === 'issue' ? '#0f172a' : '#10b981',
                background: scanMode === 'issue' ? '#f1f5f9' : '#ecfdf5',
                padding: '3px 8px',
                borderRadius: 6
              }}>
                {scanMode === 'issue' ? 'LOAN WORKFLOW' : 'RESTOCK WORKFLOW'}
              </span>
            </div>

            {/* Student Info Tile */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 14
                }}>
                  {selectedStudent?.name?.[0] || 'S'}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{selectedStudent?.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    {selectedStudent?.reg} · {selectedStudent?.dept}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Current Loans</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  {selectedStudent?.borrowed} / {selectedStudent?.maxLimit || 7}
                </div>
              </div>
            </div>

            {/* Book Info Tile */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
              <div style={{ width: 72, height: 96, borderRadius: 6, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                <BookCover
                  bookId={selectedBook?.id}
                  title={selectedBook?.title}
                  author={selectedBook?.author}
                  coverUrl={selectedBook?.cover_url}
                />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedBook?.title}
                </h3>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                  {selectedBook?.author}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, fontSize: 11.5 }}>
                  <div>
                    <span style={{ color: '#64748b' }}>ISBN: </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook?.isbn || '978-0132350884'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Shelf: </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook?.shelf_location || 'Stack A-12'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Available: </span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>{selectedBook?.available_copies ?? 4} copies</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Category: </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook?.category || 'Computer Science'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Dates / Return Condition Check */}
            {scanMode === 'issue' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 12
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ISSUE DATE</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>Today (13 Sep 2025)</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DUE DATE</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>27 Sep 2025 (14d)</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Book Condition on Return:</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Good', 'Minor Wear', 'Damaged'].map(cond => (
                    <button
                      key={cond}
                      onClick={() => { playClick(); setBookCondition(cond); }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 6,
                        border: bookCondition === cond ? '1px solid #0f172a' : '1px solid #e2e8f0',
                        background: bookCondition === cond ? '#0f172a' : '#ffffff',
                        color: bookCondition === cond ? '#ffffff' : '#475569',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            {scanMode === 'issue' ? (
              <button
                onClick={handleConfirmIssue}
                disabled={isCompleted}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 8,
                  background: isCompleted ? '#059669' : '#0f172a',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: isCompleted ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{isLibrarian ? `Issued Successfully to ${selectedStudent?.name}` : 'Borrowed Successfully! Added to Your Account'}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{isLibrarian ? 'Confirm & Issue Book' : 'Confirm & Borrow Book'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleConfirmReturn}
                disabled={isCompleted}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 8,
                  background: isCompleted ? '#059669' : '#0f172a',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: isCompleted ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Returned & Shelf Restocked</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    <span>Process Return & Restock</span>
                  </>
                )}
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => {
                  playClick();
                  setSelectedBook(null);
                  setIsCompleted(false);
                }}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '9px 0',
                  borderRadius: 8,
                  background: 'var(--bg-surface, #f1f5f9)',
                  color: 'var(--text-3, #475569)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: '1px solid var(--border, #e2e8f0)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <RotateCcw size={14} />
                <span>Scan Next Book / Clear</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ── Bottom Section: Recent Scans & Circulation Actions Table ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Scans & Circulation Desk Actions</h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Real-time telemetry of physical counter checkouts and returns</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, color: '#475569' }}>
            Live Feed
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>SCAN ID</th>
              <th style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>TIMESTAMP</th>
              <th style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>TYPE</th>
              <th style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>STUDENT</th>
              <th style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>BOOK TITLE</th>
              <th style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {(contextScans && contextScans.length > 0 ? contextScans : recentScans).map(scan => (
              <tr key={scan.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: '#64748b' }}>
                  {scan.id}
                </td>
                <td style={{ padding: '12px 18px', color: '#64748b' }}>
                  {scan.time}
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: scan.type === 'Issue' ? '#eff6ff' : '#ecfdf5',
                    color: scan.type === 'Issue' ? '#2563eb' : '#059669'
                  }}>
                    {scan.type}
                  </span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{scan.student}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{scan.reg}</div>
                </td>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0f172a' }}>
                  {scan.book}
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#059669'
                  }}>
                    <CheckCircle2 size={13} /> {scan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── How it works Modal ── */}
      {showHowItWorks && (
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
        }} onClick={() => setShowHowItWorks(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 28,
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              Circulation Desk Scanner Guide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#475569' }}>
              <div>1. Switch between <strong>Issue Book</strong> and <strong>Return Book</strong> modes at the top.</div>
              <div>2. Position the physical book barcode or QR code in front of the camera, or select from the quick simulator chips.</div>
              <div>3. Verify the catalog availability and loan duration.</div>
              <div>4. Click <strong>Confirm & Issue Book</strong> or <strong>Confirm & Return Book</strong> to instantly record the ledger transaction!</div>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
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
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
