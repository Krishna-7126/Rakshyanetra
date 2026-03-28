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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl border border-slate-600/40 bg-gradient-to-b from-slate-900/50 to-slate-950/40 backdrop-blur-xl overflow-hidden transition-all hover:border-brand-orange/30 hover:bg-gradient-to-b hover:from-slate-900/60 hover:to-slate-950/50 ${
        fullWidth ? '' : 'col-span-1'
      }`}
      style={{
        boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {!minimal && (
        <motion.div 
          className="px-6 py-4 border-b border-slate-600/30 bg-gradient-to-r from-slate-900/40 via-slate-900/30 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h3 
            className="text-sm font-semibold text-slate-100 tracking-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h3>
          {description && (
            <motion.p 
              className="text-xs text-slate-500 mt-1.5 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>
      )}

      <div className="p-6 relative">
        <div className="absolute inset-0 opacity-0 hover:opacity-5 transition-opacity duration-500" style={{
          background: 'radial-gradient(circle at 68% 32%, rgba(236,125,29,0.3), transparent 60%)',
          pointerEvents: 'none',
        }} />
        {children}
      </div>

      {footer && (
        <motion.div 
          className="px-6 py-3 border-t border-slate-600/30 bg-slate-950/60 text-xs text-slate-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  );
}
