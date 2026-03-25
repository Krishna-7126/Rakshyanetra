"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  color?: "blue" | "green" | "amber" | "red";
  size?: "sm" | "md" | "lg";
}

export default function Gauge({
  value,
  min = 0,
  max = 2.0,
  label,
  unit = "g",
  color = "blue",
  size = "md"
}: GaugeProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  const colorMap = {
    blue: "stroke-neon-blue",
    green: "stroke-neon-green",
    amber: "stroke-neon-amber",
    red: "stroke-neon-red"
  };

  const shadowMap = {
    blue: "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    green: "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    amber: "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    red: "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
  };

  const dims = {
    sm: { w: 100, h: 60, r: 40, cx: 50, cy: 50 },
    md: { w: 140, h: 80, r: 55, cx: 70, cy: 70 },
    lg: { w: 200, h: 120, r: 80, cx: 100, cy: 100 }
  };

  const d = dims[size];
  const strokeWidth = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const circumference = Math.PI * d.r;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: d.w, height: d.h }}>
        <svg width={d.w} height={d.h + 20} className="overflow-visible">
          {/* Background Track */}
          <path
            d={`M ${d.cx - d.r} ${d.cy} A ${d.r} ${d.r} 0 0 1 ${d.cx + d.r} ${d.cy}`}
            fill="none"
            className="stroke-zinc-800"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Path */}
          <path
            d={`M ${d.cx - d.r} ${d.cy} A ${d.r} ${d.r} 0 0 1 ${d.cx + d.r} ${d.cy}`}
            fill="none"
            className={twMerge(colorMap[color], shadowMap[color], "transition-all duration-1000 ease-out")}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          
          {/* Scale Ticks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * Math.PI + Math.PI;
            const x1 = d.cx + (d.r - 2) * Math.cos(angle);
            const y1 = d.cy + (d.r - 2) * Math.sin(angle);
            const x2 = d.cx + (d.r + 4) * Math.cos(angle);
            const y2 = d.cy + (d.r + 4) * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                className="stroke-zinc-700"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className={twMerge(
            "font-mono font-bold leading-none tracking-tighter",
            size === "lg" ? "text-4xl" : "text-2xl",
            "text-white"
          )}>
            {value.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">{unit}</span>
        </div>

        {/* Min/Max Labels */}
        <div className="absolute bottom-0 left-0 text-[10px] font-mono text-zinc-600">{min}</div>
        <div className="absolute bottom-0 right-0 text-[10px] font-mono text-zinc-600">{max}</div>
      </div>
      
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">{label}</span>
    </div>
  );
}
