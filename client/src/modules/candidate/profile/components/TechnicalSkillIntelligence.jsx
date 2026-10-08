import React, { useState } from 'react';
import { Brain, Code, CheckCircle, ShieldCheck, HelpCircle, ChevronRight, Layers, Award } from 'lucide-react';

export default function TechnicalSkillIntelligence({ skills = [], onNavigate }) {
  const [hoveredSkillId, setHoveredSkillId] = useState(null);

  if (!skills || skills.length === 0) {
    return (
      <div className="saas-card p-6 border border-slate-200/80 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-outfit text-slate-950 leading-none">Technical Skill Intelligence</h3>
              <span className="text-[11px] text-slate-400 font-medium">Derived from parsed resume & interviews</span>
            </div>
          </div>
        </div>

        <div className="p-6 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Code className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">No verified technical skills detected yet.</p>
          <button
            onClick={() => onNavigate && onNavigate('resume')}
            className="btn-outline text-xs inline-flex items-center gap-1.5"
          >
            Upload Resume to Extract Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card p-6 border border-slate-200/80 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-950 leading-none">Technical Skill Intelligence</h3>
            <span className="text-[11px] text-slate-400 font-medium">Multi-source verified skill evidence</span>
          </div>
        </div>
        <span className="badge-pill badge-ai text-[10px]">
          {skills.length} Skills Evaluated
        </span>
      </div>

      {/* Dynamic Skill Item List */}
      <div className="space-y-4 pt-1">
        {skills.slice(0, 6).map((s) => {
          const isHovered = hoveredSkillId === s.skillId;
          const levelColors = {
            'Expert': 'bg-purple-50 text-purple-700 border-purple-200',
            'Advanced': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Intermediate': 'bg-blue-50 text-blue-700 border-blue-200',
            'Foundational': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Beginner': 'bg-slate-100 text-slate-700 border-slate-200',
            'Self-Declared': 'bg-amber-50 text-amber-700 border-amber-200'
          };
          const badgeClass = levelColors[s.proficiencyLevel] || levelColors['Advanced'];

          return (
            <div
              key={s.skillId || s.name}
              className="space-y-1.5 relative group"
              onMouseEnter={() => setHoveredSkillId(s.skillId)}
              onMouseLeave={() => setHoveredSkillId(null)}
            >
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  {s.name}
                  {s.confidence >= 0.8 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                    {s.proficiencyLevel}
                  </span>
                  <span className="text-slate-600 font-mono font-bold">{s.score}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${s.score}%` }}
                ></div>
              </div>

              {/* Skill Evidence Hover Popover */}
              {isHovered && (
                <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-2 pointer-events-none animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-200 font-outfit">{s.name} Evidence Hierarchy</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Confidence: {Math.round((s.confidence || 0) * 100)}%</span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Resume Declared:</span>
                      <span className={s.evidence?.resume ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {s.evidence?.resume ? '✓ Present' : '✕ Not found'}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Project Demonstrations:</span>
                      <span className="font-mono text-indigo-300">{s.evidence?.projects || 0} projects</span>
                    </div>

                    {s.evidence?.mockInterviewScores && (
                      <div className="flex justify-between text-slate-300">
                        <span>Mock Interview Performance:</span>
                        <span className="font-mono text-purple-300">
                          {Math.round(s.evidence.mockInterviewScores.reduce((a,b)=>a+b,0) / s.evidence.mockInterviewScores.length)}% avg
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                    <span>Verified sources: {s.sources ? s.sources.join(', ') : 'Resume'}</span>
                    <span>Last checked: {s.lastVerifiedAt ? new Date(s.lastVerifiedAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate && onNavigate('skills')}
        className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 mt-2"
      >
        Explore Detailed Skill Matrix <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      </button>
    </div>
  );
}
