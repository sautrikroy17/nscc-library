// Client-side seed database for resilient local-first operation
export const INITIAL_USERS = [
  {
    id: 'LIB001',
    name: 'Dr. Rajesh Kumar',
    email: 'librarian@srmist.edu.in',
    reg_number: 'LIB001',
    department: 'Library Administration',
    role: 'librarian',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'LIB002',
    name: 'Admin Librarian',
    email: 'admin@nscc.srmist.edu.in',
    reg_number: 'LIB002',
    department: 'NSCC Technology Cell',
    role: 'librarian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'STU001',
    name: 'Sautrik Roy',
    email: 'ra2511003010052@srmist.edu.in',
    reg_number: 'RA2511003010052',
    department: 'CSE',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'STU002',
    name: 'Pranav Sharma',
    email: 'pranav@srmist.edu.in',
    reg_number: 'RA2311003030002',
    department: 'CSE',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'STU003',
    name: 'Aryan Singh',
    email: 'aryan@srmist.edu.in',
    reg_number: 'RA2311003030003',
    department: 'ECE',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'STU004',
    name: 'Kriti Sharma',
    email: 'kriti@srmist.edu.in',
    reg_number: 'RA2311003030004',
    department: 'CSE',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_BOOKS = [
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
  { id: 'BK031', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', isbn: '978-0439708180', category: 'Literature & Fiction', total_copies: 5, available_copies: 4, shelf_location: 'L-101', description: 'The magical journey begins. Harry Potter discovers he is a wizard and attends Hogwarts School of Witchcraft and Wizardry.', cover_color: '#f59e0b', published_year: 1997 },
  { id: 'BK032', title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', isbn: '978-0439064873', category: 'Literature & Fiction', total_copies: 4, available_copies: 4, shelf_location: 'L-102', description: 'Mysterious whispers and petrified students haunt the ancient halls of Hogwarts.', cover_color: '#10b981', published_year: 1998 },
  { id: 'BK033', title: 'The Lord of the Rings: The Fellowship of the Ring', author: 'J.R.R. Tolkien', isbn: '978-0544003415', category: 'Literature & Fiction', total_copies: 3, available_copies: 2, shelf_location: 'L-201', description: 'The legendary epic fantasy quest across Middle-earth to destroy the One Ring.', cover_color: '#8b5cf6', published_year: 1954 },
  { id: 'BK034', title: '1984', author: 'George Orwell', isbn: '978-0451524935', category: 'Literature & Fiction', total_copies: 6, available_copies: 5, shelf_location: 'L-202', description: 'A chilling dystopian masterpiece examining surveillance, totalitarian control, and objective truth.', cover_color: '#ef4444', published_year: 1949 },
  { id: 'BK035', title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', category: 'Self-Improvement & Productivity', total_copies: 5, available_copies: 4, shelf_location: 'P-101', description: 'An easy and proven way to build good habits and break bad ones. Practical framework for continuous personal growth.', cover_color: '#06b6d4', published_year: 2018 },
  { id: 'BK036', title: 'Steve Jobs: The Exclusive Biography', author: 'Walter Isaacson', isbn: '978-1451648539', category: 'Biography & Technology', total_copies: 3, available_copies: 3, shelf_location: 'B-301', description: 'The definitive biography of Apple co-founder Steve Jobs, chronicling creative leadership and technology revolutions.', cover_color: '#3b82f6', published_year: 2011 }
];

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

export const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-001',
    book_id: 'BK002',
    book_title: 'Clean Code',
    book_author: 'Robert C. Martin',
    borrower_id: 'STU001',
    borrower_name: 'Sautrik Roy',
    borrower_reg: 'RA2511003010052',
    borrower_dept: 'CSE',
    issued_by: 'LIB001',
    issue_date: pastDate(4),
    due_date: futureDate(10),
    return_date: null,
    status: 'issued',
    fine_amount: 0,
    fine_collected: 0
  },
  {
    id: 'TXN-002',
    book_id: 'BK006',
    book_title: 'Operating System Concepts (Dinosaur Book)',
    book_author: 'Silberschatz, Galvin & Gagne',
    borrower_id: 'STU001',
    borrower_name: 'Sautrik Roy',
    borrower_reg: 'RA2511003010052',
    borrower_dept: 'CSE',
    issued_by: 'LIB001',
    issue_date: pastDate(7),
    due_date: futureDate(7),
    return_date: null,
    status: 'issued',
    fine_amount: 0,
    fine_collected: 0
  },
  {
    id: 'TXN-003',
    book_id: 'BK007',
    book_title: 'Database System Concepts',
    book_author: 'Silberschatz, Korth & Sudarshan',
    borrower_id: 'STU001',
    borrower_name: 'Sautrik Roy',
    borrower_reg: 'RA2511003010052',
    borrower_dept: 'CSE',
    issued_by: 'LIB001',
    issue_date: pastDate(2),
    due_date: futureDate(12),
    return_date: null,
    status: 'issued',
    fine_amount: 0,
    fine_collected: 0
  },
  {
    id: 'TXN-004',
    book_id: 'BK001',
    book_title: 'Introduction to Algorithms',
    book_author: 'Cormen, Leiserson, Rivest & Stein',
    borrower_id: 'STU001',
    borrower_name: 'Sautrik Roy',
    borrower_reg: 'RA2511003010052',
    borrower_dept: 'CSE',
    issued_by: 'LIB001',
    issue_date: pastDate(20),
    due_date: pastDate(6),
    return_date: pastDate(5),
    status: 'returned',
    fine_amount: 0,
    fine_collected: 0
  },
  {
    id: 'TXN-003',
    book_id: 'BK009',
    book_title: 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow',
    book_author: 'Aurélien Géron',
    borrower_id: 'STU002',
    borrower_name: 'Pranav Sharma',
    borrower_reg: 'RA2311003030002',
    borrower_dept: 'CSE',
    issued_by: 'LIB001',
    issue_date: pastDate(3),
    due_date: futureDate(11),
    return_date: null,
    status: 'issued',
    fine_amount: 0,
    fine_collected: 0
  },
  {
    id: 'TXN-004',
    book_id: 'BK008',
    book_title: 'Deep Learning',
    book_author: 'Ian Goodfellow, Yoshua Bengio & Aaron Courville',
    borrower_id: 'STU003',
    borrower_name: 'Aryan Singh',
    borrower_reg: 'RA2311003030003',
    borrower_dept: 'ECE',
    issued_by: 'LIB001',
    issue_date: pastDate(7),
    due_date: futureDate(7),
    return_date: null,
    status: 'issued',
    fine_amount: 0,
    fine_collected: 0
  },
  {
    id: 'TXN-005',
    book_id: 'BK004',
    book_title: 'Design Patterns: Elements of Reusable OO Software',
    book_author: 'Gang of Four',
    borrower_id: 'STU004',
    borrower_name: 'Kriti Sharma',
    borrower_reg: 'RA2311003030004',
    borrower_dept: 'CSE',
    issued_by: 'LIB001',
    issue_date: pastDate(25),
    due_date: pastDate(11),
    return_date: null,
    status: 'overdue',
    fine_amount: 55,
    fine_collected: 0
  },
  {
    id: 'TXN-006',
    book_id: 'BK003',
    book_title: 'The Pragmatic Programmer',
    book_author: 'David Thomas & Andrew Hunt',
    borrower_id: 'STU003',
    borrower_name: 'Aryan Singh',
    borrower_reg: 'RA2311003030003',
    borrower_dept: 'ECE',
    issued_by: 'LIB001',
    issue_date: pastDate(20),
    due_date: pastDate(6),
    return_date: null,
    status: 'overdue',
    fine_amount: 30,
    fine_collected: 0
  }
];
