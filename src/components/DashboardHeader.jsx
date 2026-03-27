// src/components/DashboardHeader.jsx
import { motion } from 'framer-motion';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Overview',
  '/vibration': 'Vibration Analysis',
  '/tilt': 'Tilt / Inclination',
  '/stress': 'Structural Stress',
  '/ai': 'AI Prediction',
  '/analytics': 'Analytics',
  '/config': 'System Configuration',
};

export default function DashboardHeader({ onRefresh, isRefreshing }) {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Dashboard';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-slate-500">Dashboard</span>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-cyan-400 font-semibold">{title}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time structural health monitoring</p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all hover:border-cyan-500/50 disabled:opacity-50"
      >
        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        <span className="text-sm font-medium">Refresh</span>
      </button>
    </motion.div>
  );
}
