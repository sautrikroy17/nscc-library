import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Star, 
  ArrowLeft, 
  Heart, 
  ChevronDown, 
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  Plus
} from 'lucide-react';
import { books as booksApi, transactions as txApi } from '../api';
import { localStore } from '../data/localStore';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';
import { INITIAL_BOOKS } from '../data/seedData';

const BOOK_METAS = {
  'BK002': {
    rating: '4.8',
    reviews: '1.2k',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    year: '2008',
    copies: '3 / 5',
    tags: ['Programming', 'Software Engineering', 'Best Practices'],
    desc: 'Even bad code can work. But if code isn\'t clean, it can bring a development organization to its knees. Clean Code provides practical advice on how to write clean, maintainable code, with real-world examples and best practices.'
  },
  'BK006': {
    rating: '4.7',
    reviews: '980',
    isbn: '978-1119456339',
    publisher: 'Wiley',
    year: '2018',
    copies: '5 / 5',
    tags: ['Operating Systems', 'Kernel', 'Computer Science'],
    desc: 'The tenth edition of Operating System Concepts has been revised to keep it fresh and up-to-date with contemporary examples of how operating systems function.'
  },
  'BK007': {
    rating: '4.6',
    reviews: '850',
    isbn: '978-0078022159',
    publisher: 'McGraw-Hill',
    year: '2019',
    copies: '4 / 4',
    tags: ['Databases', 'SQL', 'System Architecture'],
    desc: 'Database System Concepts presents the fundamental concepts of database management in an intuitive manner geared toward allowing students to begin working with databases as quickly as possible.'
  },
  'BK001': {
    rating: '4.9',
    reviews: '2.4k',
    isbn: '978-0262046305',
    publisher: 'MIT Press',
    year: '2022',
    copies: '1 / 3',
    tags: ['Algorithms', 'Data Structures', 'Theory'],
    desc: 'Introduction to Algorithms uniquely combines rigor and comprehensiveness. The book covers a broad range of algorithms in depth, yet makes their design and analysis accessible.'
  },
  'BK004': {
    rating: '4.8',
    reviews: '1.5k',
    isbn: '978-0201633610',
    publisher: 'Addison-Wesley',
    year: '1994',
    copies: '2 / 2',
    tags: ['Design Patterns', 'Architecture', 'OOP'],
    desc: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.'
  },
  'BK005': {
    rating: '4.7',
    reviews: '1.1k',
    isbn: '978-0132126953',
    publisher: 'Pearson',
    year: '2010',
    copies: '3 / 3',
    tags: ['Networking', 'Protocols', 'TCP/IP'],
    desc: 'Computer Networks is the ideal introduction to today\'s and tomorrow\'s networks. This classic bestseller has been thoroughly updated to reflect the newest technologies.'
  }
};

