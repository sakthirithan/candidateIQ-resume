import React from 'react';
import { SearchX, Inbox, RefreshCw } from 'lucide-react';

function EmptyState({
  title = 'No candidates found',
  description = 'Try adjusting your search keywords, clearing filters, or posting a new job requisition.',
  actionLabel = 'Reset Filters',
  onAction,
  icon: Icon = SearchX
}) {
  return (
    <div className="saas-card p-10 bg-white border border-slate-200 text-center space-y-4 flex flex-col items-center justify-center min-h-[260px] select-none">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-bold font-outfit text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
