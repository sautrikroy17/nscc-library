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
import { useLibrary } from '../context/LibraryContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playReturnChime } from '../utils/audio';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import BookActionMenu from '../components/BookActionMenu';
import LibraryHoursModal from '../components/LibraryHoursModal';

export default function Dashboard({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const { 
    borrowedBooks, 
    returnBook, 
    renewBook, 
    wishlist, 
    books, 
    history, 
    recentScans 
  } = useLibrary();

  const isLibrarian = user?.role === 'librarian';
  const greetingName = isLibrarian ? (user?.name || 'Librarian (LIB-SRM-042)') : (user?.name || 'Sautrik Roy');

  // Timeframe state for Librarian trend chart
  const [trendPeriod, setTrendPeriod] = useState('week');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [showHoursModal, setShowHoursModal] = useState(false);

  const handleQuickReturn = (book) => {
    returnBook(book);
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
    const trendData = [
      { date: 'Aug 14', issued: 52, returned: 44 },
      { date: 'Aug 17', issued: 40, returned: 35 },
      { date: 'Aug 20', issued: 70, returned: 42 },
      { date: 'Aug 23', issued: 68, returned: 58 },
      { date: 'Aug 26', issued: 64, returned: 76 },
      { date: 'Aug 29', issued: 68, returned: 72 },
      { date: 'Sep 01', issued: 50, returned: 66 },
      { date: 'Sep 04', issued: 82, returned: 46 },
      { date: 'Sep 07', issued: 78, returned: 94 },
      { date: 'Sep 10', issued: 98, returned: 62 },
      { date: 'Sep 13', issued: 75, returned: 50 },
    ];

    return (
      <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* ── Top Row: Greeting, Subtitle, and R. David Lankes Quote ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Good afternoon, Dr. Rajesh Kumar <span role="img" aria-label="wave">👋</span>
            </h1>
            <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 3 }}>
              Manage books, assist students, and keep knowledge flowing.
            </div>
          </div>

          <div style={{ textAlign: 'right', maxWidth: 460 }}>
            <div style={{ fontSize: 12.5, color: '#334155', fontStyle: 'italic', lineHeight: 1.4 }}>
              "Libraries are not just about books, but about people, ideas and possibilities."
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              — R. David Lankes
            </div>
          </div>
        </div>

        {/* ── 4 Top Stat Cards + Right Hero Card ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 280px', gap: 16, alignItems: 'stretch' }}>
          {/* 1. Total Books */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('catalog'); }}
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <BookOpen size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 999 }}>
                ↑ +2.4%
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>12,482</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>Total Books</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>+312 this month</div>
            </div>
          </div>

          {/* 2. Registered Students */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('students'); }}
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Users size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 999 }}>
                ↑ +1.2%
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>3,421</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>Registered Students</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>+40 this month</div>
            </div>
          </div>

          {/* 3. Books Issued */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('transactions'); }}
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <TrendingUp size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 999 }}>
                ↑ +8.1%
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>1,284</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>Books Issued</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>+96 this month</div>
            </div>
          </div>

          {/* 4. Overdue Books */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('admin'); }}
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <AlertTriangle size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '2px 8px', borderRadius: 999 }}>
                ↑ +12.5%
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>47</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>Overdue Books</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>+9 since last week</div>
            </div>
          </div>

          {/* 5. Right Hero Image Card */}
          <div style={{
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '18px',
            minHeight: 140,
            background: 'url(/library_reading_table.jpg) center/cover no-repeat'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1, color: '#ffffff' }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35, fontStyle: 'italic' }}>
                "A well-managed library builds a brighter tomorrow."
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={12} />
                <span>LibraX</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle Row (3 Columns): Trend Bar Chart + Quick Actions + Today's Schedule ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) 300px', gap: 20 }}>
          {/* Column 1: Book Issue/Return Trend Bar Chart */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Book Issue/Return Trend
                </h2>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  Daily circulation metrics across campus stacks
                </div>
              </div>

              <select
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="30">Last 30 Days ▾</option>
                <option value="7">Last 7 Days</option>
                <option value="90">This Semester</option>
              </select>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#475569', fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }} />
                <span>Issued</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#475569', fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} />
                <span>Returned</span>
              </div>
            </div>

            {/* Bars */}
            <div style={{
              height: 200,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingBottom: 20,
              borderBottom: '1px solid #f1f5f9',
              gap: 8
            }}>
              {trendData.map(d => (
                <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 150 }}>
                    <div style={{ width: 8, height: `${d.issued * 1.4}px`, background: '#2563eb', borderRadius: '2px 2px 0 0' }} title={`Issued: ${d.issued}`} />
                    <div style={{ width: 8, height: `${d.returned * 1.4}px`, background: '#10b981', borderRadius: '2px 2px 0 0' }} title={`Returned: ${d.returned}`} />
                  </div>
                  <span style={{ fontSize: 9.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Actions (3 rows x 2 cols) */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Add New Book', icon: Plus, page: 'admin', tab: 'add_book' },
                { label: 'Register Student', icon: Users, page: 'students' },
                { label: 'Scan QR (Issue/Return)', icon: QrCode, page: 'scanner' },
                { label: 'Process Return', icon: RotateCcw, page: 'transactions' },
                { label: 'Manage Inventory', icon: BookOpen, page: 'catalog' },
                { label: 'Generate Reports', icon: FileSpreadsheet, page: 'reports' },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => { playClick(); onNavigate(action.page); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '16px 12px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 120ms'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                      <Icon size={16} />
                    </div>
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3: Today's Schedule */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Today's Schedule
              </h2>
              <span onClick={() => toast.info('Schedule calendar open')} style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                View All →
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { title: 'Book Inventory Update', time: '10:00 AM – 11:00 AM', color: '#10b981' },
                { title: 'Student Help Desk', time: '11:00 AM – 1:00 PM', color: '#2563eb' },
                { title: 'Department Book Collection', time: '2:00 PM – 4:00 PM', color: '#f59e0b' },
                { title: 'System Maintenance', time: '5:00 PM – 6:00 PM', color: '#ef4444' }
              ].map((sch, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sch.color, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{sch.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{sch.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Row (3 Columns): Recent Transactions + Overdue Books + Quick Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.3fr) 280px', gap: 20 }}>
          {/* Column 1: Recent Transactions */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Recent Transactions
              </h2>
              <span onClick={() => onNavigate('transactions')} style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                View All →
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Sautrik Roy', reg: 'RA2511003010052', book: 'Clean Code', type: 'Issued', time: '3:12 PM', color: '#2563eb', bg: '#eff6ff' },
                { name: 'Arjun Mehta', reg: 'RA2511003010123', book: 'Operating System Concepts', type: 'Returned', time: '2:48 PM', color: '#10b981', bg: '#ecfdf5' },
                { name: 'Diya Sharma', reg: 'RA2511003010456', book: 'Design Patterns', type: 'Issued', time: '1:20 PM', color: '#2563eb', bg: '#eff6ff' },
                { name: 'Karthik N', reg: 'RA2511003010789', book: 'Database System Concepts', type: 'Issued', time: '12:05 PM', color: '#2563eb', bg: '#eff6ff' },
                { name: 'Sneha Iyer', reg: 'RA2511003010901', book: 'Introduction to Algorithms', type: 'Returned', time: '11:32 AM', color: '#10b981', bg: '#ecfdf5' }
              ].map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#334155' }}>
                      {tx.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{tx.name}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>{tx.book}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: tx.color, background: tx.bg, padding: '2px 6px', borderRadius: 4 }}>
                      {tx.type}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{tx.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Overdue Books */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Overdue Books
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', background: '#ef4444', padding: '1px 6px', borderRadius: 999 }}>
                  47
                </span>
              </div>
              <span onClick={() => onNavigate('admin')} style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                View All →
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { student: 'Rohan Verma', reg: 'RA2511003010111', book: 'Machine Learning', due: '01 Sep 2025', late: '12' },
                { student: 'Ananya S', reg: 'RA2511003010222', book: 'Computer Networks', due: '03 Sep 2025', late: '10' },
                { student: 'Vikram K', reg: 'RA2511003010333', book: 'Artificial Intelligence', due: '05 Sep 2025', late: '8' },
                { student: 'Isha Gupta', reg: 'RA2511003010444', book: 'Modern Web Dev', due: '06 Sep 2025', late: '7' },
                { student: 'Aditya Rao', reg: 'RA2511003010555', book: 'Discrete Mathematics', due: '08 Sep 2025', late: '5' }
              ].map((od, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{od.student}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{od.book} · Due {od.due}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#ef4444' }}>{od.late}d</span>
                    <button
                      onClick={() => {
                        playSuccessChime();
                        toast.success(`Overdue notice sent to ${od.student} (${od.reg})`);
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Notify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Quick Stats */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Quick Stats
              </h2>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>This Month ▾</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#2563eb' }}>
                  <BookOpen size={16} />
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Books Cataloged</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>312</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#10b981' }}>
                  <Sparkles size={16} />
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Student Queries</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>126</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#3b82f6' }}>
                  <IndianRupee size={16} />
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Fines Collected</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>₹2,450</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7c3aed' }}>
                  <Users size={16} />
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>New Students</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>40</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom-most Row: Library Insights + Announcements ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 340px', gap: 16 }}>
          {/* Insight 1 */}
          <div className="card" style={{ padding: '16px 18px', background: '#fffbeb', border: '1px solid #fef3c7' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Most Issued Category</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>Computer Science</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>428 issues this month</div>
          </div>

          {/* Insight 2 */}
          <div className="card" style={{ padding: '16px 18px', background: '#ecfdf5', border: '1px solid #d1fae5' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Highest Activity Day</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>Tuesday</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>312 transactions</div>
          </div>

          {/* Insight 3 */}
          <div className="card" style={{ padding: '16px 18px', background: '#eff6ff', border: '1px solid #dbeafe' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Active Hours</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>11 AM – 3 PM</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Peak library usage</div>
          </div>

          {/* Announcements */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Announcements</div>
              <span onClick={() => onNavigate('notifications')} style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>View All →</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#334155' }}>
              • New Arrivals: 245 new books added this month
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
            {borrowedBooks.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>No books currently borrowed</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Explore the library catalog and borrow books!</div>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{ marginTop: 12, padding: '6px 16px', borderRadius: 8, background: '#2563eb', color: '#ffffff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              borrowedBooks.map(book => (
                <div
                  key={book.id || book.bookId}
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
                      src={book.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'; }}
                      style={{ width: 40, height: 54, borderRadius: 4, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
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
                    <span style={{ fontSize: 11, fontWeight: 700, color: book.dueColor || '#059669', background: book.dueBg || '#ecfdf5', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                      {book.dueText || 'Due in 14 days'}
                    </span>
                    <button
                      onClick={() => handleQuickReturn(book)}
                      title="Return book to stacks"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <RotateCcw size={11} /> Return
                    </button>
                    <BookActionMenu book={book} isBorrowed={true} align="right" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center: Due Soon Hero Card */}
        {(() => {
          const dueSoonBook = borrowedBooks[0];
          return (
            <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #fed7aa', background: '#fffdfa' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#c2410c' }}>
                  <Bookmark size={14} /> Due Soon
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>{borrowedBooks.length > 0 ? '1 book' : '0 books'}</span>
              </div>

              {dueSoonBook ? (
                <>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                    <img
                      src={dueSoonBook.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'}
                      alt={dueSoonBook.title}
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'; }}
                      style={{ width: 85, height: 115, borderRadius: 6, objectFit: 'cover', border: '1px solid #fed7aa', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}
                    />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{dueSoonBook.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{dueSoonBook.author}</div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '3px 8px', borderRadius: 6 }}>
                          {dueSoonBook.dueText || 'Due in 2 days'}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{dueSoonBook.due || 'Soon'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontStyle: 'italic', color: '#475569', background: '#ffffff', border: '1px solid #f1f5f9', padding: '10px 12px', borderRadius: 8, marginBottom: 16 }}>
                    "Knowledge is of no value unless you put it into practice."
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleQuickReturn(dueSoonBook)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                    >
                      Return Now
                    </button>
                    <button
                      onClick={() => renewBook(dueSoonBook.bookId || dueSoonBook.id)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                    >
                      Renew
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#16a34a' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 800, fontSize: 14 }}>All clear!</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>You have zero pending or overdue books.</div>
                </div>
              )}
            </div>
          );
        })()}

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
          <div 
            className="card" 
            onClick={() => { playClick(); setShowHoursModal(true); }}
            style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 120ms' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Library Hours</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: 999 }}>Open Now</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} /> 8:00 AM — 10:00 PM <span style={{ fontSize: 11, color: '#94a3b8' }}>· Mon - Sun</span>
              </div>
            </div>
            <ChevronRight size={16} color="#2563eb" />
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

      {/* Interactive Library Schedule & Hours Modal */}
      <LibraryHoursModal 
        isOpen={showHoursModal} 
        onClose={() => setShowHoursModal(false)} 
      />
    </div>
  );
}
