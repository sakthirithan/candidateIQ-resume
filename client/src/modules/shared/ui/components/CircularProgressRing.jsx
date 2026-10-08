import React from 'react';

export default function CircularProgressRing({
  score = 84,
  maxScore = 100,
  size = 72,
  strokeWidth = 6,
  label = 'Candidate IQ',
  subtitle = 'Strong Evidence',
  colorClass = 'text-indigo-600',
  trackClass = 'text-slate-100'
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`stroke-current ${trackClass}`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`stroke-current ${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-extrabold font-outfit text-sm text-slate-900 leading-none">
            {score}
          </span>
          <span className="text-[9px] font-bold text-slate-400">/100</span>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-xs text-slate-900 font-outfit">{label}</h4>
        {subtitle && <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>}
        <div className="mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold text-emerald-700">Verified Evidence</span>
        </div>
      </div>
    </div>
  );
}
