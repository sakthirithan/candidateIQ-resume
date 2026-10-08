import React, { useState, useEffect } from 'react';
import recruiterService from '@/services/recruiter/recruiterService';
import { ResponsibleAIDisclaimer } from '@/modules/shared';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Brain,
  Briefcase,
  FileText,
  Sparkles,
  User,
  Info,
  Search,
  Clock,
  XCircle,
  UserCheck,
  RefreshCw,
  Layers,
  Zap,
  TrendingUp,
  Check,
  HelpCircle,
  BarChart3,
  ChevronRight
} from 'lucide-react';

const STATUS_OPTIONS = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];

function CandidateIntelligenceProfile({ onNavigate }) {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intelLoading, setIntelLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const appsRes = await recruiterService.getRecruiterApplications();
      const fetchedApps = appsRes?.applications || [];
      setApplications(fetchedApps);

      if (fetchedApps.length > 0) {
        setSelectedApp(fetchedApps[0]);
        loadApplicationIntelligence(fetchedApps[0]._id);
      }
    } catch (err) {
      console.error('[CandidateIntelligenceProfile] Error loading applications:', err);
      setError('Unable to load applications from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationIntelligence = async (appId) => {
    try {
      setIntelLoading(true);
      const intelRes = await recruiterService.getApplicationIntelligence(appId);
      if (intelRes && intelRes.data) {
        setIntelligence(intelRes.data);
      } else {
        setIntelligence(null);
      }
    } catch (err) {
      console.error('[CandidateIntelligenceProfile] Error loading intelligence:', err);
      setIntelligence(null);
    } finally {
      setIntelLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    loadApplicationIntelligence(app._id);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await recruiterService.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApplications(applications.map((a) => (a._id === appId ? { ...a, status: newStatus } : a)));
        if (selectedApp?._id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
        showToast(`Applicant status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || (app.status || '').toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const candName = app.candidate?.name || app.candidateProfile?.personalInfo?.name || '';
    const jobTitle = app.job?.title || '';
    const matchesSearch = candName.toLowerCase().includes(query) || jobTitle.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto animate-pulse">
        <div className="saas-card p-6 md:p-8 h-32 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="saas-card p-6 h-96 bg-slate-100 rounded-2xl lg:col-span-1"></div>
          <div className="saas-card p-6 h-96 bg-slate-100 rounded-2xl lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (error || applications.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 saas-card">
        <Brain className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold font-outfit text-slate-950">
          {error || 'No Candidate Applications Available'}
        </h3>
        <p className="text-xs text-slate-500">
          No applicants have applied to your published requisitions yet.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('jobs-recruiter')}
          className="btn-primary text-xs inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold"
        >
          View Published Job Requisitions
        </button>
      </div>
    );
  }

  const candName = selectedApp?.candidate?.name || selectedApp?.candidateProfile?.personalInfo?.name || 'Applicant';
  const candEmail = selectedApp?.candidate?.email || 'candidate@example.com';
  const jobTitle = selectedApp?.job?.title || 'Job Requisition';

  const overallFit = intelligence?.overallJobFit || {};
  const pillars = intelligence?.pillars || [];
  const skillMatching = intelligence?.skillMatching || {};
  const insights = intelligence?.explainableInsights || {};
  const resumeSnap = intelligence?.submittedResumeSnapshot || {};

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Requisition Candidate Intelligence</h1>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Job-Specific AI Profiling
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Candidate intelligence evaluated specifically against submitted application resume snapshots and job requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadApplicationIntelligence(selectedApp._id)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${intelLoading ? 'animate-spin' : ''}`} />
            <span>Recalculate AI Fit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Application List Selector vs Application Intelligence Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Drawer: Applicants Selector List */}
        <div className="saas-card p-5 border border-slate-200/80 space-y-4 lg:col-span-1 bg-white shadow-sm">
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider">Submitted Applications</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate name or job..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-saas pl-9 text-xs w-full bg-slate-50"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredApps.map((app) => {
              const name = app.candidate?.name || app.candidateProfile?.personalInfo?.name || 'Applicant';
              const title = app.job?.title || 'Requisition';
              const isSelected = selectedApp?._id === app._id;
              const score = app.overallScore || app.matchAnalysis?.overallMatch || 80;

              return (
                <div
                  key={app._id}
                  onClick={() => handleSelectApp(app)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-950 font-outfit">{name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]">{title}</p>
                    <span className="text-[10px] text-indigo-600 font-semibold capitalize">
                      {(app.status || 'applied').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-outfit text-indigo-600">{score}%</span>
                    <span className="text-[9px] text-slate-400 block">Job Match</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content: Requisition-Specific Candidate Intelligence Profile */}
        <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-6 lg:col-span-2 bg-white shadow-sm">
          {/* Active Application Context Bar */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white text-xl font-black font-outfit shadow-md">
                {candName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold font-outfit text-slate-950">{candName}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                    {(selectedApp?.status || 'applied').replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{candEmail}</p>
                <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Requisition: {jobTitle}
                </p>
              </div>
            </div>

            {/* Recruiter Pipeline Status Action Selector */}
            <div className="space-y-1 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pipeline Decision</span>
              <select
                value={(selectedApp?.status || 'applied').toLowerCase()}
                onChange={(e) => handleUpdateStatus(selectedApp._id, e.target.value)}
                className="input-saas text-xs font-bold py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {intelLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Evaluating candidate evidence for requisition {jobTitle}...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Job Match Rating Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-slate-50 to-purple-50/80 border border-indigo-100 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Requisition Candidate Intelligence Fit</span>
                  <div className="text-3xl font-black font-outfit text-slate-950 mt-0.5 flex items-baseline gap-1">
                    {overallFit.score || 80} <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 block mt-1">
                    {insights.matchRating || 'Strong Fit'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-4 h-4" /> {overallFit.confidence || 90}% Confidence
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {overallFit.explanation || 'Evaluated across available candidate evidence pillars'}
                  </span>
                </div>
              </div>

              {/* 7 Intelligence Pillars Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" /> Evaluation Pillars
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pillars.map((p, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{p.name}</span>
                        <span className="font-mono text-indigo-600 font-bold">
                          {p.available ? `${p.score}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${p.available ? p.score : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Matching Analysis */}
              <div className="p-5 rounded-2xl border border-slate-200/80 space-y-3 bg-slate-50/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" /> Required Skill Match Breakdown
                </h4>

                <div className="space-y-2 text-xs">
                  {skillMatching.matchedSkills && skillMatching.matchedSkills.length > 0 && (
                    <div>
                      <span className="text-emerald-700 font-bold block mb-1">✓ Matched Required Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {skillMatching.matchedSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skillMatching.missingSkills && skillMatching.missingSkills.length > 0 && (
                    <div className="pt-2">
                      <span className="text-amber-700 font-bold block mb-1">⚠ Missing / Unverified Requirements:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {skillMatching.missingSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                            ⚠ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitted Resume Snapshot Information */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" /> Submitted Application Resume Snapshot
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Captured: {resumeSnap.capturedAt ? new Date(resumeSnap.capturedAt).toLocaleDateString() : 'At Apply Time'}
                  </span>
                </div>
                <p className="text-slate-600">
                  This evaluation references the exact resume snapshot submitted by {candName} when applying for {jobTitle}.
                </p>
              </div>

              <ResponsibleAIDisclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateIntelligenceProfile;
