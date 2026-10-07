const CandidateProfile = require('../models/CandidateProfile');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const CandidateIntelligenceSnapshot = require('../models/CandidateIntelligenceSnapshot');
const SCORING_CONFIG = require('../config/candidateIntelligenceConfig');

/**
 * Helper to determine proficiency level based on score & confidence
 */
function getProficiencyLevel(score, confidence) {
  if (confidence < 0.3 && score > 70) {
    // Unverified high claim
    return 'Self-Declared';
  }
  const { proficiency } = SCORING_CONFIG;
  if (score >= proficiency.expert.min) return proficiency.expert.label;
  if (score >= proficiency.advanced.min) return proficiency.advanced.label;
  if (score >= proficiency.intermediate.min) return proficiency.intermediate.label;
  if (score >= proficiency.foundational.min) return proficiency.foundational.label;
  return proficiency.beginner.label;
}

/**
 * 1. Calculate Resume Quality Score & Criteria
 */
function calculateResumeQuality(resume, profile) {
  if (!resume && !profile?.resumeReference?.resumeId) {
    return {
      value: 0,
      confidence: 0,
      dataAvailable: false,
      criteria: [],
      improvementSuggestion: 'Upload your resume to generate your resume quality score.',
      lastAnalyzed: null
    };
  }

  const criteria = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Criteria 1: Resume Parsed Status
  const isParsed = resume?.extractionStatus === 'confirmed' || resume?.extractionStatus === 'completed' || !!profile?.resumeReference;
  const parsedScore = isParsed ? 100 : 40;
  const parsedWeight = SCORING_CONFIG.resumeCriteria.parsedStatus.weight;
  criteria.push({
    key: 'parsedStatus',
    label: SCORING_CONFIG.resumeCriteria.parsedStatus.label,
    score: parsedScore,
    weight: parsedWeight,
    status: isParsed ? 'strong' : 'needs_attention',
    evidence: isParsed ? 'Resume text successfully parsed' : 'Resume parsing pending'
  });
  totalWeightedScore += parsedScore * parsedWeight;
  totalWeight += parsedWeight;

  // Criteria 2: Technical Skills Density
  const techSkills = profile?.skills?.technical || resume?.keywords || [];
  const skillCount = techSkills.length;
  const skillScore = skillCount >= 12 ? 100 : skillCount >= 6 ? 80 : skillCount >= 2 ? 60 : 20;
  const skillWeight = SCORING_CONFIG.resumeCriteria.skills.weight;
  criteria.push({
    key: 'skills',
    label: SCORING_CONFIG.resumeCriteria.skills.label,
    score: skillScore,
    weight: skillWeight,
    status: skillScore >= 80 ? 'strong' : 'good',
    evidence: `${skillCount} technical skills detected`
  });
  totalWeightedScore += skillScore * skillWeight;
  totalWeight += skillWeight;

  // Criteria 3: Project Evidence
  const projects = profile?.projects || [];
  const projectCount = projects.length;
  const projectScore = projectCount >= 3 ? 100 : projectCount >= 1 ? 75 : 30;
  const projectWeight = SCORING_CONFIG.resumeCriteria.projects.weight;
  criteria.push({
    key: 'projects',
    label: SCORING_CONFIG.resumeCriteria.projects.label,
    score: projectScore,
    weight: projectWeight,
    status: projectScore >= 75 ? 'strong' : 'needs_attention',
    evidence: `${projectCount} verified projects detected`
  });
  totalWeightedScore += projectScore * projectWeight;
  totalWeight += projectWeight;

  // Criteria 4: Work Experience Completeness
  const experience = profile?.experience || [];
  const expCount = experience.length;
  const expScore = expCount >= 2 ? 100 : expCount === 1 ? 80 : 40;
  const expWeight = SCORING_CONFIG.resumeCriteria.experience.weight;
  criteria.push({
    key: 'experience',
    label: SCORING_CONFIG.resumeCriteria.experience.label,
    score: expScore,
    weight: expWeight,
    status: expScore >= 80 ? 'strong' : 'good',
    evidence: `${expCount} work experience entries logged`
  });
  totalWeightedScore += expScore * expWeight;
  totalWeight += expWeight;

  // Criteria 5: Education Completeness
  const education = profile?.education || [];
  const eduScore = education.length >= 1 ? 100 : 30;
  const eduWeight = SCORING_CONFIG.resumeCriteria.education.weight;
  criteria.push({
    key: 'education',
    label: SCORING_CONFIG.resumeCriteria.education.label,
    score: eduScore,
    weight: eduWeight,
    status: eduScore === 100 ? 'strong' : 'needs_attention',
    evidence: education.length >= 1 ? `${education[0].degree || 'Degree'} details complete` : 'Missing formal education'
  });
  totalWeightedScore += eduScore * eduWeight;
  totalWeight += eduWeight;

  // Criteria 6: Summary & Contact
  const hasHeadline = !!profile?.personalInfo?.headline || !!resume?.extractedCandidate?.headline;
  const hasContact = !!profile?.personalInfo?.email && (!!profile?.personalInfo?.phone || !!profile?.personalInfo?.location);
  const summaryScore = hasHeadline ? 100 : 50;
  const contactScore = hasContact ? 100 : 60;
  
  criteria.push({
    key: 'summary',
    label: SCORING_CONFIG.resumeCriteria.summary.label,
    score: summaryScore,
    weight: SCORING_CONFIG.resumeCriteria.summary.weight,
    status: hasHeadline ? 'strong' : 'good',
    evidence: hasHeadline ? 'Professional summary & headline present' : 'Short or missing summary headline'
  });
  totalWeightedScore += summaryScore * SCORING_CONFIG.resumeCriteria.summary.weight;
  totalWeight += SCORING_CONFIG.resumeCriteria.summary.weight;

  criteria.push({
    key: 'contact',
    label: SCORING_CONFIG.resumeCriteria.contact.label,
    score: contactScore,
    weight: SCORING_CONFIG.resumeCriteria.contact.weight,
    status: hasContact ? 'strong' : 'good',
    evidence: hasContact ? 'Contact info verified' : 'Incomplete contact details'
  });
  totalWeightedScore += contactScore * SCORING_CONFIG.resumeCriteria.contact.weight;
  totalWeight += SCORING_CONFIG.resumeCriteria.contact.weight;

  const finalValue = Math.round(totalWeightedScore / totalWeight);

  let suggestion = 'Your resume structure is strong.';
  if (projectScore < 75) {
    suggestion = 'Add measurable project outcomes and key technologies to boost score.';
  } else if (skillScore < 80) {
    suggestion = 'Include specific target framework keywords and libraries.';
  }

  return {
    value: finalValue,
    confidence: 0.92,
    dataAvailable: true,
    criteria,
    improvementSuggestion: suggestion,
    lastAnalyzed: resume?.updatedAt || profile?.updatedAt || new Date()
  };
}

