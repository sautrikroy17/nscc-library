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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick } from '../utils/audio';

const STUDENT_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Browse Books', icon: BookOpen },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'borrowings', label: 'My Borrowings', icon: Bookmark },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell, hasDot: true },
  { id: 'study', label: 'Study Haven', icon: Headphones },
  { id: 'ai', label: 'Alexandria AI', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const LIBRARIAN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Books', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'scanner', label: 'QR Scanner', icon: QrCode },
  { id: 'admin', label: 'Overdue', icon: ShieldAlert },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'study', label: 'Study Haven', icon: Headphones },
  { id: 'ai', label: 'Alexandria AI', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, overdueCount = 0 }) {
  const { user, logout } = useAuth();
  const navList = user?.role === 'librarian' ? LIBRARIAN_NAV : STUDENT_NAV;

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
      {/* ── Desktop Obsidian Sidebar (Screen 2 / Screen 3 Layout) ── */}
      <aside style={{
        width: 240,
        minWidth: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#0a0f1d',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 50
      }} className="desktop-only">
        {/* Brand Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <BookOpen size={18} />
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: '#ffffff',
            letterSpacing: '-0.3px'
          }}>
            LibraX
          </span>
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
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#10b981' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  transition: 'all 150ms',
                  textAlign: 'left',
                  boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={17} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.hasDot && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#ffffff' : '#10b981' }} />
                )}
                {item.id === 'admin' && overdueCount > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: '#f43f5e',
                    color: '#ffffff'
                  }}>
                    {overdueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Log Out Section */}
        <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              background: 'transparent',
              transition: 'all 150ms',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f43f5e';
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={17} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Glass Navigation Dock ── */}
      <nav className="mobile-dock mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(8, 12, 20, 0.94)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100
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
                color: isActive ? '#10b981' : '#94a3b8',
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
