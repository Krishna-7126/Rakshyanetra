// src/pages/Login.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, CheckCircle, ArrowLeft, LogIn } from 'lucide-react';

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
    } catch (err) {
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
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-blue-950 flex items-center justify-center px-4 py-8"
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(14,165,233,0.22), transparent 40%), radial-gradient(circle at 70% 60%, rgba(99,102,241,0.22), transparent 40%)' }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%231F2937\" fill-opacity=\"0.22\"%3E%3Ccircle cx=\"40\" cy=\"40\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[640px]">
          <div className="flex flex-col items-center justify-center p-10 md:p-12">
            <div className="w-full max-w-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                <p className="text-sm text-cyan-200 mt-1">Your infrastructure AI watchdog portal.</p>
              </div>

              <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Email</label>
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

                {!isResetMode && (
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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
                )}

                <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                  <label className="flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-400 bg-slate-800 focus:ring-cyan-500"
                    />
                    Remember me (token expires in 30d)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(!isResetMode)}
                    className="text-cyan-300 hover:text-cyan-200"
                  >
                    {isResetMode ? 'Back to login' : 'Forgot password?'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-500 bg-slate-800/80 px-4 py-3 text-white font-semibold transition hover:bg-slate-700 disabled:opacity-60 mb-2 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Continue with Google
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-white font-semibold transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? (isResetMode ? 'Sending...' : 'Signing in...') : (isResetMode ? 'Send reset link' : 'Sign in')}
                </button>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  {!isResetMode && (
                    <a href="#" className="text-cyan-300 hover:text-cyan-200">Learn more</a>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1528004448556-df72e2dcaf7f?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="relative z-10 h-full p-10 flex flex-col justify-center text-white">
              <h2 className="text-3xl font-bold mb-3">Rakshyanetra Observatory</h2>
              <p className="text-sm text-slate-200 max-w-xs">
                Monitor building health continuously with edge sensors, anomaly scoring, and condition-aware alerts. All data flows into a real-time analytics dashboard for operations teams.
              </p>
              <ul className="mt-6 space-y-3 text-slate-300">
                <li className="flex items-start gap-2"><span className="text-cyan-300">•</span> Live sensor fusion</li>
                <li className="flex items-start gap-2"><span className="text-cyan-300">•</span> AI anomaly prediction</li>
                <li className="flex items-start gap-2"><span className="text-cyan-300">•</span> Alerts & risk insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;