"use client";

import React from "react";

interface AnalogGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
}

export default function AnalogGauge({
  value,
  min,
  max,
  label,
  unit,
}: AnalogGaugeProps) {
  // Constrain value
  const clampedValue = Math.min(Math.max(value, min), max);
  
  // Calculate rotation (from -90 to 90 degrees for a semi-circle)
  const percentage = (clampedValue - min) / (max - min);
  const rotation = percentage * 180 - 90;

  // Determine color based on sectors
  const getColor = (pct: number) => {
    if (pct > 0.8) return "#ef4444"; // Red
    if (pct > 0.5) return "#f59e0b"; // Yellow/Amber
    return "#10b981"; // Green
  };

  const currentColor = getColor(percentage);

  return (
    <div className="flex flex-col items-center p-4 glass-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="relative w-48 h-32 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Background Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Colored Sector Indicator */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={currentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 * (1 - percentage)}
            className="transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ filter: `drop-shadow(0 0 5px ${currentColor}80)` }}
          />

          {/* Scale Markers */}
          <text x="10" y="58" fontSize="5" fill="#6b7280" textAnchor="middle">{min}</text>
          <text x="50" y="8" fontSize="5" fill="#6b7280" textAnchor="middle">{(max/2).toFixed(1)}</text>
          <text x="90" y="58" fontSize="5" fill="#6b7280" textAnchor="middle">{max}</text>

          {/* Needle */}
          <g transform={`rotate(${rotation}, 50, 50)`} className="transition-transform duration-700 ease-out">
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="3" fill="white" />
          </g>
        </svg>
        
        {/* Digital Readout */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-2xl font-black tracking-tighter text-white">
            {value.toFixed(3)}
          </span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest -mt-1">
            {unit}
          </span>
        </div>
      </div>
      
      <p className="mt-4 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-center">
        {label}
      </p>
    </div>
  );
}
