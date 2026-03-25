"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import AnalogGauge from "@/components/AnalogGauge";
import CriticalAlert from "@/components/CriticalAlert";
import { Activity, ShieldCheck, Database, LayoutDashboard } from "lucide-react";

export default function BeemGuardDashboard() {
  const [mounted, setMounted] = useState(false);
  const [telemetry, setTelemetry] = useState({
    baseVibration: 0,
    topVibration: 0,
    topTilt: 0,
    baseStress: 0
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [muteTriggered, setMuteTriggered] = useState(false);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Firebase integration
  useEffect(() => {
    if (!mounted) return;

    const buildingRef = ref(db, "/building1");
    const unsub = onValue(buildingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTelemetry({
          baseVibration: data.baseVibration || 0,
          topVibration: data.topVibration || 0,
          topTilt: data.topTilt || 0,
          baseStress: data.baseStress || 0
        });
      }
    });

    return () => unsub();
  }, [mounted]);

  // Alert Control Logic
  useEffect(() => {
    const isViolated = telemetry.topVibration > 0.8 || telemetry.topTilt > 10.0;
    
    if (isViolated) {
      if (!muteTriggered) {
        setAlertVisible(true);
      }
    } else {
      // Reset mute if conditions are safe
      setMuteTriggered(false);
      setAlertVisible(false);
    }
  }, [telemetry.topVibration, telemetry.topTilt, muteTriggered]);

  const handleDismiss = () => {
    setAlertVisible(false);
    setMuteTriggered(true);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col p-8 font-sans">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />

      {/* Header */}
      <header className="relative flex items-center justify-between mb-12 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neon-blue/20 rounded-xl flex items-center justify-center border border-neon-blue/40">
            <LayoutDashboard className="text-neon-blue w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
              BeemGuard <span className="text-neon-blue text-sm not-italic font-bold tracking-widest ml-2 bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20">LIVE</span>
            </h1>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Structural Health Monitoring System • Block A-01</p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-neon-blue" />
            <span>Firebase: <span className="text-neon-green">Sync Active</span></span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-neon-green" />
            <span>Integrity: <span className="text-white">99.8%</span></span>
          </div>
        </div>
      </header>

      {/* Main Gauges Grid */}
      <main className="relative flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-7xl mx-auto w-full">
        <AnalogGauge 
          value={telemetry.baseVibration} 
          min={0} 
          max={2.0} 
          label="Base Vibration" 
          unit="G-Force" 
        />
        <AnalogGauge 
          value={telemetry.topVibration} 
          min={0} 
          max={2.0} 
          label="Top Apex Vibration" 
          unit="G-Force" 
        />
        <AnalogGauge 
          value={telemetry.topTilt} 
          min={0} 
          max={25.0} 
          label="Structural Inclination" 
          unit="Degrees" 
        />
      </main>

      {/* Raw Data Matrix */}
      <footer className="relative mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Base Vib", val: telemetry.baseVibration, icon: <Activity size={12} /> },
          { label: "Top Vib", val: telemetry.topVibration, icon: <Activity size={12} /> },
          { label: "Top Tilt", val: telemetry.topTilt, icon: <Activity size={12} /> },
          { label: "Base Stress", val: telemetry.baseStress, icon: <ShieldCheck size={12} /> },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              {item.icon}
              {item.label}
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {item.val.toFixed(3)}
            </div>
          </div>
        ))}
      </footer>

      {/* Overlays */}
      <CriticalAlert isVisible={alertVisible} onDismiss={handleDismiss} />
    </div>
  );
}
