import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Bot, 
  ArrowRight, 
  RotateCcw,
  Zap,
  Search,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { ai as aiApi, transactions as txApi } from '../api';
import { GROQ_MODELS } from '../services/groqService';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';
import VoiceInputButton from '../components/VoiceInputButton';

const QUICK_PROMPTS = [
  "Suggest books on System Design",
  "Find books by Robert C. Martin",
  "Show recently added books",
  "What's trending this month?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '6px 4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function FormattedAiText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, lineHeight: 1.6, color: '#1e293b' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: 4 }} />;

        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          return (
            <div key={idx} style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a', marginTop: 8 }}>
              {trimmed.replace(/^#+\s*/, '')}
            </div>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, paddingLeft: 4 }}>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }

        return (
          <div key={idx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      })}
    </div>
  );
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a; font-weight:700;">$1</strong>')
    .replace(/\[(BK\d{3})\]/g, '<span style="background:#f1f5f9; color:#0f172a; font-family:monospace; padding:1px 5px; border-radius:4px; font-weight:700; border:1px solid #e2e8f0; font-size:11.5px;">$1</span>')
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#2563eb; padding:1px 5px; border-radius:4px; font-family:monospace; font-size:12px;">$1</code>');
}

function BookCardMini({ book, onBorrow }) {
  const isAvail = book.available_copies > 0;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 8
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10.5,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            color: '#475569',
            background: '#f1f5f9',
            padding: '1px 5px',
            borderRadius: 4
          }}>
            {book.id}
          </span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {book.title}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
          {book.author} · Shelf {book.shelf_location || 'Zone A'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: isAvail ? '#16a34a' : '#dc2626',
          background: isAvail ? '#f0fdf4' : '#fef2f2',
          padding: '2px 8px',
          borderRadius: 6
        }}>
          {isAvail ? `${book.available_copies} avail` : 'Checked Out'}
        </span>

        {onBorrow && isAvail && (
          <button
            onClick={() => onBorrow(book)}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: '#0f172a',
              border: 'none',
              color: '#ffffff',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Borrow
          </button>
        )}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Hello! I'm your AI library assistant. How can I help you today? You can ask me to find books, check availability, or recommend reading material.`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleBorrow = async (book) => {
    playClick();
    if (book.available_copies <= 0) {
      toast.error(`${book.title} is currently checked out.`);
      return;
    }
    try {
      const res = await txApi.issue({
        book_id: book.id,
        borrower_name: user?.name || 'Sautrik Roy',
        borrower_reg: user?.reg_number || 'RA2511003010052',
        borrower_dept: user?.department || 'CSE',
        loan_days: 14
      });
      playSuccessChime();
      toast.success(res.message || `Checked out ${book.title}!`);
    } catch (err) {
      playErrorBeep();
      toast.error(err.message || 'Borrow failed');
    }
  };

  const handleResetChat = () => {
    playClick();
    setMessages([
      {
        id: Date.now(),
        role: 'ai',
        content: `Conversation reset. Ready for your next library or computer science inquiry!`,
      }
    ]);
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    playClick();
    const userMsg = { id: Date.now(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await aiApi.chat(msg, history, GROQ_MODELS.SPEED);
      playSuccessChime();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: res.reply,
        books: res.books,
        model: res.model,
        latencyMs: res.latencyMs
      }]);
    } catch (err) {
      playErrorBeep();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: `I couldn't reach the neural assistant: ${err.message}. Please try again shortly.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* ── Header matching Panel 14 ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} />
            </div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Ask LibraX
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            Your library companion. Search, explore, get recommendations.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={13} /> Reset Chat
        </button>
      </div>

      {/* ── Main Chat Container matching Panel 14 ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        height: 640,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        {/* Messages Stream Viewport */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}>
          {messages.map(msg => {
            const isAi = msg.role === 'ai';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  flexDirection: isAi ? 'row' : 'row-reverse'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: isAi ? '#0f172a' : '#e2e8f0',
                  color: isAi ? '#ffffff' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0
                }}>
                  {isAi ? <Bot size={18} /> : (user?.name?.[0] || 'S')}
                </div>

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '80%',
                  background: isAi ? '#f8fafc' : '#0f172a',
                  color: isAi ? '#0f172a' : '#ffffff',
                  border: isAi ? '1px solid #e2e8f0' : 'none',
                  borderRadius: 14,
                  padding: '14px 18px',
                  lineHeight: 1.6
                }}>
                  {isAi ? (
                    <FormattedAiText text={msg.content} />
                  ) : (
                    <div style={{ fontSize: 13.5 }}>{msg.content}</div>
                  )}

                  {/* Embedded Matching Book Cards */}
                  {msg.books && msg.books.length > 0 && (
                    <div style={{ marginTop: 12, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                        Matching Books in Catalog
                      </div>
                      {msg.books.map(b => (
                        <BookCardMini key={b.id} book={b} onBorrow={handleBorrow} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={18} />
              </div>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '12px 18px'
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Prompt Shortcut Pills matching Panel 14 ── */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #f1f5f9',
          background: '#fcfcfd',
          display: 'flex',
          gap: 8,
          overflowX: 'auto'
        }}>
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                transition: 'all 150ms',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0f172a';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#475569';
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* ── Bottom Input Form matching Panel 14 ── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: '#ffffff'
        }}>
          <input
            style={{
              flex: 1,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#0f172a',
              fontSize: 13.5,
              outline: 'none'
            }}
            placeholder="Ask about books, authors, topics..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />

          <VoiceInputButton
            onTranscript={transcript => setInput(transcript)}
            disabled={loading}
            accentColor="#0f172a"
            title="Voice Prompt"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              background: '#0f172a',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: loading || !input.trim() ? 0.6 : 1
            }}
          >
            <span>Ask</span>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
