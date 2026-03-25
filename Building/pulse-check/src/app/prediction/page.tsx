"use client";

import React from "react";
import { useTelemetry } from "@/components/TelemetryProvider";
import { Brain, Cpu, ShieldCheck, Activity } from "lucide-react";

export default function PredictionPage() {
  const { metrics, isMounted } = useTelemetry();

  if (!isMounted) return null;

  const predictions = [
    { label: "Structural Fatigue", probability: "2%", status: "Safe", color: "text-neon-green" },
    { label: "Resonance Risk", probability: "14%", status: "Normal", color: "text-neon-blue" },
    { label: "Settlement Deviation", probability: "0.1%", status: "Safe", color: "text-neon-green" },
  ];

  return (
    <div className="p-6 space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-neon-amber w-6 h-6" />
          AI Prediction Engine
        </h1>
        <div className="px-3 py-1 bg-neon-amber/10 border border-neon-amber/20 rounded-full text-[10px] uppercase font-bold text-neon-amber">
          Engine Status: Optimizing
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neon-green" />
              Probabilistic Risk Assessment
            </h3>
            <div className="space-y-6">
              {predictions.map((p) => (
                <div key={p.label} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">{p.label}</span>
                    <span className={`font-bold ${p.color}`}>{p.status} ({p.probability})</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full ${p.color.replace('text-', 'bg-')}/50`} 
                      style={{ width: p.probability }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neon-blue/10 rounded-lg">
                  <Cpu className="w-5 h-5 text-neon-blue" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Processing Node</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Analysis performed on Edge-Compute Node SHM-Alpha-4. Latency: 42ms.
              </p>
            </div>
            <div className="glass-card rounded-xl p-5 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neon-amber/10 rounded-lg">
                  <Activity className="w-5 h-5 text-neon-amber" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Data Fidelity</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Source: {metrics.baseVibration > 0 ? "Live Telemetry" : "Cached Samples"}. Signal Confidence: 99.8%.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-neon-amber/20 bg-neon-amber/[0.02]">
            <h3 className="text-sm font-bold text-neon-amber mb-4">Maintenance Forecast</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1 bg-neon-amber h-8 rounded-full mt-1" />
                <div>
                  <p className="text-xs font-bold text-slate-200">Sensor Calibration</p>
                  <p className="text-[10px] text-zinc-500 italic">Recommended in 12 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 bg-zinc-800 h-8 rounded-full mt-1" />
                <div>
                  <p className="text-xs font-bold text-zinc-400">Structural Audit</p>
                  <p className="text-[10px] text-zinc-500 italic">Next scheduled: Oct 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-4">Neural Model Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-zinc-500">Architecture</span>
                <span className="text-slate-200">LSTM-Transformer</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-zinc-500">Epochs</span>
                <span className="text-slate-200">1,240</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-zinc-500">Accuracy</span>
                <span className="text-neon-green">94.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
