import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { subscribeToStorage } from '@/services/storage/storageService';
import {
  Video, Calendar, Clock, User, Briefcase, Search, Plus, Filter,
  ExternalLink, CheckCircle2, AlertCircle, XCircle, RefreshCw, X, Users, Mail, FileText
} from 'lucide-react';

export default function RecruiterInterviewsPage({ onNavigate }) {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('upcoming'); // 'upcoming' | 'today' | 'completed' | 'cancelled' | 'all'

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00');
  const [rescheduleTimeZone, setRescheduleTimeZone] = useState('IST (UTC+5:30)');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // View Details Modal State
  const [detailsTarget, setDetailsTarget] = useState(null);

  useEffect(() => {
    loadInterviews();

    const unsubscribe = subscribeToStorage((detail) => {
      if (!detail || detail.entity === 'interview') {
        loadInterviews();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/interviews/recruiter');
      if (res.data?.success) {
        setInterviews(res.data.interviews || []);
      } else {
        setInterviews([]);
      }
    } catch (err) {
      console.error('Error loading recruiter interviews:', err);
      setError('Failed to load scheduled interviews. Please try again.');
    } fontinally: {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredInterviews = useMemo(() => {
    let list = [...interviews];

    // Status filtering
    const todayStr = new Date().toISOString().split('T')[0];

    if (statusTab === 'upcoming') {
      list = list.filter(i => i.status === 'scheduled' || i.status === 'rescheduled');
    } else if (statusTab === 'today') {
      list = list.filter(i => {
        const d = i.scheduledDate ? new Date(i.scheduledDate).toISOString().split('T')[0] : '';
        return d === todayStr && (i.status === 'scheduled' || i.status === 'rescheduled');
      });
    } else if (statusTab === 'completed') {
      list = list.filter(i => i.status === 'completed');
    } else if (statusTab === 'cancelled') {
      list = list.filter(i => i.status === 'cancelled' || i.status === 'Cancelled');
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => {
        const candName = (i.candidate?.name || i.candidateName || '').toLowerCase();
        const jobTitle = (i.job?.title || i.jobTitle || '').toLowerCase();
        const round = (i.roundType || i.title || '').toLowerCase();
        return candName.includes(q) || jobTitle.includes(q) || round.includes(q);
      });
    }

    return list;
  }, [interviews, statusTab, searchQuery]);

  // Handle Reschedule Submit
  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate) return;

    try {
      setIsRescheduling(true);
      const payload = {
        scheduledDate: `${rescheduleDate}T${rescheduleTime}:00`,
        scheduledTime: rescheduleTime,
        timeZone: rescheduleTimeZone,
        reason: rescheduleReason
      };

      const res = await api.put(`/interviews/${rescheduleTarget._id || rescheduleTarget.id}/reschedule`, payload);
      if (res.data?.success) {
        setRescheduleTarget(null);
        setRescheduleReason('');
        loadInterviews();
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      alert('Failed to reschedule interview.');
    } finally {
      setIsRescheduling(false);
    }
  };

  // Handle Cancel Submit
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    try {
      setIsCancelling(true);
      const res = await api.put(`/interviews/${cancelTarget._id || cancelTarget.id}/cancel`, {
        cancellationReason: cancelReason
      });
      if (res.data?.success) {
        setCancelTarget(null);
        setCancelReason('');
        loadInterviews();
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel interview.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Navigate to Jitsi Video Room
  const handleJoinVideoMeeting = (inv) => {
    const invId = inv._id || inv.id;
    window.open(`/job-interview/${invId}/room`, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>HR Workspace</span>
            <span>/</span>
            <span>Interviews</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Video className="w-7 h-7 text-indigo-600" />
            Candidate Interviews
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage scheduled video interviews, interview panels, and candidate attendance.
          </p>
        </div>

        <button
          onClick={() => onNavigate ? onNavigate('create-interview-recruiter') : navigate('/create-interview-recruiter')}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Create Interview
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b md:border-b-0 pb-2 md:pb-0">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'today', label: "Today's" },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'all', label: 'All Interviews' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                statusTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, job, or round..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
          <p>Loading candidate interviews...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No scheduled interviews found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {statusTab === 'all'
              ? 'No interviews have been scheduled yet.'
              : `No interviews currently under "${statusTab}".`}
          </p>
          <button
            onClick={() => onNavigate ? onNavigate('create-interview-recruiter') : navigate('/create-interview-recruiter')}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create First Interview
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map((inv) => {
            const invId = inv._id || inv.id;
            const candidateName = inv.candidate?.name || inv.candidateName || 'Candidate';
            const candidateEmail = inv.candidate?.email || inv.candidateEmail || '';
            const jobTitle = inv.job?.title || inv.jobTitle || 'Target Requisition';
            const company = inv.job?.company || inv.company || 'CandidateIQ Hiring Partner';
            const roundTitle = inv.title || `${inv.roundType?.toUpperCase() || 'OFFICIAL'} Interview`;
            
            const dateStr = inv.scheduledDate
              ? new Date(inv.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Upcoming';
            
            const timeStr = inv.scheduledDate
              ? new Date(inv.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '10:00 AM';

            const status = inv.status || 'scheduled';
            const isCompleted = status === 'completed';
            const isCancelled = status === 'cancelled' || status === 'Cancelled';

            return (
              <div
                key={invId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Status & Round Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {inv.roundType ? inv.roundType.replace('_', ' ') : 'Video Round'}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {/* Candidate Info */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{candidateName}</h3>
                    {candidateEmail && <p className="text-xs text-slate-500">{candidateEmail}</p>}
                  </div>

                  {/* Requisition Info */}
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{jobTitle}</span>
                    </div>
                    <p className="text-slate-500 pl-5">{company}</p>
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{timeStr} ({inv.durationMinutes || 45}m)</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailsTarget(inv)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Details
                  </button>

                  {!isCompleted && !isCancelled && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRescheduleTarget(inv);
                          setRescheduleDate(inv.scheduledDate ? new Date(inv.scheduledDate).toISOString().split('T')[0] : '');
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        Reschedule
                      </button>
                      
                      <button
                        onClick={() => handleJoinVideoMeeting(inv)}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Join
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Conducted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Reschedule Video Interview
              </h3>
              <button onClick={() => setRescheduleTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Scheduled Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Start Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rescheduling (Optional)</label>
                <textarea
                  rows={2}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Reason..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={isRescheduling}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {detailsTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Interview Details
              </h3>
              <button onClick={() => setDetailsTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {detailsTarget.candidate?.name || detailsTarget.candidateName}
                </p>
                <p className="text-slate-500">{detailsTarget.candidate?.email || detailsTarget.candidateEmail}</p>
                <p className="text-indigo-600 font-semibold pt-1">
                  Requisition: {detailsTarget.job?.title || detailsTarget.jobTitle}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-1">Candidate Instructions</p>
                <p className="p-2.5 bg-slate-50 border rounded text-slate-600">
                  {detailsTarget.candidateInstructions || 'Standard instructions apply.'}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-1">Assigned Panel</p>
                <div className="space-y-1">
                  {(detailsTarget.interviewers || []).map((inv, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{inv.name}</span>
                      <span className="text-slate-500">{inv.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                onClick={() => {
                  const target = detailsTarget;
                  setDetailsTarget(null);
                  setCancelTarget(target);
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Cancel Interview
              </button>
              <button
                onClick={() => setDetailsTarget(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 text-rose-600">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Cancel Interview
              </h3>
              <button onClick={() => setCancelTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel the scheduled video interview for{' '}
              <strong>{cancelTarget.candidate?.name || cancelTarget.candidateName}</strong>?
            </p>

            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (Optional)..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800"
            />

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Keep Interview
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
