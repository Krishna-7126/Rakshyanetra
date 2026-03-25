"use client";

import React from "react";
import { Settings, Bell, Database, Shield, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="text-zinc-400 w-6 h-6" />
          System Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <SlidersHorizontal className="w-5 h-5 text-neon-blue" />
            <h3 className="text-sm font-bold text-slate-200">Sensor Calibration</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-slate-200">Sampling Rate</p>
                <p className="text-[10px] text-zinc-500">Current: 10Hz (Optimized for battery)</p>
              </div>
              <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded transition-colors uppercase">Adjust</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-slate-200">Accelerometer Gain</p>
                <p className="text-[10px] text-zinc-500">Scale: ±2g Range</p>
              </div>
              <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded transition-colors uppercase">Switch Range</button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-neon-amber" />
            <h3 className="text-sm font-bold text-slate-200">Alert Thresholds</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-500">Vibration Warning Level</span>
                <span className="text-neon-amber">0.50 g</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-amber" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-500">Anomaly Confidence Floor</span>
                <span className="text-neon-amber">65%</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-amber" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-neon-green" />
            <h3 className="text-sm font-bold text-slate-200">Data Synchronization</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-500 uppercase">Provider</p>
              <p className="text-xs text-slate-200">Firebase RTDB (beem-guard)</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-500 uppercase">Latency</p>
              <p className="text-xs text-neon-green">42ms (Excellent)</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-500 uppercase">Status</p>
              <span className="flex items-center gap-2 text-[10px] font-bold text-neon-green">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-neon-blue" />
            <h3 className="text-sm font-bold text-slate-200">System Security</h3>
          </div>
          
          <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <p className="text-xs font-bold text-slate-200 mb-1">Node Encryption</p>
            <p className="text-[10px] text-zinc-500 mb-4">AES-256 GCM Hardware-level encryption active on all MPU6050 nodes.</p>
            <button className="w-full py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/20 text-neon-blue text-[10px] font-bold rounded transition-all uppercase tracking-widest">Rotate Keys</button>
          </div>
        </div>
      </div>
    </div>
  );
}
