import React from 'react';
import AnswerOption from './AnswerOption';

export default function AnswerOptions({
  options = [],
  selectedOption = '',
  onSelectOption,
  disabled = false
}) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="mcq-card-surface p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
        <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider font-outfit">
          Select Your Answer
        </h3>
        <span className="text-[11px] text-[#667085]">Click or press option letter</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Answer options"
        className="space-y-3"
      >
        {options.map((opt, idx) => {
          const letter = letters[idx] || `Opt-${idx + 1}`;
          const isSelected =
            selectedOption === letter ||
            selectedOption === opt ||
            (typeof selectedOption === 'string' && selectedOption.startsWith(letter));

          return (
            <AnswerOption
              key={idx}
              optionLetter={letter}
              optionText={opt}
              isSelected={isSelected}
              onSelect={() => onSelectOption(letter, opt)}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
}
