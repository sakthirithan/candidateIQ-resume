const candidateInterviewJourneyService = require('../services/candidateInterviewJourney.service');

/**
 * @desc    Get Candidate's Interview Journey Timeline & Performance Progression
 * @route   GET /api/candidates/me/interview-journey
 * @access  Private (Candidate)
 */
exports.getMyCandidateInterviewJourney = async (req, res, next) => {
  try {
    const candidateId = req.user._id || req.user.id;
    const journeyData = await candidateInterviewJourneyService.getCandidateInterviewJourney(candidateId);

    res.status(200).json({
      success: true,
      data: journeyData
    });
  } catch (error) {
    console.error('[CandidateInterviewJourneyController] Error fetching interview journey:', error);
    next(error);
  }
};

/**
 * @desc    Get Candidate's detailed question-by-question interview evaluation
 * @route   GET /api/candidates/me/interview-journey/:interviewId
 * @access  Private (Candidate)
 */
exports.getMyCandidateInterviewById = async (req, res, next) => {
  try {
    const candidateId = req.user._id || req.user.id;
    const { interviewId } = req.params;

    const interviewDetail = await candidateInterviewJourneyService.getInterviewDetailById(candidateId, interviewId);

    res.status(200).json({
      success: true,
      data: interviewDetail
    });
  } catch (error) {
    console.error('[CandidateInterviewJourneyController] Error fetching interview detail:', error);
    next(error);
  }
};
