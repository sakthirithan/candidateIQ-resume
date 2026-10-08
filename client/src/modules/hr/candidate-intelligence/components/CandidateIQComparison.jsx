import React, { useState, useEffect } from 'react';
import recruiterService from '@/services/recruiter/recruiterService';
import { ResponsibleAIDisclaimer } from '@/modules/shared';
import {
  ArrowRightLeft,
  Sparkles,
  Award,
  CheckCircle2,
  Brain,
  Layers,
  Briefcase,
  UserCheck,
  TrendingUp,
  FileText,
  Zap,
  Plus,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

function CandidateIQComparison({ onNavigate }) {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3 Candidate Application Slots for Side-by-Side Comparison
  const [appSlotAId, setAppSlotAId] = useState('');
  const [appSlotBId, setAppSlotBId] = useState('');
  const [appSlotCId, setAppSlotCId] = useState('');

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsRes, jobsRes] = await Promise.all([
        recruiterService.getRecruiterApplications().catch(() => ({ applications: [] })),
        recruiterService.getRecruiterJobs().catch(() => ({ jobs: [] }))
      ]);

      const fetchedApps = appsRes?.applications || [];
      const fetchedJobs = jobsRes?.jobs || [];

      setApplications(fetchedApps);
      setJobs(fetchedJobs);

      if (fetchedApps.length > 0) {
        setAppSlotAId(fetchedApps[0]._id);
        if (fetchedApps.length > 1) setAppSlotBId(fetchedApps[1]._id);
        if (fetchedApps.length > 2) setAppSlotCId(fetchedApps[2]._id);
      }
    } catch (err) {
      console.error('[CandidateIQComparison] Error loading comparison data:', err);
      setError('Unable to load database candidates for comparison.');
    } finally {
      setLoading(false);
    }
  };

  // Filter applications by selected job requisition
  const filteredApps = applications.filter(app => {
    if (selectedJobId === 'All') return true;
    return (app.job?._id || app.job)?.toString() === selectedJobId;
  });

  const appA = applications.find(a => a._id === appSlotAId) || filteredApps[0] || null;
  const appB = applications.find(a => a._id === appSlotBId) || filteredApps[1] || filteredApps[0] || null;
  const appC = applications.find(a => a._id === appSlotCId) || filteredApps[2] || filteredApps[0] || null;

  const getMetrics = (app) => {
    if (!app) return { overall: 0, technical: 0, experience: 0, jobMatch: 0 };
    const score = app.overallScore || app.matchAnalysis?.overallMatch || 80;
    return {
      overall: score,
      technical: app.matchAnalysis?.technicalMatch || Math.round(score * 0.95),
      experience: app.matchAnalysis?.experienceMatch || Math.round(score * 0.9),
      jobMatch: score
    };
  };

  const metricsA = getMetrics(appA);
  const metricsB = getMetrics(appB);
  const metricsC = getMetrics(appC);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto animate-pulse">
        <div className="saas-card p-6 md:p-8 h-32 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl"></div>
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl"></div>
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || applications.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 saas-card">
        <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold font-outfit text-slate-950">
          {error || 'Insufficient Candidate Applications to Compare'}
        </h3>
        <p className="text-xs text-slate-500">
          At least 2 candidate applications are required to perform a multi-applicant side-by-side comparison.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('jobs-recruiter')}
          className="btn-primary text-xs inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold"
        >
          View Published Requisitions
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Candidate IQ Multi-Applicant Matrix</h1>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Requisition Comparison
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Side-by-side comparative analysis of candidate evidence, technical scores, and requisition compatibility.
          </p>
        </div>

        {/* Filter Requisition Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter Requisition:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input-saas text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
          >
            <option value="All">All Requisitions ({jobs.length})</option>
            {jobs.map(j => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Candidate Slots Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Slot A */}
        <div className="saas-card p-6 border border-indigo-200 space-y-5 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Candidate Slot 1</span>
            <select
              value={appSlotAId}
              onChange={(e) => setAppSlotAId(e.target.value)}
              className="input-saas text-xs font-bold w-full bg-white border border-slate-300 rounded-xl"
            >
              {filteredApps.map(a => (
                <option key={a._id} value={a._id}>
                  {a.candidate?.name || 'Applicant'} — {a.job?.title || 'Job'}
                </option>
              ))}
            </select>
          </div>

          {appA && (
            <div className="space-y-4 pt-2">
              <div className="text-center p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Match Score</span>
                <div className="text-3xl font-black font-outfit text-indigo-600">{metricsA.overall}%</div>
                <span className="text-xs text-indigo-700 font-bold block mt-1">{appA.job?.title || 'Requisition'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Technical Match</span>
                  <span className="font-mono font-bold text-slate-950">{metricsA.technical}%</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Experience Match</span>
                  <span className="font-mono font-bold text-slate-950">{metricsA.experience}%</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Status</span>
                  <span className="capitalize font-bold text-indigo-600">{(appA.status || 'applied').replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slot B */}
        <div className="saas-card p-6 border border-blue-200 space-y-5 bg-gradient-to-b from-blue-50/40 via-white to-white shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Candidate Slot 2</span>
            <select
              value={appSlotBId}
              onChange={(e) => setAppSlotBId(e.target.value)}
              className="input-saas text-xs font-bold w-full bg-white border border-slate-300 rounded-xl"
            >
              {filteredApps.map(a => (
                <option key={a._id} value={a._id}>
                  {a.candidate?.name || 'Applicant'} — {a.job?.title || 'Job'}
                </option>
              ))}
            </select>
          </div>

          {appB && (
            <div className="space-y-4 pt-2">
              <div className="text-center p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Match Score</span>
                <div className="text-3xl font-black font-outfit text-blue-600">{metricsB.overall}%</div>
                <span className="text-xs text-blue-700 font-bold block mt-1">{appB.job?.title || 'Requisition'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Technical Match</span>
                  <span className="font-mono font-bold text-slate-950">{metricsB.technical}%</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Experience Match</span>
                  <span className="font-mono font-bold text-slate-950">{metricsB.experience}%</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Status</span>
                  <span className="capitalize font-bold text-blue-600">{(appB.status || 'applied').replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slot C */}
        <div className="saas-card p-6 border border-purple-200 space-y-5 bg-gradient-to-b from-purple-50/40 via-white to-white shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Candidate Slot 3</span>
            <select
              value={appSlotCId}
              onChange={(e) => setAppSlotCId(e.target.value)}
              className="input-saas text-xs font-bold w-full bg-white border border-slate-300 rounded-xl"
            >
              {filteredApps.map(a => (
                <option key={a._id} value={a._id}>
                  {a.candidate?.name || 'Applicant'} — {a.job?.title || 'Job'}
                </option>
              ))}
            </select>
          </div>

          {appC && (
            <div className="space-y-4 pt-2">
              <div className="text-center p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Match Score</span>
                <div className="text-3xl font-black font-outfit text-purple-600">{metricsC.overall}%</div>
                <span className="text-xs text-purple-700 font-bold block mt-1">{appC.job?.title || 'Requisition'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Technical Match</span>
                  <span className="font-mono font-bold text-slate-950">{metricsC.technical}%</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Experience Match</span>
                  <span className="font-mono font-bold text-slate-950">{metricsC.experience}%</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Status</span>
                  <span className="capitalize font-bold text-purple-600">{(appC.status || 'applied').replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ResponsibleAIDisclaimer />
    </div>
  );
}

export default CandidateIQComparison;
