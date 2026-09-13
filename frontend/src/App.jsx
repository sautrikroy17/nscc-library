import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Volume1,
  Clock, 
  Search, 
  Bell,
  BookOpen, 
  X, 
  QrCode, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useLibrary } from './context/LibraryContext';
import { toast } from './context/ToastContext';
import { stats as statsApi } from './api';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Scanner from './pages/Scanner';
import Transactions from './pages/Transactions';
import AdminPanel from './pages/AdminPanel';
import AIAssistant from './pages/AIAssistant';
import StudyRoom from './pages/StudyRoom';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { isSoundEnabled, getSoundLevel, cycleSoundLevel, toggleSound, playClick } from './utils/audio';

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#10b981'
      }}>
        <BookOpen size={24} />
      </div>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: 20,
        color: '#ffffff'
      }}>
        LibraX
      </div>
      <div className="spinner spinner-sm" style={{ borderTopColor: '#10b981' }} />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useLibrary();
  const [activePage, setActivePage] = useState('dashboard');
  const [overdueCount, setOverdueCount] = useState(0);
  const [soundLevel, setSoundLevelState] = useState(getSoundLevel()); // 0 = Off, 1 = Soft, 2 = Normal
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch overdue count for librarians
  useEffect(() => {
    if (!user) return;
    statsApi.get()
      .then(d => setOverdueCount(d?.overview?.overdue_count || 0))
      .catch(() => {});
  }, [user]);

  // Handle keyboard shortcuts (CMD+K for catalog search, CMD+D for theme toggle, CMD+M for sound level)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActivePage('catalog');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleCycleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  const handleCycleSound = () => {
    const next = cycleSoundLevel();
    setSoundLevelState(next);
    if (next === 0) toast.info('Audio muted (Level 0: Off) 🔇');
    else if (next === 1) toast.info('Audio set to Soft / Ambient (Level 1) 🔉');
    else toast.success('Audio set to Normal / Full (Level 2) 🔊');
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  const isStudent = user.role === 'student';
  const profileName = isStudent ? 'Sautrik Roy' : (user.name || 'Dr. Rajesh Kumar');
  const profileRole = isStudent ? 'RA2511003010052 · 2nd Year CSE' : 'Librarian · Central Library';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':     return <Dashboard onNavigate={setActivePage} />;
      case 'catalog':      
      case 'search':        return (
        <Catalog 
          onNavigate={setActivePage} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          initialTab="all" 
        />
      );
      case 'borrowings':    return (
        <Catalog 
          onNavigate={setActivePage} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          initialTab="borrowings" 
        />
      );
      case 'wishlist':      return (
        <Catalog 
          onNavigate={setActivePage} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          initialTab="wishlist" 
        />
      );
      case 'history':       return <History onNavigate={setActivePage} />;
      case 'notifications': return <Notifications onNavigate={setActivePage} />;
      case 'scanner':       return <Scanner onNavigate={setActivePage} />;
      case 'transactions':  return <Transactions onNavigate={setActivePage} />;
      case 'students':      return <AdminPanel defaultTab="students" onNavigate={setActivePage} />;
      case 'admin':         return <AdminPanel defaultTab="overdue" onNavigate={setActivePage} />;
      case 'reports':       return <AdminPanel defaultTab="reports" onNavigate={setActivePage} />;
      case 'study':         return <StudyRoom onNavigate={setActivePage} />;
      case 'ai':            return <AIAssistant onNavigate={setActivePage} />;
      case 'settings':      return isStudent ? <Settings onNavigate={setActivePage} /> : <AdminPanel defaultTab="settings" onNavigate={setActivePage} />;
      default:              return <Dashboard onNavigate={setActivePage} />;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className={`app-shell ${isDark ? 'dark-theme' : ''}`}
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        background: isDark ? '#090d16' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a'
      }}
    >
      {/* ── Left Sidebar matching Mockup ── */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        overdueCount={overdueCount}
      />

      {/* ── Main Content Area ── */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0, 
        background: isDark ? '#090d16' : '#f8fafc' 
      }}>
        {/* ── Top Bar matching Mockup ── */}
        <header style={{
          height: 64,
          padding: '0 32px',
          background: isDark ? '#0d1527' : '#ffffff',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          transition: 'background 200ms ease, border-color 200ms ease'
        }} className="desktop-only top-header">
          {/* Center Search Input (Mockup Panels 3–15) */}
          <div
            onClick={() => { playClick(); setActivePage('catalog'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: isDark ? '#162035' : '#f8fafc',
              border: isDark ? '1px solid #27354f' : '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '8px 14px',
              width: 440,
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = isDark ? '#3b82f6' : '#cbd5e1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? '#27354f' : '#e2e8f0'}
          >
            <Search size={16} color={isDark ? '#94a3b8' : '#94a3b8'} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (activePage !== 'catalog' && activePage !== 'search') {
                  setActivePage('catalog');
                }
              }}
              placeholder={isStudent ? "Search books, authors, ISBN..." : "Search books, students (name/roll no.), ISBN, etc..."}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: 13,
                flex: 1
              }}
            />
            {searchQuery ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                title="Clear Search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#cbd5e1' : '#94a3b8',
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ✕
              </button>
            ) : (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? '#94a3b8' : '#94a3b8',
                background: isDark ? '#1e293b' : '#ffffff',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: 4,
                padding: '1px 5px',
                lineHeight: 1.2
              }}>
                ⌘ K
              </span>
            )}
          </div>

          {/* Right Profile, Notifications, Theme Switcher & DateTime */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (⌘D)`}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                color: isDark ? '#fbbf24' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 150ms ease-out',
                boxShadow: isDark ? '0 0 12px rgba(251, 191, 36, 0.25)' : 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.borderColor = isDark ? '#f59e0b' : '#94a3b8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
              }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={16} />}
            </button>

            {/* Sound Volume & Mute Toggle Button (3 Levels: Mute / Soft / Full, ⌘M) */}
            <button
              onClick={handleCycleSound}
              title={`Audio: ${soundLevel === 0 ? 'Muted (Click to switch on)' : soundLevel === 1 ? 'Soft Ambient (Click for Full)' : 'Full Crystal (Click to Mute)'} (⌘M)`}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                color: soundLevel === 0 ? '#94a3b8' : soundLevel === 1 ? '#38bdf8' : (isDark ? '#34d399' : '#10b981'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 150ms ease-out'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#94a3b8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
              }}
            >
              {soundLevel === 0 ? (
                <VolumeX size={16} />
              ) : soundLevel === 1 ? (
                <Volume1 size={16} />
              ) : (
                <Volume2 size={16} />
              )}
              {/* Level indicator dot */}
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontSize: 8.5,
                fontWeight: 800,
                lineHeight: 1,
                padding: '1px 3px',
                borderRadius: 999,
                background: soundLevel === 0 ? '#ef4444' : soundLevel === 1 ? '#0284c7' : '#10b981',
                color: '#ffffff'
              }}>
                {soundLevel === 0 ? '0' : soundLevel === 1 ? '1' : '2'}
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => { playClick(); setShowNotifications(!showNotifications); }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isDark ? '#162035' : '#f8fafc',
                border: isDark ? '1px solid #27354f' : '1px solid #e2e8f0',
                color: isDark ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#ef4444',
                border: `1.5px solid ${isDark ? '#0d1527' : '#ffffff'}`
              }} />
            </button>

            {/* User Profile Pill matching Mockup */}
            <div 
              onClick={() => { playClick(); setActivePage('settings'); }}
              title="View Profile & Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                transition: 'background 120ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? '#162035' : '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img
                src={isStudent ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                alt="Avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isDark ? '1.5px solid #334155' : '1.5px solid #e2e8f0'
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.2 }}>
                  {profileName}
                </div>
                <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.1 }}>
                  {profileRole}
                </div>
              </div>
            </div>

            {/* Live Clock / Calendar Badge for Librarian Portal */}
            {!isStudent && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'right',
                borderLeft: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                paddingLeft: 14,
                lineHeight: 1.2
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Sun, 13 Sep 2025</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>03:18 PM</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main style={{ flex: 1, padding: '24px 32px' }}>
          <AnimatePresence mode="wait">
            <PageWrapper key={activePage}>
              {renderPage()}
            </PageWrapper>
          </AnimatePresence>
        </main>
      </div>

      {/* Notifications Drawer/Modal */}
      {showNotifications && (
        <div style={{
          position: 'fixed',
          top: 76,
          right: 32,
          width: 320,
          background: '#0d1527',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 14,
          padding: '16px 18px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Notifications</span>
            <button onClick={() => setShowNotifications(false)} style={{ color: '#64748b', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontWeight: 600, color: '#10b981' }}>Clean Code loan active</div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Due in 4 days (12 Sep 2026)</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>New arrival in catalog</div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>System Design Interview (Alex Xu) in stock</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
