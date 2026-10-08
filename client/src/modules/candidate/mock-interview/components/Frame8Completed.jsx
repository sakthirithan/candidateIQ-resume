import React from 'react';
import { CheckCircle2, Download, RefreshCw, ArrowRight, ShieldCheck, FileText, Info } from 'lucide-react';

export default function Frame8Completed({
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  submissionReference = 'PS INT-7376242 20261005',
  completedDateStr = '05 Oct 2026 12:01 IST',
  round1Summary = '38 / 40 answers recorded · Submitted at 10:46 IST',
  round2Summary = '3 prompts, code and notes recorded · Submitted at 11:32 IST',
  round3Summary = '5 topics and response notes recorded · Submitted at 12:01 IST',
  onReturnToOverview,
  onDownloadReceipt
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Top Completion Header Banner */}
      <div className="bg-indigo-600 text-white rounded-xl p-5 md:p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-indigo-200 shrink-0" />
          <h1 className="text-xl md:text-2xl font-bold font-outfit">Your interview journey is complete</h1>
          <span className="bg-indigo-700 text-indigo-100 text-xs font-mono px-2.5 py-0.5 rounded-full ml-auto">
            10 / 10 &bull; Completed
          </span>
        </div>
        <p className="text-xs md:text-sm text-indigo-100 pl-8">
          Thank you, <span className="font-semibold text-white">{candidateName}</span>. All three rounds have been submitted securely.
        </p>
        <div className="pt-2 text-xs text-indigo-100 border-t border-indigo-500/50 flex items-center justify-between">
          <span className="font-bold">Evaluation pending</span>
          <span className="text-[11px] text-indigo-200">
            The recruitment team will review your assessment and interview responses. Completion is not an offer or a guarantee of selection.
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submission Receipt (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit">
              Submission receipt
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {candidateName} &bull; All rounds complete
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Candidate ID</span>
                <strong className="text-slate-900">{candidateId}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Submission reference</span>
                <strong className="text-indigo-600">{submissionReference}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block uppercase text-[10px]">Completed on</span>
                <strong className="text-slate-900">{completedDateStr}</strong>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 font-bold block">Round 1 &mdash; Aptitude & core concepts</strong>
                  <span className="text-slate-500 text-[11px]">{round1Summary}</span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">Complete</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 font-bold block">Round 2 &mdash; Technical interview</strong>
                  <span className="text-slate-500 text-[11px]">{round2Summary}</span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">Complete</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 font-bold block">Round 3 &mdash; HR interview</strong>
                  <span className="text-slate-500 text-[11px]">{round3Summary}</span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">Complete</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">
              Keep this reference for any questions about your submission. Submitted responses are read only.
            </p>
          </div>
        </div>

        {/* Right Column: What Happens Next (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
            What happens next
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">01 Recruitment review</span>
              <p className="text-slate-600 leading-relaxed">
                The team evaluates all three rounds together. No further action is needed from you now.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">02 Status update</span>
              <p className="text-slate-600 leading-relaxed">
                Watch your registered email and CandidateIQ portal for the next update from the recruitment team.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">03 Follow-up if needed</span>
              <p className="text-slate-600 leading-relaxed">
                If additional information is required, the team will contact you directly.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block">Need assistance?</strong>
              <p className="text-[11px] text-slate-600">
                Contact portal support and include <code className="bg-slate-200 px-1 rounded font-mono">{submissionReference}</code> so we can locate your submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onDownloadReceipt || (() => window.print())}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-600" /> Download receipt
        </button>

        <div className="flex items-center gap-4 text-xs ml-auto">
          <span className="text-slate-500 hidden sm:inline">
            You can return to the overview to view round completion and evaluation status.
          </span>
          <button
            type="button"
            onClick={onReturnToOverview}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            Return to overview <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
