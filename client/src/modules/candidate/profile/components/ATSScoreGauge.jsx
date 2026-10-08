import React, { useEffect, useRef, useState } from 'react';

export function ATSScoreGauge({ score = 75, label = 'Overall ATS Score', size = 'md' }) {
  const [pathLength, setPathLength] = useState(125);
  const pathRef = useRef(null);

  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const percentage = safeScore / 100;

  useEffect(() => {
    if (pathRef.current) {
      try {
        setPathLength(pathRef.current.getTotalLength());
      } catch (e) {
        setPathLength(125);
      }
    }
  }, []);

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-500';
    if (val >= 65) return 'text-indigo-500';
    if (val >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getGradientColors = (val) => {
    if (val >= 80) return { start: '#10b981', end: '#6366f1' };
    if (val >= 65) return { start: '#6366f1', end: '#a855f7' };
    if (val >= 50) return { start: '#f59e0b', end: '#f97316' };
    return { start: '#ef4444', end: '#f43f5e' };
  };

  const colors = getGradientColors(safeScore);
  const isLarge = size === 'lg';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className={`relative ${isLarge ? 'w-48 h-24' : 'w-36 h-20'}`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id={`gaugeGradient_${safeScore}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Dynamic Progress Arc */}
          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={`url(#gaugeGradient_${safeScore})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - percentage)}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={`font-black font-outfit ${isLarge ? 'text-3xl' : 'text-2xl'} ${getScoreColor(safeScore)} tracking-tight`}>
            {safeScore}
            <span className="text-xs font-semibold text-slate-400 ml-0.5">/100</span>
          </span>
        </div>
      </div>

      {label && (
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
          {label}
        </span>
      )}
    </div>
  );
}

export function ScoreCircle({ score = 75, size = 44, strokeWidth = 4 }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = (val) => {
    if (val >= 80) return '#10b981';
    if (val >= 65) return '#6366f1';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(safeScore)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute font-black text-xs font-outfit text-slate-800">
        {safeScore}
      </span>
    </div>
  );
}

export function ScoreBadgePill({ score = 75 }) {
  const safeScore = Math.round(score || 0);
  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (safeScore < 50) bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
  else if (safeScore < 70) bgClass = 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${bgClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      ATS {safeScore}/100
    </span>
  );
}

export default ATSScoreGauge;
