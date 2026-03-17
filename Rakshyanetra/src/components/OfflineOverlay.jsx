// src/components/OfflineOverlay.jsx
export default function OfflineOverlay({ nodeLabel, isOffline }) {
  if (!isOffline) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl
                    bg-bg-primary/80 backdrop-blur-sm border border-neon-red/20">
      <div className="flex flex-col items-center gap-2 text-center select-none">
        <div className="w-2 h-2 rounded-full bg-neon-red mx-auto" />
        <p className="text-neon-red font-bold text-sm tracking-wider">
          {nodeLabel} NODE OFFLINE
        </p>
        <p className="text-slate-500 text-xs">Sensors Offline / Not Installed</p>
      </div>
    </div>
  );
}
