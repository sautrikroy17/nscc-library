import { ArrowLeft } from 'lucide-react';
import { playClick } from '../utils/audio';

export default function BackButton({ 
  onClick, 
  label = 'Back', 
  style = {} 
}) {
  return (
    <button
      onClick={(e) => {
        playClick();
        if (onClick) {
          onClick(e);
        } else if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
          window.history.back();
        }
      }}
      title="Return to previous screen"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        color: '#475569',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 150ms ease',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#f8fafc';
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.color = '#0f172a';
        e.currentTarget.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#ffffff';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.color = '#475569';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <ArrowLeft size={14} strokeWidth={2.2} />
      <span>{label}</span>
    </button>
  );
}
