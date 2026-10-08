import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

function ResponsibleAIDisclaimer() {
  return (
    <div className="saas-card p-4 border border-slate-200 bg-white text-xs text-slate-600 space-y-2 select-none">
      <div className="flex items-center gap-2 text-indigo-700 font-bold font-outfit">
        <ShieldCheck className="w-4 h-4 text-indigo-600" />
        <span>Responsible AI Recruitment & Human-in-the-Loop Decision Support</span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">
        CandidateIQ adheres to strict ethical AI compliance standards. Candidate scores, skill gap analytics, and behavioural evidence markers are provided solely as <strong>explainable decision-support software</strong>.
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
        <span className="text-emerald-700 font-semibold">✓ Zero protected attribute bias</span>
        <span className="text-slate-600">✓ Explainable metric evidence</span>
        <span className="text-indigo-700 font-semibold">✓ Final hiring decision remains with human talent partners</span>
      </div>
    </div>
  );
}

export default ResponsibleAIDisclaimer;
