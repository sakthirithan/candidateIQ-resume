import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { subscribeToStorage } from '@/services/storage/storageService';
import {
  Award, Calendar, Clock, Video, FileText, CheckCircle2, User, Building,
  ExternalLink, AlertCircle, XCircle, Play, RefreshCw, X, Sparkles, ChevronRight,
  ShieldCheck, HelpCircle
} from 'lucide-react';

export default function CandidateHRInterviews() {
  const navigate = useNavigate();

  // Segmented Type Tab: 'job' | 'hr'
  const [activeTypeTab, setActiveTypeTab] = useState('job');

  // Status Filter Tab: 'upcoming' | 'attention' | 'completed' | 'all'
  const [activeStatusTab, setActiveStatusTab] = useState('all');

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    loadInterviews();

    const unsubscribe = subscribeToStorage((detail) => {
      if (!detail || detail.entity === 'interview' || detail.entity === 'application') {
        loadInterviews();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const [res, mockList] = await Promise.all([
        api.get('/interviews/candidate').catch(() => ({ data: { interviews: [] } })),
        mockApplicationService.getHRInterviewsForCandidate('cand_1').catch(() => [])
      ]);

      const realInterviews = (res.data?.interviews || []).map(inv => ({
        id: inv._id || inv.id,
        _id: inv._id,
        jobTitle: inv.job?.title || inv.jobTitle || 'Target Requisition',
        company: inv.job?.company || inv.company || 'CandidateIQ Hiring Partner',
        title: inv.title || `${inv.roundType?.toUpperCase() || 'OFFICIAL'} Interview`,
        type: inv.roundType === 'hr_screening' ? 'HR' : 'FINAL',
        roundType: inv.roundType,
        scheduledDate: inv.scheduledDate ? new Date(inv.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        scheduledTime: inv.scheduledDate ? new Date(inv.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
        scheduleDurationMinutes: inv.durationMinutes || 45,
        duration: `${inv.durationMinutes || 45} Minutes`,
        timeZone: inv.timeZone || 'IST',
        instructions: inv.candidateInstructions || 'Please arrive 5 minutes prior to the scheduled start time.',
        status: inv.status === 'scheduled' ? 'Scheduled' : (inv.status === 'completed' ? 'Completed' : (inv.status || 'Scheduled')),
        meetingRoomReference: inv.meetingRoomReference
      }));

      const combined = [...realInterviews];
      (mockList || []).forEach(m => {
        if (!combined.some(c => c.id === m.id || c._id === m.id)) {
          combined.push(m);
        }
      });

      setInterviews(combined);
    } catch (err) {
      console.error('Error loading candidate interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Availability & Session Window Evaluator
  const getInterviewAvailability = (inv) => {
    if (!inv) return { status: 'CLOSED', label: 'Unavailable', color: 'slate', canJoin: false };

    const candidateId = 'cand_1';
    const candidateAttempt = (inv.candidateAttempts || []).find(a => a.candidateId === candidateId);
    if (candidateAttempt && candidateAttempt.status === 'COMPLETED') {
      return { status: 'COMPLETED', label: 'Completed', color: 'emerald', canJoin: false };
    }
    if (inv.status === 'Cancelled') {
      return { status: 'CANCELLED', label: 'Cancelled', color: 'rose', canJoin: false };
    }

    let startMs = 0;
    let endMs = 0;

    if (inv.startDateTime || inv.startTimeISO) {
      startMs = new Date(inv.startDateTime || inv.startTimeISO).getTime();
    }
    if (inv.endDateTime || inv.endTimeISO) {
      endMs = new Date(inv.endDateTime || inv.endTimeISO).getTime();
    }

    if (!startMs) {
      const dateStr = inv.scheduledDate || inv.interviewDate || new Date().toISOString().split('T')[0];
      const timeStr = inv.scheduledTime || inv.startTime || '10:00';
      let [hStr, mStr] = timeStr.split(':');
      let hours = parseInt(hStr || '10', 10);
      let minutes = parseInt((mStr || '00').split(' ')[0], 10);
      if (timeStr.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (timeStr.toLowerCase().includes('am') && hours === 12) hours = 0;
      const start = new Date(dateStr);
      start.setHours(hours, minutes, 0, 0);
      startMs = start.getTime();
    }

    if (!endMs) {
      let durMs = (inv.scheduleDurationMinutes ? inv.scheduleDurationMinutes * 60 : 2 * 3600) * 1000;
      if (inv.duration && !inv.scheduleDurationMinutes) {
        const numMatch = inv.duration.match(/(\d+)/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          durMs = inv.duration.toLowerCase().includes('hour') ? num * 3600 * 1000 : num * 60 * 1000;
        }
      }
      endMs = startMs + durMs;
    }

    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
    const now = Date.now();

    const startTimeFormatted = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (now < startMs) {
      return {
        status: 'SCHEDULED',
        label: `Scheduled (${startTimeFormatted})`,
        color: 'amber',
        canJoin: false,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted
      };
    } else if (now >= startMs && now < endMs) {
      return {
        status: 'AVAILABLE',
        label: 'Interview Available',
        color: 'purple',
        canJoin: true,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted
      };
    } else {
      return {
        status: 'CLOSED',
        label: 'Interview Window Closed',
        color: 'slate',
        canJoin: false,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted
      };
    }
  };

  // Filter interviews by type (Job vs HR)
  const jobInterviews = useMemo(() => interviews.filter((i) => i.type === 'FINAL' || i.type === 'JOB'), [interviews]);
  const hrInterviews = useMemo(() => interviews.filter((i) => i.type === 'HR' || (!i.type && String(i.id).startsWith('hr'))), [interviews]);

  const typeFilteredList = activeTypeTab === 'job' ? jobInterviews : hrInterviews;

  // Status Counts for current type
  const statusCounts = useMemo(() => {
    let upcoming = 0;
    let attention = 0;
    let completed = 0;
    let all = typeFilteredList.length;

    typeFilteredList.forEach((inv) => {
      const avail = getInterviewAvailability(inv);
      if (avail.status === 'SCHEDULED') upcoming++;
      if (avail.status === 'AVAILABLE' || avail.canJoin) attention++;
      if (avail.status === 'COMPLETED') completed++;
    });

    return { upcoming, attention, completed, all };
  }, [typeFilteredList]);

  // Status Filtered List
  const statusFilteredList = useMemo(() => {
    if (activeStatusTab === 'upcoming') {
      return typeFilteredList.filter((inv) => getInterviewAvailability(inv).status === 'SCHEDULED');
    }
    if (activeStatusTab === 'attention') {
      return typeFilteredList.filter((inv) => {
        const avail = getInterviewAvailability(inv);
        return avail.status === 'AVAILABLE' || avail.canJoin;
      });
    }
    if (activeStatusTab === 'completed') {
      return typeFilteredList.filter((inv) => getInterviewAvailability(inv).status === 'COMPLETED');
    }
    return typeFilteredList;
  }, [typeFilteredList, activeStatusTab]);

  // Featured Next Interview (First available or upcoming interview)
  const nextInterview = useMemo(() => {
    const available = typeFilteredList.find((inv) => getInterviewAvailability(inv).canJoin);
    if (available) return available;
    return typeFilteredList.find((inv) => getInterviewAvailability(inv).status === 'SCHEDULED');
  }, [typeFilteredList]);

  const getStatusBadgeUI = (avail) => {
    if (avail.color === 'emerald') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Completed
        </span>
      );
    }
    if (avail.color === 'rose') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-[#DC2626]" /> Cancelled
        </span>
      );
    }
    if (avail.color === 'purple') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> Interview Available
        </span>
      );
    }
    if (avail.color === 'amber') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#D97706] border border-amber-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" /> {avail.label}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-[#E2E8F0] flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400" /> Closed
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-4 md:p-8 text-[#172033] font-sans antialiased select-none">
      <div className="max-w-[1240px] mx-auto space-y-6">
        
        {/* Page Header & Top Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#172033]">
                Interview Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#7C3AED] border border-purple-100">
                <Award className="w-3.5 h-3.5 text-[#7C3AED]" /> Recruiter Assigned
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              Your recruiter-assigned interviews, assessments, and upcoming interview sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Segmented Type Toggle */}
            <div className="flex items-center p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveTypeTab('job')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTypeTab === 'job'
                    ? 'bg-white text-[#4F46E5] shadow-xs font-bold border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Job Interview ({jobInterviews.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab('hr')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTypeTab === 'hr'
                    ? 'bg-white text-[#7C3AED] shadow-xs font-bold border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                HR Interview ({hrInterviews.length})
              </button>
            </div>

            <button
              onClick={loadInterviews}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#4F46E5] ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* 4 Summary Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E2E8F0] pb-2">
          {[
            { id: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
            { id: 'attention', label: 'Needs Attention', count: statusCounts.attention },
            { id: 'completed', label: 'Completed', count: statusCounts.completed },
            { id: 'all', label: 'All Interviews', count: statusCounts.all }
          ].map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'bg-white text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-[#4F46E5]' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* FEATURED NEXT INTERVIEW PANEL */}
        {nextInterview && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-indigo-200 shadow-xs space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#7C3AED] border border-purple-100">
                  {nextInterview.type === 'FINAL' || nextInterview.type === 'JOB' ? 'Job Interview' : 'HR Interview'}
                </span>
                <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                  Next Scheduled Session
                </span>
              </div>
              {getStatusBadgeUI(getInterviewAvailability(nextInterview))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#172033]">
                  {nextInterview.title}
                </h2>
                <p className="text-xs font-semibold text-[#64748B] flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> {nextInterview.company} • Requisition: {nextInterview.jobTitle || 'Full Stack Engineer'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(nextInterview)}
                  className="w-full md:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs cursor-pointer transition-all"
                >
                  View Details
                </button>

                {getInterviewAvailability(nextInterview).canJoin ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/job-interview/${nextInterview.id}/instructions`)}
                    className="w-full md:w-auto px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" /> Enter Interview
                  </button>
                ) : getInterviewAvailability(nextInterview).status === 'COMPLETED' ? (
                  <span className="px-4 py-2.5 rounded-xl bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Submitted
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full md:w-auto px-5 py-2.5 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl border border-[#E2E8F0] cursor-not-allowed"
                  >
                    Interview Locked
                  </button>
                )}
              </div>
            </div>

            {/* Schedule & Preparation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" /> Time Window
                </span>
                <span className="font-bold text-[#172033] block">
                  {nextInterview.scheduledDate} ({nextInterview.scheduledTime})
                </span>
                <span className="text-[#64748B] text-[11px] block">Timezone: IST (UTC+5:30) • {nextInterview.duration || '2 Hours'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#7C3AED]" /> Assigned Interviewer
                </span>
                <span className="font-bold text-[#172033] block">
                  {nextInterview.interviewer || 'Assigned Hiring Panel'}
                </span>
                <span className="text-[#64748B] text-[11px] block">Recruiter Evaluation Active</span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider block flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-[#7C3AED]" /> Assessment Room
                </span>
                <span className="font-bold text-purple-950 block">
                  {getInterviewAvailability(nextInterview).canJoin ? 'Room Active — Ready' : 'Opens at Scheduled Time'}
                </span>
                <span className="text-purple-800 text-[11px] block">CandidateIQ Evaluation Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* ALL ASSIGNED INTERVIEWS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172033]">
              All Assigned {activeTypeTab === 'job' ? 'Job' : 'HR'} Interviews
            </h3>
            <span className="text-xs font-semibold text-[#64748B]">
              {statusFilteredList.length} sessions listed
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-3 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : statusFilteredList.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#172033]">
                No {activeTypeTab === 'job' ? 'Job' : 'HR'} Interviews Found
              </h4>
              <p className="text-xs text-[#64748B]">
                Recruiter-assigned interview assessments will automatically appear here once scheduled by the hiring team.
              </p>
            </div>
          ) : (
            statusFilteredList.map((inv) => {
              const avail = getInterviewAvailability(inv);
              const isJobType = inv.type === 'FINAL' || inv.type === 'JOB';

              return (
                <div
                  key={inv.id}
                  className="bg-white p-5 md:p-6 rounded-2xl border border-[#E2E8F0] hover:border-indigo-200 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] font-bold flex items-center justify-center border border-purple-100 shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-[#172033]">{inv.title}</h4>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {isJobType ? 'Job Interview' : 'HR Round'}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] font-medium flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" /> {inv.company} • Requisition: {inv.jobTitle || 'Developer'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {getStatusBadgeUI(avail)}
                    </div>
                  </div>

                  {/* Schedule Center Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {inv.scheduledDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {inv.scheduledTime} (IST)
                      </span>
                      <span>•</span>
                      <span>Duration: <strong className="text-[#172033]">{inv.duration || '2 Hours'}</strong></span>
                      {inv.interviewer && (
                        <>
                          <span>•</span>
                          <span>Panel: <strong className="text-[#172033]">{inv.interviewer}</strong></span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedInterview(inv)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs cursor-pointer transition-all"
                      >
                        View Details
                      </button>

                      {avail.canJoin ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/job-interview/${inv.id}/instructions`)}
                          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Join Interview
                        </button>
                      ) : avail.status === 'COMPLETED' ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200">
                          Submitted
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="px-3.5 py-2 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl border border-[#E2E8F0] cursor-not-allowed"
                        >
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REDESIGN C — INTERVIEW DETAILS MODAL */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-[640px] w-full rounded-2xl border border-[#E2E8F0] shadow-2xl space-y-6 p-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
                  Interview Details
                </span>
                <h3 className="text-xl font-bold text-[#172033]">{selectedInterview.title}</h3>
                <p className="text-xs text-[#64748B] font-medium">
                  {selectedInterview.company} • Requisition: {selectedInterview.jobTitle || 'Software Engineer'}
                </p>
              </div>
              <button
                onClick={() => setSelectedInterview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-5 text-xs text-[#172033]">
              {/* SCHEDULE */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  SCHEDULE
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Date:</span>
                    <strong className="text-[#172033]">{selectedInterview.scheduledDate}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Start & End Time:</span>
                    <strong className="text-[#172033]">{selectedInterview.scheduledTime}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Timezone:</span>
                    <strong className="text-[#172033]">IST (UTC+5:30)</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Duration:</span>
                    <strong className="text-[#172033]">{selectedInterview.duration || '2 Hours'}</strong>
                  </div>
                </div>
              </div>

              {/* INTERVIEW INFORMATION */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  INTERVIEW INFORMATION
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-[#64748B]">Round Type</span>
                    <strong className="text-[#4F46E5]">
                      {selectedInterview.type === 'FINAL' || selectedInterview.type === 'JOB' ? 'Job Interview' : 'HR Interview'}
                    </strong>
                  </div>
                  {selectedInterview.interviewer && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-[#64748B]">Assigned Interviewer</span>
                      <strong className="text-[#172033]">{selectedInterview.interviewer}</strong>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Requisition Role</span>
                    <strong className="text-[#172033]">{selectedInterview.jobTitle || 'Developer'}</strong>
                  </div>
                </div>
              </div>

              {/* PREPARATION & INSTRUCTIONS */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  PREPARATION & INSTRUCTIONS
                </span>
                <p className="text-xs text-[#172033] leading-relaxed font-normal">
                  {selectedInterview.instructions || 'Answer recruiter questions accurately within the scheduled window. Evaluated against HR reference answers and scoring prompt.'}
                </p>
              </div>

              {/* SESSION STATUS */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-xs font-semibold text-purple-900">Session Status</span>
                {getStatusBadgeUI(getInterviewAvailability(selectedInterview))}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedInterview(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] cursor-pointer"
              >
                Close
              </button>

              {getInterviewAvailability(selectedInterview).canJoin ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInterview(null);
                    navigate(`/job-interview/${selectedInterview.id}/instructions`);
                  }}
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Enter Interview
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl border border-[#E2E8F0] cursor-not-allowed"
                >
                  Session Unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
