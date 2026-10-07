const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const SCORING_CONFIG = require('../config/candidateIntelligenceConfig');

/**
 * Normalizes skill strings
 */
function cleanSkillName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (SCORING_CONFIG.canonicalSkills && SCORING_CONFIG.canonicalSkills[lower]) {
    return SCORING_CONFIG.canonicalSkills[lower];
  }
  return trimmed;
}

/**
 * Main Service: Generate Requisition-Specific Candidate Intelligence DTO
 */
async function generateCandidateJobIntelligence({ candidateId, requisitionId, applicationId }) {
  // 1. Fetch Application Record
  let application = null;
  if (applicationId) {
    application = await Application.findById(applicationId)
      .populate('job')
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .lean();
  } else if (candidateId && requisitionId) {
    application = await Application.findOne({ candidate: candidateId, job: requisitionId })
      .populate('job')
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .lean();
  }

  if (!application) {
    throw new Error('Application record not found for candidate intelligence calculation');
  }

  const job = application.job || { _id: application.jobIdString || 'job_unknown', title: 'Software Requisition', requiredSkills: ['React', 'Node.js'], preferredSkills: [] };
  const candidate = application.candidate || { _id: application.candidateIdString || 'cand_unknown', name: application.candidateSnapshot?.name || 'Candidate', email: application.candidateSnapshot?.email || 'candidate@example.com' };
  const candidateProfile = application.candidateProfile;
  const candId = candidate._id || application.candidateIdString || 'cand_unknown';

  // 2. Fetch Stored Interview Records for candidate
  const completedInterviews = await Interview.find({
    $or: [
      { candidate: candId },
      { candidateIdString: candId.toString() }
    ],
    status: 'completed'
  }).lean();

  // 3. Extract Submitted Resume Snapshot & Skills
  const submittedSnapshot = application.resumeSnapshot || {};
  const profSnapshot = application.professionalSnapshot || {};

  const submittedSkillsSet = new Set();
  (profSnapshot.skills || []).forEach(s => submittedSkillsSet.add(cleanSkillName(s)));
  if (candidateProfile?.skills) {
    (candidateProfile.skills.technical || []).forEach(s => submittedSkillsSet.add(cleanSkillName(s)));
    (candidateProfile.skills.frameworks || []).forEach(s => submittedSkillsSet.add(cleanSkillName(s)));
    (candidateProfile.skills.databases || []).forEach(s => submittedSkillsSet.add(cleanSkillName(s)));
    (candidateProfile.skills.tools || []).forEach(s => submittedSkillsSet.add(cleanSkillName(s)));
  }

  const candidateSkillsList = Array.from(submittedSkillsSet).filter(Boolean);

  // 4. Job Requirement Matching Analysis
  const requiredSkills = (job.requiredSkills || []).map(cleanSkillName);
  const preferredSkills = (job.preferredSkills || []).map(cleanSkillName);

  const matchedSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  const candSkillLowerSet = new Set(candidateSkillsList.map(s => s.toLowerCase()));

  requiredSkills.forEach(req => {
    const reqLower = req.toLowerCase();
    if (candSkillLowerSet.has(reqLower)) {
      matchedSkills.push(req);
    } else {
      const isPartial = Array.from(candSkillLowerSet).some(cs => cs.includes(reqLower) || reqLower.includes(cs));
      if (isPartial) {
        partialSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }
  });

  const skillCoverageRatio = requiredSkills.length > 0
    ? (matchedSkills.length + (partialSkills.length * 0.5)) / requiredSkills.length
    : 1.0;

  const resumeJobFitScore = Math.round(Math.min(100, skillCoverageRatio * 100));

  // 5. Technical Competency Evaluation
  let technicalCompetencyScore = resumeJobFitScore;
  let technicalDataAvailable = candidateSkillsList.length > 0;
  let techConfidence = technicalDataAvailable ? 0.75 : 0;

  // Enhance technical score if candidate completed interviews matching job skills
  let evaluatedInterviewScores = [];
  completedInterviews.forEach(inv => {
    const questions = [
      ...(inv.mock_interview_questions?.mcq || []),
      ...(inv.mock_interview_questions?.voice || []),
      ...(inv.mock_interview_questions?.text || []),
      ...(inv.questions || [])
    ];
    questions.forEach(q => {
      if (q.evaluation) {
        const scoreVal = q.evaluation.technicalScore !== undefined ? q.evaluation.technicalScore * 10 : (q.evaluation.score || null);
        if (scoreVal !== null && !isNaN(scoreVal)) {
          evaluatedInterviewScores.push(Number(scoreVal));
        }
      }
    });
  });

  if (evaluatedInterviewScores.length > 0) {
    const avgInterviewScore = Math.round(evaluatedInterviewScores.reduce((a, b) => a + b, 0) / evaluatedInterviewScores.length);
    technicalCompetencyScore = Math.round((resumeJobFitScore * 0.4) + (avgInterviewScore * 0.6));
    techConfidence = 0.92;
  }

  // 6. Experience Relevance Evaluation
  const candidateExpList = candidateProfile?.experience || [];
  const jobMinYears = job.experience?.min || (job.experienceLevel?.includes('3-5') ? 3 : 1);
  let totalYears = 0;
  candidateExpList.forEach(exp => {
    totalYears += 1.5; // Baseline duration estimate per role entry
  });

  const expRatio = jobMinYears > 0 ? Math.min(1.2, (totalYears || 1.5) / jobMinYears) : 1.0;
  const experienceRelevanceScore = Math.round(Math.min(100, expRatio * 85));

  // 7. Project Relevance Evaluation
  const candidateProjects = candidateProfile?.projects || [];
  let relevantProjectsCount = 0;
  candidateProjects.forEach(proj => {
    const projTechs = (proj.technologies || []).map(t => t.toLowerCase());
    const matchesReq = requiredSkills.some(req => projTechs.some(pt => pt.includes(req.toLowerCase())));
    if (matchesReq) relevantProjectsCount++;
  });

  const projectRelevanceScore = candidateProjects.length > 0
    ? Math.min(100, 70 + (relevantProjectsCount * 10))
    : 50;

  // 8. Interview Performance & Behavioural Pillars
  let interviewPerformanceScore = 0;
  let interviewDataAvailable = false;
  let behaviouralScore = 0;
  let behaviouralDataAvailable = false;

  if (completedInterviews.length > 0) {
    let intScores = [];
    let behScores = [];
    completedInterviews.forEach(inv => {
      const overall = inv.overallEvaluation || {};
      const evalData = inv.evaluation || {};
      if (overall.overallInterviewScore || evalData.overallScore) {
        intScores.push(overall.overallInterviewScore || evalData.overallScore);
      }
      if (overall.behaviouralCompetency || evalData.behaviouralScore) {
        behScores.push(overall.behaviouralCompetency || evalData.behaviouralScore);
      }
    });

    if (intScores.length > 0) {
      interviewPerformanceScore = Math.round(intScores.reduce((a, b) => a + b, 0) / intScores.length);
      interviewDataAvailable = true;
    }
    if (behScores.length > 0) {
      behaviouralScore = Math.round(behScores.reduce((a, b) => a + b, 0) / behScores.length);
      behaviouralDataAvailable = true;
    }
  }

  // 9. Calculate Overall Candidate Intelligence Score across AVAILABLE pillars
  const pillars = [
    { name: 'Resume & Job Fit', score: resumeJobFitScore, weight: 0.20, available: true },
    { name: 'Technical Competency', score: technicalCompetencyScore, weight: 0.25, available: technicalDataAvailable },
    { name: 'Experience Relevance', score: experienceRelevanceScore, weight: 0.15, available: true },
    { name: 'Project Relevance', score: projectRelevanceScore, weight: 0.15, available: candidateProjects.length > 0 },
    { name: 'Interview Performance', score: interviewPerformanceScore, weight: 0.15, available: interviewDataAvailable },
    { name: 'Behavioural Evidence', score: behaviouralScore, weight: 0.10, available: behaviouralDataAvailable }
  ];

  let availableWeightedScore = 0;
  let availableWeightSum = 0;
  let availableCount = 0;

  pillars.forEach(p => {
    if (p.available) {
      availableWeightedScore += p.score * p.weight;
      availableWeightSum += p.weight;
      availableCount++;
    }
  });

  const overallJobFitScore = availableWeightSum > 0
    ? Math.round(availableWeightedScore / availableWeightSum)
    : resumeJobFitScore;

  const overallConfidence = Number((availableWeightSum * 0.95).toFixed(2));

  // Key Drivers & Insights (Explainable output)
  const keyDrivers = [];
  if (matchedSkills.length > 0) {
    keyDrivers.push(`Matched ${matchedSkills.length} required skills (${matchedSkills.slice(0, 3).join(', ')})`);
  }
  if (relevantProjectsCount > 0) {
    keyDrivers.push(`Demonstrated ${relevantProjectsCount} projects directly relevant to ${job.title}`);
  }
  if (interviewDataAvailable) {
    keyDrivers.push(`Completed AI interview evaluations with ${interviewPerformanceScore}% performance`);
  }

  const identifiedGaps = [];
  if (missingSkills.length > 0) {
    identifiedGaps.push(`Missing required skills: ${missingSkills.join(', ')}`);
  }
  if (!interviewDataAvailable) {
    identifiedGaps.push('No verified mock or recruiter interview records completed yet');
  }

  return {
    applicationId: application._id.toString(),
    candidateId: candidate._id.toString(),
    requisitionId: job._id.toString(),

    context: {
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: job.title,
      department: job.department || 'Engineering',
      appliedAt: application.createdAt,
      applicationStatus: application.status
    },

    submittedResumeSnapshot: {
      resumeId: submittedSnapshot.resumeId || null,
      fileName: submittedSnapshot.fileName || 'Submitted_Resume.pdf',
      capturedAt: submittedSnapshot.capturedAt || application.createdAt,
      submittedSkills: candidateSkillsList
    },

    overallJobFit: {
      score: overallJobFitScore,
      max: 100,
      confidence: Math.round(overallConfidence * 100),
      status: 'calculated',
      pillarsEvaluatedCount: availableCount,
      totalPillarsCount: pillars.length,
      explanation: `Calculated from ${availableCount} of ${pillars.length} available intelligence pillars for ${job.title}.`
    },

    pillars: pillars.map(p => ({
      name: p.name,
      score: p.score,
      weight: p.weight,
      available: p.available,
      status: p.available ? 'evaluated' : 'not_available'
    })),

    skillMatching: {
      requiredSkills,
      preferredSkills,
      matchedSkills,
      partialSkills,
      missingSkills,
      skillFitPercentage: Math.round(skillCoverageRatio * 100)
    },

    explainableInsights: {
      matchRating: overallJobFitScore >= 85 ? 'High Candidate Match' : (overallJobFitScore >= 70 ? 'Strong Fit' : 'Potential Fit'),
      keyDrivers,
      identifiedGaps,
      responsibleAIDisclaimer: 'CandidateIQ assessments serve as evidence-based recruiter decision support. Hiring decisions should be made by human recruiters.'
    },

    formulaVersion: SCORING_CONFIG.formulaVersion,
    lastCalculated: new Date()
  };
}

module.exports = {
  generateCandidateJobIntelligence
};
