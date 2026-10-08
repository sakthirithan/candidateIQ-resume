import React from 'react';
import { CheckCircle2, Circle, Flag } from 'lucide-react';

export default function AssessmentProgress({
  answeredCount = 0,
  totalQuestions = 20,
  flaggedCount = 0
}) {
  const percentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const pendingCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div className="space-y-2">
      {/* Percentage and Summary Info */}
      <div className="flex items-center justify-between text-xs font-medium text-[#475467]">
        <span className="font-semibold text-[#101828]">Overall Progress</span>
        <span className="font-bold text-[#7C4DFF]">{percentage}% Complete</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-[#EAECF0] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#7C4DFF] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {/* Answered, Pending, Flagged Stats */}
      <div className="flex items-center justify-between text-[11px] text-[#475467] pt-1 font-medium">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#12B76A]" />
          <span>Answered:</span>
          <strong className="text-[#101828] font-semibold">{answeredCount}</strong>
        </span>
        <span className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-[#98A2B3]" />
          <span>Pending:</span>
          <strong className="text-[#101828] font-semibold">{pendingCount}</strong>
        </span>
        {flaggedCount > 0 && (
          <span className="flex items-center gap-1">
            <Flag className="w-3 h-3 text-[#F79009]" />
            <span>Flagged:</span>
            <strong className="text-[#B45309] font-semibold">{flaggedCount}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
