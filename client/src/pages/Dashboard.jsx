import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  Search, 
  QrCode, 
  Heart, 
  History, 
  Users, 
  ArrowUpRight, 
  AlertTriangle, 
  Plus, 
  MoreVertical, 
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  Eye,
  UserPlus
} from 'lucide-react';
import { stats as statsApi, books as booksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

// Mocked/Seed covers with distinct visual identities
const BOOK_COVERS = {
  'Clean Code': {
    bg: 'linear-gradient(135deg, #0b1528 0%, #162a4a 100%)',
    ring: '#06b6d4',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    sub: 'A Handbook of Agile Software Craftsmanship'
  },
  'Operating System Concepts': {
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    ring: '#60a5fa',
    title: 'Operating System Concepts',
    author: 'Silberschatz · Galvin · Gagne',
    sub: '10th Edition (Dinosaur Edition)'
  },
  'Database System Concepts': {
    bg: 'linear-gradient(135deg, #141b2b 0%, #2a1b4e 100%)',
    ring: '#a855f7',
    title: 'Database System Concepts',
    author: 'Silberschatz · Korth · Sudarshan',
    sub: '7th Edition'
  },
  'Design Patterns': {
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    ring: '#2563eb',
    title: 'Design Patterns',
    author: 'Gamma · Helm · Johnson · Vlissides',
    sub: 'Elements of Reusable OO Software',
    light: true
  },
  'Computer Networks': {
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    ring: '#38bdf8',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    sub: '5th Edition'
  },
  'Artificial Intelligence': {
    bg: 'linear-gradient(135deg, #090d16 0%, #1a1f2e 100%)',
    ring: '#10b981',
    title: 'Artificial Intelligence',
    author: 'Russell & Norvig',
    sub: 'A Modern Approach'
  },
  'System Design Interview': {
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    ring: '#d97706',
    title: 'System Design Interview',
    author: 'Alex Xu',
    sub: "An Insider's Guide",
    light: true
  }
};

function RealisticCover({ title, width = 64, height = 88, onClick }) {
  const cover = BOOK_COVERS[title] || {
    bg: 'linear-gradient(135deg, #0f172a, #1e293b)',
    ring: '#10b981',
    title,
    author: 'NSCC Catalog'
  };

  return (
    <div
      onClick={onClick}
      style={{
        width,
        height,
        borderRadius: 6,
        background: cover.bg,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        color: cover.light ? '#0f172a' : '#ffffff'
      }}
    >
      {/* Spine highlight */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 3,
        background: 'rgba(255, 255, 255, 0.25)'
      }} />

      {/* Decorative center halo */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: '50%',
        border: `1.5px solid ${cover.ring}`,
        opacity: 0.4,
        pointerEvents: 'none'
      }} />

      <div>
        <div style={{
          fontSize: 9,
          fontWeight: 800,
          lineHeight: 1.15,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {cover.title}
        </div>
        <div style={{
          fontSize: 7,
          opacity: 0.75,
          marginTop: 2
        }}>
          {cover.author.split('·')[0]}
        </div>
      </div>

      <div style={{
        fontSize: 6.5,
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        opacity: 0.8
      }}>
        LIBRAX
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate = () => {} }) {
  const { user } = useAuth();
  // Allow manual toggle between Student and Admin perspective for full demonstration
  const [viewRole, setViewRole] = useState(user?.role || 'student');
  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 'BK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      due: '12 Sep 2026',
      daysLeft: 4
    },
    {
      id: 'BK006',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      due: '15 Sep 2026',
      daysLeft: 7
    },
    {
      id: 'BK007',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      due: '20 Sep 2026',
      daysLeft: 12
    }
  ]);

  const [renewedIds, setRenewedIds] = useState([]);

  // Time Greeting Calculation
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');
  const firstName = user?.name ? user.name.split(' ')[0] : (viewRole === 'student' ? 'Pranav' : 'Dr. Rajesh');

  const handleRenew = (book) => {
    playClick();
    if (renewedIds.includes(book.id)) {
      toast.info(`${book.title} has already been extended for this billing period.`);
      return;
    }
    setRenewedIds(prev => [...prev, book.id]);
    setBorrowedBooks(prev => prev.map(b => b.id === book.id ? { ...b, due: '28 Sep 2026' } : b));
    playSuccessChime();
    toast.success(`Loan extended! ${book.title} is now due on 28 Sep 2026.`);
  };

  return (
    <div className="page" style={{ maxWidth: 1360, margin: '0 auto', paddingBottom: 40 }}>
      {/* ── Perspective Switcher Pill (Interactive Demo Aid) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} className="glow-pulse" />
          <span>Active Interface: <strong style={{ color: '#ffffff' }}>{viewRole === 'student' ? 'Student Workspace' : 'Admin Control Hub'}</strong></span>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 22, 38, 0.8)',
          padding: 3,
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => { playClick(); setViewRole('student'); }}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: viewRole === 'student' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: viewRole === 'student' ? '#10b981' : 'transparent',
              color: viewRole === 'student' ? '#ffffff' : '#94a3b8',
              transition: 'all 150ms'
            }}
          >
            Student View
          </button>
          <button
            onClick={() => { playClick(); setViewRole('librarian'); }}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: viewRole === 'librarian' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: viewRole === 'librarian' ? '#10b981' : 'transparent',
              color: viewRole === 'librarian' ? '#ffffff' : '#94a3b8',
              transition: 'all 150ms'
            }}
          >
            Admin View
          </button>
        </div>
      </div>

      {viewRole === 'student' ? (
        /* =========================================================================
           SCREEN 2: STUDENT DASHBOARD (TOP-RIGHT IN USER REFERENCE IMAGE)
           ========================================================================= */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Row: Greeting & Quote */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: '#ffffff',
                marginBottom: 4,
                letterSpacing: '-0.5px'
              }}>
                {greeting}, {firstName} 👋
              </h1>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Read. Learn. Grow.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>
                Tue, 8 Sep 2026
              </div>
              <div style={{ fontStyle: 'italic', fontSize: 12, color: '#64748b' }}>
                "A reader lives a thousand lives." - George R.R. Martin
              </div>
            </div>
          </div>

          {/* 4 Stat Cards Row (Screen 2 exact cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            {/* 1. Borrowed Books */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  3
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Borrowed Books
                </div>
              </div>
            </div>

            {/* 2. Due Soon */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}>
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  1
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Due Soon
                </div>
              </div>
            </div>

            {/* 3. Books Returned */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  12
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Books Returned
                </div>
              </div>
            </div>

            {/* 4. Outstanding Fines */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <IndianRupee size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  ₹0
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Outstanding Fines
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24
          }}>
            {/* ── Left Column: Currently Borrowed ── */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 16,
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#ffffff'
                }}>
                  Currently Borrowed
                </h2>
                <span
                  onClick={() => { playClick(); onNavigate('catalog'); }}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#10b981',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  View All &rarr;
                </span>
              </div>

              {/* Borrowed Book Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {borrowedBooks.map(book => {
                  const isRenewed = renewedIds.includes(book.id);
                  return (
                    <div
                      key={book.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 14px',
                        background: 'rgba(8, 12, 20, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 12,
                        transition: 'all 150ms'
                      }}
                    >
                      <RealisticCover title={book.title} width={44} height={60} />
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                          {book.author}
                        </div>
                      </div>

                      {/* Due Date */}
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: book.daysLeft <= 4 ? '#f59e0b' : '#94a3b8',
                        whiteSpace: 'nowrap'
                      }}>
                        Due: {book.due}
                      </div>

                      {/* Renew Button */}
                      <button
                        onClick={() => handleRenew(book)}
                        disabled={isRenewed}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 7,
                          fontSize: 11.5,
                          fontWeight: 700,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          background: isRenewed ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          color: isRenewed ? '#34d399' : '#10b981',
                          cursor: isRenewed ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {isRenewed ? <Check size={12} strokeWidth={3} /> : null}
                        <span>{isRenewed ? 'Renewed' : 'Renew'}</span>
                      </button>

                      <button
                        onClick={() => toast.info(`Book ID: ${book.id} · SRM IST Central Library Shelf Zone`)}
                        style={{ color: '#64748b', cursor: 'pointer', padding: 2 }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Column: Quick Actions + Recommended ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Quick Actions (2x2 Grid from Mockup Screen 2) */}
              <div style={{
                background: 'rgba(14, 22, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 16,
                padding: '24px'
              }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#ffffff',
                  marginBottom: 16
                }}>
                  Quick Actions
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { id: 'catalog', label: 'Browse Books', icon: Search },
                    { id: 'scanner', label: 'Scan QR', icon: QrCode },
                    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
                    { id: 'history', label: 'View History', icon: History }
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => { playClick(); onNavigate(action.id); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: 'rgba(8, 12, 20, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          color: '#ffffff',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 150ms'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.background = 'rgba(8, 12, 20, 0.6)';
                        }}
                      >
                        <Icon size={16} color="#10b981" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommended for You (Horizontal Showcase from Mockup Screen 2) */}
              <div style={{
                background: 'rgba(14, 22, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 16,
                padding: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16
                }}>
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: '#ffffff'
                  }}>
                    Recommended for You
                  </h2>
                  <span
                    onClick={() => { playClick(); onNavigate('catalog'); }}
                    style={{ fontSize: 12, fontWeight: 600, color: '#10b981', cursor: 'pointer' }}
                  >
                    View All &rarr;
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 12
                }}>
                  {[
                    'Design Patterns',
                    'Computer Networks',
                    'Artificial Intelligence',
                    'System Design Interview'
                  ].map(title => (
                    <div
                      key={title}
                      onClick={() => { playClick(); onNavigate('catalog'); }}
                      style={{ cursor: 'pointer', textAlign: 'center' }}
                    >
                      <RealisticCover title={title} width="100%" height={96} />
                      <div style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: '#ffffff',
                        marginTop: 6,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* =========================================================================
           SCREEN 6: ADMIN DASHBOARD (BOTTOM-RIGHT IN USER REFERENCE IMAGE)
           ========================================================================= */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Row: Title & Date */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: '#ffffff',
                marginBottom: 4,
                letterSpacing: '-0.5px'
              }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Manage. Monitor. Empower.
              </p>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
              Tue, 8 Sep 2026
            </div>
          </div>

          {/* 4 Admin Stat Cards (Screen 6 exact figures) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            {/* 1. Total Books */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  12,482
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Total Books
                </div>
              </div>
            </div>

            {/* 2. Registered Students */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(6, 182, 212, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4'
              }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  3,421
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Registered Students
                </div>
              </div>
            </div>

            {/* 3. Books Borrowed */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <ArrowUpRight size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  1,284
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Books Borrowed
                </div>
              </div>
            </div>

            {/* 4. Overdue Books */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(244, 63, 94, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f43f5e'
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  47
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Overdue Books
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Recent Transactions Table + Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24,
            marginBottom: 28
          }}>
            {/* Recent Transactions Table */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 16,
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#ffffff'
                }}>
                  Recent Transactions
                </h2>
                <span
                  onClick={() => { playClick(); onNavigate('transactions'); }}
                  style={{ fontSize: 12, fontWeight: 600, color: '#10b981', cursor: 'pointer' }}
                >
                  View All &rarr;
                </span>
              </div>

              <div className="table-wrapper">
                <table className="table" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Book</th>
                      <th>Action</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { student: 'Rahul Mehta', book: 'DBMS', action: 'Borrow', date: '8 Sep' },
                      { student: 'Ananya S', book: 'Clean Code', action: 'Return', date: '8 Sep' },
                      { student: 'Arjun N', book: 'OS Concepts', action: 'Borrow', date: '7 Sep' },
                      { student: 'Kavya R', book: 'Computer Networks', action: 'Borrow', date: '7 Sep' },
                      { student: 'Siddharth P', book: 'Design Patterns', action: 'Return', date: '6 Sep' }
                    ].map((tx, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{tx.student}</td>
                        <td style={{ color: '#94a3b8' }}>{tx.book}</td>
                        <td>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: tx.action === 'Borrow' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(6, 182, 212, 0.12)',
                            color: tx.action === 'Borrow' ? '#10b981' : '#06b6d4'
                          }}>
                            {tx.action}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions (Admin 2x2) */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 16,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: '#ffffff',
                marginBottom: 16
              }}>
                Quick Actions
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => { playClick(); onNavigate('catalog'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(8, 12, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} color="#10b981" />
                  <span>Add Book</span>
                </button>

                <button
                  onClick={() => { playClick(); toast.info('Opened Student Registry Station'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(8, 12, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <UserPlus size={16} color="#10b981" />
                  <span>Register Student</span>
                </button>

                <button
                  onClick={() => { playClick(); onNavigate('scanner'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(8, 12, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <QrCode size={16} color="#10b981" />
                  <span>Scan QR</span>
                </button>

                <button
                  onClick={() => { playClick(); onNavigate('admin'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(8, 12, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <AlertTriangle size={16} color="#f43f5e" />
                  <span>View Overdue</span>
                </button>
              </div>

              {/* Status Note */}
              <div style={{
                marginTop: 20,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                fontSize: 11.5,
                color: '#94a3b8'
              }}>
                SRM IST Central Library Node is running at full capacity with instant RFID/QR validation.
              </div>
            </div>
          </div>

          {/* Bottom Row: Library Statistics Bar Chart + 92% Donut Chart */}
          <div style={{
            background: 'rgba(14, 22, 38, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: 16,
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#ffffff'
                }}>
                  Library Statistics
                </h2>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Live catalog utilization and checkout velocity
                </div>
              </div>

              <div style={{
                fontSize: 12,
                color: '#94a3b8',
                background: 'rgba(8, 12, 20, 0.6)',
                padding: '5px 12px',
                borderRadius: 6,
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                This Month &darr;
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 28,
              alignItems: 'center'
            }}>
              {/* Bar Chart Representation */}
              <div style={{
                height: 140,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 12,
                paddingBottom: 8,
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                {[45, 60, 35, 75, 55, 90, 68, 82, 48, 70, 88, 62].map((height, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                      style={{
                        width: '100%',
                        maxWidth: 16,
                        background: i % 2 === 0 ? '#06b6d4' : '#10b981',
                        borderRadius: '3px 3px 0 0',
                        boxShadow: '0 0 10px rgba(6, 182, 212, 0.25)'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 92% Utilization Donut Representation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24
              }}>
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="12" />
                    {/* Active Utilization Ring (92%) */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="12"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - 0.92) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#ffffff' }}>92%</span>
                    <span style={{ fontSize: 8.5, color: '#94a3b8', textTransform: 'uppercase' }}>Utilization</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#06b6d4' }} />
                    <span style={{ color: '#94a3b8' }}>Available</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} />
                    <span style={{ color: '#94a3b8' }}>Borrowed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
