"use client";

import { useEffect, useRef } from "react";
import { ScrollText, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

export type EventSeverity = "info" | "warning" | "critical" | "safe";

export interface SystemEvent {
  id: number;
  time: string;
  message: string;
  severity: EventSeverity;
  location: string;
}

interface EventLogProps {
  events: SystemEvent[];
}

const severityConfig: Record<
  EventSeverity,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  info: {
    icon: <Info className="h-3.5 w-3.5 flex-shrink-0" />,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    label: "INFO",
  },
  safe: {
    icon: <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    label: "SAFE",
  },
  warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    label: "WARN",
  },
  critical: {
    icon: <XCircle className="h-3.5 w-3.5 flex-shrink-0" />,
    color: "text-red-400",
    bg: "bg-red-400/10",
    label: "CRIT",
  },
};

export default function EventLog({ events }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-amber-400/10 p-2">
            <ScrollText className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
              Event Log
            </h2>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase">
              System Alerts · Real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1">
          <span className="text-[10px] font-bold tracking-widest text-slate-400">
            {events.length} EVENTS
          </span>
        </div>
      </div>

      {/* Event list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1 space-y-2"
        style={{ maxHeight: "380px" }}
      >
        {events.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-slate-600 text-xs tracking-widest uppercase">
            No events yet...
          </div>
        ) : (
          [...events].reverse().map((event) => {
            const cfg = severityConfig[event.severity];
            return (
              <div
                key={event.id}
                className={twMerge(
                  "rounded-lg p-3 border border-slate-700/40 transition-all duration-300",
                  "hover:border-slate-500/40",
                  event.severity === "critical" ? "border-red-500/20 bg-red-400/5" :
                  event.severity === "warning" ? "border-amber-500/20 bg-amber-400/5" :
                  event.severity === "safe" ? "border-emerald-500/20 bg-emerald-400/5" :
                  "bg-slate-800/30"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className={twMerge("mt-0.5", cfg.color)}>{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={twMerge(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest",
                          cfg.color,
                          cfg.bg
                        )}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 flex-shrink-0">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {event.message}
                    </p>
                    <p className="mt-1 text-[10px] font-mono text-slate-600">
                      📍 {event.location}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
