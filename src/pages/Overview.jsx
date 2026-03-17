// src/pages/Overview.jsx
import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import CircularGauge from '../components/CircularGauge';
import { RefreshCw, Zap, Server, Cpu, Activity } from 'lucide-react';

const MAX_POINTS = 50;

// ── Status helpers ───────────────────────────────────────────────
const SC = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const GC = { 'SYSTEM OFFLINE': '#EF4444', DEGRADED: '#F59E0B', ONLINE: '#10B981' };

const statusColor  = (s) => SC[s]   ?? SC.normal;
const globalColor  = (g) => GC[g]   ?? GC.ONLINE;
const statusText   = (s) => ({ critical: 'text-red-400', warning: 'text-amber-400', normal: 'text-emerald-400' }[s] ?? 'text-emerald-400');
const globalText   = (g) => ({ 'SYSTEM OFFLINE': 'text-red-400', DEGRADED: 'text-amber-400', ONLINE: 'text-emerald-400' }[g] ?? 'text-emerald-400');

// ── Sub-components ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#3B82F6' }) {
  return (
    <div className="glass-card p-5 flex items-start gap-4">
      <div className="p-2.5 rounded-xl bg-white/5 flex-shrink-0" style={{ color }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="num text-[22px] leading-tight truncate" style={{ color }}>{value}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ label, pct, color = '#3B82F6' }) {
  const c = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="num" style={{ color }}>{c.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${c}%`, background: color, boxShadow: `0 0 6px ${color}60` }} />
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs min-w-[140px]">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-4">
          <span>{p.name}</span><span>{(p.value ?? 0).toFixed(4)} g</span>
        </p>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────
export default function Overview() {
  const { data, baseOnline, topOnline, globalStatus, forceRefresh } = useApp();
  const { base, top, diff, alerts } = data;

  // ts-based history — zeroes the offline channel in each point
  const [history, setHistory] = useState([]);
  const histRef       = useRef([]);
  const lastBaseTsRef = useRef(0);
  const lastTopTsRef  = useRef(0);
  const lastKnown     = useRef({ base: 0, top: 0 });

  useEffect(() => {
    const bTs = base?.ts ?? 0;
    const tTs = top?.ts  ?? 0;
    let changed = false;

    if (bTs > lastBaseTsRef.current) {
      lastKnown.current.base = base?.vib_rms ?? lastKnown.current.base;
      lastBaseTsRef.current  = bTs;
      changed = true;
    }
    if (tTs > lastTopTsRef.current) {
      lastKnown.current.top = top?.vib_rms ?? lastKnown.current.top;
      lastTopTsRef.current  = tTs;
      changed = true;
    }
    if (changed) {
      const pt = {
        time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        'Base RMS': baseOnline ? lastKnown.current.base : 0,
        'Top RMS':  topOnline  ? lastKnown.current.top  : 0,
      };
      histRef.current = [...histRef.current, pt].slice(-MAX_POINTS);
      setHistory([...histRef.current]);
    }
  }, [base?.ts, top?.ts, baseOnline, topOnline]);

  const bStatus = alerts?.building_status ?? 'normal';
  const health  = alerts?.health_score    ?? 0;
  const bStat   = alerts?.base_status     ?? 'normal';
  const tStat   = alerts?.top_status      ?? 'normal';

  const active   = (baseOnline ? 1 : 0) + (topOnline ? 1 : 0);
  const baseRMS  = baseOnline ? (lastKnown.current.base) : 0;
  const topRMS   = topOnline  ? (lastKnown.current.top)  : 0;
  const avgRMS   = active > 0 ? (baseRMS + topRMS) / active : 0;

  const stressProxy = Math.min((base?.stress_proxy ?? 0) * 10, 100);
  const vibRatio    = Math.min((diff?.vib_ratio    ?? 0) * 100, 100);
  const torsional   = (base?.alert || top?.alert) ? 75 : bStatus === 'warning' ? 40 : 15;

  return (
    <div className="flex flex-col gap-4 min-h-full">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Server} label="Building Status"
          value={globalStatus}
          sub="Block A — Watchdog Active"
          color={globalColor(globalStatus)} />
        <StatCard icon={Cpu} label="Active Sensors"
          value={`${active} / 2`}
          sub={`Base: ${baseOnline?'Online':'Offline'} · Top: ${topOnline?'Online':'Offline'}`}
          color={active===2?'#10B981':active===1?'#F59E0B':'#EF4444'} />
        <StatCard icon={Activity} label="Avg RMS"
          value={avgRMS.toFixed(4)}
          sub="g (gravitational magnitude)"
          color="#3B82F6" />
        <StatCard icon={Zap} label="Health Score"
          value={`${health} / 100`}
          sub={bStatus.toUpperCase()}
          color={statusColor(bStatus)} />
      </div>

      {/* ── Middle Row ── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Gauges */}
        <div className="glass-card p-5 flex flex-wrap lg:flex-col justify-around gap-4 lg:w-56 flex-shrink-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Live Sensor Readings</p>
          <CircularGauge label="Base Vibration RMS" value={base?.vib_rms} max={5}  unit="g" color="#10B981" isOffline={!baseOnline} />
          <CircularGauge label="Top Vibration RMS"  value={top?.vib_rms}  max={5}  unit="g" color="#3B82F6" isOffline={!topOnline}  />
          <CircularGauge label="Tilt X"              value={top?.tilt_x}   max={15} unit="°" isOffline={!topOnline} thresholds={{ warn: 1.5, crit: 3.0 }} />
          <CircularGauge label="Tilt Y"              value={top?.tilt_y}   max={15} unit="°" isOffline={!topOnline} thresholds={{ warn: 1.5, crit: 3.0 }} />
        </div>

        {/* Telemetry Chart */}
        <div className="glass-card p-5 flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-200">Live Telemetry Feed</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Base RMS vs Top RMS · max {MAX_POINTS} pts · local state (resets on refresh)
              </p>
            </div>
            <button onClick={forceRefresh}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-white
                         border border-blue-500/30 px-3 py-1.5 rounded-lg transition-all hover:bg-blue-500/10">
              <RefreshCw size={12} /> Force Refresh
            </button>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6B7280' }} />
                <Line type="monotone" dataKey="Base RMS" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Top RMS"  stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-60 flex-shrink-0">
          {/* Load Factors */}
          <div className="glass-card p-5 flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Structural Load Factors</p>
            <ProgressBar label="Dynamic Load (Stress Proxy)" pct={stressProxy} color="#10B981" />
            <ProgressBar label="Structural Drift (Vib Ratio)" pct={vibRatio}   color="#3B82F6" />
            <ProgressBar label="Torsional Stress"             pct={torsional}  color="#EF4444" />
            <div className="mt-4 pt-3 border-t border-gray-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">vib_ratio</span>
                <span className="num text-blue-400">{(diff?.vib_ratio ?? 0).toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ratio_alert</span>
                <span className={`font-bold ${diff?.ratio_alert ? 'text-red-400' : 'text-emerald-400'}`}>
                  {diff?.ratio_alert ? 'ALERT' : 'NORMAL'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Health Panel */}
          <div className="glass-card p-5 border border-gray-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">AI Health (Edge)</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={statusColor(bStatus)} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(health/100)*251.2} 251.2`}
                    style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 4px ${statusColor(bStatus)}80)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="num text-sm" style={{ color: statusColor(bStatus) }}>{health}</span>
                </div>
              </div>
              <div>
                <p className="num text-sm font-bold uppercase" style={{ color: statusColor(bStatus) }}>{bStatus}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">ESP32 Edge AI</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-2.5 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Base Node</span>
                <span style={{ color: statusColor(bStat) }}>{bStat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Top Node</span>
                <span style={{ color: statusColor(tStat) }}>{tStat.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
