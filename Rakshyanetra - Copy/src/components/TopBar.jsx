// src/components/TopBar.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Wifi, WifiOff, Activity } from 'lucide-react';

const PAGE_LABELS = {
  '/':          'Overview',
  '/vibration': 'Vibration',
  '/tilt':      'Tilt / Inclination',
  '/stress':    'Structural Stress',
  '/ai':        'AI Prediction',
  '/analytics': 'Analytics',
  '/config':    'System Config',
};

export default function TopBar() {
  const { connected, globalStatus } = useApp();
  const location = useLocation();
  const [clock, setClock] = useState('');
  const [netOnline, setNetOnline] = useState(navigator.onLine);

  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Network status
  useEffect(() => {
    const up   = () => setNetOnline(true);
    const down = () => setNetOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  const pageName = PAGE_LABELS[location.pathname] ?? 'Overview';

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border-dim bg-bg-panel z-20 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-neon-green animate-pulse-slow" />
          <span className="font-mono text-xl font-bold tracking-widest text-neon-green glow-green select-none">
            RAKSHYANETRA
          </span>
        </div>
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1 text-sm text-slate-500 pl-4 border-l border-border-dim ml-2">
          <span className="text-slate-400">Rakshyanetra</span>
          <span className="text-slate-600 mx-1">›</span>
          <span className="text-slate-400">Block A</span>
          <span className="text-slate-600 mx-1">›</span>
          <span className="text-neon-blue">{pageName}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5 text-sm">
        {/* Firebase connection */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full pulse-dot ${connected ? 'bg-neon-green' : 'bg-slate-600'}`} />
          <span className={connected ? 'text-neon-green' : 'text-slate-500'}>
            {connected ? 'Firebase Live' : 'Connecting…'}
          </span>
        </div>
        {/* Network */}
        <div className="flex items-center gap-1.5">
          {netOnline
            ? <Wifi size={15} className="text-neon-blue" />
            : <WifiOff size={15} className="text-neon-red" />}
          <span className={netOnline ? 'text-neon-blue' : 'text-neon-red'}>
            {netOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        {/* Clock */}
        <div className="font-mono text-neon-yellow tabular-nums tracking-wider">
          {clock}
        </div>
      </div>
    </header>
  );
}
