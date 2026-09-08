import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  QrCode, 
  Search, 
  Activity, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sun, 
  Moon, 
  Plus, 
  Check,
  User,
  GraduationCap,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';

const ROLE_DEMOS = {
  student: {
    email: 'pranav@srmist.edu.in',
    password: 'student123',
    name: 'Pranav Sharma'
  },
  librarian: {
    email: 'librarian@srmist.edu.in',
    password: 'librarian123',
    name: 'Dr. Rajesh Kumar'
  },
  admin: {
    email: 'admin@nscc.srmist.edu.in',
    password: 'nscc2024',
    name: 'Admin Root'
  }
};

const FEATURE_PILLS = [
  { icon: QrCode, label: 'Quick QR Operations' },
  { icon: Search, label: 'Smart Search & Discovery' },
  { icon: Activity, label: 'Real-time Transactions' },
  { icon: ShieldCheck, label: 'Secure & Offline (SQLite)' }
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState(ROLE_DEMOS.student.email);
  const [password, setPassword] = useState(ROLE_DEMOS.student.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');

  // Registration form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regDept, setRegDept] = useState('CSE');
  const [regPassword, setRegPassword] = useState('');

  const handleRoleSelect = (role) => {
    playClick();
    setSelectedRole(role);
    setEmail(ROLE_DEMOS[role].email);
    setPassword(ROLE_DEMOS[role].password);
    toast.info(`Pre-loaded ${role.charAt(0).toUpperCase() + role.slice(1)} credentials`);
  };

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Please input email and password');
      playErrorBeep();
      return;
    }

    setLoading(true);
    playClick();
    try {
      await login(email.trim().toLowerCase(), password);
      playSuccessChime();
      toast.success('Welcome to LibraX!');
    } catch (err) {
      playErrorBeep();
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regNumber.trim() || !regPassword) {
      toast.error('Please fill in all registration fields');
      playErrorBeep();
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      playErrorBeep();
      return;
    }

    setLoading(true);
    playClick();
    try {
      const user = await register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        reg_number: regNumber.trim().toUpperCase(),
        department: regDept,
        password: regPassword
      });
      playSuccessChime();
      toast.success(`Account created! Welcome, ${user.name}`);
    } catch (err) {
      playErrorBeep();
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      color: '#e2e8f0',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Background Atmospheric Ambient Glows ── */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 65%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: '10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* ── Top Navigation Bar (Mockup Screen 1 Header) ── */}
      <header style={{
        height: 72,
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative',
        zIndex: 20
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            letterSpacing: '-0.4px'
          }}>
            LibraX
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          fontSize: 14,
          color: '#94a3b8'
        }} className="desktop-only">
          <span style={{ color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}>Home</span>
          <span style={{ cursor: 'pointer', transition: 'color 150ms' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Features</span>
          <span style={{ cursor: 'pointer', transition: 'color 150ms' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>About</span>
          <span style={{ cursor: 'pointer', transition: 'color 150ms' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Contact</span>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={() => { playClick(); setThemeMode(themeMode === 'dark' ? 'light' : 'dark'); }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Sign In Pill */}
          <button
            onClick={() => { playClick(); setAuthMode('signin'); }}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── Main Hero Section (Screen 1 Layout) ── */}
      <main style={{
        flex: 1,
        maxWidth: 1320,
        width: '100%',
        margin: '0 auto',
        padding: '50px 32px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 48,
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* ── LEFT HERO: Smarter Libraries, Brighter Minds ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
        >
          {/* Institutional Badge */}
          <div>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '5px 14px',
              borderRadius: 999,
              display: 'inline-block'
            }}>
              NEWTON SCHOOL CODING CLUB - SRM IST
            </span>
          </div>

          {/* Main Headline */}
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.12,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              marginBottom: 16
            }}>
              Smarter Libraries <br />
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Brighter Minds.
              </span>
            </h1>

            <p style={{
              fontSize: 15,
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: 520
            }}>
              A modern library management system with QR scanning, real-time tracking, and intelligent search — built for students, by students.
            </p>
          </div>

          {/* 4 Feature Pill Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            maxWidth: 560
          }}>
            {FEATURE_PILLS.map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'rgba(15, 22, 38, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 200ms'
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <Icon size={15} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}>
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quote & Scroll Anchor */}
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontStyle: 'italic', fontSize: 14, color: '#64748b', marginBottom: 12 }}>
              "Books today. A brighter tomorrow."
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#10b981'
            }}>
              <Plus size={12} strokeWidth={3} />
              <span>SCROLL TO EXPLORE</span>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT HERO: Smoked Obsidian Auth Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div style={{
            width: '100%',
            maxWidth: 440,
            background: 'rgba(14, 22, 38, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: 20,
            padding: '36px 32px',
            backdropFilter: 'blur(30px) saturate(190%)',
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(16, 185, 129, 0.06)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: '#ffffff',
                marginBottom: 6
              }}>
                {authMode === 'signin' ? 'Welcome to LibraX' : 'Create Student Account'}
              </h2>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                {authMode === 'signin' ? 'Sign in to access your library account' : 'Join the SRM IST digital library collective'}
              </p>
            </div>

            {authMode === 'signin' ? (
              <>
                {/* Role Switcher Pill Tabs: [Student] [Librarian] [Admin] */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(8, 12, 20, 0.8)',
                  padding: 4,
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: 22
                }}>
                  {[
                    { id: 'student', label: 'Student' },
                    { id: 'librarian', label: 'Librarian' },
                    { id: 'admin', label: 'Admin' }
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 7,
                        fontSize: 12.5,
                        fontWeight: selectedRole === role.id ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        background: selectedRole === role.id ? '#10b981' : 'transparent',
                        color: selectedRole === role.id ? '#ffffff' : '#94a3b8',
                        transition: 'all 150ms',
                        boxShadow: selectedRole === role.id ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {/* Form Fields */}
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Institutional Email */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                      Institutional Email
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'rgba(8, 12, 20, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      padding: '11px 14px'
                    }}>
                      <Mail size={16} color="#64748b" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. ra2311003000@srmist.edu.in"
                        required
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#ffffff',
                          fontSize: 13.5
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                      Password
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'rgba(8, 12, 20, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      padding: '11px 14px'
                    }}>
                      <Lock size={16} color="#64748b" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#ffffff',
                          fontSize: 13.5
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ color: '#64748b', display: 'flex' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#10b981' }}
                      />
                      <span>Remember me</span>
                    </label>
                    <span 
                      onClick={() => toast.info('For account recovery, contact SRM IST Library Administrator.')}
                      style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Forgot password?
                    </span>
                  </div>

                  {/* Submit CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: 6,
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: '#10b981',
                      border: 'none',
                      color: '#080c14',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                      transition: 'all 150ms'
                    }}
                  >
                    {loading ? (
                      <div className="spinner spinner-sm" style={{ borderTopColor: '#080c14' }} />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Switch to Registration */}
                <div style={{ marginTop: 22, textAlign: 'center', fontSize: 12.5, color: '#94a3b8' }}>
                  New here?{' '}
                  <span
                    onClick={() => { playClick(); setAuthMode('register'); }}
                    style={{ color: '#10b981', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Create an account
                  </span>
                </div>
              </>
            ) : (
              /* ── Registration View ── */
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Pranav Sharma"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(8, 12, 20, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 9,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>SRM Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="ps8821@srmist.edu.in"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(8, 12, 20, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 9,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Reg Number</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={e => setRegNumber(e.target.value)}
                      placeholder="RA2311..."
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(8, 12, 20, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 9,
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: 13,
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Department</label>
                    <select
                      value={regDept}
                      onChange={e => setRegDept(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(8, 12, 20, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 9,
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: 13
                      }}
                    >
                      {['CSE', 'ECE', 'IT', 'EEE', 'ME', 'AI & DS', 'Other'].map(d => (
                        <option key={d} value={d} style={{ background: '#0e1628' }}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(8, 12, 20, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 9,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 6,
                    padding: '12px 20px',
                    borderRadius: 10,
                    background: '#10b981',
                    border: 'none',
                    color: '#080c14',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {loading ? (
                    <div className="spinner spinner-sm" style={{ borderTopColor: '#080c14' }} />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </motion.button>

                <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12.5, color: '#94a3b8' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => { playClick(); setAuthMode('signin'); }}
                    style={{ color: '#10b981', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Sign in
                  </span>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
