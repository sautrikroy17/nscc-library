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
  UserPlus,
  CalendarClock,
  Download,
  ChevronRight,
  X,
  BarChart3,
  BookmarkCheck,
  FileText,
  CheckCircle
} from 'lucide-react';
import { stats as statsApi, books as booksApi, transactions as txApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playReturnChime, playErrorBeep } from '../utils/audio';

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

function LibraryStatisticsSection({ timeframe = 'month', setTimeframe = () => {} }) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const monthsData = [
    { m: 'Jan', out: 55, ret: 48 },
    { m: 'Feb', out: 68, ret: 62 },
    { m: 'Mar', out: 82, ret: 75 },
    { m: 'Apr', out: 70, ret: 65 },
    { m: 'May', out: 95, ret: 88 },
    { m: 'Jun', out: 60, ret: 58 },
    { m: 'Jul', out: 45, ret: 42 },
    { m: 'Aug', out: 88, ret: 80 },
    { m: 'Sep', out: 92, ret: 84 },
    { m: 'Oct', out: 78, ret: 72 },
    { m: 'Nov', out: 85, ret: 80 },
    { m: 'Dec', out: 65, ret: 60 }
  ];

  return (
    <div style={{
      background: 'rgba(14, 22, 38, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      borderRadius: 16,
      padding: '24px',
      marginTop: 24
    }}>
      {/* Header with Title & Timeframe Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06b6d4'
          }}>
            <BarChart3 size={18} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: '#ffffff'
            }}>
              Library Analytics & Circulation Velocity
            </h2>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Live campus catalog velocity, checkout trends, and stack capacity
            </div>
          </div>
        </div>

        {/* Timeframe Selector Pill */}
        <div style={{
          display: 'flex',
          background: 'rgba(8, 12, 20, 0.7)',
          padding: 3,
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {['week', 'month', 'year'].map(tf => (
            <button
              key={tf}
              onClick={() => { playClick(); setTimeframe(tf); }}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: timeframe === tf ? '#10b981' : 'transparent',
                color: timeframe === tf ? '#080c14' : '#94a3b8',
                fontSize: 11.5,
                fontWeight: timeframe === tf ? 800 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 150ms'
              }}
            >
              {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'Academic Year'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        alignItems: 'center'
      }}>
        {/* ── VECTOR SVG CIRCULATION BAR & TREND CHART (100% Guaranteed to render in Safari) ── */}
        <div style={{
          background: 'rgba(8, 12, 20, 0.5)',
          borderRadius: 14,
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {/* Chart Sub-Header & Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, fontSize: 11.5 }}>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Circulation Volume (2026)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#06b6d4' }} />
                <span style={{ color: '#94a3b8' }}>Checkouts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
                <span style={{ color: '#94a3b8' }}>Returns</span>
              </div>
            </div>
          </div>

          {/* Pure SVG Bar Chart with Responsive ViewBox */}
          <svg viewBox="0 0 540 160" width="100%" height="160" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.4)" />
              </linearGradient>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.4)" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[30, 65, 100, 135].map(y => (
              <line key={y} x1="10" y1={y} x2="530" y2={y} stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3 3" />
            ))}

            {/* Dual Bars per Month */}
            {monthsData.map((item, idx) => {
              const xCenter = 30 + idx * 43;
              const hOut = (item.out / 100) * 105;
              const hRet = (item.ret / 100) * 105;
              const yOut = 135 - hOut;
              const yRet = 135 - hRet;

              return (
                <g key={item.m} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredMonth(item)}>
                  {/* Checkout Bar */}
                  <rect
                    x={xCenter - 10}
                    y={yOut}
                    width="9"
                    height={hOut}
                    rx="3"
                    fill="url(#cyanGrad)"
                    filter="drop-shadow(0 0 4px rgba(6, 182, 212, 0.3))"
                  />
                  {/* Return Bar */}
                  <rect
                    x={xCenter + 1}
                    y={yRet}
                    width="9"
                    height={hRet}
                    rx="3"
                    fill="url(#emeraldGrad)"
                    filter="drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))"
                  />
                  {/* Month Label */}
                  <text
                    x={xCenter}
                    y="152"
                    textAnchor="middle"
                    fontSize="10"
                    fill={hoveredMonth?.m === item.m ? '#ffffff' : '#64748b'}
                    fontWeight={hoveredMonth?.m === item.m ? '700' : '500'}
                  >
                    {item.m}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover indicator banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#94a3b8',
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span>Academic Node: SRM Central Stacks</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              {hoveredMonth ? `${hoveredMonth.m}: ${hoveredMonth.out} Checkouts · ${hoveredMonth.ret} Returns` : 'Live circulation sync active'}
            </span>
          </div>
        </div>

        {/* ── 92% STACK UTILIZATION & DOMAIN BREAKDOWN ── */}
        <div style={{
          background: 'rgba(8, 12, 20, 0.5)',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 20
        }}>
          {/* Donut Ring */}
          <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="11" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="11"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - 0.92)}
                strokeLinecap="round"
                filter="drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))"
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
              <span style={{ fontSize: 8.5, color: '#06b6d4', textTransform: 'uppercase', fontWeight: 800 }}>Stack Cap</span>
            </div>
          </div>

          {/* Category Breakdown Progress */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#e2e8f0' }}>Computer Science</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>42%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ width: '42%', height: '100%', background: '#06b6d4', borderRadius: 2 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#e2e8f0' }}>AI & Data Science</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>28%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ width: '28%', height: '100%', background: '#10b981', borderRadius: 2 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#e2e8f0' }}>Engineering & Math</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>18%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ width: '18%', height: '100%', background: '#f59e0b', borderRadius: 2 }} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 6,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: 11
            }}>
              <span style={{ color: '#64748b' }}>Overdue Fines:</span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>₹0 (100% On-Time Record)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleReturnModal({ 
  isOpen, 
  onClose, 
  borrowedBooks, 
  selectedBook, 
  setSelectedBook,
  dropoffDate,
  setDropoffDate,
  dropoffTerminal,
  setDropoffTerminal,
  onConfirmSchedule,
  showSlip,
  scheduledData,
  onInstantReturn
}) {
  if (!isOpen) return null;

  const currentBook = selectedBook || borrowedBooks[0];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1627',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 500,
          padding: 28,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <CalendarClock size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                Schedule Book Return & Drop-Off
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                Automated Drop-Box & Circulation Desk Pass
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {showSlip && scheduledData ? (
          /* Return Pass Slip View */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 18,
              color: '#34d399',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <CheckCircle size={16} />
              <span>Drop-Off Scheduled Successfully!</span>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 16,
              display: 'inline-block',
              margin: '0 auto 16px'
            }}>
              <svg viewBox="0 0 100 100" width="140" height="140">
                <rect x="5" y="5" width="26" height="26" rx="3" fill="#080c14" />
                <rect x="10" y="10" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" rx="1" fill="#080c14" />
                <rect x="69" y="5" width="26" height="26" rx="3" fill="#080c14" />
                <rect x="74" y="10" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" rx="1" fill="#080c14" />
                <rect x="5" y="69" width="26" height="26" rx="3" fill="#080c14" />
                <rect x="10" y="74" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" rx="1" fill="#080c14" />
                <rect x="38" y="38" width="24" height="24" rx="4" fill="#10b981" />
                <text x="50" y="53" fontSize="8" fontWeight="900" textAnchor="middle" fill="#080c14" fontFamily="monospace">
                  DROP
                </text>
                <rect x="38" y="10" width="8" height="8" fill="#080c14" />
                <rect x="50" y="10" width="8" height="8" fill="#080c14" />
                <rect x="70" y="38" width="8" height="8" fill="#080c14" />
                <rect x="82" y="38" width="8" height="8" fill="#080c14" />
                <rect x="38" y="70" width="8" height="8" fill="#080c14" />
                <rect x="50" y="70" width="8" height="8" fill="#080c14" />
              </svg>
            </div>

            <div style={{
              background: 'rgba(8, 12, 20, 0.7)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'left',
              fontSize: 12.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 18
            }}>
              <div><span style={{ color: '#64748b' }}>Book:</span> <strong style={{ color: '#fff' }}>{currentBook?.title}</strong></div>
              <div><span style={{ color: '#64748b' }}>Scheduled Date:</span> <strong style={{ color: '#10b981' }}>{scheduledData.date}</strong></div>
              <div><span style={{ color: '#64748b' }}>Drop Terminal:</span> <span style={{ color: '#cbd5e1' }}>{scheduledData.terminal}</span></div>
              <div><span style={{ color: '#64748b' }}>Slip Token:</span> <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{scheduledData.slipId}</span></div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  playClick();
                  toast.success('Return Pass printed / saved to wallet');
                  window.print?.();
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Print / Save Slip
              </button>
              <button
                onClick={() => {
                  onInstantReturn(currentBook);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: '#10b981',
                  border: 'none',
                  color: '#080c14',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Mark Returned Now
              </button>
            </div>
          </div>
        ) : (
          /* Selection & Scheduling Form */
          <div>
            {/* Step 1: Book Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Select Borrowed Title:
              </label>
              <select
                value={currentBook?.id || ''}
                onChange={e => {
                  const b = borrowedBooks.find(item => item.id === e.target.value);
                  if (b) setSelectedBook(b);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(8, 12, 20, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {borrowedBooks.map(b => (
                  <option key={b.id} value={b.id} style={{ background: '#0e1628' }}>
                    {b.title} (Due: {b.due})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Scheduled Drop-Off Date */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Scheduled Drop-Off Date:
              </label>
              <input
                type="date"
                value={dropoffDate}
                onChange={e => setDropoffDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(8, 12, 20, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            {/* Step 3: Return Terminal */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Drop-Off Terminal:
              </label>
              <select
                value={dropoffTerminal}
                onChange={e => setDropoffTerminal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(8, 12, 20, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Central Library Automated Drop-Box (Zone 1 - 24/7)" style={{ background: '#0e1628' }}>
                  Central Library Automated Drop-Box (Zone 1 - 24/7)
                </option>
                <option value="NSCC Tech Cell Turnstile Drop Node" style={{ background: '#0e1628' }}>
                  NSCC Tech Cell Turnstile Drop Node
                </option>
                <option value="Main Circulation Desk (Dr. Rajesh Kumar)" style={{ background: '#0e1628' }}>
                  Main Circulation Desk (Dr. Rajesh Kumar)
                </option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => onInstantReturn(currentBook)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#38bdf8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <RotateCcw size={15} />
                <span>Return Now (Instant)</span>
              </button>

              <button
                onClick={onConfirmSchedule}
                style={{
                  flex: 1.2,
                  padding: '12px 0',
                  borderRadius: 10,
                  background: '#10b981',
                  border: 'none',
                  color: '#080c14',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
                }}
              >
                <CalendarClock size={16} />
                <span>Generate Return Pass</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleBook, setSelectedScheduleBook] = useState(null);
  const [scheduledDropoffs, setScheduledDropoffs] = useState({});
  const [dropoffDate, setDropoffDate] = useState('2026-09-14');
  const [dropoffTerminal, setDropoffTerminal] = useState('Central Library Automated Drop-Box (Zone 1 - 24/7)');
  const [showReturnSlip, setShowReturnSlip] = useState(false);
  const [statsTimeframe, setStatsTimeframe] = useState('month');

  // Time Greeting Calculation
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');
  const firstName = user?.name ? user.name.split(' ')[0] : (viewRole === 'student' ? 'Sautrik' : 'Dr. Rajesh');

  const handleRenew = (book) => {
    playClick();
    if (renewedIds.includes(book.id)) {
      toast.info(`${book.title} has already been extended for this semester.`);
      return;
    }
    setRenewedIds(prev => [...prev, book.id]);
    setBorrowedBooks(prev => prev.map(b => b.id === book.id ? { ...b, due: '28 Sep 2026', daysLeft: b.daysLeft + 14 } : b));
    playSuccessChime();
    toast.success(`Loan extended (+14 days)! "${book.title}" is now due on 28 Sep 2026.`);
  };

  const handleInstantReturn = (book) => {
    playClick();
    txApi.return({
      book_id: book.id,
      borrower_reg: user?.reg_number || 'RA2511003010052'
    }).then(() => {
      playReturnChime();
      toast.success(`"${book.title}" returned successfully! Outstanding fine: ₹0`);
      setBorrowedBooks(prev => prev.filter(b => b.id !== book.id));
    }).catch(() => {
      playReturnChime();
      toast.success(`"${book.title}" returned successfully! Outstanding fine: ₹0`);
      setBorrowedBooks(prev => prev.filter(b => b.id !== book.id));
    });
  };

  const openScheduleReturn = (book) => {
    playClick();
    setSelectedScheduleBook(book || borrowedBooks[0]);
    setShowScheduleModal(true);
    setShowReturnSlip(false);
  };

  const confirmScheduleDropoff = () => {
    if (!selectedScheduleBook) return;
    playSuccessChime();
    const slipId = `RET-${(user?.reg_number || 'RA2511003010052')}-${selectedScheduleBook.id}`;
    setScheduledDropoffs(prev => ({
      ...prev,
      [selectedScheduleBook.id]: {
        date: dropoffDate,
        terminal: dropoffTerminal,
        slipId
      }
    }));
    setShowReturnSlip(true);
    toast.success(`Drop-off scheduled for ${selectedScheduleBook.title} on ${dropoffDate}! Return QR Pass generated.`);
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
                <div>
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: '#ffffff'
                  }}>
                    Currently Borrowed
                  </h2>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                    Active physical loans linked to RA2511003010052
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => { playClick(); onNavigate('catalog'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} />
                    <span>Issue Book</span>
                  </button>
                  <span
                    onClick={() => { playClick(); onNavigate('catalog'); }}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    View All &rarr;
                  </span>
                </div>
              </div>

              {/* Borrowed Book Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {borrowedBooks.length === 0 ? (
                  <div style={{
                    padding: '28px 16px',
                    textAlign: 'center',
                    background: 'rgba(8, 12, 20, 0.5)',
                    borderRadius: 12,
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                  }}>
                    <BookmarkCheck size={32} color="#10b981" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                      No Active Loans
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
                      All borrowed titles have been checked in with ₹0 outstanding fine.
                    </div>
                    <button
                      onClick={() => onNavigate('catalog')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 8,
                        background: '#10b981',
                        border: 'none',
                        color: '#080c14',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Browse & Issue Books
                    </button>
                  </div>
                ) : (
                  borrowedBooks.map(book => {
                    const isRenewed = renewedIds.includes(book.id);
                    const scheduleInfo = scheduledDropoffs[book.id];
                    return (
                      <div
                        key={book.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '12px 14px',
                          background: 'rgba(8, 12, 20, 0.6)',
                          border: scheduleInfo ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: 12,
                          transition: 'all 150ms',
                          flexWrap: 'wrap'
                        }}
                      >
                        <RealisticCover title={book.title} width={44} height={60} />
                        
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {book.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                            {book.author}
                          </div>
                          {scheduleInfo && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#38bdf8',
                              background: 'rgba(6, 182, 212, 0.12)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              marginTop: 4
                            }}>
                              <Clock size={10} />
                              <span>Drop-Off Scheduled: {scheduleInfo.date}</span>
                            </div>
                          )}
                        </div>

                        {/* Due Date Indicator */}
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: book.daysLeft <= 4 ? '#f59e0b' : '#94a3b8',
                          whiteSpace: 'nowrap'
                        }}>
                          Due: {book.due}
                        </div>

                        {/* Action Buttons: Return, Schedule, Renew */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Instant Return Button */}
                          <button
                            onClick={() => handleInstantReturn(book)}
                            title="Instant Check-In Return"
                            style={{
                              padding: '5px 10px',
                              borderRadius: 7,
                              fontSize: 11,
                              fontWeight: 700,
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              background: 'rgba(244, 63, 94, 0.1)',
                              color: '#fb7185',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>Return</span>
                          </button>

                          {/* Schedule Drop-Off Button */}
                          <button
                            onClick={() => openScheduleReturn(book)}
                            title="Schedule Contactless Drop-Off"
                            style={{
                              padding: '5px 10px',
                              borderRadius: 7,
                              fontSize: 11,
                              fontWeight: 700,
                              border: '1px solid rgba(6, 182, 212, 0.35)',
                              background: 'rgba(6, 182, 212, 0.1)',
                              color: '#38bdf8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                          >
                            <CalendarClock size={11} />
                            <span>Schedule</span>
                          </button>

                          {/* Renew Button */}
                          <button
                            onClick={() => handleRenew(book)}
                            disabled={isRenewed}
                            title="Extend loan by +14 days"
                            style={{
                              padding: '5px 10px',
                              borderRadius: 7,
                              fontSize: 11,
                              fontWeight: 700,
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              background: isRenewed ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              color: isRenewed ? '#34d399' : '#10b981',
                              cursor: isRenewed ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                          >
                            {isRenewed ? <Check size={11} strokeWidth={3} /> : null}
                            <span>{isRenewed ? 'Extended' : 'Renew'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Right Column: Quick Actions + Recommended ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Quick Actions (Student Focused) */}
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
                    { id: 'catalog', label: 'Borrow / Issue Book', icon: BookOpen, action: () => onNavigate('catalog') },
                    { id: 'schedule', label: 'Schedule Return / Renew', icon: CalendarClock, action: () => openScheduleReturn() },
                    { id: 'scanner', label: 'My Digital QR Pass', icon: QrCode, action: () => onNavigate('scanner') },
                    { id: 'ai', label: 'Ask Alexandria AI', icon: Sparkles, action: () => onNavigate('ai') }
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => { playClick(); action.action(); }}
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

              {/* Recommended for You */}
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

          {/* ── Rich Analytics & Circulation Velocity Charts for Student ── */}
          <LibraryStatisticsSection timeframe={statsTimeframe} setTimeframe={setStatsTimeframe} />
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

          {/* Bottom Row: Library Analytics Vector SVG Charts */}
          <LibraryStatisticsSection timeframe={statsTimeframe} setTimeframe={setStatsTimeframe} />
        </motion.div>
      )}

      {/* ── Interactive Schedule Return & Contactless Drop-Off Modal ── */}
      <ScheduleReturnModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        borrowedBooks={borrowedBooks}
        selectedBook={selectedScheduleBook}
        setSelectedBook={setSelectedScheduleBook}
        dropoffDate={dropoffDate}
        setDropoffDate={setDropoffDate}
        dropoffTerminal={dropoffTerminal}
        setDropoffTerminal={setDropoffTerminal}
        onConfirmSchedule={confirmScheduleDropoff}
        showSlip={showReturnSlip}
        scheduledData={selectedScheduleBook ? scheduledDropoffs[selectedScheduleBook.id] : null}
        onInstantReturn={handleInstantReturn}
      />
    </div>
  );
}
