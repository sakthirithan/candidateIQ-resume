const candidateSkillIntelligenceService = require('../services/candidateSkillIntelligence.service');

/**
 * @desc    Get normalized Skill Matrix & Skill Gap Analysis for authenticated candidate
 * @route   GET /api/candidates/me/skills
 * @access  Private (Candidate)
 */
exports.getMyCandidateSkillMatrix = async (req, res, next) => {
  try {
    const candidateId = req.user._id || req.user.id;
    const skillMatrix = await candidateSkillIntelligenceService.getCandidateSkillMatrix(candidateId);

    res.status(200).json({
      success: true,
      data: skillMatrix
    });
  } catch (error) {
    console.error('[CandidateSkillsController] Error fetching skill matrix:', error);
    next(error);
  }
};

/**
 * @desc    Get detailed evidence breakdown for a single skill
 * @route   GET /api/candidates/me/skills/:skillId
 * @access  Private (Candidate)
 */
exports.getMyCandidateSkillById = async (req, res, next) => {
  try {
    const candidateId = req.user._id || req.user.id;
    const { skillId } = req.params;

    const skillMatrix = await candidateSkillIntelligenceService.getCandidateSkillMatrix(candidateId);
    const targetSkill = skillMatrix.skills.find(s => s.skillId === skillId || s.name.toLowerCase() === skillId.toLowerCase());

    if (!targetSkill) {
      return res.status(404).json({
        success: false,
        message: `Skill ${skillId} not found in candidate matrix.`
      });
    }

    res.status(200).json({
      success: true,
      data: targetSkill
    });
  } catch (error) {
    console.error('[CandidateSkillsController] Error fetching skill details:', error);
    next(error);
  }
};
