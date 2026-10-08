import React, { useState } from 'react';
import { registerUserApi } from '@/utils/auth';
import { X, User, Briefcase, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

function RegisterModal({ isOpen, onClose, onRegisterSuccess, onRequireHrPayment, onSwitchToLogin }) {
  const [roleStep, setRoleStep] = useState(true); // true = role choice, false = form
  const [selectedRole, setSelectedRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setRoleStep(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUserApi({
        name,
        email,
        password,
        role: selectedRole
      });
      setLoading(false);

      if (res.success) {
        onClose();
        if (['hr', 'recruiter'].includes(selectedRole)) {
          if (onRequireHrPayment) onRequireHrPayment(res.user);
        } else {
          if (onRegisterSuccess) onRegisterSuccess(res.user);
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred during registration.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="saas-card p-6 md:p-8 bg-white border border-slate-200 w-full max-w-md space-y-6 relative shadow-2xl select-none">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {roleStep ? (
          /* Step 1: Role Selection */
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base font-outfit mb-3">
                IQ
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-950">Choose Your Workspace</h3>
              <p className="text-xs text-slate-500">Select how you plan to use the CandidateIQ platform.</p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => handleRoleSelect('candidate')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-outfit">Candidate Workspace</h4>
                      <p className="text-xs text-slate-500">Build profile & showcase skills</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>

              <div
                onClick={() => handleRoleSelect('hr')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-outfit">HR / Recruiter Workspace</h4>
                      <p className="text-xs text-slate-500">Discover, evaluate & manage candidates</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSwitchToLogin) onSwitchToLogin();
                }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Form */
          <div className="space-y-6">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setRoleStep(true)}
                className="text-xs text-indigo-600 font-semibold mb-2 block hover:underline"
              >
                ← Back to Workspace Choice
              </button>
              <h3 className="text-xl font-bold font-outfit text-slate-950">
                Register as {selectedRole === 'hr' ? 'HR / Recruiter' : 'Candidate'}
              </h3>
              <p className="text-xs text-slate-500">Create your account to activate your workspace.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theeran Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Work / Personal Email</label>
                <input
                  type="email"
                  required
                  placeholder="theeran@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : `Continue as ${selectedRole === 'hr' ? 'HR / Recruiter' : 'Candidate'}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterModal;
