"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

interface RiskItem {
  label: string;
  value: number; // 0-100
  color: string;
}

export default function RiskBreakdown() {
  const risks: RiskItem[] = [
    { label: "Vibration", value: 74, color: "bg-neon-amber" },
    { label: "Structural", value: 38, color: "bg-neon-blue" },
    { label: "Thermal", value: 22, color: "bg-neon-blue" },
    { label: "Tilt", value: 15, color: "bg-neon-green" },
    { label: "Gas/Smoke", value: 5, color: "bg-neon-green" },
    { label: "Overall", value: 61, color: "bg-neon-amber" },
  ];

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
            Structural Risk Breakdown
          </h2>
          <p className="text-[10px] tracking-widest text-zinc-500 uppercase mt-1">
            Multi-parameter analysis
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {risks.map((risk) => (
          <div key={risk.label} className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-zinc-400">{risk.label}</span>
              <span className="text-white font-mono">{risk.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <div 
                className={twMerge(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  risk.color,
                  risk.color.replace('bg-', 'shadow-[0_0_8px_rgba(') + ')]' // Dynamic shadow logic simplified for clarity
                )}
                style={{ 
                  width: `${risk.value}%`,
                  boxShadow: `0 0 10px ${risk.color.includes('amber') ? 'rgba(245,158,11,0.3)' : risk.color.includes('blue') ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