/**
 * 2. Calculate Technical Skill Intelligence using 5-level hierarchy
 */
function calculateTechnicalSkillsHierarchy(profile, resume, completedInterviews) {
  const allDeclaredSkills = new Set();

  // Level 1: Profile & Resume skills
  if (profile?.skills) {
    (profile.skills.technical || []).forEach(s => allDeclaredSkills.add(s));
    (profile.skills.frameworks || []).forEach(s => allDeclaredSkills.add(s));
    (profile.skills.databases || []).forEach(s => allDeclaredSkills.add(s));
    (profile.skills.tools || []).forEach(s => allDeclaredSkills.add(s));
  }
  if (resume?.keywords) {
    resume.keywords.forEach(k => allDeclaredSkills.add(k));
  }

  // Also collect skills evaluated in mock/actual interviews
  completedInterviews.forEach(interview => {
    const questions = [
      ...(interview.mock_interview_questions?.mcq || []),
      ...(interview.mock_interview_questions?.voice || []),
      ...(interview.mock_interview_questions?.text || []),
      ...(interview.questions || [])
    ];
    questions.forEach(q => {
      if (q.targetSkill) allDeclaredSkills.add(q.targetSkill);
      if (Array.isArray(q.expectedSkills)) q.expectedSkills.forEach(s => allDeclaredSkills.add(s));
    });
  });

  if (allDeclaredSkills.size === 0) {
    return {
      value: 0,
      confidence: 0,
      dataAvailable: false,
      skillsEvaluatedCount: 0,
      criteria: [],
      skillsList: [],
      lastVerified: null
    };
  }

  const projects = profile?.projects || [];
  const skillsList = [];

  allDeclaredSkills.forEach(skillName => {
    if (!skillName || typeof skillName !== 'string' || skillName.trim().length === 0) return;
    const cleanName = skillName.trim();
    const skillLower = cleanName.toLowerCase();

    // Check evidence levels
    // Level 1: Resume / Profile claim
    const hasResumeClaim = (profile?.skills?.technical || []).some(s => s.toLowerCase() === skillLower) ||
      (resume?.keywords || []).some(k => k.toLowerCase() === skillLower);

    // Level 2: Project evidence
    const matchingProjects = projects.filter(p => {
      const techs = (p.technologies || []).map(t => t.toLowerCase());
      const desc = (p.description || '').toLowerCase();
      return techs.some(t => t.includes(skillLower) || skillLower.includes(t)) || desc.includes(skillLower);
    });
    const projectCount = matchingProjects.length;

    // Level 4 & 5: Mock & Actual Interview evidence
    let interviewScores = [];
    completedInterviews.forEach(interview => {
      const questions = [
        ...(interview.mock_interview_questions?.mcq || []),
        ...(interview.mock_interview_questions?.voice || []),
        ...(interview.mock_interview_questions?.text || []),
        ...(interview.questions || [])
      ];

      questions.forEach(q => {
        const matchesSkill = (q.targetSkill && q.targetSkill.toLowerCase() === skillLower) ||
          (Array.isArray(q.expectedSkills) && q.expectedSkills.some(s => s.toLowerCase() === skillLower));

        if (matchesSkill && q.evaluation) {
          const scoreVal = q.evaluation.technicalScore !== undefined
            ? q.evaluation.technicalScore * 10
            : q.evaluation.overallScore || q.evaluation.score || null;
          if (scoreVal !== null && !isNaN(scoreVal)) {
            interviewScores.push(Number(scoreVal));
          }
        }
      });
    });

    // Compute weighted skill score
    let weightedScore = 0;
    let totalWeight = 0;
    const sources = [];

    if (hasResumeClaim) {
      const claimScore = 75; // Default self-declared score baseline
      const w = SCORING_CONFIG.technicalHierarchy.level1_resume;
      weightedScore += claimScore * w;
      totalWeight += w;
      sources.push('resume');
    }

    if (projectCount > 0) {
      const projScore = Math.min(100, 75 + (projectCount * 10));
      const w = SCORING_CONFIG.technicalHierarchy.level2_projects;
      weightedScore += projScore * w;
      totalWeight += w;
      sources.push('projects');
    }

    if (interviewScores.length > 0) {
      const avgInterviewScore = Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length);
      const w = SCORING_CONFIG.technicalHierarchy.level4_mock;
      weightedScore += avgInterviewScore * w;
      totalWeight += w;
      sources.push('mock_interview');
    }

    const calculatedSkillScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 70;
    const confidenceVal = Number((totalWeight).toFixed(2)); // Higher as more sources verify the skill

    skillsList.push({
      skillId: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: cleanName,
      score: calculatedSkillScore,
      proficiencyLevel: getProficiencyLevel(calculatedSkillScore, confidenceVal),
      confidence: confidenceVal,
      evidence: {
        resume: hasResumeClaim,
        projects: projectCount,
        mockInterviewScores: interviewScores.length > 0 ? interviewScores : undefined
      },
      sources,
      lastVerifiedAt: new Date()
    });
  });

  // Sort by score & confidence
  skillsList.sort((a, b) => (b.confidence * b.score) - (a.confidence * a.score));

  // Overall Technical Score
  const topSkills = skillsList.slice(0, 6);
  const avgTechScore = topSkills.length > 0
    ? Math.round(topSkills.reduce((sum, s) => sum + s.score, 0) / topSkills.length)
    : 0;
  const avgTechConfidence = topSkills.length > 0
    ? Number((topSkills.reduce((sum, s) => sum + s.confidence, 0) / topSkills.length).toFixed(2))
    : 0;

  const criteria = topSkills.map(s => ({
    label: s.name,
    score: s.score,
    confidence: s.confidence,
    sources: s.sources,
    status: s.score >= 80 ? 'strong' : 'moderate'
  }));

  return {
    value: avgTechScore,
    confidence: avgTechConfidence,
    dataAvailable: skillsList.length > 0,
    skillsEvaluatedCount: skillsList.length,
    criteria,
    skillsList,
    lastVerified: new Date()
  };
}

