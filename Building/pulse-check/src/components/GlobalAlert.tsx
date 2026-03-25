"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface GlobalAlertProps {
  message: string;
  type?: "error" | "warning" | "info";
  onClose?: () => void;
}

export default function GlobalAlert({ message, type = "error", onClose }: GlobalAlertProps) {
  const styles = {
    error: "bg-red-500/10 border-red-500/20 text-red-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-xl ${styles[type]} fade-in-up`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
