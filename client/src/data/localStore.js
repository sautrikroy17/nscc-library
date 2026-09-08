import { INITIAL_USERS, INITIAL_BOOKS, INITIAL_TRANSACTIONS } from './seedData';

const STORAGE_KEYS = {
  BOOKS: 'librax_books_v2',
  TRANSACTIONS: 'librax_transactions_v2',
  USERS: 'librax_users_v2',
  ACTIVE_USER: 'librax_cached_user'
};

// Initialize localStorage if not present
function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
}

// Helper to get array from localStorage
function getItems(key, fallback) {
  initStore();
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItems(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export const localStore = {
  // ── Auth ──
  login(email, password) {
    const users = getItems(STORAGE_KEYS.USERS, INITIAL_USERS);
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Check known user
    let matched = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      // Auto-provision role based on email pattern
      const isLibrarian = cleanEmail.includes('librarian') || cleanEmail.includes('admin');
      const isAdmin = cleanEmail.includes('admin');
      matched = {
        id: isLibrarian ? (isAdmin ? 'LIB002' : 'LIB001') : 'STU_' + Date.now().toString(36),
        name: isAdmin ? 'Admin Librarian' : (isLibrarian ? 'Dr. Rajesh Kumar' : cleanEmail.split('@')[0].replace('.', ' ').toUpperCase()),
        email: cleanEmail,
        reg_number: isLibrarian ? (isAdmin ? 'LIB002' : 'LIB001') : 'RA2311' + Math.floor(1000000 + Math.random() * 9000000),
        department: isLibrarian ? 'Library Administration' : 'CSE',
        role: isLibrarian ? 'librarian' : 'student'
      };
      users.push(matched);
      setItems(STORAGE_KEYS.USERS, users);
    }
    
    const token = 'librax_token_' + Date.now();
    localStorage.setItem('nscc_token', token);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(matched));
    return { token, user: matched };
  },

  register(data) {
    const users = getItems(STORAGE_KEYS.USERS, INITIAL_USERS);
    const newUser = {
      id: 'STU_' + Date.now().toString(36),
      name: data.name,
      email: data.email.toLowerCase(),
      reg_number: data.reg_number.toUpperCase(),
      department: data.department || 'CSE',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    users.push(newUser);
    setItems(STORAGE_KEYS.USERS, users);

    const token = 'librax_token_' + Date.now();
    localStorage.setItem('nscc_token', token);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newUser));
    return { token, user: newUser };
  },

  me() {
    initStore();
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (cached) return { user: JSON.parse(cached) };
    } catch {}
    return { user: INITIAL_USERS[2] }; // Default Sautrik Roy
  },

  // ── Books ──
  listBooks(params = {}) {
    let list = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const { category, search, available, sort } = params;

    if (category && category !== 'All') {
      list = list.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }
    if (available === 'true' || available === true) {
      list = list.filter(b => b.available_copies > 0);
    }

    if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'year') {
      list.sort((a, b) => (b.published_year || 0) - (a.published_year || 0));
    }

    return {
      books: list,
      total: list.length,
      page: 1,
      limit: 50,
      totalPages: 1
    };
  },

  getBook(id) {
    const list = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const book = list.find(b => b.id.toLowerCase() === (id || '').toLowerCase());
    if (!book) throw new Error('Book not found');
    return { book };
  },

  createBook(data) {
    const list = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const nextNum = list.length + 1;
    const newId = 'BK' + String(nextNum).padStart(3, '0');
    const newBook = {
      id: newId,
      title: data.title,
      author: data.author,
      isbn: data.isbn || `978-0${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: data.category || 'Computer Science',
      total_copies: parseInt(data.total_copies, 10) || 1,
      available_copies: parseInt(data.total_copies, 10) || 1,
      shelf_location: data.shelf_location || 'A-100',
      description: data.description || 'SRM IST Library collection title.',
      cover_color: data.cover_color || '#10b981',
      published_year: parseInt(data.published_year, 10) || new Date().getFullYear(),
      created_at: new Date().toISOString()
    };
    list.unshift(newBook);
    setItems(STORAGE_KEYS.BOOKS, list);
    return { book: newBook };
  },

  updateBook(id, data) {
    const list = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const idx = list.findIndex(b => b.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error('Book not found');
    list[idx] = { ...list[idx], ...data, updated_at: new Date().toISOString() };
    setItems(STORAGE_KEYS.BOOKS, list);
    return { book: list[idx] };
  },

  deleteBook(id) {
    let list = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    list = list.filter(b => b.id.toLowerCase() !== id.toLowerCase());
    setItems(STORAGE_KEYS.BOOKS, list);
    return { success: true };
  },

  getCategories() {
    const list = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const map = {};
    for (const b of list) {
      map[b.category] = (map[b.category] || 0) + 1;
    }
    const categories = Object.entries(map).map(([category, count]) => ({ category, count }));
    return { categories };
  },

  // ── Transactions ──
  listTransactions(params = {}) {
    let list = getItems(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const { status, search, borrower_reg, book_id } = params;

    if (status && status !== 'all') {
      list = list.filter(t => t.status === status);
    }
    if (borrower_reg) {
      list = list.filter(t => t.borrower_reg.toUpperCase() === borrower_reg.toUpperCase());
    }
    if (book_id) {
      list = list.filter(t => t.book_id.toLowerCase() === book_id.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => 
        (t.book_title && t.book_title.toLowerCase().includes(q)) ||
        (t.borrower_name && t.borrower_name.toLowerCase().includes(q)) ||
        (t.borrower_reg && t.borrower_reg.toLowerCase().includes(q)) ||
        (t.book_id && t.book_id.toLowerCase().includes(q))
      );
    }

    return { transactions: list, total: list.length };
  },

  issueBook(data) {
    const books = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const txns = getItems(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);

    const book = books.find(b => b.id.toLowerCase() === data.book_id.toLowerCase());
    if (!book) throw new Error('Book not found');
    if (book.available_copies <= 0) throw new Error('No copies available for borrowing');

    book.available_copies -= 1;
    setItems(STORAGE_KEYS.BOOKS, books);

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + (data.days || 14));

    const newTxn = {
      id: 'TXN-' + String(txns.length + 1).padStart(3, '0'),
      book_id: book.id,
      book_title: book.title,
      book_author: book.author,
      borrower_id: data.borrower_id || 'STU_' + Date.now().toString(36),
      borrower_name: data.borrower_name || 'Student Borrower',
      borrower_reg: (data.borrower_reg || 'RA2311003030002').toUpperCase(),
      borrower_dept: data.borrower_dept || 'CSE',
      issued_by: 'LIB001',
      issue_date: now.toISOString(),
      due_date: dueDate.toISOString(),
      return_date: null,
      status: 'issued',
      fine_amount: 0,
      fine_collected: 0
    };

    txns.unshift(newTxn);
    setItems(STORAGE_KEYS.TRANSACTIONS, txns);

    return { transaction: newTxn, message: `Successfully issued "${book.title}"` };
  },

  returnBook(data) {
    const books = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const txns = getItems(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);

    // Find transaction
    let txn = null;
    if (data.transaction_id) {
      txn = txns.find(t => t.id === data.transaction_id);
    } else if (data.book_id && data.borrower_reg) {
      txn = txns.find(t => 
        t.book_id.toLowerCase() === data.book_id.toLowerCase() && 
        t.borrower_reg.toUpperCase() === data.borrower_reg.toUpperCase() &&
        t.status !== 'returned'
      );
    } else if (data.book_id) {
      txn = txns.find(t => t.book_id.toLowerCase() === data.book_id.toLowerCase() && t.status !== 'returned');
    }

    if (!txn) throw new Error('Active borrowing transaction not found for this book');

    const now = new Date();
    const due = new Date(txn.due_date);
    let fine = 0;
    if (now > due) {
      const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      fine = diffDays * 2; // Rs. 2/day
    }

    txn.return_date = now.toISOString();
    txn.status = 'returned';
    txn.fine_amount = fine;
    txn.fine_collected = fine > 0 ? 1 : 0;
    setItems(STORAGE_KEYS.TRANSACTIONS, txns);

    // Increment book copies
    const book = books.find(b => b.id.toLowerCase() === txn.book_id.toLowerCase());
    if (book && book.available_copies < book.total_copies) {
      book.available_copies += 1;
      setItems(STORAGE_KEYS.BOOKS, books);
    }

    return { 
      transaction: txn, 
      fine_amount: fine, 
      message: `Successfully returned "${txn.book_title || txn.book_id}"${fine > 0 ? ` (Overdue fine collected: ₹${fine})` : ''}` 
    };
  },

  scanBook(book_id) {
    const books = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const txns = getItems(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const cleanId = (book_id || '').trim().toUpperCase();

    const book = books.find(b => b.id.toUpperCase() === cleanId || (b.isbn && b.isbn.replace(/-/g, '') === cleanId.replace(/-/g, '')));
    if (!book) throw new Error(`Book identifier "${book_id}" not found in NSCC Library registry`);

    const recent = txns.filter(t => t.book_id.toUpperCase() === book.id.toUpperCase()).slice(0, 5);
    const active = txns.find(t => t.book_id.toUpperCase() === book.id.toUpperCase() && t.status !== 'returned');

    return {
      book,
      recent_transactions: recent,
      active_transaction: active || null,
      can_issue: book.available_copies > 0,
      can_return: !!active
    };
  },

  // ── Stats ──
  getStats() {
    const books = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const txns = getItems(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const users = getItems(STORAGE_KEYS.USERS, INITIAL_USERS);

    const totalBooks = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (b.total_copies || 1), 0);
    const availableCopies = books.reduce((acc, b) => acc + (b.available_copies || 0), 0);
    const activeLoans = txns.filter(t => t.status === 'issued' || t.status === 'overdue').length;
    const overdueCount = txns.filter(t => t.status === 'overdue').length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalFines = txns.reduce((acc, t) => acc + (t.fine_amount || 0), 0);

    // 14-day circulation timeline
    const timeline = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const issues = txns.filter(t => t.issue_date && t.issue_date.startsWith(dateStr)).length || Math.floor((Math.sin(i * 0.9) + 1.2) * 3);
      const returns = txns.filter(t => t.return_date && t.return_date.startsWith(dateStr)).length || Math.floor((Math.cos(i * 0.7) + 1.1) * 2.5);
      timeline.push({ date: dateStr, issues, returns });
    }

    // Category breakdown
    const catMap = {};
    for (const b of books) {
      catMap[b.category] = (catMap[b.category] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    // Department breakdown
    const deptBreakdown = [
      { name: 'CSE', count: 18 },
      { name: 'ECE', count: 7 },
      { name: 'IT', count: 5 },
      { name: 'AI & DS', count: 4 }
    ];

    const overdueBooks = txns.filter(t => t.status === 'overdue').map(t => {
      const b = books.find(item => item.id === t.book_id) || {};
      const days = Math.max(1, Math.floor((new Date() - new Date(t.due_date)) / (1000 * 60 * 60 * 24)));
      return {
        ...t,
        title: t.book_title || b.title || 'Algorithms Reference',
        author: t.book_author || b.author || 'SRM Faculty',
        isbn: b.isbn || '978-0132350884',
        overdue_days: days,
        fine: days * 5
      };
    });

    const dailyActivity = timeline.map(t => {
      const d = new Date(t.date);
      return {
        date: t.date,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        issued: t.issues,
        returned: t.returns,
        net: t.issues - t.returns
      };
    });

    return {
      overview: {
        total_books: totalBooks,
        total_copies: totalCopies,
        available_copies: availableCopies,
        active_loans: activeLoans,
        issued_count: activeLoans,
        overdue_count: overdueCount,
        total_students: totalStudents,
        total_fines_uncollected: 85,
        total_fines_collected: totalFines,
        fines_total: totalFines + 85,
        total_transactions: txns.length,
        returned_count: txns.filter(t => t.status === 'returned').length,
        books_due_today: 1
      },
      popular_books: books.slice(0, 5).map(b => ({
        ...b,
        borrow_count: Math.floor(15 + Math.random() * 20)
      })),
      circulation_timeline: timeline,
      daily_activity: dailyActivity,
      category_breakdown: categoryBreakdown,
      category_stats: categoryBreakdown.map(c => ({ category: c.name, count: c.count, copies: c.count * 3, available: c.count * 2 })),
      department_breakdown: deptBreakdown,
      overdue_books: overdueBooks
    };
  },

  // ── AI ──
  aiChat(message, history = []) {
    const books = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const q = (message || '').toLowerCase();

    // Contextual responses based on library data
    if (q.includes('recommend') || q.includes('suggest') || q.includes('what should i read')) {
      const recs = books.slice(0, 3);
      return {
        reply: `Here are 3 highly rated recommendations from the SRM IST collection:\n\n` +
          recs.map(b => `📚 **${b.title}** by *${b.author}* (${b.category})\n📍 Shelf: ${b.shelf_location} | Status: ${b.available_copies > 0 ? '✅ Available (' + b.available_copies + ')' : '❌ Borrowed'}`).join('\n\n') +
          `\n\nWould you like me to reserve any of these for you?`
      };
    }

    if (q.includes('return') || q.includes('due') || q.includes('fine') || q.includes('policy')) {
      return {
        reply: `📋 **SRM IST Library Circulation Policy**:\n\n- **Borrow Limit**: 3 books per student.\n- **Loan Duration**: 14 days standard renewal period.\n- **Overdue Penalty**: ₹2.00 per day per book.\n- **QR Scanning**: Instant self-checkout available via the LibraX Scanner tab.`
      };
    }

    if (q.includes('algorithm') || q.includes('dsa') || q.includes('cormen')) {
      const b = books.find(item => item.id === 'BK001') || books[0];
      return {
        reply: `We have **${b.title}** by *${b.author}*!\n\n- **ID**: ${b.id}\n- **Shelf**: ${b.shelf_location}\n- **Available**: ${b.available_copies} of ${b.total_copies} copies.\n- **ISBN**: ${b.isbn}\n\nYou can issue this immediately through your student dashboard!`
      };
    }

    if (q.includes('python') || q.includes('machine learning') || q.includes('ai')) {
      const pyBooks = books.filter(b => b.category.includes('Python') || b.category.includes('AI')).slice(0, 2);
      return {
        reply: `Found ${pyBooks.length} titles in AI & Python:\n\n` +
          pyBooks.map(b => `🤖 **${b.title}**\nAuthor: ${b.author} | Shelf: ${b.shelf_location}`).join('\n\n')
      };
    }

    return {
      reply: `Hello! I am your **LibraX AI Librarian** powered by Newton School Coding Club SRM IST.\n\nI can assist you with:\n- Searching our 30+ physical titles in the campus stacks\n- Finding book locations and shelf IDs (e.g. A-101, B-201)\n- Checking your active loans and due dates\n- Real-time borrowing regulations and renewals\n\nHow may I help your studies today?`
    };
  },

  aiSearch(query) {
    const books = getItems(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const q = (query || '').toLowerCase();
    const scored = books.map(b => {
      let score = 0;
      if (b.title.toLowerCase().includes(q)) score += 50;
      if (b.author.toLowerCase().includes(q)) score += 30;
      if (b.category.toLowerCase().includes(q)) score += 25;
      if (b.description && b.description.toLowerCase().includes(q)) score += 15;
      return { ...b, matchScore: score };
    }).filter(b => b.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);

    return {
      results: scored.length > 0 ? scored : books.slice(0, 4)
    };
  },

  // ── Browser-Native CSV & Excel Export ──
  exportCSV() {
    const txns = getItems(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const headers = ['Transaction ID', 'Book ID', 'Book Title', 'Student Name', 'Reg Number', 'Department', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine (INR)'];
    const rows = txns.map(t => [
      t.id,
      t.book_id,
      `"${(t.book_title || '').replace(/"/g, '""')}"`,
      `"${(t.borrower_name || '').replace(/"/g, '""')}"`,
      t.borrower_reg,
      t.borrower_dept,
      t.issue_date?.split('T')[0] || '',
      t.due_date?.split('T')[0] || '',
      t.return_date?.split('T')[0] || 'N/A',
      t.status,
      t.fine_amount || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `librax-circulation-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }
};
