import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import AuthShell from '../components/AuthShell';
import { auth } from '../firebase';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isResetMode = mode === 'resetPassword';

  useEffect(() => {
    let active = true;

    const verifyCode = async () => {
      if (!isResetMode || !oobCode) {
        if (active) {
          setError('Invalid password reset link. Please request a new one.');
          setVerifying(false);
        }
        return;
      }

      try {
        const resolvedEmail = await verifyPasswordResetCode(auth, oobCode);
        if (!active) return;
        setEmail(resolvedEmail);
        setError('');
      } catch {
        if (!active) return;
        setError('This reset link is invalid or has expired. Please request a new one.');
      } finally {
        if (active) setVerifying(false);
      }
    };

    verifyCode();

    return () => {
      active = false;
    };
  }, [isResetMode, oobCode]);

  const canSubmit = useMemo(() => {
    return password.length >= 6 && confirmPassword.length >= 6 && password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oobCode) {
      setError('Invalid password reset link. Please request a new one.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setTimeout(() => navigate('/login?reauth=1', { replace: true }), 1800);
    } catch {
      setError('Could not reset password. The link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      direction="left"
      eyebrow="Secure Account Recovery"
      title={<>Reset your <span className="text-brand-orange">password</span></>}
      description="Set a new password to restore access to your monitoring console."
    >
      {verifying ? (
        <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-5 text-slate-300 text-sm">Verifying reset link...</div>
      ) : success ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 mt-0.5" size={18} />
            <div>
              <h3 className="text-emerald-300 font-semibold text-sm tracking-[0.04em] uppercase">Password Updated</h3>
              <p className="text-emerald-100/90 mt-1 text-sm">Your password has been reset successfully. Redirecting to sign in...</p>
            </div>
          </div>
        </motion.div>
      ) : error && !email ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-5"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-red-400 mt-0.5" size={18} />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold text-sm tracking-[0.04em] uppercase">Reset Link Error</h3>
              <p className="text-red-100/90 mt-1 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => navigate('/login?reauth=1', { replace: true })}
                className="mt-4 rounded-lg border border-slate-700/80 bg-slate-900/45 px-4 py-2 text-slate-200 text-sm font-semibold hover:bg-slate-800/55 transition"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/45 p-4">
            <p className="text-[11px] tracking-[0.12em] uppercase text-slate-400 font-semibold">Account</p>
            <p className="mt-1 text-slate-200 font-medium">{email}</p>
          </div>

          <div>
            <label className="block text-slate-300 text-[12px] mb-3 tracking-[0.12em] uppercase font-semibold">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors duration-300" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-[12px] mb-3 tracking-[0.12em] uppercase font-semibold">Confirm New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors duration-300" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-11 py-3.5 text-white placeholder:text-slate-600 focus:border-brand-orange/60 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-brand-orange via-orange-500 to-brand-orange px-4 py-3.5 text-white text-[15px] font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:shadow-brand-orange/30"
          >
            <span>{loading ? 'Saving...' : 'Save New Password'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login?reauth=1', { replace: true })}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/35 px-4 py-3.5 text-slate-200 font-semibold transition hover:bg-slate-800/55"
          >
            Back to Login
          </button>
        </form>
      )}
    </AuthShell>
  );
}
