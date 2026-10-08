import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Sparkles, Award, ArrowRight, GitCompare, Plus, CheckCircle2,
  AlertCircle, HelpCircle, Briefcase, Calendar, Clock, ChevronRight, FilePlus,
  Play, RefreshCw, AlertTriangle, Eye, ShieldCheck, UserCheck, PlayCircle
} from 'lucide-react';
import { storageInterviews } from '@/services/storage/storageService';
import { mockInterviewService } from '@/services/mockApi/interviewService';
import { evidenceIntelligenceService } from '@/services/mockApi/evidenceIntelligenceService';
import { InterviewReviewDetail, InterviewComparisonPage, ExternalFeedbackModal } from '@/modules/candidate';

function ProfileReviewHub({ onNavigateToMockInterview, initialInterviewId = null, initialView = 'list' }) {
  const navigate = useNavigate();
  const { interviewId: urlInterviewId } = useParams();
  const activeInterviewId = urlInterviewId || initialInterviewId;

  // Active Tab: 'mock' (Mock Interviews) | 'job' (Job Interviews)
  const [activeTab, setActiveTab] = useState('mock');

  // Data & Loading States
  const [mockAttempts, setMockAttempts] = useState([]);
  const [jobInterviews, setJobInterviews] = useState([]);
  const [mockLoading, setMockLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [mockError, setMockError] = useState(null);
  const [jobError, setJobError] = useState(null);

  const [selectedInterviewId, setSelectedInterviewId] = useState(activeInterviewId);
  const [currentView, setCurrentView] = useState(initialView); // 'list' | 'compare'
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [targetInterviewForFeedback, setTargetInterviewForFeedback] = useState(null);

  useEffect(() => {
    loadMockAttemptsData();
    loadJobInterviewsData();
  }, []);

  useEffect(() => {
    if (activeInterviewId) {
      setSelectedInterviewId(activeInterviewId);
    }
  }, [activeInterviewId]);

  // Load Mock Interview Attempts strictly from MongoDB real-time database
  const loadMockAttemptsData = async () => {
    try {
      setMockLoading(true);
      setMockError(null);
      const attempts = await mockInterviewService.getCandidateInterviews();
      setMockAttempts(attempts || []);
    } catch (err) {
      console.error('Error loading mock attempts for Profile Review:', err);
      setMockError('Unable to load mock interview history.');
    } finally {
      setMockLoading(false);
    }
  };

  // Load Actual Job Interviews attended from recruitment interview storage
  const loadJobInterviewsData = async () => {
    try {
      setJobLoading(true);
      setJobError(null);
      await new Promise((r) => setTimeout(r, 150));
      const actualList = await evidenceIntelligenceService.getInterviewRecords('cand_1', 'FINAL');
      const recruiterInterviews = storageInterviews.getByCandidateId('cand_1');

      const combined = [...actualList];
      recruiterInterviews.forEach((rec) => {
        if (!combined.some((item) => item.id === rec.id)) {
          combined.push({
            id: rec.id,
            type: 'FINAL',
            title: rec.title || `${rec.jobTitle || 'Role'} — ${rec.interviewType || 'Job Interview'}`,
            jobTitle: rec.jobTitle,
            role: rec.jobTitle,
            company: rec.company,
            date: rec.scheduledDate || '2026-09-20',
            status: rec.status || 'Attended',
            interviewer: rec.interviewer || 'Hiring Panel',
            overallScore: rec.score || null,
            finalFeedback: rec.instructions || 'Technical system design evaluation and candidate alignment review.'
          });
        }
      });

      setJobInterviews(combined);
    } catch (err) {
      console.error('Error loading job interviews for Profile Review:', err);
      setJobError('Unable to load job interview history.');
    } finally {
      setJobLoading(false);
    }
  };

  const handleOpenUploadFeedback = (interviewRecord) => {
    setTargetInterviewForFeedback(interviewRecord || jobInterviews[0]);
    setIsFeedbackModalOpen(true);
  };

  // Dedicated Comparison Page View
  if (currentView === 'compare') {
    return (
      <InterviewComparisonPage
        defaultType={activeTab === 'mock' ? 'MOCK' : 'FINAL'}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  // Dedicated Detailed Review View
  if (selectedInterviewId) {
    return (
      <InterviewReviewDetail
        interviewId={selectedInterviewId}
        onBack={() => setSelectedInterviewId(null)}
        onOpenUploadFeedback={handleOpenUploadFeedback}
      />
    );
  }

  // Strict Database-backed Metrics Computations
  const completedMocks = mockAttempts.filter(
    (a) => a.status === 'completed' || a.status === 'Completed' || a.state === 'Completed'
  );
  const evaluatedMocks = mockAttempts.filter(
    (a) => a.score !== null && a.score !== undefined
  );

  const totalAttemptsCount = mockAttempts.length;
  const completedAttemptsCount = completedMocks.length;
  const avgScore = evaluatedMocks.length > 0
    ? Math.round(evaluatedMocks.reduce((sum, a) => sum + Number(a.score), 0) / evaluatedMocks.length)
    : null;

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none animate-fadeIn py-6 font-sans">
      
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black font-outfit text-slate-950 tracking-tight">PROFILE REVIEW</h1>
        <p className="text-xs text-slate-500 font-medium font-sans">Your interview performance at a glance with real-time CandidateIQ MongoDB evaluations.</p>
      </div>

      {/* TOP NAVIGATION & PRIMARY SECTION TABS */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200/80 pb-4">
        {/* Primary Tabs (Mock Interviews vs Job Interviews) */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/80 shadow-xs max-w-md w-full">
          <button
            type="button"
            onClick={() => setActiveTab('mock')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold font-outfit transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'mock'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> ✨ Mock Interviews ({mockAttempts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold font-outfit transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'job'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" /> ♙ Job Interviews ({jobInterviews.length})
          </button>
        </div>

        {/* Top-Right Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              type="button"
              onClick={() => setCurrentView('compare')}
              aria-label="Compare two interviews"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-950 text-slate-700 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-12 hidden group-hover:block z-30 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap shadow-xl border border-slate-800">
              Compare interviews
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => handleOpenUploadFeedback(null)}
              aria-label="Upload interviewer feedback report"
              className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-12 hidden group-hover:block z-30 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap shadow-xl border border-slate-800">
              Upload interviewer feedback report
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE OVERVIEW CARDS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Performance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Attempts</span>
            <span className="text-3xl font-black font-outfit text-slate-950">{totalAttemptsCount}</span>
          </div>

          <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-3xl font-black font-outfit text-emerald-600">{completedAttemptsCount}</span>
          </div>

          <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Avg Score</span>
            <span className="text-3xl font-black font-outfit text-indigo-600">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </span>
            {avgScore === null && (
              <span className="text-[10px] text-slate-400 font-medium block">No evaluated interviews yet</span>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: MOCK INTERVIEWS */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black font-outfit text-slate-950">Recent Mock Interviews</h2>
              <p className="text-xs text-slate-500 font-medium">Practice mock interview sessions generated from your Profile Resume + Job Requisitions.</p>
            </div>

            {onNavigateToMockInterview && (
              <button
                type="button"
                onClick={() => onNavigateToMockInterview(null)}
                className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer font-bold font-outfit"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Start Mock Interview
              </button>
            )}
          </div>

          {mockLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Loading Mock Interview history from database...</p>
            </div>
          ) : mockError ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 max-w-md mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-900">{mockError}</p>
              <button
                type="button"
                onClick={loadMockAttemptsData}
                className="btn-secondary text-xs px-4 py-1.5 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : mockAttempts.length === 0 ? (
            /* REAL EMPTY STATE */
            <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-950 font-outfit">
                  No Mock Interviews Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Complete your first AI mock interview to see your performance review here.
                </p>
              </div>
              {onNavigateToMockInterview && (
                <button
                  type="button"
                  onClick={() => onNavigateToMockInterview(null)}
                  className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 shadow-md cursor-pointer font-bold font-outfit"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Start Mock Interview
                </button>
              )}
            </div>
          ) : (
            /* REAL MOCK ATTEMPTS CARDS GRID FROM MONGODB */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mockAttempts.map((att) => {
                const attId = att.attemptId || att.id || att.sessionId;
                const isCompleted = att.status === 'completed' || att.status === 'Completed' || att.state === 'Completed';
                const totalQ = att.questionCount || att.questions?.length || 0;
                const ansQ = att.answeredCount || att.answers?.length || 0;
                const unansQ = Math.max(0, totalQ - ansQ);
                const progressPct = totalQ > 0 ? Math.round((ansQ / totalQ) * 100) : 0;
                const isCustom = att.source === 'CUSTOM_JD' || att.jobId === 'custom' || !att.jobId;
                const scoreVal = att.score !== undefined && att.score !== null ? att.score : null;
                const hasReview = att.evaluationStatus === 'completed' && scoreVal !== null;

                return (
                  <div
                    key={attId}
                    className="saas-card p-6 border border-slate-200 bg-white rounded-2xl space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Title & Status */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                            isCustom ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {isCustom ? 'Custom JD Source' : 'Recruiter Job Source'}
                          </span>
                          <h4 className="text-lg font-bold font-outfit text-slate-950 mt-1">{att.jobTitle || att.title}</h4>
                          <p className="text-xs text-slate-500 font-semibold">{att.company || 'CandidateIQ Enterprise'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border shrink-0 ${
                          isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      {/* Difficulty & Method Pills */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                          {att.difficulty || 'Medium'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                          {att.method || 'RANDOM'}
                        </span>
                        <span className="text-slate-400 font-medium text-[11px]">
                          {totalQ} Questions
                        </span>
                      </div>

                      {/* IN-PROGRESS STATE: Visual Progress Bar */}
                      {!isCompleted ? (
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                            <span>Progress</span>
                            <span>{progressPct}% ({ansQ} / {totalQ} answered)</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {unansQ} remaining questions
                          </span>
                        </div>
                      ) : (
                        /* COMPLETED STATE: Real Score & Category Breakdown */
                        <div className="p-4 rounded-xl bg-slate-950 text-white space-y-3 border border-slate-800">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CandidateIQ Score</span>
                            <span className="text-xl font-black font-outfit text-indigo-400">
                              {scoreVal !== null ? `${scoreVal} / 100` : 'Review Pending'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Technical</span>
                              <span className="font-extrabold text-slate-200 font-outfit">
                                {att.technicalScore !== null && att.technicalScore !== undefined ? att.technicalScore : '—'}
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Communication</span>
                              <span className="font-extrabold text-slate-200 font-outfit">
                                {att.communicationScore !== null && att.communicationScore !== undefined ? att.communicationScore : '—'}
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Reasoning</span>
                              <span className="font-extrabold text-slate-200 font-outfit">
                                {att.reasoningScore !== null && att.reasoningScore !== undefined ? att.reasoningScore : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      {!isCompleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateToMockInterview) {
                                onNavigateToMockInterview(attId);
                              } else {
                                navigate(`/candidate/ai-mock-interview/${attId}`);
                              }
                            }}
                            className="btn-primary flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-amber-300" /> Continue Interview
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedInterviewId(attId)}
                            className="btn-secondary py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View Review
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedInterviewId(attId)}
                          className="btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-amber-300" /> View Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JOB INTERVIEWS (ACTUAL RECRUITMENT INTERVIEWS) */}
      {activeTab === 'job' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black font-outfit text-slate-950">Actual Job Interviews History</h2>
              <p className="text-xs text-slate-500 font-medium">Record of recruitment interviews scheduled and attended with enterprise employers.</p>
            </div>
          </div>

          {jobLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Loading Job Interviews history...</p>
            </div>
          ) : jobError ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 max-w-md mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-900">{jobError}</p>
              <button
                type="button"
                onClick={loadJobInterviewsData}
                className="btn-secondary text-xs px-4 py-1.5 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : jobInterviews.length === 0 ? (
            /* NO JOB INTERVIEWS EMPTY STATE */
            <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center border border-purple-100">
                <Award className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-950 font-outfit">
                  No Job Interviews Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Your attended recruitment interviews will appear here.
                </p>
              </div>
            </div>
          ) : (
            /* JOB INTERVIEW CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobInterviews.map((jobInt) => (
                <div
                  key={jobInt.id}
                  className="saas-card p-6 border border-slate-200 bg-white rounded-2xl space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                          Recruitment Job Interview
                        </span>
                        <h4 className="text-lg font-bold font-outfit text-slate-950 mt-1">{jobInt.jobTitle || jobInt.title}</h4>
                        <p className="text-xs font-semibold text-slate-600">{jobInt.company || 'Enterprise Partner'}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {jobInt.status || 'Attended'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <div><strong className="text-slate-900">Round:</strong> {jobInt.interviewType || 'Technical Round'}</div>
                      <div><strong className="text-slate-900">Interviewer:</strong> {jobInt.interviewer || 'Hiring Manager'}</div>
                      <div><strong className="text-slate-900">Date:</strong> {jobInt.date || jobInt.scheduledDate || 'N/A'}</div>
                      <div><strong className="text-slate-900">Score:</strong> {jobInt.overallScore !== null && jobInt.overallScore !== undefined ? `${jobInt.overallScore}%` : '—'}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">Record ID: {jobInt.id}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedInterviewId(jobInt.id)}
                      className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" /> View Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* External Feedback Upload Modal */}
      <ExternalFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        targetInterview={targetInterviewForFeedback}
        onFeedbackUploaded={() => loadJobInterviewsData()}
      />
    </div>
  );
}

export default ProfileReviewHub;
