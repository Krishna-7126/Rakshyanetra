// src/components/BlockOfflineState.jsx
import { Building2, Radio } from 'lucide-react';

export default function BlockOfflineState({ block }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center select-none">
      {/* Icon cluster */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center">
          <Building2 size={40} className="text-slate-600" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Radio size={14} className="text-slate-600" />
        </div>
      </div>

      {/* Label */}
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
          Block {block}
        </p>
        <h2 className="text-2xl font-semibold text-slate-400 mb-3">
          No Sensors Deployed
        </h2>
        <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
          Block {block} is not yet equipped with MPU6050 sensor nodes.
          Select <span className="text-emerald-500 font-medium">Block A</span> from
          the sidebar to view live structural monitoring data.
        </p>
      </div>

      {/* Decorative "offline" pulse */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div className="w-2 h-2 rounded-full bg-slate-600" />
        <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
          Sensors Offline / Not Installed — Block {block}
        </span>
      </div>
    </div>
  );
}
