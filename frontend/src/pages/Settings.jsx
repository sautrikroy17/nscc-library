import { useState } from 'react';
import { 
  User, 
  Sliders, 
  Bell, 
  Lock, 
  Link2, 
  Check, 
  X, 
  Plus, 
  Sun, 
  Moon, 
  Laptop, 
  Send,
  ShieldCheck
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

export default function Settings({ onNavigate = () => {}, initialTab = 'profile' }) {
  const { user } = useAuth();
  const { preferences, updatePreferences, theme, setTheme } = useLibrary();
  const [activeTab, setActiveTab] = useState(initialTab);

  const isStudent = user?.role === 'student';

  // Profile Information Form State
  const [profileForm, setProfileForm] = useState({
    name: isStudent ? 'Sautrik Roy' : (user?.name || 'Librarian (LIB-SRM-042)'),
    rollNumber: isStudent ? 'RA2511003010052' : 'LIB-SRM-042',
    email: isStudent ? 'sautrikroy@srmist.edu.in' : 'librarian@srmist.edu.in',
    department: isStudent ? 'Computer Science and Engineering' : 'Central Library',
    year: isStudent ? '2nd Year' : 'Faculty / Staff'
  });

  // Library Preferences Form State
  const [libraryPrefs, setLibraryPrefs] = useState(() => preferences || {
    borrowPeriod: '14 days (Standard)',
    categories: ['Computer Science', 'Software Engineering', 'AI & ML'],
    language: 'English',
    theme: theme || 'light'
  });

  useEffect(() => {
    if (theme) {
      setLibraryPrefs(prev => ({ ...prev, theme }));
    }
  }, [theme]);

  const [readingGoal, setReadingGoal] = useState(15);
  const [defaultView, setDefaultView] = useState('grid');
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Sync preferences from context
  useEffect(() => {
    if (preferences) {
      setLibraryPrefs(prev => ({ ...prev, ...preferences }));
    }
  }, [preferences]);

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    dueDateReminders: true,
    overdueAlerts: true,
    newArrivals: true,
    recommendations: true,
    libraryAnnouncements: true,
    eventNotifications: true,
    promotionalUpdates: false,
    inApp: true,
    email: true,
    sms: false,
    quietHours: true,
    quietFrom: '11:00 PM',
    quietTo: '7:00 AM'
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    playSuccessChime();
    toast.success('Profile information saved successfully!');
  };

  const handleThemeChange = (newTheme) => {
    playClick();
    const effective = newTheme === 'system'
      ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme;
    const updated = { ...libraryPrefs, theme: newTheme };
    setLibraryPrefs(updated);
    if (setTheme) {
      setTheme(effective);
    }
    updatePreferences(updated);
  };

  const handlePrefsSave = () => {
    playSuccessChime();
    updatePreferences(libraryPrefs);
    toast.success('Library preferences updated successfully!');
  };

  const removeCategory = (catToRemove) => {
    const updated = libraryPrefs.categories.filter(c => c !== catToRemove);
    setLibraryPrefs(prev => ({ ...prev, categories: updated }));
    updatePreferences({ categories: updated });
    toast.info(`Removed "${catToRemove}" from preferences`);
  };

  const addCategory = () => {
    if (!newCatInput.trim()) return;
    const trimmed = newCatInput.trim();
    if (!libraryPrefs.categories.includes(trimmed)) {
      const updated = [...libraryPrefs.categories, trimmed];
      setLibraryPrefs(prev => ({ ...prev, categories: updated }));
      updatePreferences({ categories: updated });
      toast.success(`Added "${trimmed}" to preferred categories!`);
    }
    setNewCatInput('');
    setShowAddCat(false);
  };

  const toggleNotification = (key) => {
    playClick();
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sendTestNotification = () => {
    playSuccessChime();
    toast.success('Test notification delivered! Sound and alert channels are verified.');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Bar with BackButton & Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => onNavigate('dashboard')} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Settings
          </h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Manage your account, preferences, and privacy settings.
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs matching Screenshot 5 ── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
          { id: 'connected', label: 'Connected Accounts' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                background: active ? '#0f172a' : 'transparent',
                color: active ? '#ffffff' : '#64748b',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
         PROFILE VIEW (When activeTab === 'profile')
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* Column 1: Profile Information */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0' }}>
              Profile Information
            </h2>

            {/* Avatar Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <img
                src={isStudent ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                alt="Avatar"
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
              />
              <button
                type="button"
                onClick={() => toast.info('Photo upload dialog ready. Max size 2MB.')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Change Photo
              </button>
            </div>

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Roll Number</label>
                <input
                  type="text"
                  value={profileForm.rollNumber}
                  disabled
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    fontSize: 13,
                    color: '#64748b',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Department</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Year</label>
                <select
                  value={profileForm.year}
                  onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 13,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Faculty / Staff">Faculty / Staff</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: SRM Central Library Membership Details */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              SRM Institutional Membership
            </h2>

            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 8px 20px rgba(15,23,42,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>
                SRM CENTRAL LIBRARY · SMART CARD
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>
                {profileForm.name}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>
                {profileForm.rollNumber}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 11 }}>
                <div>
                  <div style={{ color: '#64748b' }}>STATUS</div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>Active Member</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>BORROW LIMIT</div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>5 Volumes</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>FINES</div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>₹0 Outstanding</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <strong>RFID Barcode Sync:</strong> Your student ID card is linked to institutional physical kiosks. For quota expansions or thesis repository clearance, contact Central Library Level 2 Help Desk.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         PREFERENCES VIEW (When activeTab === 'preferences')
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'preferences' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Column 1: Library Preferences */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Library Preferences
            </h2>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Default Borrowing Period</label>
              <select
                value={libraryPrefs.borrowPeriod}
                onChange={e => {
                  const val = e.target.value;
                  setLibraryPrefs(prev => ({ ...prev, borrowPeriod: val }));
                  updatePreferences({ borrowPeriod: val });
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 13,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="14 days (Standard)">14 days (Standard)</option>
                <option value="21 days (Extended)">21 days (Extended)</option>
                <option value="28 days (Research)">28 days (Research)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Preferred Categories</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {(libraryPrefs.categories || []).map(cat => (
                  <span
                    key={cat}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {showAddCat ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newCatInput}
                      onChange={e => setNewCatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCategory()}
                      autoFocus
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid #2563eb',
                        fontSize: 12,
                        outline: 'none',
                        width: 130
                      }}
                    />
                    <button type="button" onClick={addCategory} style={{ padding: '4px 8px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>Add</button>
                    <button type="button" onClick={() => setShowAddCat(false)} style={{ padding: '4px 8px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: 11, cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddCat(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px dashed #cbd5e1',
                      background: '#ffffff',
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} /> Add category
                  </button>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Language</label>
              <select
                value={libraryPrefs.language}
                onChange={e => {
                  const val = e.target.value;
                  setLibraryPrefs(prev => ({ ...prev, language: val }));
                  updatePreferences({ language: val });
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 13,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 8 }}>Theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop }
                ].map(t => {
                  const Icon = t.icon;
                  const active = libraryPrefs.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: active ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                        background: active ? '#f8fafc' : '#ffffff',
                        color: active ? '#0f172a' : '#64748b',
                        fontWeight: active ? 700 : 500,
                        fontSize: 12.5,
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                type="button"
                onClick={handlePrefsSave}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Column 2: Reading & Catalog Experience */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Reading Goals & Display Customization
            </h2>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Semester Reading Target</label>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{readingGoal} books</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={readingGoal}
                onChange={e => setReadingGoal(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                Current progress: 12 of {readingGoal} books completed this semester.
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 8 }}>Default Catalog View</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { playClick(); setDefaultView('grid'); toast.info('Default view set to Grid'); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: defaultView === 'grid' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                    background: defaultView === 'grid' ? '#f8fafc' : '#ffffff',
                    fontWeight: defaultView === 'grid' ? 700 : 500,
                    fontSize: 12.5,
                    cursor: 'pointer'
                  }}
                >
                  Grid Cards View
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setDefaultView('list'); toast.info('Default view set to List'); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: defaultView === 'list' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                    background: defaultView === 'list' ? '#f8fafc' : '#ffffff',
                    fontWeight: defaultView === 'list' ? 700 : 500,
                    fontSize: 12.5,
                    cursor: 'pointer'
                  }}
                >
                  Compact List View
                </button>
              </div>
            </div>

            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#475569' }}>
              <strong>Automatic Book Renewals:</strong> When enabled, eligible volumes with zero waitlist reservations will renew automatically 48 hours prior to due date.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => { playSuccessChime(); toast.success('Reading customizations saved!'); }}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save Customizations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         NOTIFICATIONS VIEW (Screenshot 5 Bottom-Right)
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* Column 1: Notification Preferences Switches */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Notification Preferences
            </h2>

            {[
              { key: 'dueDateReminders', title: 'Due Date Reminders', desc: 'Get notified before your books are due' },
              { key: 'overdueAlerts', title: 'Overdue Alerts', desc: 'Get notified if a book is overdue' },
              { key: 'newArrivals', title: 'New Arrivals', desc: 'Get notified about new books in your selected categories' },
              { key: 'recommendations', title: 'Recommendations', desc: 'Receive personalized book recommendations' },
              { key: 'libraryAnnouncements', title: 'Library Announcements', desc: 'Important updates about the library' },
              { key: 'eventNotifications', title: 'Event Notifications', desc: 'Workshops, seminars and special events' },
              { key: 'promotionalUpdates', title: 'Promotional Updates', desc: 'Book fairs, reading clubs and more' }
            ].map(item => {
              const isOn = notifications[item.key];
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{item.desc}</div>
                  </div>

                  {/* Switch Toggle */}
                  <div
                    onClick={() => toggleNotification(item.key)}
                    style={{
                      width: 42,
                      height: 24,
                      borderRadius: 999,
                      background: isOn ? '#2563eb' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 2,
                      cursor: 'pointer',
                      transition: 'background 150ms'
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ffffff',
                      transform: isOn ? 'translateX(18px)' : 'translateX(0)',
                      transition: 'transform 150ms',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Notification Channels & Quiet Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Notification Channels */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                Notification Channels
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'inApp', label: 'In-App Notifications' },
                  { key: 'email', label: 'Email Notifications' },
                  { key: 'sms', label: 'SMS Notifications' }
                ].map(ch => (
                  <label key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={notifications[ch.key]}
                      onChange={() => toggleNotification(ch.key)}
                      style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <span>{ch.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Quiet Hours</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>Pause notifications during specific hours</div>
                </div>

                <div
                  onClick={() => toggleNotification('quietHours')}
                  style={{
                    width: 42,
                    height: 24,
                    borderRadius: 999,
                    background: notifications.quietHours ? '#2563eb' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                    cursor: 'pointer',
                    transition: 'background 150ms'
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: notifications.quietHours ? 'translateX(18px)' : 'translateX(0)',
                    transition: 'transform 150ms',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>

              {notifications.quietHours && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>From</label>
                    <select
                      value={notifications.quietFrom}
                      onChange={e => setNotifications({ ...notifications, quietFrom: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, outline: 'none' }}
                    >
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                      <option value="12:00 AM">12:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>To</label>
                    <select
                      value={notifications.quietTo}
                      onChange={e => setNotifications({ ...notifications, quietTo: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, outline: 'none' }}
                    >
                      <option value="6:00 AM">6:00 AM</option>
                      <option value="7:00 AM">7:00 AM</option>
                      <option value="8:00 AM">8:00 AM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Test Notification Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Test Notification
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Send a test notification to verify your settings.
              </div>

              <button
                type="button"
                onClick={sendTestNotification}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <Send size={14} />
                <span>Send Test Notification</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         SECURITY VIEW
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enterprise End-to-End Security & Protection
              </h2>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                SRM IST Central Library Zero-Trust Client Protocol Active
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Inspect Protection</div>
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>• Active & Guarded</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Context menu and debugger hotkeys locked.</div>
            </div>

            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Client Encryption</div>
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>• AES / Token Masked</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>LocalStorage payload obfuscated end-to-end.</div>
            </div>

            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>SRM SSO Session</div>
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>• Authenticated</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Secured token binding for {profileForm.rollNumber}.</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         CONNECTED ACCOUNTS VIEW
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'connected' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Connected Institutional Services
          </h2>

          {[
            { name: 'SRM Student Portal & Academia ERP', email: 'ra2511003010052@srmist.edu.in', status: 'Connected' },
            { name: 'Google Workspace for Education', email: 'sautrikroy@srmist.edu.in', status: 'Connected' },
            { name: 'SRM Central Library RFID Card Pass', email: 'Tag ID: 9482-1082-5501', status: 'Active' }
          ].map((srv, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{srv.name}</div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{srv.email}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: 6 }}>
                ✓ {srv.status}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
