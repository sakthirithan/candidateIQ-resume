import React from 'react';
import { Sparkles, ShieldAlert, Award, AlertTriangle, Github, Linkedin, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function RightIntelligencePanel({
  isRecruiter = false,
  insights = {
    topSkill: { name: 'React.js', score: 89 },
    skillGap: { name: 'SQL JOIN Optimization', detail: 'Missing indexing concept' },
    interviewSignal: 'Demonstrated strong technical depth in system architecture.',
    contradictions: [
      { skill: 'Redis Caching', detail: 'Resume claims architectural ownership, but interview evidence is low.' }
    ],
    externalEvidence: [
      { name: 'GitHub', value: '24 Repositories', verified: true, icon: Github },
      { name: 'LinkedIn', value: 'Profile Connected', verified: true, icon: Linkedin },
      { name: 'LeetCode', value: '312 Solved', verified: true, icon: ExternalLink }
    ]
  },
  onViewAnalysis
}) {
  return (
    <aside className="w-full lg:w-80 bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-sm">
      {/* Header Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold font-outfit text-sm text-slate-900">
            {isRecruiter ? 'Recruiter Signals' : 'AI Intelligence Context'}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Live AI
        </span>
      </div>

      {/* Strongest Skill Indicator */}
      <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">Top Competency</span>
          <span className="font-bold text-indigo-700">{insights.topSkill.score}/100</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-xs text-slate-900">{insights.topSkill.name}</span>
        </div>
      </div>

      {/* Identified Skill Gap */}
      {insights.skillGap && (
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
          <div className="flex items-center gap-1.5 text-xs mb-1 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Identified Skill Gap</span>
          </div>
          <p className="font-bold text-xs text-slate-900">{insights.skillGap.name}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{insights.skillGap.detail}</p>
        </div>
      )}

      {/* Contradiction Warning */}
      {insights.contradictions && insights.contradictions.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200">
          <div className="flex items-center gap-1.5 text-xs mb-1 text-rose-700">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Review Required</span>
          </div>
          {insights.contradictions.map((item, idx) => (
            <div key={idx} className="mt-1">
              <span className="font-bold text-xs text-rose-900 block">{item.skill} Claim</span>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-tight">{item.detail}</p>
            </div>
          ))}
        </div>
      )}

      {/* Verified External Evidence Sources */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
          Connected Evidence Sources
        </span>
        <div className="space-y-2">
          {insights.externalEvidence.map((ev, idx) => {
            const IconComponent = ev.icon || ExternalLink;
            return (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-semibold text-slate-800 text-xs">{ev.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-medium">{ev.value}</span>
                  {ev.verified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action CTA */}
      {onViewAnalysis && (
        <button
          onClick={onViewAnalysis}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>View Full Intelligence Analysis</span>
        </button>
      )}
    </aside>
  );
}
