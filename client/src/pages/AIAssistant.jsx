import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Send, 
  Cpu, 
  BookOpen, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare,
  Zap,
  HelpCircle,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { ai as aiApi, books as booksApi, transactions as txApi } from '../api';
import { GROQ_MODELS } from '../services/groqService';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';
import VoiceInputButton from '../components/VoiceInputButton';

const QUICK_PROMPTS = [
  "Recommend 2nd-year CSE semester textbooks in the library",
  "What books should I read for System Design & High Scalability?",
  "Which algorithms and data structures books are on the shelf right now?",
  "Recommend books for machine learning and deep neural networks",
  "Explain the library fine policy and overdue calculation rule",
  "Are there any books on distributed systems or database internals?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '8px 6px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// Lightweight, safe markdown formatter for AI responses
function FormattedAiText({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, lineHeight: 1.65 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: 4 }} />;

        // Table row detection
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
          if (trimmed.includes('---')) return null; // Separator row
          return (
            <div key={idx} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 4, fontSize: 12.5, fontFamily: 'monospace' }}>
              {cells.map((cell, cIdx) => (
                <span key={cIdx} style={{ flex: 1 }}>{cell}</span>
              ))}
            </div>
          );
        }

        // Section header
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} style={{ fontWeight: 800, fontSize: 14.5, color: '#ffffff', marginTop: 8, marginBottom: 2 }}>
              {headerText}
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, paddingLeft: 6 }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, paddingLeft: 6 }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{trimmed.match(/^\d+\./)[0]}</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^\d+\.\s*/, '')) }} />
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
    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff; font-weight:700;">$1</strong>')
    // Book ID highlight [BK001]
    .replace(/\[(BK\d{3})\]/g, '<span style="background:rgba(16,185,129,0.18); color:#34d399; font-family:monospace; padding:1px 5px; border-radius:4px; font-weight:700; border:1px solid rgba(16,185,129,0.3); font-size:11.5px;">$1</span>')
    // Inline code `text`
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.06); color:#38bdf8; padding:1px 5px; border-radius:4px; font-family:monospace; font-size:12px;">$1</code>');
}

