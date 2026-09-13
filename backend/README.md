# ⚙️ LibraX Backend

> **High-Throughput Node.js & Express RESTful API with Embedded SQLite (WAL Mode)**  
> 🌐 **Production URL**: [https://librax-library.vercel.app](https://librax-library.vercel.app)

---

## 🏛️ Architecture Overview

The `backend/` directory houses the backend microservice for **LibraX**. It handles secure institutional authentication, database transactions, telemetry analytics, data streaming (Excel/CSV), and Groq AI LLM routing.

```
backend/
├── middleware/
│   └── auth.js             # JWT verification & Role-Based Access Control (RBAC)
│
├── routes/
│   ├── auth.js             # Authentication, login, session validation & BCrypt hashing
│   ├── books.js            # Book catalog CRUD, search, pagination, availability
│   ├── transactions.js     # Issue, return, renew & QR camera checkouts
│   ├── stats.js            # Circulation analytics, KPIs & category breakdown
│   ├── export.js           # Streaming Excel (.xlsx) & CSV report generators
│   └── ai.js               # Groq LLM integration (Llama-3.3-70b-versatile)
│
├── db.js                   # SQLite database engine (better-sqlite3) with WAL mode & schemas
├── index.js                # Express app setup, CORS, JSON parsing, error handlers
├── package.json            # Backend dependencies & scripts
├── render.yaml             # Optional Render deployment blueprint
└── .env.example            # Environment variable template
```

---

## 🗄️ Database Architecture (`better-sqlite3`)

The database is built on **SQLite** using `better-sqlite3` with **Write-Ahead Logging (WAL)** enabled:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
```

### Key Schema Tables:
1. **`users`**: Stores user identity, hashed passwords (bcrypt), roles (`librarian` vs `student`), department, and active quota limits.
2. **`books`**: Stores title, author, ISBN, category, shelf location, total copies, and available copies.
3. **`transactions`**: Stores issue dates, due dates, return dates, overdue status, and fine calculations (₹5/day).
4. **`audit_logs`**: Immutable ledger recording all staff and checkout actions.

---

## 📡 API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT bearer token |
| `GET` | `/api/auth/me` | Protected | Returns current authenticated user profile |

### 2. Book Catalog (`/api/books`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/books` | Public | Paginated list of books with query, category, and availability filters |
| `GET` | `/api/books/categories` | Public | Retrieves all distinct subject categories |
| `GET` | `/api/books/:id` | Public | Returns detailed metadata for a single volume |
| `POST` | `/api/books` | Librarian | Catalogs a new physical book into the library |
| `PUT` | `/api/books/:id` | Librarian | Updates catalog details, shelf coordinates, or copy count |
| `DELETE`| `/api/books/:id` | Librarian | Removes a volume from active catalog |

### 3. Transactions & Circulation (`/api/transactions`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | Protected | Retrieves transaction ledger (students view own, librarians view all) |
| `POST` | `/api/transactions/issue` | Librarian | Issues a book to a student registration ID (standard 14 days) |
| `POST` | `/api/transactions/return`| Librarian | Processes a book return, restocks copy, and calculates fines |
| `POST` | `/api/transactions/scan` | Librarian | Scans a QR barcode string and returns instant book & borrower state |

### 4. Analytics & Reports (`/api/stats` & `/api/export`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats` | Protected | Dashboard summary: total books, issued, overdue, active readers |
| `GET` | `/api/export/csv` | Librarian | Generates and streams dynamic `.csv` circulation report |
| `GET` | `/api/export/excel`| Librarian | Generates and streams formatted `.xlsx` workbook |

### 5. AI Assistant (`/api/ai`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Protected | Conversational book assistant powered by Groq Llama-3.3-70b |
| `POST` | `/api/ai/search` | Protected | Semantic natural language book query |
| `POST` | `/api/ai/autofill`| Librarian | Fetches ISBN, author, and description given a book title |

---

## 🛠️ Local Setup & Running

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start server in development mode (auto-reloads on change)
npm run dev
```

The API service runs at `http://localhost:4000`.
On first launch, `db.js` automatically creates `library.db` and populates it with realistic seed data.
