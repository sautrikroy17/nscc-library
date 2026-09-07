import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ai as aiApi, books as booksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';

const QUICK_PROMPTS = [
  "Which algorithms books are available right now?",
  "Recommend a book for learning machine learning",
  "Who has the most overdue books?",
  "Show me books about data structures",
  "What should a 2nd year CSE student read?",
  "Any Python books for beginners?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 2px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }}
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
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
        📚 Matching Books
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${book.available_copies > 0 ? 'var(--accent)' : 'var(--danger)'}`,
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>{book.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>by {book.author} · {book.category}</div>
              {book.match_reason && (
                <div style={{ fontSize: 11.5, color: 'var(--cyan)', marginTop: 4, fontStyle: 'italic' }}>
                  ✨ {book.match_reason}
                </div>
              )}
            </div>
            <div>
              <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {book.available_copies > 0 ? `${book.available_copies} avail.` : 'Issued out'}
              </span>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
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
  return (
    <div className={`chat-msg ${msg.role}`}>
      <div className={`chat-avatar ${msg.role === 'ai' ? 'ai' : 'user'}`}>
        {msg.role === 'ai' ? '🤖' : '👤'}
      </div>
      <div className="chat-bubble">
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
    setLoading(true);
    setResults(null);
    try {
      const data = await aiApi.search(term);
      setResults(data.books);
      if (data.books.length === 0) toast.info('No matching books found. Try different keywords.');
    } catch (err) {
      toast.error('AI search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <span style={{ fontSize: 18 }}>🔍</span> Semantic Book Search
        </div>
        <span style={{ fontSize: 11, color: 'var(--cyan)', background: 'var(--cyan-soft)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
          AI-Powered
        </span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="e.g. 'dynamic programming for competitive coding' or 'OS scheduling'"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="btn btn-cyan"
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
          >
            {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : '✨ Search'}
          </button>
        </div>

        {/* Quick suggestion pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {['Algorithms', 'ML/AI Books', 'Python', 'OS Concepts', 'Networks', 'Interview Prep'].map(tag => (
            <button
              key={tag}
              onClick={() => { setQuery(tag); handleSearch(tag); }}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-3)',
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--cyan)' }}>
            <TypingDots />
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Searching with AI...</span>
          </div>
        )}

        {results !== null && !loading && <AiSearchResults results={results} />}

        {results === null && !loading && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-4)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔮</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>AI Semantic Search</div>
            <div style={{ fontSize: 12.5, marginTop: 6, maxWidth: 300, margin: '6px auto 0' }}>
              Describe what you're looking for in plain English — AI understands context, not just keywords
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
      id: Date.now(),
      role: 'ai',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your NSCC Library AI assistant. I can help you:\n\n• Find books by topic, skill level, or recommendation\n• Check availability of specific titles\n• Suggest what to read based on your year/branch\n• Answer questions about library policies\n\nHow can I help you today?`,
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

    const userMsg = { id: Date.now(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
      const res = await aiApi.chat(msg, history);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: res.reply,
        books: res.books,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: `⚠️ I encountered an error: ${err.message}. Please check that the server is running and the AI API key is configured.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 560 }}>
      <div className="card-header">
        <div className="card-title">
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--cyan), #0ea5e9)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🤖</span>
          AI Library Assistant
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} className="glow-pulse" />
          <span style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 600 }}>Groq AI · Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-avatar ai">🤖</div>
            <div className="chat-bubble" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompt chips */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-soft)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, paddingBottom: 2 }}>
          {QUICK_PROMPTS.slice(0, 4).map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-3)', transition: 'all 200ms', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Ask anything about books, availability, recommendations..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={loading}
        />
        <button
          className="btn btn-cyan"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: '10px 18px' }}
        >
          {loading ? <div className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }} /> : '➤'}
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
        <h1 className="page-title">🤖 AI Assistant</h1>
        <p className="page-subtitle">Powered by Groq · Intelligent book discovery & library Q&A</p>
      </div>

      {/* Tab switch */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['chat', '💬 AI Chat', 'Conversational assistant'], ['search', '🔍 Semantic Search', 'AI book finder']].map(([id, label, sub]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: activeTab === id ? '1px solid var(--cyan)' : '1px solid var(--border)',
              background: activeTab === id ? 'var(--cyan-soft)' : 'var(--bg-elevated)',
              color: activeTab === id ? 'var(--cyan)' : 'var(--text-2)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              transition: 'all 200ms',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 400, color: activeTab === id ? 'var(--cyan-bright)' : 'var(--text-4)' }}>{sub}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'chat' ? <AIChat /> : <SemanticSearch />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
