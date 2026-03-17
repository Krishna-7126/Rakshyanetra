"use client";

import React from "react";
import { useTelemetry } from "@/components/TelemetryProvider";
import { Compass, Thermometer, Wind, AlertTriangle, TrendingUp } from "lucide-react";
import Gauge from "@/components/Gauge";

export default function TiltPage() {
  const { metrics, isMounted } = useTelemetry();

  if (!isMounted) return null;

  return (
    <div className="p-6 space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="text-neon-green w-6 h-6" />
          Orientation & Environment
        </h1>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded-full text-[10px] uppercase font-bold text-neon-green flex items-center gap-1">
            <div className="w-1 h-1 bg-neon-green rounded-full animate-pulse" />
            MPU6050 Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Building Tilt (Deg)</h3>
          <Gauge value={metrics.topTilt} min={-5} max={5} label="Top Deviation" unit="°" color="green" size="lg" />
          <p className="text-[10px] text-zinc-500 mt-6 text-center italic">
            Relative deviation from vertical axis at zenith point.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
            <Wind className="w-4 h-4 text-neon-blue" />
            Wind Influence
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Est. Wind Force</span>
                <span className="text-xs font-bold text-slate-100">12.4 kN/m²</span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue w-1/3" />
              </div>
            </div>
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Vibration Damping</span>
                <span className="text-xs font-bold text-neon-green">Optimal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-neon-amber" />
            Thermal Expansion
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tighter text-slate-100">22.4°C</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase">Internal Core Temp</p>
            </div>
            <div className="p-3 bg-neon-amber/10 rounded-xl border border-neon-amber/20">
              <TrendingUp className="w-6 h-6 text-neon-amber" />
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="bg-neon-amber/10 border border-neon-amber/20 rounded p-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
              <p className="text-[10px] text-neon-amber leading-relaxed font-medium">
                Slight thermal expansion detected in south-facing facade. Compensating structural offsets...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
