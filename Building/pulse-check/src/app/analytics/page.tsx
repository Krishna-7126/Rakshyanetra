"use client";

import React from "react";
import { useTelemetry } from "@/components/TelemetryProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Brain, Activity, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { metrics, chartData, isMounted } = useTelemetry();

  if (!isMounted) return null;

  const stats = [
    { label: "Peak Velocity", value: `${metrics.topVibration.toFixed(3)} g`, trend: "+2.4%", color: "text-neon-blue" },
    { label: "Avg Amplitude", value: "0.012 mm", trend: "-0.8%", color: "text-neon-green" },
    { label: "Stability Index", value: "98.4%", trend: "Stable", color: "text-neon-blue" },
  ];

  return (
    <div className="p-6 space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="text-neon-blue w-6 h-6" />
          Structural Analytics
        </h1>
        <div className="px-3 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-[10px] uppercase font-bold text-neon-blue">
          Live Analysis Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5 border-l-4 border-l-neon-blue">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tighter text-slate-100">{stat.value}</h2>
              <span className={`text-[10px] font-bold ${stat.color}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-blue" />
            Vibration Spectrum Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} hide />
                <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line type="monotone" dataKey="base" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="top" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
            <Brain className="w-8 h-8 text-neon-blue" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">AI Structural Insights</h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-2">
              Neural network analyzing vibration patterns for potential material fatigue detection. 
              No anomalies detected in current cycle.
            </p>
          </div>
          <button className="px-6 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs font-bold rounded-lg transition-all">
            Generate Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
}
