// src/pages/Vibration.jsx
import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import OfflineOverlay from '../components/OfflineOverlay';
import { Activity } from 'lucide-react';

const MAX_POINTS = 50;

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs min-w-[150px]">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-4">
          <span>{p.name}</span><span>{(p.value ?? 0).toFixed(4)} g</span>
        </p>
      ))}
    </div>
  );
};

export default function Vibration() {
  const { data, baseOnline, topOnline } = useApp();
  const { base, top, diff } = data;

  const [history, setHistory] = useState([]);
  const histRef       = useRef([]);
  const lastBaseTsRef = useRef(0);
  const lastTopTsRef  = useRef(0);
  const lastKnown     = useRef({ base: 0, top: 0 });

  // Only append on newer ts — retain last known values (no zeroing)
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
        'Base RMS': lastKnown.current.base,
        'Top RMS':  lastKnown.current.top,
      };
      histRef.current = [...histRef.current, pt].slice(-MAX_POINTS);
      setHistory([...histRef.current]);
    }
  }, [base?.ts, top?.ts]);

  const bothOffline = !baseOnline && !topOnline;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold text-slate-200">Vibration Analysis</h2>
        <span className="text-xs text-slate-500 ml-2">
          Base RMS vs Top RMS amplitude comparison (vib_rms magnitude)
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Base vib_rms', color: '#10B981', offline: !baseOnline,
            val: (base?.vib_rms ?? lastKnown.current.base ?? 0).toFixed(4),
          },
          {
            label: 'Top vib_rms',  color: '#3B82F6', offline: !topOnline,
            val: (top?.vib_rms ?? lastKnown.current.top ?? 0).toFixed(4),
          },
          {
            label: 'vib_ratio (Base/Top)',
            color: diff?.ratio_alert ? '#EF4444' : '#F59E0B',
            offline: bothOffline,
            val: (diff?.vib_ratio ?? 0).toFixed(4),
          },
        ].map(({ label, val, color, offline }) => (
          <div key={label} className="glass-card p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="num text-2xl" style={{ color: offline ? '#6B7280' : color }}>{val}</p>
            {offline && (
              <span className="text-[9px] font-bold text-red-400 tracking-widest mt-1 block">NODE OFFLINE</span>
            )}
            {label.includes('ratio') && !bothOffline && diff?.ratio_alert && (
              <span className="text-[9px] font-bold text-red-400 tracking-widest mt-1 block">⚠ RATIO ALERT</span>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-5 flex-1 flex flex-col relative min-h-0">
        <p className="text-sm font-semibold text-slate-300 mb-3">RMS Amplitude — Live Feed</p>
        <OfflineOverlay nodeLabel="Base & Top" isOffline={bothOffline} />
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
}
