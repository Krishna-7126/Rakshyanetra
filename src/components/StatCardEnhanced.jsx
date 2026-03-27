// src/components/StatCardEnhanced.jsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function StatCardEnhanced({
  icon: Icon,
  label,
  value,
  unit = '',
  trend = null,
  trendPercent = 0,
  status = 'normal',
  offline = false,
  theme = 'cyan',
}) {
  const themeStyles = {
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/5',
      text: 'text-cyan-400',
      glow: 'rgba(6,182,212,0.2)',
    },
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      text: 'text-blue-400',
      glow: 'rgba(59,130,246,0.2)',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-400',
      glow: 'rgba(16,185,129,0.2)',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      glow: 'rgba(245,158,11,0.2)',
    },
    red: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      text: 'text-red-400',
      glow: 'rgba(239,68,68,0.2)',
    },
  };

  const style = themeStyles[theme] || themeStyles.cyan;
  const statusStyles = {
    normal: 'bg-emerald-500/10 border-emerald-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    critical: 'bg-red-500/10 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-xl border ${style.border} ${style.bg} p-5 backdrop-blur-sm overflow-hidden group transition-all hover:shadow-lg`}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px ${style.glow}`,
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, ${style.glow}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${style.bg} border ${style.border}`}>
            <Icon size={18} className={style.text} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trendPercent)}%
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
          {label}
        </p>

        <div className="flex items-baseline gap-2 mb-3">
          <p className={`text-2xl font-bold num ${style.text}`}>
            {offline ? '—' : value}
          </p>
          {unit && <span className="text-xs text-slate-600">{unit}</span>}
        </div>

        {offline ? (
          <div className="inline-block px-2 py-1 rounded-md bg-slate-500/10 border border-slate-600/30 text-xs text-slate-400 flex items-center gap-1">
            <AlertCircle size={12} />
            Offline
          </div>
        ) : (
          <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${statusStyles[status]}`}>
            {status === 'normal' && 'Normal'}
            {status === 'warning' && 'Alert'}
            {status === 'critical' && 'Critical'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
