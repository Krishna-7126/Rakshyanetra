// src/pages/AIPrediction.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  Brain, AlertTriangle, CheckCircle, Shield, Activity,
  TrendingDown, TrendingUp, Zap,
} from 'lucide-react';

// ── Status helpers ────────────────────────────────────────────
const SC = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const statusColor = (s) => SC[s] ?? SC.normal;

// ── Neural Canvas (animated connecting-dots background) ───────
function NeuralCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const N = 55;
    const dots = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r:  Math.random() * 1.2 + 0.4,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 110) * 0.13})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.30)';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none opacity-70" />;
}

// ── Linear regression (least squares) ────────────────────────
function linReg(ys) {
  const n = ys.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 100 };
  const sx  = (n * (n - 1)) / 2;
  const sx2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const sy  = ys.reduce((s, v) => s + v, 0);
  const sxy = ys.reduce((s, v, i) => s + i * v, 0);
  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  return { slope, intercept: (sy - slope * sx) / n };
}

// ── Forecast label ────────────────────────────────────────────
const MAINT_THRESHOLD = 40;
function forecastLabel(slope, lastScore, readingIntervalSec = 2) {
  if (slope >= 0) return { text: '📈 Stable / Improving — Maintenance Not Required', color: '#10B981' };
  const steps = (lastScore - MAINT_THRESHOLD) / Math.abs(slope);
  const sec   = steps * readingIntervalSec;
  if (sec > 7 * 86400) return { text: 'Forecast: Stable for 7+ days', color: '#10B981' };
  if (sec > 86400)     return { text: `Forecast: Maintenance in ~${Math.round(sec / 86400)} day(s)`, color: '#F59E0B' };
  if (sec > 3600)      return { text: `⚠ Warning: Threshold breach in ~${Math.round(sec / 3600)} hour(s)`, color: '#F59E0B' };
  return { text: `🚨 CRITICAL: Breach imminent (~${Math.round(sec / 60)} min)`, color: '#EF4444' };
}

// ── Anomaly confidence ────────────────────────────────────────
function calcConfidence(base, top, diff) {
  const checks = [
    [(base?.vib_rms     ?? 0) > 0.8,  20, 'Base vibration elevated'],
    [(top?.vib_rms      ?? 0) > 0.8,  20, 'Top vibration elevated'],
    [(diff?.vib_ratio   ?? 0) > 2.0,  25, 'High differential ratio (resonance risk)'],
    [(top?.tilt_x       ?? 0) > 8 || (top?.tilt_y ?? 0) > 8, 15, 'Tilt exceeds safety band'],
    [(base?.stress_proxy ?? 0) > 0.15, 15, 'Stress proxy above threshold'],
    [!!(base?.sustained || top?.sustained), 5, 'Sustained alert active'],
  ];
  const triggered = checks.filter(([cond]) => cond);
  return {
    score:   Math.min(triggered.reduce((s, [, w]) => s + w, 0), 99),
    reasons: triggered.map(([, , r]) => r),
  };
}

