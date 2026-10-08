import React from 'react';
import { Sparkles, Flag, BookOpen, Layers } from 'lucide-react';

export default function QuestionCard({
  question,
  currentIndex = 0,
  totalQuestions = 20,
  isFlagged = false,
  onToggleFlag
}) {
  if (!question) return null;

  const questionText = question.questionText || question.question || question.title || '';
  const difficulty = question.difficulty || 'Medium';
  const category = question.category || question.topic || 'Technical';
  const targetSkill = question.targetSkill || question.sourceKeyword || question.skill || null;
  const sectionName = question.sectionName || `Section ${Math.floor(currentIndex / 5) + 1}`;

  // Simple heuristic for code snippets inside questions (e.g. ```code``` or code lines)
  const hasCodeBlock = questionText.includes('```') || questionText.includes('function ') || questionText.includes('const ') || questionText.includes('SELECT ') || questionText.includes('class ');

  const renderFormattedQuestionText = (text) => {
    if (text.includes('```')) {
      const parts = text.split('```');
      return (
        <div className="space-y-3">
          {parts.map((part, i) => {
            if (i % 2 === 1) {
              return (
                <pre key={i} className="mcq-code-container">
                  <code>{part.trim()}</code>
                </pre>
              );
            }
            return (
              <p key={i} className="text-[#101828] leading-relaxed">
                {part.trim()}
              </p>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-[#101828] text-base md:text-lg font-semibold leading-relaxed overflow-wrap-anywhere break-words space-y-2">
        {text.split('\n\n').map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="mcq-card-surface p-5 md:p-6 space-y-4">
      {/* Top Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e7ec] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#606beb] uppercase tracking-wider font-outfit">
            {sectionName} &bull; Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Badges & Flag Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f0f2ff] text-[#4957eb] border border-[#d0d5ff]">
            {difficulty}
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F8FAFC] text-[#475467] border border-[#E4E7EC]">
            {category}
          </span>
          {targetSkill && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]">
              <Sparkles className="w-3 h-3 text-[#12B76A]" />
              {targetSkill}
            </span>
          )}

          {/* Flag button */}
          {onToggleFlag && (
            <button
              type="button"
              onClick={onToggleFlag}
              aria-label={isFlagged ? 'Unflag question' : 'Flag question for review'}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] flex items-center gap-1 ${
                isFlagged
                  ? 'bg-[#FFFAEB] border-[#FEDF89] text-[#B45309]'
                  : 'bg-white border-[#E4E7EC] text-[#667085] hover:bg-[#F8FAFC]'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-[#F79009] text-[#F79009]' : ''}`} />
              <span className="hidden md:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Question Body */}
      <div className="pt-1">
        {renderFormattedQuestionText(questionText)}
      </div>
    </div>
  );
}
