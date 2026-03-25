// src/pages/Analytics.jsx
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart2, RefreshCw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const BASE_HIST_PATH = 'buildings/building_01/sensors/base/history';
const TOP_HIST_PATH  = 'buildings/building_01/sensors/top/history';

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
};

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

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">Historical Analytics</h2>
          <span className="text-xs text-slate-500 ml-2">ESP32 ring buffer · /history/s[0-49]</span>
        </div>
        {lastFetch && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={12} />
            Last sync: {lastFetch}
          </div>
        )}
      </div>

      {/* Summary cards */}
      {merged.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'History Slots',  val: merged.length,            color: '#3B82F6' },
            { label: 'Avg Base RMS',   val: avgBaseRMS.toFixed(4)+' g', color: '#10B981' },
            { label: 'Avg Top RMS',    val: avgTopRMS.toFixed(4)+' g',  color: '#3B82F6' },
            { label: 'Alert Events',   val: merged.filter(r=>r.baseAlert||r.topAlert).length,
              color: anyAlert ? '#EF4444' : '#10B981' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass-card p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
              <p className="num text-xl" style={{ color }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Area Chart */}
      <div className="glass-card p-5 flex flex-col" style={{ height: 280 }}>
        <p className="text-sm font-semibold text-slate-300 mb-3">
          Historical vib_rms — Base vs Top ({merged.length} pts)
        </p>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw size={20} className="text-slate-600 animate-spin" />
            <span className="text-slate-600 ml-2 text-sm">Loading ring buffer…</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-sm gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        ) : merged.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2">
            <p className="text-sm">No history data at /history/s[0-49] yet.</p>
            <p className="text-xs">ESP32 will populate this buffer once it starts sending.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={merged} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6B7280' }} />
                <Area type="monotone" dataKey="Base RMS"
                  stroke="#10B981" strokeWidth={2} fill="url(#baseGrad)"
                  dot={false} connectNulls isAnimationActive={false} />
                <Area type="monotone" dataKey="Top RMS"
                  stroke="#3B82F6" strokeWidth={2} fill="url(#topGrad)"
                  dot={false} connectNulls isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data table */}
      {merged.length > 0 && (
        <div className="glass-card flex flex-col flex-1 min-h-0">
          <div className="px-5 py-3 border-b border-gray-800">
            <p className="text-sm font-semibold text-slate-300">Raw Historical Log</p>
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
        </div>
      )}
    </div>
  );
}
