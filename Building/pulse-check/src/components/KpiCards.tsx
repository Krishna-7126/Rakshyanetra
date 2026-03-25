"use client";

import { twMerge } from "tailwind-merge";

export interface KpiData {
  peakVibration: number;   // g-force
  currentLoad: number;     // kg
  integrityScore: number;  // 0-100
}

interface KpiCardsProps {
  data: KpiData;
}

export default function KpiCards({ data }: KpiCardsProps) {
  const cards = [
    {
      title: "Building Status",
      value: "WARNING",
      subtitle: "1 sensor anomaly detected",
      color: "amber",
      type: "status"
    },
    {
      title: "Active Sensors",
      value: "12 / 12",
      subtitle: "All nodes online",
      color: "green",
      type: "metric"
    },
    {
      title: "Anomaly Score",
      value: "0.59",
      subtitle: "Threshold: 0.65",
      color: "amber",
      type: "metric"
    },
    {
      title: "Uptime",
      value: "99.8%",
      subtitle: "Last 30 days",
      color: "green",
      type: "metric"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Target Image Style Building Status */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-neon-amber">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Building Status</h3>
        <div className="bg-neon-amber/10 border border-neon-amber/20 rounded py-2 px-4 mb-2 text-center">
          <span className="text-xl font-bold text-neon-amber tracking-tighter uppercase">
            {data.peakVibration > 0.8 ? "Critical" : data.peakVibration > 0.4 ? "Warning" : "Normal"}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400">
          {data.peakVibration > 0.4 ? "1 sensor anomaly detected" : "All systems normal"}
        </p>
      </div>

      {cards.slice(1).map((card, i) => (
        <div key={i} className="glass-card rounded-xl p-5">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{card.title}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={twMerge(
              "text-2xl font-bold font-mono tracking-tighter",
              card.color === 'amber' ? 'text-neon-amber' : 
              card.color === 'green' ? 'text-neon-green' : 
              card.color === 'red' ? 'text-neon-red' : 'text-white'
            )}>
              {card.value}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium">{card.subtitle}</p>
        </div>
      ))}
      
      {/* Alert Count Style Card */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-neon-red">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-neon-red">Open Alerts</h3>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold font-mono text-neon-red tracking-tighter">3</span>
        </div>
        <p className="text-[10px] text-zinc-400">2 warn · 1 critical</p>
      </div>
    </div>
  );
}
