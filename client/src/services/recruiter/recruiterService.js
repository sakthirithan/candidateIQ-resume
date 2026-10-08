import api from '../api';
import { storageApplications, storageInterviews } from '../storage/storageService';

export const recruiterService = {
  // Get aggregated recruiter dashboard metrics
  getDashboardStats: async () => {
    const response = await api.get('/analytics/recruiter-dashboard');
    return response.data;
  },

  // Get recruiter's job postings with server-side metrics, filters & pagination
  getRecruiterJobs: async (params = {}) => {
    const response = await api.get('/jobs/recruiter/my-jobs', { params });
    return response.data;
  },

  // Get single job details with health metrics, skill coverage & related jobs
  getJobDetails: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Create new job posting
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Duplicate existing job posting
  duplicateJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/duplicate`);
    return response.data;
  },

  // Update existing job posting
  updateJob: async (jobId, jobData) => {
    const response = await api.patch(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Autosave draft job posting
  autosaveDraft: async (jobId, jobData) => {
    const response = await api.patch(`/jobs/${jobId}/draft-autosave`, jobData);
    return response.data;
  },

  // Delete job posting
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Get recruiter's saved views + built-in views
  getSavedViews: async () => {
    const response = await api.get('/jobs/recruiter/views');
    return response.data;
  },

  // Save custom job view
  saveCustomView: async (viewData) => {
    const response = await api.post('/jobs/recruiter/views', viewData);
    return response.data;
  },

  // Delete saved custom job view
  deleteSavedView: async (viewId) => {
    const response = await api.delete(`/jobs/recruiter/views/${viewId}`);
    return response.data;
  },

  // Bulk action on job requisitions (close, archive)
  bulkActionJobs: async (action, jobIds) => {
    const response = await api.post('/jobs/recruiter/bulk-action', { action, jobIds });
    return response.data;
  },

  // Export job requisitions to CSV
  exportJobsCSV: async (params = {}) => {
    const response = await api.get('/jobs/recruiter/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get applicants for a specific job
  getJobApplicants: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applicants`);
    return response.data;
  },

  // Get all applications for recruiter's jobs
  getRecruiterApplications: async () => {
    const response = await api.get('/jobs/recruiter/applications');
    return response.data;
  },

  // Update application status (shortlist, reject, under_review)
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.patch(`/jobs/applications/${applicationId}/status`, { status });
    try {
      const displayStatus = (status || 'applied').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      storageApplications.updateStatus(applicationId, displayStatus);
    } catch (e) {
      console.warn('Storage status sync skipped:', e);
    }
    return response.data;
  },

  // Schedule HR Interview
  scheduleInterview: async (interviewData) => {
    const response = await api.post('/interviews/schedule', interviewData);
    try {
      const inv = response.data?.interview || response.data;
      if (inv) {
        const type = (interviewData.interviewType === 'hr' ? 'HR' : 'FINAL');
        const scheduledDateStr = interviewData.scheduledDate ? new Date(interviewData.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const scheduledTimeStr = interviewData.scheduledDate ? new Date(interviewData.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';

        storageInterviews.saveInterview({
          id: inv._id || inv.id || `int_${Date.now()}`,
          candidateId: interviewData.candidateId || 'cand_1',
          jobId: interviewData.jobId || 'job_1',
          jobTitle: inv.jobTitle || 'Target Requisition',
          company: inv.company || 'CandidateIQ Talent Partner',
          title: interviewData.notes || `${inv.jobTitle || 'Role'} — ${type === 'FINAL' ? 'Job Interview' : 'HR Interview'}`,
          type,
          scheduledDate: scheduledDateStr,
          scheduledTime: scheduledTimeStr,
          duration: '2 Hours',
          interviewer: interviewData.notes ? interviewData.notes.split('—')[0] || 'Recruiter Committee' : 'Recruiter Committee',
          instructions: inv.hrEvaluationPrompt || interviewData.notes || 'Please join the virtual interview room within the scheduled window.',
          status: 'Scheduled'
        });
      }
    } catch (e) {
      console.warn('Storage interview sync skipped:', e);
    }
    return response.data;
  },

  // Get recruiter's scheduled interviews
  getRecruiterInterviews: async () => {
    const response = await api.get('/interviews/recruiter');
    return response.data;
  },

  // Get job-specific & application-specific intelligence
  getApplicationIntelligence: async (applicationId) => {
    const response = await api.get(`/analytics/application/${applicationId}`);
    return response.data;
  }
};

export default recruiterService;
