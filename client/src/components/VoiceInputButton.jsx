import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Radio } from 'lucide-react';
import { toast } from '../context/ToastContext';
import { playMicStart, playMicStop } from '../utils/audio';

export default function VoiceInputButton({ 
  onTranscript, 
  disabled = false, 
  accentColor = 'var(--cyan)', 
  title = 'Voice input (Speech to text)' 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (disabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      playMicStop();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        playMicStart();
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        if (onTranscript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        playMicStop();
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Allow microphone access to use voice input.');
        } else if (event.error !== 'no-speech') {
          toast.error(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        playMicStop();
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error('Could not initialize speech recognition');
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : title}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: isListening 
            ? '1px solid rgba(239, 68, 68, 0.6)' 
            : '1px solid var(--border)',
          background: isListening 
            ? 'rgba(239, 68, 68, 0.18)' 
            : 'rgba(255, 255, 255, 0.04)',
          color: isListening ? '#f87171' : 'var(--text-3)',
          transition: 'all 200ms',
          boxShadow: isListening 
            ? '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)' 
            : 'none'
        }}
        onMouseEnter={e => {
          if (!isListening && !disabled) {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.color = accentColor;
          }
        }}
        onMouseLeave={e => {
          if (!isListening && !disabled) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-3)';
          }
        }}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <MicOff size={17} color="#f87171" />
          </motion.div>
        ) : (
          <Mic size={17} />
        )}

        {/* Pulsing Outer Rings while listening */}
        {isListening && (
          <motion.span
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: 12,
              border: '2px solid #ef4444',
              pointerEvents: 'none'
            }}
          />
        )}
      </button>

      {/* Floating Audio Equalizer Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            style={{
              position: 'absolute',
              bottom: '120%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 22, 35, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              zIndex: 50,
              pointerEvents: 'none'
            }}
          >
            {/* Equalizer bars */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 14 }}>
              {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: 'easeInOut' }}
                  style={{
                    width: 3,
                    height: '100%',
                    borderRadius: 2,
                    background: '#f87171',
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#f87171', letterSpacing: '0.4px' }}>
              Listening... Speak now
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
