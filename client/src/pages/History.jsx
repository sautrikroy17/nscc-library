import { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  ChevronDown, 
  BookOpen, 
  MoreVertical, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import { playClick } from '../utils/audio';
import { toast } from '../context/ToastContext';

export default function History({ onNavigate = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2025');

  const historySeptember = [
    {
      id: 'h1',
      bookId: 'BK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      action: 'Returned the book',
      date: '11 Sep 2025',
      time: '11:20 AM',
      type: 'returned',
      badge: 'Returned',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      icon: CheckCircle2
    },
    {
      id: 'h2',
      bookId: 'BK006',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300&auto=format&fit=crop&q=80',
      action: 'Renewed the book (New due date: 22 Sep 2025)',
      date: '08 Sep 2025',
      time: '04:15 PM',
      type: 'renewed',
      badge: 'Renewed',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      icon: RotateCcw
    },
    {
      id: 'h3',
      bookId: 'BK007',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
      action: 'Borrowed the book',
      date: '05 Sep 2025',
      time: '10:30 AM',
      type: 'borrowed',
      badge: 'Borrowed',
      badgeColor: '#0f172a',
      badgeBg: '#f1f5f9',
      icon: Download
    }
  ];

  const historyAugust = [
    {
      id: 'h4',
      bookId: 'BK001',
      title: 'Introduction to Algorithms',
      author: 'Cormen, Leiserson, Rivest & Stein',
      cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&auto=format&fit=crop&q=80',
      action: 'Returned the book',
      date: '28 Aug 2025',
      time: '02:40 PM',
      type: 'returned',
      badge: 'Returned',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      icon: CheckCircle2
    }
  ];

  const filterItem = (item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  };

  const filteredSep = historySeptember.filter(filterItem);
  const filteredAug = historyAugust.filter(filterItem);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Bar with BackButton & Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              History
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Track your library journey. Every book you borrow, return or renew.
            </div>
          </div>
        </div>

        {/* Year Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#334155'
          }}>
            <Calendar size={14} color="#64748b" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
            >
              <option value="2025">This Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs matching Screenshot 4 Top ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'borrowed', label: 'Borrowed' },
          { id: 'returned', label: 'Returned' },
          { id: 'renewed', label: 'Renewed' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'fines', label: 'Fines' }
        ].map(tab => {
          const active = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveFilter(tab.id); }}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                background: active ? '#0f172a' : '#ffffff',
                color: active ? '#ffffff' : '#64748b',
                border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 120ms',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Layout: Timeline (Left 70%) + Summary Sidebar (Right 30%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
        
        {/* ── Left Timeline ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* September 2025 Group */}
          {filteredSep.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12, letterSpacing: '0.2px' }}>
                September 2025
              </div>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                {filteredSep.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: idx < filteredSep.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 120ms'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Left Date & Timeline Node */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 70, textAlign: 'left' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{item.date.slice(0, 6)}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.date.slice(7)}</div>
                        </div>

                        {/* Node Icon */}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: item.badgeBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.badgeColor,
                          border: `1px solid ${item.badgeColor}30`,
                          flexShrink: 0
                        }}>
                          <Icon size={16} />
                        </div>

                        {/* Book Thumbnail */}
                        <div style={{ width: 38, height: 50, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                          <BookCover bookId={item.bookId} title={item.title} coverUrl={item.cover} />
                        </div>

                        {/* Book Info */}
                        <div>
                          <div 
                            onClick={() => { playClick(); onNavigate('catalog'); }}
                            style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>{item.author}</div>
                          <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3 }}>{item.action}</div>
                        </div>
                      </div>

                      {/* Right Status & Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: item.badgeColor,
                            background: item.badgeBg
                          }}>
                            {item.badge}
                          </span>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                            {item.time}
                          </div>
                        </div>

                        <button
                          onClick={() => { playClick(); toast.info(`Activity record for ${item.title} verified.`); }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* August 2025 Group */}
          {filteredAug.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12, letterSpacing: '0.2px' }}>
                August 2025
              </div>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                {filteredAug.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: idx < filteredAug.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 120ms'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Left Date & Timeline Node */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 70, textAlign: 'left' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{item.date.slice(0, 6)}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.date.slice(7)}</div>
                        </div>

                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: item.badgeBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.badgeColor,
                          border: `1px solid ${item.badgeColor}30`,
                          flexShrink: 0
                        }}>
                          <Icon size={16} />
                        </div>

                        <div style={{ width: 38, height: 50, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                          <BookCover bookId={item.bookId} title={item.title} coverUrl={item.cover} />
                        </div>

                        <div>
                          <div 
                            onClick={() => { playClick(); onNavigate('catalog'); }}
                            style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>{item.author}</div>
                          <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3 }}>{item.action}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: item.badgeColor,
                            background: item.badgeBg
                          }}>
                            {item.badge}
                          </span>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                            {item.time}
                          </div>
                        </div>

                        <button
                          onClick={() => { playClick(); toast.info(`Activity record for ${item.title} verified.`); }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Sidebar matching Screenshot 4 Top ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* History Summary Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>History Summary</div>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>This Year ▾</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                  <BookOpen size={16} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>12</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Books Borrowed</div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                  <CheckCircle2 size={16} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>11</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Books Returned</div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706' }}>
                  <RotateCcw size={16} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>3</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Times Renewed</div>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                  <Clock size={16} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>1</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Overdue</div>
              </div>
            </div>
          </div>

          {/* Top Categories Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Top Categories</div>
              <button 
                onClick={() => onNavigate('catalog')}
                style={{ background: 'none', border: 'none', fontSize: 11.5, color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                View Details →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Computer Science', count: 6, percent: 85, color: '#2563eb' },
                { name: 'Engineering', count: 3, percent: 55, color: '#3b82f6' },
                { name: 'Database', count: 2, percent: 35, color: '#0d9488' },
                { name: 'Algorithms', count: 2, percent: 35, color: '#6366f1' },
                { name: 'Others', count: 1, percent: 18, color: '#94a3b8' },
              ].map(cat => (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{cat.count}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${cat.percent}%`, height: '100%', background: cat.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Literary Quote Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              flexShrink: 0
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px 0', fontSize: 12.5, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
              </p>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>— Dr. Seuss</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
