// src/components/SectionDivider.jsx
import { motion } from 'framer-motion';

export default function SectionDivider({ title, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-3 my-8 pt-6"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-orange/15 border border-brand-orange/30"
          >
            <Icon size={18} className="text-brand-orange" />
          </motion.div>
        )}
        <motion.h2 
          className="text-base font-bold text-slate-100 tracking-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h2>
      </div>
      <div className="flex-1 h-px rounded-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(236,125,29,0.6), rgba(236,125,29,0.1), transparent)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
}
