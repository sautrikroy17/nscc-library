import { motion } from 'framer-motion';

export default function BrandLogo({ size = 36, animated = true, className = "" }) {
  return (
    <motion.div
      whileHover={animated ? { scale: 1.06, rotate: [0, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={`brand-logo-container ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* Ambient background bloom */}
      <div
        style={{
          position: 'absolute',
          inset: -3,
          background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(6,182,212,0.15) 50%, transparent 70%)',
          filter: 'blur(6px)',
          borderRadius: '35%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <defs>
          <linearGradient id="logoEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="logoShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#172235" />
            <stop offset="100%" stopColor="#090e18" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Frame */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="15"
          fill="url(#logoShieldBg)"
          stroke="url(#logoEmerald)"
          strokeWidth="1.8"
        />

        {/* Subtle Tech Corner Ticks */}
        <line x1="6" y1="12" x2="12" y2="6" stroke="#34d399" strokeWidth="1" opacity="0.6" />
        <line x1="58" y1="52" x2="52" y2="58" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />

        {/* Holographic Book Geometry */}
        <g filter="url(#logoGlow)">
          {/* Left Wing / Page */}
          <path
            d="M16 23C21 21 27 22 32 25V46C27 43 21 42 16 44V23Z"
            fill="url(#logoEmerald)"
            fillOpacity="0.25"
            stroke="url(#logoEmerald)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Right Wing / Page */}
          <path
            d="M48 23C43 21 37 22 32 25V46C37 43 43 42 48 44V23Z"
            fill="url(#logoEmerald)"
            fillOpacity="0.38"
            stroke="url(#logoEmerald)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Glowing Quantum Spine */}
          <line x1="32" y1="21" x2="32" y2="47" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="18" r="2.8" fill="#34d399" />

          {/* Futuristic Data Stream Lines */}
          <line x1="20" y1="29" x2="27" y2="30.5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <line x1="20" y1="35" x2="27" y2="36.5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <line x1="37" y1="30.5" x2="44" y2="29" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <line x1="37" y1="36.5" x2="44" y2="35" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        </g>
      </svg>
    </motion.div>
  );
}
