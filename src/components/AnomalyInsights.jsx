// src/components/AnomalyInsights.jsx
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle, Zap, Target, Brain } from 'lucide-react';

export default function AnomalyInsights({ buildingStatus, health, vibrationRatio, driftProxy }) {
  const insights = [];

  // Generate insights based on metrics
  if (vibrationRatio > 1.5) {
    insights.push({
      type: 'warning',
      title: 'High Resonance Detected',
      message: 'Energy amplification exceeds safe threshold. Recommend structural assessment.',
      icon: AlertTriangle,
      color: 'red',
    });
  } else if (vibrationRatio > 1.0) {
    insights.push({
      type: 'caution',
      title: 'Elevated Amplification',
      message: 'Moderate increase in vibration transfer. Monitor closely for pattern changes.',
      icon: Zap,
      color: 'amber',
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Normal Vibration Pattern',
      message: 'Building vibration within expected parameters. Continue routine monitoring.',
      icon: CheckCircle,
      color: 'emerald',
    });
  }

  if (driftProxy > 2.0) {
    insights.push({
      type: 'warning',
      title: 'Structural Drift Alert',
      message: 'Inter-story drift exceeds normal range. Immediate inspection advised.',
      icon: Target,
      color: 'red',
    });
  }

  if (health < 60) {
    insights.push({
      type: 'warning',
      title: 'Health Score Declining',
      message: 'Structural health below acceptable threshold. Preventive maintenance needed.',
      icon: Brain,
      color: 'red',
    });
  }

  if (buildingStatus === 'critical') {
    insights.push({
      type: 'critical',
      title: 'Critical Alert - Immediate Action Required',
      message: 'Multiple anomalies detected. System recommends professional structural inspection immediately.',
      icon: AlertTriangle,
      color: 'red',
    });
  }

  const colorMap = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-300', icon: 'text-red-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-300', icon: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: 'text-emerald-400' },
  };

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        const colors = colorMap[insight.color];

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-lg border px-4 py-3 flex items-start gap-3 backdrop-blur-sm ${colors.bg} ${colors.border}`}
          >
            <motion.div
              animate={insight.type === 'critical' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: insight.type === 'critical' ? Infinity : 0 }}
              className={`flex-shrink-0 mt-0.5 ${colors.icon}`}
            >
              <Icon size={18} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-sm ${colors.text}`}>
                {insight.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {insight.message}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
