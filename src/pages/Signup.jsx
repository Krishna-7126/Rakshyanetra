// src/pages/Signup.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, CheckCircle, ArrowLeft, LogIn } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-blue-950 flex items-center justify-center px-4 py-8"
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(14,165,233,0.22), transparent 40%), radial-gradient(circle at 30% 80%, rgba(99,102,241,0.22), transparent 40%)' }} />

      <div className="relative z-10 w-full max-w-md">
        <motion.div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
          <div className="p-8 md:p-10">
            <div className="mb-6 text-center">
              <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-sm text-cyan-200 mt-1">Join Rakshyanetra today</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-10 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-10 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-10 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-300 pt-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 bg-slate-800 focus:ring-cyan-500"
                />
                <label htmlFor="remember" className="select-none">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-white font-semibold transition hover:brightness-110 disabled:opacity-60 mt-6"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-900/70 px-2 text-slate-400">Already have an account?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-xl border border-slate-600 px-4 py-3 text-white font-semibold transition hover:bg-slate-800/50"
              >
                Sign In Instead
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

