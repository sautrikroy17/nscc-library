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
  UserPlus,
  RotateCcw,
  Sparkles,
  Star,
  Bookmark,
  Calendar,
  ChevronRight,
  MoreVertical,
  Heart,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playReturnChime } from '../utils/audio';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';

export default function Dashboard({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian';
  const greetingName = isLibrarian ? (user?.name || 'Librarian (LIB-SRM-042)') : (user?.name || 'Sautrik Roy');

  // ── Timeframe state for Librarian trend chart ──
  const [trendPeriod, setTrendPeriod] = useState('week'); // 'week' | 'month' | 'semester'
  const [hoveredBar, setHoveredBar] = useState(null);

  // ── Student Currently Borrowed State ──
  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 'BK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      dueText: 'Due in 2 days',
      dueColor: '#ef4444',
      dueBg: '#fef2f2',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'BK006',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      dueText: 'Due in 5 days',
      dueColor: '#f59e0b',
      dueBg: '#fffbeb',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'BK007',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      dueText: 'Due in 12 days',
      dueColor: '#64748b',
      dueBg: '#f8fafc',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80'
    }
  ]);

  const handleQuickReturn = (book) => {
    playReturnChime();
    setBorrowedBooks(prev => prev.filter(b => b.id !== book.id));
    toast.success(`"${book.title}" returned successfully! Borrow quota updated.`);
  };

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
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'BK009',
      title: 'Modern Web Development',
      author: 'Brad Traversy',
      cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80'
    }
  ];

  // ── Librarian Issue/Return Trend Data across periods (Panel 9) ──
  const TREND_DATA_SETS = {
    week: [
      { date: 'Aug 26', issued: 48, returned: 38 },
      { date: 'Aug 29', issued: 72, returned: 54 },
      { date: 'Sep 02', issued: 88, returned: 65 },
      { date: 'Sep 05', issued: 64, returned: 70 },
      { date: 'Sep 09', issued: 92, returned: 84 },
      { date: 'Sep 12', issued: 78, returned: 68 }
    ],
    month: [
      { date: 'Week 1', issued: 280, returned: 240 },
      { date: 'Week 2', issued: 340, returned: 310 },
      { date: 'Week 3', issued: 410, returned: 380 },
      { date: 'Week 4', issued: 360, returned: 350 }
    ],
    semester: [
      { date: 'Jun', issued: 820, returned: 780 },
      { date: 'Jul', issued: 1140, returned: 1050 },
      { date: 'Aug', issued: 1480, returned: 1390 },
      { date: 'Sep', issued: 1284, returned: 1220 }
    ]
  };

  const currentTrend = TREND_DATA_SETS[trendPeriod] || TREND_DATA_SETS.week;
  const maxTrendVal = Math.max(...currentTrend.flatMap(d => [d.issued, d.returned])) * 1.15;

  /* ═══════════════════════════════════════════════════════════
     LIBRARIAN DASHBOARD (Panel 9)
     ═══════════════════════════════════════════════════════════ */
  if (isLibrarian) {
    return (
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── 4 Top Stat Cards (Panel 9) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {/* Total Books */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('catalog'); }}
            style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 120ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
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
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('students'); }}
            style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 120ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
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
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('transactions'); }}
            style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 120ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
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
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('admin'); }}
            style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 120ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Book Issue/Return Trend
                </h2>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                  Daily circulation metrics across campus stacks
                </div>
              </div>

              {/* Timeframe selector & Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: 2, borderRadius: 8 }}>
                  {[
                    { id: 'week', label: 'Week' },
                    { id: 'month', label: 'Month' },
                    { id: 'semester', label: 'Semester' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => { playClick(); setTrendPeriod(btn.id); }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: 'none',
                        background: trendPeriod === btn.id ? '#ffffff' : 'transparent',
                        color: trendPeriod === btn.id ? '#0f172a' : '#64748b',
                        fontWeight: trendPeriod === btn.id ? 700 : 500,
                        fontSize: 11.5,
                        cursor: 'pointer',
                        boxShadow: trendPeriod === btn.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: '#2563eb' }} />
                    Issued
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: '#10b981' }} />
                    Returned
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart with tooltips */}
            <div style={{
              height: 240,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              paddingBottom: 24,
              borderBottom: '1px solid #f1f5f9',
              gap: 16,
              position: 'relative'
            }}>
              {currentTrend.map((item, idx) => (
                <div 
                  key={item.date} 
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, position: 'relative', cursor: 'pointer' }}
                >
                  {/* Tooltip on hover */}
                  {hoveredBar?.date === item.date && (
                    <div style={{
                      position: 'absolute',
                      top: -42,
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      Issued: {item.issued} · Returned: {item.returned}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180 }}>
                    {/* Issued Bar */}
                    <div 
                      style={{
                        width: 18,
                        height: `${(item.issued / maxTrendVal) * 100}%`,
                        background: '#2563eb',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 300ms ease, opacity 120ms',
                        opacity: hoveredBar && hoveredBar.date !== item.date ? 0.6 : 1
                      }}
                    />
                    {/* Returned Bar */}
                    <div 
                      style={{
                        width: 18,
                        height: `${(item.returned / maxTrendVal) * 100}%`,
                        background: '#10b981',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 300ms ease, opacity 120ms',
                        opacity: hoveredBar && hoveredBar.date !== item.date ? 0.6 : 1
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
                <span>Catalog New Book</span>
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
                <span>Scan QR Pass / Barcode</span>
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
                <span>Reports & Analytics</span>
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
      {/* ── Top Row: Greeting + Literary Quote (Image 1) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
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
            Good evening, Sautrik! <span role="img" aria-label="wave">👋</span>
          </h1>
          <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
            You have {borrowedBooks.length} books borrowed, with 1 due in the next 2 days. Keep reading, keep growing.
          </div>
        </div>

        {/* Top Right Quote */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 13.5,
            fontStyle: 'italic',
            color: '#334155',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            "A reader lives a thousand lives before he dies."
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
            — George R. R. Martin
          </div>
        </div>
      </div>

      {/* ── 5 Top Stat Cards in 1 Row (Image 1) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {/* 1. Books Borrowed */}
        <div 
          className="card" 
          onClick={() => { playClick(); onNavigate('borrowings'); }}
          style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'transform 120ms' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <BookOpen size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {borrowedBooks.length}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
                Books Borrowed
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
              <span>of 5 allowed</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>{Math.round((borrowedBooks.length / 5) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(borrowedBooks.length / 5) * 100}%`, height: '100%', background: '#2563eb', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* 2. Due Soon */}
        <div 
          className="card" 
          onClick={() => { playClick(); onNavigate('borrowings'); }}
          style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 120ms' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <Clock size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                1
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
                Due Soon
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                within 3 days
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="#cbd5e1" />
        </div>

        {/* 3. Books Read */}
        <div 
          className="card" 
          onClick={() => { playClick(); onNavigate('history'); }}
          style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 120ms' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>12</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: 999 }}>↑ +3</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Books Read
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              This semester
            </div>
          </div>
        </div>

        {/* 4. Outstanding Fines */}
        <div 
          className="card" 
          onClick={() => { playClick(); toast.info("You're all clear! Zero outstanding fines."); }}
          style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 120ms' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <IndianRupee size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              ₹0
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Outstanding Fines
            </div>
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>
              You're all clear!
            </div>
          </div>
        </div>

        {/* 5. Wishlist Items */}
        <div 
          className="card" 
          onClick={() => { playClick(); onNavigate('wishlist'); }}
          style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 120ms' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Star size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              5
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
              Wishlist Items
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Explore more books
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Currently Borrowed + Due Soon Card + Right Column (Image 1) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(310px, 1fr) minmax(280px, 0.9fr)', gap: 20 }}>
        {/* Left: Currently Borrowed */}
        <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Currently Borrowed ({borrowedBooks.length})
            </h2>
            <button
              onClick={() => { playClick(); onNavigate('borrowings'); }}
              style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {borrowedBooks.map(book => (
              <div
                key={book.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
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
                    style={{ width: 40, height: 54, borderRadius: 4, objectFit: 'cover', border: '1px solid #e2e8f0' }}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: book.dueColor, background: book.dueBg, padding: '3px 8px', borderRadius: 6 }}>
                    {book.dueText}
                  </span>
                  <button
                    onClick={() => handleQuickReturn(book)}
                    title="Return book to stacks"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <RotateCcw size={11} /> Return
                  </button>
                  <button
                    onClick={() => toast.info(`Viewing record for ${book.title}`)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Due Soon Hero Card (Clean Code) */}
        <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #fed7aa', background: '#fffdfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#c2410c' }}>
              <Bookmark size={14} /> Due Soon
            </span>
            <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>1 book</span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80"
              alt="Clean Code"
              style={{ width: 85, height: 115, borderRadius: 6, objectFit: 'cover', border: '1px solid #fed7aa', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>Clean Code</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Robert C. Martin</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '3px 8px', borderRadius: 6 }}>
                  Due in 2 days
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>15 Sep 2025</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, fontStyle: 'italic', color: '#475569', background: '#ffffff', border: '1px solid #f1f5f9', padding: '10px 12px', borderRadius: 8, marginBottom: 16 }}>
            "Even bad code can work. But if code isn't clean..."
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                playReturnChime();
                setBorrowedBooks(prev => prev.filter(b => b.id !== 'BK002'));
                toast.success('Clean Code returned to stacks successfully!');
              }}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
            >
              Return Now
            </button>
            <button
              onClick={() => {
                playSuccessChime();
                setBorrowedBooks(prev => prev.map(b => b.id === 'BK002' ? { ...b, dueText: 'Due in 16 days', dueColor: '#2563eb', dueBg: '#eff6ff' } : b));
                toast.success('Clean Code renewed! Due date extended by 14 days.');
              }}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
            >
              Renew
            </button>
          </div>
        </div>

        {/* Right: Quick Actions + Library Hours + Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Browse Books', icon: BookOpen, page: 'catalog' },
                { label: 'Scan QR', icon: QrCode, page: 'scanner' },
                { label: 'My Wishlist', icon: Heart, page: 'wishlist' },
                { label: 'View History', icon: Clock, page: 'history' },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => { playClick(); onNavigate(action.page); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <Icon size={14} color="#64748b" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Library Hours */}
          <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Library Hours</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: 999 }}>Open Now</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} /> 8:00 AM — 10:00 PM <span style={{ fontSize: 11, color: '#94a3b8' }}>· Mon - Sun</span>
              </div>
            </div>
            <ChevronRight size={16} color="#cbd5e1" />
          </div>

          {/* Upcoming Events */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Upcoming Events</span>
              <span onClick={() => { playClick(); onNavigate('notifications'); }} style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>View All →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                  <Calendar size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Research Paper Workshop</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>20 Sep 2025 · Central Library</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <BookOpen size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>New Arrivals: Computer Science</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>24 new books added this week</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Clock size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Extended Library Hours</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Open until 10:00 PM during exams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Recommended for You (4 items) + Continue Exploring (3 items) (Image 1) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
        {/* Recommended for You */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recommended for You
            </h2>
            <span onClick={() => { playClick(); onNavigate('catalog'); }} style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
              View All →
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Based on your interests in Software Engineering
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { id: 'BK004', title: 'Design Patterns', author: 'Erich Gamma', rating: 4.8, cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80' },
              { id: 'BK038', title: 'Refactoring', author: 'Martin Fowler', rating: 4.7, cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&auto=format&fit=crop&q=80' },
              { id: 'BK003', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', rating: 4.6, cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80' },
              { id: 'BK037', title: 'Clean Architecture', author: 'R. C. Martin', rating: 4.6, cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&auto=format&fit=crop&q=80' }
            ].map(b => (
              <div 
                key={b.id}
                onClick={() => { playClick(); onNavigate('catalog'); }}
                style={{ cursor: 'pointer', transition: 'transform 120ms' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img
                  src={b.cover}
                  alt={b.title}
                  style={{ width: '100%', height: 135, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 8, lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{b.author}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ea580c', display: 'flex', alignItems: 'center', gap: 3 }}>
                    ★ {b.rating}
                  </span>
                  <Bookmark size={13} color="#94a3b8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Exploring */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Continue Exploring
            </h2>
            <span onClick={() => { playClick(); onNavigate('catalog'); }} style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
              View All →
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Because you borrowed similar books
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { id: 'BK005', title: 'Computer Networks', author: 'Tanenbaum', rating: 4.5, cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80' },
              { id: 'BK015', title: 'Artificial Intelligence', author: 'Stuart Russell', rating: 4.4, cover: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=300&auto=format&fit=crop&q=80' },
              { id: 'BK026', title: 'Modern Web Development', author: 'Matt Ridley', rating: 4.3, cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80' }
            ].map(b => (
              <div 
                key={b.id}
                onClick={() => { playClick(); onNavigate('catalog'); }}
                style={{ cursor: 'pointer', transition: 'transform 120ms' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img
                  src={b.cover}
                  alt={b.title}
                  style={{ width: '100%', height: 135, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 8, lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{b.author}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ea580c', display: 'flex', alignItems: 'center', gap: 3 }}>
                    ★ {b.rating}
                  </span>
                  <Bookmark size={13} color="#94a3b8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent Activity + Reading Progress + Inspirational Photo Card (Image 1) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.9fr)', gap: 20 }}>
        {/* Recent Activity */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recent Activity
            </h2>
            <span onClick={() => { playClick(); onNavigate('history'); }} style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
              View All →
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { type: 'Returned', book: 'Introduction to Algorithms', time: '2 days ago', date: '11 Sep 2025', icon: RotateCcw, color: '#16a34a', bg: '#ecfdf5' },
              { type: 'Renewed', book: 'Clean Code', time: '5 days ago', date: '08 Sep 2025', icon: RotateCcw, color: '#2563eb', bg: '#eff6ff' },
              { type: 'Added', book: 'Design Patterns to wishlist', time: '1 week ago', date: '05 Sep 2025', icon: Heart, color: '#ea580c', bg: '#fff7ed' },
              { type: 'Borrowed', book: 'DBMS Concepts', time: '2 weeks ago', date: '01 Sep 2025', icon: BookOpen, color: '#0f172a', bg: '#f1f5f9' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.book + item.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                        <strong style={{ color: item.color }}>{item.type}</strong> {item.book}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.time}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reading Progress */}
        <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Reading Progress
            </h2>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6 }}>
              This Semester ▾
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Donut Goal */}
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="60, 100" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>12</span>
                <span style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>of 20 goal</span>
              </div>
            </div>

            {/* Monthly mini bars */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 70, paddingBottom: 16, borderBottom: '1px solid #f1f5f9', gap: 6 }}>
              {[
                { m: 'Jul', val: 35 },
                { m: 'Aug', val: 55 },
                { m: 'Sep', val: 75 },
                { m: 'Oct', val: 45 },
                { m: 'Nov', val: 60 },
                { m: 'Dec', val: 40 },
              ].map(b => (
                <div key={b.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: `${b.val}%`, background: '#3b82f6', borderRadius: '3px 3px 0 0' }} />
                  <span style={{ fontSize: 9.5, color: '#94a3b8' }}>{b.m}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', padding: '8px 12px', borderRadius: 8 }}>
            <Target size={14} /> You're 8 books away from your goal!
          </div>
        </div>

        {/* Inspirational Photo Card */}
        <div style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          minHeight: 210,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 24,
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
        }}>
          <img
            src="/library_reading_table.jpg"
            alt="Library Books"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.92) 100%)', zIndex: 2 }} />
          
          <div style={{ position: 'relative', zIndex: 3 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
              Small<br />Steps.<br />Big<br />Knowledge.
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>
            <BookOpen size={16} color="#38bdf8" />
            <span style={{ color: '#ffffff' }}>LibraX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
