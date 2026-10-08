import React, { useState } from 'react';
import { activateHrPayment } from '@/utils/auth';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

function PaymentDemoModal({ isOpen, user, onPaymentSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || !user) return null;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      const updated = activateHrPayment(user.id || user._id || user.email);
      setProcessing(false);
      setCompleted(true);
      setTimeout(() => {
        if (onPaymentSuccess) onPaymentSuccess(updated || user);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="saas-card p-6 md:p-8 bg-white border border-slate-200 w-full max-w-md space-y-6 shadow-2xl select-none">
        {/* Header */}
        <div className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mx-auto mb-2">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-outfit text-slate-950">Recruiter Workspace Activation</h3>
          <p className="text-xs text-slate-500">Pay ₹1 demo fee to activate full HR talent candidate tools.</p>
        </div>

        {/* Order Summary Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Account User</span>
            <span className="text-slate-950 font-bold">{user.name}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Role Type</span>
            <span className="text-indigo-600 font-bold uppercase">HR Recruiter Manager</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200">
            <span>Demo Activation Fee</span>
            <span className="text-emerald-700 font-extrabold text-sm">₹1.00 INR</span>
          </div>
        </div>

        {completed ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-2 animate-in zoom-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-outfit">Payment Successful!</p>
            <p className="text-[11px] text-emerald-600 font-normal">Activating your recruiter workspace...</p>
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={processing}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Demo Payment...
              </>
            ) : (
              <>
                Proceed to Payment (₹1) <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Simulated Frontend Sandbox Payment Step
        </div>
      </div>
    </div>
  );
}

export default PaymentDemoModal;
