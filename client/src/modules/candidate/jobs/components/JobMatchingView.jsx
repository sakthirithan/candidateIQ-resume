import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { mockJobService } from '@/services/mockApi/jobService';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { mockCandidateService } from '@/services/mockApi/candidateService';
import { matchingService } from '@/services/mockApi/matchingService';
import { Briefcase, CheckCircle2, Sparkles, AlertCircle, ChevronRight, Layers } from 'lucide-react';

function JobMatchingView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs');
      const list = res.data.jobs || [];
      setJobs(list);
      if (list.length > 0) setSelectedJob(list[0]);
    } catch (err) {
      const mockList = await mockJobService.getJobs();
      setJobs(mockList);
      if (mockList.length > 0) setSelectedJob(mockList[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(true);
      setMatchResult(null);

      const candidate = await mockCandidateService.getCandidateById('cand_1');
      const matchResultData = matchingService.calculateMatch(candidate, selectedJob);

      await mockApplicationService.applyForJob({
        jobId: selectedJob?.id || 'job_1',
        candidateId: 'cand_1',
        jobTitle: selectedJob?.title || 'Senior Engineer',
        company: selectedJob?.company || 'CandidateIQ Enterprise',
        matchPercentage: matchResultData.overallMatch,
        iqScore: 88
      });

      setMatchResult(matchResultData);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-outfit">Jobs & Explainable Matching</h2>
          <p className="text-xs text-slate-400">Apply to target engineering jobs and generate explainable AI compatibility reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List Column */}
        <div className="lg:col-span-2 space-y-4">
          {loading && jobs.length === 0 ? (
            <div className="flex items-center justify-center p-12 glass-card border border-slate-800">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id || job._id}
                onClick={() => { setSelectedJob(job); setMatchResult(null); }}
                className={`glass-card p-5 border cursor-pointer transition-all ${
                  selectedJob?.id === job.id || selectedJob?._id === job._id
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 font-outfit">{job.title}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{job.department} • {job.location}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {job.employmentType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {(job.requiredSkills || []).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px] font-medium border border-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                    View Analysis <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Job & Explainable Match Drawer Column */}
        <div className="space-y-4">
          {selectedJob ? (
            <div className="glass-card p-6 border border-slate-800 space-y-6 sticky top-24">
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-outfit">{selectedJob.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedJob.experienceLevel} • {selectedJob.education}</p>
              </div>

              <button
                onClick={() => handleApply(selectedJob.id || selectedJob._id)}
                disabled={applying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {applying ? 'Running AI Match Analysis...' : 'Apply & Calculate Match Score'}
              </button>

              {matchResult && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Overall Job Match</span>
                    <h4 className="text-3xl font-extrabold font-outfit text-indigo-400">{matchResult.overallMatch}%</h4>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Strong Skill Alignment</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(matchResult.strongMatches || []).map((m, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                          ✓ {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Missing Target Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(matchResult.missingSkills || []).map((m, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
                          ⚠ {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-indigo-400">Explainable AI Recommendation:</span>
                    <p>{matchResult.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-slate-400 text-xs border border-slate-800">
              Select a job posting from the list to view requirements and calculate candidate compatibility score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobMatchingView;
