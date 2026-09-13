import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Search, 
  Bookmark, 
  Clock, 
  Heart, 
  Bell, 
  Settings, 
  LogOut,
  QrCode,
  ArrowLeftRight,
  Users,
  ShieldAlert,
  FileSpreadsheet,
  Headphones,
  Sparkles,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { toast } from '../context/ToastContext';
import { playClick } from '../utils/audio';

const STUDENT_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Browse Books', icon: BookOpen },
  { id: 'borrowings', label: 'My Borrowings', icon: FileText },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { id: 'scanner', label: 'Scan QR (Issue Book)', icon: QrCode },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const LIBRARIAN_NAV = [
  { id: 'dashboard', label: 'Librarian Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Books', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'admin', label: 'Overdue', icon: ShieldAlert, badge: '12' },
  { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
  { id: 'scanner', label: 'Scan QR (Issue/Return)', icon: QrCode },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, overdueCount = 0 }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useLibrary();
  const navList = user?.role === 'librarian' ? LIBRARIAN_NAV : STUDENT_NAV;
  const isDark = theme === 'dark';

  const handleNav = (id) => {
    playClick();
    setActivePage(id);
  };

  const handleLogout = () => {
    playClick();
    logout();
    toast.success('Signed out successfully.');
  };

  return (
    <>
      {/* ── Desktop Editorial Sidebar ── */}
      <aside style={{
        width: 240,
        minWidth: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: isDark ? '#0d1527' : '#ffffff',
        borderRight: isDark ? '1px solid #1e293b' : '1px solid #edebe6',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 50,
        boxShadow: isDark ? '1px 0 10px rgba(0, 0, 0, 0.3)' : '1px 0 3px rgba(0, 0, 0, 0.02)',
        transition: 'background 200ms ease, border-color 200ms ease'
      }} className="desktop-only app-sidebar">
        
        {/* Brand Logo Header matching Screenshot 1 */}
        <div 
          onClick={() => handleNav('dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '0 8px', 
            marginBottom: 26,
            cursor: 'pointer' 
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: isDark ? '#162035' : '#ffffff',
            border: isDark ? '1.5px solid #27354f' : '1.5px solid #0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#f8fafc' : '#0f172a'
          }}>
            <BookOpen size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: isDark ? '#f8fafc' : '#0f172a',
              letterSpacing: '-0.3px',
              lineHeight: 1.15
            }}>
              LibraX
            </div>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: isDark ? '#94a3b8' : '#94a3b8',
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              SRM CENTRAL LIBRARY
            </div>
            {user?.role === 'librarian' && (
              <div style={{
                display: 'inline-block',
                fontSize: 9.5,
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: 5,
                padding: '1px 6px',
                marginTop: 4
              }}>
                Librarian Portal
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items List */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navList.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#111827' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  transition: 'all 120ms ease-out',
                  textAlign: 'left'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? '#ffffff' : '#64748b'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                
                {item.badge && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: '#ef4444',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}

                {item.id === 'admin' && overdueCount > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: '#ef4444',
                    color: '#ffffff'
                  }}>
                    {overdueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* SRM IST Campus Quote Card matching exact screenshot */}
        <div style={{
          marginTop: 'auto',
          marginBottom: 10,
          padding: '10px',
          borderRadius: 12,
          background: isDark ? '#111928' : '#f8fafc',
          border: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: 7
        }}>
          <img
            src="/srm_campus_sidebar.jpg"
            alt="SRM IST Campus"
            style={{
              width: '100%',
              height: 70,
              borderRadius: 8,
              objectFit: 'cover',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'
            }}
          />
          <div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 12,
              fontStyle: 'italic',
              fontWeight: 600,
              color: isDark ? '#cbd5e1' : '#334155',
              lineHeight: 1.25
            }}>
              Knowledge Enables Better Futures
            </div>
            <div style={{
              fontSize: 8.5,
              fontWeight: 700,
              color: isDark ? '#94a3b8' : '#94a3b8',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginTop: 2
            }}>
              SRM INSTITUTE OF SCIENCE AND TECHNOLOGY
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <div style={{ padding: '6px 0', borderTop: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              cursor: 'pointer',
              color: isDark ? '#fbbf24' : '#475569',
              background: isDark ? '#162035' : '#f8fafc',
              transition: 'all 120ms ease-out',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = isDark ? '#f59e0b' : '#cbd5e1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span style={{ flex: 1 }}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 4,
              background: isDark ? '#1e293b' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              color: isDark ? '#fbbf24' : '#0f172a'
            }}>
              {isDark ? 'DARK' : 'LIGHT'}
            </span>
          </button>
        </div>

        {/* Bottom Log Out Section */}
        <div style={{ paddingTop: 4 }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#94a3b8' : '#64748b',
              background: 'transparent',
              transition: 'all 120ms ease-out',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Navigation Dock ── */}
      <nav className="mobile-dock mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: isDark ? 'rgba(13, 21, 39, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: isDark ? '1px solid #1e293b' : '1px solid #edebe6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        boxShadow: isDark ? '0 -2px 10px rgba(0,0,0,0.4)' : '0 -2px 10px rgba(0,0,0,0.04)'
      }}>
        {navList.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: isActive ? '#1d4ed8' : '#64748b',
                fontSize: 10,
                fontWeight: isActive ? 700 : 500
              }}
            >
              <Icon size={18} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
