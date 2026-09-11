import React from 'react';

// Exact visual styling matching the book covers in Screenshots 1, 2, 3, and 4
export const BOOK_ARTWORKS = {
  'BK002': {
    title: 'Clean Code',
    subtitle: 'A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    bg: '#0a1128',
    coverStyle: 'clean-code',
    accentColor: '#38bdf8',
    pill: 'Programming',
    copies: 3,
    status: 'available',
    dueDays: 2,
    dueDate: '12 Sep 2026'
  },
  'BK006': {
    title: 'Operating System Concepts',
    subtitle: 'Silberschatz, Galvin, Gagne',
    author: 'Silberschatz, Galvin, Gagne',
    bg: '#1d4ed8',
    coverStyle: 'os-concepts',
    accentColor: '#60a5fa',
    pill: 'Computer Science',
    copies: 5,
    status: 'available',
    dueDays: 5,
    dueDate: '15 Sep 2026'
  },
  'BK004': {
    title: 'Design Patterns',
    subtitle: 'Elements of Reusable Object-Oriented Software',
    author: 'Gamma et al.',
    bg: '#f8fafc',
    coverStyle: 'design-patterns',
    accentColor: '#2563eb',
    pill: 'Software Engineering',
    copies: 2,
    status: 'available'
  },
  'BK005': {
    title: 'Computer Networks',
    subtitle: 'Andrew S. Tanenbaum',
    author: 'Tanenbaum',
    bg: '#0284c7',
    coverStyle: 'networks',
    accentColor: '#38bdf8',
    pill: 'Networking',
    copies: 4,
    status: 'available'
  },
  'BK001': {
    title: 'Introduction to Algorithms',
    subtitle: 'Cormen, Leiserson, Rivest, Stein',
    author: 'Cormen et al.',
    bg: '#faf5ee',
    coverStyle: 'algorithms',
    accentColor: '#dc2626',
    pill: 'Algorithms',
    copies: 1,
    status: 'limited'
  },
  'BK007': {
    title: 'Database System Concepts',
    subtitle: 'Silberschatz, Korth, Sudarshan',
    author: 'Silberschatz, Korth, Sudarshan',
    bg: '#1e1b4b',
    coverStyle: 'database',
    accentColor: '#818cf8',
    pill: 'Database',
    copies: 4,
    status: 'available',
    dueDays: 12,
    dueDate: '22 Sep 2026'
  },
  'BK015': {
    title: 'Artificial Intelligence',
    subtitle: 'A Modern Approach',
    author: 'Russell & Norvig',
    bg: '#050811',
    coverStyle: 'ai',
    accentColor: '#34d399',
    pill: 'Artificial Intelligence',
    copies: 3,
    status: 'available'
  },
  'BK026': {
    title: 'Modern Web Development',
    subtitle: 'Niederst Robbins',
    author: 'Niederst Robbins',
    bg: '#0f172a',
    coverStyle: 'web',
    accentColor: '#38bdf8',
    pill: 'Web Development',
    copies: 2,
    status: 'available'
  },
  'BK023': {
    title: 'Engineering Mathematics',
    subtitle: 'B.S. Grewal',
    author: 'B.S. Grewal',
    bg: '#0369a1',
    coverStyle: 'math',
    accentColor: '#facc15',
    pill: 'Mathematics',
    copies: 6,
    status: 'available'
  },
  'BK014': {
    title: 'Digital Design',
    subtitle: 'M. Morris Mano',
    author: 'M. Morris Mano',
    bg: '#fdfbf7',
    coverStyle: 'digital-design',
    accentColor: '#b45309',
    pill: 'Digital Electronics',
    copies: 3,
    status: 'available'
  },
  'BK003': {
    title: 'The Pragmatic Programmer',
    subtitle: 'Your Journey to Mastery',
    author: 'David Thomas & Andrew Hunt',
    bg: '#0f172a',
    coverStyle: 'pragmatic',
    accentColor: '#f59e0b',
    pill: 'Software Engineering',
    copies: 3,
    status: 'available'
  },
  'BK008': {
    title: 'Deep Learning',
    subtitle: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    author: 'Ian Goodfellow et al.',
    bg: '#180e29',
    coverStyle: 'deep-learning',
    accentColor: '#ec4899',
    pill: 'AI & ML',
    copies: 4,
    status: 'available'
  },
  'BK010': {
    title: 'Cracking the Coding Interview',
    subtitle: '189 Programming Questions & Solutions',
    author: 'Gayle Laakmann McDowell',
    bg: '#14532d',
    coverStyle: 'cracking-coding',
    accentColor: '#4ade80',
    pill: 'Interview Prep',
    copies: 6,
    status: 'available'
  },
  'BK020': {
    title: 'Designing Data-Intensive Applications',
    subtitle: 'The Big Ideas Behind Reliable Systems',
    author: 'Martin Kleppmann',
    bg: '#431407',
    coverStyle: 'ddia',
    accentColor: '#fb923c',
    pill: 'Distributed Systems',
    copies: 3,
    status: 'available'
  },
  'BK031': {
    title: "Harry Potter and the Sorcerer's Stone",
    subtitle: 'J.K. Rowling',
    author: 'J.K. Rowling',
    bg: '#3b0764',
    coverStyle: 'harry-potter',
    accentColor: '#f59e0b',
    pill: 'Fiction',
    copies: 5,
    status: 'available'
  },
  'BK034': {
    title: '1984',
    subtitle: 'George Orwell',
    author: 'George Orwell',
    bg: '#450a0a',
    coverStyle: '1984',
    accentColor: '#ef4444',
    pill: 'Dystopian',
    copies: 6,
    status: 'available'
  },
  'BK035': {
    title: 'Atomic Habits',
    subtitle: 'Tiny Changes, Remarkable Results',
    author: 'James Clear',
    bg: '#042f2e',
    coverStyle: 'atomic-habits',
    accentColor: '#14b8a6',
    pill: 'Productivity',
    copies: 5,
    status: 'available'
  },
  'BK012': {
    title: 'System Design Interview',
    subtitle: 'Alex Xu',
    author: 'Alex Xu',
    bg: '#fef3c7',
    coverStyle: 'system-design',
    accentColor: '#d97706',
    pill: 'System Design',
    copies: 3,
    status: 'available'
  }
};

