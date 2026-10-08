import React from 'react';
import { X, CheckCircle2, Circle, Flag } from 'lucide-react';
import QuestionNavigator from './QuestionNavigator';

export default function QuestionNavigatorMobile({
  isOpen = false,
  onClose,
  questions = [],
  currentIndex = 0,
  submittedAnswers = {},
  flaggedQuestions = {},
  onSelectQuestion
}) {
  if (!isOpen) return null;

  const handleSelect = (idx) => {
    onSelectQuestion(idx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#101828] font-outfit">Question Navigator</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close question navigator drawer"
            className="p-1 rounded-lg text-[#667085] hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            submittedAnswers={submittedAnswers}
            flaggedQuestions={flaggedQuestions}
            onSelectQuestion={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
