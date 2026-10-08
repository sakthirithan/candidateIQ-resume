import React from 'react';
import { Check } from 'lucide-react';

export default function AnswerOption({
  optionText = '',
  optionLetter = 'A',
  isSelected = false,
  onSelect,
  disabled = false
}) {
  const safeText = typeof optionText === 'object' && optionText !== null
    ? (optionText.text || optionText.optionText || optionText.label || optionText.value || JSON.stringify(optionText))
    : String(optionText || '');

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled && onSelect) onSelect(optionLetter, safeText);
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          if (onSelect) onSelect(optionLetter, safeText);
        }
      }}
      className={`mcq-option-item w-full p-3.5 sm:p-4 cursor-pointer flex items-start gap-3.5 select-none focus:outline-none ${
        isSelected ? 'selected' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Radio Circle Indicator */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-all mt-0.5 ${
          isSelected
            ? 'border-[#606beb] bg-[#606beb] text-white shadow-xs'
            : 'border-[#D0D5DD] bg-white text-[#475467]'
        }`}
      >
        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : optionLetter}
      </div>

      {/* Option Text Content */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm md:text-base leading-snug font-medium block text-left overflow-wrap-anywhere break-words ${
            isSelected ? 'text-[#101828] font-semibold' : 'text-[#344054]'
          }`}
        >
          {safeText}
        </span>
      </div>
    </div>
  );
}
