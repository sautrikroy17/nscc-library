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
  Bookmark,
  QrCode,
  Copy,
  Zap,
  RotateCcw,
  Globe,
  Download,
  Plus,
  X,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { books as booksApi, transactions as txApi } from '../api';
import { localStore } from '../data/localStore';
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
  },
  'BK031': {
    rating: '4.9',
    reviews: '8.5k',
    isbn: '978-0439708180',
    publisher: 'Scholastic / Bloomsbury',
    year: '1997',
    pages: '309',
    desc: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. On his eleventh birthday, he discovers he is a wizard.'
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
  },
  'Harry Potter': {
    bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
    ring: '#f59e0b',
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    light: false
  },
  'Lord of the Rings': {
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    ring: '#a855f7',
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien',
    light: false
  },
  '1984': {
    bg: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
    ring: '#ef4444',
    title: '1984',
    author: 'George Orwell',
    light: false
  },
  'Atomic Habits': {
    bg: 'linear-gradient(135deg, #042f2e 0%, #115e59 100%)',
    ring: '#14b8a6',
    title: 'Atomic Habits',
    author: 'James Clear',
    light: false
  },
  'Steve Jobs': {
    bg: 'linear-gradient(135deg, #172554 0%, #1e40af 100%)',
    ring: '#38bdf8',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    light: false
  }
};

function CoverPreview({ title, height = 140, light = false, coverUrl = null }) {
  if (coverUrl) {
    return (
      <div style={{
        width: '100%',
        height,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        background: '#0d1627'
      }}>
        <img 
          src={coverUrl} 
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    );
  }

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
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 4,
        background: 'rgba(255, 255, 255, 0.25)'
      }} />

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
        <span>SRM IST CENTRAL</span>
      </div>
    </div>
  );
}

