import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Target, 
  Mic, 
  MicOff, 
  Plus, 
  Check, 
  ArrowRight,
  Bot,
  Heart,
  Smile,
  Zap,
  Coffee,
  Compass
} from 'lucide-react';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import { playClick, playSuccessChime } from '../utils/audio';
import { toast } from '../context/ToastContext';
import { groqService } from '../services/groqService';
import { useLibrary } from '../context/LibraryContext';

const MOODS = [
  { id: 'focus', emoji: '⚡', label: 'Deep Focus & Study', query: 'I need to get into deep focus mode for exams. Suggest rigorous, structured textbooks.' },
  { id: 'curious', emoji: '✨', label: 'Curious & Exploring', query: 'I am in a curious mood! Recommend something fascinating that expands my mind.' },
  { id: 'stressed', emoji: '🧘', label: 'Stressed & Overwhelmed', query: 'I feel a bit overwhelmed with assignments. Can you recommend clear, easy-to-digest books?' },
  { id: 'placement', emoji: '🚀', label: 'Career & Placement Hustle', query: 'I want to crack tech placements! Give me the best system design and DSA books.' },
  { id: 'geek', emoji: '🧠', label: 'Hardcore Tech Geek', query: 'I want hardcore deep tech: low-level kernels, compilers, and distributed architectures.' }
];

export default function AIAssistant({ onNavigate = () => {} }) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'user',
      text: 'Suggest some books on system design for beginners'
    },
    {
      id: 'm2',
      sender: 'ai',
      text: "Hey there! I'm Lyra, your campus library companion. I'd love to help! System design can feel intimidating at first, but with the right visual guides and architectural mental models, it quickly becomes super fun. Here are my favorite beginner-friendly recommendations from the SRM stacks:",
      books: [
        {
          id: 'BK014',
          num: 1,
          title: 'System Design Interview',
          author: 'Alex Xu',
          coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'BK012',
          num: 2,
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'BK008',
          num: 3,
          title: 'Clean Architecture',
          author: 'Robert C. Martin',
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80'
        }
      ],
      followUp: "How are you feeling today? Pick a mood above or let me know if you'd like me to reserve a study desk or borrow one of these for you! ✨"
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [addedIds, setAddedIds] = useState([]);
  const [activeMood, setActiveMood] = useState(null);
  const chatBottomRef = useRef(null);

  const { borrowBook, toggleWishlist, wishlist } = useLibrary();
  const [isThinking, setIsThinking] = useState(false);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isThinking) return;

    playClick();
    const newMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
    setIsThinking(true);

    try {
      const res = await groqService.chat(query, messages);
      playSuccessChime();

      const recommendedBooks = (res.books && res.books.length > 0)
        ? res.books.slice(0, 4).map((b, idx) => ({
            id: b.id,
            num: idx + 1,
            title: b.title,
            author: b.author,
            category: b.category,
            coverUrl: b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
          }))
        : [];

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: res.reply,
          books: recommendedBooks,
          followUp: recommendedBooks.length > 0 
            ? "Would you like me to issue any of these for you, or reserve a study cubicle? ✨"
            : "Let me know if you would like more recommendations or specific syllabus references!"
        }
      ]);
    } catch (err) {
      console.warn('Groq AI inference error:', err);
      // Fallback
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `I'm right here with you! Exploring our SRM Central Library stacks for "${query}" is a wonderful journey. Let me know which topics, author styles, or specific subjects you would like to delve into!`,
          books: []
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setActiveMood(mood.id);
    handleSend(mood.query);
  };

  const handleAddBook = (book) => {
    toggleWishlist(book.id);
  };

  const toggleVoice = () => {
    playClick();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.info('Speech recognition not supported in this browser. Type your query below.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputVal(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.start();
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Bar with BackButton & Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/lyra_avatar.jpg"
              alt="Lyra AI"
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #8b5cf6',
                boxShadow: '0 2px 10px rgba(139, 92, 246, 0.25)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                  Lyra ✨
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>
                  Online · Campus AI Librarian
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Your personal library companion. Tell me how you're feeling or what you want to study!
              </div>
            </div>
          </div>
        </div>

        {/* Powered by AI Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 20,
          background: '#f5f3ff',
          border: '1px solid #ddd6fe',
          color: '#7c3aed',
          fontSize: 12.5,
          fontWeight: 700
        }}>
          <Sparkles size={14} />
          <span>Powered by Lyra AI</span>
        </div>
      </div>

      {/* ── Mood Matching Bar ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Smile size={16} color="#8b5cf6" />
          <span>Match books according to your mood today:</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MOODS.map(m => {
            const active = activeMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: active ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                  background: active ? '#f5f3ff' : '#f8fafc',
                  color: active ? '#7c3aed' : '#334155',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = active ? '#7c3aed' : '#e2e8f0'; e.currentTarget.style.background = active ? '#f5f3ff' : '#f8fafc'; }}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat Feed ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {messages.map(msg => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 2px 16px',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  color: '#1e3a8a',
                  fontSize: 13.5,
                  lineHeight: 1.55
                }}>
                  {msg.text}
                </div>
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80"
                  alt="User"
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                />
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'start', gap: 14 }}>
              {/* Lyra Cute Avatar */}
              <img
                src="/lyra_avatar.jpg"
                alt="Lyra"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #8b5cf6',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
                  flexShrink: 0
                }}
              />

              <div style={{ flex: 1, maxWidth: '85%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Lyra</span>
                  <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>Library AI</span>
                </div>

                <div style={{ fontSize: 13.5, color: '#1e293b', lineHeight: 1.6, marginBottom: 12 }}>
                  {msg.text}
                </div>

                {/* Recommended Books List */}
                {msg.books && msg.books.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {msg.books.map(b => {
                      const isAdded = wishlist.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 10,
                            gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', width: 14 }}>{b.num}</span>
                            <div style={{ width: 36, height: 48, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                              <BookCover bookId={b.id} title={b.title} author={b.author} coverUrl={b.coverUrl} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{b.title}</div>
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{b.author}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => borrowBook(b)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#2563eb',
                                color: '#ffffff',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span>Borrow Copy</span>
                            </button>

                            <button
                              onClick={() => handleAddBook(b)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: isAdded ? '#ecfdf5' : '#ffffff',
                                color: isAdded ? '#059669' : '#0f172a',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              {isAdded ? <Check size={13} /> : <Plus size={13} />}
                              <span>{isAdded ? 'Wishlisted' : '+ Wishlist'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {msg.followUp && (
                  <div style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', background: '#fcfaff', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #8b5cf6' }}>
                    {msg.followUp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', animation: 'pulse 1.5s infinite' }}>
            <img
              src="/lyra_avatar.jpg"
              alt="Lyra"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a855f7' }}
            />
            <div style={{ fontSize: 13, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #e9d5ff', padding: '8px 16px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={14} color="#a855f7" />
              <span>Lyra is consulting the SRM Central Library stacks...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* ── Chat Input Container ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 12,
          padding: '8px 14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Lyra anything: 'What should I read if I feel stressed?', 'Best DSA books'..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 13.5,
              color: '#0f172a',
              background: 'transparent'
            }}
          />

          <button
            onClick={toggleVoice}
            title="Voice input"
            style={{
              background: 'none',
              border: 'none',
              color: isListening ? '#ef4444' : '#64748b',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            onClick={() => handleSend()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Quick Suggestion Chips below input */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            'Recommend books for high-paying tech jobs',
            'Summarize Clean Code in 3 minutes',
            'I need a book to relax and clear my head',
            'Best book for database internals'
          ].map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
