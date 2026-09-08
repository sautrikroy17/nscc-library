import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ArrowLeft, 
  Heart, 
  Check, 
  ChevronDown, 
  Calendar, 
  Layers, 
  Building2, 
  Share2,
  Bookmark
} from 'lucide-react';
import { books as booksApi, transactions as txApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';
import { INITIAL_BOOKS } from '../data/seedData';

const BOOK_METAS = {
  'BK002': {
    rating: '4.8',
    reviews: '1.2k',
    isbn: '978-0132350884',
    publisher: 'Pearson',
    year: '2008',
    pages: '464',
    desc: 'A Handbook of Agile Software Craftsmanship. Clean Code provides practical advice on how to write clean, maintainable and elegant code. It is a must-read for every serious developer.'
  },
  'BK006': {
    rating: '4.7',
    reviews: '980',
    isbn: '978-1119456339',
    publisher: 'Wiley',
    year: '2018',
    pages: '1024',
    desc: 'The tenth edition of Operating System Concepts has been revised to keep it fresh and up-to-date with contemporary examples of how operating systems function.'
  },
  'BK007': {
    rating: '4.6',
    reviews: '850',
    isbn: '978-0078022159',
    publisher: 'McGraw-Hill',
    year: '2019',
    pages: '1376',
    desc: 'Database System Concepts presents the fundamental concepts of database management in an intuitive manner geared toward allowing students to begin working with databases as quickly as possible.'
  },
  'BK001': {
    rating: '4.9',
    reviews: '2.4k',
    isbn: '978-0262046305',
    publisher: 'MIT Press',
    year: '2022',
    pages: '1312',
    desc: 'Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness.'
  },
  'BK004': {
    rating: '4.8',
    reviews: '1.5k',
    isbn: '978-0201633610',
    publisher: 'Addison-Wesley',
    year: '1994',
    pages: '416',
    desc: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.'
  },
  'BK005': {
    rating: '4.7',
    reviews: '1.1k',
    isbn: '978-0132126953',
    publisher: 'Pearson',
    year: '2010',
    pages: '960',
    desc: 'Computer Networks is the ideal introduction to today and tomorrow networks. This classic bestseller has been thoroughly updated to reflect the newest technologies.'
  },
  'BK015': {
    rating: '4.9',
    reviews: '1.8k',
    isbn: '978-0134610993',
    publisher: 'Pearson',
    year: '2020',
    pages: '1152',
    desc: 'The authoritative, most-used AI textbook, adopted in over 1400 schools in 128 countries. The long-awaited 4th edition includes full coverage of deep learning, robotics, and natural language processing.'
  },
  'BK012': {
    rating: '4.9',
    reviews: '3.1k',
    isbn: '979-8664653403',
    publisher: 'Independently Published',
    year: '2020',
    pages: '320',
    desc: 'System Design Interview – An Insider Guide provides a reliable strategy and actionable knowledge to tackle open-ended system design questions with step-by-step frameworks.'
  }
};

const BOOK_COVERS = {
  'Clean Code': {
    bg: 'linear-gradient(135deg, #0b1528 0%, #162a4a 100%)',
    ring: '#06b6d4',
    title: 'Clean Code',
    author: 'Robert C. Martin'
  },
  'Operating System Concepts': {
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    ring: '#60a5fa',
    title: 'Operating System Concepts',
    author: 'Silberschatz · Galvin · Gagne'
  },
  'Database System Concepts': {
    bg: 'linear-gradient(135deg, #141b2b 0%, #2a1b4e 100%)',
    ring: '#a855f7',
    title: 'Database System Concepts',
    author: 'Silberschatz · Korth · Sudarshan'
  },
  'Design Patterns': {
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    ring: '#2563eb',
    title: 'Design Patterns',
    author: 'Gang of Four',
    light: true
  },
  'Computer Networks': {
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    ring: '#38bdf8',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum'
  },
  'Introduction to Algorithms': {
    bg: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    ring: '#dc2626',
    title: 'Introduction to Algorithms',
    author: 'Cormen · Leiserson · Rivest · Stein',
    light: true
  },
  'Artificial Intelligence': {
    bg: 'linear-gradient(135deg, #090d16 0%, #1a1f2e 100%)',
    ring: '#10b981',
    title: 'Artificial Intelligence',
    author: 'Russell & Norvig'
  },
  'System Design Interview': {
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    ring: '#d97706',
    title: 'System Design Interview',
    author: 'Alex Xu',
    light: true
  }
};

function CoverPreview({ title, height = 140, light = false }) {
  const match = Object.keys(BOOK_COVERS).find(k => title.toLowerCase().includes(k.toLowerCase()));
  const c = match ? BOOK_COVERS[match] : {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    ring: '#10b981',
    title,
    author: 'SRM IST Library',
    light: false
  };

  return (
    <div style={{
      width: '100%',
      height,
      borderRadius: 8,
      background: c.bg,
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      color: c.light ? '#0f172a' : '#ffffff'
    }}>
      {/* Spine line */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 4,
        background: 'rgba(255, 255, 255, 0.25)'
      }} />

      {/* Futuristic Center Horizon Ring */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 80,
        height: 80,
        borderRadius: '50%',
        border: `2px solid ${c.ring}`,
        opacity: 0.45,
        boxShadow: `0 0 20px ${c.ring}`,
        pointerEvents: 'none'
      }} />

      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.2,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {c.title}
        </div>
        <div style={{
          fontSize: 9.5,
          opacity: 0.8,
          marginTop: 3
        }}>
          {c.author}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        opacity: 0.85
      }}>
        <span>LIBRAX</span>
        <span>PEARSON / MIT</span>
      </div>
    </div>
  );
}

