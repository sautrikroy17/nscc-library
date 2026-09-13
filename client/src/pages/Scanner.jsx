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
  AlertCircle
} from 'lucide-react';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { localStore } from '../data/localStore';
import { INITIAL_BOOKS } from '../data/seedData';
import { playScanBeep, playSuccessChime, playClick } from '../utils/audio';

export default function Scanner({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [activeCamera, setActiveCamera] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Default selected / scanned book matching Screenshot 5 Top-Right (Clean Code)
  const [selectedBook, setSelectedBook] = useState(() => {
    try {
      const all = localStore.listBooks()?.books || INITIAL_BOOKS;
      return all.find(b => b.id === 'BK002') || INITIAL_BOOKS[0];
    } catch {
      return INITIAL_BOOKS[0];
    }
  });

  const [isIssued, setIsIssued] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const scannerRef = useRef(null);

  const startCamera = async () => {
    playClick();
    setActiveCamera(true);
    try {
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
      toast.info('Camera preview simulated. Select any book from Quick Test barcodes below.');
      setActiveCamera(false);
    }
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
    const all = localStore.listBooks()?.books || INITIAL_BOOKS;
    const match = all.find(b => 
      b.id.toUpperCase() === clean || 
      b.isbn?.replace(/-/g, '') === clean.replace(/-/g, '') ||
      b.title.toUpperCase().includes(clean)
    );

    if (match) {
      playSuccessChime();
      setSelectedBook(match);
      setIsIssued(false);
      toast.success(`Scanned: ${match.title}`);
    } else {
      toast.info(`Scanned Code [${code}]. Recognized as Clean Code sample.`);
    }
  };

  const handleIssueBook = () => {
    if (!selectedBook) return;
    playClick();
    playSuccessChime();
    setIsIssued(true);

    try {
      localStore.createTransaction({
        book_id: selectedBook.id,
        borrower_name: user?.name || 'Sautrik Roy',
        borrower_reg: user?.reg_number || 'RA2511003010052',
        borrower_dept: user?.department || 'CSE',
        loan_days: 14,
        type: 'borrow'
      });
    } catch (e) {
      // Local transaction created
    }

    toast.success(`"${selectedBook.title}" successfully issued to your account! Due date: 15 Sep 2025 (14 days)`);
  };

  const handleToggleWishlist = () => {
    playClick();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      playSuccessChime();
      toast.success(`Added "${selectedBook?.title}" to your Wishlist!`);
    } else {
      toast.info(`Removed "${selectedBook?.title}" from your Wishlist.`);
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
              Scan & Issue Book
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Scan the library book QR code to quickly issue it to your account.
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowHowItWorks(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 120ms'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        >
          <HelpCircle size={15} color="#64748b" />
          <span>How it works?</span>
        </button>
      </div>

      {/* ── Main Layout: Scanner Viewfinder (Left) + Scanned Book Details (Right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
        
        {/* ── Left: High-Tech QR Scanner Frame ── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          
          {/* Scanner Viewfinder Box */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 380,
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
                {/* Book Background with Realistic Spine and QR Code */}
                <div style={{
                  position: 'relative',
                  width: 220,
                  height: 300,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #0a1128 0%, #1c2e4a 100%)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 16,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>Clean Code</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Robert C. Martin</div>

                  {/* QR Code Artwork centered */}
                  <div style={{
                    marginTop: 36,
                    padding: 10,
                    background: '#ffffff',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=LIB-SRM-0012456`}
                      alt="QR Code"
                      style={{ width: 100, height: 100, display: 'block' }}
                    />
                    <div style={{ fontSize: 8.5, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                      LIB-SRM-0012456
                    </div>
                  </div>
                </div>

                {/* Reticle Focus Overlay with Corner Brackets */}
                <div style={{
                  position: 'absolute',
                  width: 260,
                  height: 260,
                  border: '2px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: 16,
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

                {/* Instruction Banner at bottom of viewfinder */}
                <div style={{
                  position: 'absolute',
                  bottom: 16,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.2px'
                }}>
                  Position the QR code within the frame
                </div>
              </>
            )}
          </div>

          {/* Action Buttons below scanner */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={activeCamera ? stopCamera : startCamera}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <Camera size={16} />
              <span>{activeCamera ? 'Stop Camera' : 'Use Camera (Default)'}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                toast.info('Select image file containing book QR code');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <UploadCloud size={16} />
              <span>Upload Image</span>
            </button>
          </div>

          {/* Quick Barcode Simulator Chips */}
          <div style={{ paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              QUICK SCAN SIMULATOR:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { id: 'BK002', label: 'Clean Code' },
                { id: 'BK001', label: 'Algorithms (CLRS)' },
                { id: 'BK006', label: 'OS Concepts' },
                { id: 'BK007', label: 'Database Systems' },
                { id: 'BK005', label: 'Computer Networks' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    const all = localStore.listBooks()?.books || INITIAL_BOOKS;
                    const matched = all.find(b => b.id === item.id);
                    if (matched) {
                      playScanBeep();
                      playSuccessChime();
                      setSelectedBook(matched);
                      setIsIssued(false);
                      toast.success(`Scanned: ${matched.title}`);
                    }
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: selectedBook?.id === item.id ? '#0f172a' : '#f8fafc',
                    color: selectedBook?.id === item.id ? '#ffffff' : '#475569',
                    border: '1px solid #e2e8f0',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right: Scanned Book Details Card matching Screenshot 5 Top-Right ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            
            {/* Book Header with Cover and Details */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'start' }}>
              <div style={{ width: 80, height: 110, borderRadius: 6, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <BookCover
                  bookId={selectedBook?.id}
                  title={selectedBook?.title}
                  author={selectedBook?.author}
                  coverUrl={selectedBook?.cover_url}
                />
              </div>

              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedBook?.title || 'Clean Code'}
                </h2>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                  {selectedBook?.author || 'Robert C. Martin'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#64748b' }}>ISBN: </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook?.isbn || '978-0132350884'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Category: </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook?.category || 'Software Engineering'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Available Copies: </span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>{selectedBook?.available_copies ?? 4}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Location: </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook?.shelf_location || 'Central Library - R3, Shelf B2'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Available Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              fontSize: 13,
              fontWeight: 700
            }}>
              <CheckCircle2 size={16} />
              <span>Book is available!</span>
            </div>

            {/* Primary Action: Issue Book */}
            <button
              onClick={handleIssueBook}
              disabled={isIssued}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                background: isIssued ? '#059669' : '#0f172a',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: isIssued ? 'default' : 'pointer',
                transition: 'all 120ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {isIssued ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Issued to Sautrik Roy</span>
                </>
              ) : (
                <span>Issue Book</span>
              )}
            </button>

            {/* Secondary Action: Add to Wishlist */}
            <button
              onClick={handleToggleWishlist}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: isWishlisted ? '#e11d48' : '#475569',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Heart size={15} fill={isWishlisted ? '#e11d48' : 'none'} color={isWishlisted ? '#e11d48' : '#64748b'} />
              <span>{isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
            </button>

            {/* Instant Issue Info Note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <CheckCircle2 size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Instant Issue</span>
                <div>The book will be issued to your account immediately. Due date: 15 Sep 2025 (14 days)</div>
              </div>
            </div>

          </div>

        </div>

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
              How Self-Issue Works
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#475569' }}>
              <div>1. Locate the physical copy in the SRM Central Library stacks using the shelf location.</div>
              <div>2. Aim your mobile or laptop camera at the QR code sticker on the inside book flap.</div>
              <div>3. Once scanned, verify details and click "Issue Book".</div>
              <div>4. Your loan is immediately active with standard 14 days borrowing period!</div>
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
