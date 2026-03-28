// src/pages/Overview.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import CircularGauge from '../components/CircularGauge';
import DashboardHeader from '../components/DashboardHeader';
import StatCardEnhanced from '../components/StatCardEnhanced';
import ChartContainer from '../components/ChartContainer';
import SectionDivider from '../components/SectionDivider';
import AnomalyInsights from '../components/AnomalyInsights';
import { RefreshCw, Zap, Server, Cpu, Activity, X, Brain, Gauge, AlertCircle, Lightbulb } from 'lucide-react';

const MAX_POINTS = 50;

// ── Status helpers ───────────────────────────────────────────────
const SC = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };

const statusColor  = (s) => SC[s]   ?? SC.normal;

// ── Sub-components ───────────────────────────────────────────────
// ── Sub-components ───────────────────────────────────────────────
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

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-xs min-w-[160px] shadow-lg">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-4 mb-1">
          <span>{p.name}</span>
          <span>{(p.value ?? 0).toFixed(4)} g</span>
        </p>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────
export default function Overview() {
  const { data, baseOnline, topOnline, globalStatus, forceRefresh, vibrationAmplificationRatio } = useApp();
  const { base, top, alerts } = data;
  const [history, setHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const histRef = useRef([]);
  const lastBaseTsRef = useRef(0);
  const lastTopTsRef = useRef(0);
  const lastKnown = useRef({ base: 0, top: 0 });

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
  }, [base?.ts, top?.ts, base?.vib_rms, top?.vib_rms, baseOnline, topOnline]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await forceRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const bStatus = alerts?.building_status ?? 'normal';
  const health  = alerts?.health_score === '---' ? 0 : (alerts?.health_score ?? 100);

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

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* Alert Banner - Critical/Warning Status */}
      {bStatus !== 'normal' && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl border px-6 py-4 backdrop-blur-xl flex items-start gap-4 ${
            bStatus === 'critical'
              ? 'border-red-500/50 bg-red-500/10'
              : 'border-amber-500/50 bg-amber-500/10'
          }`}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`mt-1 ${bStatus === 'critical' ? 'text-red-400' : 'text-amber-400'}`}
          >
            {bStatus === 'critical' ? <AlertCircle size={24} /> : <Lightbulb size={24} />}
          </motion.div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${bStatus === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
              {bStatus === 'critical' ? '⚠️ Critical Alert' : '🔔 System Warning'}
            </h3>
            <p className={`text-sm mt-1 ${bStatus === 'critical' ? 'text-red-200' : 'text-amber-200'}`}>
              {bStatus === 'critical'
                ? 'Abnormal vibration patterns detected. Immediate structural inspection recommended for preventive maintenance.'
                : 'Elevated vibration levels detected. Monitor building for early anomaly warning signs.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Primary Stats - 4 Column Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCardEnhanced
          icon={Server}
          label="Building Status"
          value={globalStatus}
          status={bStatus}
          theme="cyan"
        />
        <StatCardEnhanced
          icon={Cpu}
          label="Monitoring Sensors"
          value={`${active}/2`}
          trend={active === 2 ? 'up' : 'down'}
          trendPercent={100}
          status={active === 2 ? 'normal' : 'warning'}
          theme="blue"
        />
        <StatCardEnhanced
          icon={Activity}
          label="Avg Vibration Level"
          value={avgRMS.toFixed(4)}
          unit="g"
          status={avgRMS > 0.6 ? 'critical' : avgRMS > 0.35 ? 'warning' : 'normal'}
          theme="emerald"
        />
        <StatCardEnhanced
          icon={Brain}
          label="Structural Health"
          value={Math.round(health)}
          unit="/100"
          status={health > 80 ? 'normal' : health > 50 ? 'warning' : 'critical'}
          theme="amber"
        />
      </motion.div>

      {/* Live Telemetry - Core Monitoring Chart */}
      <ChartContainer
        title="Live Vibration Telemetry"
        description="Real-time structural monitoring • AI anomaly detection enabled"
        footer="Last 50 measurements • Continuous monitoring active"
        fullWidth
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
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

      <SectionDivider title="Sensor Analysis & Anomaly Detection" icon={Gauge} />

      {/* Gauges Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <ChartContainer title="Base Sensor RMS (g)" minimal>
          <CircularGauge
            label="Base RMS"
            value={base?.vib_rms}
            max={5}
            unit="g"
            color="#10B981"
            isOffline={!baseOnline}
            thresholds={{ warn: 0.35, crit: 0.60 }}
          />
        </ChartContainer>
        <ChartContainer title="Top Sensor RMS (g)" minimal>
          <CircularGauge
            label="Top RMS"
            value={top?.vib_rms}
            max={5}
            unit="g"
            color="#3B82F6"
            isOffline={!topOnline}
            thresholds={{ warn: 0.35, crit: 0.60 }}
          />
        </ChartContainer>
        <ChartContainer title="Top Sensor Tilt X (deg)" minimal>
          <CircularGauge
            label="Tilt X"
            value={top?.tilt_x}
            max={15}
            unit="°"
            color="#06B6D4"
            isOffline={!topOnline}
            thresholds={{ warn: 1.5, crit: 3.0 }}
          />
        </ChartContainer>
        <ChartContainer title="Top Sensor Tilt Y (deg)" minimal>
          <CircularGauge
            label="Tilt Y"
            value={top?.tilt_y}
            max={15}
            unit="°"
            color="#8B5CF6"
            isOffline={!topOnline}
            thresholds={{ warn: 1.5, crit: 3.0 }}
          />
        </ChartContainer>
        <ChartContainer title="Building Health Index" minimal>
          <CircularGauge
            label="Overall"
            value={health}
            max={100}
            unit="%"
            color={statusColor(bStatus)}
            thresholds={{ warn: 60, crit: 40 }}
          />
        </ChartContainer>
      </motion.div>

      <SectionDivider title="Structural Health Intelligence" icon={Brain} />

      {/* Metrics Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Vibration Ratio Card */}
        <ChartContainer title="Energy Amplification" description="AI-detected resonance factor">
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold num" style={{ color: ratioColor }}>
                {vibAmpRatio.toFixed(2)}×
              </p>
              <span className="text-xs text-slate-500">amplification</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Risk Level</span>
                <span style={{ color: ratioColor }} className="font-semibold">
                  {Math.min(Math.max((vibAmpRatio / 2.0) * 100, 0), 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max((vibAmpRatio / 2.0) * 100, 0), 100)}%` }}
                  transition={{ duration: 0.8 }}
                  style={{
                    backgroundColor: ratioColor,
                    boxShadow: `0 0 12px ${ratioColor}`,
                  }}
                />
              </div>
            </div>
            <motion.p 
              className="text-xs px-3 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: ratioColor + '20',
                color: ratioColor,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isCritRatio ? '⚠️ Critical: Immediate inspection advised' : isWarnRatio ? '🟡 Alert: Monitor closely for anomalies' : '✓ Normal: Structural stability confirmed'}
            </motion.p>
          </div>
        </ChartContainer>

        {/* Drift Card */}
        <ChartContainer title="Structural Drift" description="Inter-story angular displacement">
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold num text-blue-400">
                {driftProxy.toFixed(2)}°
              </p>
              <span className="text-xs text-slate-500">degrees</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="2" />
                  <line x1="50" y1="50" x2="50" y2="15" stroke="#94A3B8" strokeWidth="2" />
                  <motion.line
                    x1="50"
                    y1="50"
                    x2={50 + Math.cos(((driftProxy * 10 - 90) * Math.PI) / 180) * 35}
                    y2={50 + Math.sin(((driftProxy * 10 - 90) * Math.PI) / 180) * 35}
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Current tilt between base & top sensors</p>
            </div>
          </div>
        </ChartContainer>

        {/* Acceleration Card */}
        <ChartContainer title="Lateral Acceleration" description="Estimated shear force impact">
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold num text-amber-400">
                {baseShearAcc.toFixed(2)}
              </p>
              <span className="text-xs text-slate-500">m/s²</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 flex-shrink-0">
                {baseShearAcc > 0 && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-amber-400"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-amber-400 animate-ping" 
                      style={{ opacity: baseShearAcc > 0.5 ? 0.8 : 0.3 }}
                    />
                  </>
                )}
                <div className="absolute inset-1 rounded-full bg-amber-400/20 border border-amber-400/50" />
              </div>
              <p className="text-xs text-slate-400">
                Estimated structural stress level
              </p>
            </div>
          </div>
        </ChartContainer>
      </motion.div>

      <SectionDivider title="AI Anomaly Detection & Early Warnings" icon={Brain} />

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <AnomalyInsights 
          buildingStatus={bStatus}
          health={health}
          vibrationRatio={vibAmpRatio}
          driftProxy={driftProxy}
        />
      </motion.div>

      <SectionDivider title="System Status" icon={Lightbulb} />

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div 
          className={`glass-card-elevated p-6 border rounded-xl backdrop-blur-xl ${
            baseOnline 
              ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5' 
              : 'border-slate-600/40 bg-slate-900/30'
          }`}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-3 h-3 rounded-full ${baseOnline ? 'bg-emerald-400' : 'bg-slate-600'}`}
            />
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide">Base Sensor</h3>
          </div>
          <p className={`text-xs leading-relaxed ${baseOnline ? 'text-emerald-200' : 'text-slate-400'}`}>
            {baseOnline ? '✓ Connected • Streaming live vibration data • Status: Active' : '✗ Offline / Not responding • Data unavailable'}
          </p>
        </motion.div>

        <motion.div 
          className={`glass-card-elevated p-6 border rounded-xl backdrop-blur-xl ${
            topOnline 
              ? 'border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5' 
              : 'border-slate-600/40 bg-slate-900/30'
          }`}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-3 h-3 rounded-full ${topOnline ? 'bg-blue-400' : 'bg-slate-600'}`}
            />
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide">Top Sensor</h3>
          </div>
          <p className={`text-xs leading-relaxed ${topOnline ? 'text-blue-200' : 'text-slate-400'}`}>
            {topOnline ? '✓ Connected • Streaming live vibration data • Status: Active' : '✗ Offline / Not responding • Data unavailable'}
          </p>
        </motion.div>

        <motion.div 
          className="glass-card-elevated p-6 border border-brand-orange/40 bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 rounded-xl backdrop-blur-xl"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-brand-orange"
            />
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide">System Health</h3>
          </div>
          <p className="text-xs text-brand-orange/90 leading-relaxed">
            {globalStatus === 'ONLINE' ? '✓ All systems operational • Monitoring active • AI detection enabled' : `⚠ Status: ${globalStatus}`}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
