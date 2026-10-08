/**
 * Reusable Score Status Utility for CandidateIQ
 * Evaluates a numeric score (0-100) and returns unified labels, color tokens, and background classes.
 */
export function getScoreStatus(score) {
  if (score === null || score === undefined || score === '') {
    return {
      score: null,
      label: 'Pending',
      color: 'text-slate-600',
      textColor: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      progressColor: 'bg-slate-400',
      gradient: 'from-slate-400 to-slate-500',
      hex: '#94a3b8'
    };
  }

  const numScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));

  if (numScore >= 90) {
    return {
      score: numScore,
      label: 'Excellent',
      color: 'text-emerald-700',
      textColor: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      progressColor: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-400',
      hex: '#10b981'
    };
  } else if (numScore >= 75) {
    return {
      score: numScore,
      label: 'Strong',
      color: 'text-indigo-700',
      textColor: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      progressColor: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-blue-500',
      hex: '#6366f1'
    };
  } else if (numScore >= 60) {
    return {
      score: numScore,
      label: 'Needs Improvement',
      color: 'text-amber-700',
      textColor: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      progressColor: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-400',
      hex: '#f59e0b'
    };
  } else {
    return {
      score: numScore,
      label: 'Needs Attention',
      color: 'text-rose-700',
      textColor: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      progressColor: 'bg-rose-500',
      gradient: 'from-rose-500 to-red-500',
      hex: '#f43f5e'
    };
  }
}
