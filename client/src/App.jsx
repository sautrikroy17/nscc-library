import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const PAGE_TITLES = {
  dashboard:    '📊 Dashboard',
  catalog:      '📚 Book Catalog',
  scanner:      '📷 QR Scanner',
  transactions: '🔄 Transactions',
  admin:        '⚙️ Admin Panel',
  ai:           '🤖 AI Assistant',
};

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
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
    }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        style={{
          width: 72,
          height: 72,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 40px rgba(16,185,129,0.4)',
        }}
        className="glow-pulse"
      >
        📚
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 6,
        }}>
          NSCC Library
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Initializing...</div>
      </motion.div>
      <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }} />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [overdueCount, setOverdueCount] = useState(0);

  // Fetch overdue count for badge
  useEffect(() => {
    if (!user) return;
    const fetchOverdue = () => {
      statsApi.get()
        .then(d => setOverdueCount(d?.overview?.overdue_count || 0))
        .catch(() => {});
    };
    fetchOverdue();
    const interval = setInterval(fetchOverdue, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [user]);

  // Guard: non-librarians can't access librarian-only pages
  useEffect(() => {
    if (user?.role === 'student' && ['scanner', 'admin'].includes(activePage)) {
      setActivePage('catalog');
    }
  }, [activePage, user]);

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard />;
      case 'catalog':      return <Catalog />;
      case 'scanner':      return user.role === 'librarian' ? <Scanner /> : <Catalog />;
      case 'transactions': return <Transactions />;
      case 'admin':        return user.role === 'librarian' ? <AdminPanel /> : <Catalog />;
      case 'ai':           return <AIAssistant />;
      default:             return <Dashboard />;
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
        {/* Desktop topbar */}
        <div className="topbar desktop-only">
          <div className="topbar-title">{PAGE_TITLES[activePage] || 'NSCC Library'}</div>
          <div className="topbar-right">
            {overdueCount > 0 && (
              <motion.button
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => setActivePage('admin')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 20,
                  background: 'var(--danger-soft)', border: '1px solid rgba(244,63,94,0.25)',
                  color: 'var(--danger)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <span className="overdue-blink">⚠️</span>
                {overdueCount} overdue {overdueCount === 1 ? 'book' : 'books'}
              </motion.button>
            )}
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
              padding: '6px 14px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: user.role === 'librarian' ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'linear-gradient(135deg,#10b981,#06b6d4)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: 'white',
              }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
              {user.name?.split(' ')[0]}
              <span style={{ color: 'var(--text-4)', fontSize: 11 }}>· {user.role}</span>
            </div>
          </div>
        </div>

        {/* Page content with animation */}
        <AnimatePresence mode="wait">
          <PageWrapper key={activePage}>
            {renderPage()}
          </PageWrapper>
        </AnimatePresence>
      </main>
    </div>
  );
}
