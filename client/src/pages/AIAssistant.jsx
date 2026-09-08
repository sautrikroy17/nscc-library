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
  HelpCircle
} from 'lucide-react';
import { ai as aiApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';
import VoiceInputButton from '../components/VoiceInputButton';

const QUICK_PROMPTS = [
  "Which algorithms and data structures books are on the shelf right now?",
  "Recommend books for machine learning and deep neural networks",
  "What should a 2nd-year CSE student read to prepare for coding interviews?",
  "Explain the library fine policy and overdue calculation rule",
  "Are there any books on distributed systems or database internals?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '6px 4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan-bright)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function AiSearchResults({ results }) {
  if (!results || results.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 16 }}
    >
      <div style={{ 
        fontSize: 11.5, 
        color: 'var(--text-3)', 
        marginBottom: 10, 
        textTransform: 'uppercase', 
        letterSpacing: '0.8px', 
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <BookOpen size={13} color="var(--cyan-bright)" />
        <span>Matching Library Titles</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderLeft: `4px solid ${book.available_copies > 0 ? 'var(--accent)' : 'var(--danger)'}`,
              borderRadius: 'var(--r-md)',
              padding: '14px 16px',
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{book.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                by <strong style={{ color: 'var(--text-2)' }}>{book.author}</strong> · {book.category}
              </div>
              {book.match_reason && (
                <div style={{ fontSize: 11.5, color: 'var(--cyan-bright)', marginTop: 4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={11} />
                  <span>{book.match_reason}</span>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {book.available_copies > 0 ? `${book.available_copies} avail.` : 'Issued out'}
              </span>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                {book.id}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ChatMessage({ msg }) {
  const isAi = msg.role === 'ai';

  return (
    <div className={`chat-msg ${msg.role}`}>
      <div className={`chat-avatar ${isAi ? 'ai' : 'user'}`} style={{
        background: isAi ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        boxShadow: isAi ? '0 0 12px rgba(6,182,212,0.3)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        {isAi ? <Bot size={16} /> : <div style={{ fontWeight: 800, fontSize: 12 }}>U</div>}
      </div>

      <div className="chat-bubble" style={{
        background: isAi ? 'var(--bg-elevated)' : 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.10))',
        border: `1px solid ${isAi ? 'var(--border)' : 'rgba(16,185,129,0.3)'}`,
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
        fontSize: 13.5
      }}>
        {msg.content}
        {msg.books && <AiSearchResults results={msg.books} />}
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
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <Sparkles size={18} color="var(--cyan)" />
          <span>Semantic Intent Book Discovery</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--cyan-bright)', background: 'rgba(6,182,212,0.12)', padding: '3px 10px', borderRadius: 20, fontWeight: 700, border: '1px solid rgba(6,182,212,0.25)' }}>
          GROQ LLM INFERENCE
        </span>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="e.g. 'high performance concurrent programming' or 'system design interview prep'"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <VoiceInputButton
            onTranscript={(transcript) => setQuery(transcript)}
            disabled={loading}
            accentColor="var(--cyan)"
            title="Voice Search (Speak book title or subject)"
          />
          <button
            className="btn btn-cyan"
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
          >
            {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Search Catalog'}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {['Algorithms', 'Deep Learning', 'Computer Networks', 'OS Internals', 'Interview Guides', 'Clean Code'].map(tag => (
            <button
              key={tag}
              onClick={() => { setQuery(tag); handleSearch(tag); }}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-3)',
                transition: 'all 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '36px 0', color: 'var(--cyan)' }}>
            <TypingDots />
            <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
              Analyzing semantic intent against catalog titles...
            </span>
          </div>
        )}

        {results !== null && !loading && <AiSearchResults results={results} />}

        {results === null && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-4)' }}>
            <Sparkles size={40} color="var(--cyan)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Neural Book Discovery</div>
            <div style={{ fontSize: 13, marginTop: 6, maxWidth: 380, margin: '6px auto 0', color: 'var(--text-3)' }}>
              Describe what technical problem you are trying to solve in plain English — the AI infers domain relevance rather than exact keywords.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Greetings ${user?.name?.split(' ')[0] || 'Scholar'}. I am the Alexandria Neural AI for the NSCC Library.\n\nI can assist you with:\n• Finding books by research domain or course syllabus\n• Real-time availability checks on 30+ titles\n• Engineering reading roadmaps for CSE, ECE, & IT\n• Institutional borrowing policies and fine structures\n\nWhat would you like to explore today?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    playClick();
    const userMsg = { id: Date.now(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
      const res = await aiApi.chat(msg, history);
      playSuccessChime();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: res.reply,
        books: res.books,
      }]);
    } catch (err) {
      playErrorBeep();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: `⚠️ Reasoning failure: ${err.message}. Please verify the Groq neural engine service is active.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
      <div className="card-header">
        <div className="card-title">
          <Bot size={20} color="var(--cyan)" />
          <span>Alexandria Conversational Agent</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} className="glow-pulse" />
          <span style={{ fontSize: 11.5, color: 'var(--accent-bright)', fontWeight: 700 }}>Groq Online</span>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="chat-messages" style={{ flex: 1, padding: 18 }}>
        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-avatar ai" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Bot size={16} />
            </div>
            <div className="chat-bubble" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-soft)', overflowX: 'auto', display: 'flex', gap: 6 }}>
        {QUICK_PROMPTS.slice(0, 3).map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              color: 'var(--text-3)',
              transition: 'all 200ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Strip */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Ask Alexandria anything about computer science, books, or library operations..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={loading}
        />
        <VoiceInputButton
          onTranscript={(transcript) => setInput(transcript)}
          disabled={loading}
          accentColor="var(--cyan)"
          title="Voice Input (Speak your prompt)"
        />
        <button
          className="btn btn-cyan"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: '10px 18px' }}
        >
          {loading ? <div className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }} /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} color="var(--cyan)" />
            <span>Alexandria Neural Intelligence</span>
          </h1>
          <p className="page-subtitle">Powered by Groq LLM · Semantic search & conversational book guidance</p>
        </div>
      </div>

      {/* Modern High-Tech Segmented Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[
          ['chat', MessageSquare, 'Conversational Assistant', 'Chat with library AI model'],
          ['search', Search, 'Semantic Book Search', 'Intent-based catalog query'],
        ].map(([id, Icon, label, sub]) => {
          const isSelected = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => { playClick(); setActiveTab(id); }}
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--r-md)',
                border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border)',
                background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-elevated)',
                color: isSelected ? '#ffffff' : 'var(--text-3)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSelected ? 'var(--cyan-bright)' : 'var(--text-4)'
              }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: isSelected ? '#ffffff' : 'var(--text-2)' }}>
                  {label}
                </div>
                <div style={{ fontSize: 11, color: isSelected ? 'var(--cyan-bright)' : 'var(--text-4)' }}>
                  {sub}
                </div>
              </div>
            </button>
          );
        })}
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
