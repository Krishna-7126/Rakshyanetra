// src/pages/Stress.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import DashboardHeader from '../components/DashboardHeader';
import StatCardEnhanced from '../components/StatCardEnhanced';
import ChartContainer from '../components/ChartContainer';
import SectionDivider from '../components/SectionDivider';
import { Layers, AlertTriangle, CheckCircle } from 'lucide-react';

const MAX_POINTS = 50;
const ChartTooltip = ({ active, payload, label }) => {
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
  }, [base?.ts, base?.stress_proxy, baseOnline]);

  const dispStress = base?.stress_proxy ?? 0;
  const isAlert = base?.alert ?? false;
  const isSustained = base?.sustained ?? false;

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
          icon={Layers}
          label="Stress Proxy"
          value={dispStress.toFixed(4)}
          status={!baseOnline ? 'offline' : dispStress > 0.8 ? 'critical' : dispStress > 0.5 ? 'warning' : 'normal'}
          theme="red"
        />
        <StatCardEnhanced
          icon={isAlert ? AlertTriangle : CheckCircle}
          label="Alert Flag"
          value={isAlert ? 'ACTIVE' : 'CLEAR'}
          status={isAlert ? 'critical' : 'normal'}
          theme="orange"
        />
        <StatCardEnhanced
          icon={isSustained ? AlertTriangle : CheckCircle}
          label="Sustained"
          value={isSustained ? 'YES' : 'NO'}
          status={isSustained ? 'critical' : 'normal'}
          theme="amber"
        />
      </motion.div>

      <SectionDivider title="Stress Proxy Trend" icon={Layers} />

      {/* Main Chart Section */}
      <ChartContainer
        title="Structural Stress Monitor"
        description="Base Node stress_proxy over time"
        footer={`Base Node: ${baseOnline ? '✓ Online' : '✗ Offline'}`}
        fullWidth
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="stress"
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#stressGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="glass-card p-5 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${baseOnline ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <h3 className="text-sm font-semibold text-red-400">Base Node</h3>
          </div>
          <p className="text-xs text-slate-400">
            {baseOnline ? `✓ Stress: ${dispStress.toFixed(4)}` : '✗ Node Offline'}
          </p>
        </div>

        <div className={`glass-card p-5 border ${isAlert ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600 bg-slate-800/30'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <h3 className={`text-sm font-semibold ${isAlert ? 'text-red-400' : 'text-slate-400'}`}>
              {isAlert ? 'Alert Status' : 'System Status'}
            </h3>
          </div>
          <p className={`text-xs ${isAlert ? 'text-red-300' : 'text-slate-400'}`}>
            {isAlert ? '⚠ Alert condition detected' : '✓ System operating normally'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
