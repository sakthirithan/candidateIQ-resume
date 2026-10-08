import React, { useState } from 'react';
import {
  Bot, Clock, HelpCircle, Sparkles, CheckCircle2, ShieldCheck, Play, Layers, Briefcase
} from 'lucide-react';

export default function MCQAssessmentStart({
  assessmentTitle = 'Computational Thinking & AI Assessment',
  targetJob = 'Frontend Software Engineer',
  questionCount = 20,
  durationMinutes = 20,
  difficulty = 'Medium',
  skills = ['React', 'JavaScript', 'Node.js', 'System Architecture'],
  attemptNumber = 1,
  onStartAssessment,
  loading = false
}) {
  const [agreed, setAgreed] = useState(true);

  return (
    <div className="mcq-app-canvas min-h-screen py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Top CandidateIQ Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7C4DFF] text-white shadow-md mb-1">
            <Bot className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-[#7C4DFF] uppercase tracking-wider block font-outfit">
            CandidateIQ Assessment Platform
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-outfit">
            {assessmentTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#475467] max-w-md mx-auto">
            Official technical multiple choice question (MCQ) assessment for <strong className="text-[#101828]">{targetJob}</strong> position.
          </p>
        </div>

        {/* Main Assessment Information Surface */}
        <div className="mcq-card-surface p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] text-center">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">Questions</span>
              <span className="text-lg sm:text-xl font-bold text-[#101828] font-outfit">{questionCount}</span>
            </div>
            <div className="space-y-0.5 border-x border-[#E4E7EC]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">Duration</span>
              <span className="text-lg sm:text-xl font-bold text-[#101828] font-outfit">{durationMinutes} min</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">Difficulty</span>
              <span className="text-lg sm:text-xl font-bold text-[#7C4DFF] font-outfit">{difficulty}</span>
            </div>
          </div>

          {/* Targeted Skills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#101828] uppercase tracking-wider block font-outfit">
              Evaluated Technical Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1EBFF] text-[#7C4DFF] border border-[#DDD6FE] flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#7C4DFF]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Assessment Guidelines Checklist */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] space-y-2.5 text-xs text-[#344054]">
            <div className="flex items-center gap-2 text-[#101828] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
              <span>Assessment Rules & Guidelines</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-[#475467] leading-relaxed">
              <li>Each question has one correct answer option.</li>
              <li>You can navigate back and forth between questions using the Question Navigator.</li>
              <li>Your selections are automatically saved locally and synced to CandidateIQ.</li>
              <li>Evaluation is deterministic and AI scorecards are generated upon completion.</li>
            </ul>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-[#344054] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-[#7C4DFF] focus:ring-[#7C4DFF] w-4 h-4"
            />
            <span>I am ready to begin this assessment under timed, focused conditions.</span>
          </label>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onStartAssessment}
            disabled={!agreed || loading}
            className="mcq-btn-purple w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Initializing Assessment...' : 'Start Assessment Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
