# 🎓 LibraX — Architecture, Presentation & Technical Q&A Defense Guide

> **Cheat sheet and presentation guide for project evaluations, hackathons, and technical interviews.**  
> 🌐 **Live Production**: [https://librax-library.vercel.app](https://librax-library.vercel.app)

---

## ⚡ 1. The 30-Second Elevator Pitch

> *"LibraX is a smart, AI-powered institutional library management platform engineered for university campuses. Unlike legacy, clunky library systems that look like 2005 spreadsheets, LibraX combines a modern 10-screen Librarian Portal (with real-time circulation telemetry, automated overdue fine recovery, QR camera scanning, and one-click data export) with a student focus hub featuring Lyra AI (a mood-aware book recommendation engine) and the LibraX Study Haven (synthesized ambient soundscapes and Pomodoro timers). It runs on a fast React 18 + Vite frontend with a lightweight Node.js/SQLite backend optimized with Write-Ahead Logging."*

---

## 🏛️ 2. System Architecture (How to Explain It)

LibraX follows a clean **Decoupled Client-Server Architecture**:

```
                  ┌──────────────────────────────────────────────┐
                  │                 WEB CLIENT                   │
                  │   React 18 · Vite 5 · Framer Motion · CSS    │
                  └───────┬──────────────────────────────▲───────┘
                          │                              │
                HTTP/REST │ (Axios + JSON)               │ Responses
                          ▼                              │
                  ┌──────────────────────────────────────┴───────┐
                  │                EXPRESS API                   │
                  │       Node.js · JWT Auth · RBAC Guard        │
                  └──┬─────────────────────┬───────────────────┬─┘
                     │                     │                   │
         SQL Queries │          API Calls  │       File Stream │
                     ▼                     ▼                   ▼
            ┌────────────────┐     ┌───────────────┐   ┌────────────────┐
            │ SQLite (WAL)   │     │ Groq AI API   │   │ Excel / CSV    │
            │ better-sqlite3 │     │ Llama-3.3-70b │   │ xlsx / json2csv│
            └────────────────┘     └───────────────┘   └────────────────┘
```

### 1. Frontend Layer (`/client`)
- **Single Page Application (SPA)**: Built with React 18 and Vite 5 for instant Hot Module Replacement (HMR) and sub-second production builds.
- **State Management**: React Context (`AuthContext` for user roles and `ToastContext` for notifications) paired with an offline-ready `localStore.js` hybrid cache.
- **Sound Engine**: Native browser **Web Audio API** mathematically synthesizes white/pink noise (rain), crackling pulses (fireplace), and 432Hz sine waves (binaural beats) directly on the audio card without loading large MP3 files.
- **Camera Scanning**: Uses `html5-qrcode` to access laptop/phone webcams to scan physical ISBN barcodes and student ID cards in real-time.

### 2. Backend Layer (`/server`)
- **RESTful API**: Node.js and Express 4 organize routes modularly (`auth`, `books`, `transactions`, `stats`, `export`, `ai`).
- **Database Engine**: `better-sqlite3` runs synchronously in-process. With **WAL (Write-Ahead Logging)** mode enabled, reads and writes never block each other, handling hundreds of concurrent queries effortlessly.
- **Security & RBAC**: Password hashing using `bcryptjs` and stateless session verification using `jsonwebtoken` (JWT). Routes are protected with role guards (`requireRole('librarian')`).
- **AI Engine**: Groq SDK routes natural language book queries and automatic catalog metadata autofill to `llama-3.3-70b-versatile`.

---

## 👥 3. The Two User Roles

When asked: *"Who uses this and what can they do?"*

| Feature | 📚 Head Librarian (Dr. Rajesh Kumar) | 🎓 Student (Sautrik Roy) |
|---|---|---|
| **Identity** | Dr. Rajesh Kumar (`LIB001`) | Sautrik Roy (`RA2511003010052`) |
| **Dashboard** | Dual-trend circulation chart, daily schedule, staff stats | Active loans, due dates countdown, wishlist |
| **Catalog** | Full catalog, `+ Add Book` modal, ISBN detail fetcher | Browse books, filter by category, borrow/wishlist |
| **Circulation** | Issue/Return book scanner, QR camera, transaction log | Personal borrow history, return receipts |
| **Overdue Audit** | All delinquent accounts, late fee collection, `[Notify]` alert | Overdue notice with calculated fine amount |
| **Analytics** | Top 10 Most Issued books, category donut chart, CSV/Excel | Personal study analytics, session streaks |
| **AI Assistant** | Book metadata autofill, inventory queries | Lyra AI mood-based book recommendations |
| **Study Haven** | N/A (Administrative view) | Pomodoro timer, 432Hz soundscapes, visual themes |

---

## 🎯 4. Top 10 Anticipated Technical Questions & Answers

### Q1: "Why did you choose SQLite with WAL mode instead of MongoDB or PostgreSQL?"
> **Answer**:  
> *"For an institutional library system, relational integrity and zero maintenance are paramount. SQLite with `better-sqlite3` is an embedded C-based engine that runs in-process with zero network overhead. By enabling WAL (Write-Ahead Logging) mode, readers do not block writers and writers do not block readers. It provides ACID transactions, single-file backups (`library.db`), and sub-millisecond query response times without the operational complexity of managing external database daemons."*

### Q2: "How does the QR and Barcode scanner work without dedicated barcode hardware?"
> **Answer**:  
> *"We integrated the `html5-qrcode` library, which taps into the browser's standard MediaDevices Web API. The webcam video feed is processed in real time frame-by-frame on a Canvas element. When a QR code or Code-128 barcode is detected, it is decoded into a string (like `BK002` or an ISBN). The frontend then automatically executes an API lookup to fetch the student quota and catalog copies, enabling instant checkouts."*

### Q3: "How do the ambient soundscapes work in Study Haven without MP3 assets?"
> **Answer**:  
> *"Instead of loading multiple megabytes of audio files that slow down page loads, we wrote procedural audio synthesizers using the native browser **Web Audio API**:*
> - *Rain is generated using a custom pink noise buffer run through a Biquad lowpass filter.*
> - *Fireplace crackles are generated using randomized audio pulses and bandpass noise.*
> - *Binaural Alpha Waves use dual oscillator nodes tuned to 432Hz and 442Hz in left and right stereo channels to stimulate cognitive focus.*
> *This produces infinite, non-repeating audio with zero bandwidth cost."*

### Q4: "How does Lyra AI work?"
> **Answer**:  
> *"Lyra is an AI companion designed with a warm, helpful librarian persona. It connects to the Groq API running `llama-3.3-70b-versatile` with low latency (<500ms). When a student selects a mood like 'Deep Focus' or 'Placement Prep', Lyra queries the library's catalog embeddings, cross-references syllabus requirements, and returns structured book recommendations with direct 'View Book' and 'Add to Wishlist' actions."*

### Q5: "How are overdue fines and late returns tracked?"
> **Answer**:  
> *"Every book transaction records an `issue_date` and a calculated `due_date` (standard 14-day borrowing duration). When the current timestamp exceeds the due date without a `return_date`, the system computes `overdue_days = Math.max(0, floor((today - due_date) / 86400000))`. The penalty is calculated dynamically at ₹5 or ₹10 per day. Librarians can click `[Notify]` to send simulated SMS/email reminders, or settle/waive fines directly from the Overdue Management ledger."*

### Q6: "How do reports and Excel exports work?"
> **Answer**:  
> *"On the backend, `/api/export/excel` uses `xlsx` (SheetJS) to construct a multi-worksheet workbook with formatted headers and summary metrics, while `/api/export/csv` formats data into streaming CSV chunks. On the frontend, blob URLs (`URL.createObjectURL`) trigger instant browser file downloads with audio feedback."*

### Q7: "How is security and role-based access control (RBAC) enforced?"
> **Answer**:  
> *"Security is implemented on multiple layers:*
> 1. *Passwords are salted and hashed using `bcryptjs`.*
> 2. *Stateless JSON Web Tokens (JWT) are signed with a secret key and transmitted via HTTP Bearer headers.*
> 3. *Express middleware checks `req.user.role === 'librarian'` before allowing any mutations (such as adding books, collecting fines, or issuing loans).*
> 4. *On the client, route guards redirect unauthorized users, and keyboard shortcut listeners restrict developer inspect access."*

### Q8: "What happens if the backend server goes down or is offline?"
> **Answer**:  
> *"We implemented a hybrid offline-first architecture with `localStore.js`. The client checks API health. If network connectivity drops or the local demo runs standalone, `localStore.js` seamlessly serves the verified catalog of 30+ volumes, records checkouts into browser `localStorage`, and prevents user-facing errors."*

### Q9: "How is the application deployed and hosted?"
> **Answer**:  
> *"The frontend is deployed to **Vercel** with global edge CDN distribution, sub-second TTFB, and automatic HTTPS. The backend can run on any Node.js container (such as Render or Railway) configured with the repository's `server/render.yaml`."*

### Q10: "What are the key differences between the Student and Librarian views?"
> **Answer**:  
> *"The Librarian view is an operational command center: it displays cross-campus inventory metrics, 11-bar dual checkout trends, student account audits, and shelf restocking. The Student view is an educational portal focused on personal borrowing, due date reminders, study soundscapes, and AI reading discovery."*
