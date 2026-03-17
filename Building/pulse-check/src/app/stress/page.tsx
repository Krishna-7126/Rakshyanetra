"use client";

import React from "react";
import { useTelemetry } from "@/components/TelemetryProvider";
import { Layers, Thermometer, ShieldCheck, Zap } from "lucide-react";
import Gauge from "@/components/Gauge";

export default function StressPage() {
  const { metrics, isMounted } = useTelemetry();

  if (!isMounted) return null;

  // Calculate percentage for progress bars (simulated relation to metrics)
  const stressPercent = Math.min(((metrics.baseStress - 15000) / 2000) * 100, 100);

  return (
    <div className="p-6 space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="text-neon-blue w-6 h-6" />
          Structural Stress & Load
        </h1>
        <div className="px-3 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-[10px] uppercase font-bold text-neon-blue">
          Strain Gauges Online
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Base Compression Load</h3>
          <Gauge value={metrics.baseStress / 1000} min={10} max={20} label="MN/m²" color="blue" size="lg" />
          <p className="text-[10px] text-zinc-500 mt-6 text-center italic">
            Cumulative load at foundation level B4.
          </p>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-blue" />
              Dynamic Stress Distribution
            </h3>
            <div className="space-y-6">
              {[
                { label: "Core Column C-01", value: stressPercent, extra: `${(metrics.baseStress/1000).toFixed(2)} MN` },
                { label: "Perimeter Beam P-12", value: stressPercent * 0.7, extra: `${(metrics.baseStress/1500).toFixed(2)} MN` },
                { label: "Shear Wall W-04", value: stressPercent * 0.4, extra: "Normal" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-500">{item.label}</span>
                    <span className="text-slate-200">{item.extra}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neon-blue shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500" 
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5 border border-zinc-800 flex items-center gap-4">
              <div className="p-3 bg-neon-amber/10 rounded-lg">
                <Thermometer className="w-5 h-5 text-neon-amber" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Thermal Strain</p>
                <h4 className="text-lg font-bold text-slate-100">{metrics.temperature.toFixed(1)} °C</h4>
              </div>
            </div>
            <div className="glass-card rounded-xl p-5 border border-zinc-800 flex items-center gap-4">
              <div className="p-3 bg-neon-green/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Safety Margin</p>
                <h4 className="text-lg font-bold text-slate-100">84.2%</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
