import React from 'react';
import { Bot, CheckCircle2, Clock, Play, AlertCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export default function InterviewRoomLayout({
  questionIndex = 3,
  totalQuestions = 10,
  questionText = "Explain how MongoDB indexing works and how you would design compound indexes for high-concurrency read queries.",
  sectionType = "Technical",
  difficulty = "Medium",
  targetSkill = "MongoDB",
  sourceKeyword = "MongoDB",
  navItems = [
    { id: 1, status: 'evaluated', score: 85 },
    { id: 2, status: 'evaluated', score: 90 },
    { id: 3, status: 'current' },
    { id: 4, status: 'pending' },
    { id: 5, status: 'pending' }
  ],
  candidateAnswer = "",
  setCandidateAnswer,
  onSubmitAnswer,
  isEvaluating = false,
  evaluationResult = null
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto select-none">
      {/* Main Assessment Room Workspace (Col 1-3) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Top Assessment Header */}
        <div className="saas-card p-5 border-l-4 border-l-indigo-600 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Question {questionIndex} of {totalQuestions}
              </span>
              <span className="text-xs text-slate-400 font-medium">|</span>
              <span className="text-xs text-slate-600 font-semibold">{sectionType} Assessment</span>
            </div>
            <h2 className="font-extrabold text-base md:text-lg font-outfit text-slate-900">
              AI Technical Interview Room
            </h2>
          </div>

          {/* Section & Metadata Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {targetSkill}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Source: {sourceKeyword}
            </span>
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="saas-card p-6 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              Q{questionIndex}
            </div>
            <div>
              <h3 className="font-bold font-outfit text-base text-slate-900 leading-snug">
                {questionText}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide a structured technical response. Include architecture decisions, trade-offs, and edge cases.
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Answer Box */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Your Technical Response</label>
            <span className="text-[10px] text-slate-400 font-medium">
              {candidateAnswer ? `${candidateAnswer.split(/\s+/).filter(Boolean).length} words` : '0 words'}
            </span>
          </div>

          <textarea
            value={candidateAnswer}
            onChange={e => setCandidateAnswer && setCandidateAnswer(e.target.value)}
            disabled={isEvaluating}
            placeholder="Type your structured answer here... (e.g. In MongoDB, compound indexes optimize multi-field queries by sorting data along pre-defined keys...)"
            rows={6}
            className="w-full input-saas text-xs leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">
              Turn evaluation is database-persisted immediately on submit.
            </span>

            <button
              onClick={onSubmitAnswer}
              disabled={isEvaluating || !candidateAnswer.trim()}
              className="btn-ai text-xs"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Evaluating Turn...
                </>
              ) : (
                <>
                  Submit Answer <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time AI Evaluation Progress or Result Card */}
        {isEvaluating && (
          <div className="saas-card p-5 bg-indigo-50/70 border border-indigo-200 animate-pulse space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>AI Turn Evaluation Engine Active</span>
            </div>
            <div className="space-y-1 text-xs text-indigo-900">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                1. Parsing response technical concepts...
              </p>
              <p className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                2. Comparing against expected MongoDB rubric...
              </p>
            </div>
          </div>
        )}

        {evaluationResult && (
          <div className="saas-card p-5 border-l-4 border-l-emerald-500 space-y-3 bg-emerald-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold font-outfit text-sm text-slate-900">Turn Evaluation Complete</h4>
              </div>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                Score: {evaluationResult.score}/100
              </span>
            </div>

            <p className="text-xs text-slate-700">{evaluationResult.feedback}</p>

            {evaluationResult.demonstratedConcepts && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Demonstrated:</span>
                {evaluationResult.demonstratedConcepts.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar: Question Navigator Drawer (Col 4) */}
      <div className="lg:col-span-1 space-y-4">
        <div className="saas-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold font-outfit text-sm text-slate-900">Question Navigator</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {navItems.filter(n => n.status === 'evaluated').length} / {totalQuestions} Done
            </span>
          </div>

          {/* Grid of Question Number Nodes */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {navItems.map((item) => {
              const isEvaluated = item.status === 'evaluated';
              const isCurrent = item.status === 'current';

              return (
                <button
                  key={item.id}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                      : isEvaluated
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {isEvaluated ? `✓${item.id}` : item.id}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Evaluated & Saved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span>
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-200"></span>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
