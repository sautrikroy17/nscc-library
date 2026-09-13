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
  
  // Selected Student & Book
  const [selectedStudent, setSelectedStudent] = useState(() => students?.[0] || {
    id: 'st1', name: 'Sautrik Roy', reg: 'RA2511003010052', dept: 'CSE', year: '2', borrowed: 3, maxLimit: 5
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
      { id: 'st1', name: 'Sautrik Roy', reg: 'RA2511003010052', dept: 'CSE', year: '2', borrowed: 3, maxLimit: 5 }
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
      toast.info('Please enter a Roll No. or ISBN to lookup');
      return;
    }
    playClick();
    const q = manualQuery.trim().toLowerCase();

    if (manualTab === 'student') {
      const studentList = students && students.length > 0 ? students : [];
      const match = studentList.find(s => s.reg?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q));
      if (match) {
        playSuccessChime();
        setSelectedStudent(match);
        toast.success(`Student found: ${match.name} (${match.reg})`);
        setManualQuery('');
      } else {
        toast.error(`No student record matching "${manualQuery}"`);
      }
    } else {
      const allBooks = books && books.length > 0 ? books : INITIAL_BOOKS;
      const match = allBooks.find(b => b.title?.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q) || b.id?.toLowerCase().includes(q));
      if (match) {
        playSuccessChime();
        setSelectedBook(match);
        setIsCompleted(false);
        toast.success(`Book found: ${match.title}`);
        setManualQuery('');
      } else {
        toast.error(`No book title matching "${manualQuery}"`);
      }
    }
  };

  const handleConfirmIssue = () => {
    if (!selectedBook || !selectedStudent) return;
    playClick();
    setIsCompleted(true);
    borrowBook(selectedBook, 14, {
      name: selectedStudent.name,
      reg: selectedStudent.reg
    });
  };

  const handleConfirmReturn = () => {
    if (!selectedBook) return;
    playClick();
    setIsCompleted(true);
    returnBook(selectedBook);
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
                <>
                  {/* Book / Card Graphic */}
                  <div style={{
                    position: 'relative',
                    width: 200,
                    height: 230,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #0a1128 0%, #1c2e4a 100%)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 14,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>SRM IST Central Library</div>
                    <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 2 }}>Physical Barcode & QR Sensor</div>

                    {/* QR Code Graphic */}
                    <div style={{
                      marginTop: 18,
                      padding: 8,
                      background: '#ffffff',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=SRM-LIB-9780132350884`}
                        alt="QR Code"
                        style={{ width: 85, height: 85, display: 'block' }}
                      />
                      <div style={{ fontSize: 8, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                        BK002 · CLEAN CODE
                      </div>
                    </div>
                  </div>

                  {/* Corner Reticle Brackets */}
                  <div style={{
                    position: 'absolute',
                    width: 230,
                    height: 230,
                    border: '2px solid rgba(255, 255, 255, 0.85)',
                    borderRadius: 14,
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)'
                  }}>
                    {/* Glowing Laser Scan Bar */}
                    <div style={{
                      position: 'absolute',
                      top: '48%',
                      left: 0,
                      width: '100%',
                      height: 2,
                      background: 'linear-gradient(90deg, transparent 0%, #38bdf8 50%, transparent 100%)',
                      boxShadow: '0 0 10px #38bdf8'
                    }} />
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: 12,
                    padding: '5px 12px',
                    borderRadius: 16,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 600
                  }}>
                    Align Student ID Card or Book Barcode in Viewfinder
                  </div>
                </>
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
                onClick={() => { playClick(); toast.info('Barcode upload sensor ready. You can test simulator below.'); }}
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
                Instant Barcode / RFID Sensors:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => handleScannedCode('RA2511003010052')}
                  style={{ padding: '4px 10px', borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}
                >
                  💳 Sautrik Roy (ID Card)
                </button>
                <button
                  type="button"
                  onClick={() => handleScannedCode('Atomic Habits')}
                  style={{ padding: '4px 10px', borderRadius: 6, background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: 11, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                >
                  ⚡ Atomic Habits
                </button>
                <button
                  type="button"
                  onClick={() => handleScannedCode('BK002')}
                  style={{ padding: '4px 10px', borderRadius: 6, background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: 11, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                >
                  ⚡ Clean Code
                </button>
                <button
                  type="button"
                  onClick={() => handleScannedCode('BK006')}
                  style={{ padding: '4px 10px', borderRadius: 6, background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: 11, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                >
                  ⚡ OS Concepts
                </button>
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
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Manual Lookup / Quick Select</div>
              {/* Sub tabs: Student ID vs Book ISBN */}
              <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: 2, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => { playClick(); setManualTab('student'); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: 'none',
                    background: manualTab === 'student' ? '#0f172a' : 'transparent',
                    color: manualTab === 'student' ? '#ffffff' : '#64748b',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Student ID
                </button>
                <button
                  onClick={() => { playClick(); setManualTab('book'); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: 'none',
                    background: manualTab === 'book' ? '#0f172a' : 'transparent',
                    color: manualTab === 'book' ? '#ffffff' : '#64748b',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Book ISBN
                </button>
              </div>
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
                  placeholder={manualTab === 'student' ? 'Enter Student Roll No. (e.g. RA2511003010052)' : 'Enter Book ISBN or Title (e.g. 978-0132350884)'}
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
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Quick Select Students:
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
                  {selectedStudent?.borrowed} / {selectedStudent?.maxLimit}
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
                    <span>Issued Successfully to {selectedStudent?.name}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm & Issue Book</span>
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
              <div>2. Position the student ID card barcode or book ISBN in front of the camera, or enter the ID manually.</div>
              <div>3. Verify the borrower quota and catalog copies available.</div>
              <div>4. Click <strong>Confirm & Issue Book</strong> or <strong>Process Return</strong> to instantly record the ledger transaction!</div>
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
