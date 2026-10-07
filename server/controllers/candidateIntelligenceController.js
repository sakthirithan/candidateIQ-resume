const candidateIntelligenceService = require('../services/candidateIntelligenceService');

/**
 * @desc    Get candidate intelligence for currently authenticated user
 * @route   GET /api/candidates/me/intelligence
 * @access  Private (Candidate)
 */
exports.getMyCandidateIntelligence = async (req, res, next) => {
  try {
    const candidateId = req.user._id || req.user.id;
    const forceRefresh = req.query.refresh === 'true';

    const intelligence = await candidateIntelligenceService.getCandidateIntelligence(candidateId, {
      forceRefresh
    });

    res.status(200).json({
      success: true,
      data: intelligence
    });
  } catch (error) {
    console.error('[CandidateIntelligence] Error fetching candidate intelligence:', error);
    next(error);
  }
};

/**
 * @desc    Force recalculate intelligence snapshot for currently authenticated user
 * @route   POST /api/candidates/me/intelligence/recalculate
 * @access  Private (Candidate)
 */
exports.recalculateMyCandidateIntelligence = async (req, res, next) => {
  try {
    const candidateId = req.user._id || req.user.id;

    const intelligence = await candidateIntelligenceService.getCandidateIntelligence(candidateId, {
      forceRefresh: true
    });

    res.status(200).json({
      success: true,
      message: 'Candidate intelligence recalculated successfully',
      data: intelligence
    });
  } catch (error) {
    console.error('[CandidateIntelligence] Error recalculating intelligence:', error);
    next(error);
  }
};
