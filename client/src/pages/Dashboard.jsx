import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingDown,
  ShieldAlert,
  BarChart3,
  LineChart,
  RotateCcw,
  Calendar,
  Zap,
  Info
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

// Interactive Day-Wise Circulation & Return Analytics Graph
function CirculationChart({ dailyActivity = [] }) {
  const [range, setRange] = useState('7d'); // '7d' | '14d'
  const [chartType, setChartType] = useState('bars'); // 'bars' | 'spline'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showLedger, setShowLedger] = useState(false);

  // Safe fallback if server has not completed initial query or for offline test
  const fallbackDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      issued: 0,
      returned: 0,
      net: 0
    };
  });

  const rawData = dailyActivity && dailyActivity.length > 0 ? dailyActivity : fallbackDays;
  const activeData = range === '7d' ? rawData.slice(-7) : rawData.slice(-14);

  // Aggregations
  const totalIssued = activeData.reduce((acc, d) => acc + (d.issued || 0), 0);
  const totalReturned = activeData.reduce((acc, d) => acc + (d.returned || 0), 0);
  const netDelta = totalIssued - totalReturned;
  const clearanceRate = totalIssued > 0 ? Math.round((totalReturned / totalIssued) * 100) : 100;
  
  // Peak value for scaling Y-axis
  const maxVal = Math.max(...activeData.map(d => Math.max(d.issued || 0, d.returned || 0)), 2) + 0.5;

  // SVG dimensions for Spline Wave mode
  const svgWidth = 720;
  const svgHeight = 200;
  const padX = 36;
  const padY = 24;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const pointsIssued = activeData.map((d, i) => {
    const x = padX + (i / Math.max(activeData.length - 1, 1)) * chartW;
    const y = padY + chartH - ((d.issued || 0) / maxVal) * chartH;
    return { x, y, val: d.issued, data: d };
  });

  const pointsReturned = activeData.map((d, i) => {
    const x = padX + (i / Math.max(activeData.length - 1, 1)) * chartW;
    const y = padY + chartH - ((d.returned || 0) / maxVal) * chartH;
    return { x, y, val: d.returned, data: d };
  });

  // Cubic Bezier Spline Path Generator
  const createSplinePath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const pathIssued = createSplinePath(pointsIssued);
  const pathReturned = createSplinePath(pointsReturned);

  const areaIssued = pointsIssued.length > 0 
    ? `${pathIssued} L ${pointsIssued[pointsIssued.length - 1].x} ${padY + chartH} L ${pointsIssued[0].x} ${padY + chartH} Z` 
    : '';
  const areaReturned = pointsReturned.length > 0 
    ? `${pathReturned} L ${pointsReturned[pointsReturned.length - 1].x} ${padY + chartH} L ${pointsReturned[0].x} ${padY + chartH} Z` 
    : '';

  return (
    <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
      {/* Chart Control Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={20} color="var(--accent-bright)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
                Circulation & Return Velocity
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-bright)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                Day-Wise Telemetry
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              Track daily checkout volume vs. check-in returns with net circulation flow
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Time Range Selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 22, 35, 0.6)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid var(--border)'
          }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '14d', label: '14 Days' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => { playClick(); setRange(r.id); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: range === r.id ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: range === r.id ? 'var(--accent)' : 'transparent',
                  color: range === r.id ? '#ffffff' : 'var(--text-3)',
                  transition: 'all 150ms'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Chart Style Selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 22, 35, 0.6)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => { playClick(); setChartType('bars'); }}
              title="Dual Velocity Bars"
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: chartType === 'bars' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: chartType === 'bars' ? '#ffffff' : 'var(--text-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <BarChart3 size={15} />
            </button>
            <button
              onClick={() => { playClick(); setChartType('spline'); }}
              title="Luminous Spline Waves"
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: chartType === 'spline' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: chartType === 'spline' ? '#ffffff' : 'var(--text-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <LineChart size={15} />
            </button>
          </div>

          {/* Ledger Toggle */}
          <button
            onClick={() => { playClick(); setShowLedger(!showLedger); }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: showLedger ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 22, 35, 0.6)',
              color: showLedger ? 'var(--accent-bright)' : 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 150ms'
            }}
          >
            <Calendar size={13} />
            <span>{showLedger ? 'Hide Ledger' : 'View Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Mini Telemetry Chips Row */}
      <div style={{
        padding: '14px 24px',
        background: 'rgba(15, 22, 35, 0.3)',
        borderBottom: '1px solid var(--border-soft)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            Books Issued
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
            {totalIssued} volumes
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
            Books Returned
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#06b6d4', marginTop: 2 }}>
            {totalReturned} volumes
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Net Circulation Flow
          </div>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 800, 
            color: netDelta >= 0 ? 'var(--text)' : '#34d399', 
            marginTop: 2 
          }}>
            {netDelta > 0 ? `+${netDelta}` : netDelta} delta
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Clearance Efficiency
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: clearanceRate >= 80 ? '#34d399' : '#f59e0b', marginTop: 2 }}>
            {clearanceRate}% rate
          </div>
        </div>
      </div>

      {/* Main Graph Visualization Stage */}
      <div style={{ padding: '24px 20px 16px', position: 'relative' }}>
        {chartType === 'bars' ? (
          /* ── DUAL BAR CHART VIEW ── */
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            height: 200,
            paddingTop: 24,
            paddingBottom: 28,
            position: 'relative'
          }}>
            {/* Horizontal Grid Baseline */}
            <div style={{
              position: 'absolute',
              bottom: 28,
              left: 0,
              right: 0,
              height: 1,
              background: 'var(--border)'
            }} />

            {activeData.map((d, i) => {
              const isHovered = hoveredIndex === i;
              const isToday = i === activeData.length - 1;
              const issueHeightPct = Math.max(((d.issued || 0) / maxVal) * 100, 4);
              const returnHeightPct = Math.max(((d.returned || 0) / maxVal) * 100, 4);

              return (
                <div
                  key={d.date || i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Floating Hover Indicator Pill */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: -6 }}
                      style={{
                        position: 'absolute',
                        bottom: '105%',
                        background: 'rgba(15, 22, 35, 0.96)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(16, 185, 129, 0.2)',
                        padding: '6px 12px',
                        borderRadius: 8,
                        whiteSpace: 'nowrap',
                        zIndex: 20,
                        pointerEvents: 'none',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                        {d.day}, {d.label} {isToday ? '(Today)' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                        <span style={{ color: '#10b981' }}>Issued: {d.issued}</span>
                        <span style={{ color: '#06b6d4' }}>Returned: {d.returned}</span>
                        <span style={{ color: d.net >= 0 ? '#34d399' : '#f59e0b' }}>
                          Net: {d.net > 0 ? `+${d.net}` : d.net}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Twin Bars Container */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 4,
                    width: '100%',
                    maxWidth: 36,
                    height: '100%',
                    justifyContent: 'center',
                    paddingBottom: 2
                  }}>
                    {/* Issued Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${issueHeightPct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        flex: 1,
                        background: isHovered 
                          ? 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' 
                          : 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.4) 100%)',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: isHovered ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
                        transition: 'all 150ms'
                      }}
                    />

                    {/* Returned Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${returnHeightPct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.02 + 0.05, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        flex: 1,
                        background: isHovered 
                          ? 'linear-gradient(180deg, #22d3ee 0%, #06b6d4 100%)' 
                          : 'linear-gradient(180deg, #06b6d4 0%, rgba(6, 182, 212, 0.4) 100%)',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: isHovered ? '0 0 12px rgba(6, 182, 212, 0.6)' : 'none',
                        transition: 'all 150ms'
                      }}
                    />
                  </div>

                  {/* Day Label */}
                  <div style={{
                    position: 'absolute',
                    bottom: 4,
                    fontSize: 10.5,
                    fontWeight: isToday ? 800 : (isHovered ? 700 : 500),
                    color: isToday ? 'var(--accent-bright)' : (isHovered ? 'var(--text)' : 'var(--text-4)'),
                    transition: 'color 150ms',
                    whiteSpace: 'nowrap'
                  }}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LUMINOUS SPLINE WAVE VIEW ── */
          <div style={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
            {/* Floating Spline Tooltip */}
            {hoveredIndex !== null && activeData[hoveredIndex] && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  left: `${(pointsIssued[hoveredIndex].x / svgWidth) * 100}%`,
                  top: 0,
                  transform: 'translateX(-50%)',
                  background: 'rgba(15, 22, 35, 0.96)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(16, 185, 129, 0.25)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  whiteSpace: 'nowrap',
                  zIndex: 30,
                  pointerEvents: 'none',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  {activeData[hoveredIndex].day}, {activeData[hoveredIndex].label} {hoveredIndex === activeData.length - 1 ? '(Today)' : ''}
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ color: '#10b981' }}>Issued: {activeData[hoveredIndex].issued}</span>
                  <span style={{ color: '#06b6d4' }}>Returned: {activeData[hoveredIndex].returned}</span>
                  <span style={{ color: activeData[hoveredIndex].net >= 0 ? '#34d399' : '#f59e0b' }}>
                    Net: {activeData[hoveredIndex].net > 0 ? `+${activeData[hoveredIndex].net}` : activeData[hoveredIndex].net}
                  </span>
                </div>
              </motion.div>
            )}

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: '100%', height: 'auto', minWidth: 500, overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="gradIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = padY + chartH * (1 - ratio);
                return (
                  <line
                    key={idx}
                    x1={padX}
                    y1={y}
                    x2={svgWidth - padX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Hairline Tracking Guide on Hover */}
              {hoveredIndex !== null && pointsIssued[hoveredIndex] && (
                <line
                  x1={pointsIssued[hoveredIndex].x}
                  y1={padY}
                  x2={pointsIssued[hoveredIndex].x}
                  y2={padY + chartH}
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeDasharray="3 3"
                />
              )}

              {/* Area Fills */}
              <motion.path
                d={areaIssued}
                fill="url(#gradIssued)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.path
                d={areaReturned}
                fill="url(#gradReturned)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />

              {/* Stroke Lines */}
              <motion.path
                d={pathIssued}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <motion.path
                d={pathReturned}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />

              {/* Interactive Point Markers */}
              {pointsIssued.map((pt, i) => (
                <circle
                  key={`pt-iss-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === i ? 6 : 4}
                  fill="#10b981"
                  stroke="#080c14"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 150ms' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}

              {pointsReturned.map((pt, i) => (
                <circle
                  key={`pt-ret-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === i ? 6 : 4}
                  fill="#06b6d4"
                  stroke="#080c14"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 150ms' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}

              {/* Labels below chart */}
              {pointsIssued.map((pt, i) => (
                <text
                  key={`label-${i}`}
                  x={pt.x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  fill={hoveredIndex === i ? '#ffffff' : 'var(--text-4)'}
                  fontSize="10"
                  fontWeight={hoveredIndex === i ? '700' : '500'}
                  fontFamily="Inter, sans-serif"
                >
                  {pt.data.day}
                </text>
              ))}
            </svg>
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          paddingTop: 12,
          borderTop: '1px solid var(--border-soft)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)' }} />
            <span>Books Issued (Loans)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)' }} />
            <span>Books Returned (Check-ins)</span>
          </div>
        </div>

        {/* Expandable Day-by-Day Circulation Ledger */}
        <AnimatePresence>
          {showLedger && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: 16 }}
            >
              <div style={{
                background: 'rgba(15, 22, 35, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    Daily Circulation Activity Ledger ({range === '7d' ? '7-Day Span' : '14-Day Span'})
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {activeData.length} timeline dates tracked
                  </span>
                </div>

                <div className="table-wrapper" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Date & Day</th>
                        <th>Books Issued</th>
                        <th>Books Returned</th>
                        <th>Net Flow</th>
                        <th>Activity Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeData.map((row, idx) => (
                        <tr key={row.date || idx}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                              {row.day}, {row.label}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace' }}>
                              {row.date}
                            </div>
                          </td>
                          <td>
                            <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                              +{row.issued}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#06b6d4', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                              {row.returned}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              fontFamily: 'JetBrains Mono, monospace',
                              color: row.net > 0 ? '#10b981' : (row.net < 0 ? '#06b6d4' : 'var(--text-3)')
                            }}>
                              {row.net > 0 ? `+${row.net}` : row.net}
                            </span>
                          </td>
                          <td>
                            {row.issued > row.returned && (
                              <span className="badge badge-success" style={{ fontSize: 10 }}>Net Outflow</span>
                            )}
                            {row.returned > row.issued && (
                              <span className="badge badge-info" style={{ fontSize: 10 }}>Return Surge</span>
                            )}
                            {row.issued === row.returned && (row.issued > 0) && (
                              <span className="badge badge-warning" style={{ fontSize: 10 }}>Balanced Flow</span>
                            )}
                            {row.issued === 0 && row.returned === 0 && (
                              <span style={{ color: 'var(--text-4)', fontSize: 11 }}>Dormant / Holiday</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Live Overdue Row
function OverdueRow({ book, index }) {
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

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
  const categories = data?.category_stats || data?.by_category || [];
  const dailyActivity = data?.daily_activity || [];
  const totalCopies = ov.total_copies || 112;
  const availRatio = totalCopies > 0 ? Math.round(((ov.available_copies || 0) / totalCopies) * 100) : 0;

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
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
              
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--text-3)',
                background: 'rgba(15, 22, 35, 0.6)',
                padding: '3px 10px',
                borderRadius: 20,
                border: '1px solid var(--border)'
              }}>
                <Clock size={12} color="var(--accent-bright)" />
                <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
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
              Library operations are running at <strong style={{ color: 'var(--accent-bright)' }}>{availRatio}% shelf availability</strong>. 
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

      {/* ── Visual Day-Wise Circulation & Return Velocity Graph ── */}
      <CirculationChart dailyActivity={dailyActivity} />

      {/* ── Secondary Operations Row: Overdue Radar + Category Distribution ── */}
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
                      <OverdueRow key={b.id || i} book={b} index={i} />
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
