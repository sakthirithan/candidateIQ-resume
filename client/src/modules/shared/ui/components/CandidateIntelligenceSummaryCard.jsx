import React from 'react';
import { Award, FileText, CheckCircle2, ShieldCheck, ArrowRight, Brain } from 'lucide-react';

export default function CandidateIntelligenceSummaryCard({
  candidateName = 'Candidate',
  headline = 'CandidateIQ Member',
  candidateIQScore = null,
  resumeMatchPct = null,
  interviewEvidencePct = null,
  skillCoveragePct = null,
  isVerified = false,
  triangulationCounts = {
    supported: 0,
    partial: 0,
    unsupported: 0,
    contradicted: 0,
    notTested: 0
  },
  onViewIntelligence
}) {
  return (
    <div className="saas-card p-5 relative overflow-hidden bg-gradient-to-b from-[#8e98ff] to-[#606beb] text-white shadow-lg font-sans">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Candidate Info & Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black font-outfit text-white text-lg shadow-sm border border-white/30">
            {candidateName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base md:text-xl font-outfit text-white tracking-tight">
                {candidateName}
              </h2>
              {isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d5faf1] text-[#254d4a] border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-[#254d4a]" /> VERIFIED PROFILE
                </span>
              )}
            </div>
            <p className="text-xs text-white/95 font-semibold">{headline}</p>
          </div>
        </div>

        {/* Candidate IQ Score Badge */}
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
          <div className="text-right">
            <span className="text-[10px] text-white/95 font-bold uppercase tracking-wider block">Candidate IQ</span>
            <span className="text-2xl font-black font-outfit text-white leading-none">
              {candidateIQScore !== null && candidateIQScore !== undefined ? candidateIQScore : 'N/A'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-[#606beb] flex items-center justify-center font-black text-xs shadow-sm">
            <Award className="w-5 h-5 text-[#606beb]" />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/20 text-xs">
        <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/15">
          <span className="text-[10px] text-white/95 font-bold block uppercase">Resume Quality</span>
          <span className="font-extrabold text-white text-sm">
            {resumeMatchPct !== null && resumeMatchPct !== undefined ? `${resumeMatchPct}%` : 'Pending'}
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/15">
          <span className="text-[10px] text-white/95 font-bold block uppercase">Interview Score</span>
          <span className="font-extrabold text-white text-sm">
            {interviewEvidencePct !== null && interviewEvidencePct !== undefined ? `${interviewEvidencePct}%` : 'N/A'}
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/15">
          <span className="text-[10px] text-white/95 font-bold block uppercase">Skill Coverage</span>
          <span className="font-extrabold text-white text-sm">
            {skillCoveragePct !== null && skillCoveragePct !== undefined ? `${skillCoveragePct}%` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Triangulation Evidence Summary */}
      <div className="flex items-center justify-between mt-3 pt-2 text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-[#d5faf1] text-[#254d4a] font-bold text-[10px] border border-emerald-300">
            {triangulationCounts.supported} Supported
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#fceed8] text-[#73321b] font-bold text-[10px] border border-amber-300">
            {triangulationCounts.partial} Partial
          </span>
          {triangulationCounts.contradicted > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#f9e3e2] text-[#752522] font-bold text-[10px] border border-rose-300">
              {triangulationCounts.contradicted} Contradiction
            </span>
          )}
        </div>

        {onViewIntelligence && (
          <button
            onClick={onViewIntelligence}
            className="text-white hover:text-indigo-100 font-bold flex items-center gap-1 hover:underline text-xs"
          >
            <span>Full Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
