import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { localStore } from '../data/localStore';
import { INITIAL_BOOKS, INITIAL_USERS } from '../data/seedData';
import { transactions as txApi, books as booksApi } from '../api';
import { toast } from './ToastContext';
import { playSuccessChime, playReturnChime, playClick } from '../utils/audio';

const LibraryContext = createContext(null);

const STORAGE_KEYS = {
  BORROWED: 'librax_borrowed_books_v5',
  WISHLIST: 'librax_wishlist_v5',
  PREFS: 'librax_preferences_v5',
  STUDENTS: 'librax_students_v5',
  HISTORY: 'librax_history_v5'
};

const DEFAULT_BORROWED = [
  {
    id: 'b_init_1',
    bookId: 'BK002',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    tags: ['Software Engineering', 'Best Practices'],
    issue: '01 Sep 2026',
    due: '15 Sep 2026',
    dueText: 'Due in 2 days',
    dueColor: '#ef4444',
    dueBg: '#fef2f2',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    borrowerName: 'Sautrik Roy',
    borrowerReg: 'RA2511003010052'
  },
  {
    id: 'b_init_2',
    bookId: 'BK006',
    title: 'Operating System Concepts',
    author: 'Silberschatz, Galvin, Gagne',
    tags: ['Operating Systems', 'Systems Programming'],
    issue: '28 Aug 2026',
    due: '12 Sep 2026',
    dueText: 'Due in 5 days',
    dueColor: '#f59e0b',
    dueBg: '#fffbeb',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    borrowerName: 'Sautrik Roy',
    borrowerReg: 'RA2511003010052'
  },
  {
    id: 'b_init_3',
    bookId: 'BK007',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth, Sudarshan',
    tags: ['Database', 'Data Management'],
    issue: '20 Aug 2026',
    due: '05 Sep 2026',
    dueText: 'Due in 12 days',
    dueColor: '#64748b',
    dueBg: '#f8fafc',
    cover: 'https://images.unsplash.com/photo-1507842229452-710892015502?w=400&auto=format&fit=crop&q=80',
    borrowerName: 'Sautrik Roy',
    borrowerReg: 'RA2511003010052'
  }
];

