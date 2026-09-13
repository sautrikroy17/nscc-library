import React from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { playClick } from '../utils/audio';

export default function LibraryHoursModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 150ms ease-out'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 20,
          maxWidth: 620,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with image banner */}
        <div style={{
          position: 'relative',
          padding: '28px 30px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '19px 19px 0 0',
          overflow: 'hidden'
        }}>
          {/* Close button */}
          <button
            onClick={() => { playClick(); onClose(); }}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <Clock size={18} />
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '3px 10px',
              borderRadius: 999
            }}>
              Open Now · Normal Schedule
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 4px', letterSpacing: '-0.3px' }}>
            SRM Central Library Operating Schedule
          </h2>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Kattankulathur Campus · 4-Story Academic Learning Hub
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Hours Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Weekdays (Mon – Fri)
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                8:00 AM – 10:00 PM
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', marginTop: 3, fontWeight: 600 }}>
                Circulation Desk: 8:30 AM – 8:00 PM
              </div>
            </div>

            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Weekends (Sat & Sun)
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                9:00 AM – 8:00 PM
              </div>
              <div style={{ fontSize: 11, color: '#2563eb', marginTop: 3, fontWeight: 600 }}>
                Reading Stacks & WiFi Fully Active
              </div>
            </div>
          </div>

          {/* Exam Period Notice Card */}
          <div style={{
            padding: '16px 18px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
            border: '1px solid #fde68a',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Sparkles size={20} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#92400e' }}>
                24/7 Reading Hall During Exam Weeks
              </div>
              <div style={{ fontSize: 12, color: '#b45309', marginTop: 2, lineHeight: 1.4 }}>
                The Ground Floor Air-Conditioned Reading Hall remains open 24 hours daily during SRM Semester Final Examinations with turnstile student ID entry.
              </div>
            </div>
          </div>

          {/* Floor Directory */}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} color="#2563eb" /> Floor Directory & Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              {[
                { floor: 'Level 1 (Ground)', desc: 'Circulation Counter, Newspaper & Periodicals Lounge, Head Librarian Office (Dr. Rajesh Kumar)' },
                { floor: 'Level 2', desc: 'Computer Science, IT, Electronics & Mathematics Stacks, Quiet Study Cabins' },
                { floor: 'Level 3', desc: 'Mechanical, Civil, Biotechnology & Science Disciplines, Academic Bound Journals' },
                { floor: 'Level 4 (Top)', desc: 'Digital Research Library, IEEE & Springer Terminal Access, Video Conferencing Hall' }
              ].map(f => (
                <div key={f.floor} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', minWidth: 120 }}>{f.floor}</span>
                  <span style={{ color: '#64748b' }}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpdesk Contacts */}
          <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} color="#2563eb" />
              <span>Ext: +91 44 2745 2270</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} color="#2563eb" />
              <span>library@srmist.edu.in</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 30px', background: '#f8fafc', borderRadius: '0 0 19px 19px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { playClick(); onClose(); }}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
