import React from 'react';
import { Bot, Clock, LogOut, LayoutGrid, CheckCircle2 } from 'lucide-react';
import AssessmentTimer from './AssessmentTimer';
import AssessmentProgress from './AssessmentProgress';

export default function AssessmentHeader({
  title = 'Technical MCQ Assessment',
  subtitle = 'CandidateIQ Assessment Room',
  currentQuestion = 1,
  totalQuestions = 20,
  answeredCount = 0,
  remainingSeconds = null,
  onCompleteClick,
  onToggleMobileNav,
  submitting = false
}) {
  return (
    <header className="bg-white border-b border-[#E4E7EC] px-4 py-3 md:px-6 shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Branding & Assessment Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#7C4DFF] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#7C4DFF] uppercase tracking-wider">CandidateIQ</span>
              <span className="text-[11px] text-[#667085] hidden sm:inline">&bull; {subtitle}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#101828] truncate font-outfit">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Controls: Question Progress Badge, Timer, Mobile Nav Toggle & Complete Button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile Question Navigator Toggle */}
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              aria-label="Open question navigator drawer"
              className="lg:hidden p-2 rounded-lg border border-[#E4E7EC] text-[#344054] hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] flex items-center gap-1.5 text-xs font-semibold"
            >
              <LayoutGrid className="w-4 h-4 text-[#7C4DFF]" />
              <span className="hidden sm:inline">Questions</span>
              <span className="bg-[#F1EBFF] text-[#7C4DFF] px-1.5 py-0.5 rounded text-[11px] font-bold">
                {currentQuestion}/{totalQuestions}
              </span>
            </button>
          )}

          {/* Question Counter Pill (Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-xs font-semibold text-[#344054]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A]" />
            <span>Progress:</span>
            <span className="font-bold text-[#101828]">
              {String(currentQuestion).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>
          </div>

          {/* Countdown Timer (if remainingSeconds provided) */}
          {remainingSeconds !== null && remainingSeconds !== undefined && (
            <AssessmentTimer seconds={remainingSeconds} />
          )}

          {/* Complete Assessment Action Button */}
          <button
            type="button"
            onClick={onCompleteClick}
            disabled={submitting}
            aria-label="Complete and submit assessment"
            className="mcq-btn-purple text-xs sm:text-sm py-1.5 px-3.5 sm:px-4 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-bold">{submitting ? 'Submitting...' : 'Complete Assessment'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
