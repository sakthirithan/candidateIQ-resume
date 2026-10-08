import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function AssessmentTimer({ seconds = 0 }) {
  if (seconds === null || seconds === undefined) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Time state classification
  const isCritical = seconds <= 120; // < 2 mins
  const isWarning = seconds > 120 && seconds <= 300; // 2 - 5 mins

  let badgeStyle = 'bg-[#F8FAFC] border-[#E4E7EC] text-[#344054]';
  let icon = <Clock className="w-3.5 h-3.5 text-[#667085]" />;

  if (isCritical) {
    badgeStyle = 'bg-[#FEF3F2] border-[#FECDCA] text-[#D92D20] font-extrabold animate-pulse';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-[#D92D20]" />;
  } else if (isWarning) {
    badgeStyle = 'bg-[#FFFAEB] border-[#FEDF89] text-[#B45309] font-bold';
    icon = <Clock className="w-3.5 h-3.5 text-[#B45309]" />;
  }

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Remaining time ${mins} minutes ${secs} seconds`}
      className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${badgeStyle}`}
    >
      {icon}
      <span>{formattedTime}</span>
      <span className="text-[10px] font-sans text-[#667085] hidden xl:inline">Remaining</span>
    </div>
  );
}
