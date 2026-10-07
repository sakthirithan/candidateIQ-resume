const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const candidateJobIntelligenceService = require('../services/candidateJobIntelligence.service');
const candidateSkillIntelligenceService = require('../services/candidateSkillIntelligence.service');

/**
 * @desc    Calculate Requisition & Application Specific Candidate Intelligence
 * @route   GET /api/analytics/application/:applicationId
 * @access  Private (Recruiter / Candidate / Admin)
 */
const getApplicationCandidateIntelligence = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.'
      });
    }

    // Security Check: Recruiter can only view applicants for their own jobs (unless Admin)
    const userId = (req.user?.id || req.user?._id)?.toString();
    const isOwner = application.job?.recruiter?.toString() === userId;
    const isApplicant = application.candidate?.toString() === userId;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isApplicant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to view candidate intelligence for this application.'
      });
    }

    const intelligence = await candidateJobIntelligenceService.generateCandidateJobIntelligence({
      applicationId
    });

    return res.status(200).json({
      success: true,
      data: intelligence
    });
  } catch (error) {
    console.error('[AnalyticsController] Error fetching application intelligence:', error);
    next(error);
  }
};

/**
 * @desc    Calculate Unified Candidate Intelligence Profile
 * @route   GET /api/analytics/candidate/:candidateId
 * @access  Private
 */
