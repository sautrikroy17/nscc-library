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
  const profileName = user.name || (isStudent ? 'Sautrik Roy' : 'Dr. Rajesh Kumar');
  const profileRole = isStudent ? `${user.reg_number || 'RA2511003010052'} · 2nd Year CSE` : 'Librarian';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNavigate={setActivePage} />;
      case 'catalog':      
      case 'search':       
      case 'wishlist':     return (
        <Catalog 
          onNavigate={setActivePage} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          initialTab={activePage} 
        />
      );
      case 'borrowings':   return <Dashboard onNavigate={setActivePage} />;
      case 'scanner':      return <Scanner />;
      case 'history':      
      case 'transactions': return <Transactions />;
      case 'students':     return <AdminPanel defaultTab="students" />;
      case 'admin':        return <AdminPanel defaultTab="overdue" />;
      case 'reports':      return <AdminPanel defaultTab="reports" />;
      case 'study':        return <StudyRoom />;
      case 'ai':           return <AIAssistant />;
      case 'settings':     return <AdminPanel defaultTab="settings" />;
      default:             return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080c14' }}>
      {/* ── Left Sidebar matching Mockup ── */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        overdueCount={overdueCount}
      />

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ── Top Bar matching Mockup Screens 2 & 3 ── */}
        <header style={{
          height: 68,
          padding: '0 32px',
          background: 'rgba(10, 15, 29, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }} className="desktop-only">
          {/* Left Brand Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <BookOpen size={16} />
            </div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: '#ffffff'
            }}>
              LibraX
            </span>
          </div>

          {/* Center Search Input with ⌘ K badge (Screen 2 / Screen 3 exact component) */}
          <div
            onClick={() => { playClick(); setActivePage('catalog'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(15, 22, 38, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              padding: '8px 14px',
              width: 360,
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
          >
            <Search size={15} color="#64748b" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (activePage !== 'catalog' && activePage !== 'search') {
                  setActivePage('catalog');
                }
              }}
              placeholder="Search books, authors, ISBN, Harry Potter..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: 12.5,
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
            ) : (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#94a3b8',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                ⌘ K
              </span>
            )}
          </div>

          {/* Dedicated QR Scanner Quick Action */}
          <button
            onClick={() => { playClick(); setActivePage('scanner'); }}
            title="Open QR Scanner & Digital Student Pass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 14px',
              borderRadius: 8,
              background: activePage === 'scanner' ? '#10b981' : 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: activePage === 'scanner' ? '#080c14' : '#10b981',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              transition: 'all 150ms',
              boxShadow: activePage === 'scanner' ? '0 0 16px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(16, 185, 129, 0.15)'
            }}
          >
            <QrCode size={15} strokeWidth={2.5} />
            <span>QR Scanner</span>
          </button>

          {/* Right User Profile Pill & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Mute Interface Soundscapes' : 'Unmute Interface Soundscapes'}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: soundOn ? '#10b981' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => { playClick(); setShowNotifications(!showNotifications); }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={15} />
              <span style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981'
              }} />
            </button>

            {/* User Profile Pill matching Screens 2 & 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 10px 4px 6px',
              borderRadius: 20,
              background: 'rgba(15, 22, 38, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isStudent ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 12,
                color: '#ffffff'
              }}>
                {profileName.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {profileName}
                </div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.1 }}>
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
