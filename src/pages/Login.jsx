// src/pages/Login.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import brandLogo from '../assets/rakshyanetra-brand.svg';

function Login() {
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      showToast('Signed in successfully!', 'success');

      // Redirect to original location or dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (err) {
      const errorCode = err.code || 'auth/unknown';
      let message = 'Failed to sign in';

      if (errorCode === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (errorCode === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      await loginWithGoogle(rememberMe);
      showToast('Signed in with Google!', 'success');

      // Redirect to original location or dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch {
      showToast('Failed to sign in with Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast('Please enter your email address first.', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      showToast('Password reset email sent! Check your inbox/spam.', 'success');
      setIsResetMode(false);
      setEmail('');
    } catch (err) {
      const errorCode = err.code || 'auth/unknown';
      let message = 'Failed to send reset email';

      if (errorCode === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="min-h-screen relative overflow-hidden bg-brand-deep flex items-center justify-center px-4 py-8"
    >
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-slate-900 to-brand-deep" />
      
      {/* Animated gradient orbs */}
      <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-brand-blue/25 blur-3xl opacity-80" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl opacity-80" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-slate-800/30 blur-3xl opacity-40" />

      {/* Subtle technical background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] md:opacity-[0.14]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(106,143,191,0.25) 0px, rgba(106,143,191,0.25) 1px, transparent 1px, transparent 72px), repeating-linear-gradient(0deg, rgba(106,143,191,0.18) 0px, rgba(106,143,191,0.18) 1px, transparent 1px, transparent 72px)',
        }}
      />
      <div
        className="login-bg-glow absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(70% 45% at 15% 20%, rgba(236,125,29,0.08) 0%, transparent 70%), radial-gradient(55% 40% at 80% 75%, rgba(106,143,191,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[26px] border border-slate-600/50 bg-gradient-to-b from-slate-900/80 to-slate-950/90 shadow-[0_32px_64px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="p-7 md:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-9">
              <div className="flex items-center justify-start mb-6">
                <motion.img
                  src={brandLogo}
                  alt="Rakshyanetra"
                  className="h-14 md:h-16 w-auto"
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45 }}
                />
              </div>

              <motion.p
                className="text-[11px] tracking-[0.16em] uppercase text-brand-orange/90 font-semibold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Secure Console Login
              </motion.p>

              <motion.h1
                className="login-hero-title mt-2 text-4xl md:text-5xl text-white leading-[1.02] tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                Welcome to <span className="text-brand-orange">Rakshyanetra</span>
              </motion.h1>

              <motion.p
                className="text-base text-slate-300 mt-4 font-medium leading-relaxed max-w-[62ch]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                Structural health monitoring platform with AI-driven anomaly detection for early warnings and preventive maintenance decisions.
              </motion.p>
            </div>

            <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-6">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                </motion.div>

                {!isResetMode && (
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  className="flex items-center justify-between text-sm gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="flex items-center gap-2.5 select-none text-[13px] cursor-pointer group">
                    <div className="relative w-5 h-5">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 rounded border border-slate-600 bg-slate-900/60 checked:bg-brand-orange checked:border-brand-orange cursor-pointer transition-all duration-200"
                      />
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me for 30 days</span>
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => setIsResetMode(!isResetMode)}
                    whileHover={{ color: '#fda047' }}
                    className="text-brand-orange text-[11px] tracking-[0.08em] uppercase font-semibold hover:opacity-80 transition-all"
                  >
                    {isResetMode ? 'Back to login' : 'Forgot password?'}
                  </motion.button>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-orange via-orange-500 to-brand-orange px-4 py-3.5 text-white text-[15px] font-semibold transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:shadow-brand-orange/30"
                >
                  <span>{loading ? (isResetMode ? 'Sending...' : 'Signing in...') : (isResetMode ? 'Send reset link' : 'Sign in securely')}</span>
                  {!loading && <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}><ArrowRight size={16} /></motion.div>}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="w-full rounded-xl border border-slate-600/60 bg-slate-900/60 hover:bg-slate-900/80 px-4 py-3.5 text-white text-[15px] font-medium transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5 backdrop-blur-sm"
                >
                  <KeyRound className="w-4.5 h-4.5 text-brand-orange" />
                  Continue with Google
                </motion.button>

                <motion.div 
                  className="flex justify-between items-center text-xs text-slate-500 pt-2 px-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <span className="hover:text-slate-400 transition-colors cursor-default">Protected by Firebase Authentication</span>
                  <motion.img 
                    src={brandLogo} 
                    alt="Rakshyanetra" 
                    className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                  />
                </motion.div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;