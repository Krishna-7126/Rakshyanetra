// src/pages/Config.jsx
import { useApp } from '../context/AppContext';
import { Settings } from 'lucide-react';

export default function Config() {
  const { data, connected, forceRefresh } = useApp();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings size={18} className="text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-200">System Configuration</h2>
      </div>

      <div className="glass-card p-5 space-y-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Firebase Connection</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Project ID',      'rakshyanetra01'],
            ['Database',        'default-rtdb'],
            ['Auth Domain',     'rakshyanetra01.firebaseapp.com'],
            ['Connection',      connected ? 'Live ✓' : 'Connecting…'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-slate-500 text-xs">{k}</p>
              <p className="font-mono text-slate-300 text-sm truncate">{v}</p>
            </div>
          ))}
        </div>
        <button
          onClick={forceRefresh}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-neon-blue
                     border border-neon-blue/30 px-4 py-2 rounded-lg hover:bg-neon-blue/10 transition-colors"
        >
          <Settings size={14} />
          Force Reconnect Firebase
        </button>
      </div>

      <div className="glass-card p-5">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Data Paths</p>
        <div className="space-y-2 font-mono text-xs text-slate-400">
          {[
            'buildings/building_01/sensors/base/latest',
            'buildings/building_01/sensors/top/latest',
            'buildings/building_01/differential/latest',
            'buildings/building_01/alerts',
          ].map((p) => (
            <div key={p} className="px-3 py-2 rounded bg-white/5 border border-border-dim">{p}</div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Watchdog Settings</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Node Timeout',   '5 seconds'],
            ['Poll Interval',  '1 second'],
            ['AI Mode',        'Edge (ESP32)'],
            ['Throttle',       'None (ESP32 controlled)'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-slate-500 text-xs">{k}</p>
              <p className="font-mono text-slate-300">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
