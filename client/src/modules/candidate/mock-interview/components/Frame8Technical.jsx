import React, { useState } from 'react';
import { Play, CheckCircle2, Clock, Code, ChevronLeft, ChevronRight, ArrowRight, Mic, Video } from 'lucide-react';

export default function Frame8Technical({
  mode = 'technical', // 'technical' | 'hr-readiness'
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  onSubmitTechnicalRound,
  onJoinHRInterview,
  onBackToOverview
}) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(1); // 0, 1, 2
  const [code, setCode] = useState(
`def isBalanced(text):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in text:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack`
  );
  const [sampleOutput, setSampleOutput] = useState('Sample tests: 6 / 6 passed');
  const [notes, setNotes] = useState(
    'Each character is visited once: O(n) time. The stack holds at most n opening brackets: O(n) auxiliary space.'
  );

  // Screen 07: HR Readiness
  if (mode === 'hr-readiness') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-outfit">You&apos;re ready for the final HR interview</h1>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                07 / 10 &bull; HR readiness
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Round 3 &bull; A conversation about your experience, working style and expectations.
            </p>
          </div>
        </div>

        {/* Confirmation Summary Banner */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <span>✓ Round 2 submitted &bull; 05 Oct 2026, 11:32 IST (3 prompts recorded, code and notes saved)</span>
          <span className="font-bold text-emerald-700">Evaluation pending</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Conversation Agenda (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
              Conversation agenda &bull; 25-minute session &bull; 5 topics
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <strong className="text-slate-900 font-bold">01 Introduction & motivation</strong>
                <p className="text-slate-600">Tell us about your background and why this role interests you.</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <strong className="text-slate-900 font-bold">02 Collaboration & conflict</strong>
                <p className="text-slate-600">Share an example of resolving disagreement in a team.</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <strong className="text-slate-900 font-bold">03 Ownership & learning</strong>
                <p className="text-slate-600">Describe a challenge, what you did and what you learned.</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <strong className="text-slate-900 font-bold">04 Availability & expectations</strong>
                <p className="text-slate-600">Discuss your start date, work preferences and expectations.</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <strong className="text-slate-900 font-bold">05 Your questions</strong>
                <p className="text-slate-600">Ask about the role, team and hiring process.</p>
              </div>
            </div>
          </div>

          {/* Right: Device & Session Check (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
              Session & device check
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Camera detected</span>
                </div>
                <span className="text-[11px]">Preview ready</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>Microphone tested</span>
                </div>
                <span className="text-[11px]">Audio clear</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Speakers tested & Connection stable</span>
                </div>
                <span className="text-[11px]">Quiet space ready</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">All checks passed</span>
              <p className="text-[11px]">
                If a device stops working during the session, notify your interviewer before ending the interview.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
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
              Joining opens the live session. Your microphone and camera are ready.
            </span>
            <button
              type="button"
              onClick={onJoinHRInterview}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              Join HR interview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen 06: Active Technical Interview
  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 md:px-6 py-4">
      {/* Active Header Row */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 font-outfit">
            Round 2 &mdash; Technical interview
          </h1>
          <span className="text-[11px] text-slate-500 font-mono">06 / 10 &bull; Technical</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            In progress &bull; Prompt {currentPromptIndex + 1} / 3
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Session elapsed</span>
            <span className="font-mono font-bold text-slate-900 text-sm ml-1">39:12 / 45:00</span>
          </div>
        </div>
      </div>

      {/* Main Technical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail: Round Progress (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-2.5">
            Round progress
          </h2>

          <div className="space-y-2.5 text-xs">
            <button
              type="button"
              onClick={() => setCurrentPromptIndex(0)}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between ${
                currentPromptIndex === 0 ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] text-slate-500 block">01 Fundamentals</span>
                <span className="text-slate-800">Stack vs. queue</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Saved</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPromptIndex(1)}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between ${
                currentPromptIndex === 1 ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] text-slate-500 block">02 Coding</span>
                <span className="text-slate-800">Balanced brackets</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Saved</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPromptIndex(2)}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between ${
                currentPromptIndex === 2 ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] text-slate-500 block">03 Trade-offs</span>
                <span className="text-slate-800">Complexity & edge cases</span>
              </div>
              <span className="text-[10px] text-purple-700 font-bold">Current</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block">Connected session</span>
            <span>Microphone on &bull; Camera on &bull; Workspace shared</span>
          </div>
        </div>

        {/* Center: Coding Exercise Workspace (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <h2 className="text-sm font-bold text-slate-900 font-outfit">Validate balanced brackets</h2>
            <p className="text-xs text-slate-600">
              Implement <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-purple-700">isBalanced(text)</code> for (), [] and {}. Ignore non-bracket characters and return true only when every opening bracket has a correctly nested match.
            </p>
          </div>

          {/* Shared Coding Workspace */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-t-lg border border-slate-200">
              <span>Shared coding workspace &bull; Python 3</span>
              <span className="text-emerald-600 font-bold">Saved &bull; 11:31:12</span>
            </div>

            <textarea
              rows={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs p-3.5 rounded-b-lg focus:outline-none resize-none"
            />
          </div>

          {/* Sample Tests Footer */}
          <div className="flex items-center justify-between text-xs pt-2">
            <span className="font-mono text-emerald-700 font-bold">{sampleOutput}</span>
            <button
              type="button"
              onClick={() => setSampleOutput('Sample tests: 6 / 6 passed')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700"
            >
              Run samples
            </button>
          </div>
        </div>

        {/* Right Panel: Discussion Notes (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-2.5">
            Discussion notes
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Complexity & trade-offs</span>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none resize-none"
              />
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 font-bold">
              Response saved
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <strong className="text-slate-900 block">Ready to submit</strong>
              <p>All 3 prompts have responses. Submission records your code, sample tests and notes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentPromptIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentPromptIndex === 0}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-semibold text-xs transition-colors"
        >
          Previous prompt
        </button>

        <span className="text-xs text-slate-500 hidden md:inline">
          Submit code and discussion notes to finish Round 2 and unlock HR. This cannot be undone.
        </span>

        <button
          type="button"
          onClick={onSubmitTechnicalRound}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm"
        >
          Submit technical round
        </button>
      </div>
    </div>
  );
}
