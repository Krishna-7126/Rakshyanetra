// src/components/TopBar.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { WifiOff, Radio, LogOut } from 'lucide-react';

export default function TopBar() {
  const { connected, data } = useApp();
  const { logout } = useAuth();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  const buildingStatus = data?.alerts?.building_status ?? 'normal';

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

  const statusColor = buildingStatus === 'critical' ? 'text-red-400 bg-red-500/10' : buildingStatus === 'warning' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10';
  const statusBorder = buildingStatus === 'critical' ? 'border-red-500/40' : buildingStatus === 'warning' ? 'border-amber-500/40' : 'border-emerald-500/40';
  const chipBase = 'h-9 hidden md:flex items-center gap-2 rounded-lg border px-3 backdrop-blur-sm';

  return (
    <header
      className="topbar-border flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-[96px] relative z-40"
      style={{
        background: 'linear-gradient(90deg, rgba(5,16,32,0.99) 0%, rgba(8,23,43,0.98) 52%, rgba(5,16,32,0.99) 100%)',
        backdropFilter: 'blur(32px)',
      }}
    >
      <motion.div 
        className="flex items-center flex-shrink-0 min-w-0 gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <img src="/rakshyanetra-brand.svg" alt="Rakshyanetra" className="h-[56px] md:h-[64px] w-auto hover:scale-105 transition-transform duration-300" />
        <div className="hidden xl:flex flex-col gap-0.5">
          <div className="brand-wordmark text-sm text-brand-orange tracking-[0.12em] uppercase">Rakshyanetra</div>
          <div className="text-[10px] text-slate-500 font-medium">Structural Health Monitor</div>
        </div>
      </motion.div>

      <div
        className="hidden xl:block flex-1 mx-8 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(236,125,29,0.25), rgba(26,60,120,0.3), transparent)' }}
      />

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Building Health Status */}
        <motion.div 
          className={`${chipBase} ${statusBorder} ${statusColor}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: buildingStatus !== 'normal' ? Infinity : 0 }}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: buildingStatus === 'critical' ? '#EF4444' : buildingStatus === 'warning' ? '#F59E0B' : '#10B981' }}
          />
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase">{buildingStatus === 'normal' ? 'Stable' : buildingStatus === 'warning' ? 'Watch' : 'Alert'}</span>
        </motion.div>

        {/* Firebase Connection */}
        <motion.div 
          className={`${chipBase} border-slate-700/60 bg-slate-900/60`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`}
          />
          <span className={`text-[10px] font-bold tracking-[0.12em] ${connected ? 'text-emerald-300' : 'text-red-300'}`}>
            {connected ? 'SYNC LIVE' : 'SYNC LOST'}
          </span>
        </motion.div>

        {/* Internet Connection */}
        <motion.div 
          className="h-9 hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {online
            ? <Radio size={12} className="text-emerald-300" />
            : <WifiOff size={12} className="text-red-300" />
          }
          <span className={`text-[10px] font-bold tracking-[0.12em] ${online ? 'text-emerald-300' : 'text-red-300'}`}>
            {online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </motion.div>

        {/* Time & Date */}
        <motion.div 
          className="h-9 hidden lg:flex items-center rounded-lg border border-slate-700/60 bg-slate-900/65 px-3 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="num text-xs leading-tight text-slate-200 tracking-[0.08em]">
            <p className="text-slate-400">{date}</p>
            <p className="text-brand-orange font-bold">{time}</p>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-9 flex items-center gap-1.5 rounded-lg border border-slate-700/70 bg-slate-900/60 hover:bg-slate-900/80 px-3 text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm"
          title="Logout"
        >
          <LogOut size={13} />
          <span className="hidden md:inline text-[10px] font-bold tracking-[0.12em]">SIGN OUT</span>
        </motion.button>
      </div>
    </header>
  );
}

