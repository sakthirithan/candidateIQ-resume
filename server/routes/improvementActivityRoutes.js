const express = require('express');
const router = express.Router();
const {
  generateActivitiesForInterviewController,
  getActivitiesByInterviewController,
  getActivityByIdController,
  startPracticeSessionController,
  submitPracticeSessionController,
  getPracticeHistoryController,
  getInterviewImprovementSummaryController,
  getAllUserActivitiesController
} = require('../controllers/improvementActivityController');
const { protect } = require('../middleware/authMiddleware');

// Global User Activities route
router.get('/activities', protect, getAllUserActivitiesController);

// Interview-specific activity routes
router.get('/interviews/:interviewId/improvement', protect, getInterviewImprovementSummaryController);
router.get('/interviews/:interviewId/activities', protect, getActivitiesByInterviewController);
router.post('/interviews/:interviewId/activities/generate', protect, generateActivitiesForInterviewController);

// Single Activity & Practice Session routes
router.get('/improvement-activities/:id', protect, getActivityByIdController);
router.get('/improvement-activities/:id/history', protect, getPracticeHistoryController);
router.post('/improvement-activities/:id/practice/start', protect, startPracticeSessionController);
router.post('/improvement-activities/:id/practice/submit', protect, submitPracticeSessionController);

module.exports = router;
