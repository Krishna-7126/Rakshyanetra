// src/pages/Signup.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import AuthShell from '../components/AuthShell';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      showToast('All fields are required', 'error');
      return false;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return false;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(email, password, rememberMe);
      showToast('Account created successfully!', 'success');

      // Redirect to original location or dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (err) {
      const errorCode = err.code || 'auth/unknown';
      let message = 'Failed to create account';

      if (errorCode === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Password is too weak';
      }

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      direction="right"
      eyebrow="Secure Platform Registration"
      title={<>Create your <span className="text-brand-orange">Rakshyanetra</span> account</>}
      description="Provision secure access to the structural health intelligence console for real-time monitoring and preventive maintenance workflows."
    >
      <form onSubmit={handleSignup} className="space-y-5" autoComplete="on">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-slate-300 text-[12px] mb-3 tracking-[0.12em] uppercase font-semibold">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors duration-300" size={18} />
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-slate-300 text-[12px] mb-3 tracking-[0.12em] uppercase font-semibold">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors duration-300" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="new-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-slate-300 text-[12px] mb-3 tracking-[0.12em] uppercase font-semibold">Confirm Password</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors duration-300" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2.5 text-sm text-slate-300 pt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.34 }}
              >
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-500 bg-slate-900/70 text-brand-orange focus:ring-brand-orange"
                />
                <label htmlFor="remember" className="select-none text-[13px] text-slate-400">
                  Remember me for 30 days
                </label>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="w-full rounded-xl bg-gradient-to-r from-brand-orange via-orange-500 to-brand-orange px-4 py-3.5 text-white text-[15px] font-semibold transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:shadow-brand-orange/30"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>

              <div className="relative mt-6 mb-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/70"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-900/70 px-2 text-slate-500">Already have an account?</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => navigate('/login')}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/35 px-4 py-3.5 text-slate-200 font-semibold transition hover:bg-slate-800/55"
              >
                Sign In Instead
              </motion.button>
      </form>
    </AuthShell>
  );
}

