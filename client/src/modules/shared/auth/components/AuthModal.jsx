import React, { useState } from 'react';
import { User, Briefcase, Lock, Mail, CheckCircle2, ShieldCheck, CreditCard, Sparkles, X, Eye, EyeOff, Zap } from 'lucide-react';

function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('candidate'); // 'candidate' | 'recruiter'
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else {
        if (selectedRole === 'recruiter' && !paid) {
          setShowPaymentStep(true);
          setLoading(false);
          return;
        }
        await onRegister(name || 'New User', email, password, selectedRole);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    try {
      if (role === 'recruiter') {
        await onLogin('sarah@technova.com', 'recruiter123');
      } else {
        await onLogin('john@example.com', 'password123');
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    setPaid(true);
    setShowPaymentStep(false);
    onRegister(name || 'Sarah Recruiter', email, password, 'recruiter');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/80 w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Branding Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-extrabold text-2xl font-outfit text-slate-900 tracking-tight">Candidate</span>
            <span className="font-black text-2xl font-outfit text-indigo-600">IQ</span>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            {mode === 'login' ? 'Welcome back! Sign in to access your candidate intelligence workspace.' : 'Create your CandidateIQ account to unlock AI evaluation.'}
          </p>
        </div>

        {/* Role Cards for Registration */}
        {mode === 'register' && !showPaymentStep && (
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSelectedRole('candidate')}
              className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                selectedRole === 'candidate' ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <User className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-900 block font-outfit">Candidate</span>
              <span className="text-[10px] text-slate-400 font-medium block">Build AI profile</span>
            </div>

            <div
              onClick={() => setSelectedRole('recruiter')}
              className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                selectedRole === 'recruiter' ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Briefcase className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-900 block font-outfit">Recruiter HR</span>
              <span className="text-[10px] text-slate-400 font-medium block">Discover talent</span>
            </div>
          </div>
        )}

        {/* Prototype ₹1 Recruiter Payment Step */}
        {showPaymentStep ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
              <CreditCard className="w-8 h-8 text-indigo-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 font-outfit">Recruiter Identity Verification (Demo)</h3>
              <p className="text-xs text-slate-600">Simulate ₹1 identity verification to unlock Recruiter HR features.</p>
              <span className="text-lg font-black text-slate-900 block font-mono">₹1.00 INR</span>
            </div>

            <button
              onClick={handleSimulatePayment}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
            >
              Complete Verification & Access Recruiter Workspace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-900/15 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Sign In to CandidateIQ' : 'Create Account'
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              {mode === 'login' ? (
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-indigo-600 font-bold hover:underline">
                    Register Now
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
