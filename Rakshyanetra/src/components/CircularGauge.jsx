// src/components/CircularGauge.jsx
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
  const glowFilter = isOffline ? 'none'    : `drop-shadow(0 0 5px ${arcColor}80)`;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[150px] relative">
      <div className="relative w-full max-w-[120px] aspect-square">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="#1F2937" strokeWidth="11" />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke={arcColor}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{
              transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease',
              filter: glowFilter,
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-[17px] leading-none" style={{ color: textColor }}>
            {rawVal.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{unit}</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 text-center leading-tight px-1 truncate w-full">{label}</p>
      {isOffline && (
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 bg-[#0a1628] px-1 rounded">
          <span className="text-[9px] font-bold text-red-400 border border-red-500/30
                           px-1.5 py-0.5 rounded tracking-widest whitespace-nowrap">
            NODE OFFLINE
          </span>
        </div>
      )}
    </div>
  );
}
