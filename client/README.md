# 💻 LibraX Frontend (Client)

> **Modern, High-Performance React 18 & Vite 5 Single Page Application**  
> 🌐 **Production URL**: [https://librax-library.vercel.app](https://librax-library.vercel.app)

---

## 🏛️ Architecture Overview

The `client/` directory contains the entire frontend user interface for **LibraX**, architected with React 18, Vite 5, Framer Motion animations, Lucide icons, and Vanilla CSS design tokens. It implements a dual-role workflow:

1. **Librarian Administration Portal**: A comprehensive 10-screen institutional management panel for Head Librarian **Dr. Rajesh Kumar** (Employee ID: `LIB001`).
2. **Student Reader Portal**: A personalized learning hub for student **Sautrik Roy** (Reg: `RA2511003010052`) featuring browsing, borrowing history, study soundscapes, and AI book recommendations.

```
client/
├── public/                 # Static assets (Lyra avatar, favicons, logos)
├── src/
│   ├── components/         # Reusable atomic UI components
│   │   ├── BackButton.jsx        # Universal back navigation button
│   │   ├── BookCover.jsx         # Dynamic CSS book covers with colored spines
│   │   ├── BrandLogo.jsx         # Vector institutional emblem
│   │   ├── ErrorBoundary.jsx     # Graceful error catching with retry
│   │   ├── Sidebar.jsx           # Responsive desktop sidebar & mobile navigation
│   │   └── VoiceInputButton.jsx  # Speech-to-text Web Speech API mic button
│   │
│   ├── context/            # React global state providers
│   │   ├── AuthContext.jsx       # User identity (Dr. Rajesh Kumar vs. Sautrik Roy)
│   │   └── ToastContext.jsx      # Audio-reactive toasts and notifications
│   │
│   ├── data/               # Local caching & institutional seed catalog
│   │   ├── localStore.js         # Offline-first fallback persistence layer
│   │   └── seedData.js           # 30+ engineering volumes & verified user accounts
│   │
│   ├── pages/              # Primary view modules (10 Librarian & Student screens)
│   │   ├── AIAssistant.jsx       # Lyra AI Assistant with mood-based book curation
│   │   ├── AdminPanel.jsx        # Students audit, Reports, Overdue ledger, Settings
│   │   ├── Catalog.jsx           # 4-col Books catalog with Add Book modal
│   │   ├── Dashboard.jsx         # Dual-trend telemetry & circulation KPI dashboard
│   │   ├── History.jsx           # Past borrowing logs & returned book archive
│   │   ├── LoginPage.jsx         # Institutional landing page with 1-click SSO demo
│   │   ├── Notifications.jsx     # Real-time overdue alerts & campus bulletins
│   │   ├── Scanner.jsx           # QR barcode camera viewfinder & issue/return desk
│   │   ├── Settings.jsx          # Student profile & reading preferences
│   │   ├── StudyRoom.jsx         # LibraX Study Haven with 432Hz soundscapes & Pomodoro
│   │   └── Transactions.jsx      # Complete circulation history with receipt modal
│   │
│   ├── utils/              # Client-side utility engines
│   │   ├── ambientAudio.js       # Web Audio API procedural sound synthesizer
│   │   ├── audio.js              # Micro-interaction audio chimes & feedback
│   │   └── security.js           # Client-side hardening & inspect protection
│   │
│   ├── App.jsx             # Router, layout orchestration, topbar with live clock
│   ├── main.jsx            # React root mount with strict mode
│   ├── styles.css          # Design tokens, typography, glassmorphism & resets
│   └── mobile.css          # Fluid breakpoints for mobile & tablet screens
│
├── index.html              # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json            # Frontend dependencies & build scripts
└── vite.config.js          # Vite build config with vendor code-splitting
```

---

## 🎨 Key Features & Modules

### 1. 10 Screen Librarian Portal (Mockup Exact)
- **Dashboard**: Live circulation numbers, 11-bar dual trend checkout chart, today's schedule, overdue alerts with working `[Notify]` triggers.
- **Books Catalog**: 4-column card grid with ISBN lookup, category filtering, and real-time copies tracking.
- **Add New Book Modal**: Comprehensive metadata entry, cover image dropzone, and automated ISBN detail fetcher.
- **Students Management**: 8 verified student accounts table (Sautrik Roy, Ananya Sharma, Vikram Kumar, etc.) with registration modal.
- **Transactions**: Full history ledger with status pills (`Issue`, `Return`, `Renew`), CSV download, and printable receipts.
- **Overdue Management**: 4 stat tiles (47 total overdue), delinquent records with late penalty calculation, and sound-triggered notifications.
- **Scan & Issue / Return**: QR camera viewfinder, manual roll number/ISBN lookup, and physical counter circulation workflow.
- **Reports & Analytics**: 4 KPI cards (1,284 issues, 892 returns, 3.7% overdue rate, 3,421 readers), Top 10 Most Issued horizontal bars, and Books by Category SVG donut chart.
- **Notifications**: Overdue warnings, registration requests, restock alerts, and maintenance announcements.
- **Settings / Profile**: Head Librarian Dr. Rajesh Kumar profile form with employee ID `LIB001`, department preferences, and system toggles.

### 2. Lyra AI Assistant ✨
- Dedicated intelligent library companion named **Lyra ✨**.
- Mood pills (*Deep Focus*, *Curious*, *Stressed*, *Placement Prep*, *Geek*).
- Natural language book recommendations with instant wishlist triggers and voice search input.

### 3. LibraX Study Haven (Procedural Soundscapes)
- Built using the native **Web Audio API** — generates rain, hearth fireplace, and 432Hz binaural alpha brainwaves mathematically on the user's soundcard without downloading large audio files.
- Circular Pomodoro timer with 4 modes (Deep Focus, Flow Sprint, Short Break, Zen Meditation).

---

## 🛠️ Installation & Local Development

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application runs locally at `http://localhost:5173`.

---

## 📦 Production Build

```bash
# Create optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```
Output is generated in `client/dist/` with automated vendor chunk splitting for fast initial page load times.
