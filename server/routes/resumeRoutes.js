const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  getMyResumes,
  getResumeById,
  uploadAndParseResume,
  updateTargetAnalysis,
  triggerResumeAnalysis,
  replaceResumeFile,
  renameResume,
  deleteResume,
  getResumeStatus,
  confirmResumeSections,
  getCandidateResumeKeywords
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-resumes', protect, getMyResumes);
router.get('/:id', protect, getResumeById);
router.get('/detail/:id', protect, getResumeById);
router.post('/upload', protect, upload.single('resume'), uploadAndParseResume);
router.post('/:id/analyze', protect, triggerResumeAnalysis);
router.put('/:id/target-analysis', protect, updateTargetAnalysis);
router.put('/:id/replace', protect, replaceResumeFile);
router.put('/:id/rename', protect, renameResume);
router.delete('/:id', protect, deleteResume);

// Legacy routes for backwards compatibility
router.get('/status/:id', protect, getResumeStatus);
router.post('/confirm', protect, confirmResumeSections);
router.get('/keywords', protect, getCandidateResumeKeywords);

module.exports = router;

