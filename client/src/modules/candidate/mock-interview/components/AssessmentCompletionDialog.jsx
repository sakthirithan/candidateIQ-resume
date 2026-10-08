import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';

export default function AssessmentCompletionDialog({
  isOpen = false,
  onClose,
  onSubmit,
  answeredCount = 0,
  totalQuestions = 20,
  flaggedCount = 0,
  submitting = false
}) {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const isAllAnswered = unansweredCount === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isAllAnswered ? 'bg-[#ECFDF3] text-[#12B76A]' : 'bg-[#FFFAEB] text-[#F79009]'
              }`}
            >
              {isAllAnswered ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2
                id="completion-dialog-title"
                className="text-lg font-bold text-[#101828] font-outfit"
              >
                Complete Assessment?
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                {isAllAnswered
                  ? 'All questions have been answered.'
                  : `You have answered ${answeredCount} of ${totalQuestions} questions.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[#667085] hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content summary box */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E4E7EC] space-y-2.5 text-xs text-[#344054]">
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Answered Questions:</span>
            <span className="font-bold text-[#101828]">
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-center justify-between text-[#B45309] font-medium bg-[#FFFAEB] p-2 rounded-lg border border-[#FEDF89]">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F79009]" />
                Unanswered Questions:
              </span>
              <strong className="font-bold">{unansweredCount}</strong>
            </div>
          )}

          {flaggedCount > 0 && (
            <div className="flex items-center justify-between text-[#344054]">
              <span className="text-[#667085]">Flagged for Review:</span>
              <span className="font-bold text-[#B45309]">{flaggedCount}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-[#475467] leading-relaxed">
          {isAllAnswered
            ? 'Once submitted, your answers will be evaluated and your CandidateIQ assessment scorecard will be generated.'
            : 'Are you sure you want to submit? Unanswered questions will receive 0 score.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-[#D0D5DD] text-[#344054] text-xs font-bold hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]"
          >
            Continue Reviewing
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="mcq-btn-purple text-xs font-bold px-5 py-2.5 shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting Assessment...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}
