import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jobService, mockJobService } from '@/services/mockApi/jobService';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { mockCandidateService } from '@/services/mockApi/candidateService';
import { matchingService } from '@/services/mockApi/matchingService';
import { getCurrentUser } from '@/utils/auth';
import { formatExperience, formatSalary } from '@/utils/formatters';
import ApplicationModal from './ApplicationModal';
import ErrorBoundary from '@/modules/shared/layout/components/ErrorBoundary';
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, Clock, CheckCircle2, Zap,
  BookmarkCheck, Bookmark, Share2, Building, Sparkles, AlertCircle, FileText, Check, Copy, UserCheck,
  Video, ShieldCheck, ChevronRight, X, ExternalLink, HelpCircle
} from 'lucide-react';

function JobDetailsView({ jobId, returnTab, onBack, onNavigate }) {
  const params = useParams();
  const effectiveJobId = params.jobId || jobId || 'job_1';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [effectiveJobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      let targetJob = null;

      try {
        targetJob = await jobService.getJobById(effectiveJobId);
      } catch (e) {
        const allJobs = await mockJobService.getJobs();
        targetJob = allJobs.find((j) => String(j._id || j.id) === String(effectiveJobId));
      }

      if (!targetJob) {
        setJob(null);
        setLoading(false);
        return;
      }

      setJob(targetJob);
      setIsSaved(Boolean(targetJob.isSaved));

      // Fetch candidate-specific application status
      const currentUser = getCurrentUser();
      const candidateId = currentUser?.id || currentUser?._id || 'cand_1';
      const userApps = await mockApplicationService.getApplicationsForCandidate(candidateId);

      const userApp = userApps.find((a) => {
        const appJobId = String(a.jobId || a.job?._id || a.job?.id || a.job || a.jobIdString || '');
        const targetId = String(targetJob._id || targetJob.id || '');
        return appJobId === targetId;
      });

      setApplication(userApp || null);

      // Match evaluation
      const candidate = await mockCandidateService.getCandidateById(candidateId);
      if (candidate && targetJob) {
        const match = matchingService.calculateMatch(candidate, targetJob);
        setMatchResult(match);
      }
    } catch (err) {
      console.error('[JobDetailsView] Error loading job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleSave = async () => {
    if (!job) return;
    const targetId = job._id || job.id;
    try {
      const res = await jobService.toggleSaveJob(targetId);
      const nextSaved = res?.isSaved ?? !isSaved;
      setIsSaved(nextSaved);
      showToast(nextSaved ? 'Job saved to your bookmarks.' : 'Job removed from saved list.');
    } catch (err) {
      console.error('Failed to toggle save:', err);
      showToast('Could not update saved state.');
    }
  };

  const handleOpenApplyModal = () => {
    if (application) {
      showToast('You have already submitted an application for this position.');
      return;
    }
    if (job?.status?.toLowerCase() === 'closed') {
      showToast('This job requisition is closed and no longer accepting applications.');
      return;
    }
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = (createdApp) => {
    setApplication(createdApp);
    showToast('Application submitted successfully! Your recruiter review is active.');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job?.id || job?._id || effectiveJobId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast('Job link copied to clipboard!');
  };

  const getApplicationStatusBadge = () => {
    if (!application) return null;

    const st = (application.status || 'Applied').toLowerCase();
    if (st.includes('offer') || st.includes('hired')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Offer Received
        </span>
      );
    }
    if (st.includes('reject') || st.includes('closed')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
          Application Closed
        </span>
      );
    }
    if (st.includes('interview')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Interview Stage
        </span>
      );
    }
    if (st.includes('shortlist')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" /> Shortlisted
        </span>
      );
    }
    if (st.includes('review')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#D97706] border border-amber-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" /> Under Review
        </span>
      );
    }

    return (
      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Applied
      </span>
    );
  };

  const backLabel = returnTab === 'tracker' ? 'Back to Applied Jobs Tracker' : 'Back to Job Discovery';
  const companyInitials = (job?.company || 'CIQ').substring(0, 2).toUpperCase();

  if (loading && !job) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] p-4 md:p-8 text-[#172033]">
        <div className="max-w-6xl mx-auto space-y-6">
          <button onClick={onBack} className="px-4 py-2 bg-white text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-[#4F46E5]" /> {backLabel}
          </button>
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0]">
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-[#64748B] mt-3">Loading Requisition Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] p-4 md:p-8 text-[#172033]">
        <div className="max-w-6xl mx-auto space-y-6">
          <button onClick={onBack} className="px-4 py-2 bg-white text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-[#4F46E5]" /> {backLabel}
          </button>
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-[#172033]">Job Requisition Not Found</h2>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              The job requisition ID <code className="font-mono text-[#4F46E5]">{effectiveJobId}</code> could not be located. It may have been closed or removed by the recruiter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const expText = formatExperience(job.experience, job.experienceLevel);
  const salText = formatSalary(job.salary, job.salary);

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-4 md:p-8 text-[#172033] font-sans antialiased">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-3 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto space-y-6">
        {/* Top Back Navigation Button */}
        <div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#4F46E5]" /> {backLabel}
          </button>
        </div>

        {/* Job Header Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E2E8F0] space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                {companyInitials}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#172033]">
                    {job.title}
                  </h1>
                  {getApplicationStatusBadge()}
                </div>
                <p className="text-sm font-semibold text-[#4F46E5] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-500" /> {job.company || 'CandidateIQ Talent Partner'}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#64748B] pt-1 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Remote'} ({job.workArrangement || 'Hybrid'})</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.employmentType || 'Full-Time'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-bold text-[#059669]"><DollarSign className="w-3.5 h-3.5" /> {salText || 'Competitive'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Posted: {job.postedDate || 'Recent'}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={handleToggleSave}
                title={isSaved ? 'Unsave Job' : 'Save Job'}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-[#E2E8F0]'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-[#E2E8F0] transition-all cursor-pointer"
                title="Share Job Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('interview', {
                      jobId: job.id || job._id,
                      targetJobTitle: job.title,
                      company: job.company || 'CandidateIQ Requisition',
                      jobDescriptionSnapshot: job.description
                    });
                  }
                }}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-semibold text-xs rounded-xl border border-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#4F46E5]" /> Practice Interview
              </button>

              {/* CONTEXT-AWARE PRIMARY ACTION BUTTON */}
              {application ? (
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('tracker');
                  }}
                  className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold text-xs rounded-xl border border-emerald-200 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" /> View Application
                </button>
              ) : job.status?.toLowerCase() === 'closed' ? (
                <button
                  disabled
                  className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-[#E2E8F0] cursor-not-allowed"
                >
                  Requisition Closed
                </button>
              ) : (
                <button
                  onClick={handleOpenApplyModal}
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" /> Apply Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Main Content Grid (66% : 34%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Job Description, Requirements & Skills (8 Cols = ~66%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* About the Role / Description */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4.5 h-4.5 text-[#4F46E5]" /> About the Role
              </h3>
              <p className="text-sm text-[#172033] leading-relaxed font-normal whitespace-pre-line">
                {job.description || 'Build scalable software applications and AI recruiter workflows using modern full-stack web technologies.'}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-[#172033] flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#059669]" /> Responsibilities
                </h3>
                <p className="text-sm text-[#172033] leading-relaxed font-normal whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Required Qualifications */}
            {job.qualifications && (
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-[#172033] flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#4F46E5]" /> Required Qualifications
                </h3>
                <p className="text-sm text-[#172033] leading-relaxed font-normal whitespace-pre-line">
                  {job.qualifications}
                </p>
              </div>
            )}

            {/* Skills & Requirements Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-5 shadow-xs">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4.5 h-4.5 text-[#7C3AED]" /> Skills & Requirements
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block mb-2">
                    Required Core Skills
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(job.requiredSkills || []).map((sk, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-100 font-semibold text-xs">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {job.preferredSkills && job.preferredSkills.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block mb-2">
                      Preferred Skills
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(job.preferredSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-100 font-semibold text-xs">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CandidateIQ Match Insights Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-[#7C3AED]" /> CandidateIQ Match Insights
                </h3>
                {matchResult ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100 font-mono">
                    {matchResult.overallMatch}% Match
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Not evaluated
                  </span>
                )}
              </div>

              {matchResult ? (
                <div className="space-y-4">
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Compatibility rating based on candidate resume skills, technical experience, and job requirements.
                  </p>

                  {matchResult.breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] uppercase font-bold">Technical</span>
                        <span className="font-bold text-[#4F46E5] text-sm">{matchResult.breakdown.technical}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] uppercase font-bold">Skills</span>
                        <span className="font-bold text-[#059669] text-sm">{matchResult.breakdown.skills}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] uppercase font-bold">Experience</span>
                        <span className="font-bold text-[#7C3AED] text-sm">{matchResult.breakdown.experience}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[#64748B] block text-[10px] uppercase font-bold">Projects</span>
                        <span className="font-bold text-[#D97706] text-sm">{matchResult.breakdown.projects}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Compatibility score is not evaluated for this requisition yet. Complete your CandidateIQ profile and skill assessments to generate automated match insights.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Job at a Glance (4 Cols = ~34%) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs sticky top-20">
              <h3 className="text-base font-bold text-[#172033] border-b border-slate-100 pb-3">
                Job at a Glance
              </h3>

              <div className="space-y-3 text-xs text-[#64748B]">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="font-medium">Experience</span>
                  <span className="font-bold text-[#172033]">{expText || '0–2 years'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="font-medium">Employment Type</span>
                  <span className="font-bold text-[#172033]">{job.employmentType || 'Full-time'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="font-medium">Work Mode</span>
                  <span className="font-bold text-[#172033]">{job.workArrangement || 'Hybrid'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="font-medium">Compensation</span>
                  <span className="font-bold text-[#059669]">{salText || 'Competitive'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="font-medium">Department</span>
                  <span className="font-bold text-[#172033]">{job.department || 'Engineering'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="font-medium">Posting Date</span>
                  <span className="font-bold text-[#172033]">{job.postedDate || 'Recent'}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="font-medium">Application Status</span>
                  <span className="font-bold text-[#4F46E5]">{application ? (application.status || 'Applied') : 'Not Applied'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Dialog Modal */}
      <ErrorBoundary title="Application Wizard Error">
        <ApplicationModal
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      </ErrorBoundary>
    </div>
  );
}

export default JobDetailsView;
