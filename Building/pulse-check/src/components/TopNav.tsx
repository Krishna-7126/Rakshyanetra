"use client";

import { useEffect, useState } from "react";
import { Activity, Wifi, Shield } from "lucide-react";

export default function TopNav() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-card sticky top-0 z-50 w-full border-b border-cyan-400/10">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/30">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 pulse-dot" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-widest text-slate-100 uppercase">
                Pulse<span className="text-neon-cyan">-Check</span>
              </h1>
              <p className="truncate text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                Structural Health Monitoring
              </p>
            </div>
          </div>

          {/* Center – Digital Clock */}
          <div className="hidden md:flex flex-col items-center">
            <span className="font-mono text-xl font-bold tracking-widest text-neon-cyan tabular-nums">
              {time || "00:00:00"}
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">
              {date || "---"}
            </span>
          </div>

          {/* Right – Status Indicators */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sensors Online */}
            <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 ring-1 ring-emerald-400/30">
              <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-ring" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-dot" />
              </div>
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="hidden sm:block text-[11px] font-semibold tracking-widest text-emerald-300 uppercase">
                Sensors Online
              </span>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1.5 ring-1 ring-cyan-400/20">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold tracking-widest text-cyan-300 uppercase">
                ESP32 | MPU6050
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
