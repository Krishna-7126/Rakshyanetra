"use client";

import React from "react";
import Gauge from "./Gauge";
import { Brain } from "lucide-react";
import { useTelemetry } from "./TelemetryProvider";

export default function AnomalyScoreCard({ 
  threshold = 0.65, 
  modelName = "Isolation Forest Model" 
}) {
  const { metrics, isMounted } = useTelemetry();
  
  if (!isMounted) return null;
  
  const score = metrics.anomalyScore;

  const getStatus = (val: number) => {
    if (val >= 0.75) return { label: "CRITICAL", color: "red" as const };
    if (val >= 0.5) return { label: "WARNING", color: "amber" as const };
    return { label: "NORMAL", color: "green" as const };
  };

  const status = getStatus(score);

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col h-full overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <Brain className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
              AI Anomaly Score
            </h2>
            <p className="text-[10px] tracking-widest text-zinc-500 uppercase mt-0.5">
              {modelName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <Gauge 
          value={score} 
          min={0} 
          max={1.0} 
          label="Anomaly Confidence" 
          unit="" 
          color={status.color}
          size="lg"
        />
        
        <div className="mt-8 w-full space-y-3">
          <div className="h-2 w-full bg-zinc-800/50 rounded-full flex overflow-hidden">
            <div className="h-full bg-neon-green/40 w-1/2" />
            <div className="h-full bg-neon-amber/40 w-1/4" />
            <div className="h-full bg-neon-red/40 w-1/4" />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>Normal (0-0.5)</span>
            <span>Warn (0.5-0.75)</span>
            <span>Crit ({">"}0.75)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-[10px]">
        <span className="text-zinc-500 uppercase">Threshold:</span>
        <span className="font-mono text-zinc-300">{threshold.toFixed(2)}</span>
      </div>
    </div>
  );
}
