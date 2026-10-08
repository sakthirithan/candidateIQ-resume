import React, { useState } from 'react';
import { forgotPasswordApi, resetPasswordApi } from '@/utils/auth';
import { X, Mail, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

function ForgotPasswordModal({ isOpen, onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1 = Verify Email, 2 = Set New Password, 3 = Success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your account email.');
      return;
    }

    setLoading(true);
    const res = await forgotPasswordApi(email);
    setLoading(false);

    if (res.success) {
      setStep(2);
      setError('');
    } else {
      setError(res.message || 'No account found with this email.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordApi(email, newPassword);
    setLoading(false);

    if (res.success) {
      setStep(3);
      setSuccessMsg(res.message || 'Password reset successfully!');
      setError('');
    } else {
      setError(res.message || 'Password reset failed.');
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="saas-card p-6 md:p-8 bg-white border border-slate-200 w-full max-w-md space-y-6 relative shadow-2xl select-none">
        <button
          onClick={resetAndClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base font-outfit mb-3">
            <KeyRound className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold font-outfit text-slate-950">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Set New Password'}
            {step === 3 && 'Password Reset Complete'}
          </h3>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Enter your registered email to verify your CandidateIQ account.'}
            {step === 2 && `Enter a new secure password for ${email}.`}
            {step === 3 && 'Your account password has been updated successfully.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Verify Email */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Registered Email Address</label>
              <div className="relative">
                {/* <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /> */}
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-saas pl-9 w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Account...' : 'Verify Email & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Set New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">New Password</label>
              <div className="relative">
                {/* <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /> */}
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-saas pl-9 w-full text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-saas pl-9 w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-outfit">Password Updated!</p>
              <p className="text-[11px] text-emerald-600 font-normal">{successMsg}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetAndClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {step !== 3 && (
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => {
                resetAndClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              className="text-indigo-600 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
