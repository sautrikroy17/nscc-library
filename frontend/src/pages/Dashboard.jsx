import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { localStore } from '../data/localStore';
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
  const [trendPeriod, setTrendPeriod] = useState('30');
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState(null);
  const [hoveredStudentBar, setHoveredStudentBar] = useState(null);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [progressPeriod, setProgressPeriod] = useState('semester');

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

  // ── Librarian Issue/Return Trend Dynamic Datasets ──
  const LIBRARIAN_TREND_DATA = {
    '30': [
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
      { date: 'Sep 13', issued: 75, returned: 50 }
    ],
    '7': [
      { date: 'Sep 07', issued: 78, returned: 94 },
      { date: 'Sep 08', issued: 64, returned: 58 },
      { date: 'Sep 09', issued: 85, returned: 72 },
      { date: 'Sep 10', issued: 98, returned: 62 },
      { date: 'Sep 11', issued: 56, returned: 68 },
      { date: 'Sep 12', issued: 72, returned: 65 },
      { date: 'Sep 13', issued: 75, returned: 50 }
    ],
    '90': [
      { date: 'Jun', issued: 420, returned: 380 },
      { date: 'Jul', issued: 680, returned: 590 },
      { date: 'Aug', issued: 940, returned: 860 },
      { date: 'Sep', issued: 1284, returned: 1120 },
      { date: 'Oct', issued: 820, returned: 750 },
      { date: 'Nov', issued: 690, returned: 640 }
    ],
    'year': [
      { date: 'Q1 Fall', issued: 2640, returned: 2380 },
      { date: 'Q2 Winter', issued: 3150, returned: 2920 },
      { date: 'Q3 Spring', issued: 3820, returned: 3510 },
      { date: 'Q4 Summer', issued: 1890, returned: 1780 }
    ]
  };

  // ── Student Reading Progress Datasets ──
  const STUDENT_PROGRESS_CONFIG = {
    semester: {
      read: 12,
      goal: 20,
      percent: 60,
      periodLabel: 'This Semester',
      encouragement: "You're 8 books away from your semester goal!",
      bars: [
        { label: 'Jul', books: 2, detail: '2 books completed' },
        { label: 'Aug', books: 3, detail: '3 books completed' },
        { label: 'Sep', books: 4, detail: '4 books completed', active: true },
        { label: 'Oct', books: 2, detail: '2 books planned' },
        { label: 'Nov', books: 1, detail: '1 book planned' },
        { label: 'Dec', books: 0, detail: 'Semester exam reading' }
      ]
    },
    year: {
      read: 24,
      goal: 35,
      percent: 69,
      periodLabel: 'Full Academic Year',
      encouragement: "You're 11 books away from your annual goal!",
      bars: [
        { label: 'Q1 Fall', books: 9, detail: '9 books (Foundations & Core)' },
        { label: 'Q2 Winter', books: 8, detail: '8 books (Systems & Electives)', active: true },
        { label: 'Q3 Spring', books: 5, detail: '5 books planned' },
        { label: 'Q4 Summer', books: 2, detail: '2 books planned' }
      ]
    },
    monthly: {
      read: 4,
      goal: 5,
      percent: 80,
      periodLabel: 'This Month (September)',
      encouragement: "Only 1 book remaining for this month's target!",
      bars: [
        { label: 'Wk 1', books: 1, detail: '1 book: Clean Code' },
        { label: 'Wk 2', books: 1, detail: '1 book: Pragmatic Programmer' },
        { label: 'Wk 3', books: 2, detail: '2 books: Modern Web Dev', active: true },
        { label: 'Wk 4', books: 0, detail: '1 target book remaining' }
      ]
    }
  };

  /* ═══════════════════════════════════════════════════════════
     LIBRARIAN DASHBOARD (Panel 9)
     ═══════════════════════════════════════════════════════════ */
  if (isLibrarian) {
    const activeTrend = LIBRARIAN_TREND_DATA[trendPeriod] || LIBRARIAN_TREND_DATA['30'];
    const totalIssued = activeTrend.reduce((acc, cur) => acc + cur.issued, 0);
    const totalReturned = activeTrend.reduce((acc, cur) => acc + cur.returned, 0);
    const returnRate = totalIssued > 0 ? Math.round((totalReturned / totalIssued) * 100) : 0;
    const maxVal = Math.max(...activeTrend.flatMap(d => [d.issued, d.returned]), 10);


    return (
      <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* ── Top Row: Greeting, Subtitle, and Export CSV Button ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Good afternoon, Dr. Rajesh Kumar <span role="img" aria-label="wave">👋</span>
            </h1>
            <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 3 }}>
              Manage books, assist students, and keep knowledge flowing.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                playClick();
                localStore.exportCSV();
                playSuccessChime();
                toast.success('Circulation issue/return ledger exported as CSV!');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 120ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
            >
              <Download size={16} />
              <span>Export Issue/Return CSV</span>
            </button>
          </div>
        </div>

        {/* ── 5 Top Stat Cards (Aligned & Interactive) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14, alignItems: 'stretch' }}>
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

          {/* 2. Available Books (Brownie Subtask exact requirement) */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('catalog'); }}
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <CheckCircle2 size={20} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 999 }}>
                91.8% Stock
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>11,198</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>Available Books</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Ready to issue on shelves</div>
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
            onClick={() => { playClick(); onNavigate('overdue'); }}
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

          {/* 5. Start Scanner (Direct QR Circulation Trigger) */}
          <div 
            className="card" 
            onClick={() => { playClick(); onNavigate('scanner'); }}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer', 
              transition: 'transform 120ms, box-shadow 120ms',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: 'none',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(15,23,42,0.12)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.12)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <QrCode size={22} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  Start Scanner
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
                  Scan QR to Issue / Return
                </div>
              </div>
            </div>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <ArrowRight size={13} />
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
                value={trendPeriod}
                onChange={e => { playClick(); setTrendPeriod(e.target.value); }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 150ms'
                }}
              >
                <option value="30">Last 30 Days</option>
                <option value="7">Last 7 Days</option>
                <option value="90">This Semester</option>
                <option value="year">Full Academic Year</option>
              </select>
            </div>

            {/* Legend & Summary Metrics */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#334155', fontWeight: 700 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }} />
                  <span>Issued ({totalIssued.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#334155', fontWeight: 700 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} />
                  <span>Returned ({totalReturned.toLocaleString()})</span>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999, border: '1px solid #a7f3d0' }}>
                {returnRate}% Return Rate
              </span>
            </div>

            {/* Dynamic Hover Details Pill */}
            <div style={{
              minHeight: 24,
              marginBottom: 8,
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {hoveredTrendIdx !== null && activeTrend[hoveredTrendIdx] ? (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '3px 12px',
                    borderRadius: 999,
                    boxShadow: '0 4px 12px rgba(15,23,42,0.18)'
                  }}
                >
                  <span style={{ color: '#93c5fd', fontWeight: 800 }}>{activeTrend[hoveredTrendIdx].date}:</span>
                  <span style={{ color: '#60a5fa' }}>Issued {activeTrend[hoveredTrendIdx].issued}</span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#34d399' }}>Returned {activeTrend[hoveredTrendIdx].returned}</span>
                  <span style={{
                    fontSize: 10,
                    background: activeTrend[hoveredTrendIdx].issued >= activeTrend[hoveredTrendIdx].returned ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    color: '#ffffff'
                  }}>
                    {activeTrend[hoveredTrendIdx].issued >= activeTrend[hoveredTrendIdx].returned
                      ? `+${activeTrend[hoveredTrendIdx].issued - activeTrend[hoveredTrendIdx].returned} Out`
                      : `+${activeTrend[hoveredTrendIdx].returned - activeTrend[hoveredTrendIdx].issued} Returned`}
                  </span>
                </motion.div>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: 11 }}>Hover over any bar to view exact circulation figures</span>
              )}
            </div>

            {/* Animated Interactive Bars */}
            <div style={{
              position: 'relative',
              height: 180,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: '1px solid #f1f5f9',
              gap: activeTrend.length > 8 ? 6 : 14
            }}>
              {activeTrend.map((d, idx) => {
                const issuedHeight = Math.max(8, (d.issued / maxVal) * 135);
                const returnedHeight = Math.max(8, (d.returned / maxVal) * 135);
                const isHovered = hoveredTrendIdx === idx;
                const barWidth = activeTrend.length > 8 ? 8 : 14;

                return (
                  <div
                    key={`${trendPeriod}-${d.date}`}
                    onMouseEnter={() => setHoveredTrendIdx(idx)}
                    onMouseLeave={() => setHoveredTrendIdx(null)}
                    onClick={() => { playClick(); setHoveredTrendIdx(idx); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      flex: 1,
                      cursor: 'pointer',
                      background: isHovered ? 'rgba(37,99,235,0.04)' : 'transparent',
                      borderRadius: 6,
                      padding: '4px 2px',
                      transition: 'background 150ms'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 135 }}>
                      <motion.div
                        key={`issued-${trendPeriod}-${d.date}`}
                        initial={{ height: 0, opacity: 0.3 }}
                        animate={{ height: issuedHeight, opacity: 1 }}
                        transition={{ type: 'spring', damping: 16, stiffness: 130, delay: idx * 0.025 }}
                        title={`${d.date} - Issued: ${d.issued}`}
                        style={{
                          width: barWidth,
                          background: isHovered ? '#1d4ed8' : '#2563eb',
                          borderRadius: '3px 3px 0 0',
                          boxShadow: isHovered ? '0 0 10px rgba(37,99,235,0.55)' : 'none',
                          transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                          transformOrigin: 'bottom',
                          transition: 'background 150ms, box-shadow 150ms, transform 150ms'
                        }}
                      />
                      <motion.div
                        key={`returned-${trendPeriod}-${d.date}`}
                        initial={{ height: 0, opacity: 0.3 }}
                        animate={{ height: returnedHeight, opacity: 1 }}
                        transition={{ type: 'spring', damping: 16, stiffness: 130, delay: idx * 0.025 + 0.03 }}
                        title={`${d.date} - Returned: ${d.returned}`}
                        style={{
                          width: barWidth,
                          background: isHovered ? '#059669' : '#10b981',
                          borderRadius: '3px 3px 0 0',
                          boxShadow: isHovered ? '0 0 10px rgba(16,185,129,0.55)' : 'none',
                          transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                          transformOrigin: 'bottom',
                          transition: 'background 150ms, box-shadow 150ms, transform 150ms'
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: activeTrend.length > 8 ? 9 : 10,
                      fontWeight: isHovered ? 800 : 500,
                      color: isHovered ? '#0f172a' : '#94a3b8',
                      whiteSpace: 'nowrap',
                      transition: 'color 150ms'
                    }}>
                      {d.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Actions (3 rows x 2 cols) */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Add New Book', icon: Plus, page: 'add_book' },
                { label: 'Register Student', icon: Users, page: 'students' },
                { label: 'Scan QR (Issue/Return)', icon: QrCode, page: 'scanner' },
                { label: 'Process Return', icon: RotateCcw, page: 'scanner' },
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
              <span onClick={() => onNavigate('overdue')} style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14, alignItems: 'stretch' }}>
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
              <span>of 7 allowed</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>{Math.round((borrowedBooks.length / 7) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (borrowedBooks.length / 7) * 100)}%`, height: '100%', background: '#2563eb', borderRadius: 2 }} />
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

        {/* 4. Start Scanner (Direct QR Circulation Trigger) */}
        <div 
          className="card" 
          onClick={() => { playClick(); onNavigate('scanner'); }}
          style={{ 
            padding: '18px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            cursor: 'pointer', 
            transition: 'transform 120ms, box-shadow 120ms',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: 'none',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(15,23,42,0.12)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.12)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <QrCode size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                Start Scanner
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
                Scan QR to Issue / Return
              </div>
            </div>
          </div>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <ArrowRight size={13} />
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
                <Clock size={12} /> 8:00 AM — 11:00 PM <span style={{ fontSize: 11, color: '#94a3b8' }}>· Mon - Sun (All 3 Levels)</span>
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
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>20 Sep 2025 · Central Library Level 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <BookOpen size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>New Arrivals: Computer Science</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>24 new books added to Level 2</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Clock size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Extended Library Hours</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>All 3 levels open until 11:00 PM daily</div>
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
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Reading Progress
              </h2>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {STUDENT_PROGRESS_CONFIG[progressPeriod]?.periodLabel || 'This Semester'}
              </div>
            </div>
            <select
              value={progressPeriod}
              onChange={e => { playClick(); setProgressPeriod(e.target.value); }}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <option value="semester">This Semester</option>
              <option value="year">Full Academic Year</option>
              <option value="monthly">This Month</option>
            </select>
          </div>

          {(() => {
            const currentProgress = STUDENT_PROGRESS_CONFIG[progressPeriod] || STUDENT_PROGRESS_CONFIG.semester;
            const maxBooks = Math.max(...currentProgress.bars.map(b => b.books), 1);

            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Donut Goal with Framer Motion */}
                  <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
                    <svg width="88" height="88" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                      <motion.path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="4" 
                        initial={{ strokeDasharray: '0, 100' }}
                        animate={{ strokeDasharray: `${currentProgress.percent}, 100` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        strokeLinecap="round"
                      />
                    </svg>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={progressPeriod}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                      >
                        <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                          {currentProgress.read}
                        </span>
                        <span style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
                          of {currentProgress.goal} goal
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Dynamic mini bars with spring height animation and interactive hover tooltips */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 75, paddingBottom: 6, borderBottom: '1px solid #f1f5f9', gap: 6 }}>
                    {currentProgress.bars.map((b, idx) => {
                      const barHeightPx = Math.max(10, (b.books / maxBooks) * 52);
                      const isHovered = hoveredStudentBar === idx;

                      return (
                        <div
                          key={`${progressPeriod}-${b.label}`}
                          onMouseEnter={() => setHoveredStudentBar(idx)}
                          onMouseLeave={() => setHoveredStudentBar(null)}
                          onClick={() => { playClick(); setHoveredStudentBar(idx); }}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                            gap: 5,
                            cursor: 'pointer'
                          }}
                        >
                          <motion.div
                            key={`bar-${progressPeriod}-${b.label}`}
                            initial={{ height: 0, opacity: 0.2 }}
                            animate={{ height: barHeightPx, opacity: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 130, delay: idx * 0.04 }}
                            title={`${b.label}: ${b.books} books · ${b.detail}`}
                            style={{ 
                              width: currentProgress.bars.length > 5 ? 10 : 14, 
                              background: b.active ? '#10b981' : isHovered ? '#2563eb' : '#3b82f6', 
                              borderRadius: '4px 4px 0 0',
                              boxShadow: (b.active || isHovered) ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
                              transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                              transformOrigin: 'bottom',
                              transition: 'background 150ms, box-shadow 150ms, transform 150ms'
                            }} 
                          />
                          <span style={{
                            fontSize: 10,
                            fontWeight: b.active ? 800 : isHovered ? 700 : 500,
                            color: b.active ? '#0f172a' : isHovered ? '#2563eb' : '#94a3b8',
                            transition: 'color 150ms'
                          }}>
                            {b.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hover Details Snippet */}
                <div style={{ minHeight: 18, marginTop: 6, fontSize: 11, color: '#475569', textAlign: 'center', fontWeight: 600 }}>
                  {hoveredStudentBar !== null && currentProgress.bars[hoveredStudentBar] ? (
                    <span style={{ color: '#0f172a' }}>
                      <strong>{currentProgress.bars[hoveredStudentBar].label}:</strong> {currentProgress.bars[hoveredStudentBar].books} books ({currentProgress.bars[hoveredStudentBar].detail})
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 10.5 }}>Click or hover over any interval to see reading breakdown</span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={progressPeriod}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginTop: 8, fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', padding: '8px 12px', borderRadius: 8, border: '1px solid #dcfce7' }}
                  >
                    <Target size={14} /> 
                    <span>{currentProgress.encouragement}</span>
                  </motion.div>
                </AnimatePresence>
              </>
            );
          })()}
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
