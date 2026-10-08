import React, { useState } from 'react';
import { Mic, Video, CheckCircle2, Clock, MessageSquare, ArrowRight, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export default function Frame8LiveHR({
  mode = 'live-hr', // 'live-hr' | 'confirmation'
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  onEndAndSubmitHR,
  onKeepInterviewing,
  onBackToOverview
}) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(2); // Topic 3: Ownership & learning
  const [notesText, setNotesText] = useState(
`Situation: Our college project API became slow before a demo. I volunteered to investigate while the team finished the UI.
Action: I reproduced the slowdown, found repeated database queries, added batching and measured the improvement with test data.
Result: Page load fell from 4 seconds to under 1 second. We delivered the demo on time.
Learning: I now add basic performance checks earlier and share findings instead of working in isolation.`
  );

  const [chk1, setChk1] = useState(false);
  const [chk2, setChk2] = useState(false);
  const [chk3, setChk3] = useState(false);

  // Screen 09: Review & End Confirmation
  if (mode === 'confirmation') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-outfit">Review & end your HR interview</h1>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                09 / 10 &bull; Confirmation
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              All five topics have been discussed. Check your notes before confirming the end of the session.
            </p>
          </div>
        </div>

        {/* Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-extrabold text-indigo-600 font-outfit">5 / 5</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Discussion topics covered</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-extrabold text-slate-900 font-outfit">23:46</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">HR session duration</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-extrabold text-emerald-600 font-outfit">All saved</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Response notes status</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Conversation Summary (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
              Conversation summary &bull; Connected &bull; Interviewer still present
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>01 Introduction & motivation</span>
                  <span className="text-emerald-700 font-semibold text-[10px]">Saved</span>
                </div>
                <p className="text-slate-600 text-[11px]">Final year candidate; interested in backend systems and practical problem solving.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>02 Collaboration & conflict</span>
                  <span className="text-emerald-700 font-semibold text-[10px]">Saved</span>
                </div>
                <p className="text-slate-600 text-[11px]">Aligned the team on API requirements through a shared contract and a short review.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>03 Ownership & learning</span>
                  <span className="text-emerald-700 font-semibold text-[10px]">Saved</span>
                </div>
                <p className="text-slate-600 text-[11px]">Resolved slow project API queries; learned to measure performance early.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>04 Availability & expectations</span>
                  <span className="text-emerald-700 font-semibold text-[10px]">Saved</span>
                </div>
                <p className="text-slate-600 text-[11px]">Available from 02 Nov 2026; open to hybrid work. Expectations discussed with HR.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>05 Your questions</span>
                  <span className="text-emerald-700 font-semibold text-[10px]">Saved</span>
                </div>
                <p className="text-slate-600 text-[11px]">Asked about team onboarding, mentorship and the next evaluation steps.</p>
              </div>
            </div>
          </div>

          {/* Right: End & Submit Confirmation (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
              End & submit confirmation
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                You are about to end the interview. This will disconnect the live session and lock your HR notes. You cannot rejoin or edit responses after submission.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chk1}
                    onChange={(e) => setChk1(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-slate-800 font-medium">I have finished the discussion with HR.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chk2}
                    onChange={(e) => setChk2(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-slate-800 font-medium">I have reviewed my saved notes.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chk3}
                    onChange={(e) => setChk3(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-slate-800 font-medium">I understand that submission is final.</span>
                </label>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                Evaluation remains pending. Completing the interview does not imply an offer or guarantee selection.
              </div>
            </div>

            <button
              type="button"
              onClick={onEndAndSubmitHR}
              disabled={!chk1 || !chk2 || !chk3}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-sm"
            >
              End & submit interview
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onKeepInterviewing}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
          >
            Keep interviewing
          </button>

          <div className="flex items-center gap-4 text-xs ml-auto">
            <span className="text-slate-500 hidden sm:inline">
              This ends the live call and submits your HR notes. Please wait for the completion receipt.
            </span>
            <button
              type="button"
              onClick={onEndAndSubmitHR}
              disabled={!chk1 || !chk2 || !chk3}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-sm"
            >
              End & submit interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen 08: Active Live HR Session
  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 md:px-6 py-4">
      {/* Active Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 font-outfit">
            Round 3 &mdash; HR interview
          </h1>
          <span className="text-[11px] text-slate-500 font-mono">08 / 10 &bull; Live HR</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            Live session &bull; Connected
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Elapsed</span>
            <span className="font-mono font-bold text-slate-900 text-sm ml-1">14:08 / 25:00</span>
          </div>
        </div>
      </div>

      {/* Main HR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail: Session Participants (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-2.5">
            Interview session
          </h2>

          <div className="space-y-3 text-xs">
            {/* Interviewer Card */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-indigo-900">
                <span>Priya R</span>
                <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">Speaking</span>
              </div>
              <span className="text-[11px] text-indigo-700 block">HR interviewer</span>
            </div>

            {/* Candidate Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{candidateName}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Connected</span>
              </div>
              <span className="text-[11px] text-slate-500 block">Candidate</span>
            </div>

            <div className="pt-2 text-[11px] text-slate-600 space-y-1">
              <span>Microphone on &bull; Camera on &bull; Audio connected</span>
            </div>
          </div>
        </div>

        {/* Center: Live Discussion & STAR Response Notes (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-outfit">
              Topic 3 / 5 &bull; Ownership & learning
            </span>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              Tell me about a time you took ownership of a difficult problem. What did you do, and what did you learn?
            </h2>
            <p className="text-xs text-slate-500">
              Discuss the situation, your specific actions, the outcome and what you would do differently next time.
            </p>
          </div>

          {/* Your Response Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Your response notes (Shared with interviewer)</span>
              <span className="text-emerald-700 text-[11px]">Saved at 11:51:08</span>
            </div>

            <textarea
              rows={8}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none resize-none font-sans"
            />
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center justify-between">
            <span>Notes saved automatically</span>
          </div>
        </div>

        {/* Right Panel: Question Progress (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-2.5">
            Question progress
          </h2>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
              <span className="font-semibold text-slate-800">01 Introduction</span>
              <span className="text-[10px] text-emerald-700 font-bold">Done</span>
            </div>

            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
              <span className="font-semibold text-slate-800">02 Collaboration</span>
              <span className="text-[10px] text-emerald-700 font-bold">Done</span>
            </div>

            <div className="p-2 bg-purple-50 border border-purple-300 rounded flex items-center justify-between">
              <span className="font-bold text-purple-900">03 Ownership</span>
              <span className="text-[10px] text-purple-700 font-bold">Current topic</span>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-slate-500">
              <span>04 Availability</span>
              <span className="text-[10px]">Next topic</span>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-slate-500">
              <span>05 Your questions</span>
              <span className="text-[10px]">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentTopicIndex((prev) => Math.max(0, prev - 1))}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
        >
          Previous topic
        </button>

        <span className="text-xs text-slate-500 hidden md:inline">
          Review & end opens a confirmation screen; it does not disconnect you yet.
        </span>

        <button
          type="button"
          onClick={onEndAndSubmitHR}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto"
        >
          Review & end interview <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
