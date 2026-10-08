import React, { useState } from 'react';
import { ArrowRight, Clock, AlertTriangle, CheckCircle2, ShieldCheck, CheckSquare, Square, ChevronRight } from 'lucide-react';

export default function Frame8Review({
  questions = [],
  submittedAnswers = {},
  remainingSeconds = 276, // default 04m 36s
  onSubmitRound1,
  onReturnToAssessment,
  onRevisitQuestion
}) {
  const [chk1, setChk1] = useState(false);
  const [chk2, setChk2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = questions.length;

  const answeredQuestions = questions.filter((q, idx) => {
    const qId = q.id || q.questionId || `q_${idx}`;
    const ans = submittedAnswers[qId];
    return Boolean(ans?.selectedOption || ans?.option || ans?.answer || ans?.textResponse || ans?.codeResponse);
  });

  const unansweredQuestions = questions.filter((q, idx) => {
    const qId = q.id || q.questionId || `q_${idx}`;
    const ans = submittedAnswers[qId];
    return !ans?.selectedOption && !ans?.option && !ans?.answer && !ans?.textResponse && !ans?.codeResponse;
  });

  const answeredCount = answeredQuestions.length;
  const unansweredCount = unansweredQuestions.length;
  const coveragePercent = Math.round((answeredCount / totalQuestions) * 100) || 0;

  const handleSubmit = () => {
    if (!chk1 || !chk2) return;
    setIsSubmitting(true);
    if (onSubmitRound1) onSubmitRound1();
  };

  const formatTimer = (secs) => {
    if (secs === null || secs === undefined || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-outfit">Review Round 1 before submitting</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
              04 / 10 &bull; Review
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Check unanswered questions and revisit any saved answer. Your timer is still running.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
            Review required
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Time remaining</span>
            <span className="font-mono font-bold text-slate-900 text-sm ml-1">
              {formatTimer(remainingSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-emerald-600 font-outfit">
            {answeredCount} / {totalQuestions}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Answered questions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-amber-600 font-outfit">
            {unansweredCount}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Unanswered questions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-indigo-600 font-outfit">
            {coveragePercent}%
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Assessment coverage</div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail: Question Grid (3 cols ~25%) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit">
              Questions
            </h2>
            <span className="text-[11px] text-slate-500">
              {answeredCount} answered &bull; {unansweredCount} open
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const qId = q.id || q.questionId || `q_${idx}`;
              const ans = submittedAnswers[qId];
              const isAns = Boolean(ans?.selectedOption || ans?.option || ans?.answer || ans?.textResponse || ans?.codeResponse);

              return (
                <button
                  key={qId}
                  type="button"
                  onClick={() => onRevisitQuestion(idx)}
                  className={`h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                    isAns
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
              <span>Green: answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-white border border-slate-300 shrink-0"></span>
              <span>White: unanswered</span>
            </div>
          </div>
        </div>

        {/* Center Area: Questions Needing Attention & Saved Spot-Check (5 cols ~45%) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Questions Needing Attention Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-2.5">
              Questions needing attention
            </h2>

            {unansweredCount === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All questions have been answered!
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Unanswered questions will be submitted without a response.
                </p>
                {unansweredQuestions.slice(0, 5).map((q, i) => {
                  const originalIndex = questions.indexOf(q);
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 mr-2">
                          {String(originalIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="font-semibold text-slate-800">{q.category || q.topic || 'Aptitude'}</span>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {q.questionText || q.question}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRevisitQuestion(originalIndex)}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0"
                      >
                        Revisit &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Answer Spot-Check Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-2.5">
              Saved answer spot-check
            </h2>

            <div className="space-y-2 text-xs">
              {answeredQuestions.slice(0, 4).map((q, i) => {
                const originalIndex = questions.indexOf(q);
                const qId = q.id || q.questionId || `q_${originalIndex}`;
                const ans = submittedAnswers[qId];
                const optLetter = ans?.selectedOption || ans?.answer || 'A';
                const optText = ans?.optionText || ans?.option || 'Selected option';

                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 text-slate-700">
                      <strong className="text-slate-900 mr-2 font-mono">Q{originalIndex + 1}</strong>
                      <span className="font-medium truncate">{q.questionText || q.question}</span>
                      <span className="text-emerald-700 font-bold ml-2">[{optLetter}]</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRevisitQuestion(originalIndex)}
                      className="text-indigo-600 hover:underline font-semibold text-[11px] shrink-0"
                    >
                      Revisit &rarr;
                    </button>
                  </div>
                );
              })}
              <p className="text-[11px] text-slate-500 pt-1">Revisit any answer using the question rail.</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Confirm Submission Card (4 cols ~30%) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-outfit border-b border-slate-100 pb-3">
            Confirm submission
          </h2>

          <div className="space-y-3 text-xs text-slate-700">
            {unansweredCount > 0 ? (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-medium">
                <strong>{unansweredCount} unanswered questions</strong>
                <p className="text-[11px] mt-0.5">
                  You may return to complete them, or submit your {answeredCount} saved answers now.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 font-medium">
                <strong>All questions answered</strong>
                <p className="text-[11px] mt-0.5">You are ready to submit your Round 1 assessment.</p>
              </div>
            )}

            <p className="text-slate-600 leading-relaxed">
              Submission is final. Answers cannot be edited after this round is submitted.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={chk1}
                  onChange={(e) => setChk1(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                />
                <span className="text-slate-800 font-medium leading-snug">
                  I have reviewed my responses.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={chk2}
                  onChange={(e) => setChk2(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                />
                <span className="text-slate-800 font-medium leading-snug">
                  I understand {unansweredCount} responses are blank.
                </span>
              </label>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Do not close this tab while submission is in progress. Wait for the submitted receipt.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!chk1 || !chk2 || isSubmitting}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting Round 1...' : 'Submit Round 1'}
          </button>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onReturnToAssessment}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
        >
          Return to assessment
        </button>

        <div className="flex items-center gap-4 text-xs ml-auto">
          <span className="text-slate-500 hidden sm:inline">
            Submitting locks all Round 1 answers. You cannot undo this action.
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!chk1 || !chk2 || isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-sm"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Round 1'}
          </button>
        </div>
      </div>
    </div>
  );
}
