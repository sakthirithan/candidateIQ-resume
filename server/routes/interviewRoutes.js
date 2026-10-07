const express = require('express');
const router = express.Router();
const {
  startInterview,
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  submitAnswer,
  completeInterview,
  evaluateOfficialInterview,
  getInterviewById,
  rescheduleInterview,
  cancelInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/start', protect, startInterview);
router.post('/schedule', protect, authorize('hr', 'recruiter', 'admin'), scheduleInterview);
router.get('/recruiter', protect, authorize('hr', 'recruiter', 'admin'), getRecruiterInterviews);
router.get('/candidate', protect, getCandidateInterviews);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/complete', protect, completeInterview);
router.post('/:id/evaluate', protect, authorize('hr', 'recruiter', 'admin'), evaluateOfficialInterview);
router.put('/:id/reschedule', protect, authorize('hr', 'recruiter', 'admin'), rescheduleInterview);
router.put('/:id/cancel', protect, authorize('hr', 'recruiter', 'admin'), cancelInterview);
router.get('/:id', protect, getInterviewById);

module.exports = router;
