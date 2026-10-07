const express = require('express');
const router = express.Router();
const {
  getApplicationCandidateIntelligence,
  getCandidateIntelligenceProfile,
  getRecruiterDashboardOverview,
  compareCandidates,
  queryAIAssistant
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/application/:applicationId', protect, getApplicationCandidateIntelligence);
router.get('/candidate/:candidateId', protect, getCandidateIntelligenceProfile);
router.get('/recruiter-dashboard', protect, authorize('recruiter', 'hr', 'admin'), getRecruiterDashboardOverview);
router.post('/compare', protect, authorize('recruiter', 'hr', 'admin'), compareCandidates);
router.post('/ai-assistant', protect, authorize('recruiter', 'hr', 'admin'), queryAIAssistant);

module.exports = router;
