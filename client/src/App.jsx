import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Clock, 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  Sparkles,
  Radio
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
import BrandLogo from './components/BrandLogo';
import { isSoundEnabled, toggleSound, playClick } from './utils/audio';

const PAGE_METADATA = {
  dashboard:    { title: 'Operational Command Dashboard', subtitle: 'Live telemetry, book circulation metrics, and overdue tracking' },
  catalog:      { title: 'Central Book Repository', subtitle: 'Browse, search, generate QR codes, and manage library inventory' },
  scanner:      { title: 'Live QR Vision Scanner', subtitle: 'Hardware camera feed with laser reticle for instant checkout & return' },
  transactions: { title: 'Circulation Ledger', subtitle: 'Auditable record of all book loans, returns, and penalty calculations' },
  admin:        { title: 'Administrative Control Hub', subtitle: 'Overdue resolution, fine collection, rapid checkout, and ledger export' },
  ai:           { title: 'Alexandria Neural AI', subtitle: 'Conversational assistant, natural language search, and book recommendations' },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
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
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      <BrandLogo size={64} animated />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: '-0.5px',
          color: 'var(--text)',
          marginBottom: 4,
          background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          LibraX Command Node
        </div>
        <div style={{ fontSize: 13, color: 'var(--accent-bright)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Newton School Coding Club · SRM IST
        </div>
      </motion.div>

      <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }} />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [overdueCount, setOverdueCount] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [timeStr, setTimeStr] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch overdue count
  useEffect(() => {
    if (!user) return;
    const fetchOverdue = () => {
      statsApi.get()
        .then(d => setOverdueCount(d?.overview?.overdue_count || 0))
        .catch(() => {});
    };
    fetchOverdue();
    const interval = setInterval(fetchOverdue, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Guard: non-librarians
  useEffect(() => {
    if (user?.role === 'student' && ['scanner', 'admin'].includes(activePage)) {
      setActivePage('catalog');
    }
  }, [activePage, user]);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  const pageMeta = PAGE_METADATA[activePage] || { title: 'LibraX System', subtitle: 'Library Management System' };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNavigate={setActivePage} />;
      case 'catalog':      return <Catalog />;
      case 'scanner':      return user.role === 'librarian' ? <Scanner /> : <Catalog />;
      case 'transactions': return <Transactions />;
      case 'admin':        return user.role === 'librarian' ? <AdminPanel /> : <Catalog />;
      case 'ai':           return <AIAssistant />;
      default:             return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        overdueCount={overdueCount}
      />

      <main className="main-content">
        {/* Desktop High-Tech Topbar HUD */}
        <header className="topbar desktop-only" style={{
          height: 64,
          padding: '0 28px',
          background: 'rgba(8, 12, 20, 0.82)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          {/* Breadcrumb / Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                fontWeight: 800, 
                fontSize: 16, 
                color: 'var(--text)',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}>
                {pageMeta.title}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 500 }}>
                {pageMeta.subtitle}
              </div>
            </div>
          </div>

          {/* Right Action & Telemetry HUD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Quick Find Button */}
            <button
              onClick={() => { playClick(); setActivePage('catalog'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-3)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
            >
              <Search size={13} />
              <span>Search Books</span>
              <span style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: 10, 
                background: 'rgba(255,255,255,0.06)', 
                padding: '1px 5px', 
                borderRadius: 4,
                color: 'var(--text-3)' 
              }}>⌘K</span>
            </button>

            {/* Overdue Alert Button */}
            {overdueCount > 0 && user.role === 'librarian' && (
              <motion.button
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                onClick={() => { playClick(); setActivePage('admin'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--danger)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={13} className="overdue-blink" />
                <span>{overdueCount} Overdue</span>
              </motion.button>
            )}

            {/* Live IST Clock */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11.5,
              color: 'var(--text-2)'
            }}>
              <Clock size={12} color="var(--accent-bright)" />
              <span>{timeStr} IST</span>
            </div>

            {/* Audio Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Mute Interface Audio' : 'Enable Interface Audio'}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: soundOn ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${soundOn ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                color: soundOn ? 'var(--accent-bright)' : 'var(--text-4)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* User Session Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 20,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: user.role === 'librarian' ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'linear-gradient(135deg,#10b981,#0891b2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 900,
                color: 'white',
              }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
                {user.name?.split(' ')[0]}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                background: user.role === 'librarian' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                color: user.role === 'librarian' ? '#c4b5fd' : 'var(--accent-bright)',
                textTransform: 'uppercase'
              }}>
                {user.role}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <AnimatePresence mode="wait">
          <PageWrapper key={activePage}>
            {renderPage()}
          </PageWrapper>
        </AnimatePresence>
      </main>
    </div>
  );
}
