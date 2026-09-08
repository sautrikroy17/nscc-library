import { useState, useRef, useEffect } from 'react';
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
  Check,
  User,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  HelpCircle,
  X,
  KeyRound,
  Download,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';
import { INITIAL_BOOKS } from '../data/seedData';

const ROLE_DEMOS = {
  student: {
    email: 'sr9973@srmist.edu.in',
    password: 'student123',
    name: 'Sautrik Roy'
  },
  librarian: {
    email: 'librarian@srmist.edu.in',
    password: 'librarian123',
    name: 'Dr. Rajesh Kumar'
  },
  admin: {
    email: 'admin@nscc.srmist.edu.in',
    password: 'nscc2024',
    name: 'Admin Librarian'
  }
};

const FEATURE_PILLS = [
  { id: 'qr', icon: QrCode, label: 'Quick QR Operations' },
  { id: 'search', icon: Search, label: 'Smart Search & Discovery' },
  { id: 'realtime', icon: Activity, label: 'Real-time Transactions' },
  { id: 'offline', icon: ShieldCheck, label: 'Secure & Offline (SQLite)' }
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

  // Interactive Modals State
  const [activeModal, setActiveModal] = useState(null); // 'qr' | 'search' | 'realtime' | 'offline' | 'contact' | 'forgot' | 'book_detail'
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [cardPulse, setCardPulse] = useState(false);

  // Registration form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regDept, setRegDept] = useState('CSE');
  const [regPassword, setRegPassword] = useState('');

  // Password recovery form
  const [resetRegNo, setResetRegNo] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // References for smooth scrolling
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const authCardRef = useRef(null);

  const handleRoleSelect = (role) => {
    playClick();
    setSelectedRole(role);
    setEmail(ROLE_DEMOS[role].email);
    setPassword(ROLE_DEMOS[role].password);
    toast.info(`Pre-loaded ${role.charAt(0).toUpperCase() + role.slice(1)} credentials`);
  };

  const scrollToSection = (ref) => {
    playClick();
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const focusAuthCard = () => {
    playClick();
    setAuthMode('signin');
    if (authCardRef.current) {
      authCardRef.current.scrollIntoView({ behavior: 'smooth' });
      setCardPulse(true);
      setTimeout(() => setCardPulse(false), 1200);
    }
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
      const user = await login(email.trim().toLowerCase(), password);
      playSuccessChime();
      toast.success(`Welcome to LibraX, ${user.name || 'Scholar'}!`);
    } catch (err) {
      console.error('Login error:', err);
      playErrorBeep();
      toast.error(err.message || 'Authentication error');
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

  const handleResetSubmit = (e) => {
    e?.preventDefault();
    if (!resetRegNo.trim()) {
      toast.error('Please enter your SRM Registration Number');
      return;
    }
    playSuccessChime();
    setResetSuccess(true);
    toast.success('Temporary access code generated: SRM-PASS-2026');
  };

  // Filter books for interactive search modal
  const filteredCatalog = INITIAL_BOOKS.filter(b => 
    b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.author.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: themeMode === 'dark' ? '#080c14' : '#0a101d',
      color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Background Atmospheric Library Image & Gradients ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        minHeight: 1000,
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%), radial-gradient(circle at 85% 35%, rgba(6, 182, 212, 0.06) 0%, transparent 50%), linear-gradient(180deg, #080c14 0%, #060910 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Atmospheric Library Shelving Ambient Backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 750,
        backgroundImage: 'url(/library_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        opacity: 0.18,
        filter: 'blur(2px) contrast(120%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
        zIndex: 1,
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
        position: 'sticky',
        top: 0,
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        zIndex: 50
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => scrollToSection(heroRef)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
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

        {/* Center Nav Links - All functional with smooth scroll and click */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          fontSize: 14,
          color: '#94a3b8'
        }} className="desktop-only">
          <button 
            onClick={() => scrollToSection(heroRef)}
            style={{ color: '#ffffff', fontWeight: 600, transition: 'color 150ms' }}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection(featuresRef)}
            style={{ color: '#94a3b8', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'} 
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection(aboutRef)}
            style={{ color: '#94a3b8', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'} 
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            About
          </button>
          <button 
            onClick={() => { playClick(); setActiveModal('contact'); }}
            style={{ color: '#94a3b8', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'} 
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              playClick();
              setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
              toast.info(`Theme set to ${themeMode === 'dark' ? 'Emerald Light' : 'Deep Obsidian'}`);
            }}
            title="Toggle theme appearance"
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
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
          >
            {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Sign In Pill Button in Top Nav */}
          <button
            onClick={focusAuthCard}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10b981',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 150ms',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 18px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.15)';
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── Main Hero Section (Matching User Reference Mockup) ── */}
      <main 
        ref={heroRef}
        style={{
          flex: 1,
          maxWidth: 1380,
          width: '100%',
          margin: '0 auto',
          padding: '40px 32px 30px',
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.15fr) auto minmax(380px, 0.95fr)',
          gap: 36,
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* ── LEFT HERO: Smarter Libraries, Brighter Minds ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
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
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '5px 14px',
              borderRadius: 999,
              display: 'inline-block',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.15)'
            }}>
              NEWTON SCHOOL CODING CLUB - SRM IST
            </span>
          </div>

          {/* Main Headline */}
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(38px, 4.8vw, 58px)',
              lineHeight: 1.12,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              marginBottom: 16
            }}>
              Smarter Libraries <br />
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
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

          {/* 4 Feature Pill Cards Row - All 4 Clickable with live interactive modals */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            maxWidth: 580
          }}>
            {FEATURE_PILLS.map((pill) => {
              const Icon = pill.icon;
              return (
                <div
                  key={pill.id}
                  onClick={() => {
                    playClick();
                    setActiveModal(pill.id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '14px 14px',
                    borderRadius: 12,
                    background: 'rgba(15, 22, 38, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease-out',
                    userSelect: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(16, 185, 129, 0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
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
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}>
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Accent Line, Quote & Scroll Anchor */}
          <div style={{ paddingTop: 4 }}>
            {/* Green horizontal accent bar matching mockup */}
            <div style={{
              width: 38,
              height: 3.5,
              borderRadius: 2,
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
              marginBottom: 12
            }} />

            <div style={{ fontStyle: 'italic', fontSize: 14, color: '#64748b', marginBottom: 14 }}>
              "Books today. A brighter tomorrow."
            </div>

            <button
              onClick={() => scrollToSection(featuresRef)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: '#10b981',
                cursor: 'pointer',
                transition: 'all 150ms'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChevronDown size={13} strokeWidth={2.5} />
              </div>
              <span>SCROLL TO EXPLORE</span>
            </button>
          </div>
        </motion.div>

        {/* ── CENTER ELEMENT: Illuminated Neon Quote Glass Pillar ── */}
        {/* Rendered from reference mockup: GOOD STUDENTS READ GREAT MINDS BUILD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 10px'
          }}
          className="desktop-only"
        >
          <div style={{
            position: 'relative',
            width: 170,
            height: 380,
            borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(8, 20, 26, 0.85) 0%, rgba(5, 12, 18, 0.92) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 0 35px rgba(16, 185, 129, 0.18), inset 0 0 30px rgba(16, 185, 129, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            padding: '24px 12px',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden'
          }}>
            {/* Top & bottom light reflections on the glass pane */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #34d399, transparent)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #10b981, transparent)'
            }} />

            {/* Neon Words with glowing text shadows */}
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '3px',
              color: '#10b981',
              textShadow: '0 0 8px #10b981, 0 0 20px rgba(16, 185, 129, 0.8)'
            }}>
              GOOD
            </span>

            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '2px',
              color: '#34d399',
              textShadow: '0 0 8px #34d399, 0 0 20px rgba(52, 211, 153, 0.8)'
            }}>
              STUDENTS
            </span>

            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: '3px',
              color: '#f59e0b',
              textShadow: '0 0 10px #f59e0b, 0 0 25px rgba(245, 158, 11, 0.8)'
            }}>
              READ
            </span>

            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '3px',
              color: '#34d399',
              textShadow: '0 0 8px #34d399, 0 0 20px rgba(52, 211, 153, 0.8)'
            }}>
              GREAT
            </span>

            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '3px',
              color: '#06b6d4',
              textShadow: '0 0 8px #06b6d4, 0 0 20px rgba(6, 182, 212, 0.8)'
            }}>
              MINDS
            </span>

            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '3px',
              color: '#10b981',
              textShadow: '0 0 8px #10b981, 0 0 20px rgba(16, 185, 129, 0.8)'
            }}>
              BUILD
            </span>
          </div>
        </motion.div>

        {/* ── RIGHT HERO: Smoked Obsidian Auth Card ── */}
        <motion.div
          ref={authCardRef}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div style={{
            width: '100%',
            maxWidth: 440,
            background: 'rgba(14, 22, 38, 0.88)',
            border: cardPulse ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: cardPulse ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            padding: '36px 32px',
            backdropFilter: 'blur(30px) saturate(190%)',
            boxShadow: cardPulse 
              ? '0 0 40px rgba(16, 185, 129, 0.6), 0 24px 64px rgba(0, 0, 0, 0.85)' 
              : '0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(16, 185, 129, 0.06)',
            position: 'relative',
            transition: 'border 300ms, box-shadow 300ms'
          }}>
            {/* Header */}
            <div style={{ marginBottom: 22 }}>
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
                  marginBottom: 20
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
                        boxShadow: selectedRole === role.id ? '0 0 14px rgba(16, 185, 129, 0.5)' : 'none'
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
                        style={{ color: '#64748b', display: 'flex', cursor: 'pointer' }}
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
                        style={{ accentColor: '#10b981', cursor: 'pointer' }}
                      />
                      <span>Remember me</span>
                    </label>
                    <span 
                      onClick={() => { playClick(); setActiveModal('forgot'); }}
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
                    placeholder="e.g. Sautrik Roy"
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
                        background: '#0e1628',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 9,
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: 13
                      }}
                    >
                      {['CSE', 'ECE', 'IT', 'EEE', 'ME', 'AI & DS', 'Other'].map(d => (
                        <option key={d} value={d}>{d}</option>
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

      {/* ── SECTION: Live Interactive Feature Showcase & Catalog ── */}
      <section 
        ref={featuresRef}
        id="features"
        style={{
          maxWidth: 1380,
          width: '100%',
          margin: '40px auto 0',
          padding: '60px 32px',
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 12px',
              borderRadius: 999,
              marginBottom: 10
            }}>
              <Sparkles size={13} />
              <span>LIVE REPOSITORY DISCOVERY</span>
            </div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: '#ffffff'
            }}>
              Curated Books Ready for Instant Checkout
            </h2>
          </div>

          <button
            onClick={focusAuthCard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            <span>Log In to Borrow</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 6 Featured Book Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20
        }}>
          {INITIAL_BOOKS.slice(0, 6).map((book) => (
            <div
              key={book.id}
              onClick={() => {
                playClick();
                setSelectedBook(book);
                setActiveModal('book_detail');
              }}
              style={{
                background: 'rgba(15, 22, 38, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 200ms ease-out'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Cover spine preview */}
              <div style={{
                height: 120,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${book.cover_color}33 0%, ${book.cover_color}11 100%)`,
                border: `1px solid ${book.cover_color}44`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 12
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: book.cover_color, letterSpacing: '0.5px' }}>
                  {book.id}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {book.title}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{book.author}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: book.available_copies > 0 ? '#10b981' : '#f43f5e',
                    background: book.available_copies > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 4
                  }}>
                    {book.available_copies > 0 ? `${book.available_copies} Available` : 'All Issued'}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Shelf {book.shelf_location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: About Newton School Coding Club SRM IST ── */}
      <section 
        ref={aboutRef}
        id="about"
        style={{
          maxWidth: 1380,
          width: '100%',
          margin: '0 auto',
          padding: '60px 32px',
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{
          background: 'rgba(14, 22, 38, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: '40px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 36,
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#06b6d4',
              background: 'rgba(6, 182, 212, 0.1)',
              padding: '4px 12px',
              borderRadius: 999,
              marginBottom: 12
            }}>
              <GraduationCap size={14} />
              <span>CAMPUS TECHNOLOGY INITIATIVE</span>
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 12
            }}>
              Engineered by Newton School Coding Club
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
              LibraX is an institutional library management ecosystem designed specifically for SRM Institute of Science and Technology. Built with zero cloud latency, high-performance SQLite WAL storage, and intuitive QR checkouts, it eliminates physical queues and optimizes library operations across Kattankulathur campus.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0' }}>
                <Check size={16} color="#10b981" />
                <span>Zero Cloud Dependency</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0' }}>
                <Check size={16} color="#10b981" />
                <span>Instant QR Reticle Scanning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0' }}>
                <Check size={16} color="#10b981" />
                <span>100% Offline-First Architecture</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16
          }}>
            <div style={{
              background: 'rgba(8, 12, 20, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginBottom: 4 }}>30+</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Core Reference Volumes</div>
            </div>
            <div style={{
              background: 'rgba(8, 12, 20, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#06b6d4', marginBottom: 4 }}>500+</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>SRM IST Scholars</div>
            </div>
            <div style={{
              background: 'rgba(8, 12, 20, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#34d399', marginBottom: 4 }}>0ms</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Local-First Latency</div>
            </div>
            <div style={{
              background: 'rgba(8, 12, 20, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b', marginBottom: 4 }}>100%</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '30px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        background: 'rgba(8, 12, 20, 0.95)',
        position: 'relative',
        zIndex: 20,
        fontSize: 13,
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>LibraX v2.4 • Newton School Coding Club SRM IST</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span 
            onClick={() => scrollToSection(heroRef)}
            style={{ cursor: 'pointer', transition: 'color 150ms' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#64748b'}
          >
            Back to Top
          </span>
          <span 
            onClick={() => { playClick(); setActiveModal('contact'); }}
            style={{ cursor: 'pointer', transition: 'color 150ms' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#64748b'}
          >
            Help Desk
          </span>
          <span 
            onClick={() => { playClick(); focusAuthCard(); }}
            style={{ cursor: 'pointer', color: '#10b981', fontWeight: 600 }}
          >
            Sign In Portal
          </span>
        </div>
      </footer>

      {/* ── INTERACTIVE MODAL OVERLAYS ── */}
      <AnimatePresence>
        {activeModal && (
          <div 
            onClick={() => setActiveModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: activeModal === 'search' ? 680 : 500,
                background: 'rgba(14, 22, 38, 0.96)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: '28px 24px',
                boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.8)',
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => { playClick(); setActiveModal(null); }}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>

              {/* MODAL 1: Quick QR Operations */}
              {activeModal === 'qr' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <QrCode size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Quick QR Operations</h3>
                      <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Instant Book Checkout & Return Simulation</p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(8, 12, 20, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: 20,
                    textAlign: 'center',
                    marginBottom: 18
                  }}>
                    <div style={{
                      width: 160,
                      height: 160,
                      margin: '0 auto 16px',
                      background: '#ffffff',
                      borderRadius: 12,
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* SVG QR Code Simulation */}
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect x="10" y="10" width="25" height="25" fill="#080c14" />
                        <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                        <rect x="18" y="18" width="9" height="9" fill="#080c14" />
                        <rect x="65" y="10" width="25" height="25" fill="#080c14" />
                        <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                        <rect x="73" y="18" width="9" height="9" fill="#080c14" />
                        <rect x="10" y="65" width="25" height="25" fill="#080c14" />
                        <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                        <rect x="18" y="73" width="9" height="9" fill="#080c14" />
                        <rect x="42" y="15" width="8" height="15" fill="#080c14" />
                        <rect x="42" y="42" width="16" height="16" fill="#10b981" />
                        <rect x="65" y="42" width="12" height="6" fill="#080c14" />
                        <rect x="65" y="55" width="25" height="10" fill="#080c14" />
                        <rect x="42" y="70" width="10" height="20" fill="#080c14" />
                        <rect x="60" y="75" width="30" height="15" fill="#080c14" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
                      ACTIVE PASS: RA2311003030001
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Hold up to any campus kiosk or scan via the in-app camera reticle.
                    </div>
                  </div>

                  <button
                    onClick={focusAuthCard}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 10,
                      background: '#10b981',
                      color: '#080c14',
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: 'pointer'
                    }}
                  >
                    Log In to Launch Real Scanner
                  </button>
                </div>
              )}

              {/* MODAL 2: Smart Search & Discovery */}
              {activeModal === 'search' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(6, 182, 212, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#06b6d4'
                    }}>
                      <Search size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Instant Repository Search</h3>
                      <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Search all 30 titles across algorithms, ML, systems, and math</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(8, 12, 20, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16
                  }}>
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      placeholder="Type book name, author, or category (e.g. Algorithms)..."
                      autoFocus
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

                  <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredCatalog.length > 0 ? (
                      filteredCatalog.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBook(b);
                            setActiveModal('book_detail');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{b.title}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{b.author} • {b.category}</div>
                          </div>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: b.available_copies > 0 ? '#10b981' : '#f43f5e'
                          }}>
                            {b.available_copies > 0 ? `Shelf ${b.shelf_location}` : 'Issued'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>
                        No books matching "{searchFilter}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODAL 3: Real-time Transactions */}
              {activeModal === 'realtime' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f59e0b'
                    }}>
                      <Activity size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Real-time Transactions</h3>
                      <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Circulation status, fine calculator, & loan timelines</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: 'rgba(8, 12, 20, 0.8)', padding: 14, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Standard Loan Duration</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', marginTop: 4 }}>14 Days</div>
                    </div>
                    <div style={{ background: 'rgba(8, 12, 20, 0.8)', padding: 14, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Overdue Fine Rate</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>₹2.00 / day</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 18 }}>
                    Transactions are computed with automated due-date telemetry and logged directly to local persistent storage. Instant one-tap returns clear outstanding fines immediately.
                  </p>

                  <button
                    onClick={focusAuthCard}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 10,
                      background: '#10b981',
                      color: '#080c14',
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: 'pointer'
                    }}
                  >
                    Sign In to View Your Active Loans
                  </button>
                </div>
              )}

              {/* MODAL 4: Secure & Offline (SQLite) */}
              {activeModal === 'offline' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8b5cf6'
                    }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Secure & Offline (SQLite)</h3>
                      <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Zero cloud dependencies • 100% Local Reliability</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(8, 12, 20, 0.8)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 18 }}>
                    <div style={{ fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.6 }}>
                      • <strong>SQLite WAL Mode</strong>: Write-Ahead Logging for high-concurrency campus requests.<br />
                      • <strong>Zero External Cloud</strong>: No Firebase, no Supabase, no external vendor lock-in.<br />
                      • <strong>Local-First Fallback</strong>: Seamless client storage ensures the system never crashes even during Wi-Fi dropouts.
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal(null)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer'
                    }}
                  >
                    Close Specs
                  </button>
                </div>
              )}

              {/* MODAL 5: Contact & Help Desk */}
              {activeModal === 'contact' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <Phone size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>SRM IST Library Help Desk</h3>
                      <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Kattankulathur Central Library Support</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
                      <MapPin size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Central Library 1st Floor, University Building, SRM IST Kattankulathur - 603203</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
                      <Clock size={16} color="#10b981" style={{ flexShrink: 0 }} />
                      <span>Mon - Sat: 8:00 AM – 10:00 PM | Sun: 9:00 AM – 4:00 PM</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
                      <Mail size={16} color="#10b981" style={{ flexShrink: 0 }} />
                      <a href="mailto:library.helpdesk@srmist.edu.in" style={{ color: '#10b981', textDecoration: 'underline' }}>
                        library.helpdesk@srmist.edu.in
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal(null)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 10,
                      background: '#10b981',
                      color: '#080c14',
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* MODAL 6: Forgot Password */}
              {activeModal === 'forgot' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f59e0b'
                    }}>
                      <KeyRound size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Account Recovery</h3>
                      <p style={{ fontSize: 12.5, color: '#94a3b8' }}>SRM IST Student Identity Verification</p>
                    </div>
                  </div>

                  {!resetSuccess ? (
                    <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                          SRM Registration Number
                        </label>
                        <input
                          type="text"
                          value={resetRegNo}
                          onChange={e => setResetRegNo(e.target.value)}
                          placeholder="e.g. RA2311003030002"
                          required
                          style={{
                            width: '100%',
                            background: 'rgba(8, 12, 20, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 9,
                            padding: '10px 14px',
                            color: '#ffffff',
                            fontSize: 13.5,
                            textTransform: 'uppercase'
                          }}
                        />
                      </div>

                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Notice: For demo access, select any role pill on the login screen to auto-fill credentials.
                      </div>

                      <button
                        type="submit"
                        style={{
                          padding: '11px',
                          borderRadius: 10,
                          background: '#10b981',
                          color: '#080c14',
                          fontWeight: 800,
                          fontSize: 13.5,
                          cursor: 'pointer'
                        }}
                      >
                        Generate Temporary Access Pass
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ fontSize: 14, color: '#10b981', fontWeight: 700, marginBottom: 8 }}>
                        ✓ Temporary Verification Approved
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                        Use password <strong>student123</strong> to log into your account.
                      </p>
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          setResetSuccess(false);
                          setPassword('student123');
                        }}
                        style={{
                          padding: '10px 20px',
                          borderRadius: 9,
                          background: '#10b981',
                          color: '#080c14',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        Return to Sign In
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODAL 7: Book Detail Preview */}
              {activeModal === 'book_detail' && selectedBook && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 48,
                      height: 64,
                      borderRadius: 6,
                      background: `linear-gradient(135deg, ${selectedBook.cover_color}, ${selectedBook.cover_color}88)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: 11,
                      flexShrink: 0
                    }}>
                      {selectedBook.id}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                        {selectedBook.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>
                        by {selectedBook.author} ({selectedBook.published_year})
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 16 }}>
                    {selectedBook.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                    <div style={{ background: 'rgba(8, 12, 20, 0.7)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Shelf Location</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{selectedBook.shelf_location}</div>
                    </div>
                    <div style={{ background: 'rgba(8, 12, 20, 0.7)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Category</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{selectedBook.category}</div>
                    </div>
                    <div style={{ background: 'rgba(8, 12, 20, 0.7)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Availability</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: selectedBook.available_copies > 0 ? '#10b981' : '#f43f5e', marginTop: 2 }}>
                        {selectedBook.available_copies} of {selectedBook.total_copies}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={focusAuthCard}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 10,
                      background: '#10b981',
                      color: '#080c14',
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: 'pointer'
                    }}
                  >
                    Sign In to Check Out This Book
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
