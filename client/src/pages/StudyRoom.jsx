import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Flame, 
  Radio, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Target, 
  Users, 
  Flame as FireIcon, 
  Clock, 
  Coffee,
  Palette,
  Moon,
  Sun,
  Headphones
} from 'lucide-react';
import { playClick, playSuccessChime } from '../utils/audio';
import { 
  startRain, 
  startBinauralAlpha, 
  startFireplace, 
  stopSound, 
  stopAllAmbient, 
  playZenBowlChime 
} from '../utils/ambientAudio';

// Room Visual Themes
const THEMES = [
  {
    id: 'cyber',
    name: 'Obsidian Cyber',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    bg: '#080c14',
    cardBg: 'rgba(15, 22, 35, 0.85)',
    border: 'rgba(16, 185, 129, 0.25)',
    subtext: '#34d399',
  },
  {
    id: 'matcha',
    name: 'Matcha Zen',
    accent: '#84cc16',
    glow: 'rgba(132, 204, 22, 0.22)',
    bg: '#0c1209',
    cardBg: 'rgba(18, 28, 14, 0.85)',
    border: 'rgba(132, 204, 22, 0.25)',
    subtext: '#a3e635',
  },
  {
    id: 'espresso',
    name: 'Midnight Cafe',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.22)',
    bg: '#120d08',
    cardBg: 'rgba(28, 20, 14, 0.85)',
    border: 'rgba(245, 158, 11, 0.25)',
    subtext: '#fbbf24',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.25)',
    bg: '#0a0814',
    cardBg: 'rgba(20, 15, 36, 0.85)',
    border: 'rgba(139, 92, 246, 0.25)',
    subtext: '#a78bfa',
  },
  {
    id: 'arctic',
    name: 'Glacial Arctic',
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.25)',
    bg: '#060d14',
    cardBg: 'rgba(12, 25, 38, 0.85)',
    border: 'rgba(6, 182, 212, 0.25)',
    subtext: '#22d3ee',
  }
];

const TIMER_MODES = [
  { id: 'pomodoro', label: 'Deep Focus', minutes: 25, icon: Target },
  { id: 'flow', label: 'Flow Sprint', minutes: 50, icon: Sparkles },
  { id: 'short', label: 'Short Break', minutes: 5, icon: Coffee },
  { id: 'long', label: 'Zen Break', minutes: 15, icon: Moon },
];

const LIVE_STUDENTS = [
  { name: 'Sautrik Roy', role: 'You (Host)', dept: 'CSE', task: 'Algorithms & System Design', streak: '52m' },
  { name: 'Pranav Sharma', role: 'Student', dept: 'CSE', task: 'Discrete Math & Graph Theory', streak: '38m' },
  { name: 'Aryan Singh', role: 'Student', dept: 'ECE', task: 'Embedded Systems & Verilog', streak: '1h 15m' },
  { name: 'Kriti Sharma', role: 'Student', dept: 'CSE', task: 'Deep Learning & PyTorch', streak: '44m' },
];

