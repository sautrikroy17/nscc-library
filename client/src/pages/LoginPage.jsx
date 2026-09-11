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
  Share2,
  Play,
  Star,
  BookMarked,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';
import { INITIAL_BOOKS } from '../data/seedData';
import BookCover from '../components/BookCover';

const ROLE_DEMOS = {
  student: {
    email: 'ra2511003010052@srmist.edu.in',
    password: 'student123',
    name: 'Sautrik Roy',
    reg: 'RA2511003010052'
  },
  librarian: {
    email: 'librarian@srmist.edu.in',
    password: 'librarian123',
    name: 'Dr. Rajesh Kumar',
    reg: 'LIB-SRM-042'
  },
  admin: {
    email: 'admin@nscc.srmist.edu.in',
    password: 'nscc2024',
    name: 'Admin Librarian',
    reg: 'ADM-SYS-001'
  }
};

const FEATURE_CARDS = [
  {
    id: 'search',
    icon: Search,
    title: 'Smart Search & Discovery',
    desc: 'Instant full-text indexing, fuzzy search by title, author, or ISBN, with intelligent shelf location mapping across physical stacks.'
  },
  {
    id: 'qr',
    icon: QrCode,
    title: 'QR Issue & Return',
    desc: 'Lightning-fast contactless checkout. Scan turnstiles or book barcodes with your phone for instant verified circulation slips.'
  },
  {
    id: 'realtime',
    icon: Activity,
    title: 'Real-time Availability',
    desc: 'Live stack counters, floor plan shelf navigation (Zone A-101 to D-401), and automatic queue reservation notifications.'
  },
  {
    id: 'secure',
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    desc: 'SRM IST verified SSO authentication, role-based controls for students and faculty, offline SQLite fallback, and audit logging.'
  }
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Search', desc: 'Browse or search over 10,000+ textbooks, journals, and tech publications in real-time.' },
  { step: '02', title: 'Borrow', desc: 'Tap to reserve or scan at physical kiosk turnstiles using your personal digital student QR pass.' },
  { step: '03', title: 'Return', desc: '24/7 automated return drop-box check-in with instantaneous fine waivers and digital receipts.' },
  { step: '04', title: 'Grow', desc: 'Track your reading velocity, explore AI-tailored study roadmaps, and earn campus academic badges.' }
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

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'demo' | 'feature' | 'book_detail' | 'forgot' | 'contact'
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [navActive, setNavActive] = useState('home');

  // Search input on landing page
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Registration form
  const [regName, setRegName] = useState('Sautrik Roy');
  const [regEmail, setRegEmail] = useState('ra2511003010052@srmist.edu.in');
  const [regNumber, setRegNumber] = useState('RA2511003010052');
  const [regDept, setRegDept] = useState('CSE');
  const [regPassword, setRegPassword] = useState('student123');

  // Password recovery form
  const [resetRegNo, setResetRegNo] = useState('RA2511003010052');
  const [resetSuccess, setResetSuccess] = useState(false);

  // References for smooth scrolling
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const workflowRef = useRef(null);
  const booksRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const handleRoleSelect = (role) => {
    playClick();
    setSelectedRole(role);
    setEmail(ROLE_DEMOS[role].email);
    setPassword(ROLE_DEMOS[role].password);
    toast.info(`Switched to ${role.charAt(0).toUpperCase() + role.slice(1)}: ${ROLE_DEMOS[role].name}`);
  };

  const scrollToSection = (ref, sectionKey) => {
    playClick();
    setNavActive(sectionKey);
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openAuth = (mode = 'signin', role = 'student') => {
    playClick();
    setAuthMode(mode);
    setSelectedRole(role);
    setEmail(ROLE_DEMOS[role].email);
    setPassword(ROLE_DEMOS[role].password);
    setShowAuthModal(true);
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
      toast.success(`Welcome to LibraX, ${user.name || 'Sautrik Roy'}!`);
      setShowAuthModal(false);
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
      setShowAuthModal(false);
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
    toast.success(`Password reset PIN sent to official SRM email for ${resetRegNo.toUpperCase()}`);
    setTimeout(() => {
      setResetSuccess(false);
      setActiveModal(null);
      openAuth('signin');
    }, 2000);
  };

  // Filtered books for search bar
  const searchedBooks = searchQuery.trim() 
    ? INITIAL_BOOKS.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#111827',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* ── Top Navigation Bar (Matching media_1789145954159.jpg) ── */}
      <header style={{
        height: 72,
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}>
        {/* Left: Brand Logo */}
        <div 
          onClick={() => scrollToSection(heroRef, 'home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <BookOpen size={17} strokeWidth={2.4} />
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 21,
            color: '#111827',
            letterSpacing: '-0.5px'
          }}>
            LibraX
          </span>
        </div>

        {/* Center: Nav Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          fontSize: 14.5
        }} className="desktop-only">
          <button 
            onClick={() => scrollToSection(heroRef, 'home')}
            style={{ 
              color: navActive === 'home' ? '#111827' : '#6b7280', 
              fontWeight: navActive === 'home' ? 700 : 500,
              paddingBottom: 4,
              borderBottom: navActive === 'home' ? '2px solid #111827' : '2px solid transparent',
              transition: 'all 150ms'
            }}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection(featuresRef, 'features')}
            style={{ 
              color: navActive === 'features' ? '#111827' : '#6b7280', 
              fontWeight: navActive === 'features' ? 700 : 500,
              paddingBottom: 4,
              borderBottom: navActive === 'features' ? '2px solid #111827' : '2px solid transparent',
              transition: 'all 150ms' 
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#111827'} 
            onMouseLeave={e => e.currentTarget.style.color = navActive === 'features' ? '#111827' : '#6b7280'}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection(aboutRef, 'about')}
            style={{ 
              color: navActive === 'about' ? '#111827' : '#6b7280', 
              fontWeight: navActive === 'about' ? 700 : 500,
              paddingBottom: 4,
              borderBottom: navActive === 'about' ? '2px solid #111827' : '2px solid transparent',
              transition: 'all 150ms' 
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#111827'} 
            onMouseLeave={e => e.currentTarget.style.color = navActive === 'about' ? '#111827' : '#6b7280'}
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection(contactRef, 'contact')}
            style={{ 
              color: navActive === 'contact' ? '#111827' : '#6b7280', 
              fontWeight: navActive === 'contact' ? 700 : 500,
              paddingBottom: 4,
              borderBottom: navActive === 'contact' ? '2px solid #111827' : '2px solid transparent',
              transition: 'all 150ms' 
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#111827'} 
            onMouseLeave={e => e.currentTarget.style.color = navActive === 'contact' ? '#111827' : '#6b7280'}
          >
            Contact
          </button>
        </nav>

        {/* Right: Search + Sign In + Get Started Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Quick Search trigger */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowSearchDropdown(!showSearchDropdown)}
              title="Search Catalog"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4b5563',
                background: '#f3f4f6',
                transition: 'all 150ms'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#111827'}
              onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
            >
              <Search size={17} />
            </button>

            {/* Quick search popup */}
            {showSearchDropdown && (
              <div style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 320,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: 12,
                zIndex: 60
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
                  <Search size={15} color="#9ca3af" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search titles, authors..."
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      width: '100%',
                      background: 'transparent'
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ color: '#9ca3af', fontSize: 14 }}>✕</button>
                  )}
                </div>
                {searchedBooks.length > 0 ? (
                  <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {searchedBooks.map(b => (
                      <div 
                        key={b.id}
                        onClick={() => {
                          setSelectedBook(b);
                          setActiveModal('book_detail');
                          setShowSearchDropdown(false);
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 12.5
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <BookOpen size={14} color="#6b7280" />
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{b.title}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{b.author}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div style={{ padding: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>No books found</div>
                ) : null}
              </div>
            )}
          </div>

          {/* Sign In text link */}
          <button 
            onClick={() => openAuth('signin', 'student')}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#111827',
              padding: '8px 14px',
              transition: 'color 150ms'
            }}
          >
            Sign In
          </button>

          {/* Get Started Pill Button */}
          <button 
            onClick={() => openAuth('signin', 'student')}
            style={{
              padding: '9px 20px',
              borderRadius: 9999,
              background: '#111827',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              transition: 'transform 120ms, background 120ms'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1f2937'}
            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
          >
            Get Started
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── HERO SECTION: Exact Match to media_1789145954159.jpg & media_1789145647414.png ── */}
      <section 
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: 560,
          background: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch'
        }}
      >
        {/* Left Column: Headline, Description, CTAs, Stats, Quote */}
        <div style={{
          flex: '1 1 54%',
          padding: '56px 48px 48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 10,
          maxWidth: 720
        }}>
          {/* Eyebrow badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#6b7280',
            marginBottom: 16
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            SRM IST Central Library System · NSCC
          </div>

          {/* Headline in Serif (Playfair Display) */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: 50,
            lineHeight: 1.15,
            color: '#111827',
            letterSpacing: '-0.5px',
            margin: 0
          }}>
            More Than Books.<br />
            A Brighter You.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 16.5,
            lineHeight: 1.6,
            color: '#4b5563',
            marginTop: 18,
            marginBottom: 28,
            maxWidth: 500
          }}>
            A modern library management system for a smarter, more connected campus. Discover, borrow, learn and grow with LibraX.
          </p>

          {/* CTA Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            {/* Get Started Button */}
            <button
              onClick={() => openAuth('signin', 'student')}
              style={{
                padding: '13px 28px',
                borderRadius: 9999,
                background: '#111827',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(17, 24, 39, 0.15)',
                transition: 'all 150ms'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'none'; }}
            >
              Get Started
              <ArrowRight size={16} />
            </button>

            {/* Watch Demo Button */}
            <button
              onClick={() => { playClick(); setActiveModal('demo'); }}
              style={{
                padding: '12px 24px',
                borderRadius: 9999,
                background: '#ffffff',
                color: '#111827',
                border: '1.5px solid #e5e7eb',
                fontWeight: 600,
                fontSize: 14.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 150ms'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Play size={11} fill="#111827" stroke="none" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Key Metrics Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            paddingTop: 24,
            borderTop: '1px solid #f1f5f9',
            marginBottom: 28
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>10K+</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>Books Available</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>3K+</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>Active Students</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>24/7</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>Digital Access</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Smarter</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>Learning</div>
            </div>
          </div>

          {/* Quote Card (Marcus Tullius Cicero) */}
          <div style={{
            background: '#fafaf9',
            border: '1px solid #f0f0ee',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: '#4b5563',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 500
          }}>
            <span style={{ fontSize: 20, color: '#9ca3af', lineHeight: 1 }}>“</span>
            <div>
              <div>A room without books is like a body without a soul.</div>
              <div style={{ fontStyle: 'normal', fontWeight: 600, fontSize: 11.5, color: '#111827', marginTop: 2 }}>
                — Marcus Tullius Cicero
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exact Modern Library Photo with Left Edge Fade Mask */}
        <div style={{
          flex: '1 1 46%',
          position: 'relative',
          minHeight: 520,
          background: '#ffffff',
          overflow: 'hidden'
        }}>
          {/* Main Photo with smooth CSS gradient mask on left edge */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/hero_photo_exact.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 8%, rgba(0,0,0,0.8) 25%, black 45%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 8%, rgba(0,0,0,0.8) 25%, black 45%)'
          }} />

          {/* Column Badge: Good Books Better People */}
          <div style={{
            position: 'absolute',
            top: 36,
            right: 44,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.85)',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
            zIndex: 5
          }}>
            Good Books Better People
          </div>

          {/* Bottom Right Floating Badge: Explore Learn Grow Belong */}
          <div style={{
            position: 'absolute',
            bottom: 24,
            right: 32,
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '1px',
            zIndex: 5,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
          }}>
            Explore · Learn · Grow · Belong
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION: Why LibraX? (4 Cards Grid) ── */}
      <section 
        ref={featuresRef}
        style={{
          padding: '80px 48px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#6b7280',
              display: 'block',
              marginBottom: 8
            }}>
              CAMPUS INTELLIGENCE
            </span>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 36,
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              Why LibraX?
            </h2>
            <p style={{
              fontSize: 15.5,
              color: '#64748b',
              marginTop: 10,
              maxWidth: 580,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Engineered specifically for the ambitious students, researchers, and faculty of SRM Institute of Science and Technology.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24
          }}>
            {FEATURE_CARDS.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.id}
                  onClick={() => {
                    playClick();
                    setSelectedFeature(feat);
                    setActiveModal('feature');
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '28px 24px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111827',
                    marginBottom: 18
                  }}>
                    <IconComp size={22} strokeWidth={2} />
                  </div>
                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 10px 0'
                  }}>
                    {feat.title}
                  </h3>
                  <p style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: '#64748b',
                    margin: 0
                  }}>
                    {feat.desc}
                  </p>
                  <div style={{
                    marginTop: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#111827'
                  }}>
                    Learn more <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW LIBRAX WORKS: 4 Steps Horizontal Flow ── */}
      <section 
        ref={workflowRef}
        style={{
          padding: '80px 48px',
          background: '#ffffff'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#6b7280',
              display: 'block',
              marginBottom: 8
            }}>
              SEAMLESS WORKFLOW
            </span>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 36,
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              How LibraX Works
            </h2>
            <p style={{
              fontSize: 15.5,
              color: '#64748b',
              marginTop: 10,
              maxWidth: 580,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Four frictionless steps from discovering a breakthrough paper to earning your degree.
            </p>
          </div>

          {/* 4 Process Step Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            position: 'relative'
          }}>
            {WORKFLOW_STEPS.map((s) => (
              <div 
                key={s.step}
                style={{
                  background: '#fafaf9',
                  border: '1px solid #f0f0ee',
                  borderRadius: 16,
                  padding: '30px 24px',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#e2e8f0',
                  marginBottom: 12
                }}>
                  {s.step}
                </div>
                <h4 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: 8
                }}>
                  {s.title}
                </h4>
                <p style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: '#64748b',
                  margin: 0
                }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED IN OUR LIBRARY (Carousel of Popular Books) ── */}
      <section 
        ref={booksRef}
        style={{
          padding: '80px 48px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between',
            marginBottom: 44
          }}>
            <div>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#6b7280',
                display: 'block',
                marginBottom: 8
              }}>
                ACADEMIC STACKS
              </span>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 34,
                fontWeight: 700,
                color: '#111827',
                margin: 0
              }}>
                Featured in Our Library
              </h2>
            </div>
            <button
              onClick={() => openAuth('signin', 'student')}
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Explore all 10,000+ books <ArrowRight size={14} />
            </button>
          </div>

          {/* Book Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 20
          }}>
            {INITIAL_BOOKS.slice(0, 5).map((book) => (
              <div
                key={book.id}
                onClick={() => {
                  playClick();
                  setSelectedBook(book);
                  setActiveModal('book_detail');
                }}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.07)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                }}
              >
                {/* Book Cover */}
                <div style={{
                  height: 190,
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginBottom: 14,
                  position: 'relative'
                }}>
                  <BookCover bookId={book.id} title={book.title} author={book.author} height="100%" />
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {book.category}
                </div>
                <h4 style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: '#111827',
                  margin: '4px 0 2px 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {book.title}
                </h4>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 12 }}>
                  {book.author}
                </div>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid #f1f5f9',
                  fontSize: 12
                }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    {book.available_copies} available
                  </span>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 11.5
                  }}>
                    Borrow
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSPIRATIONAL QUOTE BANNER ── */}
      <section style={{
        padding: '60px 48px',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: '#fafaf9',
          border: '1px solid #f0f0ee',
          borderRadius: 20,
          padding: '40px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 36,
          flexWrap: 'wrap'
        }}>
          {/* Left: Stacked books image */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <img 
              src="/book_stack_quote.jpg" 
              alt="Books" 
              style={{
                width: 110,
                height: 80,
                objectFit: 'cover',
                borderRadius: 12,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)'
              }}
              onError={e => e.currentTarget.style.display = 'none'}
            />
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontStyle: 'italic',
                color: '#111827',
                lineHeight: 1.3
              }}>
                “Books open doors to new worlds.”
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                Read. Learn. Grow. Together at SRM IST Central Library.
              </div>
            </div>
          </div>

          {/* Right: Join Portal Button */}
          <button
            onClick={() => openAuth('signin', 'student')}
            style={{
              padding: '12px 24px',
              borderRadius: 9999,
              background: '#111827',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            Access Library Portal <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── FOOTER: SRM IST Central Library & NSCC ── */}
      <footer 
        ref={contactRef}
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '60px 48px 30px 48px'
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 36,
          marginBottom: 48
        }}>
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a'
              }}>
                <BookOpen size={18} strokeWidth={2.4} />
              </div>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: '#ffffff'
              }}>
                LibraX
              </span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>
              The official next-generation central library automation and research portal for SRM Institute of Science and Technology.
            </p>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 16 }}>
              Authored by <strong style={{ color: '#ffffff' }}>Sautrik Roy</strong> (RA2511003010052)
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h5 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 14 }}>
              Quick Links
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5, color: '#cbd5e1' }}>
              <button onClick={() => scrollToSection(heroRef, 'home')} style={{ textAlign: 'left', color: '#cbd5e1' }}>Home</button>
              <button onClick={() => scrollToSection(featuresRef, 'features')} style={{ textAlign: 'left', color: '#cbd5e1' }}>Features</button>
              <button onClick={() => scrollToSection(booksRef, 'books')} style={{ textAlign: 'left', color: '#cbd5e1' }}>Academic Catalog</button>
              <button onClick={() => openAuth('signin', 'student')} style={{ textAlign: 'left', color: '#cbd5e1' }}>Student Portal</button>
              <button onClick={() => openAuth('signin', 'librarian')} style={{ textAlign: 'left', color: '#cbd5e1' }}>Librarian Desk</button>
            </div>
          </div>

          {/* Col 3: SRM Campus */}
          <div>
            <h5 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 14 }}>
              Campus Facilities
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5, color: '#cbd5e1' }}>
              <div>Zone A: Algorithms & Theory</div>
              <div>Zone B: Software Engineering</div>
              <div>Zone C: Computer Networks</div>
              <div>Zone D: Artificial Intelligence</div>
              <div>24/7 Digital Kiosks & QR Turnstiles</div>
            </div>
          </div>

          {/* Col 4: Contact & Help */}
          <div>
            <h5 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 14 }}>
              Contact & Support
            </h5>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#94a3b8' }}>
              <div>Central Library Building, Ground Floor</div>
              <div>SRM IST Kattankulathur Campus</div>
              <div style={{ marginTop: 8 }}>Email: library@srmist.edu.in</div>
              <div>Phone: +91 44 2741 7000</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          paddingTop: 24,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12.5,
          color: '#64748b',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            © 2026 LibraX · SRM Institute of Science and Technology · Newton School Coding Club.
          </div>
          <div>
            Designed for Student Excellence · All Rights Reserved
          </div>
        </div>
      </footer>

      {/* ── EXACT SCREEN 2: LOGIN MODAL (Matching media_1789145323183.jpg Screen 2) ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%',
                maxWidth: 860,
                background: '#ffffff',
                borderRadius: 20,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                minHeight: 520,
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  zIndex: 20,
                  transition: 'background 120ms'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <X size={16} />
              </button>

              {/* LEFT HALF: Form */}
              <div style={{
                flex: '1 1 52%',
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                {/* Header with LibraX branding */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <BookOpen size={14} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
                    LibraX · SRM IST Library
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 6px 0'
                }}>
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Student Account'}
                </h2>
                <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 20px 0' }}>
                  {authMode === 'signin' ? 'Sign in to your campus library account' : 'Register with your SRM registration number'}
                </p>

                {/* Role Switcher Tabs */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 4,
                  background: '#f1f5f9',
                  padding: 4,
                  borderRadius: 10,
                  marginBottom: 20
                }}>
                  {(['student', 'librarian', 'admin']).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      style={{
                        padding: '6px 0',
                        fontSize: 12.5,
                        fontWeight: selectedRole === role ? 700 : 500,
                        color: selectedRole === role ? '#111827' : '#64748b',
                        background: selectedRole === role ? '#ffffff' : 'transparent',
                        borderRadius: 7,
                        boxShadow: selectedRole === role ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                        textTransform: 'capitalize',
                        transition: 'all 120ms'
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {authMode === 'signin' ? (
                  /* SIGN IN FORM */
                  <form onSubmit={handleLoginSubmit}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Email or Registration ID
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        border: '1.5px solid #e5e7eb',
                        borderRadius: 9,
                        padding: '9px 12px',
                        background: '#ffffff'
                      }}>
                        <Mail size={15} color="#9ca3af" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="ra2511003010052@srmist.edu.in"
                          style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: 13,
                            color: '#111827'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => { playClick(); setActiveModal('forgot'); }}
                          style={{ fontSize: 11.5, color: '#4b5563', fontWeight: 500 }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        border: '1.5px solid #e5e7eb',
                        borderRadius: 9,
                        padding: '9px 12px',
                        background: '#ffffff'
                      }}>
                        <Lock size={15} color="#9ca3af" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: 13,
                            color: '#111827'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ color: '#9ca3af' }}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#111827', cursor: 'pointer' }}
                      />
                      <label htmlFor="rememberMe" style={{ fontSize: 12.5, color: '#6b7280', cursor: 'pointer' }}>
                        Remember me for 30 days
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: 9999,
                        background: '#111827',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                        cursor: loading ? 'wait' : 'pointer'
                      }}
                    >
                      {loading ? 'Authenticating...' : 'Sign In →'}
                    </button>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegisterSubmit}>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Full Name</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Sautrik Roy"
                        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 3 }}>SRM Email</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="ra2511003010052@srmist.edu.in"
                        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Reg No</label>
                        <input
                          type="text"
                          value={regNumber}
                          onChange={e => setRegNumber(e.target.value)}
                          placeholder="RA2511003010052"
                          style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Dept</label>
                        <select
                          value={regDept}
                          onChange={e => setRegDept(e.target.value)}
                          style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff' }}
                        >
                          <option value="CSE">CSE</option>
                          <option value="IT">IT</option>
                          <option value="ECE">ECE</option>
                          <option value="MECH">MECH</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Password</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: 9999,
                        background: '#111827',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: 14
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Complete Registration →'}
                    </button>
                  </form>
                )}

                {/* SRM Single Sign-On */}
                <div style={{ marginTop: 14 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    margin: '12px 0',
                    fontSize: 11.5,
                    color: '#9ca3af'
                  }}>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    <span>or continue with</span>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSuccessChime();
                      toast.success('SRM IST SSO Verified: Sautrik Roy (RA2511003010052)');
                      login('ra2511003010052@srmist.edu.in', 'student123');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: 9999,
                      border: '1.5px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#374151',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <GraduationCap size={16} color="#111827" />
                    Sign in with SRM SSO
                  </button>
                </div>

                {/* Toggle sign in / register */}
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: '#6b7280' }}>
                  {authMode === 'signin' ? (
                    <>
                      New to LibraX?{' '}
                      <button
                        type="button"
                        onClick={() => { playClick(); setAuthMode('register'); }}
                        style={{ color: '#111827', fontWeight: 700 }}
                      >
                        Create an account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { playClick(); setAuthMode('signin'); }}
                        style={{ color: '#111827', fontWeight: 700 }}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT HALF: Exact Bookshelf Backdrop with Serif Quote (Margaret Fuller) */}
              <div style={{
                flex: '1 1 48%',
                background: '#111827',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '40px 36px',
                color: '#ffffff'
              }} className="desktop-only">
                {/* Bookshelf Background Image */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(/login_bookshelf.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.65
                }} />

                {/* Dark Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.2) 0%, rgba(17, 24, 39, 0.85) 100%)'
                }} />

                {/* Content over image */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 32,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    marginBottom: 12,
                    color: '#ffffff'
                  }}>
                    Today a reader,<br />
                    tomorrow a leader.
                  </div>
                  <div style={{ fontSize: 13.5, color: '#cbd5e1', fontStyle: 'italic', marginBottom: 24 }}>
                    — Margaret Fuller
                  </div>

                  {/* Student Pass Badge Preview */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <QrCode size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>
                          Sautrik Roy
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          RA2511003010052 · 2nd Year CSE
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '3px 8px',
                      borderRadius: 9999
                    }}>
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE MODAL: Book Details ── */}
      <AnimatePresence>
        {activeModal === 'book_detail' && selectedBook && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: 520,
                background: '#ffffff',
                borderRadius: 16,
                padding: 28,
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                style={{ position: 'absolute', top: 16, right: 16, color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <div style={{
                  width: 105,
                  height: 145,
                  borderRadius: 8,
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  <BookCover bookId={selectedBook.id} title={selectedBook.title} author={selectedBook.author} width="100%" height="100%" />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                    {selectedBook.category}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
                    {selectedBook.title}
                  </h3>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                    by {selectedBook.author}
                  </div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>
                    ISBN: {selectedBook.isbn || '978-0132350884'} · Shelf: {selectedBook.shelf_location || 'Zone A-101'}
                  </div>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                    {selectedBook.available_copies} of {selectedBook.total_copies} copies available
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 20 }}>
                {selectedBook.description || 'Comprehensive textbook covering foundational computational logic, robust architecture, and production-grade programming techniques.'}
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    openAuth('signin', 'student');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 9999,
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13.5
                  }}
                >
                  Sign In to Borrow →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE MODAL: Feature Details ── */}
      <AnimatePresence>
        {activeModal === 'feature' && selectedFeature && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: 480,
                background: '#ffffff',
                borderRadius: 16,
                padding: 28,
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                style={{ position: 'absolute', top: 16, right: 16, color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                {selectedFeature.title}
              </h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, marginBottom: 20 }}>
                {selectedFeature.desc}
              </p>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
                fontSize: 12.5,
                color: '#64748b',
                marginBottom: 20
              }}>
                ✓ Integrated with SRM IST Central Turnstile API<br />
                ✓ Real-time sync with Sautrik Roy's active borrowings<br />
                ✓ Works seamlessly on mobile Safari, Chrome & campus kiosks
              </div>

              <button
                onClick={() => {
                  setActiveModal(null);
                  openAuth('signin', 'student');
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 9999,
                  background: '#111827',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 13.5
                }}
              >
                Try It Live →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE MODAL: Watch Demo Walkthrough ── */}
      <AnimatePresence>
        {activeModal === 'demo' && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: 640,
                background: '#ffffff',
                borderRadius: 20,
                padding: 32,
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                style={{ position: 'absolute', top: 18, right: 18, color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Play size={14} fill="#ffffff" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
                  LibraX Interactive Experience
                </h3>
              </div>

              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, marginBottom: 20 }}>
                Experience lightning-fast campus book checkouts, turnstile access passes, and catalog discovery built for SRM Institute of Science & Technology.
              </p>

              <div style={{
                borderRadius: 12,
                overflow: 'hidden',
                background: '#0f172a',
                padding: '24px',
                color: '#ffffff',
                marginBottom: 24
              }}>
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700, marginBottom: 8 }}>
                  ✓ LIVE DEMO PREVIEW
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                  Student: Sautrik Roy · Reg: RA2511003010052
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  • 3 Active Books Borrowed (Clean Code, OS Concepts, DB Systems)<br />
                  • 0 Overdue Fines · Quota: 3/4 Books Used<br />
                  • Instant turnstile scanner access in 1 click
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    openAuth('signin', 'student');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 9999,
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  Enter Library as Sautrik Roy →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE MODAL: Forgot Password ── */}
      <AnimatePresence>
        {activeModal === 'forgot' && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: 440,
                background: '#ffffff',
                borderRadius: 16,
                padding: 28,
                position: 'relative'
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                style={{ position: 'absolute', top: 16, right: 16, color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                Reset Your Password
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                Enter your official SRM Registration Number. We will dispatch a 6-digit recovery OTP to your university mailbox.
              </p>

              <form onSubmit={handleResetSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={resetRegNo}
                    onChange={e => setResetRegNo(e.target.value)}
                    placeholder="RA2511003010052"
                    style={{
                      width: '100%',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontSize: 13.5,
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 9999,
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13.5
                  }}
                >
                  Send Recovery Link
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
