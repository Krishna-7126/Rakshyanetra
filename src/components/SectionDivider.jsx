// src/components/SectionDivider.jsx
import { motion } from 'framer-motion';

export default function SectionDivider({ title, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 my-6 pt-4"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-cyan-400" />}
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
      </div>
      <div
        className="flex-1 h-px rounded-full"
        style={{
          background: 'linear-gradient(90deg, rgba(6,182,212,0.3), transparent)',
        }}
      />
    </motion.div>
  );
}
