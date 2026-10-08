import api from '../api';

export const jobService = {
  getJobs: async () => {
    try {
      const response = await api.get('/jobs');
      if (response.data && response.data.jobs) {
        // Map backend response structure cleanly for components
        return response.data.jobs.map(item => {
          const j = item.job || item;
          const candidateState = item.candidateState || {};
          return {
            id: j._id || j.id,
            _id: j._id || j.id,
            title: j.title,
            department: j.department || 'Engineering',
            company: j.company || 'CandidateIQ Talent Partner',
            location: j.location || 'Remote / Hybrid',
            workArrangement: j.workArrangement || 'Hybrid',
            employmentType: j.employmentType || 'Full-time',
            experienceLevel: j.experienceLevel || '1-3 Years',
            experience: j.experience,
            salary: j.salary,
            description: j.description,
            requiredSkills: j.requiredSkills || [],
            preferredSkills: j.preferredSkills || [],
            status: j.status || 'published',
            applicantsCount: j.applicantsCount || 0,
            isApplied: Boolean(candidateState.isApplied),
            applicationId: candidateState.applicationId,
            appliedAt: candidateState.appliedAt,
            isSaved: Boolean(candidateState.isSaved),
            postedDate: j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          };
        });
      }
      return [];
    } catch (err) {
      console.error('[jobService Error] Failed to fetch jobs from backend:', err);
      throw err;
    }
  },

  getJobById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data && response.data.job) {
        const j = response.data.job;
        return {
          id: j._id || j.id,
          _id: j._id || j.id,
          title: j.title,
          department: j.department || 'Engineering',
          company: j.company || 'CandidateIQ Talent Partner',
          location: j.location || 'Remote / Hybrid',
          workArrangement: j.workArrangement || 'Hybrid',
          employmentType: j.employmentType || 'Full-time',
          experienceLevel: j.experienceLevel || '1-3 Years',
          experience: j.experience,
          salary: j.salary,
          description: j.description,
          requiredSkills: j.requiredSkills || [],
          preferredSkills: j.preferredSkills || [],
          status: j.status || 'published',
          applicantsCount: j.applicantsCount || 0,
          postedDate: j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      }
      throw new Error('Job not found.');
    } catch (err) {
      console.error(`[jobService Error] Failed to fetch job ${id}:`, err);
      throw err;
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      if (response.data && response.data.job) {
        const j = response.data.job;
        return {
          id: j._id || j.id,
          _id: j._id || j.id,
          title: j.title,
          department: j.department || 'Engineering',
          company: j.company || 'CandidateIQ Talent Partner',
          location: j.location || 'Remote / Hybrid',
          workArrangement: j.workArrangement || 'Hybrid',
          employmentType: j.employmentType || 'Full-time',
          experienceLevel: j.experienceLevel || '1-3 Years',
          experience: j.experience,
          salary: j.salary,
          description: j.description,
          requiredSkills: j.requiredSkills || [],
          preferredSkills: j.preferredSkills || [],
          status: j.status || 'published',
          applicantsCount: j.applicantsCount || 0,
          postedDate: j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      }
      throw new Error(response.data?.message || 'Failed to create job.');
    } catch (err) {
      console.error('[jobService Error] Failed to create job:', err);
      throw err;
    }
  },

  applyToJob: async (jobId) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`);
      return response.data;
    } catch (err) {
      console.error(`[jobService Error] Failed to apply to job ${jobId}:`, err);
      throw err;
    }
  },

  toggleSaveJob: async (jobId) => {
    try {
      const response = await api.post(`/jobs/${jobId}/save`);
      return response.data;
    } catch (err) {
      console.error(`[jobService Error] Failed to toggle save job ${jobId}:`, err);
      throw err;
    }
  },

  getSavedJobs: async () => {
    try {
      const response = await api.get('/jobs/candidate/saved');
      if (response.data && response.data.jobs) {
        return response.data.jobs.map(item => {
          const j = item.job || item;
          const candidateState = item.candidateState || {};
          return {
            id: j._id || j.id,
            _id: j._id || j.id,
            title: j.title,
            department: j.department || 'Engineering',
            company: j.company || 'CandidateIQ Talent Partner',
            location: j.location || 'Remote / Hybrid',
            workArrangement: j.workArrangement || 'Hybrid',
            employmentType: j.employmentType || 'Full-time',
            experienceLevel: j.experienceLevel || '1-3 Years',
            experience: j.experience,
            salary: j.salary,
            description: j.description,
            requiredSkills: j.requiredSkills || [],
            preferredSkills: j.preferredSkills || [],
            status: j.status || 'published',
            applicantsCount: j.applicantsCount || 0,
            isApplied: Boolean(candidateState.isApplied),
            applicationId: candidateState.applicationId,
            appliedAt: candidateState.appliedAt,
            isSaved: true,
            postedDate: j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          };
        });
      }
      return [];
    } catch (err) {
      console.error('[jobService Error] Failed to fetch saved jobs:', err);
      throw err;
    }
  },

  getJobApplicants: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}/applicants`);
      return response.data?.applicants || [];
    } catch (err) {
      console.error(`[jobService Error] Failed to fetch applicants for job ${jobId}:`, err);
      throw err;
    }
  }
};

// Export mockJobService alias for backwards compatibility with component imports
export const mockJobService = jobService;
export default jobService;
