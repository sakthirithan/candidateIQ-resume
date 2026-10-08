import React from 'react';
import { HelpCircle, CheckCircle2, Clock, Bot, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Frame8Header({
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  assessmentTitle = 'Candidate interview journey',
  subtitle = 'Three-round assessment',
  currentRound = 1, // 1, 2, or 3
  round1Status = 'Ready to start', // 'Ready to start' | 'In progress' | 'Completed'
  round2Status = 'Pending',        // 'Pending' | 'Available' | 'In progress' | 'Completed'
  round3Status = 'Pending',        // 'Pending' | 'Available' | 'Ready to start' | 'In progress' | 'Completed'
  tabSwitchCount = 0,
  onSupportClick
}) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
      case 'In progress':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-semibold animate-pulse';
      case 'Ready to start':
      case 'Available':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Identity Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            CIQ
          </div>
          <div className="min-w-0 flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-900 tracking-tight font-outfit">CandidateIQ</span>
            <span className="font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              {candidateId}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="font-medium text-slate-700 truncate hidden sm:inline">{candidateName}</span>
            <span className="text-slate-400 hidden md:inline">&bull; {assessmentTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-extrabold shadow-sm animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>Tab force {tabSwitchCount}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onSupportClick}
            className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Need help?</span> Contact support
          </button>
        </div>
      </div>

      {/* Round Stepper Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
        <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs">
          {/* Round 1 Stepper Pill */}
          <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
            currentRound === 1 ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                round1Status === 'Completed' ? 'bg-emerald-600 text-white' : currentRound === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {round1Status === 'Completed' ? '✓' : '1'}
              </span>
              <div className="min-w-0 leading-tight">
                <span className="font-semibold text-slate-900 block truncate">Aptitude & core concepts</span>
                <span className="text-[10px] text-slate-500 hidden md:inline">MCQ Based</span>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-block ${getBadgeStyle(round1Status)}`}>
              {round1Status}
            </span>
          </div>

          {/* Round 2 Stepper Pill */}
          <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
            currentRound === 2 ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                round2Status === 'Completed' ? 'bg-emerald-600 text-white' : currentRound === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {round2Status === 'Completed' ? '✓' : '2'}
              </span>
              <div className="min-w-0 leading-tight">
                <span className="font-semibold text-slate-900 block truncate">Technical interview</span>
                <span className="text-[10px] text-slate-500 hidden md:inline">Technical discussion</span>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-block ${getBadgeStyle(round2Status)}`}>
              {round2Status}
            </span>
          </div>

          {/* Round 3 Stepper Pill */}
          <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
            currentRound === 3 ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                round3Status === 'Completed' ? 'bg-emerald-600 text-white' : currentRound === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {round3Status === 'Completed' ? '✓' : '3'}
              </span>
              <div className="min-w-0 leading-tight">
                <span className="font-semibold text-slate-900 block truncate">HR interview</span>
                <span className="text-[10px] text-slate-500 hidden md:inline">Live HR conversation</span>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-block ${getBadgeStyle(round3Status)}`}>
              {round3Status}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
