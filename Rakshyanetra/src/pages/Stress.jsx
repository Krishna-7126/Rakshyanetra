// src/pages/Stress.jsx
import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import OfflineOverlay from '../components/OfflineOverlay';
import { Layers } from 'lucide-react';

const MAX_POINTS = 50;
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs min-w-[140px]">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-4">
          <span>Stress Proxy</span><span>{(p.value ?? 0).toFixed(4)}</span>
        </p>
      ))}
    </div>
  );
};

export default function Stress() {
  const { data, baseOnline } = useApp();
  const { base } = data;
  const [history, setHistory]  = useState([]);
  const histRef       = useRef([]);
  const lastBaseTsRef = useRef(0);
  const lastKnown     = useRef(0);

  useEffect(() => {
    const bTs = base?.ts ?? 0;
    if (bTs > lastBaseTsRef.current) {
      lastKnown.current    = base?.stress_proxy ?? lastKnown.current;
      lastBaseTsRef.current = bTs;
      const pt = {
        time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        stress: baseOnline ? lastKnown.current : 0,
      };
      histRef.current = [...histRef.current, pt].slice(-MAX_POINTS);
      setHistory([...histRef.current]);
    }
  }, [base?.ts, baseOnline]);

  const dispStress = baseOnline ? (base?.stress_proxy ?? 0) : 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Layers size={18} className="text-red-400" />
        <h2 className="text-lg font-semibold text-slate-200">Structural Stress</h2>
        <span className="text-xs text-slate-500 ml-2">Base Node — stress_proxy</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Stress Proxy', val: dispStress.toFixed(4), color: '#EF4444' },
          { label: 'Alert Flag',   val: base?.alert     ? 'ACTIVE' : 'CLEAR', color: base?.alert     ? '#EF4444' : '#10B981' },
          { label: 'Sustained',    val: base?.sustained ? 'YES'   : 'NO',     color: base?.sustained ? '#EF4444' : '#10B981' },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass-card p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="num text-2xl" style={{ color: !baseOnline ? '#6B7280' : color }}>{val}</p>
            {!baseOnline && <span className="text-[9px] text-red-400 font-bold tracking-widest mt-1 block">BASE NODE OFFLINE</span>}
          </div>
        ))}
      </div>

      <div className="glass-card p-5 flex-1 flex flex-col relative min-h-0">
        <p className="text-sm font-semibold text-slate-300 mb-3">Stress Proxy History — Base Node</p>
        <OfflineOverlay nodeLabel="Base" isOffline={!baseOnline} />
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="stress"
                stroke="#EF4444" strokeWidth={2} fill="url(#stressGrad)"
                dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
