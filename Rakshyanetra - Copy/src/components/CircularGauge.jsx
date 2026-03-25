// src/components/CircularGauge.jsx
// SVG arc-based circular gauge — last known value retained when offline (no zeroing)
export default function CircularGauge({ label, value, max = 10, unit = '', color = '#3B82F6', isOffline = false }) {
  const displayVal = value ?? 0;           // always show real/last-known value
  const pct   = Math.min(displayVal / max, 1);
  const R     = 42;
  const C     = 2 * Math.PI * R;
  const dash  = pct * C;
  const gap   = C - dash;

  // Color: dim if offline but retain last known arc
  const arcColor  = isOffline ? '#374151' : color;
  const textColor = isOffline ? '#6B7280' : color;
  const glowFilter = isOffline ? 'none' : `drop-shadow(0 0 5px ${color}80)`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[110px] h-[110px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
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
            {displayVal.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{unit}</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 text-center leading-tight px-1">{label}</p>
      {isOffline && (
        <span className="text-[9px] font-bold text-red-400 border border-red-500/30
                         px-1.5 py-0.5 rounded tracking-widest">
          NODE OFFLINE
        </span>
      )}
    </div>
  );
}
