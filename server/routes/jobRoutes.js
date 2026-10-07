const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getRecruiterJobs,
  getCandidateApplications,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  getRecruiterApplications,
  updateApplicationStatus,
  saveHREvaluationPrompt,
  getJobKeywords,
  duplicateJob,
  autosaveDraft,
  getSavedViews,
  saveCustomView,
  deleteSavedView,
  bulkActionJobs,
  exportJobsCSV,
  toggleSaveJob,
  getSavedJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public / Candidate Routes
router.get('/', getJobs);
router.get('/candidate/my-applications', protect, authorize('candidate'), getCandidateApplications);
router.get('/candidate/saved', protect, authorize('candidate'), getSavedJobs);

// Recruiter Operational & Management Routes
router.get('/recruiter/my-jobs', protect, authorize('hr', 'recruiter', 'admin'), getRecruiterJobs);
router.get('/recruiter/applications', protect, authorize('hr', 'recruiter', 'admin'), getRecruiterApplications);
router.get('/recruiter/views', protect, authorize('hr', 'recruiter', 'admin'), getSavedViews);
router.post('/recruiter/views', protect, authorize('hr', 'recruiter', 'admin'), saveCustomView);
router.delete('/recruiter/views/:viewId', protect, authorize('hr', 'recruiter', 'admin'), deleteSavedView);
router.post('/recruiter/bulk-action', protect, authorize('hr', 'recruiter', 'admin'), bulkActionJobs);
router.get('/recruiter/export', protect, authorize('hr', 'recruiter', 'admin'), exportJobsCSV);

// Individual Requisition Routes
router.get('/:id', getJobById);
router.get('/:id/keywords', getJobKeywords);
router.patch('/:id/hr-prompt', protect, authorize('hr', 'recruiter', 'admin'), saveHREvaluationPrompt);
router.patch('/:id/draft-autosave', protect, authorize('hr', 'recruiter', 'admin'), autosaveDraft);
router.post('/', protect, authorize('hr', 'recruiter', 'admin'), createJob);
router.post('/:id/duplicate', protect, authorize('hr', 'recruiter', 'admin'), duplicateJob);
router.patch('/:id', protect, authorize('hr', 'recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('hr', 'recruiter', 'admin'), deleteJob);
router.post('/:id/apply', protect, authorize('candidate'), applyToJob);
router.post('/:id/save', protect, authorize('candidate'), toggleSaveJob);
router.get('/:id/applicants', protect, authorize('hr', 'recruiter', 'admin'), getJobApplicants);
router.patch('/applications/:id/status', protect, authorize('hr', 'recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
