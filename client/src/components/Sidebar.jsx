import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['librarian', 'student'] },
  { id: 'catalog', label: 'Books', icon: '📚', roles: ['librarian', 'student'] },
  { id: 'scanner', label: 'QR Scanner', icon: '📷', roles: ['librarian'] },
  { id: 'transactions', label: 'Transactions', icon: '🔄', roles: ['librarian', 'student'] },
  { id: 'admin', label: 'Admin Panel', icon: '⚙️', roles: ['librarian'] },
  { id: 'ai', label: 'AI Assistant', icon: '🤖', roles: ['librarian', 'student'] },
];

export default function Sidebar({ activePage, setActivePage, overdueCount = 0 }) {
  const { user, logout } = useAuth();

  const items = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar desktop-only">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📚</div>
          <div className="sidebar-logo-text">
            <span>LibraX</span>
            <span>NSCC · SRM IST</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              {item.id === 'transactions' && overdueCount > 0 && (
                <span className="nav-badge warning">{overdueCount}</span>
              )}
              {item.id === 'scanner' && (
                <span className="nav-badge info">LIVE</span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className={`user-avatar ${user?.role}`}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-info">
            <div className="user-info-name">{user?.name}</div>
            <div className="user-info-role">{user?.role} • {user?.department || 'SRM IST'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-3)',
              transition: 'all 200ms',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: 16,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-soft)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ── Mobile Topbar ── */}
      <div className="mobile-topbar mobile-only">
        <div className="mobile-topbar-logo">
          <div className="mobile-topbar-logo-icon">📚</div>
          <span className="mobile-topbar-title">LibraX</span>
        </div>
        <div className="mobile-topbar-right">
          {overdueCount > 0 && (
            <span className="nav-badge warning overdue-blink">{overdueCount} overdue</span>
          )}
          <button
            onClick={handleLogout}
            style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
            title="Logout"
          >🚪</button>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav mobile-only">
        {items.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="bottom-nav-icon" style={{ fontSize: 18 }}>{item.icon}</span>
            <span className="bottom-nav-label">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
