import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

function LoadingState({ message = 'Loading candidates...', variant = 'card' }) {
  if (variant === 'skeleton') {
    return (
      <div className="saas-card p-6 bg-white border border-slate-200/80 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded-full w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          <div className="h-3 bg-slate-100 rounded w-4/6"></div>
        </div>
        <div className="pt-2 flex gap-2">
          <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
          <div className="h-8 bg-slate-100 rounded-lg w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card p-8 bg-white border border-slate-200 text-center space-y-3 flex flex-col items-center justify-center min-h-[220px] select-none">
      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-800 font-outfit">{message}</h4>
        <p className="text-[11px] text-slate-400 font-medium">CandidateIQ mock service processing request</p>
      </div>
    </div>
  );
}

export default LoadingState;
