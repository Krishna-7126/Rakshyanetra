// src/pages/Vibration.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import DashboardHeader from '../components/DashboardHeader';
import StatCardEnhanced from '../components/StatCardEnhanced';
import ChartContainer from '../components/ChartContainer';
import SectionDivider from '../components/SectionDivider';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

const MAX_POINTS = 50;

const ChartTooltip = ({ active, payload, label }) => {
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

  // Only append on newer ts — zero the offline channel's value
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

  const bothOffline = !baseOnline && !topOnline;
  const stableRatio = !(diff?.ratio_alert ?? false);
  
  const handleRefresh = async () => {
    // Trigger refresh logic if needed
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <DashboardHeader onRefresh={handleRefresh} />

      {/* Primary Stats - 3 Column Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <StatCardEnhanced
          icon={Activity}
          label="Base Vibration"
          value={(base?.vib_rms ?? 0).toFixed(4)}
          unit="g"
          status={!baseOnline ? 'offline' : (base?.vib_rms ?? 0) > 0.6 ? 'critical' : (base?.vib_rms ?? 0) > 0.35 ? 'warning' : 'normal'}
          theme="emerald"
        />
        <StatCardEnhanced
          icon={Activity}
          label="Top Vibration"
          value={(top?.vib_rms ?? 0).toFixed(4)}
          unit="g"
          status={!topOnline ? 'offline' : (top?.vib_rms ?? 0) > 0.6 ? 'critical' : (top?.vib_rms ?? 0) > 0.35 ? 'warning' : 'normal'}
          theme="blue"
        />
        <StatCardEnhanced
          icon={stableRatio ? TrendingUp : AlertTriangle}
          label="Vibration Ratio"
          value={(diff?.vib_ratio ?? 0).toFixed(4)}
          status={diff?.ratio_alert ? 'critical' : 'normal'}
          theme="amber"
        />
      </motion.div>

      <SectionDivider title="RMS Amplitude Trend" icon={Activity} />

      {/* Main Chart Section */}
      <ChartContainer
        title="Live Vibration Feed"
        description="Base RMS vs Top RMS amplitude comparison"
        footer={`Last 50 measurements • Base: ${baseOnline ? '✓ Online' : '✗ Offline'} • Top: ${topOnline ? '✓ Online' : '✗ Offline'}`}
        fullWidth
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="baseVibGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="topVibGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} label={{ value: 'g (RMS)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>}
              />
              <Line type="monotone" dataKey="Base RMS" stroke="#10B981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Top RMS" stroke="#3B82F6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${baseOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            <h3 className="text-sm font-semibold text-emerald-400">Base Node</h3>
          </div>
          <p className="text-xs text-slate-400">
            {baseOnline ? `✓ RMS: ${(base?.vib_rms ?? 0).toFixed(4)} g` : '✗ Node Offline'}
          </p>
        </div>

        <div className="glass-card p-5 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${topOnline ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
            <h3 className="text-sm font-semibold text-blue-400">Top Node</h3>
          </div>
          <p className="text-xs text-slate-400">
            {topOnline ? `✓ RMS: ${(top?.vib_rms ?? 0).toFixed(4)} g` : '✗ Node Offline'}
          </p>
        </div>

        <div className="glass-card p-5 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${stableRatio ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
            <h3 className="text-sm font-semibold text-amber-400">Ratio Status</h3>
          </div>
          <p className="text-xs text-slate-400">
            {stableRatio ? '✓ Normal' : '⚠ Alert Active'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
