import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  Users,
  AlertTriangle,
  ArrowRight, 
  Plus, 
  QrCode, 
  FileSpreadsheet, 
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playClick } from '../utils/audio';

export default function Dashboard({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian';
  const greetingName = isLibrarian ? (user?.name || 'Librarian (LIB-SRM-042)') : 'Pranav';

  // ── Student Currently Borrowed Data ──
  const borrowedBooks = [
    {
      id: 'BK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      dueText: 'Due in 2 days',
      dueColor: '#ef4444',
      dueBg: '#fef2f2',
      cover: '/covers/clean_code.jpg'
    },
    {
      id: 'BK006',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      dueText: 'Due in 5 days',
      dueColor: '#f59e0b',
      dueBg: '#fffbeb',
      cover: '/covers/os_concepts.jpg'
    },
    {
      id: 'BK007',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      dueText: 'Due in 12 days',
      dueColor: '#64748b',
      dueBg: '#f8fafc',
      cover: '/covers/dbms_concepts.jpg'
    }
  ];

  // ── Student Recommendations Data ──
  const recommendedBooks = [
    {
      id: 'BK004',
      title: 'Design Patterns',
      author: 'Erich Gamma et al.',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'BK005',
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'BK008',
      title: 'Artificial Intelligence',
      author: 'Stuart Russell',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777b?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'BK009',
      title: 'Modern Web Development',
      author: 'Brad Traversy',
      cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80'
    }
  ];

  // ── Librarian Issue/Return Trend Weekly Data (Panel 9) ──
  const trendData = [
    { date: 'Aug 26', issued: 48, returned: 38 },
    { date: 'Aug 29', issued: 72, returned: 54 },
    { date: 'Sep 02', issued: 88, returned: 65 },
    { date: 'Sep 05', issued: 64, returned: 70 }
  ];
  const maxTrendVal = 100;

  /* ═══════════════════════════════════════════════════════════
     LIBRARIAN DASHBOARD (Panel 9)
     ═══════════════════════════════════════════════════════════ */
  if (isLibrarian) {
    return (
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── 4 Top Stat Cards (Panel 9) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {/* Total Books */}
          <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <BookOpen size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                12,482
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 3 }}>
                Total Books
              </div>
            </div>
          </div>

          {/* Registered Students */}
          <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Users size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                3,421
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 3 }}>
                Registered Students
              </div>
            </div>
          </div>

          {/* Issued Books */}
          <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <TrendingUp size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                1,284
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 3 }}>
                Issued Books
              </div>
            </div>
          </div>

          {/* Overdue Books */}
          <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <AlertTriangle size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                47
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 3 }}>
                Overdue Books
              </div>
            </div>
          </div>
        </div>

        {/* ── Main 2 Columns (Panel 9): Trend Chart + Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: 24 }}>
          {/* Left: Book Issue/Return Trend Bar Chart */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Book Issue/Return Trend
                </h2>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                  Daily circulation metrics across campus stacks
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }} />
                  Issued
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} />
                  Returned
                </div>
              </div>
            </div>

            {/* Custom Bar Chart matching Mockup */}
            <div style={{
              height: 240,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              paddingBottom: 24,
              borderBottom: '1px solid #f1f5f9',
              gap: 24
            }}>
              {trendData.map(item => (
                <div key={item.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
                    {/* Issued Bar */}
                    <div 
                      title={`Issued: ${item.issued}`}
                      style={{
                        width: 22,
                        height: `${(item.issued / maxTrendVal) * 100}%`,
                        background: '#2563eb',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 300ms ease'
                      }}
                    />
                    {/* Returned Bar */}
                    <div 
                      title={`Returned: ${item.returned}`}
                      style={{
                        width: 22,
                        height: `${(item.returned / maxTrendVal) * 100}%`,
                        background: '#10b981',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 300ms ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <button
                onClick={() => { playClick(); onNavigate('catalog'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Plus size={18} strokeWidth={2.5} />
                </div>
                <span>Add Book</span>
              </button>

              <button
                onClick={() => { playClick(); onNavigate('students'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <UserPlus size={18} strokeWidth={2.2} />
                </div>
                <span>Register Student</span>
              </button>

              <button
                onClick={() => { playClick(); onNavigate('scanner'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <QrCode size={18} strokeWidth={2.2} />
                </div>
                <span>Scan QR</span>
              </button>

              <button
                onClick={() => { playClick(); onNavigate('reports'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                  <FileSpreadsheet size={18} strokeWidth={2.2} />
                </div>
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     STUDENT DASHBOARD (Panel 3)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Top Row: Greeting + Literary Quote (Panel 3) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#0f172a',
          margin: 0,
          letterSpacing: '-0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          Good evening, {greetingName} <span role="img" aria-label="wave">👋</span>
        </h1>

        {/* Top Right Quote */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 13.5,
            fontStyle: 'italic',
            color: '#334155',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            "A reader lives a thousand lives."
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
            — George R. R. Martin
          </div>
        </div>
      </div>

      {/* ── 4 Top Stat Cards in 1 Row (Panel 3) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {/* Borrowed */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <BookOpen size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              3
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Borrowed
            </div>
          </div>
        </div>

        {/* Due Soon */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c'
          }}>
            <Clock size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              1
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Due Soon
            </div>
          </div>
        </div>

        {/* Fines */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6'
          }}>
            <IndianRupee size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              ₹0
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Fines
            </div>
          </div>
        </div>

        {/* Books Read */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              12
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Books Read
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle 2 Columns (Panel 3): Currently Borrowed + Recommended for You ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(340px, 1fr)', gap: 24 }}>
        
        {/* Left: Currently Borrowed */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Currently Borrowed
            </h2>
            <button
              onClick={() => { playClick(); onNavigate('borrowings'); }}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {borrowedBooks.map(book => (
              <div
                key={book.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #f1f5f9',
                  background: '#ffffff',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#ffffff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={book.cover}
                    alt={book.title}
                    style={{
                      width: 40,
                      height: 54,
                      borderRadius: 4,
                      objectFit: 'cover',
                      border: '1px solid #e2e8f0'
                    }}
                    onError={e => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {book.author}
                    </div>
                  </div>
                </div>

                {/* Due Date Tag */}
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: book.dueColor,
                  background: book.dueBg,
                  padding: '4px 10px',
                  borderRadius: 6
                }}>
                  {book.dueText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recommended for You */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recommended for You
            </h2>
            <button
              onClick={() => { playClick(); onNavigate('catalog'); }}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {recommendedBooks.map(book => (
              <div
                key={book.id}
                onClick={() => { playClick(); onNavigate('catalog'); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 150ms'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{
                    width: '100%',
                    height: 115,
                    borderRadius: 6,
                    objectFit: 'cover',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}
                  onError={e => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <div style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: 8,
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {book.title}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
