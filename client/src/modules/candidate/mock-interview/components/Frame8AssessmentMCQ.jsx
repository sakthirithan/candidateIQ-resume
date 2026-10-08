import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, Check, Play,
  Mic, MicOff, Code, Send, Flag, Sparkles, Terminal, FileCode, RotateCcw
} from 'lucide-react';

export default function Frame8AssessmentMCQ({
  questions = [],
  currentIndex = 0,
  submittedAnswers = {},
  remainingSeconds = 1938, // default 32m 18s
  savedTimestampStr = '',
  onSelectQuestion,
  onSaveAnswer,
  onPrevious,
  onNext,
  onGoToReview
}) {
  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;

  const currentQId = currentQuestion
    ? (currentQuestion.id || currentQuestion.questionId || `q_${currentIndex}`)
    : `q_${currentIndex}`;

  const currentAnsObj = submittedAnswers[currentQId] || null;

  // Selected state for MCQ
  const currentOption = currentAnsObj?.selectedOption || currentAnsObj?.option || currentAnsObj?.answer || '';
  
  // Text response draft
  const [textDraft, setTextDraft] = useState(currentAnsObj?.textResponse || currentAnsObj?.answer || '');

  // Coding response draft
  const [codeDraft, setCodeDraft] = useState(
    currentAnsObj?.codeResponse || currentQuestion?.initialCode || 'def isBalanced(text):\n    # Write your solution here\n    pass'
  );
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [testOutput, setTestOutput] = useState(null);

  // Voice response state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState(currentAnsObj?.voiceTranscript || currentAnsObj?.transcript || '');

  useEffect(() => {
    if (currentAnsObj) {
      setTextDraft(currentAnsObj?.textResponse || currentAnsObj?.answer || '');
      if (currentAnsObj?.codeResponse) setCodeDraft(currentAnsObj.codeResponse);
      if (currentAnsObj?.voiceTranscript) setVoiceTranscript(currentAnsObj.voiceTranscript);
    } else {
      setTextDraft('');
      if (currentQuestion?.initialCode) setCodeDraft(currentQuestion.initialCode);
      setVoiceTranscript('');
    }
  }, [currentIndex, currentQId, currentAnsObj, currentQuestion]);

  // Voice timer effect
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const answeredCount = Object.keys(submittedAnswers).filter(
    (k) => submittedAnswers[k]?.selectedOption || submittedAnswers[k]?.option || submittedAnswers[k]?.answer || submittedAnswers[k]?.textResponse || submittedAnswers[k]?.codeResponse
  ).length;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Format countdown seconds into MM:SS
  const formatTimer = (secs) => {
    if (secs === null || secs === undefined || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds !== null && remainingSeconds < 300;

  // MCQ Selection handler
  const handleSelectMCQ = (letter, text) => {
    if (onSaveAnswer) {
      onSaveAnswer(currentQId, {
        questionId: currentQId,
        questionType: 'MCQ',
        selectedOption: letter,
        optionText: text,
        answer: letter,
        submittedAt: new Date().toISOString()
      });
    }
  };

  // Text response blur/change handler
  const handleSaveText = (value) => {
    setTextDraft(value);
    if (onSaveAnswer) {
      onSaveAnswer(currentQId, {
        questionId: currentQId,
        questionType: 'TEXT',
        textResponse: value,
        answer: value,
        submittedAt: new Date().toISOString()
      });
    }
  };

  // Code response save
  const handleSaveCode = (value) => {
    setCodeDraft(value);
    if (onSaveAnswer) {
      onSaveAnswer(currentQId, {
        questionId: currentQId,
        questionType: 'CODING',
        codeResponse: value,
        language: codeLanguage,
        answer: value,
        submittedAt: new Date().toISOString()
      });
    }
  };

  const handleRunSampleTests = () => {
    setTestOutput({
      total: 6,
      passed: 6,
      results: [
        { test: '"{[a+b]}" → true', passed: true },
        { test: '"([)]" → false', passed: true },
        { test: '"" → true', passed: true }
      ]
    });
  };

  // Voice recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const simulatedTranscript = voiceTranscript || 'I implemented a stack-based algorithm to push opening brackets and pop matching closing brackets in O(n) time complexity.';
      setVoiceTranscript(simulatedTranscript);
      if (onSaveAnswer) {
        onSaveAnswer(currentQId, {
          questionId: currentQId,
          questionType: 'VOICE',
          voiceTranscript: simulatedTranscript,
          duration: voiceSeconds,
          answer: simulatedTranscript,
          submittedAt: new Date().toISOString()
        });
      }
    } else {
      setIsRecording(true);
      setVoiceSeconds(0);
    }
  };

  const qType = currentQuestion?.type || currentQuestion?.questionType || 'MCQ';

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 md:px-6 py-4">
      {/* Active Header Row */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <div>
            <h1 className="text-sm font-bold text-slate-900 font-outfit">
              Round 1 &mdash; Aptitude & core concepts
            </h1>
            <span className="text-[11px] text-slate-500 font-mono">03 / 10 &bull; Assessment</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            In progress
          </span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
            isLowTime ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Time remaining</span>
            <span className="font-mono font-bold text-slate-900 text-sm ml-1">
              {formatTimer(remainingSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Assessment Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT RAIL: Questions Rail (3 cols ~25%) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit">
              Questions
            </h2>
            <div className="text-[11px] font-medium text-slate-500">
              <span className="text-emerald-700 font-bold">{answeredCount} answered</span>
              <span className="mx-1">&bull;</span>
              <span>{unansweredCount} unanswered</span>
            </div>
          </div>

          {/* Grid of Numbered Boxes */}
          <div className="grid grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const qId = q.id || q.questionId || `q_${idx}`;
              const isCurrent = idx === currentIndex;
              const ansObj = submittedAnswers[qId];
              const isAnswered = Boolean(
                ansObj?.selectedOption || ansObj?.option || ansObj?.answer || ansObj?.textResponse || ansObj?.codeResponse
              );

              let boxClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
              if (isCurrent) {
                boxClass = 'bg-purple-600 border-purple-700 text-white font-bold shadow-xs ring-2 ring-purple-300';
              } else if (isAnswered) {
                boxClass = 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold';
              }

              return (
                <button
                  key={qId}
                  type="button"
                  onClick={() => onSelectQuestion(idx)}
                  className={`h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${boxClass}`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          {/* Rail Legend */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
              <span>Green: answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-white border border-slate-300 shrink-0"></span>
              <span>White: unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-600 shrink-0"></span>
              <span>Purple: current question</span>
            </div>
          </div>
        </div>

        {/* CENTER AREA: Question Card (5 cols ~45%) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <span className="font-bold text-indigo-600 uppercase tracking-wider font-outfit">
              {currentQuestion?.category || currentQuestion?.topic || 'Data Structures'} &bull; {currentQuestion?.targetSkill || 'Stacks'}
            </span>
            <span className="font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
            {currentQuestion?.questionText || currentQuestion?.question || 'Which data structure is most suitable for checking balanced parentheses in an expression?'}
          </h2>

          {/* Supporting Context / Expression Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="text-slate-600">
              Read the expression from left to right. Opening brackets must be matched with the most recently encountered unmatched opening bracket.
            </p>
            {currentQuestion?.contextSnippet ? (
              <div className="p-2.5 bg-slate-900 text-slate-200 font-mono rounded-lg overflow-x-auto text-[11px]">
                {currentQuestion.contextSnippet}
              </div>
            ) : (
              <div className="p-2.5 bg-slate-900 text-slate-200 font-mono rounded-lg text-[11px]">
                Expression: {'{ [ ( a + b ) * c ] }'}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 italic">
            Choose one option in the Answers panel. Your choice is saved automatically.
          </p>

          {/* Auto-Save Indicator Box */}
          {currentAnsObj && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Answer saved</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                {currentAnsObj.selectedOption ? `Option ${currentAnsObj.selectedOption} is selected for question ${currentIndex + 1}.` : 'Your response has been recorded.'} You can revise it until you submit Round 1.
              </p>
            </div>
          )}

          {/* Assessment Progress Footer Card inside Center */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Assessment progress</span>
              <span className="text-slate-500">
                {answeredCount} of {totalQuestions} questions answered &bull; {unansweredCount} still unanswered
              </span>
            </div>
            <button
              type="button"
              onClick={onGoToReview}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors"
            >
              Review & submit &rarr;
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Answer Selection Panel (4 cols ~30%) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit">
              Answers
            </h2>
            <span className="text-[11px] text-slate-500">
              {qType === 'MCQ' ? 'Single choice · 1 mark' : qType}
            </span>
          </div>

          {/* MCQ Answer Options */}
          {qType === 'MCQ' && (
            <div className="space-y-2.5">
              {(currentQuestion?.options || ['A. Queue', 'B. Stack', 'C. Min heap', 'D. Hash table', 'E. Binary search tree']).map((opt, i) => {
                const isObj = typeof opt === 'object' && opt !== null;
                const optText = isObj
                  ? (opt.text || opt.optionText || opt.option || opt.label || opt.value || opt.id || `Option ${i + 1}`)
                  : String(opt);
                const letter = isObj && opt.id ? String(opt.id) : String.fromCharCode(65 + i); // 'A', 'B', 'C'...
                const isSelected =
                  currentOption === letter ||
                  currentOption === optText ||
                  (typeof currentOption === 'string' && (currentOption === letter || currentOption.startsWith(letter)));

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectMCQ(letter, optText)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-400 text-slate-900 font-bold shadow-xs ring-1 ring-purple-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="leading-snug">{optText}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TEXT Response Workspace */}
          {qType === 'TEXT' && (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={(e) => handleSaveText(e.target.value)}
                placeholder="Type your explanation or response here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{textDraft.length} characters</span>
                <button
                  type="button"
                  onClick={() => handleSaveText(textDraft)}
                  className="px-3 py-1 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-[11px]"
                >
                  Save Text
                </button>
              </div>
            </div>
          )}

          {/* CODING Workspace */}
          {qType === 'CODING' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Code Editor</span>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <textarea
                rows={8}
                value={codeDraft}
                onChange={(e) => handleSaveCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none resize-none"
              />

              <button
                type="button"
                onClick={handleRunSampleTests}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600" /> Run sample tests
              </button>

              {testOutput && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-mono">
                  ✓ Sample tests: {testOutput.passed} / {testOutput.total} passed
                </div>
              )}
            </div>
          )}

          {/* VOICE Response Workspace */}
          {qType === 'VOICE' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-white transition-all shadow-md ${
                    isRecording ? 'bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <span className="font-semibold block text-slate-800">
                  {isRecording ? `Recording... (${voiceSeconds}s)` : 'Click to start voice response'}
                </span>
              </div>

              {voiceTranscript && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 italic">
                  &ldquo;{voiceTranscript}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous question
        </button>

        <span className="text-xs text-slate-500 hidden md:inline">
          {savedTimestampStr ? `Answer saved at ${savedTimestampStr} · ` : ''}Review & submit is available from question navigation.
        </span>

        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto"
        >
          {currentIndex === totalQuestions - 1 ? 'Review & submit →' : 'Next question'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
