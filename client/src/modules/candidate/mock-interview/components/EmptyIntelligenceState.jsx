import React from 'react';
import { AlertCircle, FileText, Play, Briefcase, RefreshCw, Sparkles } from 'lucide-react';

export default function EmptyIntelligenceState({ title, message, actionType, onAction, onRefresh }) {
  const getIcon = () => {
    switch (actionType) {
      case 'resume':
        return <FileText className="w-8 h-8 text-indigo-500 mx-auto" />;
      case 'interview':
        return <Play className="w-8 h-8 text-purple-500 mx-auto" />;
      case 'jobs':
        return <Briefcase className="w-8 h-8 text-emerald-500 mx-auto" />;
      default:
        return <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />;
    }
  };

  return (
    <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center space-y-4 shadow-sm max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-inner">
        {getIcon()}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold font-outfit text-slate-950">
          {title || 'Insufficient Candidate Data'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {message || 'CandidateIQ computes scores from verified profile evidence. Complete an activity below to generate your intelligence analytics.'}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {onAction && (
          <button
            onClick={onAction}
            className="btn-ai text-xs inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Start Activity
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-outline text-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </button>
        )}
      </div>
    </div>
  );
}
