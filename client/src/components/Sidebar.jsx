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
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick } from '../utils/audio';

// Navigation matching Screenshot 1, 2, 3, 4
const STUDENT_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Browse Books', icon: BookOpen },
  { id: 'scanner', label: 'QR Scanner & Passes', icon: QrCode },
  { id: 'borrowings', label: 'My Borrowings', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const LIBRARIAN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Browse Books', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'scanner', label: 'QR Scanner', icon: QrCode },
  { id: 'admin', label: 'Overdue', icon: ShieldAlert },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
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
    toast.success('Signed out successfully.');
  };

  return (
    <>
      {/* ── Desktop Editorial White Sidebar (Screenshots 1, 2, 3, 4) ── */}
      <aside style={{
        width: 240,
        minWidth: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#ffffff',
        borderRight: '1px solid #edebe6',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 50,
        boxShadow: '1px 0 3px rgba(0, 0, 0, 0.02)'
      }} className="desktop-only">
        
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
            background: '#ffffff',
            border: '1.5px solid #0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a'
          }}>
            <BookOpen size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 19,
              color: '#0f172a',
              letterSpacing: '-0.4px',
              lineHeight: 1.1
            }}>
              LibraX
            </div>
            <div style={{
              fontSize: 8.5,
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginTop: 2
            }}>
              SRM IST LIBRARY
            </div>
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
                  padding: '9px 14px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#475569',
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
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? '#1d4ed8' : '#64748b'} />
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

        {/* Sidebar Photo Banner Card matching Screenshot 1, 2, 3, 4 */}
        <div style={{
          marginTop: 12,
          marginBottom: 12,
          position: 'relative',
          borderRadius: 10,
          overflow: 'hidden',
          height: 150,
          border: '1px solid #edebe6',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <img 
            src="/hero_library.jpg" 
            alt="SRM Library" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Subtle Top & Bottom Gradient Overlays */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.4) 40%, rgba(15,23,42,0.85) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px 12px'
          }}>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 13,
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.2
              }}>
                Good Books<br />Better People
              </div>
              <div style={{ width: 24, height: 1.5, background: '#0f172a', marginTop: 4 }} />
            </div>
            <div style={{
              fontSize: 9,
              color: '#ffffff',
              fontWeight: 600,
              letterSpacing: '0.3px',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}>
              Learn · Belong · Grow<br />at SRM IST
            </div>
          </div>
        </div>

        {/* Bottom Log Out Section */}
        <div style={{ paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
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
              color: '#64748b',
              background: 'transparent',
              transition: 'all 120ms ease-out',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#64748b';
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
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #edebe6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.04)'
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