/**
 * 3. Calculate Interview & Behavioural Performance
 */
function calculateInterviewPerformance(completedInterviews) {
  if (!completedInterviews || completedInterviews.length === 0) {
    return {
      interviewScore: {
        value: 0,
        confidence: 0,
        dataAvailable: false,
        completedCount: 0,
        criteria: []
      },
      behaviouralScore: {
        value: 0,
        confidence: 0,
        dataAvailable: false,
        criteria: []
      }
    };
  }

  let totalInterviewScore = 0;
  let totalBehaviouralScore = 0;
  let validInterviewCount = 0;
  let validBehaviouralCount = 0;

  completedInterviews.forEach(interview => {
    const overall = interview.overallEvaluation;
    const evalData = interview.evaluation;

    // Technical / overall interview score
    const interviewScoreVal = overall?.overallInterviewScore || evalData?.overallScore || null;
    if (interviewScoreVal && !isNaN(interviewScoreVal)) {
      totalInterviewScore += Number(interviewScoreVal);
      validInterviewCount++;
    }

    // Behavioural score
    const behaviouralScoreVal = overall?.behaviouralCompetency || evalData?.behaviouralScore || null;
    if (behaviouralScoreVal && !isNaN(behaviouralScoreVal)) {
      totalBehaviouralScore += Number(behaviouralScoreVal);
      validBehaviouralCount++;
    }
  });

  const avgInterviewScore = validInterviewCount > 0 ? Math.round(totalInterviewScore / validInterviewCount) : 0;
  const avgBehaviouralScore = validBehaviouralCount > 0 ? Math.round(totalBehaviouralScore / validBehaviouralCount) : 0;

  return {
    interviewScore: {
      value: avgInterviewScore,
      confidence: validInterviewCount > 0 ? 0.90 : 0,
      dataAvailable: validInterviewCount > 0,
      completedCount: validInterviewCount,
      criteria: [
        { label: 'Completed Mock Sessions', value: validInterviewCount },
        { label: 'Technical Accuracy & Clarity', score: avgInterviewScore }
      ]
    },
    behaviouralScore: {
      value: avgBehaviouralScore,
      confidence: validBehaviouralCount > 0 ? 0.85 : 0,
      dataAvailable: validBehaviouralCount > 0,
      criteria: [
        { label: 'Communication & Directness', score: avgBehaviouralScore }
      ]
    }
  };
}

