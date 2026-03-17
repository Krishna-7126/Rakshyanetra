// src/pages/AIPrediction.jsx
import { useApp } from '../context/AppContext';
import { Brain, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

function statusColor(s) {
  if (s === 'critical') return '#ff2d55';
  if (s === 'warning')  return '#ffcc00';
  return '#00ff88';
}
function statusIcon(s) {
  if (s === 'critical') return <AlertTriangle size={16} className="text-neon-red" />;
  if (s === 'warning')  return <AlertCircle   size={16} className="text-neon-yellow" />;
  return <CheckCircle size={16} className="text-neon-green" />;
}

export default function AIPrediction() {
  const { data, baseOnline, topOnline, alertHistory } = useApp();
  const { base, top, diff, alerts } = data;

  const buildingStatus = alerts?.building_status ?? 'normal';
  const healthScore    = alerts?.health_score    ?? 0;
  const baseStatus     = alerts?.base_status     ?? 'normal';
  const topStatus      = alerts?.top_status      ?? 'normal';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Brain size={18} className="text-neon-blue" />
        <h2 className="text-lg font-semibold text-slate-200">AI Structural Prediction</h2>
        <span className="text-xs text-slate-500 ml-2">Edge-computed by ESP32 · read-only display</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="glass-card p-5 flex flex-col items-center gap-3 col-span-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Overall Health Score</p>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1a2f4a" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={statusColor(buildingStatus)}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 263.9} 263.9`}
                style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${statusColor(buildingStatus)})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono" style={{ color: statusColor(buildingStatus) }}>
                {healthScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusIcon(buildingStatus)}
            <span className="font-bold text-sm uppercase tracking-wide" style={{ color: statusColor(buildingStatus) }}>
              {buildingStatus}
            </span>
          </div>
        </div>

        {/* Node Breakdown */}
        <div className="glass-card p-5 col-span-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Per-Node Status</p>
          <div className="space-y-4">
            {/* Base Node */}
            <div className="flex items-start justify-between gap-4 border-b border-border-dim pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(baseStatus)}
                  <span className="text-sm font-semibold text-slate-200">Base Node (MPU6050)</span>
                  {!baseOnline && <span className="text-[9px] font-bold text-neon-red border border-neon-red/30 px-1.5 py-0.5 rounded tracking-widest">OFFLINE</span>}
                </div>
                <p className="text-xs text-slate-500">Monitors foundation vibration and structural stress at floor level</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-mono font-bold" style={{ color: statusColor(baseStatus) }}>{baseStatus.toUpperCase()}</p>
                <p className="text-xs text-slate-500">vib_rms: <span className="text-neon-green">{baseOnline ? (base?.vib_rms ?? 0).toFixed(4) : '0.0000'}</span></p>
                <p className="text-xs text-slate-500">stress:  <span className="text-neon-red">{baseOnline ? (base?.stress_proxy ?? 0).toFixed(4) : '0.0000'}</span></p>
                <p className="text-[10px] mt-1">
                  Alert: <span className={base?.alert ? 'text-neon-red font-bold' : 'text-neon-green'}>
                    {base?.alert ? 'ACTIVE' : 'CLEAR'}
                  </span>
                  {'  '}Sustained: <span className={base?.sustained ? 'text-neon-red font-bold' : 'text-neon-green'}>
                    {base?.sustained ? 'YES' : 'NO'}
                  </span>
                </p>
              </div>
            </div>

            {/* Top Node */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(topStatus)}
                  <span className="text-sm font-semibold text-slate-200">Top Node (MPU6050)</span>
                  {!topOnline && <span className="text-[9px] font-bold text-neon-red border border-neon-red/30 px-1.5 py-0.5 rounded tracking-widest">OFFLINE</span>}
                </div>
                <p className="text-xs text-slate-500">Monitors tilt, inclination, and upper-floor vibration amplitude</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-mono font-bold" style={{ color: statusColor(topStatus) }}>{topStatus.toUpperCase()}</p>
                <p className="text-xs text-slate-500">vib_rms: <span className="text-neon-blue">{topOnline ? (top?.vib_rms ?? 0).toFixed(4) : '0.0000'}</span></p>
                <p className="text-xs text-slate-500">tilt_x/y: <span className="text-neon-yellow">
                  {topOnline ? `${(top?.tilt_x ?? 0).toFixed(2)}° / ${(top?.tilt_y ?? 0).toFixed(2)}°` : '0.00° / 0.00°'}
                </span></p>
                <p className="text-[10px] mt-1">
                  Alert: <span className={top?.alert ? 'text-neon-red font-bold' : 'text-neon-green'}>
                    {top?.alert ? 'ACTIVE' : 'CLEAR'}
                  </span>
                  {'  '}Sustained: <span className={top?.sustained ? 'text-neon-red font-bold' : 'text-neon-green'}>
                    {top?.sustained ? 'YES' : 'NO'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Differential */}
          <div className="mt-4 pt-3 border-t border-border-dim grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Vibration Ratio (Base/Top)</p>
              <p className="font-mono text-lg font-bold text-neon-yellow">{(diff?.vib_ratio ?? 0).toFixed(3)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Ratio Alert</p>
              <p className={`font-mono text-lg font-bold ${diff?.ratio_alert ? 'text-neon-red' : 'text-neon-green'}`}>
                {diff?.ratio_alert ? '⚠ YES' : 'CLEAR'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="glass-card p-4 flex-1 flex flex-col min-h-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Spike Event Log (session)</p>
        {alertHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            No alerts recorded this session
          </div>
        ) : (
          <div className="overflow-y-auto space-y-2 flex-1">
            {alertHistory.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-xs px-3 py-2 rounded-lg bg-neon-red/5 border border-neon-red/20">
                <span className="text-slate-500 flex-shrink-0 font-mono">{a.ts}</span>
                <span className="text-neon-red">{a.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
