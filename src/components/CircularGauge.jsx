// src/components/CircularGauge.jsx
import { motion } from 'framer-motion';

// thresholds: optional { warn, crit } absolute-value boundaries for auto-coloring
export default function CircularGauge({
  label, value, max = 10, unit = '', color = '#3B82F6',
  isOffline = false, thresholds = null,
}) {
  const rawVal = isOffline ? 0 : (value ?? 0);  // raw signed value (shown in center)
  const absVal = Math.abs(rawVal);               // absolute value (drives ring + color)
  const pct    = Math.min(absVal / max, 1);
  const R      = 42;
  const C      = 2 * Math.PI * R;
  const dash   = pct * C;
  const gap    = C - dash;

  // Severity-aware color: use thresholds if provided, otherwise caller's color
  let arcColor;
  if (isOffline) {
    arcColor = '#374151';
  } else if (thresholds) {
    arcColor = absVal >= thresholds.crit ? '#EF4444'
             : absVal >= thresholds.warn ? '#F59E0B'
             : '#10B981';
  } else {
    arcColor = color;
  }
  const textColor  = isOffline ? '#6B7280' : arcColor;
  const glowFilter = isOffline ? 'none'    : `drop-shadow(0 0 8px ${arcColor}cc) drop-shadow(0 0 12px ${arcColor}66)`;

  return (
    <motion.div 
      className="flex flex-col items-center gap-2 min-w-[150px] relative"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full max-w-[120px] aspect-square">
        {/* Glow background on hover */}
        <motion.div 
          className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{ background: arcColor }}
        />

        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="xMidYMid meet" 
          className="w-full h-full -rotate-90 drop-shadow-lg"
          style={{
            filter: glowFilter,
          }}
        >
          {/* Outer glow ring */}
          <circle 
            cx="50" cy="50" 
            r={R + 2} 
            fill="none" 
            stroke={arcColor}
            strokeWidth="1" 
            opacity="0.2"
          />
          
          {/* Background track */}
          <circle 
            cx="50" cy="50" 
            r={R} 
            fill="none" 
            stroke="#1F2937" 
            strokeWidth="11"
          />

          {/* Progress arc with smooth animation */}
          <motion.circle
            cx="50" cy="50" 
            r={R}
            fill="none"
            stroke={arcColor}
            strokeWidth="11"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${C}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 4px ${arcColor}80)`,
            }}
          />

          {/* Additional accent ring for depth */}
          <circle 
            cx="50" cy="50" 
            r={R - 6} 
            fill="none" 
            stroke={arcColor}
            strokeWidth="0.5"
            opacity="0.3"
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="num font-bold leading-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 100 }}
            style={{ color: textColor, fontSize: '20px' }}
          >
            {rawVal.toFixed(2)}
          </motion.span>
          <motion.span 
            className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {unit}
          </motion.span>
        </div>
      </div>

      <motion.p 
        className="text-[11px] text-slate-400 text-center leading-tight px-1 truncate w-full font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {label}
      </motion.p>

      {isOffline && (
        <motion.div 
          className="absolute top-[60%] left-1/2 -translate-x-1/2 bg-slate-900/95 px-2 rounded backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[9px] font-bold text-red-400 border border-red-500/50 px-2 py-1 rounded tracking-widest whitespace-nowrap inline-block">
            OFFLINE
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
