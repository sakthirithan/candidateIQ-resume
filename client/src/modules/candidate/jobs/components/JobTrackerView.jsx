import React, { useState, useEffect, useMemo } from 'react';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { mockJobService, jobService } from '@/services/mockApi/jobService';
import { subscribeToStorage } from '@/services/storage/storageService';
import { getCurrentUser } from '@/utils/auth';
import { formatExperience, formatSalary } from '@/utils/formatters';
import api from '@/services/api';
import {
  BookmarkCheck, Sparkles, Building, MapPin, DollarSign, Calendar, Clock, CheckCircle2,
  ChevronRight, RefreshCw, Briefcase, Plus, Filter, ArrowRight, UserCheck, XCircle,
  AlertCircle, Video, Search, Check, Layers, ExternalLink, ShieldCheck
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'All', label: 'All Applications' },
  { id: 'Applied', label: 'Applied' },
  { id: 'Under Review', label: 'Under Review' },
  { id: 'Shortlisted', label: 'Shortlisted' },
  { id: 'Interview', label: 'Interview' },
  { id: 'Offer', label: 'Offer' },
  { id: 'Rejected', label: 'Rejected' },
  { id: 'Withdrawn', label: 'Withdrawn' }
];

const STAGES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer'];

function JobTrackerView({ onNavigateToJobDetails, onExploreJobs }) {
  const [applications, setApplications] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Search, Date & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'updated'

  useEffect(() => {
    fetchTrackerData();

    const unsubscribe = subscribeToStorage((detail) => {
      if (!detail || detail.entity === 'application') {
        fetchTrackerData();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const candId = currentUser?.id || currentUser?._id || 'cand_1';

      // 1. Fetch applications for candidate
      let userApps = [];
      const apiAppsRes = await api.get('/jobs/candidate/my-applications').catch(() => null);
      if (apiAppsRes?.data?.applications) {
        userApps = apiAppsRes.data.applications;
      } else {
        const allApps = await mockApplicationService.getApplications();
        userApps = allApps.filter((a) => a.candidateId === candId || a.candidateEmail === currentUser?.email || true);
      }
      setApplications(userApps || []);

      // 2. Fetch jobs list for lookup
      let allJobs = [];
      try {
        allJobs = await jobService.getJobs();
      } catch (e) {
        allJobs = await mockJobService.getJobs();
      }

      const jMap = {};
      allJobs.forEach((j) => {
        jMap[j.id || j._id] = j;
      });
      setJobsMap(jMap);
    } catch (err) {
      console.error('Failed to load application tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize backend status to tab / stage
  const getNormalizedStatus = (statusStr) => {
    const st = (statusStr || 'Applied').toLowerCase();
    if (st.includes('offer')) return 'Offer';
    if (st.includes('reject') || st.includes('closed')) return 'Rejected';
    if (st.includes('withdraw')) return 'Withdrawn';
    if (st.includes('interview')) return 'Interview';
    if (st.includes('shortlist')) return 'Shortlisted';
    if (st.includes('review')) return 'Under Review';
    return 'Applied';
  };

  const getStatusBadge = (statusStr) => {
    const norm = getNormalizedStatus(statusStr);
    if (norm === 'Offer') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Offer Received
        </span>
      );
    }
    if (norm === 'Rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-[#DC2626]" /> Application Closed
        </span>
      );
    }
    if (norm === 'Withdrawn') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> Withdrawn
        </span>
      );
    }
    if (norm === 'Interview') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> Interview Stage
        </span>
      );
    }
    if (norm === 'Shortlisted') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Shortlisted
        </span>
      );
    }
    if (norm === 'Under Review') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#D97706] border border-amber-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" /> Under Review
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Applied
      </span>
    );
  };

  // Metrics summary counts
  const summaryCounts = useMemo(() => {
    let total = applications.length;
    let review = 0;
    let shortlisted = 0;
    let interviews = 0;
    let offers = 0;

    applications.forEach((a) => {
      const norm = getNormalizedStatus(a.status);
      if (norm === 'Under Review') review++;
      if (norm === 'Shortlisted') shortlisted++;
      if (norm === 'Interview') interviews++;
      if (norm === 'Offer') offers++;
    });

    return { total, review, shortlisted, interviews, offers };
  }, [applications]);

  // Filtered & Sorted applications list
  const filteredApps = useMemo(() => {
    let list = [...applications];

    // Status Tab filter
    if (activeTab !== 'All') {
      list = list.filter((a) => getNormalizedStatus(a.status) === activeTab);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => {
        const title = (a.jobTitle || a.job?.title || '').toLowerCase();
        const company = (a.company || a.job?.company || '').toLowerCase();
        return title.includes(q) || company.includes(q);
      });
    }

    // Sorting
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appliedDate || '2026-01-01');
      const dateB = new Date(b.createdAt || b.appliedDate || '2026-01-01');
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'updated') {
        const upA = new Date(a.updatedAt || a.createdAt || '2026-01-01');
        const upB = new Date(b.updatedAt || b.createdAt || '2026-01-01');
        return upB - upA;
      }
      return 0;
    });

    return list;
  }, [applications, activeTab, searchQuery, sortBy]);

  // Render 5-Stage Lifecycle Progress Indicator
  const renderProgressBar = (statusStr) => {
    const currentNorm = getNormalizedStatus(statusStr);
    if (currentNorm === 'Rejected' || currentNorm === 'Withdrawn') {
      return null;
    }

    const currentIndex = STAGES.indexOf(currentNorm);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    return (
      <div className="py-2">
        <div className="text-[11px] font-semibold text-[#64748B] mb-2 flex items-center justify-between">
          <span>Application Progress</span>
          <span className="font-bold text-[#4F46E5]">{currentNorm}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 items-center">
          {STAGES.map((stage, idx) => {
            const isPassed = idx < safeIndex;
            const isCurrent = idx === safeIndex;
            return (
              <div key={stage} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-[#4F46E5]'
                      : isPassed
                      ? 'bg-[#059669]'
                      : 'bg-[#E2E8F0]'
                  }`}
                />
                <span
                  className={`block text-[10px] text-center font-medium truncate ${
                    isCurrent
                      ? 'text-[#4F46E5] font-bold'
                      : isPassed
                      ? 'text-[#059669]'
                      : 'text-slate-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-8 text-[#172033] font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#172033]">
                My Applications
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" /> Real-time Pipeline
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              Track your applications, recruitment progress, and upcoming interviews in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTrackerData}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#4F46E5] ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={onExploreJobs}
              className="px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Explore Jobs
            </button>
          </div>
        </div>

        {/* 5 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { id: 'All', title: 'Total Applications', count: summaryCounts.total, color: 'border-[#4F46E5]/30 bg-white' },
            { id: 'Under Review', title: 'Under Review', count: summaryCounts.review, color: 'border-amber-200 bg-amber-50/20' },
            { id: 'Shortlisted', title: 'Shortlisted', count: summaryCounts.shortlisted, color: 'border-indigo-200 bg-indigo-50/20' },
            { id: 'Interview', title: 'Interviews', count: summaryCounts.interviews, color: 'border-purple-200 bg-purple-50/20' },
            { id: 'Offer', title: 'Offers Received', count: summaryCounts.offers, color: 'border-emerald-200 bg-emerald-50/20' }
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className={`p-4 rounded-2xl border ${card.color} shadow-xs space-y-1.5 cursor-pointer hover:shadow-md transition-all ${
                activeTab === card.id ? 'ring-2 ring-[#4F46E5]' : ''
              }`}
            >
              <span className="text-xs font-semibold text-[#64748B] block truncate">{card.title}</span>
              <div className="text-2xl font-bold text-[#172033]">{card.count}</div>
            </div>
          ))}
        </div>

        {/* Search, Filter Toolbar & Status Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search applications by job title or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B] font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#172033] focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Status Tabs Row */}
          <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-3 text-xs">
            {STATUS_TABS.map((tab) => {
              const count = tab.id === 'All'
                ? applications.length
                : applications.filter((a) => getNormalizedStatus(a.status) === tab.id).length;

              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 text-xs cursor-pointer ${
                    isActive
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-[#4F46E5]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Application Cards List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#172033]">
                  {applications.length === 0 ? 'No applications submitted yet' : `No applications under "${activeTab}"`}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {applications.length === 0
                    ? 'Jobs you apply to will automatically appear here. Track your recruiter review progress and interview invites in one place.'
                    : `When a recruiter updates your status to "${activeTab}", it will automatically appear here.`}
                </p>
              </div>
              <button
                onClick={onExploreJobs}
                className="px-4 py-2 bg-[#4F46E5] text-white font-semibold text-xs rounded-xl hover:bg-[#4338CA] transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                Explore Jobs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            filteredApps.map((app) => {
              const jobId = app.jobId || app.job?._id || app.job?.id || app.job;
              const job = jobsMap[jobId] || app.job || {
                title: app.jobTitle || 'Full Stack Engineer',
                company: app.company || 'CandidateIQ Talent Partner',
                location: 'Remote / Hybrid'
              };

              const appIdStr = app._id || app.id || 'APP-2026';
              const appliedDateStr = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (app.appliedDate || 'Recently');
              const companyInitials = (app.company || job.company || 'CIQ').substring(0, 2).toUpperCase();

              return (
                <div
                  key={appIdStr}
                  className="bg-white p-5 md:p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs hover:border-[#4F46E5]/40 transition-all"
                >
                  {/* Top Card Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {companyInitials}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#172033]">
                            {app.jobTitle || job.title}
                          </h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" /> {app.company || job.company} • {job.location || 'Remote'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#4F46E5]" /> {app.matchPercentage || job.matchPercentage || 92}% Match
                      </span>
                    </div>
                  </div>

                  {/* 5-Stage Lifecycle Progress Bar */}
                  {renderProgressBar(app.status)}

                  {/* Scheduled Interview Details Banner */}
                  {app.interviewDetails && getNormalizedStatus(app.status) === 'Interview' && (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                          <Video className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-purple-950 block">
                            Interview Scheduled: {app.interviewDetails.round || 'Technical Discussion'}
                          </span>
                          <span className="text-[11px] text-purple-800 flex items-center gap-2 font-medium">
                            <span><Calendar className="w-3 h-3 inline mr-1" />{app.interviewDetails.date || 'Tomorrow'}</span>
                            <span>•</span>
                            <span><Clock className="w-3 h-3 inline mr-1" />{app.interviewDetails.time || '10:00 AM'}</span>
                            <span>•</span>
                            <span className="font-bold text-purple-900">{app.interviewDetails.mode || 'Virtual / CandidateIQ Room'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Application Metadata & Distinct Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                      <span>Applied: <strong className="text-[#172033]">{appliedDateStr}</strong></span>
                      <span>•</span>
                      <span>ID: <strong className="font-mono text-[#172033]">{appIdStr}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onNavigateToJobDetails(jobId)}
                        className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] transition-all cursor-pointer"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => onNavigateToJobDetails(jobId)}
                        className="w-full sm:w-auto px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        View Job <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default JobTrackerView;
