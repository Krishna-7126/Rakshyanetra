"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface CriticalAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function CriticalAlert({ isVisible, onDismiss }: CriticalAlertProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative glass-card border-2 border-neon-red p-10 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
        <div className="mx-auto w-20 h-20 bg-neon-red/20 rounded-full flex items-center justify-center border-2 border-neon-red animate-pulse">
          <AlertTriangle className="w-10 h-10 text-neon-red" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-neon-red tracking-tighter uppercase italic">
            Structural Critical
          </h2>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed">
            Automatic sensors have detected values exceeding the building safety threshold. Immediate inspection required.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-4 bg-neon-red text-black font-black uppercase tracking-widest text-sm hover:bg-neon-red/90 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          ACKNOWLEDGE & MUTE
        </button>
      </div>
    </div>
  );
}
