import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Clock, 
  Search, 
  Bell,
  BookOpen,
  X,
  QrCode
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
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
import { isSoundEnabled, toggleSound, playClick } from './utils/audio';

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
  const [activePage, setActivePage] = useState('dashboard');
  const [overdueCount, setOverdueCount] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch overdue count for librarians
  useEffect(() => {
    if (!user) return;
    statsApi.get()
      .then(d => setOverdueCount(d?.overview?.overdue_count || 0))
      .catch(() => {});
  }, [user]);

  // Handle keyboard shortcut CMD+K or CTRL+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActivePage('catalog');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  const isStudent = user.role === 'student';
  const profileName = isStudent ? 'Sautrik Roy' : (user.name || 'Librarian (LIB-SRM-042)');
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Left Sidebar matching Mockup ── */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        overdueCount={overdueCount}
      />

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#f8fafc' }}>
        {/* ── Top Bar matching Mockup ── */}
        <header style={{
          height: 64,
          padding: '0 32px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }} className="desktop-only">
          {/* Center Search Input (Mockup Panels 3–15) */}
          <div
            onClick={() => { playClick(); setActivePage('catalog'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '8px 14px',
              width: 420,
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (activePage !== 'catalog' && activePage !== 'search') {
                  setActivePage('catalog');
                }
              }}
              placeholder="Search books, authors, ISBN..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#0f172a',
                fontSize: 13,
                flex: 1
              }}
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                title="Clear Search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Profile & Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Notification Bell */}
            <button
              onClick={() => { playClick(); setShowNotifications(!showNotifications); }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
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
                border: '1.5px solid #ffffff'
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
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img
                src={isStudent ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt="Avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #e2e8f0'
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {profileName}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.1 }}>
                  {profileRole}
                </div>
              </div>
            </div>
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
