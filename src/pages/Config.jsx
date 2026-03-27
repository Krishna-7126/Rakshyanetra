// src/pages/Config.jsx
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import DashboardHeader from '../components/DashboardHeader';
import ChartContainer from '../components/ChartContainer';
import SectionDivider from '../components/SectionDivider';
import { Settings, Zap, Shield, Clock, RefreshCw } from 'lucide-react';

export default function Config() {
  const { data, connected, forceRefresh } = useApp();

  const handleRefresh = async () => {
    await forceRefresh();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <DashboardHeader onRefresh={handleRefresh} />

      <SectionDivider title="Firebase Connection" icon={Zap} />

      {/* Firebase Connection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-blue-500/30 bg-blue-500/5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
              Firebase Database
            </h3>
            <p className="text-xs text-slate-500 mt-1">Real-time sensor data synchronization</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/30 text-slate-400'}`}>
            {connected ? 'Connected' : 'Connecting'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            ['Project ID', 'rakshyanetra01'],
            ['Database', 'default-rtdb'],
            ['Auth Domain', 'rakshyanetra01.firebaseapp.com'],
            ['Status', connected ? 'Live ✓' : 'Connecting…'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-lg bg-white/5 border border-slate-700/50">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{k}</p>
              <p className="font-mono text-slate-300 text-sm truncate">{v}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-400
                     border border-blue-500/30 px-4 py-2.5 rounded-lg hover:bg-blue-500/10 transition-all group"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform" />
          Force Reconnect Firebase
        </button>
      </motion.div>

      <SectionDivider title="Data Paths" icon={Shield} />

      {/* Data Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="space-y-2">
          {[
            'buildings/building_01/sensors/base/latest',
            'buildings/building_01/sensors/top/latest',
            'buildings/building_01/differential/latest',
            'buildings/building_01/alerts',
          ].map((p) => (
            <div key={p} className="px-4 py-2.5 rounded-lg bg-white/5 border border-slate-700/50 hover:bg-white/8 transition-colors">
              <p className="font-mono text-xs text-slate-400">{p}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <SectionDivider title="Watchdog Settings" icon={Clock} />

      {/* Watchdog Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[
          {
            title: 'Node Timeout',
            value: '5 seconds',
            description: 'Maximum wait time before marking node offline',
            icon: Clock,
          },
          {
            title: 'Poll Interval',
            value: '1 second',
            description: 'Frequency of sensor data polling',
            icon: Zap,
          },
          {
            title: 'AI Mode',
            value: 'Edge (ESP32)',
            description: 'Anomaly detection runs on device',
            icon: Shield,
          },
          {
            title: 'Throttle',
            value: 'None (ESP32)',
            description: 'ESP32 controls transmission rate',
            icon: Settings,
          },
        ].map(({ title, value, description, icon: Icon }) => (
          <div key={title} className="glass-card p-5 border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-start gap-3">
              <Icon size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{title}</p>
                <p className="text-sm font-semibold text-slate-200 mt-1">{value}</p>
                <p className="text-xs text-slate-500 mt-1.5">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
