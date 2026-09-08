import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  Sparkles, 
  QrCode, 
  ArrowUpRight, 
  Activity,
  FileSpreadsheet,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { stats as statsApi, exportData as exportApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
  }),
};

// Interactive Animated Stat Card
function StatCard({ icon: Icon, label, value, subtext, color, index, trend }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`stat-card ${color}`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className={`stat-icon ${color}`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
        {trend && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            background: 'rgba(16,185,129,0.12)',
            color: 'var(--accent-bright)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>

      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label" style={{ fontWeight: 600, letterSpacing: '-0.1px' }}>{label}</div>
      {subtext && (
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>
          {subtext}
        </div>
      )}
    </motion.div>
  );
}

// Live Overdue Row
function OverdueRow({ book, index, onCollect }) {
  const days = book.overdue_days || 0;
  const fine = days * 5;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <td>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>{book.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{book.author} · <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{book.id}</span></div>
      </td>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{book.borrower_name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>{book.borrower_reg}</div>
      </td>
      <td>
        <span className="badge badge-danger overdue-blink" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <AlertTriangle size={11} />
          {days} day{days !== 1 ? 's' : ''} overdue
        </span>
      </td>
      <td>
        <div style={{ color: 'var(--danger)', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
          ₹{fine}
        </div>
      </td>
    </motion.tr>
  );
}

// Category Distribution Bar
function CategoryBar({ name, count, totalCopies }) {
  const pct = totalCopies > 0 ? Math.round((count / totalCopies) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{name}</span>
        <span style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          {count} <span style={{ color: 'var(--text-4)', fontSize: 11 }}>({pct}%)</span>
        </span>
      </div>
      <div className="progress-bar" style={{ height: 7, background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ 
            background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
            boxShadow: '0 0 10px rgba(16,185,129,0.3)'
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate = () => {} }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      statsApi.get().then(setData).catch(() => {});
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = (type) => {
    playClick();
    if (type === 'excel') exportApi.excel();
    else exportApi.csv();
    toast.success(`Exporting transaction ledger as ${type.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="spinner spinner-lg" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  const ov = data?.overview || {};
  const overdueList = data?.overdue_books || [];
  const categories = data?.by_category || [];
  const totalCopies = ov.total_copies || 112;
  const availRatio = totalCopies > 0 ? Math.round(((ov.available_copies || 0) / totalCopies) * 100) : 0;

  return (
    <div className="page">
      {/* ── High-Impact Command Center Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 50%, rgba(15,22,35,0.7) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--r-2xl)',
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Background ambient beam */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--accent-bright)',
                background: 'rgba(16,185,129,0.15)',
                padding: '3px 10px',
                borderRadius: 20,
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} className="glow-pulse" />
                CENTRAL COMMAND NODE
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                NSCC · SRM Institute of Science and Technology
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: '-0.8px',
              color: 'var(--text)',
              marginBottom: 8,
              lineHeight: 1.2
            }}>
              Welcome back, <span style={{
                background: 'linear-gradient(135deg, #34d399, #10b981, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{user?.name}</span>
            </h1>

            <p style={{ fontSize: 13.5, color: 'var(--text-2)', maxWidth: 620, lineHeight: 1.5 }}>
              Library operations are operating at <strong style={{ color: 'var(--accent-bright)' }}>{availRatio}% shelf availability</strong>. 
              {ov.overdue_count > 0 ? ` ${ov.overdue_count} books require overdue intervention.` : ' Zero overdue anomalies detected.'}
            </p>
          </div>

          {/* Quick Action Ribbon */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { playClick(); onNavigate('ai'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 0 20px rgba(6,182,212,0.3)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={16} />
              <span>Ask AI Assistant</span>
            </motion.button>

            {user?.role === 'librarian' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playClick(); onNavigate('scanner'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 'var(--r-md)',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={16} />
                <span>QR Scanner</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { playClick(); onNavigate('catalog'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              <BookOpen size={16} />
              <span>Catalog</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── High-Tech KPI Stat Cards Grid ── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={BookOpen}
          label="Unique Book Titles"
          value={ov.total_books}
          subtext="15 Technical Disciplines"
          color="emerald"
          index={0}
          trend="+100% ACID DB"
        />
        <StatCard
          icon={Layers}
          label="Total Physical Volumes"
          value={ov.total_copies}
          subtext={`${ov.available_copies} Ready on Shelf`}
          color="cyan"
          index={1}
          trend={`${availRatio}% in stock`}
        />
        <StatCard
          icon={Activity}
          label="Active Circulation"
          value={ov.issued_count}
          subtext="Currently on Loan"
          color="purple"
          index={2}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Alert Ticker"
          value={ov.overdue_count}
          subtext={ov.overdue_count > 0 ? "Requires Settle Action" : "All Accounts Clear"}
          color={ov.overdue_count > 0 ? "danger" : "emerald"}
          index={3}
        />
        <StatCard
          icon={IndianRupee}
          label="Collected Penalties"
          value={`₹${ov.fines_collected || 0}`}
          subtext={`₹${(ov.fines_total || 0) - (ov.fines_collected || 0)} Pending`}
          color="warning"
          index={4}
          trend="₹5 / Day Rate"
        />
      </div>

      {/* ── Main Operations Row: Overdue Radar + Category Distribution ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Overdue Monitoring Station */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldAlert size={18} color="var(--danger)" />
              <span>Critical Overdue Loans</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-danger">
                {overdueList.length} Active
              </span>
              {user?.role === 'librarian' && (
                <button
                  onClick={() => { playClick(); onNavigate('admin'); }}
                  style={{
                    fontSize: 11.5,
                    color: 'var(--accent-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  <span>Resolve in Admin</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {overdueList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-3)' }}>
                <CheckCircle2 size={36} color="var(--accent)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Zero Overdue Violations</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>All issued books are within their active loan periods.</div>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book Information</th>
                      <th>Borrower</th>
                      <th>Overdue Status</th>
                      <th>Fine (₹5/day)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueList.map((b, i) => (
                      <OverdueRow key={b.id || i} book={b} index={i} onCollect={() => onNavigate('admin')} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution Analytics */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="var(--cyan)" />
              <span>Catalog Distribution</span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
              {categories.length} Categories
            </span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories.slice(0, 7).map(c => (
              <CategoryBar key={c.category} name={c.category} count={c.count} totalCopies={totalCopies} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Data Export Strip ── */}
      {user?.role === 'librarian' && (
        <div className="card" style={{ padding: '18px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-bright)'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Institutional Ledger Export</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Download full auditable circulation history and overdue records</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-outline"
              onClick={() => handleExport('csv')}
              style={{ fontSize: 12.5 }}
            >
              Export CSV (.csv)
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleExport('excel')}
              style={{ fontSize: 12.5 }}
            >
              Export Formatted Excel (.xlsx)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
