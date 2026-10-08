import React from 'react';
import { CheckCircle2, ArrowRight, FileText, ShieldCheck, Clock, Layers } from 'lucide-react';

export default function Frame8Submitted({
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  referenceId = 'PS R1-7376242-1005',
  timestampStr = '05 Oct 2026, 10:46 IST',
  answeredCount = 38,
  totalQuestions = 40,
  unansweredCount = 2,
  onStartTechnicalRound,
  onBackToOverview
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Green Confirmation Banner */}
      <div className="bg-emerald-600 text-white rounded-xl p-5 md:p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
          <h1 className="text-xl md:text-2xl font-bold font-outfit">Round 1 submitted successfully</h1>
          <span className="bg-emerald-700 text-emerald-100 text-xs font-mono px-2.5 py-0.5 rounded-full ml-auto">
            05 / 10 &bull; Submitted
          </span>
        </div>
        <p className="text-xs md:text-sm text-emerald-100 pl-8">
          Your answers are securely recorded. Round 2 is now available.
        </p>
        <div className="pt-2 text-xs font-mono text-emerald-200 border-t border-emerald-500/50 flex flex-wrap gap-4">
          <span>Submission confirmed &bull; {timestampStr}</span>
          <span>Reference: {referenceId}</span>
          <span>{answeredCount} answers recorded</span>
          <span>{unansweredCount} questions left unanswered</span>
        </div>
      </div>

      {/* Main Grid: Left Journey Cards, Right Round 1 Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interview Rounds Progress (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
            Interview rounds
          </h2>

          <div className="space-y-3 text-xs">
            {/* Round 1 (Completed) */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                    ✓
                  </span>
                  <h3 className="font-bold text-slate-900">Round 1 &mdash; Aptitude & core concepts</h3>
                </div>
                <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">
                  {answeredCount} of {totalQuestions} answered &bull; Submitted at 10:46 IST
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                Completed
              </span>
            </div>

            {/* Up Next - Round 2 Technical (Ready to start) */}
            <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/40 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">02</span>
                  <h3 className="font-bold text-slate-900">Up next &mdash; Technical interview</h3>
                </div>
                <span className="text-indigo-600 font-bold text-xs block">3 prompts &bull; 45 minutes</span>
                <p className="text-slate-600 text-[11px]">
                  Discuss solutions with your interviewer and use the shared workspace to explain your reasoning.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold text-[11px] shrink-0 animate-pulse">
                Ready to start
              </span>
            </div>

            {/* Round 3 HR (Pending) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-slate-700">Round 3 &mdash; HR interview</h3>
                </div>
                <span className="text-slate-500 text-[11px] block mt-0.5">5 discussion topics &bull; 25 minutes</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium text-[11px]">
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Round 1 Receipt (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
            Round 1 receipt
          </h2>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-500 font-medium block uppercase text-[10px]">Candidate</span>
              <span className="font-bold text-slate-900">{candidateName} ({candidateId})</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block uppercase text-[10px]">Answers</span>
              <span className="font-semibold text-emerald-700">Recorded ({answeredCount} submitted / {totalQuestions} questions)</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block uppercase text-[10px]">Changes</span>
              <span className="text-slate-600">Round 1 answers are now read only.</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
              <strong className="block font-bold">Evaluation pending</strong>
              <p className="text-[11px] leading-relaxed">
                Round completion is not a pass result or selection decision. Continue with the next interview.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToOverview}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
        >
          Interview overview
        </button>

        <div className="flex items-center gap-4 text-xs ml-auto">
          <span className="text-slate-500 hidden sm:inline">
            Round 1 is locked. Starting Round 2 opens your technical workspace.
          </span>
          <button
            type="button"
            onClick={onStartTechnicalRound}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            Start technical interview <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
