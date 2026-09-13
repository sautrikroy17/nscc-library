# 📚 LibraX — Smart Library Management System

> **Newton School Coding Club (NSCC) · SRM Institute of Science and Technology**  
> 🌐 **Production URL**: [https://librax-library.vercel.app](https://librax-library.vercel.app)  
> 🪞 **Production Mirrors**: [https://nscc-librax.vercel.app](https://nscc-librax.vercel.app) · [https://nscc-library.vercel.app](https://nscc-library.vercel.app)  
> 📖 **Interview & Defense Guide**: [Read EXPLAINER.md](./EXPLAINER.md)

[![React 18](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/)
[![Vite 5](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=nodedotjs)](https://nodejs.org/)
[![SQLite WAL](https://img.shields.io/badge/SQLite-WAL_Mode-003B57.svg?logo=sqlite)](https://sqlite.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-F55036.svg)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black.svg?logo=vercel)](https://librax-library.vercel.app)

---

## 🌟 Overview

**LibraX** is a full-stack, AI-powered institutional library management platform engineered for **SRM IST**. It eliminates the complexity of legacy library administration by uniting a 10-screen **Librarian Operations Portal** (Dr. Rajesh Kumar) and a modern **Student Focus Hub** (Sautrik Roy) with real-time circulation telemetry, QR camera barcode scanning, Lyra AI recommendation engine, procedural focus soundscapes, and dual Excel/CSV reporting.

---

## 📂 Well-Arranged Repository Structure

The repository is organized into two primary layers:

```
nscc-library/
├── client/                     # 💻 FRONTEND APPLICATION (React 18 + Vite 5)
│   ├── public/                 # Static assets (Lyra AI avatar, icons, graphics)
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, BackButton, BookCover, Logo)
│   │   ├── context/            # Global State (AuthContext, ToastContext)
│   │   ├── data/               # Seed catalog (30+ books) & localStore caching
│   │   ├── pages/              # 10 Librarian screens & Student views
│   │   │   ├── Dashboard.jsx   # Circulation KPI charts, schedule, overdue alerts
│   │   │   ├── Catalog.jsx     # 4-col books grid & Add New Book modal
│   │   │   ├── AdminPanel.jsx  # Students table, Reports, Overdue, Settings
│   │   │   ├── Transactions.jsx# Circulation history & receipt modal
│   │   │   ├── Scanner.jsx     # QR barcode camera issue/return desk
│   │   │   ├── Notifications.jsx# Overdue alerts, registrations, bulletins
│   │   │   ├── AIAssistant.jsx # Lyra AI mood-based book recommendations
│   │   │   ├── StudyRoom.jsx   # Study Haven with 432Hz ambient soundscapes
│   │   │   ├── History.jsx     # Personal student borrowing ledger
│   │   │   ├── Settings.jsx    # User preferences & notification toggles
│   │   │   └── LoginPage.jsx   # Institutional landing page & 1-click SSO demo
│   │   ├── utils/              # Web Audio API sound synthesizer & security
│   │   ├── App.jsx             # Topbar, live clock, page router
│   │   └── styles.css          # Design system & dark obsidian theme
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Build optimization & code splitting
│   └── README.md               # 📖 Deep-dive into Frontend architecture
│
├── server/                     # ⚙️ BACKEND MICROSERVICE (Node.js + Express 4)
│   ├── middleware/             # JWT authentication & role-based access guards
│   ├── routes/
│   │   ├── auth.js             # User login, token generation & bcrypt hashing
│   │   ├── books.js            # Books CRUD, category filters, pagination
│   │   ├── transactions.js     # Issue, return, renew & QR camera scan endpoints
│   │   ├── stats.js            # Real-time circulation analytics & charts data
│   │   ├── export.js           # Multi-sheet Excel (.xlsx) & CSV file streaming
│   │   └── ai.js               # Groq LLM API (Llama-3.3-70b) semantic query
│   ├── db.js                   # SQLite database engine (better-sqlite3) with WAL mode
│   ├── index.js                # Express app entry & CORS configuration
│   ├── package.json            # Backend dependencies
│   ├── render.yaml             # Render deployment configuration
│   └── README.md               # 📖 Deep-dive into Backend architecture
│
├── EXPLAINER.md                # 🎓 Presentation, Architecture & Technical Q&A Guide
├── LICENSE                     # MIT License (Copyright 2026 Sautrik Roy)
└── README.md                   # Main Project Documentation
```

---

## 🏛️ System Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │               CLIENT (FRONTEND)              │
                       │   React 18 · Vite 5 · Web Audio API · QR     │
                       └───────┬──────────────────────────────▲───────┘
                               │                              │
                     HTTP/REST │ (Axios + JSON)               │ Responses
                               ▼                              │
                       ┌──────────────────────────────────────┴───────┐
                       │               SERVER (BACKEND)               │
                       │       Node.js · Express · JWT · RBAC         │
                       └──┬─────────────────────┬───────────────────┬─┘
                          │                     │                   │
              SQL Queries │          API Calls  │       File Stream │
                          ▼                     ▼                   ▼
                 ┌────────────────┐     ┌───────────────┐   ┌────────────────┐
                 │ SQLite (WAL)   │     │ Groq AI API   │   │ Excel / CSV    │
                 │ better-sqlite3 │     │ Llama-3.3-70b │   │ xlsx / json2csv│
                 └────────────────┘     └───────────────┘   └────────────────┘
```

---

## ✨ Features Breakdown

### 📚 1. Ten Librarian Portal Screens (Mockup Exact)
1. **Librarian Dashboard**: "Good Afternoon, Dr. Rajesh Kumar"; 4 stat cards with percentage metrics; Reading table quote card; 11-bar dual trend circulation chart; 3x2 Quick Actions grid; Today's Schedule; Recent Transactions table; Overdue Books table with interactive `[Notify]` buttons (with audio feedback).
2. **Books Management**: Search, category, availability, and sort filters; 4-column card grid with cover images and real-time copies tracking; Pagination (1–8 of 248 books).
3. **Add New Book Modal**: Comprehensive metadata entry, cover dropzone, and automated ISBN detail fetcher.
4. **Students Management**: 8 verified student accounts table (Sautrik Roy, Ananya Sharma, Vikram Kumar, etc.) with registration modal and department filters.
5. **Transactions History**: Complete circulation history; CSV export button; Filter bar with search, Type (`All Types`, `Issue`, `Return`, `Renew`), Date range, and Status filters; `[View]` action showing Transaction Receipt Modal.
6. **Overdue Management**: 4 stat tiles (47 total overdue), delinquent records with late penalty calculation, and sound-triggered notifications.
7. **Scan & Issue / Return**: QR camera viewfinder, manual roll number/ISBN lookup, quick select test chips, and physical counter circulation workflow.
8. **Reports & Analytics**: 4 KPI cards (1,284 issues, 892 returns, 3.7% overdue rate, 3,421 readers), Top 10 Most Issued horizontal bars, and Books by Category SVG donut chart.
9. **Notifications**: Overdue warnings, registration requests, restock alerts, and maintenance announcements.
10. **Settings / Profile**: Head Librarian Dr. Rajesh Kumar profile form with employee ID `LIB001`, department preferences, and system toggles.

### 🤖 2. Lyra AI Assistant ✨
- Cute librarian persona **Lyra ✨** with custom avatar.
- Mood-based book recommendations (*Deep Focus*, *Curious*, *Stressed*, *Placement Prep*, *Geek*).
- Natural language queries, quick add-to-wishlist triggers, and voice search input.

### 🎧 3. LibraX Study Haven (Virtual Focus Room)
- **Web Audio API Procedural Soundscapes**: 100% client-side synthesis of Monsoon Rain, Hearth Fireplace, and 432Hz Binaural Alpha Waves (zero MP3 download latency).
- **Circular Pomodoro Timer**: Preset focus modes (Deep Focus, Flow Sprint, Short Break, Zen Meditation).
- **5 Dynamic Themes**: Obsidian Cyber, Matcha Zen, Espresso Library, Sapphire Midnight.

---

## 🔑 Demo Access Accounts

Use the **🚀 Demo Accounts** tab on the login page for one-click access:

| Role | Name | ID / Email | Password | Access Level |
|---|---|---|---|---|
| **📚 Head Librarian** | Dr. Rajesh Kumar | `rajesh.kumar@srmist.edu.in` | `librarian123` | Full 10-Screen Administrative Portal |
| **🎓 Student (Verified)** | Sautrik Roy | `sr2025@srmist.edu.in` | `student123` | Personal Student Portal & Study Haven |
| **🎓 Student** | Ananya Sharma | `as2025@srmist.edu.in` | `student123` | Personal Student Portal |
| **🎓 Student** | Vikram Kumar | `vk2025@srmist.edu.in` | `student123` | Personal Student Portal |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone Repository
```bash
git clone https://github.com/sautrikroy17/nscc-library.git
cd nscc-library
```

### 2. Start Backend
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:4000 (SQLite database auto-initializes)
```

### 3. Start Frontend
```bash
cd ../client
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.  
Copyright (c) 2026 Sautrik Roy.
