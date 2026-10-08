import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Briefcase,
  Layers,
  Filter,
  PlusCircle,
  TrendingUp,
  BookmarkCheck,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { mockCandidateService } from '@/services/mockApi/candidateService';
import { mockJobService } from '@/services/mockApi/jobService';
import { matchingService } from '@/services/mockApi/matchingService';

function SkillGapIntelligence() {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'gaps' | 'recommendations'
  const [learningTracker, setLearningTracker] = useState({}); // { [skillName]: 'in_progress' | 'completed' }
  const [isLoading, setIsLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState('');

  // Load candidate and job list on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const candData = await mockCandidateService.getCandidateById('cand_1');
      const jobsData = await mockJobService.getJobs();
      setCandidate(candData);
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0]);
      }
    } catch (err) {
      console.error('Error loading Skill Gap data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic calculation using matchingService classification engine
  const gapAnalysis = matchingService.analyzeSkillGaps(candidate, selectedJob);

  const handleSelectJob = (jobId) => {
    const found = jobs.find((j) => j.id === jobId);
    if (found) {
      setSelectedJob(found);
    }
  };

  const handleAddSkillToProfile = async (skillName) => {
    if (!candidate) return;
    try {
      const newSkillObj = {
        name: skillName,
        category: skillName === 'Docker' || skillName === 'AWS' ? 'DevOps & Cloud' : 'Backend & Architecture',
        level: 'Intermediate',
        evidence: 'Self-guided learning & project implementation'
      };

      const updatedCand = await mockCandidateService.addSkill(candidate.id, newSkillObj);
      setCandidate({ ...updatedCand });

      // Trigger sync notification
      setSyncMessage(`Success: "${skillName}" added to Candidate Profile! Skill Gap & Job Match recalculated.`);
      setTimeout(() => setSyncMessage(''), 4500);
    } catch (err) {
      console.error('Error adding skill to candidate profile:', err);
    }
  };

  const toggleLearningStatus = (skillName) => {
    setLearningTracker((prev) => {
      const current = prev[skillName];
      const next = current === 'in_progress' ? 'completed' : current === 'completed' ? null : 'in_progress';
      return { ...prev, [skillName]: next };
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Sync Banner Notification */}
      {syncMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold font-outfit">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
            Pipeline Synced
          </span>
        </div>
      )}

      {/* Top Header & Job Selector Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 12 — Skill Gap Analysis
                </h1>
                <span className="badge-pill badge-ai text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-600" /> Real-time Job Matching
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Compare candidate skills against target job requirements to classify skills into Strong, Moderate, and Missing tiers.
              </p>
            </div>
          </div>
        </div>

        {/* Job Selection Dropdown & Compatibility Badge */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Candidate Action: Select Target Job
            </label>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <select
                value={selectedJob?.id || ''}
                onChange={(e) => handleSelectJob(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer min-w-[240px]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company || 'Req #' + j.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-right p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 min-w-[150px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Compatibility</span>
            <span className="text-2xl font-black font-outfit text-emerald-600">
              {gapAnalysis.matchPercentage}% <span className="text-xs font-semibold text-slate-400">Match</span>
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Action Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> All Skills ({gapAnalysis.totalCount})
          </button>

          <button
            onClick={() => setActiveFilter('gaps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'gaps'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> View Skill Gaps ({gapAnalysis.moderate.length + gapAnalysis.missing.length})
          </button>

          <button
            onClick={() => setActiveFilter('recommendations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'recommendations'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" /> View Recommendations
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-time Data Sync: Profile → Analysis → Gap → Match</span>
        </div>
      </div>

      {/* Main 3-Tier Classification Output Grid */}
      {(activeFilter === 'all' || activeFilter === 'gaps') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: STRONG SKILLS */}
          {activeFilter !== 'gaps' && (
            <div className="saas-card p-6 border border-emerald-200/90 bg-emerald-50/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <h2 className="text-base font-bold font-outfit text-emerald-950 uppercase tracking-wide">
                    STRONG
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {gapAnalysis.strong.length} Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 font-medium">
                High proficiency skills matching target job requirements.
              </p>

              <div className="space-y-3">
                {gapAnalysis.strong.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-emerald-200/80 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-outfit text-slate-900">
                        {s.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.level || 'Expert'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{s.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tier 2: MODERATE SKILLS */}
          <div className="saas-card p-6 border border-indigo-200/90 bg-indigo-50/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <h2 className="text-base font-bold font-outfit text-indigo-950 uppercase tracking-wide">
                  MODERATE
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {gapAnalysis.moderate.length} Intermediate
              </span>
            </div>
            <p className="text-[11px] text-indigo-900/80 font-medium">
              Foundational skills needing enterprise pattern refinement.
            </p>

            <div className="space-y-3">
              {gapAnalysis.moderate.map((s, idx) => {
                const trackerStatus = learningTracker[s.name];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-indigo-200/80 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-outfit text-slate-900">
                        {s.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {s.level || 'Intermediate'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {s.recommendation}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => toggleLearningStatus(s.name)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          trackerStatus === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : trackerStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {trackerStatus === 'in_progress' ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> In Learning
                          </>
                        ) : trackerStatus === 'completed' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Goal Achieved
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-3 h-3 text-slate-400" /> Track Learning Area
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 3: MISSING SKILLS */}
          <div className="saas-card p-6 border border-rose-200/90 bg-rose-50/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <h2 className="text-base font-bold font-outfit text-rose-950 uppercase tracking-wide">
                  MISSING
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                {gapAnalysis.missing.length} Gaps Detected
              </span>
            </div>
            <p className="text-[11px] text-rose-900/80 font-medium">
              Required or preferred skills missing from candidate profile.
            </p>

            <div className="space-y-3">
              {gapAnalysis.missing.map((s, idx) => {
                const trackerStatus = learningTracker[s.name];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-rose-200/80 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-outfit text-slate-900">
                        {s.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {s.importance || 'Required'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {s.recommendation}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleAddSkillToProfile(s.name)}
                        className="btn-primary text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
                        title="Add to Candidate Profile and update Job Match"
                      >
                        <PlusCircle className="w-3 h-3" /> Add to Profile
                      </button>

                      <button
                        onClick={() => toggleLearningStatus(s.name)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                          trackerStatus === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : trackerStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {trackerStatus === 'in_progress' ? 'In Learning' : trackerStatus === 'completed' ? 'Achieved' : 'Track'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Career Preparation Path (Recommendations View) */}
      {(activeFilter === 'all' || activeFilter === 'recommendations') && (
        <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-6 bg-white shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-outfit text-slate-950">
                  Target Role Learning Recommendations & Preparation Roadmap
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  AI curated action steps to bridge missing skills for {selectedJob?.title || 'target role'}.
                </p>
              </div>
            </div>
            <span className="badge-pill badge-ai text-[10px]">
              AI Tailored Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gapAnalysis.missing.map((mSkill, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border border-slate-200 space-y-3 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-900 text-white font-bold font-outfit text-xs">
                    Step {idx + 1}: Acquire {mSkill.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {mSkill.category}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <span className="font-bold text-slate-900">Why it matters: </span>
                  Target position explicitly specifies {mSkill.name} as a {mSkill.importance || 'Required'} skill for production readiness.
                </p>

                <p className="text-xs text-indigo-700 font-bold flex items-center gap-1 pt-1">
                  Suggested Action: {mSkill.recommendation}{' '}
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleAddSkillToProfile(mSkill.name)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Mark Acquired & Sync Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillGapIntelligence;
