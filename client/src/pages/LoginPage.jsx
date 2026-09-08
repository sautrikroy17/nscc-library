import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';

const DEMO_ACCOUNTS = [
  { label: '📚 Librarian (Admin)', email: 'admin@nscc.srmist.edu.in', password: 'nscc2024', role: 'librarian', color: '#8b5cf6' },
  { label: '🎓 Dr. Rajesh Kumar', email: 'librarian@srmist.edu.in', password: 'librarian123', role: 'librarian', color: '#8b5cf6' },
  { label: '👨‍💻 Student – Sautrik Roy', email: 'sr9973@srmist.edu.in', password: 'student123', role: 'student', color: '#10b981' },
  { label: '👨‍💻 Student – Pranav Sharma', email: 'pranav@srmist.edu.in', password: 'student123', role: 'student', color: '#10b981' },
];

const FEATURES = [
  { icon: '📖', title: 'Smart Catalog', desc: '30+ curated books with live availability tracking' },
  { icon: '📱', title: 'QR Scanner', desc: 'Instant issue & return via camera QR scanning' },
  { icon: '📊', title: 'Analytics', desc: 'Real-time dashboard with overdue & fine tracking' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Groq-powered semantic search & recommendations' },
  { icon: '📤', title: 'Export Data', desc: 'One-click CSV & Excel transaction reports' },
  { icon: '⚡', title: 'Instant Updates', desc: 'Live inventory sync on every issue & return' },
];

// Floating book particles for background
function Particle({ style }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'rgba(16,185,129,0.3)',
        ...style,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: style.dur || 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: style.delay || 0,
      }}
    />
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'demo'
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      dur: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back! Login successful 🎉');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setLoading(true);
    try {
      await login(account.email, account.password);
      toast.success(`Logged in as ${account.label.replace(/^.{2}/, '')} 🎉`);
    } catch (err) {
      toast.error('Demo login failed — make sure the server is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Left hero panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="desktop-only"
      >
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          top: '10%',
          left: '-10%',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}
        >
          <div style={{
            width: 52,
            height: 52,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            boxShadow: '0 0 30px rgba(16,185,129,0.4)',
          }}>📚</div>
          <div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 22,
              color: 'var(--text)',
              letterSpacing: '-0.5px',
            }}>LibraX</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Newton School Coding Club · SRM IST
            </div>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: 48,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 20,
            color: 'var(--text)',
          }}>
            Your Smart<br />
            <span style={{
              background: 'linear-gradient(135deg, #34d399, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Library Hub</span>
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--text-3)',
            lineHeight: 1.7,
            maxWidth: 420,
            marginBottom: 48,
          }}>
            AI-powered book management, real-time QR scanning, and intelligent analytics — 
            all in one seamless platform built for NSCC SRM IST.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 480 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 16px',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right login panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 44px',
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(24px)',
          position: 'relative',
        }}
      >
        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mobile-only"
          style={{ display: 'none', alignItems: 'center', gap: 12, marginBottom: 32 }}
        >
          <div style={{
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}>📚</div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>LibraX</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.5 }}>Newton School Coding Club · SRM IST</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: 'var(--text)',
            marginBottom: 6,
            letterSpacing: '-0.5px',
          }}>Welcome back 👋</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 30 }}>
            Sign in to your library account to continue
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 28,
            gap: 4,
          }}
        >
          {[['login', '🔐 Sign In'], ['demo', '🚀 Demo Accounts']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-3)',
              }}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input
                    type="email"
                    className="input"
                    placeholder="yourname@srmist.edu.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: 42 }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 15, marginTop: 4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="spinner" /> Signing in...
                  </span>
                ) : 'Sign In →'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="demo-accounts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 4 }}>
                Click any account below to instantly log in with demo credentials:
              </p>
              {DEMO_ACCOUNTS.map((account, i) => (
                <motion.button
                  key={account.email}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleDemoLogin(account)}
                  disabled={loading}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid var(--border)`,
                    borderLeft: `3px solid ${account.color}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 200ms ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.borderColor = account.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.borderLeft = `3px solid ${account.color}`;
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.borderLeftColor = account.color;
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>{account.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{account.email}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: account.role === 'librarian' ? 'rgba(139,92,246,0.12)' : 'rgba(16,185,129,0.12)',
                    color: account.role === 'librarian' ? '#8b5cf6' : '#10b981',
                  }}>
                    {account.role}
                  </span>
                </motion.button>
              ))}

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
                  <div className="spinner" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 28,
            padding: '12px 16px',
            background: 'var(--accent-soft)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--accent)',
            lineHeight: 1.6,
          }}
        >
          <strong>🔑 Demo credentials:</strong><br/>
          Librarian: <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>admin@nscc.srmist.edu.in</code> / <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>nscc2024</code><br/>
          Student: <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>sr9973@srmist.edu.in</code> / <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>student123</code>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ fontSize: 11.5, color: 'var(--text-4)', textAlign: 'center', marginTop: 24 }}
        >
          Built with ❤️ for Newton School Coding Club · SRM IST
        </motion.p>
      </motion.div>
    </div>
  );
}
