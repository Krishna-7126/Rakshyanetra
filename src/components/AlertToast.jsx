// src/components/AlertToast.jsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertToast() {
  const { data, pushAlert } = useApp();
  const [toasts, setToasts] = useState([]);
  const isInitialRender = useRef(true);
  const prevStatus = useRef('normal');
  const prevBaseAlert = useRef(false);
  const prevTopAlert = useRef(false);
  const prevRatioAlert = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => { isInitialRender.current = false; }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const addToast = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg }]);
    pushAlert(msg);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 8000);
  }, [pushAlert]);

  const scheduleToast = useCallback((msg) => {
    setTimeout(() => addToast(msg), 0);
  }, [addToast]);

  // Watch building_status for CRITICAL
  useEffect(() => {
    const status = data?.alerts?.building_status ?? 'normal';
    if (!isInitialRender.current && status === 'critical' && prevStatus.current !== 'critical') {
      scheduleToast('⚠️ CRITICAL ALERT: Building status elevated to CRITICAL by AI system!');
    }
    prevStatus.current = status;
  }, [data?.alerts?.building_status, scheduleToast]);

  // Watch per-node alert flags
  useEffect(() => {
    const bAlert = data?.base?.alert;
    if (!isInitialRender.current && bAlert && !prevBaseAlert.current) {
      scheduleToast('⚠️ CRITICAL ALERT: Sudden Structural Anomaly Detected at Base Node!');
    }
    prevBaseAlert.current = bAlert;
  }, [data?.base?.alert, scheduleToast]);

  useEffect(() => {
    const tAlert = data?.top?.alert;
    if (!isInitialRender.current && tAlert && !prevTopAlert.current) {
      scheduleToast('⚠️ CRITICAL ALERT: Sudden Structural Anomaly Detected at Top Node!');
    }
    prevTopAlert.current = tAlert;
  }, [data?.top?.alert, scheduleToast]);

  useEffect(() => {
    const rAlert = data?.diff?.ratio_alert;
    if (!isInitialRender.current && rAlert && !prevRatioAlert.current) {
      scheduleToast('⚠️ RESONANCE ALERT: High Vibration Amplification Ratio Detected!');
    }
    prevRatioAlert.current = rAlert;
  }, [data?.diff?.ratio_alert, scheduleToast]);

  const dismiss = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl
                       bg-neon-red/10 border border-neon-red/50 text-neon-red
                       shadow-lg glow-red backdrop-blur-sm max-w-sm"
          >
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 critical-blink" />
            <p className="text-sm font-semibold flex-1 leading-snug">{t.msg}</p>
            <button onClick={() => dismiss(t.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
