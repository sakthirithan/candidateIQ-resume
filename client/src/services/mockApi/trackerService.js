import { mockJobService } from './jobService';
import { mockApplicationService } from './applicationService';

let trackedStore = [
  {
    id: 'track_1',
    jobId: 'job_1',
    candidateId: 'cand_1',
    status: 'Applied', // 'Interested' | 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Closed'
    trackedAt: '2026-09-02',
    updatedAt: '2026-09-03',
    notes: 'Applied via CandidateIQ matching engine. High match score.'
  },
  {
    id: 'track_2',
    jobId: 'job_2',
    candidateId: 'cand_1',
    status: 'Interested',
    trackedAt: '2026-09-05',
    updatedAt: '2026-09-05',
    notes: 'Reviewed job description. Preparing resume details.'
  }
];

export const mockTrackerService = {
  getTrackedJobs: async () => {
    await new Promise((r) => setTimeout(r, 150));
    const allJobs = await mockJobService.getJobs();
    const allApps = await mockApplicationService.getApplications();

    return trackedStore.map((tItem) => {
      const jobDetails = allJobs.find((j) => j.id === tItem.jobId || j._id === tItem.jobId) || {
        id: tItem.jobId,
        title: 'Software Engineer Requisition',
        company: 'CandidateIQ Enterprise',
        location: 'Remote / San Francisco',
        type: 'Full-Time',
        salary: '$140,000 - $170,000',
        experience: '3+ Years'
      };

      const appRecord = allApps.find((a) => a.jobId === tItem.jobId);
      const appStatus = appRecord ? appRecord.status : 'Not Applied';

      // Sync status if applied
      let effectiveTrackingStatus = tItem.status;
      if (appRecord && tItem.status === 'Interested') {
        effectiveTrackingStatus = appRecord.status || 'Applied';
      }

      return {
        ...tItem,
        status: effectiveTrackingStatus,
        applicationStatus: appStatus,
        appliedDate: appRecord?.appliedDate || null,
        job: jobDetails
      };
    });
  },

  isTracked: (jobId) => {
    return trackedStore.some((t) => t.jobId === jobId);
  },

  getTrackedRecord: (jobId) => {
    return trackedStore.find((t) => t.jobId === jobId) || null;
  },

  trackJob: async (jobId, initialStatus = 'Interested') => {
    await new Promise((r) => setTimeout(r, 200));
    const existing = trackedStore.find((t) => t.jobId === jobId);
    if (existing) {
      return existing;
    }

    const newRecord = {
      id: `track_${Date.now()}`,
      jobId,
      candidateId: 'cand_1',
      status: initialStatus,
      trackedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      notes: ''
    };

    trackedStore.unshift(newRecord);
    return newRecord;
  },

  untrackJob: async (jobId) => {
    await new Promise((r) => setTimeout(r, 150));
    trackedStore = trackedStore.filter((t) => t.jobId !== jobId);
    return true;
  },

  updateTrackingStatus: async (jobId, newStatus) => {
    await new Promise((r) => setTimeout(r, 150));
    trackedStore = trackedStore.map((t) => {
      if (t.jobId === jobId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    return trackedStore.find((t) => t.jobId === jobId);
  }
};
