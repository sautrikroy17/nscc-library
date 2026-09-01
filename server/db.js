const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'library.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─────────────────────────────────────────────
//  SCHEMA
// ─────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    reg_number TEXT UNIQUE,
    department TEXT,
    role TEXT NOT NULL CHECK(role IN ('librarian','student')),
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    shelf_location TEXT,
    description TEXT,
    cover_color TEXT DEFAULT '#10b981',
    published_year INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    borrower_id TEXT NOT NULL,
    borrower_name TEXT NOT NULL,
    borrower_reg TEXT NOT NULL,
    borrower_dept TEXT,
    issued_by TEXT NOT NULL,
    issue_date TEXT NOT NULL DEFAULT (datetime('now')),
    due_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT NOT NULL DEFAULT 'issued' CHECK(status IN ('issued','returned','overdue')),
    fine_amount REAL DEFAULT 0,
    fine_collected INTEGER DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (issued_by) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_book ON transactions(book_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_borrower ON transactions(borrower_reg);
  CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
  CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
`);

// ─────────────────────────────────────────────
//  SEED DATA
// ─────────────────────────────────────────────

function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  if (userCount > 0) return; // Already seeded

  const salt = bcrypt.genSaltSync(10);

  // Seed users
  const users = [
    { id: uuidv4(), name: 'Dr. Rajesh Kumar', email: 'librarian@srmist.edu.in', reg_number: 'LIB001', department: 'Library', role: 'librarian', password_hash: bcrypt.hashSync('librarian123', salt) },
    { id: uuidv4(), name: 'Admin Librarian', email: 'admin@nscc.srmist.edu.in', reg_number: 'LIB002', department: 'Library', role: 'librarian', password_hash: bcrypt.hashSync('nscc2024', salt) },
    { id: uuidv4(), name: 'Sautrik Roy', email: 'sr9973@srmist.edu.in', reg_number: 'RA2311003030001', department: 'CSE', role: 'student', password_hash: bcrypt.hashSync('student123', salt) },
    { id: uuidv4(), name: 'Pranav Sharma', email: 'pranav@srmist.edu.in', reg_number: 'RA2311003030002', department: 'CSE', role: 'student', password_hash: bcrypt.hashSync('student123', salt) },
    { id: uuidv4(), name: 'Aryan Singh', email: 'aryan@srmist.edu.in', reg_number: 'RA2311003030003', department: 'ECE', role: 'student', password_hash: bcrypt.hashSync('student123', salt) },
    { id: uuidv4(), name: 'Kriti Sharma', email: 'kriti@srmist.edu.in', reg_number: 'RA2311003030004', department: 'CSE', role: 'student', password_hash: bcrypt.hashSync('student123', salt) },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, reg_number, department, role, password_hash)
    VALUES (@id, @name, @email, @reg_number, @department, @role, @password_hash)
  `);

  for (const u of users) insertUser.run(u);

  // Seed books (30 curated books)
  const books = [
    { id: 'BK001', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest & Stein', isbn: '978-0262046305', category: 'Algorithms', total_copies: 5, available_copies: 3, shelf_location: 'A-101', description: 'Comprehensive introduction to modern algorithms. Covers design, analysis, and implementation of algorithms across various domains.', cover_color: '#6366f1', published_year: 2022 },
    { id: 'BK002', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Software Engineering', total_copies: 4, available_copies: 4, shelf_location: 'B-201', description: 'A handbook of agile software craftsmanship. Teaches how to write clean, maintainable, and professional code.', cover_color: '#10b981', published_year: 2008 },
    { id: 'BK003', title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', isbn: '978-0135957059', category: 'Software Engineering', total_copies: 3, available_copies: 2, shelf_location: 'B-202', description: 'Your journey to mastery. Covers practical approaches to software development and programming best practices.', cover_color: '#f59e0b', published_year: 2019 },
    { id: 'BK004', title: 'Design Patterns: Elements of Reusable OO Software', author: 'Gang of Four', isbn: '978-0201633610', category: 'Software Engineering', total_copies: 3, available_copies: 1, shelf_location: 'B-203', description: 'The classic catalog of 23 fundamental design patterns used in object-oriented software development.', cover_color: '#8b5cf6', published_year: 1994 },
    { id: 'BK005', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', category: 'Computer Networks', total_copies: 6, available_copies: 5, shelf_location: 'C-301', description: 'Comprehensive coverage of computer networking concepts from physical layer to application protocols.', cover_color: '#06b6d4', published_year: 2010 },
    { id: 'BK006', title: 'Operating System Concepts (Dinosaur Book)', author: 'Silberschatz, Galvin & Gagne', isbn: '978-1119800330', category: 'Operating Systems', total_copies: 5, available_copies: 3, shelf_location: 'C-302', description: 'The definitive textbook for understanding operating systems: processes, memory, storage, and security.', cover_color: '#10b981', published_year: 2021 },
    { id: 'BK007', title: 'Database System Concepts', author: 'Silberschatz, Korth & Sudarshan', isbn: '978-0078022159', category: 'Databases', total_copies: 4, available_copies: 4, shelf_location: 'D-401', description: 'Comprehensive introduction to database systems design, SQL, normalization, and transaction management.', cover_color: '#f97316', published_year: 2019 },
    { id: 'BK008', title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio & Aaron Courville', isbn: '978-0262035613', category: 'AI & Machine Learning', total_copies: 4, available_copies: 2, shelf_location: 'E-501', description: 'Foundational textbook on deep learning covering neural networks, optimization, and modern architectures.', cover_color: '#ec4899', published_year: 2016 },
    { id: 'BK009', title: 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow', author: 'Aurélien Géron', isbn: '978-1098125974', category: 'AI & Machine Learning', total_copies: 3, available_copies: 1, shelf_location: 'E-502', description: 'Practical guide to machine learning with Python. Covers scikit-learn, Keras, and TensorFlow with hands-on projects.', cover_color: '#06b6d4', published_year: 2022 },
    { id: 'BK010', title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', isbn: '978-0984782857', category: 'Interview Prep', total_copies: 6, available_copies: 4, shelf_location: 'F-601', description: '189 programming questions and solutions. The definitive guide for software engineering technical interviews.', cover_color: '#84cc16', published_year: 2015 },
    { id: 'BK011', title: 'The Art of Computer Programming (Vol 1)', author: 'Donald E. Knuth', isbn: '978-0201896831', category: 'Algorithms', total_copies: 2, available_copies: 2, shelf_location: 'A-102', description: 'Knuth\'s magnum opus. Fundamental algorithms and mathematical foundations of programming.', cover_color: '#6366f1', published_year: 2011 },
    { id: 'BK012', title: 'System Design Interview', author: 'Alex Xu', isbn: '979-8664653403', category: 'Interview Prep', total_copies: 5, available_copies: 3, shelf_location: 'F-602', description: 'An insider\'s guide to system design interviews. Covers scalable system architecture with real-world examples.', cover_color: '#f59e0b', published_year: 2020 },
    { id: 'BK013', title: 'Structure and Interpretation of Computer Programs', author: 'Abelson, Sussman & Sussman', isbn: '978-0262510875', category: 'Computer Science', total_copies: 3, available_copies: 3, shelf_location: 'G-701', description: 'The legendary MIT textbook on programming. Explores abstraction, procedures, and metacircular interpreters in Scheme.', cover_color: '#8b5cf6', published_year: 1996 },
    { id: 'BK014', title: 'Computer Organization and Design', author: 'Patterson & Hennessy', isbn: '978-0128201091', category: 'Computer Architecture', total_copies: 4, available_copies: 4, shelf_location: 'H-801', description: 'RISC-V edition. Foundational computer architecture covering instruction sets, pipelining, and memory hierarchy.', cover_color: '#ef4444', published_year: 2021 },
    { id: 'BK015', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', isbn: '978-0134610993', category: 'AI & Machine Learning', total_copies: 4, available_copies: 2, shelf_location: 'E-503', description: 'The leading AI textbook used in universities worldwide. Comprehensive coverage from search to deep learning.', cover_color: '#ec4899', published_year: 2020 },
    { id: 'BK016', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0596517748', category: 'Web Development', total_copies: 3, available_copies: 3, shelf_location: 'I-901', description: 'Unearthing the excellence in JavaScript. Focuses on the elegant parts of the language while exposing pitfalls.', cover_color: '#f59e0b', published_year: 2008 },
    { id: 'BK017', title: 'You Don\'t Know JS: Scope & Closures', author: 'Kyle Simpson', isbn: '978-1491904151', category: 'Web Development', total_copies: 3, available_copies: 3, shelf_location: 'I-902', description: 'Deep dive into JavaScript scoping, hoisting, closures, and modules. Part of the YDKJS series.', cover_color: '#f97316', published_year: 2014 },
    { id: 'BK018', title: 'Learning Python', author: 'Mark Lutz', isbn: '978-1449355739', category: 'Python', total_copies: 5, available_copies: 5, shelf_location: 'J-001', description: 'The definitive Python programming textbook. Comprehensive coverage from basics to advanced OOP and libraries.', cover_color: '#06b6d4', published_year: 2013 },
    { id: 'BK019', title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', isbn: '978-1593279929', category: 'Python', total_copies: 4, available_copies: 4, shelf_location: 'J-002', description: 'Practical programming for total beginners. Learn Python through automation of everyday computer tasks.', cover_color: '#84cc16', published_year: 2019 },
    { id: 'BK020', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1449373320', category: 'Databases', total_copies: 3, available_copies: 1, shelf_location: 'D-402', description: 'The big ideas behind reliable, scalable, and maintainable systems. Essential reading for backend engineers.', cover_color: '#f97316', published_year: 2017 },
    { id: 'BK021', title: 'The Web Application Hacker\'s Handbook', author: 'Stuttard & Pinto', isbn: '978-1118026472', category: 'Cybersecurity', total_copies: 2, available_copies: 2, shelf_location: 'K-101', description: 'Finding and exploiting security flaws in web applications. Essential reading for security researchers.', cover_color: '#ef4444', published_year: 2011 },
    { id: 'BK022', title: 'Competitive Programming 3', author: 'Steven & Felix Halim', isbn: '978-9810811044', category: 'Competitive Programming', total_copies: 4, available_copies: 4, shelf_location: 'L-201', description: 'The new lower bound of programming contests. Complete guide to competitive programming with algorithmic strategies.', cover_color: '#6366f1', published_year: 2013 },
    { id: 'BK023', title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', isbn: '978-0073383095', category: 'Mathematics', total_copies: 5, available_copies: 5, shelf_location: 'M-301', description: 'Comprehensive introduction to mathematical concepts used in computer science: logic, sets, graphs, and number theory.', cover_color: '#10b981', published_year: 2018 },
    { id: 'BK024', title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '978-3319110790', category: 'Mathematics', total_copies: 3, available_copies: 3, shelf_location: 'M-302', description: 'An innovative approach to linear algebra without using determinants until the end. Elegant and rigorous.', cover_color: '#8b5cf6', published_year: 2015 },
    { id: 'BK025', title: 'Code: The Hidden Language of Computer Hardware and Software', author: 'Charles Petzold', isbn: '978-0735611313', category: 'Computer Science', total_copies: 3, available_copies: 3, shelf_location: 'G-702', description: 'A brilliant un-dry exploration of how computers work from Morse code to machine language and higher level abstractions.', cover_color: '#06b6d4', published_year: 2000 },
    { id: 'BK026', title: 'React: Up and Running', author: 'Stoyan Stefanov', isbn: '978-1492051459', category: 'Web Development', total_copies: 3, available_copies: 3, shelf_location: 'I-903', description: 'Building web applications with React. Covers components, hooks, state management, and React 18 features.', cover_color: '#06b6d4', published_year: 2021 },
    { id: 'BK027', title: 'Node.js Design Patterns', author: 'Mario Casciaro & Luciano Mammino', isbn: '978-1839214110', category: 'Web Development', total_copies: 3, available_copies: 2, shelf_location: 'I-904', description: 'Design and implement production-grade Node.js applications using proven design patterns and best practices.', cover_color: '#10b981', published_year: 2020 },
    { id: 'BK028', title: 'The Clean Coder', author: 'Robert C. Martin', isbn: '978-0137081073', category: 'Software Engineering', total_copies: 4, available_copies: 4, shelf_location: 'B-204', description: 'A code of conduct for professional programmers. Covers responsibility, work ethics, estimates, and managing pressure.', cover_color: '#f59e0b', published_year: 2011 },
    { id: 'BK029', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', isbn: '978-1718500709', category: 'Web Development', total_copies: 4, available_copies: 4, shelf_location: 'I-905', description: 'A modern introduction to JavaScript. Covers data structures, OOP, functional programming, Node.js, and the DOM.', cover_color: '#f97316', published_year: 2018 },
    { id: 'BK030', title: 'Graph Theory and Its Applications', author: 'Jonathan L. Gross', isbn: '978-1584885054', category: 'Mathematics', total_copies: 2, available_copies: 2, shelf_location: 'M-303', description: 'Comprehensive treatment of graph theory with applications to computer science, operations research, and engineering.', cover_color: '#84cc16', published_year: 2005 },
  ];

  const insertBook = db.prepare(`
    INSERT INTO books (id, title, author, isbn, category, total_copies, available_copies, shelf_location, description, cover_color, published_year)
    VALUES (@id, @title, @author, @isbn, @category, @total_copies, @available_copies, @shelf_location, @description, @cover_color, @published_year)
  `);

  const insertMany = db.transaction((books) => {
    for (const b of books) insertBook.run(b);
  });

  insertMany(books);

  // Seed a few sample transactions
  const librarianId = db.prepare("SELECT id FROM users WHERE role='librarian' LIMIT 1").get().id;
  const studentId = db.prepare("SELECT id FROM users WHERE reg_number='RA2311003030001'").get().id;

  const pastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };
  const futureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, book_id, borrower_id, borrower_name, borrower_reg, borrower_dept, issued_by, issue_date, due_date, return_date, status, fine_amount, fine_collected)
    VALUES (@id, @book_id, @borrower_id, @borrower_name, @borrower_reg, @borrower_dept, @issued_by, @issue_date, @due_date, @return_date, @status, @fine_amount, @fine_collected)
  `);

  // Already returned transactions
  insertTx.run({ id: uuidv4(), book_id: 'BK001', borrower_id: studentId, borrower_name: 'Sautrik Roy', borrower_reg: 'RA2311003030001', borrower_dept: 'CSE', issued_by: librarianId, issue_date: pastDate(20), due_date: pastDate(6), return_date: pastDate(5), status: 'returned', fine_amount: 0, fine_collected: 0 });
  insertTx.run({ id: uuidv4(), book_id: 'BK010', borrower_id: studentId, borrower_name: 'Sautrik Roy', borrower_reg: 'RA2311003030001', borrower_dept: 'CSE', issued_by: librarianId, issue_date: pastDate(30), due_date: pastDate(16), return_date: pastDate(10), status: 'returned', fine_amount: 30, fine_collected: 1 });

  // Active issued (not overdue)
  insertTx.run({ id: uuidv4(), book_id: 'BK009', borrower_id: studentId, borrower_name: 'Pranav Sharma', borrower_reg: 'RA2311003030002', borrower_dept: 'CSE', issued_by: librarianId, issue_date: pastDate(3), due_date: futureDate(11), return_date: null, status: 'issued', fine_amount: 0, fine_collected: 0 });
  insertTx.run({ id: uuidv4(), book_id: 'BK008', borrower_id: studentId, borrower_name: 'Aryan Singh', borrower_reg: 'RA2311003030003', borrower_dept: 'ECE', issued_by: librarianId, issue_date: pastDate(7), due_date: futureDate(7), return_date: null, status: 'issued', fine_amount: 0, fine_collected: 0 });

  // Overdue transactions
  insertTx.run({ id: uuidv4(), book_id: 'BK004', borrower_id: studentId, borrower_name: 'Kriti Sharma', borrower_reg: 'RA2311003030004', borrower_dept: 'CSE', issued_by: librarianId, issue_date: pastDate(25), due_date: pastDate(11), return_date: null, status: 'overdue', fine_amount: 55, fine_collected: 0 });
  insertTx.run({ id: uuidv4(), book_id: 'BK003', borrower_id: studentId, borrower_name: 'Aryan Singh', borrower_reg: 'RA2311003030003', borrower_dept: 'ECE', issued_by: librarianId, issue_date: pastDate(20), due_date: pastDate(6), return_date: null, status: 'overdue', fine_amount: 30, fine_collected: 0 });

  // Update available copies to match
  db.prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id IN ('BK009','BK008','BK004','BK003')").run();

  console.log('✅ Database seeded successfully');
}

seedDatabase();

module.exports = db;
