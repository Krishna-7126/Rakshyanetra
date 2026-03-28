// src/components/StatCardEnhanced.jsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';

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
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/8',
      text: 'text-cyan-300',
      glow: 'rgba(6,182,212,0.3)',
      accent: 'rgba(6,182,212,0.5)',
    },
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/8',
      text: 'text-blue-300',
      glow: 'rgba(59,130,246,0.3)',
      accent: 'rgba(59,130,246,0.5)',
    },
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/8',
      text: 'text-emerald-300',
      glow: 'rgba(16,185,129,0.3)',
      accent: 'rgba(16,185,129,0.5)',
    },
    amber: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/8',
      text: 'text-amber-300',
      glow: 'rgba(245,158,11,0.3)',
      accent: 'rgba(245,158,11,0.5)',
    },
    red: {
      border: 'border-red-500/40',
      bg: 'bg-red-500/8',
      text: 'text-red-300',
      glow: 'rgba(239,68,68,0.3)',
      accent: 'rgba(239,68,68,0.5)',
    },
  };

  const style = themeStyles[theme] || themeStyles.cyan;
  const statusStyles = {
    normal: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    warning: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    critical: 'bg-red-500/15 border-red-500/40 text-red-300',
  };

  const trendColor = trend === 'up' 
    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
    : 'bg-red-500/20 border-red-500/40 text-red-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ 
        y: -6, 
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className={`relative rounded-2xl border ${style.border} ${style.bg} p-6 backdrop-blur-xl overflow-hidden group`}
      style={{
        boxShadow: `
          0 1px 3px rgba(0,0,0,0.12),
          0 8px 32px rgba(0,0,0,0.2),
          inset 0 1px 0 rgba(255,255,255,0.08),
          0 0 1px ${style.accent}
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Premium gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 68% 32%, ${style.glow}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Shimmer effect on hover */}
      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500"
        style={{
          background: `linear-gradient(45deg, ${style.accent}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className={`p-3 rounded-xl ${style.bg} border ${style.border} backdrop-blur-md`}
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={20} className={`${style.text} transition-colors duration-300`} />
          </motion.div>

          {trend && (
            <motion.div 
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm ${trendColor}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {trend === 'up' ? (
                <TrendingUp size={14} className="text-emerald-400" />
              ) : (
                <TrendingDown size={14} className="text-red-400" />
              )}
              <span>{Math.abs(trendPercent)}%</span>
            </motion.div>
          )}
        </div>

        <motion.p 
          className="text-xs text-slate-400 uppercase tracking-[0.12em] mb-2 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {label}
        </motion.p>

        <div className="flex items-baseline gap-2 mb-4">
          <motion.p 
            className={`text-3xl font-bold num ${style.text}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {offline ? '—' : value}
          </motion.p>
          {unit && (
            <motion.span 
              className={`text-xs ${style.text} opacity-70`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.2 }}
            >
              {unit}
            </motion.span>
          )}
        </div>

        {offline ? (
          <motion.div 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-500/20 border border-slate-600/40 text-xs font-medium text-slate-300 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle size={13} />
            Offline
          </motion.div>
        ) : (
          <motion.div 
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm ${statusStyles[status]}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              status === 'normal' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
            }`} />
            {status === 'normal' && 'Healthy'}
            {status === 'warning' && 'Warning'}
            {status === 'critical' && 'Alert'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
