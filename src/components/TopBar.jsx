// src/components/TopBar.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { WifiOff, Radio, LogOut } from 'lucide-react';
import brandLogo from '../assets/rakshyanetra-brand.svg';

export default function TopBar() {
  const { connected } = useApp();
  const { logout } = useAuth();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }));
      setDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
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
      className="topbar-border flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-[84px] relative z-40"
      style={{
        background: 'linear-gradient(90deg, rgba(5,16,32,0.98) 0%, rgba(8,23,43,0.96) 52%, rgba(5,16,32,0.98) 100%)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-center flex-shrink-0 min-w-0">
        <img src={brandLogo} alt="Rakshyanetra" className="h-16 md:h-18 w-auto" />
      </div>

      <div
        className="hidden xl:block flex-1 mx-8 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(236,125,29,0.22), rgba(26,60,120,0.28), transparent)' }}
      />

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400 pulse-dot' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-semibold tracking-[0.14em] ${connected ? 'text-emerald-300' : 'text-red-300'}`}>
            {connected ? 'FIREBASE LIVE' : 'SYNC LOST'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-1.5">
          {online
            ? <Radio size={12} className="text-emerald-300" />
            : <WifiOff size={12} className="text-red-300" />
          }
          <span className={`text-[10px] font-semibold tracking-[0.14em] ${online ? 'text-emerald-300' : 'text-red-300'}`}>
            {online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className="hidden lg:flex items-center rounded-xl border border-slate-700/60 bg-slate-900/65 px-3 py-1.5">
          <div className="num text-xs leading-tight text-slate-200 tracking-[0.08em]">
            <p>{date}</p>
            <p className="text-brand-orange">{time}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          title="Logout"
        >
          <LogOut size={13} />
          <span className="hidden md:inline text-[10px] font-semibold tracking-[0.14em]">SIGN OUT</span>
        </button>
      </div>
    </header>
  );
}
