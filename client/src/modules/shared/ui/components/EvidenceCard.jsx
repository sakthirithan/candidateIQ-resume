import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const TRIANGULATION_STATES = {
  SUPPORTED: {
    label: 'SUPPORTED',
    badgeClass: 'evidence-badge-supported',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    description: 'Claimed on resume and strongly demonstrated in interview.'
  },
  PARTIALLY_SUPPORTED: {
    label: 'PARTIAL',
    badgeClass: 'evidence-badge-partial',
    icon: AlertTriangle,
    color: 'text-amber-600',
    description: 'Claimed on resume with partial interview demonstration.'
  },
  UNSUPPORTED: {
    label: 'UNSUPPORTED',
    badgeClass: 'evidence-badge-unsupported',
    icon: XCircle,
    color: 'text-rose-600',
    description: 'Claimed on resume but failed in interview evaluation.'
  },
  CONTRADICTED: {
    label: 'CONTRADICTED',
    badgeClass: 'evidence-badge-contradicted',
    icon: ShieldAlert,
    color: 'text-red-700',
    description: 'Resume claim directly contradicted by interview evidence.'
  },
  NOT_TESTED: {
    label: 'NOT TESTED',
    badgeClass: 'evidence-badge-not-tested',
    icon: HelpCircle,
    color: 'text-slate-500',
    description: 'Competency declared but not evaluated in active session.'
  }
};

export default function EvidenceCard({
  skillName = 'React.js',
  jdRequirement = 'Required',
  resumeClaim = 'Strong (3+ Yrs)',
  interviewScore = 84,
  status = 'SUPPORTED',
  confidence = 88,
  evidenceQuote = 'Candidate correctly explained virtual DOM reconciliation and hook state batching.',
  onViewDetails
}) {
  const config = TRIANGULATION_STATES[status] || TRIANGULATION_STATES.NOT_TESTED;
  const IconComponent = config.icon;

  return (
    <div className="evidence-card hover:shadow-md transition-all group">
      {/* Header Skill Title & Triangulation Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h4 className="font-bold font-outfit text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
            {skillName}
          </h4>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {jdRequirement}
          </span>
        </div>
        
        <div className={`badge-pill ${config.badgeClass}`}>
          <IconComponent className="w-3 h-3" />
          <span>{config.label}</span>
        </div>
      </div>

      {/* Grid of Claims & Evidence */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">JD Req</span>
          <span className="font-bold text-slate-800 text-xs">{jdRequirement}</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Resume</span>
          <span className="font-bold text-slate-800 text-xs truncate block" title={resumeClaim}>
            {resumeClaim}
          </span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Interview</span>
          <span className={`font-extrabold text-xs ${interviewScore >= 80 ? 'text-emerald-600' : interviewScore >= 60 ? 'text-amber-600' : 'text-slate-600'}`}>
            {status === 'NOT_TESTED' ? 'N/A' : `${interviewScore}/100`}
          </span>
        </div>
      </div>

      {/* Verified Evidence Quote */}
      {evidenceQuote && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5 mb-3 text-[11px] text-slate-700 italic flex items-start gap-2">
          <span className="text-indigo-500 font-bold not-italic">"</span>
          <p className="line-clamp-2">{evidenceQuote}</p>
          <span className="text-indigo-500 font-bold not-italic">"</span>
        </div>
      )}

      {/* Confidence Bar & Detail Action */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span>Confidence Level</span>
            <span className="font-bold text-indigo-600">{confidence}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
          >
            Details <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
