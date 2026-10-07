const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  upsertProfile,
  getProfileByUserId,
  getAllProfiles,
  updateCustomSection,
  deleteCustomSection
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getMyCandidateIntelligence,
  recalculateMyCandidateIntelligence
} = require('../controllers/candidateIntelligenceController');

const {
  getMyCandidateSkillMatrix,
  getMyCandidateSkillById
} = require('../controllers/candidateSkillsController');

const {
  getMyCandidateInterviewJourney,
  getMyCandidateInterviewById
} = require('../controllers/candidateInterviewJourneyController');

// Intelligence Snapshots
router.get('/me/intelligence', protect, getMyCandidateIntelligence);
router.post('/me/intelligence/recalculate', protect, recalculateMyCandidateIntelligence);

// Skill Matrix Intelligence & Skill Gap
router.get('/me/skills', protect, getMyCandidateSkillMatrix);
router.get('/me/skills/:skillId', protect, getMyCandidateSkillById);

// My Interview Journey & Evaluation Breakdown
router.get('/me/interview-journey', protect, getMyCandidateInterviewJourney);
router.get('/me/interview-journey/:interviewId', protect, getMyCandidateInterviewById);

router.get('/profile', protect, getMyProfile);
router.get('/profiles', protect, authorize('recruiter', 'hr', 'admin'), getAllProfiles);
router.post('/profile', protect, upsertProfile);
router.get('/profile/:userId', protect, authorize('recruiter', 'hr', 'admin'), getProfileByUserId);
router.patch('/profile/sections/:sectionId', protect, updateCustomSection);
router.delete('/profile/sections/:sectionId', protect, deleteCustomSection);

module.exports = router;
