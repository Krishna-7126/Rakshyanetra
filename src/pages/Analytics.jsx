// src/pages/Analytics.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';
import DashboardHeader from '../components/DashboardHeader';
import StatCardEnhanced from '../components/StatCardEnhanced';
import ChartContainer from '../components/ChartContainer';
import SectionDivider from '../components/SectionDivider';
import { BarChart2, RefreshCw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const BASE_HIST_PATH = 'buildings/building_01/sensors/base/history';
const TOP_HIST_PATH  = 'buildings/building_01/sensors/top/history';

function tsToTime(ts) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleTimeString('en-IN', { hour12: false });
}

export default function Analytics() {
  const [merged, setMerged]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Raw snapshots
  const [baseSnap, setBaseSnap] = useState(null);
  const [topSnap,  setTopSnap]  = useState(null);

  // Attach listeners to both history nodes
  useEffect(() => {
    setLoading(true);
    setError(null);

    const baseRef = ref(db, BASE_HIST_PATH);
    const topRef  = ref(db, TOP_HIST_PATH);

    onValue(baseRef, (snap) => {
      setBaseSnap(snap.val());
    }, (err) => setError(err.message));

    onValue(topRef, (snap) => {
      setTopSnap(snap.val());
      setLoading(false);
      setLastFetch(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, (err) => { setError(err.message); setLoading(false); });

    return () => { off(baseRef); off(topRef); };
  }, []);

  // Merge + sort whenever either snapshot changes
  useEffect(() => {
    if (!baseSnap && !topSnap) return;

    const base = baseSnap ?? {};
    const top  = topSnap  ?? {};

    // Collect all slot keys across both
    const allKeys = new Set([...Object.keys(base), ...Object.keys(top)]);
    const rows = [];

    allKeys.forEach((key) => {
      const b = base[key];
      const t = top[key];
      const ts = b?.ts ?? t?.ts ?? 0;
      if (!ts) return; // skip empty slots
      rows.push({
        ts,
        time:       tsToTime(ts),
        'Base RMS': b?.vib_rms      ?? null,
        'Top RMS':  t?.vib_rms      ?? null,
        baseAlert:  b?.alert        ?? false,
        topAlert:   t?.alert        ?? false,
        baseSust:   b?.sustained    ?? false,
        topSust:    t?.sustained    ?? false,
        stressProxy: b?.stress_proxy ?? null,
        tiltX:      t?.tilt_x       ?? null,
        tiltY:      t?.tilt_y       ?? null,
      });
    });

    rows.sort((a, b) => a.ts - b.ts);
    setMerged(rows);
  }, [baseSnap, topSnap]);

  const anyAlert    = merged.some((r) => r.baseAlert || r.topAlert);
  const avgBaseRMS  = merged.reduce((s, r) => s + (r['Base RMS'] ?? 0), 0) / Math.max(merged.length, 1);
  const avgTopRMS   = merged.reduce((s, r) => s + (r['Top RMS']  ?? 0), 0) / Math.max(merged.length, 1);

  const handleRefresh = async () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <DashboardHeader onRefresh={handleRefresh} />

      {/* Summary Stats Grid */}
      {merged.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCardEnhanced
            icon={BarChart2}
            label="History Slots"
            value={merged.length}
            theme="blue"
          />
          <StatCardEnhanced
            icon={CheckCircle}
            label="Avg Base RMS"
            value={avgBaseRMS.toFixed(4)}
            unit="g"
            theme="emerald"
          />
          <StatCardEnhanced
            icon={CheckCircle}
            label="Avg Top RMS"
            value={avgTopRMS.toFixed(4)}
            unit="g"
            theme="blue"
          />
          <StatCardEnhanced
            icon={AlertTriangle}
            label="Alert Events"
            value={merged.filter(r => r.baseAlert || r.topAlert).length}
            status={anyAlert ? 'critical' : 'normal'}
            theme={anyAlert ? 'red' : 'emerald'}
          />
        </motion.div>
      )}

      <SectionDivider title="Historical Data" icon={BarChart2} />

      {/* Area Chart */}
      <ChartContainer
        title="Historical vib_rms Analysis"
        description="Base vs Top sensor readings from ESP32 ring buffer"
        footer={`Total: ${merged.length} measurements • Last sync: ${lastFetch || 'N/A'}`}
        fullWidth
      >
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <RefreshCw size={20} className="text-slate-600 animate-spin mr-2" />
            <span className="text-slate-600 text-sm">Loading ring buffer…</span>
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center text-red-400 gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        ) : merged.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-slate-600 gap-2">
            <p className="text-sm">No history data available yet.</p>
            <p className="text-xs">ESP32 will populate the buffer once data transmission begins.</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={merged} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="baseHistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="topHistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="glass-card px-3 py-2 text-xs min-w-[160px]">
                          <p className="text-slate-400 mb-1.5">{label}</p>
                          {payload.map((p) => (
                            <p key={p.name} style={{ color: p.color }} className="num flex justify-between gap-4">
                              <span>{p.name}</span><span>{(p.value ?? 0).toFixed(4)} g</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                  formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>}
                />
                <Area type="monotone" dataKey="Base RMS"
                  stroke="#10B981" strokeWidth={2} fill="url(#baseHistGrad)"
                  dot={false} connectNulls isAnimationActive={false} />
                <Area type="monotone" dataKey="Top RMS"
                  stroke="#3B82F6" strokeWidth={2} fill="url(#topHistGrad)"
                  dot={false} connectNulls isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartContainer>

      <SectionDivider title="Raw Analytics Log" icon={Clock} />

      {/* Data table */}
      {merged.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card flex flex-col flex-1 min-h-0"
        >
          <div className="px-5 py-3 border-b border-gray-800">
            <p className="text-sm font-semibold text-slate-300">Historical Measurements</p>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="text-left text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="px-4 py-2.5 font-medium">Timestamp</th>
                  <th className="px-4 py-2.5 font-medium">Base RMS</th>
                  <th className="px-4 py-2.5 font-medium">Top RMS</th>
                  <th className="px-4 py-2.5 font-medium">Stress Proxy</th>
                  <th className="px-4 py-2.5 font-medium">Tilt X / Y</th>
                  <th className="px-4 py-2.5 font-medium">Alert</th>
                </tr>
              </thead>
              <tbody>
                {[...merged].reverse().map((row, i) => {
                  const alert = row.baseAlert || row.topAlert;
                  return (
                    <tr key={row.ts + i}
                      className={`border-b border-gray-900 transition-colors
                        ${alert ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/3'}`}>
                      <td className="px-4 py-2 num text-slate-400">{row.time}</td>
                      <td className="px-4 py-2 num text-emerald-400">
                        {row['Base RMS'] != null ? row['Base RMS'].toFixed(4) : '—'}
                      </td>
                      <td className="px-4 py-2 num text-blue-400">
                        {row['Top RMS'] != null ? row['Top RMS'].toFixed(4) : '—'}
                      </td>
                      <td className="px-4 py-2 num text-red-400">
                        {row.stressProxy != null ? row.stressProxy.toFixed(4) : '—'}
                      </td>
                      <td className="px-4 py-2 num text-amber-400">
                        {row.tiltX != null ? `${row.tiltX.toFixed(1)}° / ${row.tiltY?.toFixed(1)}°` : '—'}
                      </td>
                      <td className="px-4 py-2">
                        {alert
                          ? <span className="flex items-center gap-1 text-red-400 font-bold"><AlertTriangle size={11} /> ALERT</span>
                          : <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={11} /> OK</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
