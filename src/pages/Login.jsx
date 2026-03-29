// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import AuthShell from '../components/AuthShell';

const REMEMBER_PREF_KEY = 'remember_me_pref';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

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

  useEffect(() => {
    const rememberPref = localStorage.getItem(REMEMBER_PREF_KEY) === 'true';
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';

    setRememberMe(rememberPref);
    if (rememberPref && rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  const persistRememberPreference = (remember, currentEmail) => {
    localStorage.setItem(REMEMBER_PREF_KEY, String(remember));
    if (remember && currentEmail) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, currentEmail);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      persistRememberPreference(rememberMe, email);
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
      persistRememberPreference(rememberMe, email);
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
    <AuthShell
      direction="left"
      eyebrow="Secure Console Login"
      title={<>Welcome to <span className="text-brand-orange">Rakshyanetra</span></>}
      description="Structural health monitoring platform with AI-driven anomaly detection for early warnings and preventive maintenance decisions."
    >
      <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-6" autoComplete="on">
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
                        name="password"
                        autoComplete="current-password"
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
                  <span className="text-[10px] tracking-[0.16em] uppercase text-slate-500">SOC Compliant</span>
                </motion.div>
      </form>
    </AuthShell>
  );
}

export default Login;