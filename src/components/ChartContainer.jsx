// src/components/ChartContainer.jsx
import { motion } from 'framer-motion';

export default function ChartContainer({
  title,
  description,
  children,
  footer,
  fullWidth = false,
  minimal = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-white/5 bg-slate-900/20 backdrop-blur-sm overflow-hidden transition-all hover:border-cyan-500/20 hover:bg-slate-900/30 ${
        fullWidth ? '' : 'col-span-1'
      }`}
    >
      {!minimal && (
        <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-slate-900/20 to-transparent">
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}

      <div className="p-6 relative">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-3 border-t border-white/5 bg-slate-950/50 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
