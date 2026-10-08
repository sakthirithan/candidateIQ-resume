import React from 'react';
import { Check, Circle, Flag, Dot } from 'lucide-react';
import AssessmentProgress from './AssessmentProgress';

export default function QuestionNavigator({
  questions = [],
  currentIndex = 0,
  submittedAnswers = {},
  flaggedQuestions = {},
  onSelectQuestion
}) {
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(submittedAnswers).filter(
    (k) => submittedAnswers[k]?.selectedOption || submittedAnswers[k]?.option || submittedAnswers[k]?.answer
  ).length;
  const flaggedCount = Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length;

  return (
    <div className="mcq-card-surface p-4 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
          <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider font-outfit">
            Questions
          </h2>
          <span className="text-[11px] font-bold text-[#7C4DFF] bg-[#F1EBFF] px-2 py-0.5 rounded-md">
            {answeredCount} / {totalQuestions} Answered
          </span>
        </div>

        {/* Overall Progress Component */}
        <AssessmentProgress
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          flaggedCount={flaggedCount}
        />

        {/* Question Numbers Grid */}
        <div
          role="navigation"
          aria-label="Question Navigator Grid"
          className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1"
        >
          {questions.map((q, idx) => {
            const qId = q.id || q.questionId || `q_${idx}`;
            const isCurrent = idx === currentIndex;
            const ansObj = submittedAnswers[qId];
            const isAnswered = Boolean(ansObj?.selectedOption || ansObj?.option || ansObj?.answer);
            const isFlagged = Boolean(flaggedQuestions[qId]);

            // Base button styling according to state
            let buttonClasses = 'bg-[#F8FAFC] border-[#E4E7EC] text-[#344054] hover:bg-[#F1F5F9]';
            let statusIcon = <Circle className="w-2.5 h-2.5 text-[#98A2B3]" />;
            let statusText = 'Pending';

            if (isCurrent) {
              buttonClasses = 'bg-[#7C4DFF] border-[#6D3FE8] text-white shadow-sm ring-2 ring-[#7C4DFF]/30 font-bold';
              statusIcon = <Dot className="w-4 h-4 text-white" />;
              statusText = 'Current';
            } else if (isAnswered) {
              buttonClasses = 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48] font-semibold hover:bg-[#D1FADF]';
              statusIcon = <Check className="w-3 h-3 text-[#12B76A]" />;
              statusText = 'Answered';
            }

            if (isFlagged && !isCurrent) {
              buttonClasses += ' ring-2 ring-[#F79009]/40';
            }

            return (
              <button
                key={qId}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                aria-label={`Question ${idx + 1}, Status: ${statusText}${isFlagged ? ', Flagged' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
                className={`h-11 rounded-lg border text-xs font-medium transition-all flex flex-col items-center justify-center cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] ${buttonClasses}`}
              >
                <span className="font-mono text-xs">{String(idx + 1).padStart(2, '0')}</span>
                <div className="flex items-center gap-0.5 text-[9px] mt-0.5">
                  {statusIcon}
                </div>
                {isFlagged && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#F79009] text-white rounded-full flex items-center justify-center text-[8px]"
                    title="Flagged for review"
                  >
                    ⚑
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible Status Legend */}
      <div className="pt-3 border-t border-[#E4E7EC] text-[11px] text-[#475467] space-y-1.5 font-medium">
        <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-1">
          Legend
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#7C4DFF] shrink-0"></span>
            <span>● Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#ECFDF3] border border-[#A6F4C5] text-[#12B76A] flex items-center justify-center text-[9px] font-bold shrink-0">✓</span>
            <span>✓ Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#F8FAFC] border border-[#E4E7EC] shrink-0"></span>
            <span>○ Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FFFAEB] border border-[#FEDF89] text-[#B45309] flex items-center justify-center text-[9px] font-bold shrink-0">⚑</span>
            <span>⚑ Flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