const DEFAULT_STUDENTS = [
  { id: 'st1', num: 1, name: 'Sautrik Roy', reg: 'RA2511003010052', dept: 'CSE', year: '2', borrowed: 3, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
  { id: 'st2', num: 2, name: 'Ananya Sharma', reg: 'RA2511003010222', dept: 'CSE', year: '3', borrowed: 1, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'st3', num: 3, name: 'Vikram Kumar', reg: 'RA2511003010333', dept: 'ECE', year: '2', borrowed: 0, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'st4', num: 4, name: 'Sneha Iyer', reg: 'RA2511003010901', dept: 'IT', year: '3', borrowed: 2, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  { id: 'st5', num: 5, name: 'Karthik Nair', reg: 'RA2511003010789', dept: 'ME', year: '2', borrowed: 1, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'st6', num: 6, name: 'Isha Gupta', reg: 'RA2511003010444', dept: 'CSE', year: '3', borrowed: 4, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'st7', num: 7, name: 'Aditya Rao', reg: 'RA2511003010555', dept: 'EEE', year: '2', borrowed: 0, maxLimit: 7, status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' }
];

export function LibraryProvider({ children }) {
  // ── 1. Books State ──
  const [books, setBooks] = useState(() => {
    try {
      const res = localStore.listBooks({ limit: 100 });
      return Array.isArray(res) ? res : (res.books || INITIAL_BOOKS);
    } catch {
      return INITIAL_BOOKS;
    }
  });

  // ── 2. Borrowed Books State ──
  const [borrowedBooks, setBorrowedBooks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BORROWED);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_BORROWED;
  });

  // ── 3. Wishlist State ──
  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (raw) return JSON.parse(raw);
    } catch {}
    return ['BK004', 'BK003', 'BK005', 'BK026', 'BK015'];
  });

  // ── 4. Students State ──
  const [students, setStudents] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_STUDENTS;
  });

  // ── 5. History / Returned Transactions ──
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { id: 'h1', bookId: 'BK014', title: 'System Design Interview', author: 'Alex Xu', returnDate: '08 Sep 2026', rating: 5, fine: 0 },
      { id: 'h2', bookId: 'BK010', title: 'Cracking the Coding Interview', author: 'Gayle Laakmann', returnDate: '24 Aug 2026', rating: 5, fine: 0 },
      { id: 'h3', bookId: 'BK003', title: 'The Pragmatic Programmer', author: 'David Thomas', returnDate: '10 Aug 2026', rating: 4, fine: 0 }
    ];
  });

  // ── 6. Theme & Preferences State ──
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem('librax_theme');
      if (stored === 'dark' || stored === 'light') return stored;
      const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.theme === 'dark' || parsed.theme === 'light') return parsed.theme;
      }
    } catch {}
    return 'light';
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      borrowPeriod: '14 days (Standard)',
      categories: ['Computer Science', 'Software Engineering', 'AI & ML'],
      language: 'English',
      theme: 'light'
    };
  });

  // Apply theme dynamically to <html> and <body>
  useEffect(() => {
    try {
      localStorage.setItem('librax_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
      }
    } catch {}
  }, [theme]);

  // Toggle Theme helper
  const toggleTheme = useCallback(() => {
    playClick();
    setThemeState(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      setPreferences(p => ({ ...p, theme: nextTheme }));
      toast.info(`Switched to ${nextTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}`);
      return nextTheme;
    });
  }, []);

  // Set Theme explicitly
  const setTheme = useCallback((newTheme) => {
    playClick();
    setThemeState(newTheme);
    setPreferences(p => ({ ...p, theme: newTheme }));
    toast.info(`Theme set to ${newTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}`);
  }, []);

  // ── 7. Recent Scans Log ──
  const [recentScans, setRecentScans] = useState([
    { id: 'SCN-109', time: 'Just now', type: 'Issue', student: 'Sautrik Roy', reg: 'RA2511003010052', book: 'Clean Code', status: 'Completed' },
    { id: 'SCN-108', time: '18 mins ago', type: 'Return', student: 'Vikram Kumar', reg: 'RA2511003010333', book: 'Operating System Concepts', status: 'Completed' },
    { id: 'SCN-107', time: '42 mins ago', type: 'Issue', student: 'Ananya Sharma', reg: 'RA2511003010222', book: 'Design Patterns', status: 'Completed' }
  ]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BORROWED, JSON.stringify(borrowedBooks));
      // Update Sautrik Roy's borrowed count in students list
      setStudents(prev => prev.map(s => 
        s.reg === 'RA2511003010052' || s.name === 'Sautrik Roy'
          ? { ...s, borrowed: borrowedBooks.length }
          : s
      ));
    } catch {}
  }, [borrowedBooks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(preferences));
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    } catch {}
  }, [preferences]);

  // ── Actions ──

  /**
   * Borrow a book into Sautrik Roy's active loans
   */
  const borrowBook = useCallback((book, days = 14, studentInfo = null) => {
    playSuccessChime();

    // 1. Check if already borrowed
    const existing = borrowedBooks.find(b => b.bookId === book.id || b.title === book.title);
    if (existing) {
      toast.info(`You already have "${book.title}" checked out!`);
      return false;
    }

    // 2. Check if copies are available in stacks
    if (book.available_copies !== undefined && Number(book.available_copies) <= 0) {
      toast.error(`"${book.title}" is currently out of stock (0 available). All copies are checked out.`);
      return false;
    }

    // 3. Check borrowing quota (Maximum 7 books allowed at a time)
    if (borrowedBooks.length >= 7) {
      toast.error('Borrowing limit reached: Students can borrow a maximum of 7 books at a time. Please return an existing volume first.');
      return false;
    }

    const borrowerName = studentInfo?.name || 'Sautrik Roy';
    const borrowerReg = studentInfo?.reg || 'RA2511003010052';

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + days);

    const issueStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dueStr = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Ensure reliable cover URL
    let safeCover = book.cover_url || book.cover;
    if (!safeCover || safeCover.includes('photo-1532012164546')) {
      safeCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
    }

    const newLoan = {
      id: `loan_${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      tags: book.tags || [book.category || 'Computer Science', 'Institutional'],
      issue: issueStr,
      due: dueStr,
      dueText: `Due in ${days} days`,
      dueColor: '#059669',
      dueBg: '#ecfdf5',
      cover: safeCover,
      borrowerName,
      borrowerReg
    };

    // Update borrowedBooks state
    setBorrowedBooks(prev => [newLoan, ...prev]);

    // Decrement available copy in books state & localStore
    setBooks(prev => prev.map(b => 
      b.id === book.id ? { ...b, available_copies: Math.max(0, (b.available_copies ?? 1) - 1) } : b
    ));

    try {
      localStore.updateBook(book.id, {
        available_copies: Math.max(0, (book.available_copies ?? 1) - 1)
      });
      localStore.issueBook({
        book_id: book.id,
        borrower_name: borrowerName,
        borrower_reg: borrowerReg,
        days
      });
    } catch {}

    // Add to recent scans
    setRecentScans(prev => [
      {
        id: `SCN-${Math.floor(100 + Math.random() * 900)}`,
        time: 'Just now',
        type: 'Issue',
        student: borrowerName,
        reg: borrowerReg,
        book: book.title,
        status: 'Completed'
      },
      ...prev.slice(0, 7)
    ]);

    toast.success(`"${book.title}" borrowed successfully! Due on ${dueStr}.`);
    return true;
  }, [borrowedBooks]);

  /**
   * Return a book to the library stacks
   */
  const returnBook = useCallback((bookOrItem) => {
    playReturnChime();

    const bookId = bookOrItem.bookId || bookOrItem.id;
    const title = bookOrItem.title || 'Book';

    // Remove from borrowedBooks
    setBorrowedBooks(prev => prev.filter(b => b.bookId !== bookId && b.id !== bookOrItem.id));

    // Increment available copy in books state & localStore
    setBooks(prev => prev.map(b => 
      (b.id === bookId || b.title === title) ? { ...b, available_copies: (b.available_copies ?? 0) + 1 } : b
    ));

    try {
      const matchBook = books.find(b => b.id === bookId || b.title === title);
      if (matchBook) {
        const nextCopies = Math.min(matchBook.total_copies || 10, (matchBook.available_copies ?? 0) + 1);
        localStore.updateBook(matchBook.id, {
          available_copies: nextCopies
        });
        localStore.returnBook({
          book_id: matchBook.id,
          borrower_reg: bookOrItem.borrowerReg || 'RA2511003010052'
        });
      }
    } catch {}

    // Add to History
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setHistory(prev => [
      {
        id: `h_${Date.now()}`,
        bookId: bookId || 'BK001',
        title,
        author: bookOrItem.author || 'Author',
        returnDate: nowStr,
        rating: 5,
        fine: 0
      },
      ...prev
    ]);

    // Add to recent scans
    setRecentScans(prev => [
      {
        id: `SCN-${Math.floor(100 + Math.random() * 900)}`,
        time: 'Just now',
        type: 'Return',
        student: bookOrItem.borrowerName || 'Sautrik Roy',
        reg: bookOrItem.borrowerReg || 'RA2511003010052',
        book: title,
        status: 'Completed'
      },
      ...prev.slice(0, 7)
    ]);

    toast.success(`"${title}" returned to Central Library Stacks. Outstanding fines: ₹0`);
    return true;
  }, [books]);

  /**
   * Renew a borrowed book
   */
  const renewBook = useCallback((bookId) => {
    playSuccessChime();
    setBorrowedBooks(prev => prev.map(b => {
      if (b.bookId === bookId || b.id === bookId) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        const dueStr = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return {
          ...b,
          due: dueStr,
          dueText: 'Renewed (+14 days)',
          dueColor: '#2563eb',
          dueBg: '#eff6ff'
        };
      }
      return b;
    }));
    toast.success('Book renewed for an additional 14 days!');
  }, []);

  /**
   * Toggle Wishlist
   */
  const toggleWishlist = useCallback((bookId) => {
    playClick();
    setWishlist(prev => {
      const exists = prev.includes(bookId);
      if (exists) {
        toast.info('Removed book from Wishlist');
        return prev.filter(id => id !== bookId);
      } else {
        toast.success('Added book to your Wishlist! ✨');
        return [...prev, bookId];
      }
    });
  }, []);

  /**
   * Update Preferences
   */
  const updatePreferences = useCallback((newPrefs) => {
    playSuccessChime();
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    toast.success('Library preferences updated successfully!');
  }, []);

  /**
   * Add Book to Catalog
   */
  const addBook = useCallback((newBookData) => {
    playSuccessChime();
    const newBook = {
      id: newBookData.id || `BK${Math.floor(100 + Math.random() * 900)}`,
      title: newBookData.title,
      author: newBookData.author,
      isbn: newBookData.isbn || `978-0${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: newBookData.category || 'Computer Science',
      total_copies: parseInt(newBookData.total_copies, 10) || 5,
      available_copies: parseInt(newBookData.total_copies, 10) || 5,
      shelf_location: newBookData.shelf_location || 'Stack A-12',
      description: newBookData.description || 'SRM IST Library cataloged title.',
      cover_url: newBookData.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      published_year: new Date().getFullYear(),
      rating: 4.8,
      review_count: 1
    };

    setBooks(prev => [newBook, ...prev]);
    try {
      localStore.createBook(newBook);
    } catch {}

    toast.success(`Book "${newBook.title}" added to catalog stacks!`);
    return newBook;
  }, []);

  return (
    <LibraryContext.Provider value={{
      books,
      borrowedBooks,
      wishlist,
      students,
      history,
      preferences,
      recentScans,
      theme,
      toggleTheme,
      setTheme,
      borrowBook,
      returnBook,
      renewBook,
      toggleWishlist,
      updatePreferences,
      addBook,
      setStudents
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
