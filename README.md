# 📚 LibraX — Smart Library Management System

> **Newton School Coding Club (NSCC) · SRM IST**  
> 🌐 **Live Production**: [https://librax-app.vercel.app](https://librax-app.vercel.app) · [https://librax-library.vercel.app](https://librax-library.vercel.app)

A full-stack, AI-powered library management system engineered for NSCC @ SRM IST. Features QR-based camera scanning, Groq-powered AI assistant, real-time overdue tracking, automated fine calculations, and dual CSV/Excel reporting — all encased in a Sentinel-grade dark obsidian UI with a unified responsive layout.

---

## ✨ Features

### 📊 Dashboard
- Live stats: total books, copies, issued count, overdue count, total fines collected
- Overdue alert table with borrower info and calculated fine amounts
- Books by category bar chart with animated progress bars
- Daily activity graph (7-day issue/return trend)

### 📚 Book Catalog
- Card-based grid view with color-coded covers and real-time availability badges
- Real-time search, category filter, and availability filtering
- Click any book to view full details (description, ISBN, shelf location)
- Librarian tools: Add new book, Edit book, Delete book
- **AI Autofill**: Enter a book title and AI fills in author, ISBN, category, description
- **QR Code Generator**: Generate + download + print shelf labels for any book

### 🎧 LibraX Study Haven (Virtual Focus & Co-Study Room)
- **Aesthetic Circular Pomodoro Timer**: Preset modes for Deep Focus (25m), Flow Sprint (50m), Short Break (5m), and Zen Meditation (15m).
- **5 Dynamic Visual Study Themes**:
  - `Obsidian Cyber`: High-tech emerald & obsidian glass.
  - `Matcha Zen`: Organic tea leaf tones & calming botanical ambiance.
  - `Midnight Cafe`: Warm amber espresso glow with cozy lofi accents.
  - `Cosmic Nebula`: Deep violet stellar space aesthetic.
  - `Glacial Arctic`: Crisp cyan frost with clean, arctic lines.
- **Synthesized Ambient Soundscapes**: 100% client-side Web Audio API audio synthesis (Rain on Glass, 432Hz Binaural Alpha Waves, Crackling Fireplace Hearth, and Tibetan Singing Bowl gong). Zero external audio asset dependencies.
- **Target Goal Anchor**: Set custom study milestones with celebratory checkmark animations.
- **Live Co-Study Presence**: Virtual co-studying roster simulating peer study streaks from SRM IST departments (CSE, ECE).
- **Zen Full-Screen Mode**: Distraction-free, edge-to-edge ambient focus immersion.

### 🔄 Transactions Ledger
- Paginated transaction log with search and status filter (all / issued / returned / overdue)
- Auto-calculated fine display (₹5/day overdue)
- Student view: only shows their own transactions

### ⚙️ Admin Panel *(Librarian only)*
- **Overdue Management**: All overdue books with "Collect & Return" and "Waive Fine" actions
- **Quick Issue / Return**: Issue a book by Book ID, or return by Transaction ID
- **Data Export**: Download reports as CSV or Excel (all, overdue, issued, full)
- **Books Database**: Full overview of all books with delete capability

### 📷 QR Scanner *(Librarian only)*
- Real-time camera QR code scanner using html5-qrcode
- Scan a book's QR to see its details and active loans instantly
- Issue/return workflows directly from the scanner

### 🤖 AI Assistant
- **AI Chat** (Groq-powered): Conversational assistant for book recommendations and library Q&A
- **Semantic Search**: Natural language book search ("show me Python books for beginners")
- Quick prompt chips for instant queries; graceful fallback to keyword search

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Database | SQLite (better-sqlite3, WAL mode) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Groq API (llama-3.3-70b-versatile) |
| QR | html5-qrcode + qrcode |
| Export | xlsx + json2csv |
| Fonts | Inter, Plus Jakarta Sans, JetBrains Mono |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone and Setup
```bash
git clone <repo-url>
cd nscc-library
```

### 2. Start the Backend
```bash
cd server
npm install
npm run dev        # starts on http://localhost:4000
```

The database (library.db) is created automatically with 30 books, 6 users, and 7 sample transactions.

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 📚 Librarian Admin | admin@nscc.srmist.edu.in | nscc2024 |
| 📖 Senior Librarian | librarian@srmist.edu.in | librarian123 |
| 🎓 Student (Sautrik) | sr9973@srmist.edu.in | student123 |
| 🎓 Student (Pranav) | pranav@srmist.edu.in | student123 |
| 🎓 Student (Aryan) | aryan@srmist.edu.in | student123 |
| 🎓 Student (Kriti) | kriti@srmist.edu.in | student123 |

> **Tip:** Use the "🚀 Demo Accounts" tab on the login page for one-click login.

---

## ⚙️ Environment Variables

### Server (server/.env)
```env
PORT=4000
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at https://console.groq.com

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login → returns JWT |
| GET | /api/auth/me | Get current user |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List books (q, category, available, page, limit) |
| GET | /api/books/categories | All categories |
| GET | /api/books/:id | Single book |
| POST | /api/books | Add book (librarian) |
| PUT | /api/books/:id | Update book (librarian) |
| DELETE | /api/books/:id | Delete book (librarian) |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | List (status, q, borrower_reg) |
| POST | /api/transactions/issue | Issue book (librarian) |
| POST | /api/transactions/return | Return book (librarian) |
| POST | /api/transactions/scan | Scan QR → book status (librarian) |

### Stats & Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stats | Dashboard stats |
| GET | /api/export/csv | Download CSV |
| GET | /api/export/excel | Download Excel |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/search | Semantic search |
| POST | /api/ai/chat | AI chat |
| POST | /api/ai/autofill | Book metadata autofill |

---

## 📁 Project Structure

```
nscc-library/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.jsx                 # Router + page guards
│       ├── styles.css              # Unified design system & responsive layout
│       ├── api.js                  # Axios API client modules
│       ├── context/                # AuthContext + ToastContext
│       ├── components/Sidebar.jsx  # Desktop sidebar + mobile bottom nav
│       └── pages/
│           ├── LoginPage.jsx
│           ├── Dashboard.jsx
│           ├── Catalog.jsx
│           ├── Transactions.jsx
│           ├── AdminPanel.jsx
│           ├── Scanner.jsx
│           └── AIAssistant.jsx
└── server/
    ├── index.js                    # Express app
    ├── db.js                       # SQLite schema + seed data
    ├── middleware/auth.js           # JWT middleware
    └── routes/
        ├── auth.js
        ├── books.js
        ├── transactions.js
        ├── stats.js
        ├── export.js
        └── ai.js
```

---

## 🔒 Role-Based Access

| Feature | Student | Librarian |
|---------|---------|-----------|
| View catalog | ✅ | ✅ |
| View own transactions | ✅ | ✅ |
| View all transactions | ❌ | ✅ |
| Issue / Return books | ❌ | ✅ |
| QR Scanner | ❌ | ✅ |
| Admin Panel | ❌ | ✅ |
| Add / Edit / Delete books | ❌ | ✅ |
| Export reports | ❌ | ✅ |
| AI Chat + Search | ✅ | ✅ |

---

## 📋 Fine Policy

- **Rate**: ₹5 per day per book after due date
- **Default loan period**: 14 days (configurable per issue)
- **Waive fine**: Librarians can waive fine at return time

---

## 📊 Sample Data

| Entity | Count |
|--------|-------|
| Books | 30 |
| Total copies | 112 |
| Categories | 15 |
| Demo users | 6 |
| Sample transactions | 7 |

---

*Built with ❤️ for NSCC · Newton School Coding Club · SRM IST*