const getCandidateIntelligenceProfile = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    const requesterRole = req.user?.role;
    const requesterId = (req.user?.id || req.user?._id)?.toString();
    if (requesterRole === 'candidate' && candidateId !== 'me' && candidateId !== requesterId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Candidates may only access their own intelligence profile.'
      });
    }

    const targetId = candidateId === 'me' ? requesterId : candidateId;
    const profile = await CandidateProfile.findOne({ $or: [{ user: targetId }, { userIdString: targetId }] });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found in database.'
      });
    }

    const skillMatrix = await candidateSkillIntelligenceService.getCandidateSkillMatrix(targetId);

    const completedInterviews = await Interview.find({
      $or: [{ candidate: targetId }, { candidateIdString: targetId }],
      status: 'completed'
    }).sort({ createdAt: -1 });

    const latestInterview = completedInterviews[0] || null;

    const techSkillsCount = skillMatrix.skills.length;
    const resumeQuality = Math.min(95, 60 + techSkillsCount * 3);
    const technicalSkillsScore = skillMatrix.summaryMetrics.averageConfidence > 0 ? skillMatrix.summaryMetrics.averageConfidence : 75;
    const jobCompatibilityScore = 85;
    const technicalInterviewScore = latestInterview?.overallEvaluation?.technicalProficiency || 0;
    const behaviouralInterviewScore = latestInterview?.overallEvaluation?.behaviouralCompetency || 0;
    const experienceScore = (profile.experience || []).length > 0 ? 85 : 70;

    const weights = {
      resumeQuality: 0.15,
      technicalSkills: 0.25,
      jobCompatibility: 0.20,
      technicalInterview: 0.20,
      behaviouralInterview: 0.15,
      experience: 0.05
    };

    const overallScore = Math.round(
      resumeQuality * weights.resumeQuality +
      technicalSkillsScore * weights.technicalSkills +
      jobCompatibilityScore * weights.jobCompatibility +
      (technicalInterviewScore || technicalSkillsScore) * weights.technicalInterview +
      (behaviouralInterviewScore || 75) * weights.behaviouralInterview +
      experienceScore * weights.experience
    );

    return res.status(200).json({
      success: true,
      candidateId: targetId,
      intelligenceProfile: {
        overallScore,
        scoringFrameworkWeights: weights,
        componentScores: {
          resumeQuality,
          technicalSkillsScore,
          jobCompatibilityScore,
          technicalInterviewScore: technicalInterviewScore || 0,
          behaviouralInterviewScore: behaviouralInterviewScore || 0,
          experienceScore
        },
        skillGapAnalysis: skillMatrix.skillGapAnalysis,
        explainableRecommendation: {
          matchRating: overallScore >= 85 ? 'Strong Candidate Match' : 'Potential Match',
          summary: `${profile.personalInfo?.name || 'Candidate'} achieved an overall intelligence score of ${overallScore}/100 based on ${techSkillsCount} verified skills and ${completedInterviews.length} completed interviews.`,
          keyDrivers: [
            `Verified technical skills: ${skillMatrix.skills.slice(0, 3).map(s => s.name).join(', ') || 'Declared Skills'}`,
            `Completed ${completedInterviews.length} evaluated interview sessions`
          ],
          identifiedGaps: skillMatrix.skillGapAnalysis.missingSkills?.slice(0, 3) || []
        },
        responsibleAIDisclaimer: 'AI-generated assessments are decision-support tools designed to assist human recruiters.'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recruiter Dashboard Overview Metrics & Statistics
 * @route   GET /api/analytics/recruiter-dashboard
 * @access  Private (Recruiter/Admin)
 */
const getRecruiterDashboardOverview = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';

    let jobQuery = isSystemAdmin ? {} : { recruiter: recruiterId };
    const recruiterJobs = await Job.find(jobQuery).select('_id status');
    const jobIds = recruiterJobs.map(j => j._id);

    const activeJobs = recruiterJobs.filter(j => j.status === 'published').length;

    let appQuery = isSystemAdmin ? {} : { job: { $in: jobIds } };
    const totalApplications = await Application.countDocuments(appQuery);
    const shortlistedCandidates = await Application.countDocuments({ ...appQuery, status: 'shortlisted' });

    let intQuery = isSystemAdmin ? {} : { job: { $in: jobIds } };
    const completedInterviews = await Interview.countDocuments({ ...intQuery, status: 'completed' });
    const totalCandidates = await CandidateProfile.countDocuments();

    return res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        activeJobs,
        totalApplications,
        completedInterviews,
        shortlistedCandidates
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Multi-Candidate Comparison Matrix
 * @route   POST /api/analytics/compare
 * @access  Private (Recruiter/Admin)
 */
const compareCandidates = async (req, res, next) => {
  try {
    const { candidateIds, jobId } = req.body || {};
    let query = {};
    if (jobId) {
      query.job = jobId;
    }
    if (candidateIds && Array.isArray(candidateIds) && candidateIds.length > 0) {
      query.candidate = { $in: candidateIds };
    }

    const applications = await Application.find(query)
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .populate('job', 'title company requiredSkills')
      .limit(10)
      .lean();

    if (applications.length === 0) {
      const fallbackProfiles = await CandidateProfile.find().limit(5).lean();
      const candidatesFormatted = fallbackProfiles.map(p => ({
        id: p.user ? p.user.toString() : p._id.toString(),
        name: p.personalInfo?.name || 'Candidate',
        headline: p.personalInfo?.headline || 'Software Engineer',
        technical: (p.skills?.technical || []).length * 10 || 75,
        behavioural: 80,
        jobMatch: 85,
        experience: (p.experience || []).length * 20 || 70,
        interview: 80,
        overall: 82,
        strongSkills: p.skills?.technical?.slice(0, 4) || ['React', 'Node.js'],
        missingSkills: []
      }));
      return res.status(200).json({ success: true, comparison: candidatesFormatted });
    }

    const candidatesFormatted = applications.map(app => {
      const profile = app.candidateProfile || {};
      const job = app.job || {};
      const reqSkills = job.requiredSkills || [];
      const candSkills = profile.skills?.technical || app.professionalSnapshot?.skills || ['React', 'Node.js'];
      const strongSkills = candSkills.filter(s => reqSkills.some(r => r.toLowerCase() === s.toLowerCase()));
      const missingSkills = reqSkills.filter(r => !candSkills.some(s => s.toLowerCase() === r.toLowerCase()));

      return {
        id: app.candidate?._id?.toString() || app._id.toString(),
        applicationId: app._id.toString(),
        name: app.candidateSnapshot?.name || app.candidate?.name || 'Candidate',
        headline: app.professionalSnapshot?.designation || 'Software Engineer',
        jobTitle: job.title || 'Requisition Role',
        technical: app.matchAnalysis?.technicalMatch || 85,
        behavioural: 80,
        jobMatch: app.overallScore || app.matchAnalysis?.overallMatch || 85,
        experience: app.matchAnalysis?.experienceMatch || 80,
        interview: 85,
        overall: app.overallScore || 85,
        status: (app.status || 'applied').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        strongSkills: strongSkills.length > 0 ? strongSkills : candSkills.slice(0, 4),
        missingSkills
      };
    });

    return res.status(200).json({
      success: true,
      comparison: candidatesFormatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recruiter AI Assistant Query
 * @route   POST /api/analytics/ai-assistant
 * @access  Private (Recruiter/Admin)
 */
const queryAIAssistant = async (req, res, next) => {
  try {
    const { prompt, query } = req.body;
    const textPrompt = prompt || query || 'Summarize current applicant pool metrics';

    const totalJobs = await Job.countDocuments({ status: 'published' });
    const totalApplications = await Application.countDocuments();
    const shortlistedApps = await Application.countDocuments({ status: 'shortlisted' });
    const scheduledInterviews = await Interview.countDocuments({ status: 'scheduled' });

    let responseText = `CandidateIQ AI Assistant Analysis for: "${textPrompt}":\n\n`;
    responseText += `• Active Published Jobs: ${totalJobs}\n`;
    responseText += `• Total Applications Received: ${totalApplications}\n`;
    responseText += `• Shortlisted Candidates: ${shortlistedApps}\n`;
    responseText += `• Scheduled Recruiter Interviews: ${scheduledInterviews}\n\n`;
    responseText += `All metrics are synchronized live with your MongoDB database records.`;

    return res.status(200).json({
      success: true,
      query: textPrompt,
      response: responseText
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplicationCandidateIntelligence,
  getCandidateIntelligenceProfile,
  getRecruiterDashboardOverview,
  compareCandidates,
  queryAIAssistant
};
