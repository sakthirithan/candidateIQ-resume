import React, { useState, useEffect } from 'react';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { getCurrentUser } from '@/utils/auth';
import {
  Layers, CheckCircle2, Clock, ChevronRight, Sparkles, Building, Calendar,
  AlertCircle, XCircle, UserCheck, Briefcase, RefreshCw, FileText
} from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'Applied', label: '1. Applied' },
  { key: 'Under Review', label: '2. Under Review' },
  { key: 'Shortlisted', label: '3. Shortlisted' },
  { key: 'Interview', label: '4. Interview' },
  { key: 'Selected', label: '5. Selected' }
];

function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const allApps = await mockApplicationService.getApplications();
      // Filter for current candidate or show all candidate applications
      const userApps = currentUser
        ? allApps.filter((a) => a.candidateId === currentUser.id || a.candidateEmail === currentUser.email || true)
        : allApps;
      setApplications(userApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const st = (status || 'Applied').toLowerCase();
    if (st.includes('applied')) return 1;
    if (st.includes('review')) return 2;
    if (st.includes('shortlist')) return 3;
    if (st.includes('interview')) return 4;
    if (st.includes('select') || st.includes('hired') || st.includes('offer')) return 5;
    if (st.includes('reject')) return -1;
    return 1;
  };

  const getStatusBadge = (status) => {
    const st = (status || 'Applied').toLowerCase();
    if (st.includes('select') || st.includes('hired')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selected / Hired
        </span>
      );
    }
    if (st.includes('reject')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Application Rejected
        </span>
      );
    }
    if (st.includes('interview')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Interview Stage
        </span>
      );
    }
    if (st.includes('shortlist')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-cyan-600" /> Shortlisted
        </span>
      );
    }
    if (st.includes('review')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Applied
      </span>
    );
  };



  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Application Pipeline Tracker</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Synchronized Recruiter Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Track your application pipeline status, recruiter review stages, and interview progress.</p>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={fetchApplications} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Status
          </button>

          <div className="text-right p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 min-w-[160px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline</span>
            <span className="text-3xl font-black font-outfit text-slate-950">
              {applications.length} <span className="text-xs font-semibold text-slate-400">Applications</span>
            </span>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {loading && applications.length === 0 ? (
          <div className="saas-card p-12 text-center border border-slate-200/90 bg-white">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500 mt-3 font-outfit">Loading Application Pipeline...</p>
          </div>
        ) : (
          applications.map((app) => {
          const stepIndex = getStepIndex(app.status);
          const isRejected = stepIndex === -1;

          return (
            <div
              key={app.id}
              className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-6 bg-white shadow-sm hover:border-indigo-200 transition-all"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold font-outfit text-slate-950">{app.jobTitle}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="text-indigo-600 font-bold flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> {app.company}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Applied on {app.appliedDate}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-black font-mono">
                    {app.matchPercentage || 91}% Compatibility Match
                  </span>
                </div>
              </div>

              {/* Status Pipeline Visualizer */}
              {!isRejected ? (
                <div className="py-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Application Pipeline Stage</span>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    {PIPELINE_STEPS.map((step, sIdx) => {
                      const isDone = sIdx + 1 <= stepIndex;
                      const isCurrent = sIdx + 1 === stepIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative group">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110 shadow-md'
                                : isDone
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isDone ? '✓' : sIdx + 1}
                          </div>
                          <span className={`text-[11px] text-center font-outfit ${isCurrent ? 'text-indigo-600 font-bold' : isDone ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
                  Requisition process closed for this submission. Keep your profile updated for future matching roles.
                </div>
              )}

              {/* Action / Information Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong className="text-slate-950 font-outfit">Recruiter Status Note:</strong> Currently marked as{' '}
                    <span className="font-bold text-indigo-600">{app.status}</span>.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {app.id}</span>
                </div>
              </div>
            </div>
          );
        })
      )}

        {!loading && applications.length === 0 && (
          <div className="saas-card p-12 text-center bg-white border border-slate-200/80 space-y-2 text-slate-500 text-xs">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 font-outfit text-sm">No Active Applications Found</p>
            <p>Browse open requisitions in Job Discovery and submit applications to track progress here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationTracker;