// ── Auto engineering report ───────────────────────────────────
function genReport(base, top, diff, alerts, baseOnline, topOnline) {
  const lines = [];
  const status = alerts?.building_status ?? 'normal';
  const health = alerts?.health_score    ?? 100;
  const ratio  = diff?.vib_ratio         ?? 0;

  if (!baseOnline && !topOnline)
    return [{ t: 'crit', txt: 'Both sensor nodes offline. No structural data available. Verify ESP32 power supply and WiFi connectivity.' }];
  if (!baseOnline)
    lines.push({ t: 'warn', txt: '⚠ Base Node offline. Foundation monitoring suspended. Top-floor data still available.' });
  if (!topOnline)
    lines.push({ t: 'warn', txt: '⚠ Top Node offline. Tilt and upper-floor vibration monitoring suspended.' });

  if (status === 'normal' && health > 75)
    lines.push({ t: 'ok', txt: `System nominal. Health index: ${health}/100. Micro-vibrations at Base Node are within standard environmental parameters. No structural concerns observed.` });
  if ((base?.vib_rms ?? 0) > 0.8 && baseOnline)
    lines.push({ t: 'warn', txt: `Elevated base vibration (${base.vib_rms.toFixed(3)} g). Monitor for sustained excitation above 1.0 g. Inspect for ground-floor machinery or traffic-induced resonance.` });
  if (ratio > 2 && baseOnline && topOnline)
    lines.push({ t: 'warn', txt: `High Top-to-Base vibration ratio (${ratio.toFixed(2)}×). Suggests resonance amplification at upper floors. Recommend immediate dampener inspection and occupant load review.` });
  if (((top?.tilt_x ?? 0) > 5 || (top?.tilt_y ?? 0) > 5) && topOnline)
    lines.push({ t: 'warn', txt: `Structural inclination detected — Tilt X: ${(top?.tilt_x ?? 0).toFixed(2)}°, Tilt Y: ${(top?.tilt_y ?? 0).toFixed(2)}°. Approaching alert threshold. Schedule geodetic baseline survey.` });
  if ((base?.stress_proxy ?? 0) > 0.15 && baseOnline)
    lines.push({ t: 'warn', txt: `Stress proxy elevated (${base.stress_proxy.toFixed(4)}). Indicative of recurring dynamic loading. Review occupancy patterns and wind load history.` });
  if ((base?.sustained || top?.sustained))
    lines.push({ t: 'crit', txt: 'Sustained alert active. Threshold breaches are not transient — initiate structural inspection protocol per IS 1893 guidelines.' });
  if (status === 'critical')
    lines.push({ t: 'crit', txt: `CRITICAL: AI health index dropped to ${health}/100. Immediate intervention required. Evacuate non-essential personnel and dispatch structural engineer.` });
  if (lines.length === 0)
    lines.push({ t: 'ok', txt: `Health score ${health}/100. All parameters within operational envelope. Continue standard monitoring at current intervals.` });
  return lines;
}

// ── Chart tooltips ────────────────────────────────────────────
const HealthTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs min-w-[140px]">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.filter(p => p.value != null).map(p => (
        <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-3">
          <span>{p.name}</span><span>{Number(p.value).toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
};

const RadarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────
const MAX_HIST = 50;

