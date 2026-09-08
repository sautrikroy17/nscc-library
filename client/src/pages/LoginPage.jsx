import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import BrandLogo from '../components/BrandLogo';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';

const DEMO_ACCOUNTS = [
  {
    role: 'librarian',
    title: 'Librarian (Admin)',
    subtitle: 'Full System & Scanner Control',
    email: 'admin@nscc.srmist.edu.in',
    password: 'nscc2024',
    badge: 'ROOT ACCESS',
    color: '#8b5cf6',
  },
  {
    role: 'librarian',
    title: 'Dr. Rajesh Kumar',
    subtitle: 'Senior Librarian Staff',
    email: 'librarian@srmist.edu.in',
    password: 'librarian123',
    badge: 'STAFF',
    color: '#06b6d4',
  },
  {
    role: 'student',
    title: 'Sautrik Roy',
    subtitle: '2nd Year CSE · RA2311003030001',
    email: 'sr9973@srmist.edu.in',
    password: 'student123',
    badge: 'STUDENT',
    color: '#10b981',
  },
  {
    role: 'student',
    title: 'Pranav Sharma',
    subtitle: '2nd Year CSE · RA2311003030002',
    email: 'pranav@srmist.edu.in',
    password: 'student123',
    badge: 'STUDENT',
    color: '#10b981',
  }
];

const ARCHITECTURE_HIGHLIGHTS = [
  { icon: Database, label: 'Zero-Cloud Mandate', desc: '100% custom SQLite ACID engine (Strictly zero Firebase / Supabase)' },
  { icon: Cpu, label: 'Groq Neural AI', desc: 'Llama-3.3-70b inference for natural language book discovery and autofill' },
  { icon: QrCode, label: 'Hardware Optical Scanner', desc: 'Live camera QR scanning with Web Audio synthesizer chirp' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@nscc.srmist.edu.in');
  const [password, setPassword] = useState('nscc2024');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(0);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Please input valid credentials');
      playErrorBeep();
      return;
    }

    setLoading(true);
    playClick();

    try {
      await login(email, password);
      playSuccessChime();
      toast.success('Authentication confirmed. Welcome to LibraX!');
    } catch (err) {
      playErrorBeep();
      toast.error(err.message || 'Authentication rejected');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (acc, idx) => {
    playClick();
    setSelectedDemo(idx);
    setEmail(acc.email);
    setPassword(acc.password);
    toast.info(`Loaded credential passport for ${acc.title}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Ambient Auroras */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />

      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: 1120,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 32,
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* ── Left Showcase: Brand Identity & Telemetry ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          {/* Brand Header */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <BrandLogo size={48} animated />
              <div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: '-0.8px',
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  LibraX
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--accent-bright)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  Newton School Coding Club · SRM IST
                </div>
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1.25,
              color: 'var(--text)',
              letterSpacing: '-1px',
              marginBottom: 12
            }}>
              Intelligent Library Operations, <br />
              <span style={{
                background: 'linear-gradient(135deg, #34d399, #10b981, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Engineered for Peak Velocity.
              </span>
            </h1>

            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 480 }}>
              Hardware-accelerated optical QR scanning, Groq semantic intelligence, real-time fine calculation, and auditable SQLite transactions in a unified command interface.
            </p>
          </div>

          {/* Architectural Telemetry Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ARCHITECTURE_HIGHLIGHTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-bright)'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* One-Click Demo Passports */}
          <div>
            <div style={{
              fontSize: 11.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-3)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Radio size={12} color="var(--accent-bright)" />
              <span>Instant Demo Credential Passports (1-Click)</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 8
            }}>
              {DEMO_ACCOUNTS.map((acc, i) => {
                const isSel = selectedDemo === i;
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectDemo(acc, i)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: isSel ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSel ? '1px solid var(--accent-bright)' : '1px solid var(--border)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>
                        {acc.title}
                      </span>
                      <span style={{
                        fontSize: 8.5,
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: `${acc.color}22`,
                        color: acc.color
                      }}>
                        {acc.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Right Column: Smoked Obsidian Auth Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderTop: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 'var(--r-2xl)',
            padding: '36px 32px',
            backdropFilter: 'blur(30px) saturate(190%)',
            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative'
          }}>
            {/* Glowing top line accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: 2,
              background: 'linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)',
              boxShadow: '0 0 12px var(--accent)',
            }} />

            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: 'var(--text)',
                marginBottom: 4,
                letterSpacing: '-0.4px'
              }}>
                Authenticate Node Session
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                Enter institutional credentials to access the central repository
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email Input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  SRM / Institutional Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@nscc.srmist.edu.in"
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Secret Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    style={{ paddingLeft: 40, paddingRight: 40 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-4)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  height: 48,
                  borderRadius: 'var(--r-md)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: '0.2px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 24px rgba(16,185,129,0.35)',
                  transition: 'box-shadow 0.2s'
                }}
              >
                {loading ? (
                  <div className="spinner" style={{ borderTopColor: 'white' }} />
                ) : (
                  <>
                    <span>Enter Central Hub</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <div style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--text-4)'
            }}>
              <span>NSCC RECRUITMENT SPECIFICATION</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>256-BIT JWT</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
