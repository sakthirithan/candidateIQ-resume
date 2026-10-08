import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Clock, FileText, CheckSquare, Square } from 'lucide-react';

export default function Frame8Readiness({
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  questionCount = 40,
  durationMinutes = 45,
  onBeginAssessment,
  onBackToOverview
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-outfit">Round 1 &mdash; Instructions & readiness</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
              02 / 10 &bull; Readiness
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Aptitude & core concepts &bull; Data Structure & Core Concepts &bull; MCQ Based
          </p>
        </div>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-slate-900 font-outfit">{questionCount}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Questions (one answer each)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-indigo-600 font-outfit">{durationMinutes} minutes</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Timed assessment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-emerald-600 font-outfit">No penalty</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">For incorrect answers</div>
        </div>
      </div>

      {/* Main Grid: Instructions vs Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assessment Instructions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
            Assessment instructions
          </h2>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Choose one answer per question</span>
              <p className="text-slate-600">Select the best option. You may change an answer before final submission.</p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Move freely between questions</span>
              <p className="text-slate-600">Use the numbered rail or Previous / Next buttons. Saved answers are marked green.</p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Review before you submit</span>
              <p className="text-slate-600">The review screen lists unanswered questions so you can revisit them before confirming.</p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-0.5">When time runs out</span>
              <p className="text-slate-600">Your saved answers are submitted automatically. Unanswered questions remain blank.</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
              <span className="font-bold block mb-0.5">Submission is final</span>
              <p>After submitting Round 1, you cannot edit its answers. Technical interview access opens next.</p>
            </div>
          </div>
        </div>

        {/* Right: Readiness Checklist & Acknowledgment (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit">
              Readiness checklist
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready to begin
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Candidate details verified: <strong className="text-slate-900">{candidateName} ({candidateId})</strong></span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Stable internet connection confirmed</span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Quiet space and {durationMinutes} minutes uninterrupted time available</span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Instructions read and understood</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="text-slate-600 text-[11px] leading-normal">
              Work independently. Do not use external assistance, share questions or switch tabs excessively.
            </p>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
              />
              <span className="font-semibold text-slate-900 leading-snug">
                I understand the time limit and that submission is final.
              </span>
            </label>
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
            The {durationMinutes}-minute timer starts only when you select Begin assessment.
          </span>
          <button
            type="button"
            onClick={onBeginAssessment}
            disabled={!acknowledged}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            Begin assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
