import { storageApplications, storageInterviews } from '../storage/storageService';
import api from '../api';

export const mockApplicationService = {
  getApplications: async () => {
    try {
      const res = await api.get('/jobs/recruiter/applications').catch(() => null);
      if (res?.data?.applications && res.data.applications.length > 0) {
        const backendMapped = res.data.applications.map((app) => {
          const j = app.job || {};
          return {
            id: app._id || app.id,
            _id: app._id || app.id,
            jobId: j._id || j.id || app.jobIdString || 'job_1',
            jobTitle: j.title || app.jobTitle || 'Requisition Role',
            company: j.company || app.company || 'CandidateIQ Talent Partner',
            candidateId: app.candidate?._id || app.candidate || app.candidateId || 'cand_1',
            candidateName: app.candidateSnapshot?.name || app.candidate?.name || 'Alex Johnson',
            candidateEmail: app.candidateSnapshot?.email || app.candidate?.email || 'alex@example.com',
            appliedDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : app.appliedDate || new Date().toISOString().split('T')[0],
            createdAt: app.createdAt || new Date().toISOString(),
            status: (app.status || 'applied').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            rawStatus: app.status,
            matchPercentage: app.overallScore || app.matchAnalysis?.overallMatch || 88,
            iqScore: app.overallScore || 85,
            resumeId: app.resumeSnapshot?.resumeId,
            candidateProfileSnapshot: app.candidateProfile || null,
            job: j
          };
        });
        const localList = storageApplications.getAll() || [];
        const localIds = new Set(backendMapped.map((b) => String(b.id)));
        const extraLocal = localList.filter((l) => !localIds.has(String(l.id)));
        return [...backendMapped, ...extraLocal];
      }
    } catch (e) {
      console.warn('API applications fetch fallback to storage:', e);
    }
    return storageApplications.getAll();
  },

  getApplicationsForCandidate: async (candidateId = 'cand_1') => {
    try {
      const res = await api.get('/jobs/candidate/my-applications').catch(() => null);
      if (res?.data?.applications && res.data.applications.length > 0) {
        const backendMapped = res.data.applications.map((app) => {
          const j = app.job || {};
          return {
            id: app._id || app.id,
            _id: app._id || app.id,
            jobId: j._id || j.id || app.jobIdString || 'job_1',
            jobTitle: j.title || app.jobTitle || 'Requisition Role',
            company: j.company || app.company || 'CandidateIQ Talent Partner',
            candidateId: app.candidate?._id || app.candidate || candidateId,
            candidateName: app.candidateSnapshot?.name || 'Alex Johnson',
            candidateEmail: app.candidateSnapshot?.email || 'alex@example.com',
            appliedDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : app.appliedDate || new Date().toISOString().split('T')[0],
            createdAt: app.createdAt || new Date().toISOString(),
            status: (app.status || 'applied').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            rawStatus: app.status,
            matchPercentage: app.overallScore || app.matchAnalysis?.overallMatch || 88,
            iqScore: app.overallScore || 85,
            resumeId: app.resumeSnapshot?.resumeId,
            candidateProfileSnapshot: app.candidateProfile || null,
            job: j
          };
        });
        const localList = storageApplications.getByCandidateId(candidateId) || [];
        const localIds = new Set(backendMapped.map((b) => String(b.id)));
        const extraLocal = localList.filter((l) => !localIds.has(String(l.id)));
        return [...backendMapped, ...extraLocal];
      }
    } catch (e) {
      console.warn('API my-applications fetch fallback to storage:', e);
    }
    return storageApplications.getByCandidateId(candidateId);
  },

  getCandidateStateForJob: async (candidateId, jobId) => {
    const apps = await mockApplicationService.getApplicationsForCandidate(candidateId);
    const app = apps.find((a) => String(a.jobId) === String(jobId) || String(a.job?._id || a.job?.id) === String(jobId));
    if (!app) {
      return {
        isApplied: false,
        applicationId: null,
        appliedAt: null,
        status: null
      };
    }
    return {
      isApplied: true,
      applicationId: app.id || app._id,
      appliedAt: app.appliedDate || app.createdAt,
      status: app.status || 'Applied'
    };
  },

  applyForJob: async ({ jobId, candidateId, jobTitle, company, candidateName, candidateEmail, matchPercentage, iqScore, resumeId, candidateProfileSnapshot, ...formExtra }) => {
    // Check duplicate local storage first
    const existing = storageApplications.getByCandidateAndJob(candidateId, jobId);
    if (existing) {
      const err = new Error('You have already applied for this job position.');
      err.code = 'ALREADY_APPLIED';
      err.existingApplication = existing;
      throw err;
    }

    // Attempt backend API submission
    let apiCreatedApp = null;
    try {
      const payload = {
        resumeSnapshot: {
          resumeId: resumeId || `res_${Date.now()}`,
          fileName: 'Candidate_Resume.pdf'
        },
        candidateSnapshot: {
          name: candidateName || formExtra.firstName ? `${formExtra.firstName} ${formExtra.lastName || ''}`.trim() : 'Alex Johnson',
          email: candidateEmail || formExtra.email || 'alex@example.com',
          mobile: formExtra.mobile || '',
          location: formExtra.location || 'Remote',
          gender: formExtra.gender || 'Not Specified'
        },
        professionalSnapshot: {
          userType: formExtra.userType || 'Professional',
          designation: formExtra.designation || 'Software Developer',
          experience: formExtra.experience || '2 Years',
          organization: formExtra.organization || 'Tech Partner',
          skills: (formExtra.skills || 'React, Node.js, JavaScript, MongoDB').split(',').map((s) => s.trim())
        },
        expectedCompensation: {
          amount: formExtra.expectedAmount || 700000,
          currency: formExtra.expectedCurrency || 'INR',
          period: formExtra.expectedPeriod || 'year',
          formatted: `${formExtra.expectedAmount || 700000} ${formExtra.expectedCurrency || 'INR'}`
        },
        screeningAnswers: [
          { questionId: 'q1', question: 'Notice Period', answer: formExtra.noticePeriodAnswer || 'Immediate' },
          { questionId: 'q2', question: 'Why fit for this position?', answer: formExtra.whyFitAnswer || 'Strong technical experience' }
        ],
        termsAccepted: true
      };

      const res = await api.post(`/jobs/${jobId}/apply`, payload).catch(() => null);
      if (res?.data?.application) {
        apiCreatedApp = res.data.application;
      }
    } catch (e) {
      console.warn('Backend applyToJob failed/fallback to storage:', e);
    }

    const newApp = {
      id: apiCreatedApp?._id || `app_${Date.now()}`,
      _id: apiCreatedApp?._id || `app_${Date.now()}`,
      jobId: jobId || 'job_1',
      jobTitle: jobTitle || 'Target Requisition',
      company: company || 'CandidateIQ Enterprise',
      candidateId: candidateId || 'cand_1',
      candidateName: candidateName || 'Alex Johnson',
      candidateEmail: candidateEmail || 'alex@example.com',
      appliedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'Applied',
      matchPercentage: matchPercentage || 88,
      iqScore: iqScore || 86,
      resumeId: resumeId || null,
      candidateProfileSnapshot: candidateProfileSnapshot || null,
      timeline: [
        { step: 'Applied', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'AI Resume Screened', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'Shortlisted', date: 'Pending', done: false },
        { step: 'AI Mock Interview', date: 'Pending', done: false },
        { step: 'Final Offer Decision', date: 'Pending', done: false }
      ]
    };

    return storageApplications.saveApplication(newApp);
  },

  updateApplicationStatus: async (appId, status) => {
    try {
      const dbStatus = status.toLowerCase().replace(' ', '_');
      await api.patch(`/jobs/applications/${appId}/status`, { status: dbStatus }).catch(() => null);
    } catch (e) {
      console.warn('Backend updateApplicationStatus failed/fallback to storage:', e);
    }
    return storageApplications.updateStatus(appId, status);
  },

  scheduleHRInterview: async ({
    candidateId,
    candidateIds = [],
    candidateName,
    selectedCandidates = [],
    jobId,
    jobTitle,
    company,
    title,
    type = 'HR',
    scheduledDate,
    scheduledTime,
    duration = '2 Hours',
    interviewType,
    interviewer,
    instructions,
    additionalDetails,
    meetingLink,
    notes,
    questionBankSnapshot = null,
    evaluationPromptSnapshot = null
  }) => {
    const primaryCandId = candidateId || (candidateIds.length > 0 ? candidateIds[0] : 'cand_1');

    // Attempt backend interview creation
    try {
      const payload = {
        candidateId: primaryCandId,
        jobId: jobId || 'job_1',
        scheduledDate: scheduledDate ? `${scheduledDate}T10:00:00.000Z` : new Date(Date.now() + 86400000 * 2).toISOString(),
        interviewType: type.toUpperCase() === 'FINAL' ? 'technical' : 'hr',
        notes: instructions || title || 'Recruiter Candidate Screening Interview'
      };
      await api.post('/interviews/schedule', payload).catch(() => null);
    } catch (e) {
      console.warn('Backend scheduleInterview failed/fallback to storage:', e);
    }

    const apps = storageApplications.getAll();
    const dateStr = scheduledDate || new Date().toISOString().split('T')[0];
    const timeStr = scheduledTime || '10:00 AM';
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = (time || '10:00').split(':').map(Number);
    if (modifier) {
      if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    const start = new Date(dateStr);
    start.setHours(hours || 10, minutes || 0, 0, 0);

    let durMs = 2 * 3600 * 1000;
    if (duration) {
      const numMatch = duration.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        durMs = duration.toLowerCase().includes('hour') ? num * 3600 * 1000 : num * 60 * 1000;
      }
    }
    const end = new Date(start.getTime() + durMs);

    const defaultQB = questionBankSnapshot || {
      questionBankId: `qb_${Date.now()}`,
      jobId: jobId || 'job_1',
      questions: [
        {
          questionId: 'q_job_1',
          question: 'Explain how you design resilient distributed caching in high-throughput microservices.',
          type: 'TEXT',
          expectedAnswer: 'Should mention Redis cluster, LRU eviction, cache stampede prevention, and cache-aside or write-through patterns.',
          topic: 'System Architecture'
        },
        {
          questionId: 'q_job_2',
          question: 'Which HTTP status code is most appropriate when a client payload fails validation schema rules?',
          type: 'MCQ',
          options: ['400 Bad Request', '422 Unprocessable Entity', '401 Unauthorized', '500 Internal Server Error'],
          correctOption: '422 Unprocessable Entity',
          expectedAnswer: '422 Unprocessable Entity',
          topic: 'REST API'
        },
        {
          questionId: 'q_job_3',
          question: 'Describe your approach to managing database migrations during zero-downtime blue/green deployments.',
          type: 'VOICE',
          expectedAnswer: 'Explain backward-compatible schema changes (expand/contract pattern), non-blocking index creation, feature flags, and replication sync.',
          topic: 'DevOps & Database'
        }
      ]
    };

    const defaultPrompt = evaluationPromptSnapshot || {
      promptId: `ep_${Date.now()}`,
      prompt: 'Evaluate candidate responses based on technical correctness, relevance to expected reference answers, clarity, and practical system engineering understanding.'
    };

    const targetCandidateIds = candidateIds.length > 0 ? candidateIds : [primaryCandId];

    const newInterview = {
      id: `${type.toLowerCase()}_int_${Date.now()}`,
      candidateId: primaryCandId,
      candidateIds: targetCandidateIds,
      candidateName: candidateName || 'Alex Johnson',
      selectedCandidates: selectedCandidates.length > 0 ? selectedCandidates : [{ id: primaryCandId, name: candidateName || 'Alex Johnson' }],
      jobId: jobId || 'job_1',
      jobTitle: jobTitle || 'Target Requisition',
      company: company || 'CandidateIQ Enterprise',
      title: title || `${jobTitle || 'Role'} — ${type === 'FINAL' ? 'Job Interview' : 'HR Interview'}`,
      type: type.toUpperCase() === 'FINAL' ? 'FINAL' : 'HR',
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      duration: duration || '2 Hours',
      startTimeISO: start.toISOString(),
      endTimeISO: end.toISOString(),
      interviewType: interviewType || (type === 'FINAL' ? 'Recruiter Job Assessment Round' : 'Technical & HR Evaluation'),
      interviewer: interviewer || 'Recruiter Committee',
      instructions: instructions || 'Please join the virtual interview room within the scheduled window.',
      additionalDetails: additionalDetails || 'Review job requisition responsibilities prior to session.',
      meetingLink: meetingLink || 'https://meet.candidateiq.com/room/default',
      notes: notes || '',
      questionBankSnapshot: defaultQB,
      evaluationPromptSnapshot: defaultPrompt,
      candidateAttempts: [],
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    const saved = storageInterviews.saveInterview(newInterview);

    targetCandidateIds.forEach((cId) => {
      const candidateApp = apps.find((a) => a.candidateId === cId || a.jobId === jobId);
      if (candidateApp) {
        storageApplications.updateStatus(candidateApp.id, 'Interview');
      }
    });

    return saved;
  },

  getHRInterviewsForCandidate: async (candidateId = 'cand_1') => {
    try {
      const res = await api.get('/interviews/candidate').catch(() => null);
      if (res?.data?.interviews && res.data.interviews.length > 0) {
        const backendMapped = res.data.interviews.map((inv) => {
          const j = inv.job || {};
          const isJobType = inv.interviewType === 'technical' || inv.interviewType === 'mixed' || inv.questionSource === 'recruiter_job';
          const scheduledDateStr = inv.scheduledDate ? new Date(inv.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const scheduledTimeStr = inv.scheduledDate ? new Date(inv.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';

          return {
            id: inv._id || inv.id,
            _id: inv._id || inv.id,
            candidateId: inv.candidate?._id || inv.candidate || candidateId,
            jobId: j._id || j.id || inv.jobIdString || 'job_1',
            jobTitle: j.title || inv.jobTitle || 'Target Requisition',
            company: j.company || inv.company || 'CandidateIQ Talent Partner',
            title: inv.notes || `${j.title || 'Role'} — ${isJobType ? 'Job Interview' : 'HR Interview'}`,
            type: isJobType ? 'FINAL' : 'HR',
            scheduledDate: scheduledDateStr,
            scheduledTime: scheduledTimeStr,
            duration: inv.duration || '2 Hours',
            interviewer: inv.notes ? inv.notes.split('—')[0] || 'Recruiter Committee' : 'Recruiter Committee',
            instructions: inv.hrEvaluationPrompt || inv.notes || 'Please join the virtual interview room within the scheduled window.',
            status: inv.status === 'completed' ? 'Completed' : (inv.status === 'cancelled' ? 'Cancelled' : 'Scheduled'),
            candidateAttempts: inv.status === 'completed' ? [{ candidateId, status: 'COMPLETED' }] : []
          };
        });
        const localList = storageInterviews.getByCandidateId(candidateId) || [];
        const localIds = new Set(backendMapped.map((b) => String(b.id)));
        const extraLocal = localList.filter((l) => !localIds.has(String(l.id)));
        return [...backendMapped, ...extraLocal];
      }
    } catch (e) {
      console.warn('API candidate interviews fetch fallback to storage:', e);
    }
    return storageInterviews.getByCandidateId(candidateId);
  }
};