/**
 * 4. Calculate Market Job Compatibility Engine
 */
async function calculateMarketJobMatches(candidateId, profile, resume, technicalSkillsList) {
  const activeJobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 }).lean();
  const applications = await Application.find({ candidate: candidateId }).lean();

  const appMap = new Map();
  applications.forEach(app => {
    appMap.set(app.job.toString(), app);
  });

  const candidateSkillNames = new Set(
    technicalSkillsList.map(s => s.name.toLowerCase())
  );
  if (profile?.skills?.technical) {
    profile.skills.technical.forEach(s => candidateSkillNames.add(s.toLowerCase()));
  }

  const matchedJobs = activeJobs.map(job => {
    const reqSkills = job.requiredSkills || [];
    const prefSkills = job.preferredSkills || [];
    const allJobSkills = [...reqSkills, ...prefSkills];

    const matchedSkills = [];
    const partialSkills = [];
    const missingSkills = [];

    reqSkills.forEach(req => {
      const reqLower = req.toLowerCase();
      if (candidateSkillNames.has(reqLower)) {
        matchedSkills.push(req);
      } else {
        // Check partial match
        const foundPartial = Array.from(candidateSkillNames).some(cs => cs.includes(reqLower) || reqLower.includes(cs));
        if (foundPartial) {
          partialSkills.push(req);
        } else {
          missingSkills.push(req);
        }
      }
    });

    const skillFitRatio = reqSkills.length > 0
      ? (matchedSkills.length + (partialSkills.length * 0.5)) / reqSkills.length
      : 1.0;

    const technicalCompatibility = Math.round(Math.min(100, skillFitRatio * 100));
    const experienceCompatibility = 85; // Standard baseline for published requisition fit
    const overallCompatibility = Math.round((technicalCompatibility * 0.7) + (experienceCompatibility * 0.3));

    const existingApp = appMap.get(job._id.toString());
    const applicationStatus = existingApp ? (existingApp.status || 'applied').toUpperCase() : 'NOT_APPLIED';

    return {
      jobId: job._id.toString(),
      title: job.title,
      company: job.department ? `${job.department} Team` : 'CandidateIQ Partner',
      location: job.location || 'Remote / Hybrid',
      workMode: job.employmentType || 'Full-time',
      salaryRange: job.salary?.min ? `₹${job.salary.min / 100000}L - ₹${job.salary.max / 100000}L LPA` : 'Competitive',
      requiredSkills: reqSkills,
      preferredSkills: prefSkills,
      experienceLevel: job.experienceLevel || '1-3 Years',
      matchScore: overallCompatibility,
      matchBreakdown: {
        matchedSkills,
        partialSkills,
        missingSkills,
        experienceCompatibility,
        technicalCompatibility,
        overallCompatibility
      },
      applicationStatus,
      appliedAt: existingApp?.createdAt || null,
      currentStage: existingApp?.status || null,
      postedAt: job.createdAt
    };
  });

  // Sort by highest match score
  matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

  const topMatches = matchedJobs.slice(0, 3);
  const avgMatchScore = topMatches.length > 0
    ? Math.round(topMatches.reduce((sum, j) => sum + j.matchScore, 0) / topMatches.length)
    : 0;

  return {
    marketJobMatch: {
      value: avgMatchScore,
      confidence: matchedJobs.length > 0 ? 0.88 : 0,
      dataAvailable: matchedJobs.length > 0,
      matchedJobsCount: matchedJobs.length,
      criteria: topMatches.map(j => ({
        title: j.title,
        matchScore: j.matchScore,
        matchedCount: j.matchBreakdown.matchedSkills.length
      }))
    },
    matchedJobs
  };
}

