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
  ExternalLink,
  Send,
  PackageCheck,
  ShieldAlert
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { playClick, playSuccessChime } from '../utils/audio';
import { toast } from '../context/ToastContext';

export default function Notifications({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian';

  const [activeTab, setActiveTab] = useState('all');
  const [unreadIds, setUnreadIds] = useState(['ln1', 'ln2', 'n1', 'n2']);

  // Librarian Notifications Feed (Screen 9 Mockup Exact)
  const librarianNotifications = [
    {
      id: 'ln1',
      category: 'overdue',
      type: 'Overdue Notice',
      title: 'Rohan Verma (RA2311003010123)',
      text: '1 book overdue: Database System Concepts (5 days late). Fine accrued: ₹10.',
      time: '10 mins ago',
      icon: Clock,
      iconColor: '#ef4444',
      iconBg: '#fef2f2',
      actionLabel: 'Send Reminder',
      actionKey: 'remind_rohan'
    },
    {
      id: 'ln2',
      category: 'students',
      type: 'Student Registration',
      title: 'Ananya Sharma (RA2311003010245)',
      text: 'New student registration approved for B.Tech CSE (3rd Year). Library card activated.',
      time: '1 hour ago',
      icon: User,
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
      actionLabel: 'View Profile',
      actionKey: 'view_student'
    },
    {
      id: 'ln3',
      category: 'overdue',
      type: 'Book Return Alert',
      title: 'Vikram Kumar (RA2311003010333)',
      text: 'Returned "Operating System Concepts" in good condition. Restocked in Rack B-04.',
      time: '3 hours ago',
      icon: CheckCircle2,
      iconColor: '#059669',
      iconBg: '#ecfdf5',
      actionLabel: 'View Record',
      actionKey: 'view_record'
    },
    {
      id: 'ln4',
      category: 'inventory',
      type: 'Low Stock Alert',
      title: 'Clean Code: A Handbook of Agile Craftsmanship',
      text: 'Only 1 copy remaining on shelf (Rack A-12). 4 copies currently on active loan.',
      time: '5 hours ago',
      icon: AlertTriangle,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
      actionLabel: 'Restock Request',
      actionKey: 'restock'
    },
    {
      id: 'ln5',
      category: 'announcements',
      type: 'Scheduled Maintenance',
      title: 'Sunday Server & Stack Maintenance',
      text: 'Scheduled electrical & database backup on Sunday, 15 Sep 2025 (11:00 PM - 02:00 AM IST). Library portal will be temporarily unavailable.',
      time: '1 day ago',
      icon: Info,
      iconColor: '#64748b',
      iconBg: '#f1f5f9',
      actionLabel: 'Details',
      actionKey: 'maintenance_details'
    }
  ];

  // Student Notifications Feed
  const studentNotifications = [
    {
      id: 'n1',
      category: 'overdue',
      type: 'Book Due Soon',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
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
      title: 'CS Stacks Update',
      text: '24 new Computer Science books have been added to the Central Library.',
      time: '1 day ago',
      icon: BookOpen,
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
      actionLabel: 'Explore',
      actionTarget: 'catalog'
    },
    {
      id: 'n3',
      category: 'students',
      type: 'Book Returned',
      title: 'Loan Settled',
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
      category: 'students',
      type: 'Recommended for You',
      title: 'Lyra Recommendation',
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
      category: 'announcements',
      type: 'Library Maintenance',
      title: 'Stack Closure Notice',
      text: 'The library will remain closed on 20 Sep 2025 (Saturday) for maintenance.',
      time: '1 week ago',
      icon: Info,
      iconColor: '#64748b',
      iconBg: '#f1f5f9',
      actionLabel: 'View Details',
      actionTarget: 'modal'
    }
  ];

  const activeList = isLibrarian ? librarianNotifications : studentNotifications;

  const filteredNotifications = activeList.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const handleMarkAllRead = () => {
    playSuccessChime();
    setUnreadIds([]);
    toast.success('All notifications marked as read.');
  };

  const handleLibrarianAction = (item) => {
    playClick();
    setUnreadIds(prev => prev.filter(id => id !== item.id));

    if (item.actionKey === 'remind_rohan') {
      playSuccessChime();
      toast.success('SMS and email notification alert dispatched to Rohan Verma (RA2311003010123)');
    } else if (item.actionKey === 'view_student') {
      onNavigate('students');
      toast.info('Viewing registered student account: Ananya Sharma');
    } else if (item.actionKey === 'view_record') {
      onNavigate('transactions');
      toast.info('Viewing transaction history record: Vikram Kumar');
    } else if (item.actionKey === 'restock') {
      playSuccessChime();
      toast.success('Procurement restock purchase requisition (5 copies) submitted for "Clean Code"');
    } else {
      toast.info('Annual Electrical & Stack Database Backup: Sunday 11:00 PM to 02:00 AM IST');
    }
  };

  const handleStudentAction = (item) => {
    playClick();
    setUnreadIds(prev => prev.filter(id => id !== item.id));
    if (item.actionTarget === 'modal') {
      toast.info('Annual Electrical & Network Server Maintenance: Central Library Stacks closed 20 Sep 2025.');
    } else {
      onNavigate(item.actionTarget);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
      {/* ── Top Bar with BackButton & Header (Mockup Screen 9) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Notifications
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {isLibrarian 
                ? 'Stay updated with overdue alerts, student registrations, inventory notices, and system updates.'
                : 'Stay updated with your library activities, due dates, and important announcements.'}
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
              padding: '8px 16px',
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
        </div>
      </div>

      {/* ── Filter Tabs matching Screen 9 ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'overdue', label: isLibrarian ? 'Overdue' : 'Due Dates' },
          { id: 'students', label: isLibrarian ? 'Students' : 'Account' },
          ...(isLibrarian ? [{ id: 'inventory', label: 'Inventory' }] : []),
          { id: 'announcements', label: 'Announcements' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              style={{
                padding: '7px 18px',
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

      {/* ── Main Layout: Notifications List & Action Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.9fr)', gap: 24, alignItems: 'start' }}>
        
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
                    padding: '18px 20px',
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
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={19} />
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                          {item.type}
                        </span>
                        {item.title && (
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
                            · {item.title}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#334155', marginTop: 3 }}>
                        {item.text}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
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
                    onClick={() => isLibrarian ? handleLibrarianAction(item) : handleStudentAction(item)}
                    style={{
                      padding: '7px 14px',
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

        {/* Right Column: Key Alerts and Quick Summaries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLibrarian ? (
            <>
              {/* Overdue Alert Card */}
              <div 
                onClick={() => onNavigate('admin')}
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>12 Critical Overdue Accounts</div>
                    <div style={{ fontSize: 11.5, color: '#b91c1c', marginTop: 1 }}>Send automated SMS reminders with fine details</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#ef4444" />
              </div>

              {/* Student Registrations Card */}
              <div 
                onClick={() => onNavigate('students')}
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <User size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1e40af' }}>3,421 Registered Students</div>
                    <div style={{ fontSize: 11.5, color: '#3b82f6', marginTop: 1 }}>Manage borrower cards & verify enrollment</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#2563eb" />
              </div>
            </>
          ) : (
            <>
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
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>1 book due soon!</div>
                    <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 1 }}>Return on time to avoid fines.</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#ef4444" />
              </div>
            </>
          )}

          {/* Announcements Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Official Campus Bulletins</div>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: 4 }}>
                SRM IST
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>Research Paper Workshop</div>
                <div style={{ color: '#64748b', fontSize: 11.5, marginTop: 2 }}>Central Library Auditorium · 20 Sep 2025</div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>Extended Hours for Exams</div>
                <div style={{ color: '#64748b', fontSize: 11.5, marginTop: 2 }}>Open until 10:00 PM IST daily</div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>IEEE & Springer Journal Access</div>
                <div style={{ color: '#64748b', fontSize: 11.5, marginTop: 2 }}>Campus Wi-Fi auto-authenticates e-resources</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
