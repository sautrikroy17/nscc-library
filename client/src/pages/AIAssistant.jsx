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
  Bot
} from 'lucide-react';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import { playClick, playSuccessChime } from '../utils/audio';
import { toast } from '../context/ToastContext';

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
      text: 'Here are some great books on System Design for beginners:',
      books: [
        {
          id: 'BK014',
          num: 1,
          title: 'System Design Interview',
          author: 'Alex Xu',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'
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
      followUp: 'Would you like more recommendations based on distributed systems, scalability, or interviews?'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [addedIds, setAddedIds] = useState([]);
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    playClick();
    const newMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    setTimeout(() => {
      generateAiResponse(query);
    }, 600);
  };

  const generateAiResponse = (query) => {
    playSuccessChime();
    const qLower = query.toLowerCase();

    if (qLower.includes('os') || qLower.includes('operating system')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'Here are top recommendations for Operating Systems and Kernels:',
          books: [
            { id: 'BK006', num: 1, title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK011', num: 2, title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: 'Would you also like lecture companion notes from SRM CSE faculty?'
        }
      ]);
    } else if (qLower.includes('clean code') || qLower.includes('summarize')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'Summary of Clean Code by Robert C. Martin:\n\n• Meaningful Names: Reveal intent and avoid disinformation.\n• Functions: Should do one thing and do it well (under 20 lines).\n• Comments: Do not make up for bad code; refactor instead.\n• TDD: The three laws of Test Driven Development ensure maintainability.',
          books: [
            { id: 'BK002', num: 1, title: 'Clean Code', author: 'Robert C. Martin', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: 'Would you like to borrow Clean Code right now? 4 copies available in Central Library - Shelf B2.'
        }
      ]);
    } else if (qLower.includes('dsa') || qLower.includes('algorithm')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'Here are foundational textbooks for Data Structures & Algorithms:',
          books: [
            { id: 'BK001', num: 1, title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein', coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK013', num: 2, title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: 'Should I filter by semester 3 curriculum syllabus?'
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Here are curated titles from the SRM Central Library catalog matching "${query}":`,
          books: [
            { id: 'BK004', num: 1, title: 'Design Patterns', author: 'Gamma, Helm, Johnson, Vlissides', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK009', num: 2, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: 'Would you like me to reserve any of these for pickup today?'
        }
      ]);
    }
  };

  const handleAddBook = (book) => {
    playSuccessChime();
    setAddedIds(prev => [...prev, book.id]);
    toast.success(`"${book.title}" added to your Wishlist!`);
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
      {/* ── Top Bar with BackButton & Header matching Screenshot 5 Top-Left ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              AI Assistant
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Your personal library companion. Ask, explore, get recommendations, and more.
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
          <span>Powered by AI</span>
        </div>
      </div>

      {/* ── Welcome Center & 4 Prompt Cards matching Screenshot 5 ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
          Hi Sautrik! 👋
        </h2>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          How can I help you today?
        </div>

        {/* 4 Prompt Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { id: 'find', title: 'Find Books', desc: 'Get recommendations', icon: BookOpen, query: 'Recommend top rated books in Computer Science' },
            { id: 'summarize', title: 'Summarize a Book', desc: 'Key insights in seconds', icon: FileText, query: 'Summarize Clean Code by Robert C. Martin' },
            { id: 'explain', title: 'Explain a Concept', desc: 'Simplify complex topics', icon: Lightbulb, query: 'Explain ACID properties in database systems' },
            { id: 'suggest', title: 'Suggest for Me', desc: 'Based on your interests', icon: Target, query: 'Suggest books on software architecture' }
          ].map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleSend(card.query)}
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: 12 }}>
                  <Icon size={16} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{card.title}</div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>{card.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chat Feed matching Screenshot 5 ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {messages.map(msg => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 16px',
                  borderRadius: '14px 14px 2px 14px',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  color: '#1e3a8a',
                  fontSize: 13.5,
                  lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80"
                  alt="User"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                />
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
                flexShrink: 0
              }}>
                <Bot size={18} />
              </div>

              <div style={{ flex: 1, maxWidth: '85%' }}>
                <div style={{ fontSize: 13.5, color: '#0f172a', lineHeight: 1.5, marginBottom: 12 }}>
                  {msg.text}
                </div>

                {/* Recommended Books List matching Screenshot 5 */}
                {msg.books && msg.books.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {msg.books.map(b => {
                      const isAdded = addedIds.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 10,
                            gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', width: 14 }}>{b.num}</span>
                            <div style={{ width: 34, height: 46, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                              <BookCover bookId={b.id} title={b.title} author={b.author} coverUrl={b.coverUrl} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.title}</div>
                              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>{b.author}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => onNavigate('catalog')}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              View Book
                            </button>

                            <button
                              onClick={() => handleAddBook(b)}
                              style={{
                                padding: '5px 12px',
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
                              {isAdded ? <Check size={12} /> : <Plus size={12} />}
                              <span>{isAdded ? 'Added' : '+ Add'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {msg.followUp && (
                  <div style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic' }}>
                    {msg.followUp}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* ── Chat Input Container with Mic & Shortcuts matching Screenshot 5 ── */}
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
            placeholder="Ask anything about books, concepts, or the library..."
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
            'Recommend OS books',
            'Summarize Clean Code',
            'Best books for DSA',
            'Latest arrivals in AI'
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
