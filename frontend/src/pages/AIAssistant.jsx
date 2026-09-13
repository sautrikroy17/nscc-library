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
      generateLyraResponse(query);
    }, 600);
  };

  const handleMoodSelect = (mood) => {
    setActiveMood(mood.id);
    handleSend(mood.query);
  };

  const generateLyraResponse = (query) => {
    playSuccessChime();
    const qLower = query.toLowerCase();

    if (qLower.includes('stressed') || qLower.includes('overwhelmed') || qLower.includes('clarity')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "Take a deep breath! You're doing amazing, and university exams can feel heavy sometimes. When you're stressed, you don't need dense 1,000-page textbooks—you need clear, gentle authors who explain things intuitively with diagrams. Here are gentle, calming, crystal-clear reads:",
          books: [
            { id: 'BK003', num: 1, title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK026', num: 2, title: 'Modern Web Development', author: 'Matt Ridley', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK002', num: 3, title: 'Clean Code', author: 'Robert C. Martin', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: "Remember: small steps lead to big knowledge. Would you like me to summarize the 3 most important takeaway rules from any of these?"
        }
      ]);
    } else if (qLower.includes('placement') || qLower.includes('career') || qLower.includes('interview')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "Let's get that dream offer! 🚀 Top tech companies look for two things: crystal clear algorithmic thinking and robust architectural instincts. Here is my ultimate high-yield placement toolkit currently in our stacks:",
          books: [
            { id: 'BK010', num: 1, title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK001', num: 2, title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson et al.', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK014', num: 3, title: 'System Design Interview', author: 'Alex Xu', coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: "Want me to quiz you on a classic interview question like LRU Cache design or binary tree inversions?"
        }
      ]);
    } else if (qLower.includes('focus') || qLower.includes('study') || qLower.includes('exam')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "Locked in! ⚡ Deep focus requires rigorous, distraction-free syllabus textbooks. Here are the core SRM engineering curriculum references with complete problem sets:",
          books: [
            { id: 'BK006', num: 1, title: 'Operating System Concepts (Dinosaur Book)', author: 'Silberschatz, Galvin, Gagne', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK007', num: 2, title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', coverUrl: 'https://images.unsplash.com/photo-1507842229452-710892015502?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK005', num: 3, title: 'Computer Networks (Tanenbaum)', author: 'Andrew S. Tanenbaum', coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: "Both physical copies and reserved shelf locations are available right now on 2nd Floor - Stacks A & B."
        }
      ]);
    } else if (qLower.includes('curious') || qLower.includes('explor')) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "I love your curiosity! ✨ Reading outside your immediate syllabus is what turns good engineers into visionary leaders. Here are three mind-bending books spanning artificial intelligence, human cognition, and science:",
          books: [
            { id: 'BK015', num: 1, title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK028', num: 2, title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK029', num: 3, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: "Shall I add any of these to your personal Wishlist for weekend leisure reading?"
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Got it! I scoured the SRM Central Library database for "${query}". Here is what I discovered for you:`,
          books: [
            { id: 'BK004', num: 1, title: 'Design Patterns', author: 'Gamma, Helm, Johnson, Vlissides', coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop&q=80' },
            { id: 'BK008', num: 2, title: 'Clean Architecture', author: 'Robert C. Martin', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80' }
          ],
          followUp: "Would you like me to help you issue this book or check shelf availability?"
        }
      ]);
    }
  };

  const handleAddBook = (book) => {
    playSuccessChime();
    setAddedIds(prev => [...prev, book.id]);
    toast.success(`Lyra added "${book.title}" to your Wishlist! ✨`);
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
                      const isAdded = addedIds.includes(b.id);
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
                              onClick={() => onNavigate('catalog')}
                              style={{
                                padding: '6px 14px',
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
                              <span>{isAdded ? 'Added' : '+ Add'}</span>
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
