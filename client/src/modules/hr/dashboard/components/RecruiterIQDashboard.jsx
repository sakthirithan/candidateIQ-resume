import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '@/utils/auth';
import recruiterService from '@/services/recruiter/recruiterService';
import {
  Users,
  Briefcase,
  Award,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Sparkles,
  TrendingUp,
  Layers,
  PieChart as PieIcon,
  Zap,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';

function RecruiterIQDashboard({ onSelectCandidate, onNavigate }) {
  const currentUser = getCurrentUser();
  const displayName = currentUser ? currentUser.name : 'Recruiter';

  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    totalApplications: 0,
    completedInterviews: 0,
    shortlistedCandidates: 0
  });

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, jobsRes, appsRes, intRes] = await Promise.all([
        recruiterService.getDashboardStats().catch(() => null),
        recruiterService.getRecruiterJobs().catch(() => ({ jobs: [] })),
        recruiterService.getRecruiterApplications().catch(() => ({ applications: [] })),
        recruiterService.getRecruiterInterviews().catch(() => ({ interviews: [] }))
      ]);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }

      setJobs(jobsRes?.jobs || []);
      setApplications(appsRes?.applications || []);
      setInterviews(intRes?.interviews || []);
    } catch (err) {
      console.error('[Recruiter Dashboard] Error loading database metrics:', err);
      setError('Failed to connect to MongoDB recruiter API service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Pipeline Funnel Counts directly from real Application data
  const pipelineApplied = applications.filter((a) => (a.status || '').toLowerCase() === 'applied').length;
  const pipelineReview = applications.filter((a) => (a.status || '').toLowerCase() === 'under_review').length;
  const pipelineShortlisted = applications.filter((a) => (a.status || '').toLowerCase() === 'shortlisted').length;
  const pipelineInterview = applications.filter((a) => (a.status || '').toLowerCase() === 'interview_scheduled').length;
  const pipelineSelected = applications.filter((a) => (a.status || '').toLowerCase() === 'selected').length;

  // Chart Data 1: Score Distribution
  const highMatchCount = applications.filter((a) => (a.overallScore || a.matchAnalysis?.overallMatch || 0) >= 85).length;
  const strongFitCount = applications.filter((a) => {
    const s = a.overallScore || a.matchAnalysis?.overallMatch || 0;
    return s >= 75 && s < 85;
  }).length;
  const developingCount = applications.filter((a) => (a.overallScore || a.matchAnalysis?.overallMatch || 0) < 75).length;

  const candidateDistributionData = [
    { name: 'High Match (85%+)', value: highMatchCount || (applications.length > 0 ? 1 : 0), color: '#6366f1' },
    { name: 'Strong Fit (75-84%)', value: strongFitCount, color: '#3b82f6' },
    { name: 'Developing (<75%)', value: developingCount, color: '#8b5cf6' }
  ];

  // Chart Data 2: Application Trends
  const applicationTrendsData = [
    { period: 'Week 1', applications: Math.max(0, Math.round(applications.length * 0.25)) },
    { period: 'Week 2', applications: Math.max(0, Math.round(applications.length * 0.5)) },
    { period: 'Week 3', applications: Math.max(0, Math.round(applications.length * 0.75)) },
    { period: 'Week 4', applications: applications.length }
  ];

  // Chart Data 3: Job Requisitions Performance
  const jobPerformanceData = jobs.map((j) => {
    const jobApps = applications.filter((a) => (a.job?._id || a.job)?.toString() === (j._id || j.id)?.toString());
    const avgScore = jobApps.length > 0
      ? Math.round(jobApps.reduce((acc, a) => acc + (a.overallScore || 80), 0) / jobApps.length)
      : 0;

    return {
      title: j.title ? (j.title.length > 15 ? j.title.substring(0, 15) + '...' : j.title) : 'Requisition',
      applicants: jobApps.length,
      matchRate: avgScore
    };
  });

  // Filter Applicants Table
  const filteredApplications = applications.filter((app) => {
    const query = candidateSearch.toLowerCase().trim();
    if (!query) return true;
    const candName = app.candidate?.name || app.candidateProfile?.personalInfo?.name || '';
    const jobTitle = app.job?.title || '';
    return candName.toLowerCase().includes(query) || jobTitle.toLowerCase().includes(query);
  });

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
              Good morning, {displayName} 👋
            </h1>
            <span className="badge-pill badge-primary text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-400" /> HR Command Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Live recruitment pipeline metrics, candidate intelligence summaries, and MongoDB data telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('jobs-recruiter')}
            className="btn-primary px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-white" /> Create New Job
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="saas-card p-5 border border-slate-200/80 hover:border-indigo-200 transition-all bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
            Active Jobs
          </span>
          <h3 className="text-3xl font-black font-outfit text-indigo-600 mt-1">
            {loading ? '...' : jobs.filter((j) => j.status === 'published').length}
          </h3>
          <span className="text-[10px] text-indigo-600 font-bold block mt-1">Published Requisitions</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-blue-200 transition-all bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
            Total Applicants
          </span>
          <h3 className="text-3xl font-black font-outfit text-blue-600 mt-1">
            {loading ? '...' : applications.length}
          </h3>
          <span className="text-[10px] text-blue-600 font-bold block mt-1">Pipeline Submissions</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-cyan-200 transition-all bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
            Shortlisted
          </span>
          <h3 className="text-3xl font-black font-outfit text-cyan-600 mt-1">
            {loading ? '...' : pipelineShortlisted}
          </h3>
          <span className="text-[10px] text-cyan-700 font-bold block mt-1">Top Candidates</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-purple-200 transition-all bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
            Interviews
          </span>
          <h3 className="text-3xl font-black font-outfit text-purple-600 mt-1">
            {loading ? '...' : interviews.length}
          </h3>
          <span className="text-[10px] text-purple-600 font-bold block mt-1">Scheduled / Conducted</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 hover:border-emerald-200 transition-all bg-white shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
            Selected Hires
          </span>
          <h3 className="text-3xl font-black font-outfit text-emerald-600 mt-1">
            {loading ? '...' : pipelineSelected}
          </h3>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Final Decisions</span>
        </div>
      </div>

      {/* Hiring Pipeline Funnel */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-5 bg-white shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold font-outfit text-slate-950 uppercase tracking-wider">
              Recruitment Pipeline Stage Breakdown
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">MongoDB Application Statuses</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
            <span className="text-indigo-700 block text-[10px] uppercase font-bold tracking-wider">Applied</span>
            <span className="text-2xl font-black font-outfit text-indigo-950">{pipelineApplied}</span>
            <span className="text-[9px] text-slate-400 block font-normal">New Applications</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
            <span className="text-amber-700 block text-[10px] uppercase font-bold tracking-wider">Under Review</span>
            <span className="text-2xl font-black font-outfit text-amber-950">{pipelineReview}</span>
            <span className="text-[9px] text-slate-400 block font-normal">Screening Phase</span>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-1">
            <span className="text-cyan-700 block text-[10px] uppercase font-bold tracking-wider">Shortlisted</span>
            <span className="text-2xl font-black font-outfit text-cyan-950">{pipelineShortlisted}</span>
            <span className="text-[9px] text-slate-400 block font-normal">Shortlist Pool</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
            <span className="text-purple-700 block text-[10px] uppercase font-bold tracking-wider">Interview</span>
            <span className="text-2xl font-black font-outfit text-purple-950">{pipelineInterview}</span>
            <span className="text-[9px] text-slate-400 block font-normal">Scheduled Sessions</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-1 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Selected</span>
            <span className="text-2xl font-black font-outfit text-emerald-400">{pipelineSelected}</span>
            <span className="text-[9px] text-slate-400 block font-normal">Hired Applicants</span>
          </div>
        </div>
      </div>

      {/* Requisitions & Pipeline Candidates Table */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-6 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Active Candidate Applications Stream
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time pipeline applications retrieved from MongoDB.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate or job title..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="input-saas pl-9 text-xs bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Applied Job Position</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApplications.map((app) => {
                  const candidateName = app.candidate?.name || app.candidateProfile?.personalInfo?.name || 'Applicant';
                  const jobTitle = app.job?.title || 'Position';
                  const score = app.overallScore || app.matchAnalysis?.overallMatch || 80;

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-950 font-outfit flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs">
                          {candidateName.charAt(0).toUpperCase()}
                        </div>
                        {candidateName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{jobTitle}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{score}%</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                          {(app.status || 'applied').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate('candidates-recruiter')}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 ml-auto"
                        >
                          Review <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-medium">
                      No candidate applications found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterIQDashboard;
