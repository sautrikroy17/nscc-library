import { useState } from 'react';
import { 
  Bell, 
  Check, 
  Settings as SettingsIcon, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Info, 
  ChevronRight, 
  AlertTriangle,
  Calendar,
  ExternalLink
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { playClick, playSuccessChime } from '../utils/audio';
import { toast } from '../context/ToastContext';

export default function Notifications({ onNavigate = () => {} }) {
  const [activeTab, setActiveTab] = useState('all');
  const [unreadIds, setUnreadIds] = useState(['n1', 'n2']);

  const notificationsList = [
    {
      id: 'n1',
      category: 'due',
      type: 'Book Due Soon',
      text: '"Clean Code" by Robert C. Martin is due in 2 days (15 Sep 2025).',
      time: '2 hours ago',
      icon: Clock,
      iconColor: '#ef4444',
      iconBg: '#fef2f2',
      actionLabel: 'View Book',
      actionTarget: 'borrowings'
    },
    {
      id: 'n2',
      category: 'announcements',
      type: 'New Arrivals',
      text: '24 new Computer Science books have been added to the library.',
      time: '1 day ago',
      icon: BookOpen,
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
      actionLabel: 'Explore',
      actionTarget: 'catalog'
    },
    {
      id: 'n3',
      category: 'account',
      type: 'Book Returned',
      text: 'You have successfully returned "Introduction to Algorithms".',
      time: '2 days ago',
      icon: CheckCircle2,
      iconColor: '#059669',
      iconBg: '#ecfdf5',
      actionLabel: 'View History',
      actionTarget: 'history'
    },
    {
      id: 'n4',
      category: 'recommendations',
      type: 'Recommended for You',
      text: 'Based on your interest in Operating Systems, check out "Modern Operating Systems".',
      time: '3 days ago',
      icon: Sparkles,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
      actionLabel: 'View Book',
      actionTarget: 'catalog'
    },
    {
      id: 'n5',
      category: 'account',
      type: 'Account Update',
      text: 'Your profile information has been updated successfully.',
      time: '5 days ago',
      icon: User,
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
      actionLabel: 'View Profile',
      actionTarget: 'settings'
    },
    {
      id: 'n6',
      category: 'announcements',
      type: 'Library Maintenance',
      text: 'The library will remain closed on 20 Sep 2025 (Saturday) for maintenance.',
      time: '1 week ago',
      icon: Info,
      iconColor: '#64748b',
      iconBg: '#f1f5f9',
      actionLabel: 'View Details',
      actionTarget: 'modal'
    }
  ];

  const filteredNotifications = notificationsList.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'due') return item.category === 'due';
    if (activeTab === 'announcements') return item.category === 'announcements';
    if (activeTab === 'account') return item.category === 'account';
    if (activeTab === 'recommendations') return item.category === 'recommendations';
    return true;
  });

  const handleMarkAllRead = () => {
    playSuccessChime();
    setUnreadIds([]);
    toast.success('All notifications marked as read.');
  };

  const handleAction = (item) => {
    playClick();
    setUnreadIds(prev => prev.filter(id => id !== item.id));
    if (item.actionTarget === 'modal') {
      toast.info('Annual Electrical & Network Server Maintenance: Central Library Stacks closed 20 Sep 2025.');
    } else {
      onNavigate(item.actionTarget);
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Bar with BackButton & Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Notifications
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Stay updated with your library activities, due dates, and important announcements.
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 120ms'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <Check size={14} />
            <span>Mark all as read</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            title="Notification Settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      {/* ── Category Filter Tabs matching Screenshot 4 Bottom ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `All (${unreadIds.length})` },
          { id: 'due', label: 'Due Dates (1)' },
          { id: 'announcements', label: 'Announcements (1)' },
          { id: 'account', label: 'Account (1)' },
          { id: 'recommendations', label: 'Recommendations (0)' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                background: active ? '#0f172a' : '#ffffff',
                color: active ? '#ffffff' : '#64748b',
                border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Layout: Notifications List (Left 70%) + Alerts & Announcements (Right 30%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
        
        {/* Left Notifications List */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: 13.5 }}>
              No notifications in this category.
            </div>
          ) : (
            filteredNotifications.map((item, idx) => {
              const Icon = item.icon;
              const isUnread = unreadIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    borderBottom: idx < filteredNotifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: isUnread ? '#fbfcfe' : '#ffffff',
                    transition: 'background 120ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = isUnread ? '#fbfcfe' : '#ffffff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Category Icon */}
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: 13, color: '#334155' }}>
                          {item.text}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                          {item.time}
                        </span>
                        {isUnread && (
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#ef4444'
                          }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAction(item)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 7,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 120ms',
                      flexShrink: 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#0f172a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar matching Screenshot 4 Bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Due Soon Alert Card */}
          <div 
            onClick={() => onNavigate('borrowings')}
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 120ms'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <Calendar size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>1 book due soon!</div>
                <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 1 }}>Make sure to return it on time to avoid fines.</div>
              </div>
            </div>
            <ChevronRight size={16} color="#ef4444" />
          </div>

          {/* Notification Preferences Card */}
          <div 
            onClick={() => onNavigate('settings')}
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 120ms'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <SettingsIcon size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>Notification Preferences</div>
                <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 1 }}>Choose what you want to be notified about.</div>
              </div>
            </div>
            <ChevronRight size={16} color="#2563eb" />
          </div>

          {/* Recent Announcements Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Recent Announcements</div>
              <button 
                onClick={() => toast.info('All announcements up to date')}
                style={{ background: 'none', border: 'none', fontSize: 11.5, color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                View All →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {
                  title: 'Research Paper Workshop',
                  date: '20 Sep 2025',
                  venue: 'Central Library Auditorium',
                  img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=120&auto=format&fit=crop&q=80'
                },
                {
                  title: 'Extended Library Hours',
                  date: '10 Sep 2025',
                  venue: 'Open until 10:00 PM during exams',
                  img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&auto=format&fit=crop&q=80'
                },
                {
                  title: 'New Journal Subscriptions',
                  date: '08 Sep 2025',
                  venue: 'IEEE, ACM and Springer journals added',
                  img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=120&auto=format&fit=crop&q=80'
                }
              ].map((ann, i) => (
                <div 
                  key={i} 
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => toast.info(`${ann.title}: scheduled at ${ann.venue}`)}
                >
                  <img
                    src={ann.img}
                    alt={ann.title}
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                  />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{ann.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{ann.date}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{ann.venue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
