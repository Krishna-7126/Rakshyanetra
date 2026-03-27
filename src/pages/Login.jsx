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
      <div className="absolute inset-0 bg-brand-mesh" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"120\" height=\"120\" viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23FFFFFF\" fill-opacity=\"0.06\"%3E%3Cpath d=\"M60 0h1v120h-1zM0 60h120v1H0z\"/%3E%3Ccircle cx=\"60\" cy=\"60\" r=\"2.2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          backgroundSize: '120px 120px',
        }}
      />
      <div className="absolute -top-28 -left-16 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
      <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[26px] border border-slate-700/80 bg-slate-950/72 shadow-[0_24px_64px_rgba(3,8,20,0.64)] backdrop-blur-2xl">
        <div className="p-7 md:p-10 lg:p-12">
          <div className="flex items-center justify-center mb-10">
            <img src={brandLogo} alt="Rakshyanetra" className="h-23 md:h-23 w-auto" />
          </div>

          <div className="mx-auto w-full max-w-lg">
            <div className="mb-9">
                <h1 className="login-hero-title text-5xl md:text-6xl text-white leading-[0.92] tracking-tight">Welcome back</h1>
                <p className="text-[1.08rem] text-slate-300 mt-4 tracking-[0.008em] leading-relaxed">Sign in to access structural health analytics, live alerts, and AI-assisted risk insights.</p>
                <div className="mt-4 h-px bg-gradient-to-r from-brand-orange/40 via-brand-blue-soft/35 to-transparent" />
            </div>

            <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-7">
                <div>
                  <label className="block text-slate-300 text-[13px] mb-2.5 tracking-[0.09em] uppercase font-semibold">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-10 py-3.5 text-[16px] text-white placeholder:text-slate-500 focus:border-brand-blue-soft focus:ring-2 focus:ring-brand-blue-soft/40 outline-none transition"
                      required
                    />
                  </div>
                </div>

                {!isResetMode && (
                  <div>
                    <label className="block text-slate-300 text-[13px] mb-2.5 tracking-[0.09em] uppercase font-semibold">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-10 py-3.5 text-[16px] text-white placeholder:text-slate-500 focus:border-brand-blue-soft focus:ring-2 focus:ring-brand-blue-soft/40 outline-none transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-300 -mt-2 gap-3">
                  <label className="flex items-center gap-2 select-none text-[13px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-900 focus:ring-brand-blue-soft"
                    />
                    <span className="text-slate-300">Remember me for 30 days</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(!isResetMode)}
                    className="text-brand-orange text-[11px] tracking-[0.08em] uppercase font-semibold hover:text-orange-300"
                  >
                    {isResetMode ? 'Back to login' : 'Forgot password?'}
                  </button>
                </div>

              <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-600 bg-slate-900/85 px-4 py-3.5 text-white text-[18px] font-medium transition hover:bg-slate-800 disabled:opacity-60 mb-1 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-5 h-5 text-brand-orange" />
                  Continue with Google
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 px-4 py-3.5 text-white text-[18px] font-semibold transition hover:brightness-110 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {loading ? (isResetMode ? 'Sending...' : 'Signing in...') : (isResetMode ? 'Send reset link' : 'Sign in securely')}
                  {!loading && <ArrowRight size={16} />}
                </button>

                <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                  <span>Protected by Firebase Authentication</span>
                  <img src={brandLogo} alt="Rakshyanetra" className="h-8 w-auto opacity-90" />
                </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;