function BookCardMini({ book, onBorrow }) {
  const isAvail = book.available_copies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(8, 12, 20, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: `4px solid ${isAvail ? '#10b981' : '#f43f5e'}`,
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '1px 5px',
            borderRadius: 4
          }}>
            {book.id}
          </span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {book.title}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
          {book.author} · Shelf {book.shelf_location || 'Zone A'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: isAvail ? '#10b981' : '#f43f5e',
          background: isAvail ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
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
              background: '#10b981',
              border: 'none',
              color: '#080c14',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Borrow
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ChatMessage({ msg, onBorrow }) {
  const isAi = msg.role === 'ai';

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      marginBottom: 18,
      alignItems: 'flex-start',
      flexDirection: isAi ? 'row' : 'row-reverse'
    }}>
      {/* Avatar */}
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: isAi ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        boxShadow: isAi ? '0 0 14px rgba(16, 185, 129, 0.35)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 800,
        fontSize: 12,
        flexShrink: 0
      }}>
        {isAi ? <Bot size={18} /> : 'S'}
      </div>

      {/* Bubble Content */}
      <div style={{
        maxWidth: '82%',
        background: isAi ? 'rgba(15, 22, 38, 0.85)' : 'rgba(16, 185, 129, 0.12)',
        border: `1px solid ${isAi ? 'rgba(255, 255, 255, 0.08)' : 'rgba(16, 185, 129, 0.35)'}`,
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        {isAi ? (
          <FormattedAiText text={msg.content} />
        ) : (
          <div style={{ fontSize: 13.5, color: '#ffffff', lineHeight: 1.6 }}>{msg.content}</div>
        )}

        {/* Embedded Book Recommendation Cards */}
        {msg.books && msg.books.length > 0 && (
          <div style={{ marginTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={13} />
              <span>Matching Books in Campus Stacks</span>
            </div>
            {msg.books.map(b => (
              <BookCardMini key={b.id} book={b} onBorrow={onBorrow} />
            ))}
          </div>
        )}

        {/* Latency & Model Footer */}
        {isAi && msg.latencyMs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 10.5, color: '#64748b' }}>
            <Zap size={11} color="#10b981" />
            <span>Groq LPU™ {msg.latencyMs}ms</span>
            <span>·</span>
            <span>{msg.model?.split('/')[1] || msg.model}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AIChat() {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState(GROQ_MODELS.SPEED);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Greetings ${user?.name?.split(' ')[0] || 'Scholar'}. I am **Alexandria**, the intelligent AI librarian for the SRM IST Central Library & NSCC System.\n\nI have real-time access to our physical stacks and institutional circulation records. I can assist you with:\n• Finding books across core engineering disciplines (CSE, ECE, IT, AI)\n• Live book availability checks in real time\n• Academic reading roadmaps for semester prep & coding interviews\n• Institutional borrowing regulations and turnstile QR policies\n\nWhat would you like to explore today?`,
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
      toast.error(`${book.title} is currently checked out by other readers.`);
      return;
    }
    try {
      const res = await txApi.issue({
        book_id: book.id,
        borrower_name: user?.name || 'Sautrik Roy',
        borrower_reg: user?.reg_number || 'RA2311003030001',
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
    toast.info('Chat session refreshed');
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
      const history = messages.slice(-8).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await aiApi.chat(msg, history, selectedModel);
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
        content: `⚠️ Inference Notice: ${err.message}. The Groq neural engine service is reconnecting.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(14, 22, 38, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 20,
      display: 'flex',
      flexDirection: 'column',
      height: 680,
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Header with Groq Model Switcher */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(8, 12, 20, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>Alexandria Neural Agent</div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="glow-pulse" />
              <span>Groq LPU™ Hardware Accelerated</span>
            </div>
          </div>
        </div>

        {/* Model Selector & Reset Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            background: 'rgba(15, 22, 38, 0.8)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => { playClick(); setSelectedModel(GROQ_MODELS.SPEED); }}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: selectedModel === GROQ_MODELS.SPEED ? 800 : 500,
                border: 'none',
                cursor: 'pointer',
                background: selectedModel === GROQ_MODELS.SPEED ? '#10b981' : 'transparent',
                color: selectedModel === GROQ_MODELS.SPEED ? '#080c14' : '#94a3b8',
                transition: 'all 150ms'
              }}
            >
              ⚡ Qwen 3.8 27B
            </button>

            <button
              onClick={() => { playClick(); setSelectedModel(GROQ_MODELS.REASONING); }}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: selectedModel === GROQ_MODELS.REASONING ? 800 : 500,
                border: 'none',
                cursor: 'pointer',
                background: selectedModel === GROQ_MODELS.REASONING ? '#10b981' : 'transparent',
                color: selectedModel === GROQ_MODELS.REASONING ? '#080c14' : '#94a3b8',
                transition: 'all 150ms'
              }}
            >
              🧠 GPT-OSS 120B
            </button>
          </div>

          <button
            onClick={handleResetChat}
            title="Reset Chat Session"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Messages Viewport */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} onBorrow={handleBorrow} />
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              background: 'rgba(15, 22, 38, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '12px 18px'
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        overflowX: 'auto',
        display: 'flex',
        gap: 8,
        background: 'rgba(8, 12, 20, 0.4)'
      }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              transition: 'all 150ms',
              flexShrink: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'rgba(8, 12, 20, 0.6)'
      }}>
        <input
          style={{
            flex: 1,
            background: 'rgba(15, 22, 38, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: 13.5
          }}
          placeholder="Ask Alexandria anything about computer science, books, or library operations..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={loading}
        />

        <VoiceInputButton
          onTranscript={transcript => setInput(transcript)}
          disabled={loading}
          accentColor="#10b981"
          title="Voice Input (Speak your prompt)"
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 20px',
            borderRadius: 10,
            background: '#10b981',
            border: 'none',
            color: '#080c14',
            fontWeight: 800,
            fontSize: 13.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
            opacity: loading || !input.trim() ? 0.6 : 1
          }}
        >
          {loading ? (
            <div className="spinner spinner-sm" style={{ borderTopColor: '#080c14' }} />
          ) : (
            <>
              <span>Send</span>
              <Send size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q) => {
    const term = (q || query).trim();
    if (!term) return;
    playClick();
    setLoading(true);
    setResults(null);
    try {
      const data = await aiApi.search(term);
      setResults(data.books);
      if (data.books.length === 0) toast.info('No matching books found. Try broader keywords.');
      else playSuccessChime();
    } catch (err) {
      playErrorBeep();
      toast.error('AI search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(14, 22, 38, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 20,
      padding: 28,
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06b6d4'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Semantic Intent Book Discovery</h2>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Search by technical concept, problem, or project idea</p>
          </div>
        </div>

        <span style={{
          fontSize: 11,
          color: '#38bdf8',
          background: 'rgba(6, 182, 212, 0.12)',
          padding: '4px 12px',
          borderRadius: 20,
          fontWeight: 700,
          border: '1px solid rgba(6, 182, 212, 0.25)'
        }}>
          ⚡ Groq LPU™ Semantic Engine
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          style={{
            flex: 1,
            background: 'rgba(15, 22, 38, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: 13.5
          }}
          placeholder="e.g. 'high performance concurrent programming' or 'distributed systems transaction coordination'"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <VoiceInputButton
          onTranscript={transcript => setQuery(transcript)}
          disabled={loading}
          accentColor="#06b6d4"
          title="Voice Search"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          style={{
            padding: '12px 22px',
            borderRadius: 10,
            background: '#06b6d4',
            border: 'none',
            color: '#080c14',
            fontWeight: 800,
            fontSize: 13.5,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Search Catalog'}
        </button>
      </div>

      {/* Quick Suggestion Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {['Algorithms & Graphs', 'System Design Interview', 'Operating System Internals', 'Clean Code Practices', 'Database Normalization', 'Computer Networking Protocols'].map(tag => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); handleSearch(tag); }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              transition: 'all 150ms'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
          <TypingDots />
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
            Analyzing conceptual semantics against SRM IST catalog...
          </span>
        </div>
      )}

      {results && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Semantic Matches ({results.length} Titles Found)
          </div>
          {results.map(book => (
            <BookCardMini key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'search'

  return (
    <div className="page" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 40 }}>
      {/* Title Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color: '#ffffff',
          marginBottom: 6,
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10
        }}>
          <Sparkles size={24} color="#10b981" />
          <span>Alexandria Neural Intelligence</span>
        </h1>
        <p style={{ fontSize: 13.5, color: '#94a3b8' }}>
          Powered by Groq LPUs™ · Ultra-low latency conversational librarian & semantic catalog engine
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          background: 'rgba(15, 22, 38, 0.85)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => { playClick(); setActiveTab('chat'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 22px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === 'chat' ? 800 : 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'chat' ? '#10b981' : 'transparent',
              color: activeTab === 'chat' ? '#080c14' : '#94a3b8',
              boxShadow: activeTab === 'chat' ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 150ms'
            }}
          >
            <MessageSquare size={16} />
            <span>Conversational Assistant</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('search'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 22px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === 'search' ? 800 : 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'search' ? '#10b981' : 'transparent',
              color: activeTab === 'search' ? '#080c14' : '#94a3b8',
              boxShadow: activeTab === 'search' ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 150ms'
            }}
          >
            <Search size={16} />
            <span>Semantic Book Discovery</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'chat' ? <AIChat /> : <SemanticSearch />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
