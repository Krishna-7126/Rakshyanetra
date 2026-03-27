// src/pages/AIPrediction.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import DashboardHeader from '../components/DashboardHeader';
import StatCardEnhanced from '../components/StatCardEnhanced';
import ChartContainer from '../components/ChartContainer';
import SectionDivider from '../components/SectionDivider';
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
const MAINT_THRESHOLD = 70;
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
    [(base?.vib_rms     ?? 0) > 0.35, 10, 'Base vibration > Warning (0.35g)'],
    [(base?.vib_rms     ?? 0) > 0.60, 20, 'Base vibration > Critical (0.60g)'],
    [(top?.vib_rms      ?? 0) > 0.35, 10, 'Top vibration > Warning (0.35g)'],
    [(top?.vib_rms      ?? 0) > 0.60, 20, 'Top vibration > Critical (0.60g)'],
    [(diff?.vib_ratio   ?? 0) > 1.5,  25, 'High differential ratio (> 1.5x)'],
    [(top?.tilt_x       ?? 0) > 3.0 || (top?.tilt_y ?? 0) > 3.0, 25, 'Tilt exceeds critical band (> 3.0°)'],
    [!!(base?.alert || top?.alert),   10, 'Native node alert triggered'],
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

  if (status === 'normal' && health >= 90)
    lines.push({ t: 'ok', txt: `System nominal. Health index: ${health}/100. Vibrations are within safe environmental parameters. No structural concerns observed.` });
  
  if ((base?.vib_rms ?? 0) > 0.60 && baseOnline)
    lines.push({ t: 'crit', txt: `CRITICAL Base vibration (${base.vib_rms.toFixed(3)}g). Exceeds 0.60g tolerance. Imminent seismic/ground-fault risk.` });
  else if ((base?.vib_rms ?? 0) > 0.35 && baseOnline)
    lines.push({ t: 'warn', txt: `Elevated base vibration (${base.vib_rms.toFixed(3)}g > 0.35g threshold). Monitor for sustained excitation.` });

  if (ratio > 1.5 && baseOnline && topOnline)
    lines.push({ t: 'crit', txt: `RESONANCE ALERT: High Top-to-Base vibration ratio (${ratio.toFixed(2)}x > 1.5x). Immediate dampener inspection recommended.` });

  if (((top?.tilt_x ?? 0) > 3.0 || (top?.tilt_y ?? 0) > 3.0) && topOnline)
    lines.push({ t: 'crit', txt: `CRITICAL INCLINATION: Tilt exceeding 3.0°. Structural drift detected. Evacuation protocols advised.` });

  if ((base?.sustained || top?.sustained))
    lines.push({ t: 'crit', txt: 'Sustained alert active from ESP32. Anomalies are not transient.' });

  if (status === 'critical' || health < 70)
    lines.push({ t: 'crit', txt: `CRITICAL: AI health index dropped to ${health}/100. Immediate intervention required.` });

  if (lines.length === 0)
    lines.push({ t: 'ok', txt: `Health score ${health}/100. All parameters within safe envelope. Continue standard monitoring.` });
  
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
  const { data, baseOnline, topOnline, alertHistory, anomalyConfidence, vibrationAmplificationRatio } = useApp();
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

  // ── UI Logic for Panels ──
  const isNormal = anomalyConfidence < 50;
  const isIrregular = anomalyConfidence >= 50 && anomalyConfidence <= 75;
  const isAnomaly = anomalyConfidence > 75;
  const confColor = isAnomaly ? '#EF4444' : isIrregular ? '#F59E0B' : '#10B981';
  const confText = isAnomaly ? 'STRUCTURAL ANOMALY ISOLATED' : isIrregular ? 'IRREGULARITY DETECTED' : 'NORMAL PATTERN';

  const ratio = vibrationAmplificationRatio ?? 0;
  const isCritRatio = ratio > 1.5;
  const isWarnRatio = ratio >= 1.0 && ratio <= 1.5;
  const ratioColor = isCritRatio ? '#EF4444' : isWarnRatio ? '#F59E0B' : '#10B981';
  const shift = ratio < 1.0 ? 0 : Math.min((ratio - 1.0) * 60, 45);

  let insightTitle = 'System Nominal';
  let insightColor = '#10B981';
  let insightBody = 'Vibrations and tilt patterns are within safe environmental parameters. No structural concerns observed.';

  if (!baseOnline && !topOnline) {
    insightTitle = 'SYSTEM OFFLINE';
    insightColor = '#6B7280';
    insightBody = 'Both sensor nodes offline. No structural data available. Verify ESP32 power supply and WiFi connectivity.';
  } else if (alerts?.building_status === 'critical' || health < 70) {
    insightTitle = 'CRITICAL ALERT';
    insightColor = '#EF4444';
    insightBody = `AI health index dropped to ${health}/100. Immediate intervention required. Review telemetry logs.`;
  } else if (alerts?.building_status === 'warning' || (baseOnline && base?.vib_rms > 0.35) || (topOnline && top?.vib_rms > 0.35)) {
    insightTitle = 'WARNING';
    insightColor = '#F59E0B';
    insightBody = 'Elevated structural movement detected. Monitor for sustained excitation.';
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <DashboardHeader onRefresh={() => window.location.reload()} />

      <style>{`
        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-sweep { animation: sweep 3s linear infinite; }
      `}</style>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Brain size={18} className="text-violet-400" />
        <h2 className="text-lg font-semibold text-slate-200">AI Structural Prediction</h2>
        <span className="text-xs text-slate-500 ml-2 hidden sm:inline">Deep Learning Simulation · Predictive Maintenance</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
          <span className="text-[10px] text-violet-400 font-bold tracking-widest hidden sm:inline">NEURAL ENGINE ACTIVE</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCardEnhanced
          icon={Brain}
          label="AI Confidence"
          value={confidence}
          unit="%"
          status={confidence > 75 ? 'critical' : confidence > 50 ? 'warning' : 'normal'}
          theme="violet"
        />
        <StatCardEnhanced
          icon={TrendingUp}
          label="Health Score"
          value={Math.round(health)}
          unit="/100"
          status={health > 80 ? 'normal' : health > 50 ? 'warning' : 'critical'}
          theme={health > 80 ? 'emerald' : health > 50 ? 'amber' : 'red'}
        />
        <StatCardEnhanced
          icon={Zap}
          label="Vibration Ratio"
          value={(ratio ?? 0).toFixed(2)}
          unit="×"
          status={ratio > 1.5 ? 'critical' : ratio > 1.0 ? 'warning' : 'normal'}
          theme="amber"
        />
        <StatCardEnhanced
          icon={CheckCircle}
          label="Forecast"
          value={slope < 0 ? 'Degrading' : 'Stable'}
          status={slope < 0 ? 'warning' : 'normal'}
          theme={slope < 0 ? 'amber' : 'emerald'}
        />
      </motion.div>

      <SectionDivider title="Predictive Analysis" icon={Brain} />

      {/* ── Component Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 min-h-0">

        {/* Predictive Maintenance Forecaster */}
        <div
          className="glass-card xl:col-span-2 p-4 flex flex-col relative overflow-hidden min-h-[400px] fade-up stagger-1"
          style={{ borderColor: 'rgba(139,92,246,0.3)', boxShadow: '0 0 30px rgba(139,92,246,0.1)' }}
        >
          <NeuralCanvas />
          <div className="relative z-10 flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-200">Predictive Maintenance Forecaster</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Linear regression on health_score · 15-step extrapolation
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
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
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

        {/* Panel A: Enhanced "Anomaly Confidence Matrix" */}
        <div
          className="glass-card p-5 flex flex-col min-w-[250px] min-h-[400px] fade-up stagger-2"
          style={{
            borderColor: isAnomaly ? '#7F1D1D' : isIrregular ? '#78350F' : 'rgba(255,255,255,0.05)',
            boxShadow:   isAnomaly ? '0 0 30px rgba(239,68,68,0.2)' : isIrregular ? '0 0 20px rgba(245,158,11,0.15)' : 'none',
          }}
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Live AI Anomaly Radar</p>
          
          <div className="flex-1 flex flex-col items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={confColor} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(anomalyConfidence / 100) * 251.2} 251.2`}
                  style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${confColor}80)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="num text-4xl font-bold" style={{ color: confColor }}>{anomalyConfidence}</span>
                <span className="text-[10px] text-slate-500 tracking-wider">% CONF.</span>
              </div>
            </div>
            <p className="num text-sm font-bold mt-4 uppercase tracking-wider text-center" style={{ color: confColor }}>
              {confText}
            </p>
          </div>

          <div className="mt-auto border-t border-gray-800 pt-3 text-[10px] text-slate-500 text-center leading-relaxed">
            Model: Client-Side Anomaly Isolation<br/>
            Data Source: Live MPU6050 Telemetry Buffer
          </div>
        </div>

        {/* Panel B: Accurate "Structural Resonance Radar" */}
        <div
          className="glass-card p-5 flex flex-col min-w-[250px] min-h-[400px] fade-up stagger-3"
          style={{ borderColor: 'rgba(59,130,246,0.2)', boxShadow: '0 0 20px rgba(59,130,246,0.1)' }}
        >
          <p className="text-sm font-semibold text-slate-200 mb-0.5">Structural Resonance Radar</p>
          <p className="text-[10px] text-slate-500 mb-6">Top-to-Base Vibration Amplification</p>
          
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
             {/* Radar Rings (Subtle Grid) */}
             <div className="absolute w-[80%] aspect-square rounded-full border border-slate-700/40" style={{ backgroundColor: `${ratioColor}1A` }} />
             <div className="absolute w-[50%] aspect-square rounded-full border border-slate-700/40" style={{ backgroundColor: `${ratioColor}1A` }} />
             <div className="absolute w-[20%] aspect-square rounded-full border border-slate-700/40" style={{ backgroundColor: `${ratioColor}1A` }} />
             
             {/* Concentric Threshold Rings */}
             <div className="absolute w-[50%] aspect-square rounded-full border border-emerald-500/20 border-dashed" /> {/* 1.0x Boundary */}
             <div className="absolute w-[80%] aspect-square rounded-full border border-red-500/20 border-dashed" /> {/* 1.5x Boundary */}

             {/* Crosshairs */}
             <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700/40" />
             <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-700/40" />

             {/* Sweep gradient (Underneath Dot) */}
             <div className="absolute w-[80%] aspect-square rounded-full overflow-hidden">
                <div className="w-full h-full origin-center animate-sweep" style={{
                    background: `conic-gradient(from 180deg at 50% 50%, transparent 270deg, ${ratioColor}80 360deg)`
                }} />
             </div>

             {/* Structural Focus Point + HUD */}
             <div className="absolute z-10 transition-transform duration-700 flex items-center justify-center pointer-events-none"
                  style={{ transform: `translate(${shift}px, -${shift/1.5}px)` }}>
                {/* The Dot */}
                <div className="relative w-5 h-5 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: ratioColor, boxShadow: `0 0 15px ${ratioColor}` }}>
                   {isCritRatio && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: ratioColor }} />}
                </div>
                {/* HUD Label */}
                <div className="absolute left-6 px-1.5 py-0.5 rounded bg-slate-900/80 border text-[10px] font-bold tracking-widest leading-none flex items-center shadow-lg"
                     style={{ borderColor: `${ratioColor}40`, color: ratioColor }}>
                   {ratio.toFixed(2)}x
                </div>
             </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Current Ratio</span>
            <span className="num font-bold text-xl" style={{ color: ratioColor }}>{ratio.toFixed(2)}x</span>
          </div>
        </div>

        {/* Panel C: Improved "AI Insight" */}
        <div
          className="glass-card xl:col-span-2 p-5 flex flex-col h-full overflow-hidden min-w-[250px] min-h-[300px] fade-up stagger-4"
          style={{ borderColor: 'rgba(255,255,255,0.05)', boxShadow: '0 0 20px rgba(139,92,246,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield size={14} className="text-violet-400" />
            <p className="text-sm font-semibold text-slate-200">Live AI Insights</p>
            <span className="text-[9px] text-violet-400 border border-violet-500/30 bg-violet-500/5
                             px-1.5 py-0.5 rounded tracking-widest ml-1">
              AUTO-GENERATED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            <div className="flex flex-col justify-center items-center text-center space-y-4">
              <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-wider transition-colors duration-500" style={{ color: insightColor }}>
                {insightTitle}
              </h3>
              <p className="text-sm lg:text-base text-slate-300 max-w-lg leading-relaxed">
                {insightBody}
              </p>
            </div>
          </div>

          {/* Node status summary */}
          <div className="border-t border-gray-800 pt-4 mt-auto mb-4 flex justify-around text-xs uppercase tracking-wider text-slate-500">
             <div className="flex flex-col items-center gap-1">
                <span>Base Node</span>
                <span className="font-bold" style={{ color: baseOnline ? statusColor(alerts?.base_status) : '#EF4444' }}>{baseOnline ? 'ONLINE' : 'OFFLINE'}</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span>Top Node</span>
                <span className="font-bold" style={{ color: topOnline ? statusColor(alerts?.top_status) : '#EF4444' }}>{topOnline ? 'ONLINE' : 'OFFLINE'}</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span>System Health</span>
                <span className="num font-bold" style={{ color: statusColor(alerts?.building_status) }}>{health}/100</span>
             </div>
          </div>

          {/* Spike event log */}
          {alertHistory.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-800">
              <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Zap size={9} /> Spike Event Log (session)
              </p>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-2">
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