export default function Catalog({ 
  onNavigate = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  initialTab = 'all'
}) {
  const { user } = useAuth();
  const [booksList, setBooksList] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(initialTab === 'history' ? 'history' : 'borrowed');
  const [detailTab, setDetailTab] = useState('overview');

  // Filters (Panel 4)
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');

  // Wishlist state
  const [wishlist, setWishlist] = useState(['BK004', 'BK008', 'BK009', 'BK012']);

  useEffect(() => {
    try {
      const localBooks = localStore.listBooks({ limit: 100 });
      const bList = (localBooks?.books && localBooks.books.length > 0) ? localBooks.books : INITIAL_BOOKS;
      setBooksList(bList);
      const localTx = localStore.listTransactions();
      setActiveLoans(localTx.filter(t => t.status !== 'returned'));
    } catch (e) {
      setBooksList(INITIAL_BOOKS);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBorrow = (book) => {
    playClick();
    playSuccessChime();
    toast.success(`"${book.title}" borrowed successfully! Return due in 14 days.`);
    setActiveLoans(prev => [
      {
        id: `TXN_${Date.now()}`,
        book_id: book.id,
        book_title: book.title,
        issue_date: '13 Sep 2026',
        due_date: '27 Sep 2026',
        status: 'issued'
      },
      ...prev
    ]);
  };

  const handleReturn = (txId, bookTitle) => {
    playClick();
    playSuccessChime();
    toast.success(`"${bookTitle}" returned successfully! Thank you.`);
    setActiveLoans(prev => prev.filter(t => t.id !== txId));
  };

  const toggleWishlist = (bookId) => {
    playClick();
    if (wishlist.includes(bookId)) {
      setWishlist(wishlist.filter(id => id !== bookId));
      toast.info('Removed from your Wishlist');
    } else {
      setWishlist([...wishlist, bookId]);
      playSuccessChime();
      toast.success('Added to your Wishlist!');
    }
  };

  // Filtered books
  const filteredBooks = booksList.filter(book => {
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesAuthor = selectedAuthor === 'All' || book.author.toLowerCase().includes(selectedAuthor.toLowerCase());
    const matchesAvail = selectedAvailability === 'All' || 
      (selectedAvailability === 'Available' && (book.available_copies ?? 2) > 0);
    return matchesSearch && matchesCat && matchesAuthor && matchesAvail;
  });

  /* ═══════════════════════════════════════════════════════════
     SCREEN 5: BOOK DETAILS VIEW (Panel 5 in Mockup)
     ═══════════════════════════════════════════════════════════ */
  if (selectedBook) {
    const meta = BOOK_METAS[selectedBook.id] || {
      rating: '4.8',
      reviews: '1.2k',
      isbn: selectedBook.isbn || '978-0132350884',
      publisher: 'Prentice Hall',
      year: '2008',
      copies: `${selectedBook.available_copies ?? 3} / ${selectedBook.total_copies ?? 5}`,
      tags: ['Programming', 'Software Engineering', 'Best Practices'],
      desc: selectedBook.description || 'Comprehensive textbook with core academic foundations, case studies, and engineering practices.'
    };

    const isWishlisted = wishlist.includes(selectedBook.id);

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Back Link */}
        <button
          onClick={() => { playClick(); setSelectedBook(null); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
            width: 'fit-content'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={15} />
          <span>Back to Browse</span>
        </button>

        {/* Book Details Container */}
        <div className="card" style={{ padding: '36px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start' }}>
            {/* Left Cover Image */}
            <div>
              <img
                src={selectedBook.cover_url || '/covers/clean_code.jpg'}
                alt={selectedBook.title}
                style={{
                  width: '100%',
                  height: 340,
                  borderRadius: 8,
                  objectFit: 'cover',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                }}
                onError={e => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Right Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {selectedBook.title}
                </h1>
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                  {selectedBook.author}
                </div>
              </div>

              {/* Star Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                </div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{meta.rating}</span>
                <span style={{ color: '#64748b' }}>({meta.reviews} reviews)</span>
              </div>

              {/* Genre Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {meta.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#475569',
                    background: '#f1f5f9',
                    padding: '4px 12px',
                    borderRadius: 6
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* 4-Box Specs Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                padding: '16px 18px',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                marginTop: 4
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Publisher</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{meta.publisher}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Year</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{meta.year}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ISBN</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{meta.isbn}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Available Copies</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#10b981', marginTop: 2 }}>{meta.copies}</div>
                </div>
              </div>

              {/* Action Buttons (Panel 5) */}
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <button
                  onClick={() => handleBorrow(selectedBook)}
                  style={{
                    padding: '11px 28px',
                    borderRadius: 8,
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Borrow Book
                </button>
                <button
                  onClick={() => toggleWishlist(selectedBook.id)}
                  style={{
                    padding: '11px 22px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    color: isWishlisted ? '#ef4444' : '#0f172a',
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#0f172a'} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Tabs: Overview, Details, Reviews, Related Books */}
              <div style={{ marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
                  {['Overview', 'Details', 'Reviews', 'Related Books'].map(tab => {
                    const id = tab.toLowerCase().replace(' ', '_');
                    const isActive = detailTab === id;
                    return (
                      <button
                        key={tab}
                        onClick={() => setDetailTab(id)}
                        style={{
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#0f172a' : '#64748b',
                          borderBottom: isActive ? '2px solid #0f172a' : '2px solid transparent',
                          paddingBottom: 8,
                          cursor: 'pointer'
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div style={{ paddingTop: 14, fontSize: 13.5, color: '#475569', lineHeight: 1.65 }}>
                  {meta.desc}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN 7: MY WISHLIST VIEW (Panel 7 in Mockup)
     ═══════════════════════════════════════════════════════════ */
  if (initialTab === 'wishlist') {
    const wishlistItems = [
      {
        id: 'BK004',
        title: 'Design Patterns',
        author: 'Gamma et al.',
        date: '12 Aug 2025',
        available: true,
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'BK008',
        title: 'Artificial Intelligence',
        author: 'Stuart Russell',
        date: '5 Aug 2025',
        available: true,
        cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777b?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'BK009',
        title: 'Modern Web Development',
        author: 'Brad Traversy',
        date: '18 July 2025',
        available: false,
        cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'BK012',
        title: 'System Design',
        author: 'Alex Xu',
        date: '16 Jul 2025',
        available: true,
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80'
      }
    ];

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          My Wishlist
        </h1>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {wishlistItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 10,
                border: '1px solid #f1f5f9',
                background: '#ffffff',
                transition: 'all 120ms'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img
                  src={item.cover}
                  alt={item.title}
                  style={{ width: 44, height: 60, borderRadius: 4, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.author}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Added date {item.date}</div>
                </div>
              </div>

              <div>
                {item.available ? (
                  <button
                    onClick={() => { playClick(); playSuccessChime(); toast.success(`"${item.title}" borrowed successfully!`); }}
                    style={{
                      padding: '8px 22px',
                      borderRadius: 8,
                      background: '#111827',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer'
                    }}
                  >
                    Borrow
                  </button>
                ) : (
                  <button
                    onClick={() => { playClick(); toast.info(`We will notify you when "${item.title}" becomes available.`); }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#d97706',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer'
                    }}
                  >
                    Notify Me
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN 8: MY BORROWINGS & HISTORY VIEW (Panel 8 in Mockup)
     ═══════════════════════════════════════════════════════════ */
  if (initialTab === 'borrowings' || initialTab === 'history') {
    const tableItems = [
      { id: '1', title: 'Clean Code', issue: '01 Sep 2025', due: '15 Sep 2025', status: 'Due in 2 days', color: '#ef4444', bg: '#fef2f2' },
      { id: '2', title: 'OS Concepts', issue: '28 Aug 2025', due: '12 Sep 2025', status: 'Due in 5 days', color: '#f59e0b', bg: '#fffbeb' },
      { id: '3', title: 'DBMS Concepts', issue: '20 Aug 2025', due: '05 Sep 2025', status: 'Due in 12 days', color: '#64748b', bg: '#f8fafc' }
    ];

    const historyItems = [
      { id: '4', title: 'Computer Networks', issue: '10 Aug 2025', returned: '24 Aug 2025', status: 'Returned', color: '#10b981', bg: '#ecfdf5' },
      { id: '5', title: 'Introduction to Algorithms', issue: '15 Jul 2025', returned: '29 Jul 2025', status: 'Returned', color: '#10b981', bg: '#ecfdf5' }
    ];

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          My Borrowings
        </h1>

        {/* Tabs: Currently Borrowed / History */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setActiveSubTab('borrowed')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeSubTab === 'borrowed' ? 700 : 500,
              background: activeSubTab === 'borrowed' ? '#ffffff' : '#f1f5f9',
              color: activeSubTab === 'borrowed' ? '#0f172a' : '#64748b',
              border: activeSubTab === 'borrowed' ? '1px solid #e2e8f0' : 'none',
              boxShadow: activeSubTab === 'borrowed' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer'
            }}
          >
            Currently Borrowed
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeSubTab === 'history' ? 700 : 500,
              background: activeSubTab === 'history' ? '#ffffff' : '#f1f5f9',
              color: activeSubTab === 'history' ? '#0f172a' : '#64748b',
              border: activeSubTab === 'history' ? '1px solid #e2e8f0' : 'none',
              boxShadow: activeSubTab === 'history' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer'
            }}
          >
            History
          </button>
        </div>

        {/* Table (Panel 8) */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Book</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Issue Date</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                  {activeSubTab === 'borrowed' ? 'Due Date' : 'Return Date'}
                </th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeSubTab === 'borrowed' ? tableItems : historyItems).map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    {row.title}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>
                    {row.issue}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>
                    {row.due || row.returned}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: row.color,
                      background: row.bg,
                      padding: '4px 10px',
                      borderRadius: 6
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {activeSubTab === 'borrowed' ? (
                      <button
                        onClick={() => handleReturn(row.id, row.title)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Return
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN 4: BROWSE BOOKS VIEW (Panel 4 in Mockup)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Browse Library
          </h1>
          <div style={{ fontSize: 13.5, color: '#64748b' }}>
            Discover knowledge across all domains
          </div>
        </div>
        {user?.role === 'librarian' && (
          <button
            onClick={() => onNavigate?.('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Book
          </button>
        )}
      </div>

      {/* Filter Row (Panel 4) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12.5,
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">Category: All</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Programming">Programming</option>
            <option value="Database">Database</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Fiction">Fiction</option>
          </select>

          {/* Author Dropdown */}
          <select
            value={selectedAuthor}
            onChange={e => setSelectedAuthor(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12.5,
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">Author: All</option>
            <option value="Martin">Robert C. Martin</option>
            <option value="Silberschatz">Silberschatz</option>
            <option value="Tanenbaum">Tanenbaum</option>
            <option value="Russell">Stuart Russell</option>
          </select>

          {/* Availability Dropdown */}
          <select
            value={selectedAvailability}
            onChange={e => setSelectedAvailability(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12.5,
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">Availability: All</option>
            <option value="Available">Available Now</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12.5,
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Popular">Sort by: Popular</option>
            <option value="Newest">Sort by: Newest</option>
            <option value="Title">Sort by: Title A-Z</option>
          </select>
        </div>

        {/* Book Count Pill */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          248 Books Available
        </div>
      </div>

      {/* 4-Column Book Grid (Panel 4) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginTop: 4
      }}>
        {filteredBooks.slice(0, 8).map(book => {
          const isAvail = (book.available_copies ?? 2) > 0;
          return (
            <div
              key={book.id}
              className="card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 150ms, box-shadow 150ms'
              }}
            >
              <div 
                onClick={() => { playClick(); setSelectedBook(book); }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={book.cover_url || '/covers/clean_code.jpg'}
                  alt={book.title}
                  style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 6,
                    objectFit: 'cover',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                  }}
                  onError={e => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';
                  }}
                />
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: 12,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {book.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                  {book.author}
                </div>

                {/* Status Pill */}
                <div style={{ marginTop: 10 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isAvail ? '#059669' : '#d97706',
                    background: isAvail ? '#ecfdf5' : '#fffbeb',
                    padding: '3px 8px',
                    borderRadius: 4
                  }}>
                    {isAvail ? `• Available • ${book.available_copies ?? 2} copies` : '• Limited • 1 copy'}
                  </span>
                </div>
              </div>

              {/* Borrow Button */}
              <button
                onClick={() => handleBorrow(book)}
                style={{
                  marginTop: 14,
                  width: '100%',
                  padding: '7px 0',
                  borderRadius: 6,
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#111827'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                Borrow
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