/**
 * Main Service API: Aggregate Candidate Intelligence Data
 */
async function getCandidateIntelligence(candidateId, options = {}) {
  const { forceRefresh = false } = options;

  if (!forceRefresh) {
    const existingSnapshot = await CandidateIntelligenceSnapshot.findOne({ candidate: candidateId });
    // If snapshot is recent (less than 30 mins old), return cached JSON
    if (existingSnapshot && (Date.now() - new Date(existingSnapshot.lastUpdated).getTime()) < 30 * 60 * 1000) {
      return existingSnapshot;
    }
  }

  // 1. Fetch Candidate User, Profile, Resume, Interviews
  const user = await User.findById(candidateId).select('name email role').lean();
  if (!user) {
    throw new Error('Candidate user not found');
  }

  const profile = await CandidateProfile.findOne({ user: candidateId }).lean();
  const resume = await Resume.findOne({ candidate: candidateId }).sort({ createdAt: -1 }).lean();
  const completedInterviews = await Interview.find({
    candidate: candidateId,
    status: 'completed'
  }).lean();

  // 2. Compute Resume Quality
  const resumeQuality = calculateResumeQuality(resume, profile);

  // 3. Compute Technical Skill Hierarchy
  const technicalSkillData = calculateTechnicalSkillsHierarchy(profile, resume, completedInterviews);
  const technicalScore = {
    value: technicalSkillData.value,
    confidence: technicalSkillData.confidence,
    dataAvailable: technicalSkillData.dataAvailable,
    skillsEvaluatedCount: technicalSkillData.skillsEvaluatedCount,
    criteria: technicalSkillData.criteria,
    lastVerified: technicalSkillData.lastVerified
  };

  // 4. Compute Interview & Behavioural Performance
  const { interviewScore, behaviouralScore } = calculateInterviewPerformance(completedInterviews);

  // 5. Compute Assessment Score (Placeholder if separate Assessment collection added later)
  const assessmentScore = {
    value: 0,
    confidence: 0,
    dataAvailable: false,
    criteria: []
  };

  // 6. Compute Market Job Matches
  const { marketJobMatch, matchedJobs } = await calculateMarketJobMatches(
    candidateId,
    profile,
    resume,
    technicalSkillData.skillsList
  );

  // 7. Calculate Candidate IQ Score (Weighted calculation over AVAILABLE dimensions only)
  const dimensions = [
    { name: 'Resume Quality', scoreObj: resumeQuality, weight: SCORING_CONFIG.candidateIQ.resume },
    { name: 'Technical Competency', scoreObj: technicalScore, weight: SCORING_CONFIG.candidateIQ.technical },
    { name: 'Interview Performance', scoreObj: interviewScore, weight: SCORING_CONFIG.candidateIQ.interview },
    { name: 'Behavioural Analysis', scoreObj: behaviouralScore, weight: SCORING_CONFIG.candidateIQ.behavioural },
    { name: 'Assessment Score', scoreObj: assessmentScore, weight: SCORING_CONFIG.candidateIQ.assessment }
  ];

  let availableWeightedScore = 0;
  let availableWeightSum = 0;
  let availableDimensionsCount = 0;

  dimensions.forEach(d => {
    if (d.scoreObj.dataAvailable) {
      availableWeightedScore += d.scoreObj.value * d.weight;
      availableWeightSum += d.weight;
      availableDimensionsCount++;
    }
  });

  const overallIQValue = availableWeightSum > 0
    ? Math.round(availableWeightedScore / availableWeightSum)
    : 0;

  const overallConfidence = availableDimensionsCount > 0
    ? Number((availableWeightSum * 0.95).toFixed(2))
    : 0;

  const overallStatus = availableDimensionsCount >= 1 ? 'calculated' : 'insufficient_data';

  // Strict Compliance: Never display percentile unless population comparison exists
  const percentileText = availableDimensionsCount >= 3
    ? 'Established against platform baseline'
    : 'Percentile unavailable — Complete more dimensions to benchmark';

  const overallScore = {
    value: overallIQValue,
    max: 100,
    confidence: overallConfidence,
    status: overallStatus,
    dimensionsEvaluated: availableDimensionsCount,
    totalDimensions: dimensions.length,
    percentileText,
    breakdown: dimensions.map(d => ({
      name: d.name,
      value: d.scoreObj.value,
      weight: d.weight,
      dataAvailable: d.scoreObj.dataAvailable
    }))
  };

  // 8. Compute Data Completeness
  const missingSources = [];
  if (!resumeQuality.dataAvailable) missingSources.push('Resume');
  if (!interviewScore.dataAvailable) missingSources.push('Mock Interview');
  if (!assessmentScore.dataAvailable) missingSources.push('Assessment');

  const dataCompleteness = {
    percentage: Math.round((availableDimensionsCount / dimensions.length) * 100),
    hasResume: resumeQuality.dataAvailable,
    hasProfile: !!profile,
    hasAssessments: assessmentScore.dataAvailable,
    hasMockInterviews: interviewScore.dataAvailable,
    hasActualInterviews: completedInterviews.some(i => i.interviewCategory === 'actual'),
    missingSources
  };

  const payload = {
    candidate: candidateId,
    overallScore,
    resumeQuality,
    technicalScore,
    marketJobMatch,
    interviewScore,
    behaviouralScore,
    technicalSkills: technicalSkillData.skillsList,
    matchedJobs,
    dataCompleteness,
    formulaVersion: SCORING_CONFIG.formulaVersion,
    sourceRecords: [
      profile ? `profile_${profile._id}` : null,
      resume ? `resume_${resume._id}` : null,
      ...completedInterviews.map(i => `interview_${i._id}`)
    ].filter(Boolean),
    lastUpdated: new Date()
  };

  // Upsert snapshot document into MongoDB
  const snapshot = await CandidateIntelligenceSnapshot.findOneAndUpdate(
    { candidate: candidateId },
    payload,
    { upsert: true, new: true, runValidators: true }
  );

  return snapshot;
}

module.exports = {
  getCandidateIntelligence,
  calculateResumeQuality,
  calculateTechnicalSkillsHierarchy,
  calculateMarketJobMatches
};