export default function BookCover({ bookId, title, author, width = '100%', height = '100%', style = {}, className = '' }) {
  // Normalize match
  const artwork = BOOK_ARTWORKS[bookId] || 
    Object.values(BOOK_ARTWORKS).find(b => b.title.toLowerCase() === (title || '').toLowerCase()) || 
    {
      title: title || 'Library Book',
      subtitle: author || 'SRM Central Library',
      bg: '#1e293b',
      coverStyle: 'default',
      accentColor: '#10b981'
    };

  const isLight = artwork.coverStyle === 'design-patterns' || 
                  artwork.coverStyle === 'algorithms' || 
                  artwork.coverStyle === 'digital-design' || 
                  artwork.coverStyle === 'system-design';

  return (
    <div 
      className={`book-cover-card ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        background: artwork.bg,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '10% 8%',
        userSelect: 'none',
        aspectRatio: '3 / 4.2',
        ...style
      }}
    >
      {/* Spine Left Highlight (Book realism) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4%',
        height: '100%',
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0.2) 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Book Cover Visual Center graphic */}
      {artwork.coverStyle === 'clean-code' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>Robert C. Martin</div>
            <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, marginTop: 4, letterSpacing: '-0.2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clean Code</div>
            <div style={{ fontSize: '0.52rem', color: '#64748b', marginTop: 2 }}>A Handbook of Agile Software Craftsmanship</div>
          </div>
          {/* Glowing Lens Flare Ring */}
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '40%',
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.6)',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.7), inset 0 0 15px rgba(56, 189, 248, 0.4)',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b', fontWeight: 700 }}>
            <span>Prentice Hall</span>
            <span>SRM CS-3</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'os-concepts' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Operating System Concepts</div>
            <div style={{ fontSize: '0.55rem', color: '#bfdbfe', marginTop: 2 }}>Silberschatz, Galvin, Gagne</div>
          </div>
          {/* Architectural Dinosaur silhoutte abstract graphics */}
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            right: '10%',
            height: '45%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            opacity: 0.85
          }}>
            <div style={{ width: '22%', height: '70%', background: '#3b82f6', borderRadius: '4px 4px 0 0', boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }} />
            <div style={{ width: '30%', height: '95%', background: '#60a5fa', borderRadius: '6px 6px 0 0', boxShadow: '0 0 15px rgba(96, 165, 250, 0.6)' }} />
            <div style={{ width: '25%', height: '60%', background: '#2563eb', borderRadius: '4px 4px 0 0' }} />
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#93c5fd', fontWeight: 700 }}>
            <span>Wiley</span>
            <span>10th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'design-patterns' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Design Patterns</div>
            <div style={{ fontSize: '0.55rem', color: '#475569', marginTop: 2 }}>Elements of Reusable Object-Oriented Software</div>
          </div>
          {/* Blueprint Wireframe Graphic */}
          <div style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '42%',
            border: '1px dashed #2563eb',
            borderRadius: 4,
            background: 'rgba(37, 99, 235, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4
          }}>
            <div style={{ width: '60%', height: 3, background: '#2563eb', opacity: 0.5 }} />
            <div style={{ width: '40%', height: 3, background: '#2563eb', opacity: 0.3 }} />
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b', fontWeight: 700 }}>
            <span>Gamma · Helm</span>
            <span>Addison-Wesley</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'networks' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Computer Networks</div>
            <div style={{ fontSize: '0.55rem', color: '#bae6fd', marginTop: 2 }}>Tanenbaum</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '40%',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#bae6fd', fontWeight: 700 }}>
            <span>Pearson</span>
            <span>5th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'algorithms' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Introduction to Algorithms</div>
            <div style={{ fontSize: '0.52rem', color: '#64748b', marginTop: 2 }}>Cormen · Leiserson · Rivest · Stein</div>
          </div>
          {/* Calder Mobile Abstract Art */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #dc2626', position: 'relative' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#dc2626', position: 'absolute', top: -6, right: -4 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0f172a', position: 'absolute', bottom: -4, left: -2 }} />
            </div>
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b', fontWeight: 700 }}>
            <span>MIT Press</span>
            <span>4th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'database' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 800 }}>Database System Concepts</div>
            <div style={{ fontSize: '0.52rem', color: '#c7d2fe', marginTop: 2 }}>Silberschatz, Korth, Sudarshan</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', boxShadow: '0 0 20px #818cf8' }} />
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#a5b4fc', fontWeight: 700 }}>
            <span>McGraw-Hill</span>
            <span>7th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'ai' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 800 }}>Artificial Intelligence</div>
            <div style={{ fontSize: '0.52rem', color: '#94a3b8', marginTop: 2 }}>A Modern Approach</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #34d399', boxShadow: '0 0 20px rgba(52, 211, 153, 0.6)' }} />
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#6ee7b7', fontWeight: 700 }}>
            <span>Russell & Norvig</span>
            <span>4th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'web' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 800 }}>Modern Web Development</div>
            <div style={{ fontSize: '0.52rem', color: '#94a3b8', marginTop: 2 }}>Niederst Robbins</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '35%',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(16, 185, 129, 0.2))',
            borderRadius: 6,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700 }}>
            <span>O\'Reilly</span>
            <span>HTML & CSS</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'math' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 800 }}>Engineering Mathematics</div>
            <div style={{ fontSize: '0.52rem', color: '#bae6fd', marginTop: 2 }}>B.S. Grewal</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid #facc15',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.5)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#fef08a', fontWeight: 700 }}>
            <span>Khanna Publishers</span>
            <span>Higher Math</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'digital-design' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>Digital Design</div>
            <div style={{ fontSize: '0.52rem', color: '#475569', marginTop: 2 }}>M. Morris Mano</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '65%',
            height: '35%',
            border: '1px solid #b45309',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(180, 83, 9, 0.05)'
          }}>
            <div style={{ fontSize: '0.55rem', color: '#b45309', fontWeight: 700 }}>LOGIC CIRCUITS</div>
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b', fontWeight: 700 }}>
            <span>Pearson</span>
            <span>6th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'system-design' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 800 }}>System Design</div>
            <div style={{ fontSize: '0.52rem', color: '#475569', marginTop: 2 }}>Alex Xu</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
            borderRadius: 6,
            background: '#d97706',
            boxShadow: '0 0 15px rgba(217, 119, 6, 0.4)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#78350f', fontWeight: 700 }}>
            <span>ByteByteGo</span>
            <span>Vol 1</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'pragmatic' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>David Thomas · Andrew Hunt</div>
            <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 800, marginTop: 4, letterSpacing: '-0.2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>The Pragmatic Programmer</div>
            <div style={{ fontSize: '0.52rem', color: '#cbd5e1', marginTop: 2 }}>20th Anniversary Edition</div>
          </div>
          {/* Pragmatic Compass Gem */}
          <div style={{
            position: 'absolute',
            top: '54%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
            transformOrigin: 'center',
            rotate: '45deg',
            border: '2px solid #f59e0b',
            background: 'rgba(245, 158, 11, 0.12)',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: 14, height: 14, background: '#f59e0b', borderRadius: 2 }} />
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#cbd5e1', fontWeight: 700 }}>
            <span>Addison-Wesley</span>
            <span>2nd Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'deep-learning' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 800 }}>Deep Learning</div>
            <div style={{ fontSize: '0.52rem', color: '#f472b6', marginTop: 2 }}>Goodfellow · Bengio · Courville</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid #ec4899',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.6)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#fbcfe8', fontWeight: 700 }}>
            <span>MIT Press</span>
            <span>Adaptive Computation</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'cracking-coding' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 800 }}>Cracking the Coding Interview</div>
            <div style={{ fontSize: '0.52rem', color: '#86efac', marginTop: 2 }}>Gayle Laakmann McDowell</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '6px 10px',
            border: '1.5px solid #4ade80',
            borderRadius: 6,
            background: 'rgba(74, 222, 128, 0.1)',
            fontSize: '0.62rem',
            color: '#4ade80',
            fontWeight: 800
          }}>
            189 QUESTIONS
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#86efac', fontWeight: 700 }}>
            <span>CareerCup</span>
            <span>6th Edition</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'ddia' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 800 }}>Designing Data-Intensive Applications</div>
            <div style={{ fontSize: '0.52rem', color: '#fdba74', marginTop: 2 }}>Martin Kleppmann</div>
          </div>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
            borderRadius: 4,
            border: '2px dashed #fb923c',
            boxShadow: '0 0 16px rgba(251, 146, 60, 0.4)'
          }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#fed7aa', fontWeight: 700 }}>
            <span>O\'Reilly</span>
            <span>Distributed Systems</span>
          </div>
        </>
      )}

      {artwork.coverStyle === 'default' && (
        <>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: 800 }}>{artwork.title}</div>
            <div style={{ fontSize: '0.52rem', color: isLight ? '#475569' : '#94a3b8', marginTop: 2 }}>{artwork.subtitle}</div>
          </div>
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 700 }}>
            <span>LibraX</span>
            <span>SRM IST</span>
          </div>
        </>
      )}
    </div>
  );
}
