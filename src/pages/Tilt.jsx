// src/pages/Tilt.jsx
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
import { GitMerge, AlertTriangle, CheckCircle } from 'lucide-react';

const MAX_POINTS = 50;
const ChartTooltip = ({ active, payload, label }) => {
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

  // Metric cards now trust AppContext sanitization
  const dispTiltX = top?.tilt_x ?? 0;
  const dispTiltY = top?.tilt_y ?? 0;
  const isSustained = top?.sustained ?? false;

  const handleRefresh = async () => {
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
          icon={GitMerge}
          label="Tilt X (Roll)"
          value={dispTiltX.toFixed(2)}
          unit="°"
          status={!topOnline ? 'offline' : dispTiltX > 3.0 ? 'critical' : dispTiltX > 1.5 ? 'warning' : 'normal'}
          theme="amber"
        />
        <StatCardEnhanced
          icon={GitMerge}
          label="Tilt Y (Pitch)"
          value={dispTiltY.toFixed(2)}
          unit="°"
          status={!topOnline ? 'offline' : dispTiltY > 3.0 ? 'critical' : dispTiltY > 1.5 ? 'warning' : 'normal'}
          theme="orange"
        />
        <StatCardEnhanced
          icon={isSustained ? AlertTriangle : CheckCircle}
          label="Sustained Alert"
          value={isSustained ? 'ACTIVE' : 'CLEAR'}
          status={isSustained ? 'critical' : 'normal'}
          theme="red"
        />
      </motion.div>

      <SectionDivider title="Inclination History" icon={GitMerge} />

      {/* Main Chart Section */}
      <ChartContainer
        title="Top Node Tilt Angles"
        description="Real-time inclination monitoring (tilt_x & tilt_y axes)"
        footer={`Top Node: ${topOnline ? '✓ Online' : '✗ Offline'}`}
        fullWidth
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tiltXGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="tiltYGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} label={{ value: 'Angle (°)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>}
              />
              <Line type="monotone" dataKey="Tilt X" stroke="#F59E0B" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Tilt Y" stroke="#F97316" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 border border-slate-600 bg-slate-800/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${topOnline ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Top Node Status</h3>
              <p className="text-xs text-slate-500 mt-1">
                {topOnline ? `Connected • X: ${dispTiltX.toFixed(2)}° • Y: ${dispTiltY.toFixed(2)}°` : 'Node Offline'}
              </p>
            </div>
          </div>
          {isSustained && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-xs font-semibold text-red-400">Alert Active</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
