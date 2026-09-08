import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  ArrowLeftRight, 
  ShieldCheck, 
  Sparkles, 
  LogOut,
  Radio,
  Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import BrandLogo from './BrandLogo';
import { playClick } from '../utils/audio';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['librarian', 'student'] },
  { id: 'catalog', label: 'Catalog', icon: BookOpen, roles: ['librarian', 'student'] },
  { id: 'study', label: 'Study Haven', icon: Headphones, roles: ['librarian', 'student'], badge: 'FOCUS' },
  { id: 'scanner', label: 'QR Scanner', icon: QrCode, roles: ['librarian'], badge: 'LIVE' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, roles: ['librarian', 'student'] },
  { id: 'admin', label: 'Admin Hub', icon: ShieldCheck, roles: ['librarian'] },
  { id: 'ai', label: 'Alexandria AI', icon: Sparkles, roles: ['librarian', 'student'], badge: 'GPT' },
];

export default function Sidebar({ activePage, setActivePage, overdueCount = 0 }) {
  const { user, logout } = useAuth();

  const items = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  const handleNav = (id) => {
    playClick();
    setActivePage(id);
  };

  const handleLogout = () => {
    playClick();
    logout();
    toast.success('Session terminated securely.');
  };

  return (
    <>
      {/* ── Desktop Obsidian Sidebar ── */}
      <aside className="sidebar desktop-only">
        {/* Brand Header */}
        <div className="sidebar-logo">
          <BrandLogo size={36} animated />
          <div className="sidebar-logo-text">
            <span style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              fontWeight: 900, 
              fontSize: 18, 
              letterSpacing: '-0.4px',
              background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              LibraX
            </span>
            <span style={{ 
              fontSize: 10, 
              fontWeight: 700, 
              color: 'var(--accent-bright)', 
              letterSpacing: '0.8px', 
              textTransform: 'uppercase' 
            }}>
              NSCC · SRM IST
            </span>
          </div>
        </div>

        {/* System Node Telemetry */}
        <div style={{
          margin: '0 12px 14px',
          padding: '8px 12px',
          borderRadius: 10,
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-2)'
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent)'
          }} className="glow-pulse" />
          <span style={{ letterSpacing: '0.4px', textTransform: 'uppercase', fontSize: 10 }}>
            NODE 01 · ONLINE
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management System</div>
          {items.map((item, i) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  color: isActive ? '#ffffff' : 'var(--text-3)',
                  background: isActive ? 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.05) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
                  marginBottom: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 3.5,
                      borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(180deg, var(--accent), var(--cyan))',
                      boxShadow: '0 0 10px var(--accent)',
                    }}
                  />
                )}

                <Icon 
                  size={18} 
                  color={isActive ? 'var(--accent-bright)' : 'currentColor'} 
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                
                <span style={{ 
                  fontWeight: isActive ? 700 : 500, 
                  fontSize: 13.5, 
                  letterSpacing: '-0.1px',
                  flex: 1 
                }}>
                  {item.label}
                </span>

                {item.id === 'transactions' && overdueCount > 0 && (
                  <span className="nav-badge warning">{overdueCount}</span>
                )}
                {item.badge && (
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: item.badge === 'LIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.15)',
                    color: item.badge === 'LIVE' ? 'var(--accent-bright)' : 'var(--cyan-bright)',
                    border: `1px solid ${item.badge === 'LIVE' ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.3)'}`,
                    letterSpacing: '0.5px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="sidebar-user" style={{
          marginTop: 'auto',
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div className={`user-avatar ${user?.role}`} style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: user?.role === 'librarian' 
              ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' 
              : 'linear-gradient(135deg, #10b981, #0891b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 14,
            color: '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 13, 
              color: 'var(--text)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {user?.name}
            </div>
            <div style={{ 
              fontSize: 11, 
              color: 'var(--text-3)', 
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>{user?.role}</span>
              <span>•</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                {user?.reg_number || 'SRM'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Terminate Session"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-3)',
              transition: 'all 200ms',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'var(--danger-soft)'; 
              e.currentTarget.style.color = 'var(--danger)'; 
              e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; 
              e.currentTarget.style.color = 'var(--text-3)'; 
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Mobile Sticky Topbar ── */}
      <div className="mobile-topbar mobile-only">
        <div className="mobile-topbar-logo">
          <BrandLogo size={28} animated={false} />
          <span className="mobile-topbar-title">LibraX</span>
        </div>
        <div className="mobile-topbar-right">
          {overdueCount > 0 && (
            <span className="nav-badge warning overdue-blink">{overdueCount} overdue</span>
          )}
          <button
            onClick={handleLogout}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-3)', 
              padding: 6, 
              display: 'flex',
              cursor: 'pointer' 
            }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Dock ── */}
      <nav className="bottom-nav mobile-only">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <Icon size={18} color={isActive ? 'var(--accent)' : 'currentColor'} />
              <span className="bottom-nav-label">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