export default function Catalog({ 
  onNavigate = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  initialTab = 'catalog'
}) {
  const { user } = useAuth();
  const [booksList, setBooksList] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [qrModalBook, setQrModalBook] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState(['BK002', 'BK004', 'BK015', 'BK031', 'BK006']);
  const [activeTab, setActiveTab] = useState('description');
  const [openLibraryBooks, setOpenLibraryBooks] = useState([]);
  const [isSearchingOpenLibrary, setIsSearchingOpenLibrary] = useState(false);

  const loadData = async () => {
    try {
      const [bData, tData] = await Promise.all([
        booksApi.getAll(),
        txApi.getAll()
      ]);
      const bList = (Array.isArray(bData) && bData.length > 0) ? bData : (bData?.books?.length ? bData.books : INITIAL_BOOKS);
      setBooksList(bList);
      const tList = Array.isArray(tData) ? tData : (tData?.transactions || []);
      setActiveLoans(tList.filter(t => t.status !== 'returned'));
    } catch (err) {
      console.warn('Catalog loadData fallback to localStore:', err);
      const localBooks = localStore.listBooks({ limit: 100 });
      const bList = (localBooks?.books && localBooks.books.length > 0) ? localBooks.books : INITIAL_BOOKS;
      setBooksList(bList);
      const localTx = localStore.listTransactions();
      setActiveLoans((localTx?.transactions || []).filter(t => t.status !== 'returned'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isWishlistTab = initialTab === 'wishlist';
  const isSearchTab = initialTab === 'search';

  // When searchQuery changes and has no local matches, automatically trigger Open Library preview
  useEffect(() => {
    const q = (searchQuery || '').trim();
    if (q.length > 2 && filteredBooks.length === 0) {
      searchOpenLibrary(q);
    }
  }, [searchQuery, booksList]);

  const userReg = (user?.reg_number || 'RA2311003030001').toUpperCase();
  const myActiveLoans = activeLoans.filter(t => 
    (t.borrower_reg && t.borrower_reg.toUpperCase() === userReg) ||
    (t.borrower_name && t.borrower_name.toLowerCase() === (user?.name || 'sautrik roy').toLowerCase())
  );

  const categories = [
    'All', 
    'Software Engineering', 
    'Algorithms', 
    'Databases', 
    'Operating Systems', 
    'Computer Networks', 
    'AI & Machine Learning', 
    'Literature & Fiction', 
    'Interview Prep',
    'Self-Improvement & Productivity',
    'Biography & Technology'
  ];

  const q = (searchQuery || '').trim().toLowerCase();
  const safeList = (Array.isArray(booksList) && booksList.length > 0) ? booksList : INITIAL_BOOKS;

  const filteredBooks = safeList.filter(b => {
    if (!b) return false;
    if (isWishlistTab && !wishlist.includes(b.id)) return false;
    if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
    
    const isBorrowedByMe = myActiveLoans.some(t => t.book_id?.toUpperCase() === b.id?.toUpperCase());
    if (availabilityFilter === 'Available' && (b.available_copies <= 0 || isBorrowedByMe)) return false;
    if (availabilityFilter === 'Borrowed' && !isBorrowedByMe) return false;
    if (availabilityFilter === 'Limited' && (b.available_copies > 2 || b.available_copies <= 0)) return false;

    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.isbn && b.isbn.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      b.id.toLowerCase().includes(q)
    );
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
      toast.success(res.message || `Successfully checked out ${b.title}! Due in 14 days.`);
      // Decrement locally
      setBooksList(prev => prev.map(item => item.id === b.id ? { ...item, available_copies: item.available_copies - 1 } : item));
      setActiveLoans(prev => [
        {
          id: `TXN_${Date.now()}`,
          book_id: b.id,
          book_title: b.title,
          borrower_name: user?.name || 'Sautrik Roy',
          borrower_reg: user?.reg_number || 'RA2311003030001',
          status: 'issued'
        },
        ...prev
      ]);
      if (selectedBook && selectedBook.id === b.id) {
        setSelectedBook(prev => ({ ...prev, available_copies: prev.available_copies - 1 }));
      }
    }).catch(err => {
      playErrorBeep();
      toast.error(err.message || 'Borrow operation failed');
    });
  };

  const handleReturn = (b) => {
    playClick();
    txApi.return({
      book_id: b.id,
      borrower_reg: user?.reg_number || 'RA2311003030001'
    }).then(res => {
      playSuccessChime();
      toast.success(res.message || `Successfully returned "${b.title}" to library! Outstanding fine: ₹0`);
      // Increment locally
      setBooksList(prev => prev.map(item => item.id === b.id ? { ...item, available_copies: item.available_copies + 1 } : item));
      setActiveLoans(prev => prev.filter(t => t.book_id?.toUpperCase() !== b.id?.toUpperCase()));
      if (selectedBook && selectedBook.id === b.id) {
        setSelectedBook(prev => ({ ...prev, available_copies: prev.available_copies + 1 }));
      }
    }).catch(err => {
      playErrorBeep();
      toast.error(err.message || 'Return operation failed');
    });
  };

  const searchOpenLibrary = async (term) => {
    const queryTerm = (term || searchQuery || '').trim();
    if (!queryTerm) return;
    setIsSearchingOpenLibrary(true);
    try {
      const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(queryTerm)}&limit=6`);
      const data = await resp.json();
      const docs = (data.docs || []).slice(0, 6).map((doc, idx) => ({
        id: `BK${Math.floor(100 + Math.random() * 899)}`,
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(', ') : 'Acclaimed Author',
        isbn: doc.isbn ? doc.isbn[0] : `978-OL${Math.floor(100000000 + Math.random() * 900000000)}`,
        category: doc.subject ? doc.subject[0] : 'General Literature',
        total_copies: 4,
        available_copies: 4,
        shelf_location: `Zone N-${100 + idx}`,
        description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : `A notable work by ${doc.author_name ? doc.author_name[0] : 'the author'}. Published in ${doc.first_publish_year || 'various editions'}.`,
        published_year: doc.first_publish_year || 2020,
        cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
        cover_color: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#06b6d4'][idx % 5]
      }));
      setOpenLibraryBooks(docs);
      if (docs.length > 0) {
        toast.info(`Found ${docs.length} global records from Open Library!`);
      }
    } catch (err) {
      console.warn('OpenLibrary search error:', err);
    } finally {
      setIsSearchingOpenLibrary(false);
    }
  };

  const handleAcquireAndIssue = (book) => {
    playClick();
    const newBook = {
      ...book,
      available_copies: book.available_copies - 1
    };

    localStore.createBook(newBook);
    setBooksList(prev => [newBook, ...prev]);

    txApi.issue({
      book_id: newBook.id,
      borrower_name: user?.name || 'Sautrik Roy',
      borrower_reg: user?.reg_number || 'RA2311003030001',
      borrower_dept: user?.department || 'CSE',
      loan_days: 14
    }).then(() => {
      playSuccessChime();
      toast.success(`"${newBook.title}" acquired into SRM IST Stacks and issued to you!`);
      setActiveLoans(prev => [
        {
          id: `TXN_${Date.now()}`,
          book_id: newBook.id,
          book_title: newBook.title,
          borrower_name: user?.name || 'Sautrik Roy',
          borrower_reg: user?.reg_number || 'RA2311003030001',
          status: 'issued'
        },
        ...prev
      ]);
      setOpenLibraryBooks(prev => prev.filter(b => b.title !== book.title));
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
              padding: 36,
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              gap: 40,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
            }}>
              {/* Left Column: Cover & Quick Stats */}
              <div>
                <CoverPreview title={selectedBook.title} height={260} coverUrl={selectedBook.cover_url} />

                <div style={{
                  background: 'rgba(8, 12, 20, 0.6)',
                  borderRadius: 12,
                  padding: 18,
                  marginTop: 20,
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Copies Available</span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: 13,
                      color: selectedBook.available_copies > 0 ? '#10b981' : '#f43f5e'
                    }}>
                      {selectedBook.available_copies} of {selectedBook.total_copies ?? 5}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Shelf Location</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                      {selectedBook.shelf_location || 'Zone A-101'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Standard Loan</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#ffffff' }}>14 Days</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Author, Issue / Return Action */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '4px 10px',
                    borderRadius: 6
                  }}>
                    {selectedBook.category}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px 10px',
                    borderRadius: 6
                  }}>
                    ID: {selectedBook.id}
                  </span>
                </div>

                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  color: '#ffffff',
                  marginBottom: 8,
                  lineHeight: 1.25
                }}>
                  {selectedBook.title}
                </h1>
                <div style={{ fontSize: 15, color: '#94a3b8', marginBottom: 20 }}>
                  By <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedBook.author}</span>
                </div>

                {/* Rating & Review row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700 }}>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span>{BOOK_METAS[selectedBook.id]?.rating || '4.8'}</span>
                  </div>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#94a3b8' }}>{BOOK_METAS[selectedBook.id]?.reviews || '1.2k'} reviews</span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#94a3b8' }}>ISBN {BOOK_METAS[selectedBook.id]?.isbn || selectedBook.isbn || '978-0132350884'}</span>
                </div>

                {/* Status Callout */}
                {myActiveLoans.some(t => t.book_id?.toUpperCase() === selectedBook.id?.toUpperCase()) ? (
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#38bdf8'
                  }}>
                    <BookMarked size={18} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      You currently have this title checked out under Reg No. {userReg}.
                    </span>
                  </div>
                ) : null}

                {/* ACTION BUTTONS: [Issue / Borrow] + [Return] + [QR] + [Wishlist] */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                  {myActiveLoans.some(t => t.book_id?.toUpperCase() === selectedBook.id?.toUpperCase()) ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReturn(selectedBook)}
                      style={{
                        padding: '12px 28px',
                        borderRadius: 10,
                        background: '#06b6d4',
                        border: 'none',
                        color: '#080c14',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <RotateCcw size={16} />
                      <span>Return Book to Library</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBorrow(selectedBook)}
                      disabled={selectedBook.available_copies <= 0}
                      style={{
                        padding: '12px 28px',
                        borderRadius: 10,
                        background: selectedBook.available_copies > 0 ? '#10b981' : '#334155',
                        border: 'none',
                        color: selectedBook.available_copies > 0 ? '#080c14' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: selectedBook.available_copies > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: selectedBook.available_copies > 0 ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Plus size={16} />
                      <span>{selectedBook.available_copies > 0 ? 'Borrow Book (14 Days)' : 'Currently Checked Out'}</span>
                    </motion.button>
                  )}

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

                  <button
                    onClick={() => { playClick(); setQrModalBook(selectedBook); }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#10b981',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      transition: 'all 150ms'
                    }}
                  >
                    <QrCode size={16} />
                    <span>View Book QR</span>
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
                        color: activeTab === 'description' ? '#10b981' : '#94a3b8',
                        borderBottom: activeTab === 'description' ? '2px solid #10b981' : 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
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
                        color: activeTab === 'details' ? '#10b981' : '#94a3b8',
                        borderBottom: activeTab === 'details' ? '2px solid #10b981' : 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Publication Details
                    </button>
                  </div>

                  <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.7 }}>
                    {activeTab === 'description' ? (
                      <div>
                        {BOOK_METAS[selectedBook.id]?.desc || selectedBook.description}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>Publisher: <strong style={{ color: '#fff' }}>{BOOK_METAS[selectedBook.id]?.publisher || 'MIT / Pearson'}</strong></div>
                        <div>Year: <strong style={{ color: '#fff' }}>{selectedBook.published_year || '2022'}</strong></div>
                        <div>Pages: <strong style={{ color: '#fff' }}>{BOOK_METAS[selectedBook.id]?.pages || '450'}</strong></div>
                        <div>Language: <strong style={{ color: '#fff' }}>English (Academic)</strong></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             SCREEN 4: BROWSE BOOKS VIEW
             ========================================================================= */
          <motion.div
            key="catalog-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header Title */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: '#ffffff',
                marginBottom: 6,
                letterSpacing: '-0.5px'
              }}>
                {isWishlistTab 
                  ? `My Saved Wishlist (${filteredBooks.length} Titles)` 
                  : isSearchTab 
                    ? 'Search Campus Catalog & Global Stacks' 
                    : 'Browse Library Stacks'}
              </h1>
              <p style={{ fontSize: 13.5, color: '#94a3b8' }}>
                {isWishlistTab 
                  ? 'Your personal reading queue — borrow or return titles directly from this list' 
                  : isSearchTab 
                    ? 'Instant real-time search across 30+ library stacks, ISBNs, and global Open Library' 
                    : 'Search, borrow, and return from over 36+ physical titles and academic collections'}
              </p>
            </div>

            {isWishlistTab && filteredBooks.length === 0 && (
              <div style={{
                background: 'rgba(14, 22, 38, 0.65)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: 16,
                padding: '40px 24px',
                textAlign: 'center',
                marginBottom: 30
              }}>
                <Heart size={40} color="#f43f5e" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                  Your Wishlist is Empty
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 460, margin: '0 auto 20px' }}>
                  Tap the heart icon on any book in the catalog to bookmark it for later study or borrowing.
                </p>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    background: '#10b981',
                    border: 'none',
                    color: '#080c14',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Browse Campus Stacks
                </button>
              </div>
            )}

            {/* Prominent Search Input Box */}
            <div style={{
              maxWidth: 680,
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(14, 22, 38, 0.9)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 14,
              padding: '10px 18px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.15)'
            }}>
              <Search size={18} color="#10b981" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search books, authors, ISBN, Harry Potter, Algorithms..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: 14
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  title="Clear Search"
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Fast Suggestion Quick Chips */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 24
            }}>
              {['Harry Potter', 'Clean Code', 'Algorithms', 'Operating Systems', 'Machine Learning', 'Databases', '1984', 'Atomic Habits'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { playClick(); onSearchChange(tag); }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: searchQuery.toLowerCase() === tag.toLowerCase() ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
                    color: searchQuery.toLowerCase() === tag.toLowerCase() ? '#080c14' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 150ms'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Filter Bar & Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
                    <option value="Borrowed" style={{ background: '#0e1628' }}>Borrowed by You ({myActiveLoans.length})</option>
                    <option value="Limited" style={{ background: '#0e1628' }}>Limited Copies</option>
                  </select>
                </div>
              </div>

              {/* View Mode & Results Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                  {filteredBooks.length} Books Found
                </span>

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
            </div>

            {/* If 0 books match in physical stacks, display search empty state & Open Library Button */}
            {filteredBooks.length === 0 && (
              <div style={{
                background: 'rgba(14, 22, 38, 0.65)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: 16,
                padding: '40px 24px',
                textAlign: 'center',
                marginBottom: 30
              }}>
                <BookOpen size={40} color="#94a3b8" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                  No physical copies found matching "{searchQuery}"
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 460, margin: '0 auto 20px' }}>
                  The requested title might be part of the Global Academic Repository or Open Library. Search globally to acquire and issue it immediately.
                </p>

                <button
                  onClick={() => searchOpenLibrary(searchQuery)}
                  disabled={isSearchingOpenLibrary}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    background: '#06b6d4',
                    border: 'none',
                    color: '#080c14',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  <Globe size={15} />
                  <span>{isSearchingOpenLibrary ? 'Searching Global Open Library...' : `Search Open Library for "${searchQuery}"`}</span>
                </button>
              </div>
            )}

            {/* 4-Column Responsive Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20
            }}>
              {filteredBooks.map(book => {
                const isAvail = book.available_copies > 0;
                const isLow = book.available_copies > 0 && book.available_copies <= 2;
                const isBorrowedByMe = myActiveLoans.some(t => t.book_id?.toUpperCase() === book.id?.toUpperCase());

                return (
                  <motion.div
                    key={book.id}
                    whileHover={{ y: -4 }}
                    style={{
                      background: 'rgba(14, 22, 38, 0.75)',
                      border: `1px solid ${isBorrowedByMe ? 'rgba(6, 182, 212, 0.35)' : 'rgba(255, 255, 255, 0.07)'}`,
                      borderRadius: 14,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: isBorrowedByMe ? '0 0 18px rgba(6, 182, 212, 0.15)' : 'none'
                    }}
                    onClick={() => { playClick(); setSelectedBook(book); }}
                  >
                    <div>
                      {/* Realistic Cover Preview */}
                      <CoverPreview title={book.title} height={140} coverUrl={book.cover_url} />

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

                      {/* Availability / Borrowed Badge */}
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isBorrowedByMe ? (
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: '#06b6d4',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#06b6d4' }} />
                            Borrowed by You
                          </span>
                        ) : (
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
                        )}
                        <span style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace' }}>
                          {book.shelf_location}
                        </span>
                      </div>
                    </div>

                    {/* Action Row: Issue / Borrow / Return + QR Code */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {isBorrowedByMe ? (
                        <button
                          title="Return this book to the library"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReturn(book);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            borderRadius: 8,
                            background: 'rgba(6, 182, 212, 0.18)',
                            border: '1px solid rgba(6, 182, 212, 0.45)',
                            color: '#38bdf8',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            transition: 'all 150ms'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#06b6d4';
                            e.currentTarget.style.color = '#080c14';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.18)';
                            e.currentTarget.style.color = '#38bdf8';
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Return</span>
                        </button>
                      ) : isAvail ? (
                        <button
                          title="Borrow this book for 14 days"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBorrow(book);
                          }}
                          style={{
                            flex: 1,
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
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            toast.info(`Reserved ${book.title}. You will receive a notification when a copy is returned.`);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            borderRadius: 8,
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            color: '#f43f5e',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Reserved
                        </button>
                      )}

                      <button
                        title={`View QR code for ${book.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          setQrModalBook(book);
                        }}
                        style={{
                          width: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          cursor: 'pointer',
                          transition: 'all 150ms'
                        }}
                      >
                        <QrCode size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Global Open Library Search Section (If search matches or user searched) */}
            {openLibraryBooks.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={18} color="#06b6d4" />
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                      Global Academic Library Results ({openLibraryBooks.length} Titles)
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#06b6d4' }}>
                    Click to acquire & issue directly to your card
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16
                }}>
                  {openLibraryBooks.map((olBook, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(14, 22, 38, 0.85)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: 12,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#ffffff' }}>
                          {olBook.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {olBook.author} · {olBook.published_year}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>
                          {olBook.description.substring(0, 100)}...
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcquireAndIssue(olBook)}
                        style={{
                          width: '100%',
                          padding: '9px 0',
                          borderRadius: 8,
                          background: '#06b6d4',
                          border: 'none',
                          color: '#080c14',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 0 14px rgba(6, 182, 212, 0.3)'
                        }}
                      >
                        <Download size={14} />
                        <span>Add to Stacks & Issue to Me</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book QR Code & Barcode Inspector Modal */}
      {qrModalBook && (
        <div
          className="modal-overlay"
          onClick={() => setQrModalBook(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d1627',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 420,
              padding: 28,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)',
              textAlign: 'center'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <QrCode size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>Book QR Pass</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Circulation Shelf Barcode</div>
                </div>
              </div>
              <button
                onClick={() => setQrModalBook(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Book Details */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: 2
              }}>
                {qrModalBook.title}
              </div>
              <div style={{ fontSize: 12.5, color: '#94a3b8' }}>
                {qrModalBook.author}
              </div>
            </div>

            {/* QR Code Container */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 16,
              display: 'inline-block',
              margin: '0 auto 16px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <svg viewBox="0 0 100 100" width="160" height="160">
                <rect x="5" y="5" width="26" height="26" rx="3" fill="#080c14" />
                <rect x="10" y="10" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" rx="1" fill="#080c14" />

                <rect x="69" y="5" width="26" height="26" rx="3" fill="#080c14" />
                <rect x="74" y="10" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" rx="1" fill="#080c14" />

                <rect x="5" y="69" width="26" height="26" rx="3" fill="#080c14" />
                <rect x="10" y="74" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" rx="1" fill="#080c14" />

                <rect x="38" y="10" width="8" height="8" fill="#080c14" />
                <rect x="50" y="10" width="8" height="8" fill="#080c14" />
                <rect x="38" y="24" width="8" height="8" fill="#080c14" />
                <rect x="54" y="24" width="8" height="8" fill="#080c14" />

                <rect x="10" y="38" width="8" height="8" fill="#080c14" />
                <rect x="22" y="38" width="8" height="8" fill="#080c14" />
                <rect x="70" y="38" width="8" height="8" fill="#080c14" />
                <rect x="82" y="38" width="8" height="8" fill="#080c14" />

                {/* Center Core */}
                <rect x="38" y="38" width="24" height="24" rx="4" fill="#10b981" />
                <text x="50" y="53" fontSize="8.5" fontWeight="900" textAnchor="middle" fill="#080c14" fontFamily="monospace">
                  {qrModalBook.id}
                </text>

                <rect x="10" y="54" width="8" height="8" fill="#080c14" />
                <rect x="24" y="54" width="8" height="8" fill="#080c14" />
                <rect x="70" y="54" width="8" height="8" fill="#080c14" />
                <rect x="82" y="54" width="8" height="8" fill="#080c14" />

                <rect x="38" y="70" width="8" height="8" fill="#080c14" />
                <rect x="50" y="70" width="8" height="8" fill="#080c14" />
                <rect x="66" y="70" width="8" height="8" fill="#080c14" />
                <rect x="38" y="82" width="8" height="8" fill="#080c14" />
                <rect x="54" y="82" width="8" height="8" fill="#080c14" />
                <rect x="74" y="82" width="8" height="8" fill="#080c14" />
              </svg>
            </div>

            {/* Simulated Barcode */}
            <div style={{
              background: 'rgba(8, 12, 20, 0.7)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', gap: 2, height: 22, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2].map((w, i) => (
                  <div key={i} style={{ width: w, height: '100%', background: i % 2 === 0 ? '#10b981' : '#ffffff' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                ID: {qrModalBook.id} · Shelf: {qrModalBook.shelf_location || 'Zone A-102'}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  playClick();
                  navigator.clipboard?.writeText(qrModalBook.id);
                  toast.success(`Book ID ${qrModalBook.id} copied!`);
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Copy size={14} />
                <span>Copy ID</span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  setQrModalBook(null);
                  onNavigate('scanner');
                }}
                style={{
                  flex: 1.5,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: '#10b981',
                  border: 'none',
                  color: '#080c14',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Zap size={14} />
                <span>Open in Scanner</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
