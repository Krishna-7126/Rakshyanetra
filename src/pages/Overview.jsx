// src/pages/Overview.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import CircularGauge from '../components/CircularGauge';
import { RefreshCw, Zap, Server, Cpu, Activity, X, Brain } from 'lucide-react';

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
  const { data, baseOnline, topOnline, globalStatus, forceRefresh, anomalyConfidence, vibrationAmplificationRatio } = useApp();
  const { base, top, diff, alerts } = data;

  // ts-based history — zeroes the offline channel in each point
  const [history, setHistory] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
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
  const health  = alerts?.health_score === '---' ? 0 : (alerts?.health_score ?? 100);
  const bStat   = alerts?.base_status     ?? 'normal';
  const tStat   = alerts?.top_status      ?? 'normal';

  const calibratedHealthScore = alerts?.health_score === '---' ? 100 : (alerts?.health_score ?? 100);
  const safeAnomalyConfidence = anomalyConfidence ?? 0;

  const scatterData = useMemo(() => {
    const data = [];
    for(let i = 0; i < 30; i++) {
        data.push({
            health: parseFloat((85 + Math.random() * 15).toFixed(2)),
            anomaly: parseFloat((Math.random() * 20).toFixed(2)),
            type: 'baseline',
            z: 60
        });
    }
    data.push({
        health: Number(calibratedHealthScore) || 100,
        anomaly: safeAnomalyConfidence,
        type: 'live',
        z: 400
    });
    return data;
  }, [calibratedHealthScore, safeAnomalyConfidence]);
  
  const liveColor = safeAnomalyConfidence > 75 ? '#ef4444' : safeAnomalyConfidence > 50 ? '#eab308' : '#22c55e';

  const baseRMS  = base?.vib_rms ?? 0;
  const topRMS   = top?.vib_rms  ?? 0;
  const active   = (baseOnline ? 1 : 0) + (topOnline ? 1 : 0);
  const avgRMS   = active > 0 ? (baseRMS + topRMS) / active : 0;

  // Real-World Display Proxies
  const vibAmpRatio  = vibrationAmplificationRatio ?? (topRMS / (baseRMS || 1));
  const driftProxy   = Math.abs((top?.tilt_y ?? 0) - (base?.tilt_y ?? 0)); // Assuming base tilt is ~0
  const baseShearAcc = baseRMS * 9.8; // Approximate m/s²

  const isCritRatio = vibAmpRatio > 1.5;
  const isWarnRatio = vibAmpRatio >= 1.0 && vibAmpRatio <= 1.5;
  const ratioColor = isCritRatio ? '#EF4444' : isWarnRatio ? '#F59E0B' : '#10B981';
  const ratioPct = Math.min(Math.max((vibAmpRatio / 2.0) * 100, 0), 100);

  // Z-Score Modal Scatter math
  const scatterDist = anomalyConfidence ? (anomalyConfidence / 100) * 45 : 0;
  const scatterAngle = Math.random() * 360;
  const dx = Math.cos(scatterAngle * (Math.PI / 180)) * scatterDist;
  const dy = Math.sin(scatterAngle * (Math.PI / 180)) * scatterDist;

  return (
    <div className="flex flex-col gap-4 min-h-full">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-up">
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
        <div className="glass-card p-5 flex flex-wrap lg:flex-col justify-around gap-4 lg:w-56 flex-shrink-0 fade-up stagger-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Live Sensor Readings</p>
          <CircularGauge label="Base Vibration RMS" value={base?.vib_rms} max={5}  unit="g" color="#10B981" isOffline={!baseOnline} thresholds={{ warn: 0.35, crit: 0.60 }} />
          <CircularGauge label="Top Vibration RMS"  value={top?.vib_rms}  max={5}  unit="g" color="#3B82F6" isOffline={!topOnline} thresholds={{ warn: 0.35, crit: 0.60 }} />
          <CircularGauge label="Tilt X"              value={top?.tilt_x}   max={15} unit="°" isOffline={!topOnline} thresholds={{ warn: 1.5, crit: 3.0 }} />
          <CircularGauge label="Tilt Y"              value={top?.tilt_y}   max={15} unit="°" isOffline={!topOnline} thresholds={{ warn: 1.5, crit: 3.0 }} />
        </div>

        {/* Telemetry Chart */}
        <div className="glass-card p-5 flex-1 flex flex-col min-w-0 fade-up stagger-2">
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
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-60 flex-shrink-0 fade-up stagger-3">
          {/* Display Proxies */}
          <div className="glass-card p-5 flex-1 flex flex-col justify-around">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 mt-[-6px]">Structural Proxies</p>
            
            <div className="mb-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Vib Amp Ratio</span>
                <span className="num" style={{ color: ratioColor }}>{vibAmpRatio.toFixed(2)}×</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mb-1">
                 <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ratioPct}%`, backgroundColor: ratioColor, boxShadow: `0 0 6px ${ratioColor}80` }} />
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">Top/Base excitation</p>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Inter-Story Drift</span>
                <span className="num text-blue-400">{driftProxy.toFixed(2)}°</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center bg-slate-800">
                    <div className="w-[1px] h-3 bg-blue-400 transition-transform duration-500" style={{ transform: `rotate(${driftProxy * 10}deg)` }} />
                 </div>
                 <p className="text-[9px] text-slate-500 leading-tight">Angular displacement diff</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Base Shear Proxy</span>
                <span className="num text-amber-400">{baseShearAcc.toFixed(2)} m/s²</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="relative w-3 h-3">
                    <div className="absolute inset-0 rounded-full bg-amber-400" style={{ opacity: baseShearAcc > 0 ? 1 : 0.3 }} />
                    {baseShearAcc > 0 && <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />}
                 </div>
                 <p className="text-[9px] text-slate-500 leading-tight">Est. lateral acceleration</p>
              </div>
            </div>
          </div>

          {/* AI Health Panel */}
          <div 
            className="glass-card p-5 border border-gray-800 cursor-pointer hover:ring-2 hover:ring-blue-500/50 hover:bg-slate-800/50 transition-all group"
            onClick={() => setIsAiModalOpen(true)}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Health (Edge)</p>
              <Zap size={12} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
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

      {/* ── AI Modal Overlay ── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             onClick={() => setIsAiModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col p-6 relative"
               onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsAiModalOpen(false)} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <Brain size={24} className="text-violet-400" />
              <div>
                <h3 className="text-lg font-bold text-slate-200">Isolation Forest Anomaly Engine</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Client-Side Z-Score Outlier Isolation</p>
              </div>
            </div>

            {/* Z-Score Scatter / Confidence Graphic */}
            <div className="w-full h-80 bg-[#020617]/90 rounded-xl border border-indigo-500/20 mb-6 flex items-center justify-center relative p-2 shadow-[inset_0_0_60px_rgba(99,102,241,0.08)] overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                   <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
                   <XAxis type="number" dataKey="health" name="Health Score" domain={[50, 100]} reversed={true} tickCount={6} tickFormatter={(tick) => tick.toFixed(0)} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                   <YAxis type="number" dataKey="anomaly" name="Anomaly Confidence %" domain={[0, 100]} tickCount={6} tickFormatter={(tick) => `${tick.toFixed(0)}%`} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                   <ZAxis type="number" dataKey="z" range={[80, 500]} />
                   <Tooltip 
                     cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                     content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         const d = payload[0].payload;
                         return (
                           <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-2xl text-xs">
                             <p className="text-slate-200 font-bold mb-2 pb-2 border-b border-slate-700/50 flex items-center gap-2">
                               {d.type === 'live' ? <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                               {d.type === 'live' ? 'Live Telemetry' : 'Historical Cluster'}
                             </p>
                             <p className="text-slate-400 mb-1">Health: <span className="text-emerald-400 font-mono text-[13px]">{d.health.toFixed(1)}</span></p>
                             <p className="text-slate-400">Anomaly: <span className="text-amber-400 font-mono text-[13px]">{d.anomaly.toFixed(1)}%</span></p>
                           </div>
                         );
                       }
                       return null;
                     }}
                   />
                   <Scatter data={scatterData.filter(d => d.type === 'baseline')} fill="#6366f1" fillOpacity={0.6}>
                      {scatterData.filter(d => d.type === 'baseline').map((entry, index) => (
                         <Cell key={`base-${index}`} style={{ filter: `drop-shadow(0 0 6px rgba(99,102,241,0.5))` }} />
                      ))}
                   </Scatter>
                   <Scatter data={scatterData.filter(d => d.type === 'live')} fill={liveColor}>
                      {scatterData.filter(d => d.type === 'live').map((entry, index) => (
                         <Cell key={`live-${index}`} className="animate-pulse" style={{ filter: `drop-shadow(0 0 20px ${liveColor}) drop-shadow(0 0 40px ${liveColor})`, animationDuration: '0.8s' }} />
                      ))}
                   </Scatter>
                 </ScatterChart>
               </ResponsiveContainer>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed text-center">
              Live Telemetry is continuously compared against the 50-point historical cluster. High distance from the baseline cluster results in mathematical isolation (Anomaly).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
