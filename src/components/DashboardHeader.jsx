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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-center justify-between mb-8 px-1"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div 
          className="flex items-center gap-2.5 text-xs mb-3 tracking-wide"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="text-slate-600 font-medium uppercase">Dashboard</span>
          <ChevronRight size={12} className="text-slate-600" />
          <span className="text-brand-orange font-bold uppercase tracking-[0.08em]">{title}</span>
        </motion.div>

        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h1>

        <motion.p 
          className="text-sm text-slate-400 mt-2.5 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Real-time structural health monitoring & analytics
        </motion.p>
      </motion.div>

      <motion.button
        onClick={onRefresh}
        disabled={isRefreshing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange/20 to-brand-orange/10 border border-brand-orange/40 text-brand-orange hover:from-brand-orange/30 hover:to-brand-orange/20 hover:border-brand-orange/60 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm font-semibold text-sm"
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
        >
          <RefreshCw size={16} />
        </motion.div>
        <span>Refresh</span>
      </motion.button>
    </motion.div>
  );
}
