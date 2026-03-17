"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  RotateCw, 
  Search,
  Bell
} from "lucide-react";
import { format } from "date-fns";

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
        <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">StructGuard</span>
        <ChevronRight size={14} className="text-zinc-700" />
        <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Monitor</span>
        <ChevronRight size={14} className="text-zinc-700" />
        <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Buildings</span>
        <ChevronRight size={14} className="text-zinc-700" />
        <span className="text-white">AITR Block C - Structural Overview</span>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-neon-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="h-9 w-48 bg-zinc-900/50 border border-zinc-800/50 rounded-lg pl-10 pr-4 text-xs focus:outline-none focus:border-neon-blue/50 focus:w-64 transition-all duration-300"
          />
        </div>

        {/* Sync Info */}
        <div className="flex items-center gap-4 border-l border-zinc-800/50 pl-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Last sync:</span>
            <span className="text-xs font-mono text-white">{format(time, "HH:mm:ss")}</span>
          </div>
          
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white group">
            <RotateCw size={16} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-zinc-500 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full border-2 border-zinc-950" />
        </button>
      </div>
    </header>
  );
}