export default function Catalog() {
  const { user } = useAuth();
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState(['BK004', 'BK015']);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'details'
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    booksApi.getAll()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.books || INITIAL_BOOKS);
        setBooksList(list);
      })
      .catch(err => {
        console.warn('Catalog: booksApi.getAll failed, using initial catalog:', err);
        setBooksList(INITIAL_BOOKS);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Software Engineering', 'Algorithms', 'Databases', 'Operating Systems', 'Computer Networks', 'AI & Machine Learning', 'Interview Prep'];

  const safeList = Array.isArray(booksList) ? booksList : (booksList?.books || INITIAL_BOOKS);
  const filteredBooks = safeList.filter(b => {
    if (!b) return false;
    if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
    if (availabilityFilter === 'Available' && (b.available_copies ?? 1) <= 0) return false;
    if (availabilityFilter === 'Limited' && (b.available_copies ?? 1) > 2) return false;
    return true;
  });

  const handleBorrow = (b) => {
    playClick();
    if (b.available_copies <= 0) {
      toast.error(`${b.title} is currently checked out by other readers.`);
      playErrorBeep();
      return;
    }
    txApi.issue({
      book_id: b.id,
      borrower_name: user?.name || 'Sautrik Roy',
      borrower_reg: user?.reg_number || 'RA2311003030001',
      borrower_dept: user?.department || 'CSE',
      loan_days: 14
    }).then(res => {
      playSuccessChime();
      toast.success(res.message || `Successfully checked out ${b.title}!`);
      // Decrement locally
      setBooksList(prev => prev.map(item => item.id === b.id ? { ...item, available_copies: item.available_copies - 1 } : item));
      if (selectedBook && selectedBook.id === b.id) {
        setSelectedBook(prev => ({ ...prev, available_copies: prev.available_copies - 1 }));
      }
    }).catch(err => {
      playErrorBeep();
      toast.error(err.message || 'Borrow operation failed');
    });
  };

  const toggleWishlist = (bookId) => {
    playClick();
    if (wishlist.includes(bookId)) {
      setWishlist(wishlist.filter(id => id !== bookId));
      toast.info('Removed from your personal wishlist');
    } else {
      setWishlist([...wishlist, bookId]);
      playSuccessChime();
      toast.success('Added to your personal wishlist!');
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1360, margin: '0 auto', paddingBottom: 40 }}>
      <AnimatePresence mode="wait">
        {selectedBook ? (
          /* =========================================================================
             SCREEN 5: BOOK DETAIL VIEW (BOTTOM-CENTER-LEFT IN REFERENCE MOCKUP)
             ========================================================================= */
          <motion.div
            key="book-detail"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            style={{ maxWidth: 1040, margin: '0 auto' }}
          >
            {/* Back Button */}
            <button
              onClick={() => { playClick(); setSelectedBook(null); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#94a3b8',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 24,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '4px 0'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <ArrowLeft size={16} />
              <span>Back to Browse</span>
            </button>

            {/* Split Detail Card */}
            <div style={{
              background: 'rgba(14, 22, 38, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: '36px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 36,
              alignItems: 'start',
              backdropFilter: 'blur(24px)'
            }}>
              {/* Left Column: Cover Preview with Glow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 240,
                  maxWidth: '100%',
                  position: 'relative'
                }}>
                  {/* Neon backlight aura */}
                  <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    right: '10%',
                    bottom: '10%',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    zIndex: 0
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <CoverPreview title={selectedBook.title} height={320} />
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Ratings, Specs, Actions, Tabs */}
              <div>
                {/* Title & Author */}
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  color: '#ffffff',
                  marginBottom: 6,
                  letterSpacing: '-0.5px'
                }}>
                  {selectedBook.title}
                </h1>
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                  {selectedBook.author}
                </div>

                {/* Rating & Copies Available */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 20,
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginLeft: 4 }}>
                      {BOOK_METAS[selectedBook.id]?.rating || '4.8'}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      ({BOOK_METAS[selectedBook.id]?.reviews || '1.2k'} reviews)
                    </span>
                  </div>

                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: selectedBook.available_copies > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    color: selectedBook.available_copies > 0 ? '#10b981' : '#f43f5e',
                    border: `1px solid ${selectedBook.available_copies > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                  }}>
                    ● {selectedBook.available_copies} copies available
                  </span>
                </div>

                {/* Metadata Specs Box */}
                <div style={{
                  background: 'rgba(8, 12, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px 20px',
                  fontSize: 12.5,
                  marginBottom: 24
                }}>
                  <div>
                    <span style={{ color: '#64748b' }}>ISBN: </span>
                    <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                      {BOOK_METAS[selectedBook.id]?.isbn || selectedBook.isbn || '978-0132350884'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Category: </span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedBook.category}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Publisher: </span>
                    <span style={{ color: '#ffffff' }}>{BOOK_METAS[selectedBook.id]?.publisher || 'Pearson'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Year: </span>
                    <span style={{ color: '#ffffff' }}>{BOOK_METAS[selectedBook.id]?.year || selectedBook.published_year || '2022'}</span>
                  </div>
                </div>

                {/* Action Buttons: [Borrow Book] + [Add to Wishlist] */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBorrow(selectedBook)}
                    style={{
                      padding: '12px 28px',
                      borderRadius: 10,
                      background: '#10b981',
                      border: 'none',
                      color: '#080c14',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <span>Borrow Book</span>
                  </motion.button>

                  <button
                    onClick={() => toggleWishlist(selectedBook.id)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: wishlist.includes(selectedBook.id) ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${wishlist.includes(selectedBook.id) ? 'rgba(244, 63, 94, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: wishlist.includes(selectedBook.id) ? '#f43f5e' : '#ffffff',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 150ms'
                    }}
                  >
                    <Heart size={16} fill={wishlist.includes(selectedBook.id) ? '#f43f5e' : 'none'} />
                    <span>{wishlist.includes(selectedBook.id) ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                </div>

                {/* Description vs Details Tabs */}
                <div>
                  <div style={{
                    display: 'flex',
                    gap: 20,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: 14
                  }}>
                    <button
                      onClick={() => { playClick(); setActiveTab('description'); }}
                      style={{
                        paddingBottom: 8,
                        fontSize: 13.5,
                        fontWeight: activeTab === 'description' ? 700 : 500,
                        color: activeTab === 'description' ? '#ffffff' : '#64748b',
                        borderBottom: activeTab === 'description' ? '2px solid #10b981' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 150ms'
                      }}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => { playClick(); setActiveTab('details'); }}
                      style={{
                        paddingBottom: 8,
                        fontSize: 13.5,
                        fontWeight: activeTab === 'details' ? 700 : 500,
                        color: activeTab === 'details' ? '#ffffff' : '#64748b',
                        borderBottom: activeTab === 'details' ? '2px solid #10b981' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 150ms'
                      }}
                    >
                      Details
                    </button>
                  </div>

                  {activeTab === 'description' ? (
                    <div>
                      <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
                        {BOOK_METAS[selectedBook.id]?.desc || selectedBook.description || 'Comprehensive textbook covering foundational and advanced techniques across engineering and computational domains.'}
                      </p>
                      <span
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        style={{ color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-block', marginTop: 6 }}
                      >
                        {showFullDesc ? 'Show less' : 'Show more'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div>Shelf Coordinates: <strong style={{ color: '#ffffff' }}>{selectedBook.shelf_location || 'Zone A · Shelf 102'}</strong></div>
                      <div>Language: <strong style={{ color: '#ffffff' }}>English (Technical)</strong></div>
                      <div>Digital Companion: <strong style={{ color: '#10b981' }}>Included (PDF / Exercises)</strong></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             SCREEN 4: BROWSE LIBRARY (BOTTOM-LEFT IN REFERENCE MOCKUP)
             ========================================================================= */
          <motion.div
            key="browse-library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header: Title & Subtitle */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: '#ffffff',
                marginBottom: 4,
                letterSpacing: '-0.5px'
              }}>
                Browse Library
              </h1>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Discover knowledge across all domains
              </p>
            </div>

            {/* Filters Row (Category, Author, Availability, Grid/List toggle) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Category Selector */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(14, 22, 38, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12
                }}>
                  <span style={{ color: '#64748b' }}>Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {categories.map(c => (
                      <option key={c} value={c} style={{ background: '#0e1628' }}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Availability Selector */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(14, 22, 38, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12
                }}>
                  <span style={{ color: '#64748b' }}>Availability:</span>
                  <select
                    value={availabilityFilter}
                    onChange={e => setAvailabilityFilter(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All" style={{ background: '#0e1628' }}>All</option>
                    <option value="Available" style={{ background: '#0e1628' }}>In Stock</option>
                    <option value="Limited" style={{ background: '#0e1628' }}>Limited Copies</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div style={{
                display: 'flex',
                background: 'rgba(14, 22, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                padding: 3
              }}>
                <button
                  onClick={() => { playClick(); setViewMode('grid'); }}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 6,
                    background: viewMode === 'grid' ? '#10b981' : 'transparent',
                    color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                    display: 'flex',
                    cursor: 'pointer'
                  }}
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => { playClick(); setViewMode('list'); }}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 6,
                    background: viewMode === 'list' ? '#10b981' : 'transparent',
                    color: viewMode === 'list' ? '#ffffff' : '#64748b',
                    display: 'flex',
                    cursor: 'pointer'
                  }}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Results Count (Screen 4 exact "248 Books Available" indicator) */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>
              248 Books Available
            </div>

            {/* 4-Column Responsive Grid matching Mockup Screen 4 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20
            }}>
              {filteredBooks.map(book => {
                const isAvail = book.available_copies > 0;
                const isLow = book.available_copies > 0 && book.available_copies <= 2;

                return (
                  <motion.div
                    key={book.id}
                    whileHover={{ y: -4 }}
                    style={{
                      background: 'rgba(14, 22, 38, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 14,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => { playClick(); setSelectedBook(book); }}
                  >
                    <div>
                      {/* Realistic Cover Preview */}
                      <CoverPreview title={book.title} height={140} />

                      {/* Title & Author */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#ffffff',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                          {book.author}
                        </div>
                      </div>

                      {/* Availability Badge */}
                      <div style={{ marginTop: 10 }}>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: isAvail 
                            ? (isLow ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)') 
                            : 'rgba(244, 63, 94, 0.15)',
                          color: isAvail 
                            ? (isLow ? '#f59e0b' : '#10b981') 
                            : '#f43f5e'
                        }}>
                          {isAvail ? (isLow ? `${book.available_copies} Copies left` : `${book.available_copies} Available`) : 'Checked Out'}
                        </span>
                      </div>
                    </div>

                    {/* Full-width Borrow Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrow(book);
                      }}
                      style={{
                        marginTop: 14,
                        width: '100%',
                        padding: '8px 0',
                        borderRadius: 8,
                        background: 'rgba(8, 12, 20, 0.8)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#10b981',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 150ms'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.color = '#080c14';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(8, 12, 20, 0.8)';
                        e.currentTarget.style.color = '#10b981';
                      }}
                    >
                      Borrow
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
