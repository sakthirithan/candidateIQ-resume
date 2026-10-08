import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Flag } from 'lucide-react';

export default function AssessmentFooter({
  currentIndex = 0,
  totalQuestions = 20,
  hasSelection = false,
  isSaved = false,
  onPrevious,
  onNext,
  onComplete,
  isFlagged = false,
  onToggleFlag
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <footer className="bg-white border-t border-[#E4E7EC] px-4 py-3 md:px-6 shadow-xs sticky bottom-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Previous Button */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          aria-label="Go to previous question"
          className="btn-outline text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 font-semibold focus:ring-2 focus:ring-[#7C4DFF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Center: Save / Selection Status indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#475467]">
          {isSaved ? (
            <span className="flex items-center gap-1.5 text-[#027A48] bg-[#ECFDF3] px-2.5 py-1 rounded-full border border-[#A6F4C5] font-semibold text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-[#12B76A]" />
              <span className="hidden sm:inline">Answer Saved</span>
            </span>
          ) : hasSelection ? (
            <span className="text-[#B45309] bg-[#FFFAEB] px-2.5 py-1 rounded-full border border-[#FEDF89] font-semibold text-[11px]">
              Option selected
            </span>
          ) : (
            <span className="text-[#667085] hidden sm:inline">Select an option to answer</span>
          )}
        </div>

        {/* Right: Next / Complete Button */}
        <div className="flex items-center gap-2">
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              aria-label="Go to next question"
              className="mcq-btn-purple text-xs sm:text-sm px-4 py-2 flex items-center gap-1.5 font-semibold"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              aria-label="Review and submit assessment"
              className="mcq-btn-purple bg-[#12B76A] hover:bg-[#0E9F57] text-xs sm:text-sm px-4 py-2 flex items-center gap-1.5 font-bold shadow-sm"
            >
              <span>Review & Submit</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