export default function StudyRoom() {
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [currentMode, setCurrentMode] = useState(TIMER_MODES[0]);
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[0].minutes * 60);
  const [totalTime, setTotalTime] = useState(TIMER_MODES[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [activeSound, setActiveSound] = useState(null); // 'rain' | 'alpha' | 'fire'
  const [soundVolume, setSoundVolume] = useState(0.35);

  // Focus Task
  const [taskName, setTaskName] = useState('Dynamic Programming & Graph Algorithms (Cormen Ch. 22)');
  const [isTaskDone, setIsTaskDone] = useState(false);

  // Daily Statistics (persisted in localStorage)
  const [completedSessions, setCompletedSessions] = useState(() => {
    return parseInt(localStorage.getItem('librax_study_sessions') || '3', 10);
  });
  const [totalMinutes, setTotalMinutes] = useState(() => {
    return parseInt(localStorage.getItem('librax_study_minutes') || '75', 10);
  });

  // Countdown Interval
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playZenBowlChime();
      
      // Update statistics if completed a study session
      if (currentMode.id === 'pomodoro' || currentMode.id === 'flow') {
        const addedMins = currentMode.minutes;
        setCompletedSessions(s => {
          const next = s + 1;
          localStorage.setItem('librax_study_sessions', next.toString());
          return next;
        });
        setTotalMinutes(m => {
          const next = m + addedMins;
          localStorage.setItem('librax_study_minutes', next.toString());
          return next;
        });
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentMode]);

  // Clean up ambient audio on unmount
  useEffect(() => {
    return () => {
      stopAllAmbient();
    };
  }, []);

  // Mode Selection
  const selectMode = (mode) => {
    playClick();
    setCurrentMode(mode);
    setIsRunning(false);
    setTimeLeft(mode.minutes * 60);
    setTotalTime(mode.minutes * 60);
  };

  // Sound Control
  const toggleAmbient = (type) => {
    playClick();
    if (activeSound === type) {
      stopSound(type);
      setActiveSound(null);
    } else {
      stopAllAmbient();
      if (type === 'rain') startRain(soundVolume);
      if (type === 'alpha') startBinauralAlpha(soundVolume);
      if (type === 'fire') startFireplace(soundVolume);
      setActiveSound(type);
    }
  };

  // Timer formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressRatio = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  // SVG Circular Progress Constants
  const circleRadius = 140;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressRatio);

  return (
    <div 
      className={`page ${fullScreen ? 'study-fullscreen' : ''}`}
      style={{
        transition: 'background 0.4s ease',
        background: fullScreen ? currentTheme.bg : 'transparent',
        minHeight: fullScreen ? '100vh' : 'auto',
        position: fullScreen ? 'fixed' : 'relative',
        inset: fullScreen ? 0 : 'auto',
        zIndex: fullScreen ? 9999 : 1,
        padding: fullScreen ? '32px 40px' : undefined,
        overflowY: 'auto'
      }}
    >
      {/* ── Room Header Strip ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Headphones size={24} color={currentTheme.accent} />
            <span>LibraX Study Haven</span>
          </h1>
          <p className="page-subtitle">
            Aesthetic virtual library focus room with soundscapes, themes & Pomodoro telemetry
          </p>
        </div>

        {/* Action Controls: Theme Picker & Zen Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Theme Switcher Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border)'
          }}>
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => { playClick(); setCurrentTheme(theme); }}
                title={theme.name}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: theme.accent,
                  border: currentTheme.id === theme.id ? '2px solid #ffffff' : 'none',
                  boxShadow: currentTheme.id === theme.id ? `0 0 10px ${theme.accent}` : 'none',
                  cursor: 'pointer',
                  transform: currentTheme.id === theme.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          {/* Full-Screen Zen Mode Toggle */}
          <button
            onClick={() => { playClick(); setFullScreen(!fullScreen); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--r-md)',
              background: fullScreen ? currentTheme.glow : 'var(--bg-elevated)',
              border: `1px solid ${fullScreen ? currentTheme.accent : 'var(--border)'}`,
              color: fullScreen ? '#ffffff' : 'var(--text-3)',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {fullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{fullScreen ? 'Exit Zen Mode' : 'Zen Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Focus Chamber Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        
        {/* ── Center Piece: Aesthetic Pomodoro Clock Chamber ── */}
        <div className="card" style={{
          background: currentTheme.cardBg,
          borderColor: currentTheme.border,
          boxShadow: `0 16px 48px -12px rgba(0,0,0,0.8), 0 0 40px ${currentTheme.glow}`,
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Glow Bloom */}
          <div style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${currentTheme.glow} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }} />

          {/* Mode Selector Ribbon */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginBottom: 28,
            padding: 4,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 2
          }}>
            {TIMER_MODES.map(mode => {
              const Icon = mode.icon;
              const isSel = currentMode.id === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 18,
                    background: isSel ? currentTheme.accent : 'transparent',
                    color: isSel ? '#ffffff' : 'var(--text-3)',
                    fontWeight: isSel ? 800 : 600,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSel ? `0 0 16px ${currentTheme.glow}` : 'none'
                  }}
                >
                  <Icon size={14} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Glowing Circular Timer Ring */}
          <div style={{ position: 'relative', width: 310, height: 310, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <svg width="310" height="310" viewBox="0 0 310 310" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx="155"
                cy="155"
                r={circleRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="8"
              />
              {/* Active Animated Progress Arc */}
              <motion.circle
                cx="155"
                cy="155"
                r={circleRadius}
                fill="none"
                stroke={currentTheme.accent}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circleCircumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: 'linear' }}
                style={{ filter: `drop-shadow(0 0 12px ${currentTheme.accent})` }}
              />
            </svg>

            {/* Centered Digital Countdown Display */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <motion.div
                animate={{ scale: isRunning ? [1, 1.015, 1] : 1 }}
                transition={{ repeat: isRunning ? Infinity : 0, duration: 2 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 54,
                  fontWeight: 900,
                  color: 'var(--text)',
                  letterSpacing: '-2px',
                  lineHeight: 1
                }}
              >
                {formattedTime}
              </motion.div>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: currentTheme.subtext,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginTop: 8
              }}>
                {isRunning ? '● SESSION ACTIVE' : 'PAUSED'}
              </div>
            </div>
          </div>

          {/* Play / Pause / Reset Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28, zIndex: 2 }}>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setIsRunning(!isRunning); }}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: currentTheme.accent,
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: `0 0 24px ${currentTheme.accent}`
              }}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setIsRunning(false); setTimeLeft(totalTime); }}
              title="Reset Timer"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setTimeLeft(0); }}
              title="Skip Session"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <SkipForward size={18} />
            </motion.button>
          </div>

          {/* Current Focus Goal Anchor */}
          <div style={{
            marginTop: 26,
            width: '100%',
            maxWidth: 420,
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 2
          }}>
            <button
              onClick={() => { playClick(); setIsTaskDone(!isTaskDone); if (!isTaskDone) playSuccessChime(); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isTaskDone ? currentTheme.accent : 'var(--text-4)'
              }}
            >
              <CheckCircle2 size={20} />
            </button>
            <input
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="What are you mastering in this focus sprint?"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isTaskDone ? 'var(--text-4)' : 'var(--text)',
                textDecoration: isTaskDone ? 'line-through' : 'none',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* ── Right Column: Ambient Soundscapes + Live Library Telemetry ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Ambient Soundscapes Synthesizer Panel */}
          <div className="card" style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}>
            <div className="card-header">
              <div className="card-title">
                <Volume2 size={18} color={currentTheme.accent} />
                <span>Synthesized Soundscapes (0MB Buffer)</span>
              </div>
              {activeSound && (
                <span className="badge badge-success glow-pulse" style={{ background: currentTheme.glow, color: currentTheme.accent, border: `1px solid ${currentTheme.border}` }}>
                  PLAYING
                </span>
              )}
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Real-time harmonic frequencies generated on your device's audio hardware via the Web Audio API:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                {[
                  { id: 'rain', label: 'Rain on Glass', icon: CloudRain, desc: 'Filtered Pink Noise' },
                  { id: 'alpha', label: '432Hz Alpha Waves', icon: Radio, desc: 'Binaural Focus Drone' },
                  { id: 'fire', label: 'Fireplace Hearth', icon: Flame, desc: 'Low Warm Flutter' },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeSound === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAmbient(item.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--r-md)',
                        background: isActive ? currentTheme.glow : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isActive ? currentTheme.accent : 'var(--border)'}`,
                        color: isActive ? '#ffffff' : 'var(--text-2)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? `0 0 16px ${currentTheme.glow}` : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Icon size={18} color={isActive ? currentTheme.accent : 'var(--text-3)'} />
                        {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentTheme.accent }} className="glow-pulse" />}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 12.5 }}>{item.label}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-4)' }}>{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              {activeSound && (
                <button
                  onClick={() => { playClick(); stopAllAmbient(); setActiveSound(null); }}
                  style={{
                    marginTop: 4,
                    padding: '8px',
                    borderRadius: 8,
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <VolumeX size={14} />
                  <span>Silence Soundscape</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily Focus Achievements */}
          <div className="card" style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}>
            <div className="card-header">
              <div className="card-title">
                <FireIcon size={18} color="var(--warning)" />
                <span>Today's Study Streak</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 20 }}>
                🔥 5 DAY STREAK
              </span>
            </div>

            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Sessions Completed</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>
                  {completedSessions} <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>cycles</span>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Focus Time Logged</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: currentTheme.accent, marginTop: 4 }}>
                  {totalMinutes} <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Virtual Library Room Telemetry */}
          <div className="card" style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}>
            <div className="card-header">
              <div className="card-title">
                <Users size={18} color="var(--cyan)" />
                <span>SRM Students in This Chamber</span>
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--cyan-bright)', fontFamily: 'JetBrains Mono, monospace' }}>
                4 Active
              </span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 20px' }}>
              {LIVE_STUDENTS.map((st, i) => (
                <div 
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: i === 0 ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 10.5,
                      color: '#fff'
                    }}>
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {st.name} <span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 500 }}>({st.dept})</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{st.task}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 10.5,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    color: 'var(--accent-bright)',
                    background: 'rgba(16,185,129,0.1)',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    {st.streak}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
