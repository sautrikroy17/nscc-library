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
  ArrowRight, 
  Plus, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink,
  FileText,
  Pin,
  Sparkles,
  Check,
  RotateCcw
} from 'lucide-react';
import { books as booksApi, transactions as txApi, stats as statsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playReturnChime } from '../utils/audio';
import BookCover, { BOOK_ARTWORKS } from '../components/BookCover';

export default function Dashboard({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 'BK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Programming',
      copiesAvailable: 3,
      dueDays: 2,
      dueDate: '12 Sep 2026',
      dueColor: '#dc2626',
      renewed: false
    },
    {
      id: 'BK006',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      category: 'Computer Science',
      copiesAvailable: 5,
      dueDays: 5,
      dueDate: '15 Sep 2026',
      dueColor: '#d97706',
      renewed: false
    },
    {
      id: 'BK007',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      category: 'Database',
      copiesAvailable: 4,
      dueDays: 12,
      dueDate: '22 Sep 2026',
      dueColor: '#475569',
      renewed: false
    }
  ]);

  const [wishlistAdded, setWishlistAdded] = useState({});
  const [selectedDay, setSelectedDay] = useState(11); // Thu 11 is selected by default

  const handleRenew = (bookId, title) => {
    playClick();
    setBorrowedBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          dueDays: b.dueDays + 14,
          dueDate: '26 Sep 2026',
          dueColor: '#16a34a',
          renewed: true
        };
      }
      return b;
    }));
    playSuccessChime();
    toast.success(`Renewed "${title}" for an additional 14 days! New due date: 26 Sep 2026`);
  };

  const handleQuickAdd = (bookId, title) => {
    playClick();
    setWishlistAdded(prev => ({ ...prev, [bookId]: !prev[bookId] }));
    if (!wishlistAdded[bookId]) {
      playSuccessChime();
      toast.success(`Added "${title}" to your Wishlist.`);
    } else {
      toast.info(`Removed "${title}" from Wishlist.`);
    }
  };

  const isLibrarian = user?.role === 'librarian' || user?.role === 'admin';
  const greetingName = isLibrarian ? (user?.name || 'Dr. Rajesh Kumar') : 'Sautrik Roy';

  return (
    <div style={{
      background: '#f8f7f4',
      minHeight: '100%',
      padding: '28px 36px 60px',
      color: '#0f172a',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* ── Header Row: Greeting & Literary Quote (Screenshot 1) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.3px',
            lineHeight: 1.2
          }}>
            Good evening, {greetingName} 👋
          </h1>
          <p style={{
            fontSize: 13.5,
            color: '#64748b',
            margin: '4px 0 0',
            fontWeight: 500
          }}>
            Keep learning, keep growing.
          </p>
        </div>

        {/* Literary Quote on Right */}
        <div style={{
          textAlign: 'right',
          maxWidth: 420
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 13.5,
            color: '#334155',
            lineHeight: 1.4
          }}>
            "A reader lives a thousand lives before he dies."
          </div>
          <div style={{
            fontSize: 12,
            color: '#64748b',
            fontWeight: 600,
            marginTop: 2
          }}>
            — George R.R. Martin
          </div>
        </div>
      </div>

      {/* ── Top Stats & Calendar Tracker Row (Screenshot 1) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) minmax(280px, 320px)',
        gap: 16,
        marginBottom: 24
      }}>
        
        {/* 4 Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 16
        }}>
          
          {/* Card 1: Borrowed Books */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #edebe6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <BookOpen size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                3
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                Borrowed Books
              </div>
              <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                ↑ 1 from last month
              </div>
            </div>
          </div>

          {/* Card 2: Due Soon */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #edebe6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}>
                <Clock size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                1
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                Due Soon
              </div>
              <div style={{ fontSize: 11.5, color: '#ea580c', fontWeight: 600, marginTop: 4 }}>
                Due within 7 days
              </div>
            </div>
          </div>

          {/* Card 3: Books Returned */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #edebe6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <CheckCircle2 size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                12
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                Books Returned
              </div>
              <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                + 4 this month
              </div>
            </div>
          </div>

          {/* Card 4: Outstanding Fines */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #edebe6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#fff1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48'
              }}>
                <IndianRupee size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                ₹0
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                Outstanding Fines
              </div>
              <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                All clear!
              </div>
            </div>
          </div>
        </div>

        {/* Schedule / Week Calendar Widget */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid #edebe6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              <CalendarIcon size={15} color="#2563eb" />
              <span>Tue, 11 Sep 2026</span>
            </div>
          </div>

          {/* Weekday Tracker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 12 }}>
            {[
              { day: 'Mon', num: 8 },
              { day: 'Tue', num: 9 },
              { day: 'Wed', num: 10 },
              { day: 'Thu', num: 11, active: true },
              { day: 'Fri', num: 12 },
              { day: 'Sat', num: 13 },
              { day: 'Sun', num: 14 }
            ].map(item => {
              const isSelected = selectedDay === item.num;
              return (
                <button
                  key={item.num}
                  onClick={() => { playClick(); setSelectedDay(item.num); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 4px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: isSelected ? '#0f172a' : 'transparent',
                    color: isSelected ? '#ffffff' : '#64748b',
                    minWidth: 32,
                    transition: 'all 120ms'
                  }}
                >
                  <span style={{ fontSize: 9.5, fontWeight: 600 }}>{item.day}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{item.num}</span>
                </button>
              );
            })}
          </div>

          {/* Due Book Reminder Banner */}
          <div 
            onClick={() => onNavigate('borrowings')}
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#b91c1c' }}>
              <span>📌</span>
              <span>You have 1 book due in 2 days</span>
            </div>
            <ChevronRight size={14} color="#b91c1c" />
          </div>
        </div>

      </div>

      {/* ── Middle Section: Currently Borrowed & Quick Actions + Recommendations ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 1fr)',
        gap: 24,
        marginBottom: 28
      }}>
        
        {/* Left Column: Currently Borrowed Books */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '22px 24px',
          border: '1px solid #edebe6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 19,
              fontWeight: 700,
              color: '#0f172a',
              margin: 0
            }}>
              Currently Borrowed
            </h2>
            <button
              onClick={() => onNavigate('borrowings')}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          {/* List of Borrowed Books matching Screenshot 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {borrowedBooks.map(book => (
              <div 
                key={book.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #f1f5f9',
                  background: '#fcfcfd',
                  transition: 'all 150ms'
                }}
              >
                {/* Book Cover Thumbnail */}
                <div 
                  onClick={() => onNavigate('catalog')}
                  style={{ width: 44, height: 60, flexShrink: 0, cursor: 'pointer' }}
                >
                  <BookCover bookId={book.id} title={book.title} author={book.author} />
                </div>

                {/* Book Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span 
                      onClick={() => onNavigate('catalog')}
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      {book.title}
                    </span>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#f1f5f9',
                      color: '#475569'
                    }}>
                      {book.category}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {book.author}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, fontSize: 11.5 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                      Available in Library: {book.copiesAvailable} copies
                    </span>
                    <span style={{ color: book.dueColor, fontWeight: 700 }}>
                      Due in {book.dueDays} days ({book.dueDate})
                    </span>
                  </div>
                </div>

                {/* Renew Button & Menu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleRenew(book.id, book.title)}
                    disabled={book.renewed}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: book.renewed ? '#f0fdf4' : '#ffffff',
                      color: book.renewed ? '#16a34a' : '#0f172a',
                      border: book.renewed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      cursor: book.renewed ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {book.renewed ? (
                      <>
                        <Check size={12} /> Renewed
                      </>
                    ) : (
                      <>
                        <RotateCcw size={12} /> Renew
                      </>
                    )}
                  </button>
                  <button
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recommended For You */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Quick Actions (Screenshot 1: 2x2 grid) */}
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #edebe6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 17,
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 14px'
            }}>
              Quick Actions
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12
            }}>
              {/* 1. Browse Books */}
              <button
                onClick={() => { playClick(); onNavigate('catalog'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #edebe6',
                  background: '#fcfbf9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#edebe6'}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Browse Books</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Explore the collection</div>
                </div>
              </button>

              {/* 2. Scan QR (Prominently placed as in Screenshot 1!) */}
              <button
                onClick={() => { playClick(); onNavigate('scanner'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #edebe6',
                  background: '#fcfbf9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#edebe6'}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <QrCode size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Scan QR</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Issue or return</div>
                </div>
              </button>

              {/* 3. My Wishlist */}
              <button
                onClick={() => { playClick(); onNavigate('wishlist'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #edebe6',
                  background: '#fcfbf9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ec4899'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#edebe6'}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#fdf2f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ec4899'
                }}>
                  <Heart size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>My Wishlist</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Saved for later</div>
                </div>
              </button>

              {/* 4. View History */}
              <button
                onClick={() => { playClick(); onNavigate('history'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #edebe6',
                  background: '#fcfbf9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#edebe6'}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <History size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>View History</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Past transactions</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recommended for You (Screenshot 1) */}
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #edebe6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 17,
                fontWeight: 700,
                color: '#0f172a',
                margin: 0
              }}>
                Recommended for You
              </h2>
              <button
                onClick={() => onNavigate('catalog')}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            {/* 4 Books Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10
            }}>
              {[
                { id: 'BK004', title: 'Design Patterns', author: 'Gamma et al.' },
                { id: 'BK005', title: 'Computer Networks', author: 'Tanenbaum' },
                { id: 'BK015', title: 'Artificial Intelligence', author: 'Russell & Norvig' },
                { id: 'BK012', title: 'System Design', author: 'Alex Xu' }
              ].map(book => (
                <div key={book.id} style={{ position: 'relative' }}>
                  <div 
                    onClick={() => onNavigate('catalog')}
                    style={{ cursor: 'pointer', borderRadius: 6, overflow: 'hidden' }}
                  >
                    <BookCover bookId={book.id} title={book.title} author={book.author} />
                  </div>
                  
                  {/* Quick Add Button */}
                  <button
                    onClick={() => handleQuickAdd(book.id, book.title)}
                    title="Add to Wishlist"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: wishlistAdded[book.id] ? '#ec4899' : 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      color: wishlistAdded[book.id] ? '#ffffff' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {wishlistAdded[book.id] ? <Check size={12} /> : <Plus size={12} />}
                  </button>

                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#0f172a',
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {book.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Row: Visual Banner + Recent Activity + Announcements ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 1fr) minmax(300px, 1.2fr) minmax(280px, 1fr)',
        gap: 20,
        marginBottom: 40
      }}>
        
        {/* Column 1: Visual Photo Banner ("Small Steps. A Brighter Tomorrow.") */}
        <div style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          minHeight: 220,
          border: '1px solid #edebe6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <img 
            src="/book_stack_quote.jpg" 
            alt="Small Steps" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px 22px'
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 6px',
              lineHeight: 1.25
            }}>
              Small Steps.<br />A Brighter Tomorrow.
            </h3>
            <p style={{
              fontSize: 12,
              color: '#e2e8f0',
              margin: 0,
              fontWeight: 500
            }}>
              Explore. Learn. Grow. With LibraX.
            </p>
          </div>
        </div>

        {/* Column 2: Recent Activity (Screenshot 1) */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '20px 22px',
          border: '1px solid #edebe6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 17,
              fontWeight: 700,
              color: '#0f172a',
              margin: 0
            }}>
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigate('history')}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: 3
              }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { text: 'Returned "Introduction to Algorithms"', time: '2 days ago', icon: CheckCircle2, color: '#16a34a', bg: '#ecfdf5' },
              { text: 'Issued "Database System Concepts"', time: '5 days ago', icon: FileText, color: '#2563eb', bg: '#eff6ff' },
              { text: 'Renewed "Clean Code"', time: '1 week ago', icon: Clock, color: '#d97706', bg: '#fffbeb' },
              { text: 'Added "Design Patterns" to Wishlist', time: '1 week ago', icon: Heart, color: '#ec4899', bg: '#fdf2f8' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0
                  }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Announcements (Screenshot 1) */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '20px 22px',
          border: '1px solid #edebe6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 17,
              fontWeight: 700,
              color: '#0f172a',
              margin: 0
            }}>
              Announcements
            </h3>
            <button
              onClick={() => onNavigate('notifications')}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: 3
              }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Library will be closed on 15 Sep 2026 for maintenance.', date: '10 Sep 2026', bg: '#fffbeb', border: '#fef3c7', text: '#b45309' },
              { title: 'New arrivals in Computer Science section.', date: '8 Sep 2026', bg: '#eff6ff', border: '#dbeafe', text: '#1d4ed8' },
              { title: 'Workshop: Research Paper Writing', date: '20 Sep 2026', bg: '#f5f3ff', border: '#ede9fe', text: '#6d28d9' }
            ].map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: item.text, lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                    {item.date}
                  </div>
                </div>
                <ChevronRight size={14} color={item.text} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Official SRM IST Footer (Screenshot 1, 2, 3, 4) ── */}
      <footer style={{
        paddingTop: 24,
        borderTop: '1px solid #edebe6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Left: Brand & Credit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid #0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a'
          }}>
            <BookOpen size={15} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>LibraX</div>
            <div style={{ fontSize: 10.5, color: '#64748b' }}>
              SRM IST LIBRARY MANAGEMENT SYSTEM · Built by Newton School Coding Club
            </div>
          </div>
        </div>

        {/* Center: Creed & Copyright */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', letterSpacing: '0.5px' }}>
            Learn · Innovate · Belong
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>
            © 2026 LibraX. All rights reserved.
          </div>
        </div>

        {/* Right: Official SRM IST Logo Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img 
            src="/srm_logo.jpg" 
            alt="SRM IST" 
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid #e2e8f0'
            }}
          />
        </div>
      </footer>

    </div>
  );
}
