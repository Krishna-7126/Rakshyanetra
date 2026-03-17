"use client";

import React from "react";
import { useTelemetry } from "@/components/TelemetryProvider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Activity, ShieldAlert, Zap } from "lucide-react";

export default function VibrationPage() {
  const { metrics, chartData, isMounted } = useTelemetry();

  if (!isMounted) return null;

  // Simulated Frequency Spectrum Data (FFT-like)
  const frequencyData = [
    { freq: "0.5Hz", val: metrics.baseVibration * 0.8 },
    { freq: "1.2Hz", val: metrics.baseVibration * 1.5 },
    { freq: "2.4Hz", val: metrics.baseVibration * 0.4 },
    { freq: "3.8Hz", val: metrics.baseVibration * 0.1 },
    { freq: "5.0Hz", val: metrics.baseVibration * 0.05 },
    { freq: "10Hz", val: metrics.baseVibration * 0.02 },
  ];

  return (
    <div className="p-6 space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="text-neon-amber w-6 h-6" />
          Vibration Analysis
        </h1>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-neon-amber/10 border border-neon-amber/20 rounded-full text-[10px] uppercase font-bold text-neon-amber flex items-center gap-1">
            <Zap className="w-3 h-3" />
            High-Frequency Sampling Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2">
            Real-time Waveform (g)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="base" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBase)" isAnimationActive={false} />
                <Area type="monotone" dataKey="top" stroke="#10b981" fillOpacity={1} fill="url(#colorTop)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-zinc-400 mb-6">Frequency Spectrum (FFT)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <XAxis dataKey="freq" fontSize={10} stroke="#4b5563" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                />
                <Bar dataKey="val">
                  {frequencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? "#f59e0b" : "#3b82f6"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-neon-blue/5 rounded-lg border border-neon-blue/10">
            <p className="text-[10px] text-zinc-400 leading-relaxed italic text-center">
              Primary resonance peak detected at 1.2Hz. Consistent with building height and mass.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-neon-amber">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Peak Ground Accel</p>
          <h2 className="text-2xl font-bold tracking-tighter text-slate-100">{metrics.baseVibration.toFixed(4)} g</h2>
        </div>
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-neon-green">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Max Zenith Sway</p>
          <h2 className="text-2xl font-bold tracking-tighter text-slate-100">{metrics.topVibration.toFixed(4)} g</h2>
        </div>
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-neon-red">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Damping Ratio</p>
          <h2 className="text-2xl font-bold tracking-tighter text-slate-100">1.84 %</h2>
        </div>
      </div>
    </div>
  );
}
