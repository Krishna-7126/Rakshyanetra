"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Settings, 
  FileText, 
  Box, 
  Zap, 
  Compass,
  Monitor,
  Brain,
  Layers
} from "lucide-react";
import { twMerge } from "tailwind-merge";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  count?: number;
  status?: "OK" | "WARNING" | "CRITICAL";
}

const NavItem = ({ icon, label, href, active, count, status }: NavItemProps) => (
  <Link
    href={href}
    className={twMerge(
      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-zinc-800/50 text-white border border-zinc-700/50" 
        : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
    )}
  >
    <div className="flex items-center gap-3">
      <span className={twMerge(
        "transition-colors",
        active ? "text-neon-blue" : "text-zinc-500 group-hover:text-zinc-400"
      )}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    {count !== undefined && (
      <span className={twMerge(
        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
        status === "WARNING" ? "bg-neon-amber/20 text-neon-amber" : 
        status === "CRITICAL" ? "bg-neon-red/20 text-neon-red" : 
        "bg-zinc-800 text-zinc-500"
      )}>
        {count}
      </span>
    )}
    {status === "OK" && !count && (
      <span className="text-[10px] font-bold text-neon-green uppercase tracking-tighter">OK</span>
    )}
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <Link href="/" className="p-6 border-b border-zinc-800/50 flex items-center gap-3">
        <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-tight text-white uppercase leading-none">
            StructGuard
          </h1>
          <span className="text-[10px] text-neon-green font-mono uppercase mt-1">Live Monitor</span>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Analytics Section */}
        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-3">
            Core Monitoring
          </h2>
          <div className="space-y-1">
            <NavItem icon={<BarChart3 size={18} />} label="Overview" href="/" active={pathname === "/"} />
            <NavItem icon={<Zap size={18} />} label="Vibration" href="/vibration" active={pathname === "/vibration"} />
            <NavItem icon={<Compass size={18} />} label="Orientation" href="/tilt" active={pathname === "/tilt"} />
            <NavItem icon={<Layers size={18} />} label="Stress Load" href="/stress" active={pathname === "/stress"} />
          </div>
        </section>

        {/* Intelligence Section */}
        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-3">
            Intelligence
          </h2>
          <div className="space-y-1">
            <NavItem icon={<Brain size={18} />} label="Predictive AI" href="/prediction" active={pathname === "/prediction"} />
            <NavItem icon={<BarChart3 size={18} />} label="Analytics" href="/analytics" active={pathname === "/analytics"} />
          </div>
        </section>

        {/* Quick Links Section */}
        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-3">
            System
          </h2>
          <div className="space-y-1">
            <NavItem icon={<Settings size={18} />} label="Settings" href="/settings" active={pathname === "/settings"} />
            <NavItem icon={<FileText size={18} />} label="Maintenance" href="/settings" />
          </div>
        </section>
      </div>

      {/* Footer / System Info */}
      <div className="p-4 border-t border-zinc-800/50 mt-auto bg-zinc-900/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase">Building:</span>
            <span className="text-xs font-bold text-zinc-300">AITR-BLOCK-C</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <button className="w-full py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-xs font-bold text-zinc-400 transition-colors uppercase tracking-widest">
          Refresh System
        </button>
      </div>
    </aside>
  );
}
