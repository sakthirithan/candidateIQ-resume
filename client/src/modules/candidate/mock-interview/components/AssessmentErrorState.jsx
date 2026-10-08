import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function AssessmentErrorState({
  title = 'Unable to Load Assessment',
  message = 'An unexpected error occurred while loading assessment questions or saving progress.',
  onRetry,
  onBack
}) {
  return (
    <div className="mcq-app-canvas min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E4E7EC] shadow-xl text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3F2] text-[#D92D20] mx-auto flex items-center justify-center border border-[#FECDCA]">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-[#101828] font-outfit">{title}</h2>
          <p className="text-xs text-[#667085] leading-relaxed">{message}</p>
        </div>

        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-[11px] text-[#475467]">
          <span>Your progress and local choices are safely preserved locally.</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg border border-[#D0D5DD] text-xs font-semibold text-[#344054] hover:bg-[#F8FAFC]"
            >
              Go Back
            </button>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mcq-btn-purple text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
