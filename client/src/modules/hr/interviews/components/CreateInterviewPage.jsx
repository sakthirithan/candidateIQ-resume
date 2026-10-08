import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { recruiterService } from '@/services/recruiter/recruiterService';
import {
  Calendar, Clock, User, Briefcase, Video, CheckCircle2, AlertCircle,
  Search, ChevronRight, ArrowLeft, ShieldCheck, Mail, Users, FileText, Sparkles, X, Plus
} from 'lucide-react';

export default function CreateInterviewPage({ onNavigate }) {
  const navigate = useNavigate();

  // Active Wizard Section: 1 = Candidate & Application, 2 = Interview Setup, 3 = Review & Schedule
  const [currentStep, setCurrentStep] = useState(1);

  // Data State
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Section 1 Form State
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('');

  // Section 2 Form State
  const [roundType, setRoundType] = useState('technical');
  const [title, setTitle] = useState('Technical Video Interview');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [timeZone, setTimeZone] = useState('IST (UTC+5:30)');
  const [candidateInstructions, setCandidateInstructions] = useState(
    'Please join 5 minutes before the scheduled time with audio and camera enabled. Ensure a stable internet connection.'
  );
  const [internalNotes, setInternalNotes] = useState('');
  
  // Interviewer Panel
  const [interviewers, setInterviewers] = useState([
    { name: 'Lead Technical Recruiter', email: 'recruiter@candidateiq.com', role: 'Primary Interviewer', isPrimary: true }
  ]);
  const [newInterviewerName, setNewInterviewerName] = useState('');
  const [newInterviewerEmail, setNewInterviewerEmail] = useState('');
  const [newInterviewerRole, setNewInterviewerRole] = useState('Panel Interviewer');

  // Submit & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch real applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      setAppsError(null);
      const res = await recruiterService.getRecruiterApplications();
      setApplications(res || []);
    } catch (err) {
      console.error('Error fetching candidate applications:', err);
      setAppsError('Failed to load eligible candidates. Please refresh or try again.');
    } finally {
      setLoadingApps(false);
    }
  };

  // Group applications by Candidate
  const candidateList = useMemo(() => {
    const map = new Map();
    applications.forEach(app => {
      const candId = app.candidate?._id || app.candidate?.id || app.candidateId || app._id;
      const candName = app.candidate?.name || app.candidateName || 'Candidate';
      const candEmail = app.candidate?.email || app.candidateEmail || 'No email provided';
      
      if (!map.has(candId)) {
        map.set(candId, {
          id: candId,
          name: candName,
          email: candEmail,
          applications: [app]
        });
      } else {
        map.get(candId).applications.push(app);
      }
    });
    return Array.from(map.values());
  }, [applications]);

  // Filtered candidate list based on search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidateList;
    const q = searchQuery.toLowerCase();
    return candidateList.filter(
      c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [candidateList, searchQuery]);

  // Active selected candidate details
  const selectedCandidate = useMemo(() => {
    return candidateList.find(c => String(c.id) === String(selectedCandidateId));
  }, [candidateList, selectedCandidateId]);

  // Available applications for the selected candidate
  const candidateApplications = useMemo(() => {
    if (!selectedCandidate) return [];
    return selectedCandidate.applications;
  }, [selectedCandidate]);

  // Active selected application object
  const selectedApplication = useMemo(() => {
    if (!selectedAppId || !candidateApplications.length) return null;
    return candidateApplications.find(a => String(a._id || a.id) === String(selectedAppId)) || candidateApplications[0];
  }, [candidateApplications, selectedAppId]);

  // Handle Candidate Selection
  const handleSelectCandidate = (candId) => {
    setSelectedCandidateId(candId);
    const cand = candidateList.find(c => String(c.id) === String(candId));
    if (cand && cand.applications.length > 0) {
      const defaultApp = cand.applications[0];
      setSelectedAppId(defaultApp._id || defaultApp.id);
    } else {
      setSelectedAppId('');
    }
  };

  // Add Interviewer to panel
  const handleAddInterviewer = () => {
    if (!newInterviewerName.trim() || !newInterviewerEmail.trim()) return;
    setInterviewers([
      ...interviewers,
      {
        name: newInterviewerName.trim(),
        email: newInterviewerEmail.trim(),
        role: newInterviewerRole,
        isPrimary: false
      }
    ]);
    setNewInterviewerName('');
    setNewInterviewerEmail('');
  };

  // Remove Interviewer from panel
  const handleRemoveInterviewer = (index) => {
    if (interviewers.length <= 1) return; // Keep at least one
    setInterviewers(interviewers.filter((_, i) => i !== index));
  };

  // Section 1 Next validation
  const canProceedSection1 = selectedCandidateId && selectedApplication;

  // Section 2 Next validation
  const canProceedSection2 = roundType && scheduledDate && scheduledTime && durationMinutes;

  // Handle final Submit
  const handleScheduleSubmit = async () => {
    if (!selectedCandidate || !selectedApplication) {
      setSubmitError('Please complete candidate and application selection.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Combine Date & Time into single Date ISO string
      const dateTimeStr = `${scheduledDate}T${scheduledTime}:00`;
      const combinedScheduledDate = new Date(dateTimeStr).toISOString();

      const candidateObjId = selectedApplication.candidate?._id || selectedApplication.candidate?.id || selectedCandidateId;
      const jobObjId = selectedApplication.job?._id || selectedApplication.job?.id || selectedApplication.jobId;

      const payload = {
        candidateId: candidateObjId,
        jobId: jobObjId,
        applicationId: selectedApplication._id || selectedApplication.id,
        roundType,
        title: title || `${roundType.toUpperCase()} Interview`,
        scheduledDate: combinedScheduledDate,
        scheduledTime,
        timeZone,
        durationMinutes: Number(durationMinutes),
        candidateInstructions,
        internalNotes,
        interviewers
      };

      const res = await api.post('/interviews/schedule', payload);

      if (res.data?.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('hr-interviews-recruiter');
          } else {
            navigate('/hr-interviews-recruiter');
          }
        }, 1200);
      } else {
        setSubmitError(res.data?.message || 'Failed to schedule video interview.');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setSubmitError(err.response?.data?.message || 'Server error occurred while scheduling interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>HR Workspace</span>
            <span>/</span>
            <span>Interviews</span>
            <span>/</span>
            <span className="text-slate-500">Create Interview</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Create Interview
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Schedule a video interview with a candidate and assign interviewers.
          </p>
        </div>

        <button
          onClick={() => onNavigate ? onNavigate('hr-interviews-recruiter') : navigate('/hr-interviews-recruiter')}
          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidate Interviews
        </button>
      </div>

      {/* 3-Section Stepper */}
      <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${
            currentStep === 1
              ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300'
              : currentStep > 1
              ? 'text-slate-700 hover:bg-slate-50'
              : 'text-slate-400'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            currentStep === 1 ? 'bg-indigo-600 text-white' : currentStep > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Section 1</p>
            <p className="text-sm font-semibold truncate">Candidate & Application</p>
          </div>
        </button>

        <button
          onClick={() => canProceedSection1 && setCurrentStep(2)}
          disabled={!canProceedSection1}
          className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${
            currentStep === 2
              ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300'
              : currentStep > 2
              ? 'text-slate-700 hover:bg-slate-50'
              : 'text-slate-400 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            currentStep === 2 ? 'bg-indigo-600 text-white' : currentStep > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Section 2</p>
            <p className="text-sm font-semibold truncate">Interview Setup & Panel</p>
          </div>
        </button>

        <button
          onClick={() => canProceedSection1 && canProceedSection2 && setCurrentStep(3)}
          disabled={!canProceedSection1 || !canProceedSection2}
          className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${
            currentStep === 3
              ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300'
              : 'text-slate-400 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            currentStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            3
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Section 3</p>
            <p className="text-sm font-semibold truncate">Review & Schedule</p>
          </div>
        </button>
      </div>

      {/* Global Alerts */}
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Official video interview scheduled successfully! Redirecting to management dashboard...</span>
        </div>
      )}

      {/* SECTION 1: CANDIDATE & APPLICATION SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Select Candidate
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Search and select an eligible candidate from real submitted applications.
              </p>
            </div>

            {/* Candidate Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate by name or email address..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Candidate Selector Cards */}
            {loadingApps ? (
              <div className="py-12 text-center text-sm text-slate-500">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                <p>Fetching active candidates and applications...</p>
              </div>
            ) : appsError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                {appsError}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">No matching candidates found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or check active applications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredCandidates.map((cand) => {
                  const isSelected = String(cand.id) === String(selectedCandidateId);
                  return (
                    <div
                      key={cand.id}
                      onClick={() => handleSelectCandidate(cand.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cand.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{cand.name}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[160px]">{cand.email}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{cand.applications.length} Application(s)</span>
                        <span className="font-semibold text-indigo-600">Select</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Target Application Selector */}
            {selectedCandidate && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Select Job Requisition / Application
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Choose the specific job application for this video interview round.
                  </p>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {candidateApplications.map((app) => {
                      const appId = app._id || app.id;
                      const jobTitle = app.job?.title || app.jobTitle || 'Target Requisition';
                      const company = app.job?.company || app.company || 'CandidateIQ';
                      return (
                        <option key={appId} value={appId}>
                          {jobTitle} — {company} (Status: {app.status || 'applied'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Candidate & Application Summary Preview */}
                {selectedApplication && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Selected Candidate</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedCandidate.name}</span>
                      <span className="text-slate-500 block">{selectedCandidate.email}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Target Requisition</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedApplication.job?.title || selectedApplication.jobTitle || 'Requisition'}
                      </span>
                      <span className="text-indigo-600 font-semibold block">
                        {selectedApplication.job?.company || selectedApplication.company || 'Company'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Current Status</span>
                      <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px] mt-0.5">
                        {selectedApplication.status || 'Applied'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 1 Footer Action */}
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedSection1}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2 ${
                canProceedSection1
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue to Interview Setup <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: INTERVIEW SETUP & PANEL */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Video Interview Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure the video call parameters, schedule date, time, and assigned interview panel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Interview Round */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Interview Round
                </label>
                <select
                  value={roundType}
                  onChange={(e) => {
                    setRoundType(e.target.value);
                    const formatted = e.target.value.replace('_', ' ').toUpperCase();
                    setTitle(`${formatted} Interview`);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="hr_screening">HR Screening</option>
                  <option value="technical">Technical Round</option>
                  <option value="managerial">Managerial Round</option>
                  <option value="system_design">System Design</option>
                  <option value="final_executive">Final Executive Round</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Session Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Interview Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration (Minutes)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
                  <option value="PST (UTC-8:00)">PST (UTC-8:00)</option>
                  <option value="EST (UTC-5:00)">EST (UTC-5:00)</option>
                  <option value="GMT (UTC+0:00)">GMT (UTC+0:00)</option>
                </select>
              </div>
            </div>

            {/* Candidate Agenda / Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Candidate Instructions & Agenda
              </label>
              <textarea
                rows={3}
                value={candidateInstructions}
                onChange={(e) => setCandidateInstructions(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Confidential Internal Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confidential HR / Interviewer Notes
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Internal notes visible only to interviewers..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Interviewer Panel Section */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Assigned Interviewers & Panel
                  </h3>
                  <p className="text-xs text-slate-500">Assign primary and panel interviewers for this video call.</p>
                </div>
              </div>

              {/* Active Chips */}
              <div className="flex flex-wrap gap-2">
                {interviewers.map((inv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs"
                  >
                    <span className="font-bold text-indigo-900">{inv.name}</span>
                    <span className="text-indigo-600">({inv.role})</span>
                    {interviewers.length > 1 && (
                      <button
                        onClick={() => handleRemoveInterviewer(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Panel Member */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="text"
                  placeholder="Interviewer Name"
                  value={newInterviewerName}
                  onChange={(e) => setNewInterviewerName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-800"
                />
                <input
                  type="email"
                  placeholder="Interviewer Email"
                  value={newInterviewerEmail}
                  onChange={(e) => setNewInterviewerEmail(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-800"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newInterviewerRole}
                    onChange={(e) => setNewInterviewerRole(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-800"
                  >
                    <option value="Primary Interviewer">Primary Interviewer</option>
                    <option value="Panel Interviewer">Panel Interviewer</option>
                    <option value="HR Observer">HR Observer</option>
                  </select>
                  <button
                    onClick={handleAddInterviewer}
                    className="px-3 py-2 bg-indigo-600 text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-indigo-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Video Provider Badge */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Meeting Provider: Embedded Jitsi Video Server</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-200 font-bold uppercase text-[10px] text-purple-800">
                Auto Configured
              </span>
            </div>
          </div>

          {/* Section 2 Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Candidate
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedSection2}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2 ${
                canProceedSection2
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Review & Schedule <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: REVIEW & SCHEDULE */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                Pre-Scheduling Review
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please verify the video interview details before creating the official record.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
              {/* Candidate & Application Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Details</h3>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedCandidate?.name}</p>
                  <p className="text-xs text-slate-500">{selectedCandidate?.email}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Requisition</h3>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedApplication?.job?.title || selectedApplication?.jobTitle || 'Requisition'}
                  </p>
                  <p className="text-xs text-indigo-600 font-semibold">
                    {selectedApplication?.job?.company || selectedApplication?.company || 'Company'}
                  </p>
                </div>
              </div>

              {/* Schedule & Video Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interview Configuration</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Round Type:</span>
                    <span className="font-bold text-slate-900 uppercase">{roundType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <span className="font-bold text-slate-900">{scheduledDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Start Time:</span>
                    <span className="font-bold text-slate-900">{scheduledTime} ({timeZone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-900">{durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Video Provider:</span>
                    <span className="font-bold text-purple-700">Embedded Jitsi</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Panel</h3>
                  <p className="text-xs font-semibold text-slate-800">
                    {interviewers.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Upon submission, an invitation email with embedded Jitsi video link will be sent to <strong>{selectedCandidate?.email}</strong>.
              </span>
            </div>
          </div>

          {/* Section 3 Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </button>

            <button
              onClick={handleScheduleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scheduling Video Interview...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" /> Schedule Video Interview
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
