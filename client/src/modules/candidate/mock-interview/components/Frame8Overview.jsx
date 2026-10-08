import React from 'react';
import { ArrowRight, Clock, ShieldCheck, CheckCircle2, Monitor, AlertCircle, Laptop, Mic } from 'lucide-react';

export default function Frame8Overview({
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  assessmentTitle = 'CandidateIQ Mock Assessment',
  totalRounds = 3,
  totalDurationMinutes = 115,
  round1Title = 'Aptitude & core concepts',
  round1Subtitle = '40 MCQs · 45 minutes',
  round1Description = 'Logical reasoning, quantitative aptitude and data structure fundamentals.',
  round1Status = 'Ready to start',
  round2Title = 'Technical interview',
  round2Subtitle = '3 prompts · 45 minutes',
  round2Description = 'Discuss your approach, solve a coding problem and explain trade offs.',
  round2Status = 'Pending',
  round3Title = 'HR interview',
  round3Subtitle = '5 discussion topics · 25 minutes',
  round3Description = 'Experience, teamwork, motivation, availability and your questions.',
  round3Status = 'Pending',
  onStartRound1,
  onBackToDashboard
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-outfit">Your interview journey</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
              01 / 10 &bull; Overview
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Welcome, <span className="font-semibold text-slate-800">{candidateName}</span>. Complete each round in sequence to submit your interview.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider">Interview Rounds</span>
            <span className="text-sm font-bold text-slate-900 font-outfit">Aptitude &rarr; Technical &rarr; HR</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider">Estimated Total Duration</span>
            <span className="text-sm font-bold text-slate-900 font-outfit">{totalDurationMinutes} minutes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
            !
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider">Current Journey Status</span>
            <span className="text-sm font-bold text-amber-700 font-outfit">Not started</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Interview Rounds, Right Devices & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interview Rounds (8 cols ~65%) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit">
              Interview rounds
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each completed round unlocks the next. Submission does not indicate selection.
            </p>
          </div>

          <div className="space-y-3">
            {/* Round 1 Card */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">01</span>
                  <h3 className="text-sm font-bold text-slate-900">{round1Title}</h3>
                </div>
                <span className="text-xs font-semibold text-indigo-600 block">{round1Subtitle}</span>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{round1Description}</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full shrink-0">
                {round1Status}
              </span>
            </div>

            {/* Round 2 Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">02</span>
                  <h3 className="text-sm font-bold text-slate-800">{round2Title}</h3>
                </div>
                <span className="text-xs font-medium text-slate-500 block">{round2Subtitle}</span>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">{round2Description}</p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                {round2Status}
              </span>
            </div>

            {/* Round 3 Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">03</span>
                  <h3 className="text-sm font-bold text-slate-800">{round3Title}</h3>
                </div>
                <span className="text-xs font-medium text-slate-500 block">{round3Subtitle}</span>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">{round3Description}</p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                {round3Status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Before You Begin (4 cols ~35%) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit">
            Before you begin
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Laptop className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Use a desktop browser</span>
                <span className="text-slate-500">Keep this tab open and use a stable connection.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mic className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Prepare your devices</span>
                <span className="text-slate-500">Camera and microphone are needed for live interviews.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Allow uninterrupted time</span>
                <span className="text-slate-500">Round 1 is timed. Review all instructions before starting.</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Your candidate profile
            </span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{candidateName}</div>
              <div className="font-mono text-slate-500 text-[11px]">{candidateId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {onBackToDashboard ? (
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
          >
            Back to dashboard
          </button>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-4 text-xs ml-auto">
          <span className="text-slate-500 hidden sm:inline">
            Starting Round 1 opens instructions; the timer has not started.
          </span>
          <button
            type="button"
            onClick={onStartRound1}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            Start Round 1 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
