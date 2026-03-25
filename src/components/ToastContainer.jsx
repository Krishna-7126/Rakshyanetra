// src/components/ToastContainer.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    error: 'bg-red-500/10 border-red-500/20 text-red-300',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 backdrop-blur-sm ${colors[toast.type] || colors.info}`}
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-2 flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts, closeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={closeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
