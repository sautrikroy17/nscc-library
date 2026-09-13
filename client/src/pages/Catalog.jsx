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
  Plus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Bookmark,
  MoreVertical,
  HelpCircle,
  Calendar,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Tag,
  UploadCloud
} from 'lucide-react';
import BackButton from '../components/BackButton';
import BookCover from '../components/BookCover';
import { localStore } from '../data/localStore';
import { INITIAL_BOOKS } from '../data/seedData';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playReturnChime } from '../utils/audio';

export default function Catalog({ 
  onNavigate = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  initialTab = 'all' // 'all' | 'borrowings' | 'wishlist'
}) {
  const { user } = useAuth();
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Category Pill Filter matching Screenshot 2
  const [categoryPill, setCategoryPill] = useState('All Books');

  // Sub-bar dropdown filters
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');

  // Right sidebar filters
  const [sideSearch, setSideSearch] = useState('');
  const [selectedSideCategories, setSelectedSideCategories] = useState([]);
  const [availabilityRadio, setAvailabilityRadio] = useState('All');
  const [pubYear, setPubYear] = useState(2025);
  const [selectedRatings, setSelectedRatings] = useState([]);

  // Librarian Portal specific state (Mockup Screen 2 & 3)
  const isLibrarian = user?.role === 'librarian';
  const [showAddModal, setShowAddModal] = useState(false);
  const [libCategory, setLibCategory] = useState('All');
  const [libAvailability, setLibAvailability] = useState('All');
  const [libSort, setLibSort] = useState('Title A-Z');
  const [libSearch, setLibSearch] = useState('');
  const [libPage, setLibPage] = useState(1);
  const [libPageSize, setLibPageSize] = useState(8);
  const [isbnFetching, setIsbnFetching] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Software Engineering',
    publisher: '',
    year: '2025',
    copies: 5,
    location: 'Central Library - R3, Shelf 02',
    description: '',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
  });

  // Wishlist state matching Screenshot 3 Bottom (5 items default)
  const [wishlist, setWishlist] = useState(['BK004', 'BK003', 'BK005', 'BK026', 'BK015']);

  // Borrowings state matching Screenshot 3 Top (3 items default)
  const [borrowedItems, setBorrowedItems] = useState([
    {
      id: 'b1',
      bookId: 'BK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      tags: ['Software Engineering', 'Best Practices'],
      issue: '01 Sep 2025',
      due: '15 Sep 2025',
      dueText: 'Due in 2 days',
      dueColor: '#ef4444',
      dueBg: '#fef2f2',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'b2',
      bookId: 'BK006',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      tags: ['Operating Systems', 'Systems Programming'],
      issue: '28 Aug 2025',
      due: '12 Sep 2025',
      dueText: 'Due in 5 days',
      dueColor: '#d97706',
      dueBg: '#fffbeb',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'b3',
      bookId: 'BK007',
      title: 'Database System Concepts',
      author: 'Silberschatz, Korth, Sudarshan',
      tags: ['Database', 'Data Management'],
      issue: '20 Aug 2025',
      due: '05 Sep 2025',
      dueText: 'Due in 12 days',
      dueColor: '#2563eb',
      dueBg: '#eff6ff',
      cover: 'https://images.unsplash.com/photo-1507842229452-710892015502?w=300&auto=format&fit=crop&q=80'
    }
  ]);

  const [borrowingsTab, setBorrowingsTab] = useState('current'); // 'current' | 'returned' | 'overdue'
  const [wishlistTab, setWishlistTab] = useState('all'); // 'all' | 'available' | 'unavailable'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    try {
      const stored = localStore.listBooks({ limit: 100 });
      if (stored?.books && stored.books.length > 0) {
        setBooksList(stored.books);
      } else {
        setBooksList(INITIAL_BOOKS);
      }
    } catch {
      setBooksList(INITIAL_BOOKS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort books
  const effectiveSearch = (sideSearch || searchQuery || '').trim().toLowerCase();

  const filteredBooks = booksList.filter(book => {
    // Search query match
    if (effectiveSearch) {
      const matches = 
        book.title.toLowerCase().includes(effectiveSearch) ||
        book.author.toLowerCase().includes(effectiveSearch) ||
        (book.isbn && book.isbn.toLowerCase().includes(effectiveSearch)) ||
        (book.category && book.category.toLowerCase().includes(effectiveSearch));
      if (!matches) return false;
    }

    // Category Pill match (Screenshot 2 pills)
    if (categoryPill !== 'All Books') {
      if (book.category !== categoryPill) return false;
    }

    // Sidebar Category Checklist match
    if (selectedSideCategories.length > 0) {
      if (!selectedSideCategories.includes(book.category)) return false;
    }

    // Author dropdown
    if (selectedAuthor !== 'All') {
      if (!book.author.toLowerCase().includes(selectedAuthor.toLowerCase())) return false;
    }

    // Availability Filter (from subbar or sidebar radio)
    const availRule = availabilityRadio !== 'All' ? availabilityRadio : selectedAvailability;
    const copies = book.available_copies ?? 2;
    if (availRule === 'Available' && copies <= 0) return false;
    if (availRule === 'Limited' && (copies <= 0 || copies > 2)) return false;
    if (availRule === 'Not Available' && copies > 0) return false;

    // Publication Year slider
    if (book.published_year && book.published_year > pubYear) return false;

    // Star Rating
    if (selectedRatings.length > 0) {
      const r = book.rating || 4.5;
      const passRating = selectedRatings.some(minR => r >= minR);
      if (!passRating) return false;
    }

    return true;
  }).sort((a, b) => {
    if (selectedSort === 'Title') return a.title.localeCompare(b.title);
    if (selectedSort === 'Newest') return (b.published_year || 2024) - (a.published_year || 2024);
    if (selectedSort === 'Rating') return (b.rating || 4.5) - (a.rating || 4.5);
    return (b.review_count || 1000) - (a.review_count || 1000); // Popular default
  });

  const totalFound = filteredBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalFound / pageSize));
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleBorrowBook = (book) => {
    playClick();
    playSuccessChime();

    // Decrement available copy
    setBooksList(prev => prev.map(b => b.id === book.id ? { ...b, available_copies: Math.max(0, (b.available_copies ?? 2) - 1) } : b));
    
    // Add to student borrowed books
    const newBorrow = {
      id: `b_${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      tags: book.tags || ['General', book.category || 'Reference'],
      issue: '13 Sep 2026',
      due: '27 Sep 2026',
      dueText: 'Due in 14 days',
      dueColor: '#059669',
      dueBg: '#ecfdf5',
      cover: book.cover_url
    };
    setBorrowedItems(prev => [newBorrow, ...prev]);

    // Create local transaction
    try {
      localStore.createTransaction({
        book_id: book.id,
        borrower_name: user?.name || 'Sautrik Roy',
        borrower_reg: user?.reg_number || 'RA2511003010052',
        borrower_dept: user?.department || 'CSE',
        loan_days: 14,
        type: 'borrow'
      });
    } catch {}

    toast.success(`"${book.title}" borrowed successfully! Return due in 14 days.`);
  };

  const handleReturnItem = (item) => {
    playClick();
    playReturnChime();

    setBorrowedItems(prev => prev.filter(b => b.id !== item.id));
    setBooksList(prev => prev.map(b => (b.id === item.bookId || b.title === item.title) ? { ...b, available_copies: (b.available_copies ?? 0) + 1 } : b));

    toast.success(`"${item.title}" returned to Central Library Stacks. Outstanding fines: ₹0`);
  };

  const handleRenewItem = (item) => {
    playClick();
    playSuccessChime();
    setBorrowedItems(prev => prev.map(b => b.id === item.id ? { ...b, dueText: 'Due in 28 days', dueColor: '#2563eb', dueBg: '#eff6ff' } : b));
    toast.success(`"${item.title}" renewed! New return deadline extended by 14 days.`);
  };

  const handleRenewAllEligible = () => {
    playClick();
    playSuccessChime();
    setBorrowedItems(prev => prev.map(b => ({ ...b, dueText: 'Due in 28 days', dueColor: '#2563eb', dueBg: '#eff6ff' })));
    toast.success('All eligible borrowed books renewed successfully! Next due date: 11 Oct 2026');
  };

  const toggleWishlist = (bookId) => {
    playClick();
    if (wishlist.includes(bookId)) {
      setWishlist(wishlist.filter(id => id !== bookId));
      toast.info('Removed from your Wishlist');
    } else {
      playSuccessChime();
      setWishlist([...wishlist, bookId]);
      toast.success('Added to your Wishlist!');
    }
  };

  const resetAllFilters = () => {
    playClick();
    setCategoryPill('All Books');
    setSelectedAuthor('All');
    setSelectedAvailability('All');
    setSelectedSort('Popular');
    setSideSearch('');
    onSearchChange('');
    setSelectedSideCategories([]);
    setAvailabilityRadio('All');
    setPubYear(2025);
    setSelectedRatings([]);
    setCurrentPage(1);
    toast.info('All filters reset.');
  };

  // ─────────────────────────────────────────────────────────────
  // LIBRARIAN ACTIONS (Fetch ISBN & Save Book)
  // ─────────────────────────────────────────────────────────────
  const handleFetchIsbn = async () => {
    const rawIsbn = newBook.isbn.trim().replace(/-/g, '');
    if (!rawIsbn) {
      toast.error('Please enter an ISBN number first');
      return;
    }
    setIsbnFetching(true);
    playClick();

    const ISBN_MAP = {
      '9780132350884': { title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', publisher: 'Prentice Hall', year: '2008' },
      '9780131103627': { title: 'The C Programming Language', author: 'Brian W. Kernighan, Dennis M. Ritchie', category: 'Computer Science', publisher: 'Prentice Hall', year: '1988' },
      '9780262046305': { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Algorithms', publisher: 'MIT Press', year: '2022' },
      '9780134685991': { title: 'Effective Java', author: 'Joshua Bloch', category: 'Software Engineering', publisher: 'Addison-Wesley', year: '2018' },
      '9781492051459': { title: 'Modern Web Development', author: 'Matt Ridley', category: 'Web Development', publisher: "O'Reilly Media", year: '2024' },
      '9780132143011': { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', category: 'Operating Systems', publisher: 'Wiley', year: '2018' },
      '9780201633610': { title: 'Design Patterns', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', category: 'Software Engineering', publisher: 'Addison-Wesley', year: '1994' },
      '9780078022159': { title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', category: 'Database Systems', publisher: 'McGraw-Hill', year: '2019' },
      '9780132126953': { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Networking', publisher: 'Pearson', year: '2021' },
      '9780262035613': { title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', category: 'AI/ML', publisher: 'MIT Press', year: '2016' }
    };

    if (ISBN_MAP[rawIsbn]) {
      const info = ISBN_MAP[rawIsbn];
      setNewBook(prev => ({
        ...prev,
        title: info.title,
        author: info.author,
        category: info.category,
        publisher: info.publisher,
        year: info.year
      }));
      playSuccessChime();
      toast.success(`Fetched book metadata for "${info.title}"!`);
      setIsbnFetching(false);
      return;
    }

    try {
      const res = await fetch(`https://openlibrary.org/isbn/${rawIsbn}.json`);
      if (res.ok) {
        const data = await res.json();
        setNewBook(prev => ({
          ...prev,
          title: data.title || prev.title,
          publisher: data.publishers?.[0] || prev.publisher,
          year: data.publish_date || prev.year
        }));
        playSuccessChime();
        toast.success(`Metadata fetched from OpenLibrary: "${data.title}"`);
      } else {
        setNewBook(prev => ({
          ...prev,
          title: prev.title || 'Advanced Engineering Systems',
          author: prev.author || 'Academic Faculty Press',
          publisher: prev.publisher || 'SRM IST Academic Press',
          year: '2025'
        }));
        toast.info('ISBN recorded. Default academic details populated.');
      }
    } catch {
      setNewBook(prev => ({
        ...prev,
        title: prev.title || 'Advanced Engineering Systems',
        author: prev.author || 'Academic Faculty Press',
        publisher: prev.publisher || 'SRM IST Academic Press',
        year: '2025'
      }));
      toast.info('ISBN verified. Academic catalog details populated.');
    } finally {
      setIsbnFetching(false);
    }
  };

  const handleSaveNewBook = (e) => {
    e.preventDefault();
    if (!newBook.title.trim()) {
      toast.error('Book title is required');
      return;
    }
    const createdBook = {
      id: `BK${Math.floor(100 + Math.random() * 900)}`,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn || '978-013' + Math.floor(1000000 + Math.random() * 9000000),
      category: newBook.category,
      tags: [newBook.category],
      total_copies: Number(newBook.copies) || 5,
      available_copies: Number(newBook.copies) || 5,
      shelf_location: newBook.location,
      description: newBook.description,
      cover_url: newBook.cover,
      published_year: Number(newBook.year) || 2025,
      rating: 4.8,
      review_count: 1
    };

    setBooksList(prev => [createdBook, ...prev]);
    try {
      localStore.createBook(createdBook);
    } catch {}

    playSuccessChime();
    toast.success(`Book "${createdBook.title}" added to library catalog!`);
    setShowAddModal(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: 'Software Engineering',
      publisher: '',
      year: '2025',
      copies: 5,
      location: 'Central Library - R3, Shelf 02',
      description: '',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
    });
  };

  /* ═══════════════════════════════════════════════════════════
     LIBRARIAN BOOKS MANAGEMENT VIEW (SCREEN 2 & 3)
     ═══════════════════════════════════════════════════════════ */
  if (isLibrarian && !selectedBook) {
    const filteredLibBooks = booksList.filter(b => {
      if (libSearch.trim()) {
        const q = libSearch.trim().toLowerCase();
        const match = b.title.toLowerCase().includes(q) ||
                      b.author.toLowerCase().includes(q) ||
                      (b.isbn && b.isbn.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (libCategory !== 'All') {
        const cat = (b.tags?.[0] || b.category || '').toLowerCase();
        if (!cat.includes(libCategory.toLowerCase())) return false;
      }
      if (libAvailability !== 'All') {
        const copies = b.available_copies ?? 2;
        if (libAvailability === 'Available' && copies <= 0) return false;
        if (libAvailability === 'Low Stock' && (copies <= 0 || copies > 2)) return false;
        if (libAvailability === 'Out of Stock' && copies > 0) return false;
      }
      return true;
    }).sort((a, b) => {
      if (libSort === 'Title A-Z') return a.title.localeCompare(b.title);
      if (libSort === 'Title Z-A') return b.title.localeCompare(a.title);
      if (libSort === 'Most Copies') return (b.available_copies ?? 0) - (a.available_copies ?? 0);
      return 0;
    });

    const paginatedLibBooks = filteredLibBooks.slice((libPage - 1) * libPageSize, libPage * libPageSize);

    return (
      <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header matching Mockup Screen 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackButton onClick={() => onNavigate('dashboard')} label="Dashboard" />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Books</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
                Manage, search and catalog all library books
              </p>
            </div>
          </div>

          <button
            onClick={() => { playClick(); setShowAddModal(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '8px 12px',
            flex: '1 1 300px',
            minWidth: 260
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={libSearch}
              onChange={e => { setLibSearch(e.target.value); setLibPage(1); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0f172a', width: '100%' }}
            />
            {libSearch && (
              <button onClick={() => setLibSearch('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            )}
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Category:</span>
            <select
              value={libCategory}
              onChange={e => { playClick(); setLibCategory(e.target.value); setLibPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Database Systems">Database Systems</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Networking">Networking</option>
              <option value="AI/ML">AI / ML</option>
              <option value="Web Development">Web Development</option>
            </select>
          </div>

          {/* Availability Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Availability:</span>
            <select
              value={libAvailability}
              onChange={e => { playClick(); setLibAvailability(e.target.value); setLibPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All</option>
              <option value="Available">Available (&gt;0)</option>
              <option value="Low Stock">Low Stock (1-2)</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Sort by:</span>
            <select
              value={libSort}
              onChange={e => { playClick(); setLibSort(e.target.value); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              <option value="Title A-Z">Title A-Z</option>
              <option value="Title Z-A">Title Z-A</option>
              <option value="Most Copies">Most Copies</option>
              <option value="Newest">Newest</option>
            </select>
          </div>
        </div>

        {/* 4-column Book Grid matching Screen 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 18
        }}>
          {paginatedLibBooks.map(book => {
            const avail = book.available_copies ?? 2;
            return (
              <div
                key={book.id}
                onClick={() => { playClick(); setSelectedBook(book); }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 150ms ease-out',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Book Cover */}
                <div style={{ width: '100%', height: 210, borderRadius: 8, overflow: 'hidden' }}>
                  <BookCover
                    bookId={book.id}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.cover_url}
                  />
                </div>

                {/* Title & Author */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={book.title}>
                    {book.title}
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={book.author}>
                    {book.author}
                  </p>
                </div>

                {/* Category Pill */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    {book.tags?.[0] || book.category || 'Computer Science'}
                  </span>
                </div>

                {/* Copies Available Pill */}
                <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: avail > 1 ? '#059669' : (avail === 1 ? '#d97706' : '#dc2626'),
                    background: avail > 1 ? '#ecfdf5' : (avail === 1 ? '#fffbeb' : '#fef2f2'),
                    padding: '3px 9px',
                    borderRadius: 999
                  }}>
                    {avail > 1 ? `${avail} copies available` : (avail === 1 ? '1 copy' : 'Out of stock')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination bar matching Screen 2 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginTop: 6
        }}>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            Showing {(libPage - 1) * libPageSize + 1}-{Math.min(libPage * libPageSize, filteredLibBooks.length)} of 248 books
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => { playClick(); setLibPage(p => Math.max(1, p - 1)); }}
              disabled={libPage === 1}
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: libPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
            >
              ‹
            </button>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => { playClick(); setLibPage(num); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: libPage === num ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  background: libPage === num ? '#0f172a' : '#ffffff',
                  color: libPage === num ? '#ffffff' : '#64748b',
                  fontSize: 12,
                  fontWeight: libPage === num ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {num}
              </button>
            ))}
            <span style={{ fontSize: 12, color: '#94a3b8' }}>...</span>
            <button
              onClick={() => { playClick(); setLibPage(31); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: libPage === 31 ? '1px solid #0f172a' : '1px solid #e2e8f0',
                background: libPage === 31 ? '#0f172a' : '#ffffff',
                color: libPage === 31 ? '#ffffff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              31
            </button>
            <button
              onClick={() => { playClick(); setLibPage(p => p + 1); }}
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
            >
              ›
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Books per page:</span>
            <select
              value={libPageSize}
              onChange={e => { setLibPageSize(Number(e.target.value)); setLibPage(1); }}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#0f172a', fontWeight: 600 }}
            >
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="24">24</option>
            </select>
          </div>
        </div>

        {/* Modal: Screen 3 (Add New Book) */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 900,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              padding: 32
            }}>
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Book</h2>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                    Enter book details to add to the library catalog
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', padding: 4 }}
                >
                  ✕
                </button>
              </div>

              {/* Form Grid matching Screen 3 */}
              <form onSubmit={handleSaveNewBook}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, alignItems: 'start' }}>
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Book Title *</label>
                      <input
                        required
                        placeholder="Enter book title"
                        value={newBook.title}
                        onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Author(s) *</label>
                      <input
                        required
                        placeholder="Enter author names"
                        value={newBook.author}
                        onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>ISBN *</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          required
                          placeholder="Enter ISBN number"
                          value={newBook.isbn}
                          onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={handleFetchIsbn}
                          disabled={isbnFetching}
                          style={{
                            padding: '10px 16px',
                            borderRadius: 8,
                            border: '1px solid #2563eb',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isbnFetching ? 'Fetching...' : 'Fetch Details'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Category *</label>
                      <select
                        value={newBook.category}
                        onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Operating Systems">Operating Systems</option>
                        <option value="Database Systems">Database Systems</option>
                        <option value="Algorithms">Algorithms</option>
                        <option value="Networking">Networking</option>
                        <option value="AI/ML">AI / ML</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mathematics">Mathematics</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Publisher</label>
                      <input
                        placeholder="Enter publisher"
                        value={newBook.publisher}
                        onChange={e => setNewBook({ ...newBook, publisher: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Publication Year</label>
                      <input
                        placeholder="Enter year"
                        value={newBook.year}
                        onChange={e => setNewBook({ ...newBook, year: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Upload dropzone matching Screen 3 */}
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Upload Book Cover</label>
                      <div
                        onClick={() => {
                          const sampleCovers = [
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=500&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80'
                          ];
                          const randomCover = sampleCovers[Math.floor(Math.random() * sampleCovers.length)];
                          setNewBook({ ...newBook, cover: randomCover });
                          toast.info('Sample book cover selected!');
                        }}
                        style={{
                          border: '2px dashed #cbd5e1',
                          borderRadius: 12,
                          padding: 24,
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: '#f8fafc',
                          transition: 'border-color 150ms'
                        }}
                      >
                        <UploadCloud size={32} color="#2563eb" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Upload Book Cover</div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>Drag & drop an image or click to browse</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Recommended: 400 × 600 px</div>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Total Copies *</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        value={newBook.copies}
                        onChange={e => setNewBook({ ...newBook, copies: Number(e.target.value) })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Book Location *</label>
                      <input
                        placeholder="e.g. Central Library - R3, Shelf 02"
                        value={newBook.location}
                        onChange={e => setNewBook({ ...newBook, location: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Description</label>
                      <textarea
                        rows="3"
                        placeholder="Enter a short description..."
                        value={newBook.description}
                        onChange={e => setNewBook({ ...newBook, description: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons matching Screen 3 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW 1: BOOK DETAILS VIEW
     ═══════════════════════════════════════════════════════════ */
  if (selectedBook) {
    const isWishlisted = wishlist.includes(selectedBook.id);
    const isAvail = (selectedBook.available_copies ?? 2) > 0;

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => setSelectedBook(null)} label="Back to Browse" />
        </div>

        {/* Detailed Book Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '36px 40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start' }}>
            {/* Cover Column */}
            <div>
              <div style={{ width: '100%', height: 360, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <BookCover
                  bookId={selectedBook.id}
                  title={selectedBook.title}
                  author={selectedBook.author}
                  coverUrl={selectedBook.cover_url}
                />
              </div>

              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {isAvail ? (
                  <button
                    onClick={() => handleBorrowBook(selectedBook)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: 8,
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    Borrow Book
                  </button>
                ) : (
                  <button
                    onClick={() => toast.info(`Reservation queued for "${selectedBook.title}". Notification alert active.`)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: 8,
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#d97706',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reserve Volume
                  </button>
                )}

                <button
                  onClick={() => toggleWishlist(selectedBook.id)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: isWishlisted ? '#e11d48' : '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Heart size={15} fill={isWishlisted ? '#e11d48' : 'none'} color={isWishlisted ? '#e11d48' : '#64748b'} />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>
            </div>

            {/* Metadata Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: 6 }}>
                  {selectedBook.category || 'Computer Science'}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Shelf: {selectedBook.shelf_location || 'Central Library - R3, Shelf B2'}
                </span>
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
                {selectedBook.title}
              </h1>
              <div style={{ fontSize: 15, color: '#475569', marginBottom: 16 }}>
                by <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedBook.author}</span>
              </div>

              {/* Rating & Availability Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                  <Star size={16} fill="#f59e0b" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{selectedBook.rating || '4.8'}</span>
                  <span style={{ fontSize: 12.5, color: '#64748b' }}>({selectedBook.review_count || '12.4K'} reviews)</span>
                </div>

                <div style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isAvail ? '#059669' : '#d97706',
                  background: isAvail ? '#ecfdf5' : '#fffbeb'
                }}>
                  {isAvail ? `• Available (${selectedBook.available_copies ?? 4} copies in stack)` : '• Checked out by students'}
                </div>
              </div>

              {/* Description & Syllabus */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Overview</h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.65, margin: '0 0 16px 0' }}>
                  {selectedBook.description || 'Essential academic textbook recommended by SRM IST department faculty. Covers fundamental concepts, real-world case studies, and practical applications.'}
                </p>

                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Curriculum Relevance</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  Recommended syllabus textbook for SRM Institute of Science and Technology engineering degree programs. Includes problem sets, laboratory exercises, and exam preparation material.
                </p>
              </div>

              {/* Specifications Table */}
              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>ISBN-13: </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook.isbn || '978-0132350884'}</span>
                </div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Published: </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook.published_year || 2022}</span>
                </div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Language: </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>English</span>
                </div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Total Volumes: </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBook.total_copies || 5} copies</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW 2: MY BORROWINGS VIEW (Screenshot 3 Top)
     ═══════════════════════════════════════════════════════════ */
  if (initialTab === 'borrowings') {
    return (
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Bar with BackButton & Header matching Screenshot 3 Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BackButton onClick={() => onNavigate('dashboard')} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                My Borrowings
              </h1>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Manage your borrowed books, track due dates, and renew if needed.
              </div>
            </div>
          </div>

          <button
            onClick={handleRenewAllEligible}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 8,
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 120ms'
            }}
          >
            <RotateCcw size={14} />
            <span>Renew All Eligible</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'current', label: `Currently Borrowed (${borrowedItems.length})` },
            { id: 'returned', label: 'Returned (12)' },
            { id: 'overdue', label: 'Overdue (0)' }
          ].map(tab => {
            const active = borrowingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playClick(); setBorrowingsTab(tab.id); }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  background: active ? '#0f172a' : '#ffffff',
                  color: active ? '#ffffff' : '#64748b',
                  border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Left Rows + Right Summary Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
          
          {/* Left Borrowings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {borrowedItems.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', color: '#64748b' }}>
                You have zero books currently checked out. Browse the catalog to borrow books!
              </div>
            ) : (
              borrowedItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '18px 22px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    {/* Cover */}
                    <div style={{ width: 50, height: 68, borderRadius: 6, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                      <BookCover bookId={item.bookId} title={item.title} author={item.author} coverUrl={item.cover} />
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{item.author}</div>
                      
                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {item.tags.map(t => (
                          <span key={t} style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 4 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Due Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ fontSize: 12, textAlign: 'left' }}>
                      <div style={{ color: '#64748b' }}>Issue Date</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{item.issue}</div>
                    </div>

                    <div style={{ fontSize: 12, textAlign: 'left' }}>
                      <div style={{ color: '#64748b' }}>Due Date</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{item.due}</div>
                    </div>

                    {/* Due Badge */}
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: item.dueColor,
                      background: item.dueBg,
                      whiteSpace: 'nowrap'
                    }}>
                      {item.dueText}
                    </span>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        onClick={() => handleReturnItem(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 6,
                          background: '#0f172a',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Return</span>
                      </button>

                      <button
                        onClick={() => handleRenewItem(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '5px 14px',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Renew</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toast.info(`Options for ${item.title}`)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar matching Screenshot 3 Top */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Borrowing Summary Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Borrowing Summary</div>
                <button
                  onClick={() => onNavigate('history')}
                  style={{ background: 'none', border: 'none', fontSize: 11.5, color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  View History →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                    <BookOpen size={16} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{borrowedItems.length}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Currently Borrowed</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>0</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Overdue</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                    <ShieldCheck size={16} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>10</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Total Borrowed</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed' }}>
                    <TrendingUp size={16} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>5</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>This Semester</div>
                </div>
              </div>
            </div>

            {/* Library Guidelines Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                <BookOpen size={16} />
                <span>Library Guidelines</span>
              </div>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#475569', lineHeight: 1.8 }}>
                <li>Standard loan period: 14 days</li>
                <li>You can renew a book up to 2 times</li>
                <li>Late returns may incur a fine</li>
                <li>Keep books in good condition</li>
              </ul>

              <button
                onClick={() => toast.info('Central Library Borrowing Policy: 5 books allowed per student card for 14 days.')}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '8px 0',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View All Policies
              </button>
            </div>

            {/* Need more time? Bulb Callout */}
            <div style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <Lightbulb size={18} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>Need more time?</div>
                <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2, lineHeight: 1.4 }}>
                  You can renew your books if no one else has reserved them.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW 3: MY WISHLIST VIEW (Screenshot 3 Bottom)
     ═══════════════════════════════════════════════════════════ */
  if (initialTab === 'wishlist') {
    const wishlistedBooks = booksList.filter(b => wishlist.includes(b.id));

    return (
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Bar with BackButton & Header matching Screenshot 3 Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BackButton onClick={() => onNavigate('dashboard')} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={22} fill="#ef4444" color="#ef4444" />
                <span>My Wishlist</span>
              </h1>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Your saved books for future reading. Keep track of what you're interested in.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 8,
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>Add Book</span>
          </button>
        </div>

        {/* Filter Tabs & Grid/List Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'all', label: `All (${wishlistedBooks.length})` },
              { id: 'available', label: `To Borrow (${wishlistedBooks.filter(b => (b.available_copies ?? 2) > 0).length})` },
              { id: 'unavailable', label: `Not Available (${wishlistedBooks.filter(b => (b.available_copies ?? 2) === 0).length})` }
            ].map(tab => {
              const active = wishlistTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playClick(); setWishlistTab(tab.id); }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    background: active ? '#0f172a' : '#ffffff',
                    color: active ? '#ffffff' : '#64748b',
                    border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', background: '#e2e8f0', padding: 2, borderRadius: 8 }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: 'none',
                  background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: 'none',
                  background: viewMode === 'list' ? '#ffffff' : 'transparent',
                  color: viewMode === 'list' ? '#0f172a' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <List size={15} />
              </button>
            </div>

            <span style={{ fontSize: 12.5, color: '#64748b' }}>Sort by: <strong>Recently Added ▾</strong></span>
          </div>
        </div>

        {/* Wishlist Main Grid (Left 75%) + Wishlist Stats & Recommendations (Right 25%) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
          
          {/* Book Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr',
            gap: 16
          }}>
            {wishlistedBooks.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', color: '#64748b' }}>
                Your wishlist is empty. Browse books and click the bookmark/heart icon to save them here!
              </div>
            ) : (
              wishlistedBooks.map(book => {
                const isAvail = (book.available_copies ?? 2) > 0;
                return (
                  <div
                    key={book.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Top Bookmark Badge */}
                    <button
                      onClick={() => toggleWishlist(book.id)}
                      title="Remove from Wishlist"
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 10,
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                      }}
                    >
                      <Bookmark size={14} fill="#ef4444" />
                    </button>

                    <div onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                      <div style={{ width: '100%', height: 170, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
                        <BookCover bookId={book.id} title={book.title} author={book.author} coverUrl={book.cover_url} />
                      </div>

                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.author}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', marginTop: 6, fontSize: 11.5 }}>
                        <Star size={12} fill="#f59e0b" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{book.rating || '4.5'}</span>
                        <span style={{ color: '#94a3b8' }}>({book.review_count || '5.1K'})</span>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isAvail ? '#059669' : '#d97706',
                          background: isAvail ? '#ecfdf5' : '#fffbeb',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          {isAvail ? `• Available • ${book.available_copies ?? 2} copies` : '• Not Available'}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      {isAvail ? (
                        <button
                          onClick={() => handleBorrowBook(book)}
                          style={{
                            width: '100%',
                            padding: '6px 0',
                            borderRadius: 6,
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Borrow
                        </button>
                      ) : (
                        <button
                          onClick={() => toast.info(`Reservation alert set for "${book.title}"`)}
                          style={{
                            width: '100%',
                            padding: '6px 0',
                            borderRadius: 6,
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            color: '#d97706',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Notify Me
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sidebar matching Screenshot 3 Bottom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Wishlist Stats Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                Wishlist Stats
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e11d48' }}>
                    <Heart size={16} fill="#e11d48" />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{wishlistedBooks.length}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Total Books</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {wishlistedBooks.filter(b => (b.available_copies ?? 2) > 0).length}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Available Now</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706' }}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {wishlistedBooks.filter(b => (b.available_copies ?? 2) === 0).length}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Notify Me</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                    <BookOpen size={16} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>CSE</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Top Category</div>
                </div>
              </div>
            </div>

            {/* Recommended For You Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Recommended For You</div>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{ background: 'none', border: 'none', fontSize: 11.5, color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  View All →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    id: 'BK008',
                    title: 'Clean Architecture',
                    author: 'R. C. Martin',
                    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80'
                  },
                  {
                    id: 'BK027',
                    title: 'Refactoring',
                    author: 'Martin Fowler',
                    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'
                  }
                ].map(rec => (
                  <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 46, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                        <BookCover bookId={rec.id} title={rec.title} author={rec.author} coverUrl={rec.cover} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{rec.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{rec.author}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleWishlist(rec.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW 4: BROWSE LIBRARY VIEW (Screenshot 2)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header with BackButton & Literary Banner matching Screenshot 2 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => onNavigate('dashboard')} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
              Browse Library
            </h1>
            <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 3 }}>
              Discover knowledge across all domains. Explore, learn, and grow.
            </div>
          </div>
        </div>

        {/* Top Right Stephen King Quote Banner with Book Stack Photo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <img
            src="/book_stack_quote.jpg"
            alt="Books Stack"
            style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#334155', fontStyle: 'italic' }}>
              "Books are a uniquely portable magic."
            </div>
            <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 2 }}>
              — Stephen King
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills matching Screenshot 2 ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          'All Books',
          'Computer Science',
          'Engineering',
          'Mathematics',
          'Science',
          'Management',
          'Humanities',
          'More ▾'
        ].map(cat => {
          const isMore = cat === 'More ▾';
          const active = categoryPill === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                playClick();
                if (!isMore) {
                  setCategoryPill(cat);
                  setCurrentPage(1);
                } else {
                  toast.info('Additional academic disciplines: Architecture, Law, Biotechnology, Medicine');
                }
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                background: active ? '#0f172a' : '#ffffff',
                color: active ? '#ffffff' : '#64748b',
                border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 120ms',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Sub-Filter Bar matching Screenshot 2 ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Author Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#64748b' }}>
            <span>Author:</span>
            <select
              value={selectedAuthor}
              onChange={e => { setSelectedAuthor(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All</option>
              <option value="Robert C. Martin">Robert C. Martin</option>
              <option value="Cormen">Cormen, Leiserson et al.</option>
              <option value="Silberschatz">Silberschatz et al.</option>
              <option value="Tanenbaum">Andrew S. Tanenbaum</option>
              <option value="Gamma">Gamma et al.</option>
              <option value="Alex Xu">Alex Xu</option>
              <option value="Goodfellow">Ian Goodfellow</option>
            </select>
          </div>

          {/* Availability Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#64748b' }}>
            <span>Availability:</span>
            <select
              value={selectedAvailability}
              onChange={e => { setSelectedAvailability(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All</option>
              <option value="Available">Available Now</option>
              <option value="Limited">Limited (1-2 copies)</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#64748b' }}>
            <span>Sort by:</span>
            <select
              value={selectedSort}
              onChange={e => setSelectedSort(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Popular">Popular</option>
              <option value="Rating">Highest Rated</option>
              <option value="Newest">Newest</option>
              <option value="Title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Right Book Count & View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
            {totalFound} books found
          </span>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: 2, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '5px 8px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '5px 8px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#0f172a' : '#64748b',
                cursor: 'pointer'
              }}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Catalog Layout: 4-Column Book Cards (Left 75%) + Filters Sidebar (Right 25%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 24, alignItems: 'start' }}>
        
        {/* Left Book Grid & Pagination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {paginatedBooks.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                No books match your selected filters
              </div>
              <p style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                Try adjusting the category, year slider, or resetting all filters.
              </p>
              <button
                onClick={resetAllFilters}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : '1fr',
              gap: 16
            }}>
              {paginatedBooks.map(book => {
                const copies = book.available_copies ?? 2;
                const isAvail = copies > 0;
                const isLimited = copies === 1;
                const isWishlisted = wishlist.includes(book.id);

                return (
                  <div
                    key={book.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      position: 'relative',
                      transition: 'transform 120ms, box-shadow 120ms'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }}
                  >
                    {/* 3 Dots Menu Button */}
                    <button
                      onClick={() => toast.info(`${book.title} (ISBN: ${book.isbn || 'N/A'}) - Shelf ${book.shelf_location || 'A-102'}`)}
                      style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      <MoreVertical size={13} />
                    </button>

                    {/* Book Cover Thumbnail with Spine */}
                    <div onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                      <div style={{ width: '100%', height: 180, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                        <BookCover
                          bookId={book.id}
                          title={book.title}
                          author={book.author}
                          coverUrl={book.cover_url}
                        />
                      </div>

                      {/* Title & Author */}
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.title}
                      </div>

                      <div style={{
                        fontSize: 12,
                        color: '#64748b',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.author}
                      </div>

                      {/* Star Rating & Review Count */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', marginTop: 6, fontSize: 12 }}>
                        <Star size={13} fill="#f59e0b" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{book.rating || '4.6'}</span>
                        <span style={{ color: '#94a3b8' }}>({book.review_count ? `${(book.review_count / 1000).toFixed(1)}K` : '4.2K'})</span>
                      </div>

                      {/* Status Badge */}
                      <div style={{ marginTop: 8 }}>
                        {isAvail ? (
                          isLimited ? (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: 4 }}>
                              • Limited · 1 copy
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                              • Available · {copies} copies
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: 4 }}>
                            • Not Available · 0 copies
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button & Bookmark Row matching Screenshot 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                      {isAvail ? (
                        isLimited ? (
                          <button
                            onClick={() => toast.info(`Reserved "${book.title}". Collect from Central Library Issue Desk.`)}
                            style={{
                              flex: 1,
                              padding: '7px 0',
                              borderRadius: 6,
                              background: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              color: '#0f172a',
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Reserve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBorrowBook(book)}
                            style={{
                              flex: 1,
                              padding: '7px 0',
                              borderRadius: 6,
                              background: '#0f172a',
                              color: '#ffffff',
                              fontSize: 12.5,
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Borrow
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => toast.info(`Alert registered for "${book.title}". We will notify you upon check-in.`)}
                          style={{
                            flex: 1,
                            padding: '7px 0',
                            borderRadius: 6,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Notify Me
                        </button>
                      )}

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleWishlist(book.id)}
                        title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: isWishlisted ? '#ef4444' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Bookmark size={14} fill={isWishlisted ? '#ef4444' : 'none'} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination Bar matching Screenshot 2 ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '16px 20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12
          }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing {Math.min(totalFound, (currentPage - 1) * pageSize + 1)}-{Math.min(totalFound, currentPage * pageSize)} of {totalFound} books
            </span>

            {/* Pagination Numbers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPage === 1 ? '#cbd5e1' : '#0f172a',
                  cursor: currentPage === 1 ? 'default' : 'pointer'
                }}
              >
                &lt;
              </button>

              {[1, 2, 3, 4, 5].map(num => {
                if (num > totalPages && num > 1) return null;
                const active = currentPage === num;
                return (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      background: active ? '#0f172a' : '#ffffff',
                      color: active ? '#ffffff' : '#334155',
                      fontWeight: active ? 700 : 500,
                      fontSize: 12.5,
                      cursor: 'pointer'
                    }}
                  >
                    {num}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span style={{ color: '#94a3b8', padding: '0 2px' }}>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: currentPage === totalPages ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      background: currentPage === totalPages ? '#0f172a' : '#ffffff',
                      color: currentPage === totalPages ? '#ffffff' : '#334155',
                      fontWeight: currentPage === totalPages ? 700 : 500,
                      fontSize: 12.5,
                      cursor: 'pointer'
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPage === totalPages ? '#cbd5e1' : '#0f172a',
                  cursor: currentPage === totalPages ? 'default' : 'pointer'
                }}
              >
                &gt;
              </button>
            </div>

            {/* Books per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
              <span>Books per page</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

        </div>

        {/* ── Right Filter Sidebar matching Screenshot 2 ── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Filters</div>
            <button
              onClick={resetAllFilters}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Reset All
            </button>
          </div>

          {/* Search Box */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Search</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f8fafc'
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search books..."
                value={sideSearch}
                onChange={e => { setSideSearch(e.target.value); setCurrentPage(1); }}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 12.5,
                  color: '#0f172a',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Category Checklist */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Computer Science', count: 96 },
                { name: 'Engineering', count: 48 },
                { name: 'Mathematics', count: 32 },
                { name: 'Science', count: 28 },
                { name: 'Management', count: 18 },
                { name: 'Humanities', count: 14 }
              ].map(cat => {
                const checked = selectedSideCategories.includes(cat.name);
                return (
                  <label key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 12.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedSideCategories(selectedSideCategories.filter(c => c !== cat.name));
                          } else {
                            setSelectedSideCategories([...selectedSideCategories, cat.name]);
                          }
                          setCurrentPage(1);
                        }}
                        style={{ width: 15, height: 15, accentColor: '#0f172a', cursor: 'pointer' }}
                      />
                      <span>{cat.name}</span>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>({cat.count})</span>
                  </label>
                );
              })}
            </div>
            <button
              onClick={() => toast.info('All 6 primary academic disciplines displayed.')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 8, padding: 0 }}
            >
              Show more ▾
            </button>
          </div>

          {/* Availability Radios */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Availability</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['All', 'Available', 'Limited', 'Not Available'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#334155' }}>
                  <input
                    type="radio"
                    name="availSide"
                    checked={availabilityRadio === opt}
                    onChange={() => { setAvailabilityRadio(opt); setCurrentPage(1); }}
                    style={{ width: 15, height: 15, accentColor: '#0f172a', cursor: 'pointer' }}
                  />
                  <span>{opt === 'Limited' ? 'Limited (1–2 copies)' : opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Publication Year Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              <span>Publication Year</span>
              <span style={{ color: '#0f172a' }}>≤ {pubYear}</span>
            </div>
            <input
              type="range"
              min={1950}
              max={2025}
              value={pubYear}
              onChange={e => { setPubYear(Number(e.target.value)); setCurrentPage(1); }}
              style={{ width: '100%', accentColor: '#0f172a', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              <span>1950</span>
              <span>2025</span>
            </div>
          </div>

          {/* Rating Checkboxes */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Rating</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { r: 4, label: '★★★★☆ 4+' },
                { r: 3, label: '★★★☆☆ 3+' },
                { r: 2, label: '★★☆☆☆ 2+' },
                { r: 1, label: '★☆☆☆☆ 1+' }
              ].map(rate => {
                const checked = selectedRatings.includes(rate.r);
                return (
                  <label key={rate.r} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#f59e0b' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedRatings(selectedRatings.filter(x => x !== rate.r));
                        } else {
                          setSelectedRatings([...selectedRatings, rate.r]);
                        }
                        setCurrentPage(1);
                      }}
                      style={{ width: 15, height: 15, accentColor: '#0f172a', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#334155' }}>{rate.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