export default function AIPrediction() {
  const { data, baseOnline, topOnline, alertHistory } = useApp();
  const { base, top, diff, alerts } = data;

  // Track health_score over time (ts-gated)
  const [healthHist, setHealthHist] = useState([]);
  const histRef     = useRef([]);
  const lastTsRef   = useRef(0);

  useEffect(() => {
    const ts    = base?.ts ?? top?.ts ?? 0;
    const score = alerts?.health_score ?? null;
    if (score == null || ts <= lastTsRef.current) return;
    lastTsRef.current = ts;
    const entry = { time: new Date().toLocaleTimeString('en-IN', { hour12: false }), score };
    histRef.current = [...histRef.current, entry].slice(-MAX_HIST);
    setHealthHist([...histRef.current]);
  }, [alerts?.health_score, base?.ts, top?.ts]);

  // Forecast computation
  const { chartData, fc } = useMemo(() => {
    if (healthHist.length < 3) {
      return { chartData: healthHist.map(h => ({ ...h, forecast: null })), fc: { text: 'Insufficient data for forecast', color: '#6B7280' } };
    }
    const scores = healthHist.map(h => h.score);
    const { slope } = linReg(scores);
    const last      = scores[scores.length - 1];
    const fc        = forecastLabel(slope, last);

    const histPts = healthHist.map((h, i) => ({
      ...h,
      forecast: i === healthHist.length - 1 ? h.score : null, // connect at join
    }));
    const futurePts = Array.from({ length: 15 }, (_, i) => ({
      time:     `+${(i + 1) * 2}s`,
      score:    null,
      forecast: Math.max(0, Math.min(100, last + slope * (i + 1))),
    }));
    return { chartData: [...histPts, ...futurePts], fc };
  }, [healthHist]);

  // Radar data (normalize to 0-100)
  const radarData = useMemo(() => {
    const n = (v, max) => Math.min(Math.round((Math.abs(v) / max) * 100), 100);
    return [
      { subject: 'Base Vib',   live: n(baseOnline ? (base?.vib_rms ?? 0)      : 0, 2),    safe: 50, fullMark: 100 },
      { subject: 'Top Vib',    live: n(topOnline  ? (top?.vib_rms  ?? 0)      : 0, 2),    safe: 50, fullMark: 100 },
      { subject: 'Tilt X',     live: n(topOnline  ? (top?.tilt_x   ?? 0)      : 0, 30),   safe: 50, fullMark: 100 },
      { subject: 'Tilt Y',     live: n(topOnline  ? (top?.tilt_y   ?? 0)      : 0, 30),   safe: 50, fullMark: 100 },
      { subject: 'Stress',     live: n(baseOnline ? (base?.stress_proxy ?? 0) : 0, 0.3),  safe: 50, fullMark: 100 },
      { subject: 'Diff Ratio', live: n(diff?.vib_ratio ?? 0, 5),                           safe: 50, fullMark: 100 },
    ];
  }, [base, top, diff, baseOnline, topOnline]);

  // Confidence + report
  const bStatus  = alerts?.building_status ?? 'normal';
  const health   = alerts?.health_score    ?? 0;
  const { score: confidence, reasons } = useMemo(() => calcConfidence(base, top, diff), [base, top, diff]);
  const report   = useMemo(() => genReport(base, top, diff, alerts, baseOnline, topOnline), [base, top, diff, alerts, baseOnline, topOnline]);

  const slope = healthHist.length >= 3 ? linReg(healthHist.map(h => h.score)).slope : 0;

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Brain size={18} className="text-violet-400" />
        <h2 className="text-lg font-semibold text-slate-200">AI Structural Prediction</h2>
        <span className="text-xs text-slate-500 ml-2">Deep Learning Simulation · Predictive Maintenance Engine</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
          <span className="text-[10px] text-violet-400 font-bold tracking-widest">NEURAL ENGINE ACTIVE</span>
        </div>
      </div>

      {/* ── Row 1: Forecast + Radar ── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">

        {/* Predictive Maintenance Forecaster */}
        <div
          className="glass-card flex-1 p-4 flex flex-col relative overflow-hidden"
          style={{ borderColor: '#4C1D95', boxShadow: '0 0 24px rgba(139,92,246,0.14)' }}
        >
          <NeuralCanvas />
          <div className="relative z-10 flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-200">Predictive Maintenance Forecaster</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Linear regression on health_score · 15-step extrapolation · threshold = {MAINT_THRESHOLD}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="flex items-center gap-1.5 justify-end">
                {slope < -0.1 ? <TrendingDown size={12} style={{ color: fc.color }} /> : <TrendingUp size={12} style={{ color: fc.color }} />}
                <span className="num text-[11px] font-bold" style={{ color: fc.color }}>{fc.text}</span>
              </div>
              <p className="text-[9px] text-slate-600 mt-0.5">
                Trend slope: <span className="num" style={{ color: slope < 0 ? '#EF4444' : '#10B981' }}>{slope.toFixed(3)} pts/reading</span>
              </p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 8, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 10 }} width={28} />
                <Tooltip content={<HealthTip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#6B7280' }} />
                <ReferenceLine
                  y={MAINT_THRESHOLD}
                  stroke="#EF4444" strokeDasharray="4 6" strokeWidth={1}
                  label={{ value: 'Maint.', fill: '#EF4444', fontSize: 8, position: 'insideTopLeft' }}
                />
                <Area
                  type="monotone" dataKey="score" name="Health Score"
                  stroke="#8B5CF6" strokeWidth={2} fill="url(#healthGrad)"
                  dot={false} connectNulls={false} isAnimationActive={false}
                />
                <Line
                  type="monotone" dataKey="forecast" name="Forecast"
                  stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="7 4"
                  dot={false} connectNulls={true} isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Structural Resonance Radar */}
        <div
          className="glass-card w-full lg:w-72 flex-shrink-0 p-4 flex flex-col"
          style={{ borderColor: '#1E3A5F', boxShadow: '0 0 16px rgba(59,130,246,0.10)' }}
        >
          <p className="text-sm font-semibold text-slate-200 mb-0.5">Structural Resonance Radar</p>
          <p className="text-[10px] text-slate-500 mb-2">
            Live values <span className="text-blue-400">●</span> vs safe-zone <span className="text-emerald-500">●</span> (0–100)
          </p>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData} margin={{ top: 4, right: 18, left: 18, bottom: 0 }}>
                <PolarGrid stroke="#1F2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 9 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Safe Zone" dataKey="safe"
                  stroke="#10B981" fill="#10B981" fillOpacity={0.07}
                  strokeWidth={1} strokeDasharray="4 3"
                />
                <Radar name="Live"     dataKey="live"
                  stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.22}
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.55))' }}
                />
                <Tooltip content={<RadarTip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#6B7280' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 2: Confidence Matrix + Engineering Report ── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* Anomaly Confidence Matrix */}
        <div
          className="glass-card w-full lg:w-60 flex-shrink-0 p-4 flex flex-col"
          style={{
            borderColor: bStatus === 'critical' ? '#7F1D1D' : bStatus === 'warning' ? '#78350F' : '#1F2937',
            boxShadow:   bStatus === 'critical' ? '0 0 20px rgba(239,68,68,0.16)' : bStatus === 'warning' ? '0 0 16px rgba(245,158,11,0.10)' : 'none',
          }}
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Anomaly Confidence Matrix</p>

          {/* Confidence ring */}
          <div className="flex flex-col items-center mb-3">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={statusColor(bStatus)} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(confidence / 100) * 251.2} 251.2`}
                  style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${statusColor(bStatus)}80)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="num text-2xl font-bold" style={{ color: statusColor(bStatus) }}>{confidence}</span>
                <span className="text-[9px] text-slate-500 tracking-wider">% CONF.</span>
              </div>
            </div>
            <p className="num text-xs font-bold mt-1.5 uppercase tracking-wide" style={{ color: statusColor(bStatus) }}>
              {bStatus === 'critical' ? '⚡ Anomaly Detected'
                : bStatus === 'warning' ? '⚠ Monitor Closely'
                : '✓ Nominal'}
            </p>
          </div>

          {/* Triggers */}
          <div className="flex-1 overflow-y-auto space-y-1.5 mb-3">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1.5">Active Triggers</p>
            {reasons.length === 0 ? (
              <p className="text-emerald-500 text-[11px] flex items-center gap-1.5">
                <CheckCircle size={10} /> All thresholds clear
              </p>
            ) : reasons.map((r, i) => (
              <p key={i} className="text-red-400 text-[10px] flex items-start gap-1.5 leading-tight">
                <AlertTriangle size={9} className="flex-shrink-0 mt-0.5" /> {r}
              </p>
            ))}
          </div>

          {/* Node status */}
          <div className="border-t border-gray-800 pt-2.5 space-y-1.5 text-[10px]">
            {[
              ['Base', baseOnline, alerts?.base_status ?? 'normal'],
              ['Top',  topOnline,  alerts?.top_status  ?? 'normal'],
            ].map(([label, online, stat]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-slate-500">{label} Node</span>
                <span style={{ color: online ? statusColor(stat) : '#EF4444' }} className="flex items-center gap-1">
                  {online ? <CheckCircle size={9} /> : <AlertTriangle size={9} />}
                  {online ? stat.toUpperCase() : 'OFFLINE'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Health Score</span>
              <span className="num font-bold" style={{ color: statusColor(bStatus) }}>{health} / 100</span>
            </div>
          </div>
        </div>

        {/* Live AI Insights */}
        <div
          className="glass-card flex-1 p-4 flex flex-col"
          style={{ borderColor: '#1F2937', boxShadow: '0 0 16px rgba(139,92,246,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield size={13} className="text-violet-400" />
            <p className="text-sm font-semibold text-slate-200">Live AI Insights</p>
            <span className="text-[9px] text-violet-400 border border-violet-500/30 bg-violet-500/5
                             px-1.5 py-0.5 rounded tracking-widest ml-1">
              AUTO-GENERATED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0">
            {report.map((line, i) => {
              const cfg =
                line.t === 'crit' ? { bg: 'bg-red-500/5',    border: 'border-red-500/25',    text: 'text-red-300',    Icon: AlertTriangle } :
                line.t === 'warn' ? { bg: 'bg-amber-500/5',  border: 'border-amber-500/20',  text: 'text-amber-200',  Icon: Activity } :
                                    { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-300', Icon: CheckCircle };
              return (
                <div key={i} className={`flex gap-2.5 p-3 rounded-xl text-xs leading-relaxed border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                  <cfg.Icon size={12} className="flex-shrink-0 mt-0.5" />
                  <span>{line.txt}</span>
                </div>
              );
            })}
          </div>

          {/* Spike event log */}
          {alertHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Zap size={9} /> Spike Event Log (session)
              </p>
              <div className="space-y-1.5 max-h-20 overflow-y-auto">
                {alertHistory.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-start gap-2 text-[10px]">
                    <span className="text-slate-600 font-mono flex-shrink-0">{a.ts}</span>
                    <span className="text-red-400 leading-tight">{a.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
