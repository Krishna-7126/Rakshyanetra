// src/components/SessionExpiryWarning.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SessionExpiryWarning() {
  const { logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkExpiry = () => {
      const expiry = Number(localStorage.getItem('remember_me_expiry'));
      if (!expiry) {
        setIsVisible(false);
        return;
      }

      const now = Date.now();
      const remaining = expiry - now;

      // Show warning if less than 1 hour (3600000ms) remaining
      if (remaining > 0 && remaining < 3600000) {
        setIsVisible(true);
        setTimeRemaining(Math.floor(remaining / 1000)); // Convert to seconds
      } else if (remaining <= 0) {
        setIsVisible(false);
        localStorage.removeItem('remember_me_expiry');
      } else {
        setIsVisible(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <AnimatePresence>
      {isVisible && timeRemaining !== null && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-4 z-40 max-w-sm"
        >
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm text-amber-100 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Session expiring soon</p>
                <p className="text-xs opacity-90">
                  Your session will expire in <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs bg-amber-600/80 hover:bg-amber-600 px-3 py-1 rounded-md transition"
                  >
                    <LogOut className="w-3 h-3" />
                    Log out now
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-xs opacity-70 hover:opacity-100 px-2 py-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
