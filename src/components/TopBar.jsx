// src/components/TopBar.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, WifiOff, Radio } from 'lucide-react';

// ── Inline SVG logo — shield + buildings, neon cyan/blue ──────
function RakshyanetraLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#06B6D4" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id="buildGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#06B6D4"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
        <filter id="lg" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Shield outline */}
      <path d="M50 4 L92 18 L92 58 Q92 88 50 108 Q8 88 8 58 L8 18 Z"
        fill="url(#shieldFill)" stroke="url(#buildGrad)" strokeWidth="2.8"
        filter="url(#lg)" />
      {/* Left building */}
      <rect x="16" y="38" width="16" height="52" rx="1.5" fill="url(#buildGrad)" opacity="0.80"/>
      <rect x="19" y="44" width="4" height="3.5" rx="0.5" fill="rgba(0,0,0,0.5)"/>
      <rect x="19" y="51" width="4" height="3.5" rx="0.5" fill="rgba(0,0,0,0.5)"/>
      <rect x="19" y="58" width="4" height="3.5" rx="0.5" fill="rgba(0,0,0,0.5)"/>
      {/* Right building */}
      <rect x="68" y="38" width="16" height="52" rx="1.5" fill="url(#buildGrad)" opacity="0.80"/>
      <rect x="71" y="44" width="4" height="3.5" rx="0.5" fill="rgba(0,0,0,0.5)"/>
      <rect x="71" y="51" width="4" height="3.5" rx="0.5" fill="rgba(0,0,0,0.5)"/>
      <rect x="71" y="58" width="4" height="3.5" rx="0.5" fill="rgba(0,0,0,0.5)"/>
      {/* Center tall building */}
      <rect x="39" y="24" width="22" height="66" rx="1.5" fill="white" opacity="0.96"/>
      <rect x="44" y="32" width="5" height="4.5" rx="0.5" fill="rgba(59,130,246,0.8)"/>
      <rect x="44" y="40" width="5" height="4.5" rx="0.5" fill="rgba(59,130,246,0.8)"/>
      <rect x="44" y="48" width="5" height="4.5" rx="0.5" fill="rgba(6,182,212,0.8)"/>
      <rect x="44" y="56" width="5" height="4.5" rx="0.5" fill="rgba(59,130,246,0.8)"/>
      <rect x="44" y="64" width="5" height="4.5" rx="0.5" fill="rgba(6,182,212,0.8)"/>
      {/* Sensor dot at base */}
      <circle cx="50" cy="80" r="3.5" fill="#06B6D4" filter="url(#lg)" opacity="0.9"/>
    </svg>
  );
}

export default function TopBar() {
  const { connected } = useApp();
  const [time, setTime] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    const up   = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => { clearInterval(id); window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  return (
    <header
      className="topbar-border flex-shrink-0 flex items-center px-5 h-14 relative z-40"
      style={{
        background: 'linear-gradient(90deg, rgba(3,7,18,0.97) 0%, rgba(6,15,30,0.95) 50%, rgba(3,7,18,0.97) 100%)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Logo + name */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <RakshyanetraLogo size={36} />
        <div>
          <span
            className="font-bold text-lg tracking-[0.18em] uppercase"
            style={{
              background: 'linear-gradient(90deg, #06B6D4, #6366F1, #06B6D4)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            RAKSHYANETRA
          </span>
          <p className="text-[9px] text-slate-500 tracking-[0.25em] uppercase -mt-0.5">
            AI Structural Health Dashboard
          </p>
        </div>
      </div>

      {/* Decorative center line */}
      <div
        className="flex-1 mx-8 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), rgba(99,102,241,0.3), transparent)' }}
      />

      {/* Status indicators */}
      <div className="flex items-center gap-5 flex-shrink-0">
        {/* Firebase */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-cyan-400 pulse-dot' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-semibold tracking-widest ${connected ? 'text-cyan-400' : 'text-red-400'}`}>
            {connected ? 'FIREBASE LIVE' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Network */}
        <div className="flex items-center gap-1.5">
          {online
            ? <Radio size={12} className="text-emerald-400" />
            : <WifiOff size={12} className="text-red-400" />
          }
          <span className={`text-[10px] font-semibold tracking-widest ${online ? 'text-emerald-400' : 'text-red-400'}`}>
            {online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Clock */}
        <div
          className="num text-sm font-semibold px-3 py-1 rounded-lg"
          style={{
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.2)',
            color: '#06B6D4',
            fontFamily: 'Rajdhani',
            letterSpacing: '0.1em',
          }}
        >
          {time}
        </div>
      </div>
    </header>
  );
}
