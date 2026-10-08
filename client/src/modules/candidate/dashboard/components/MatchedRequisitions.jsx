import React, { useState } from 'react';
import { Briefcase, CheckCircle2, ChevronRight, Sparkles, Building, MapPin, DollarSign, Clock, AlertCircle } from 'lucide-react';

export default function MatchedRequisitions({ matchedJobs = [], onNavigate }) {
  const [hoveredJobId, setHoveredJobId] = useState(null);

  if (!matchedJobs || matchedJobs.length === 0) {
    return (
      <div className="saas-card p-6 border border-slate-200/80 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-outfit text-slate-950 leading-none">Top Matched Requisitions</h3>
              <span className="text-[11px] text-slate-400 font-medium">Real-time job compatibility engine</span>
            </div>
          </div>
        </div>

        <div className="p-6 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">No published requisitions matched yet.</p>
          <button
            onClick={() => onNavigate && onNavigate('jobs')}
            className="btn-outline text-xs inline-flex items-center gap-1.5"
          >
            Browse All Available Jobs
          </button>
        </div>
      </div>
    );
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'APPLIED':
        return { label: 'Applied', class: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'SHORTLISTED':
        return { label: 'Shortlisted', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'INTERVIEW_SCHEDULED':
        return { label: 'Interview Scheduled', class: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'SELECTED':
        return { label: 'Selected', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'REJECTED':
        return { label: 'Not Selected', class: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return null;
    }
  };

  return (
    <div className="saas-card p-6 border border-slate-200/80 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-950 leading-none">Top Matched Requisitions</h3>
            <span className="text-[11px] text-slate-400 font-medium">Derived from candidate profile compatibility</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('jobs')}
          className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
        >
          View All Jobs <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Matched Job Cards List */}
      <div className="space-y-3">
        {matchedJobs.slice(0, 3).map((job) => {
          const isHovered = hoveredJobId === job.jobId;
          const statusBadge = formatStatus(job.applicationStatus);
          const breakdown = job.matchBreakdown || {};

          return (
            <div
              key={job.jobId}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all flex justify-between items-center gap-4 bg-slate-50/50 hover:bg-white group relative"
              onMouseEnter={() => setHoveredJobId(job.jobId)}
              onMouseLeave={() => setHoveredJobId(null)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 font-outfit group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h4>
                  {statusBadge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.class}`}>
                      ✓ {statusBadge.label}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {job.company} • {job.location} • {job.salaryRange}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold block">
                  {job.matchScore}% Match
                </span>
                <button
                  onClick={() => onNavigate && onNavigate('jobs', job.jobId)}
                  className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 block"
                >
                  View Details →
                </button>
              </div>

              {/* Explainable Job Match Hover Popover */}
              {isHovered && (
                <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-3 pointer-events-none animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200 font-outfit">Why this matches you ({job.matchScore}%)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Status: Active</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {/* Matched skills */}
                    {breakdown.matchedSkills && breakdown.matchedSkills.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Matched Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {breakdown.matchedSkills.map((s, i) => (
                            <span key={i} className="text-emerald-300 font-medium">✓ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Partial skills */}
                    {breakdown.partialSkills && breakdown.partialSkills.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Partial Skill Fit:</span>
                        <div className="flex flex-wrap gap-1">
                          {breakdown.partialSkills.map((s, i) => (
                            <span key={i} className="text-amber-300 font-medium">◐ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing skills */}
                    {breakdown.missingSkills && breakdown.missingSkills.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Skills to acquire:</span>
                        <div className="flex flex-wrap gap-1">
                          {breakdown.missingSkills.map((s, i) => (
                            <span key={i} className="text-slate-400 font-medium">✕ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compatibility metrics */}
                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Technical Compatibility</span>
                        <span className="font-mono text-emerald-400 font-bold">{breakdown.technicalCompatibility || 85}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Experience Compatibility</span>
                        <span className="font-mono text-indigo-400 font-bold">{breakdown.experienceCompatibility || 80}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Interview Studio Recommendation Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-950 font-outfit">AI Mock Interview Studio</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Practice role-specific interview questions to boost candidate IQ technical score and job compatibility.
          </p>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('interview')}
          className="btn-ai text-xs shrink-0 w-full sm:w-auto"
        >
          Start Mock Session
        </button>
      </div>
    </div>
  );
}
