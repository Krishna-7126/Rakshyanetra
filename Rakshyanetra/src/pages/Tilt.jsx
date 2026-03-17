// src/pages/Tilt.jsx
import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import OfflineOverlay from '../components/OfflineOverlay';
import { GitMerge } from 'lucide-react';

const MAX_POINTS = 50;
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs min-w-[140px]">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-4">
          <span>{p.name}</span><span>{(p.value ?? 0).toFixed(2)}°</span>
        </p>
      ))}
    </div>
  );
};

export default function Tilt() {
  const { data, topOnline } = useApp();
  const { top } = data;
  const [history, setHistory] = useState([]);
  const histRef      = useRef([]);
  const lastTopTsRef = useRef(0);
  const lastKnown    = useRef({ tiltX: 0, tiltY: 0 });

  useEffect(() => {
    const tTs = top?.ts ?? 0;
    if (tTs > lastTopTsRef.current) {
      lastKnown.current.tiltX = top?.tilt_x ?? lastKnown.current.tiltX;
      lastKnown.current.tiltY = top?.tilt_y ?? lastKnown.current.tiltY;
      lastTopTsRef.current    = tTs;
      const pt = {
        time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        'Tilt X': topOnline ? lastKnown.current.tiltX : 0,
        'Tilt Y': topOnline ? lastKnown.current.tiltY : 0,
      };
      histRef.current = [...histRef.current, pt].slice(-MAX_POINTS);
      setHistory([...histRef.current]);
    }
  }, [top?.ts, topOnline]);

  // Zero metric cards when top node is offline
  const dispTiltX = topOnline ? (top?.tilt_x ?? 0) : 0;
  const dispTiltY = topOnline ? (top?.tilt_y ?? 0) : 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <GitMerge size={18} className="text-amber-400" />
        <h2 className="text-lg font-semibold text-slate-200">Tilt / Inclination</h2>
        <span className="text-xs text-slate-500 ml-2">Top Node — tilt_x &amp; tilt_y axes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tilt X (Roll)',   val: `${dispTiltX.toFixed(2)}°`, color: '#F59E0B' },
          { label: 'Tilt Y (Pitch)',  val: `${dispTiltY.toFixed(2)}°`, color: '#F97316' },
          { label: 'Sustained Alert', val: top?.sustained ? 'ACTIVE' : 'CLEAR',
            color: top?.sustained ? '#EF4444' : '#10B981' },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass-card p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="num text-2xl" style={{ color: !topOnline ? '#6B7280' : color }}>{val}</p>
            {!topOnline && <span className="text-[9px] text-red-400 font-bold tracking-widest mt-1 block">TOP NODE OFFLINE</span>}
          </div>
        ))}
      </div>

      <div className="glass-card p-5 flex-1 flex flex-col relative min-h-0">
        <p className="text-sm font-semibold text-slate-300 mb-3">Inclination History — Top Node</p>
        <OfflineOverlay nodeLabel="Top" isOffline={!topOnline} />
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} unit="°" />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6B7280' }} />
              <Line type="monotone" dataKey="Tilt X" stroke="#F59E0B" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Tilt Y" stroke="#F97316" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
