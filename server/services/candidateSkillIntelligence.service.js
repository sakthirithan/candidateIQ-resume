const CandidateProfile = require('../models/CandidateProfile');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const SCORING_CONFIG = require('../config/candidateIntelligenceConfig');

/**
 * Normalize skill name to canonical standard
 */
function normalizeSkillName(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  const clean = rawName.trim();
  const lower = clean.toLowerCase();

  if (SCORING_CONFIG.canonicalSkills[lower]) {
    return SCORING_CONFIG.canonicalSkills[lower];
  }
  // Title-case capitalization for unknown skills
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Determine category for skill
 */
function getSkillCategory(canonicalName) {
  if (SCORING_CONFIG.skillCategories[canonicalName]) {
    return SCORING_CONFIG.skillCategories[canonicalName];
  }
  const lower = canonicalName.toLowerCase();
  if (lower.includes('css') || lower.includes('ui') || lower.includes('web') || lower.includes('frontend')) return 'Frontend';
  if (lower.includes('api') || lower.includes('server') || lower.includes('microservice') || lower.includes('backend')) return 'Backend';
  if (lower.includes('sql') || lower.includes('db') || lower.includes('data')) return 'Database';
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('gpt') || lower.includes('model') || lower.includes('neural')) return 'AI/ML';
  if (lower.includes('cloud') || lower.includes('serverless') || lower.includes('deploy')) return 'Cloud';
  if (lower.includes('docker') || lower.includes('ci') || lower.includes('pipe')) return 'DevOps';
  return 'Programming';
}

/**
 * Determine proficiency level considering score and evidence confidence
 */
function determineProficiency(score, confidence) {
  const { proficiency } = SCORING_CONFIG;
  let level = proficiency.beginner.label;

  if (score >= proficiency.expert.min) level = proficiency.expert.label;
  else if (score >= proficiency.advanced.min) level = proficiency.advanced.label;
  else if (score >= proficiency.intermediate.min) level = proficiency.intermediate.label;
  else if (score >= proficiency.foundational.min) level = proficiency.foundational.label;

  if (confidence < 0.35 && score >= 70) {
    return `${level} (Low Confidence)`;
  }
  return level;
}

/**
 * Main Candidate Skill Intelligence Service Method
 */
async function getCandidateSkillMatrix(candidateId) {
  const user = await User.findById(candidateId).lean();
  if (!user) {
    throw new Error('Candidate user not found');
  }

  const profile = await CandidateProfile.findOne({ user: candidateId }).lean();
  const resume = await Resume.findOne({ candidate: candidateId }).sort({ createdAt: -1 }).lean();
  const completedInterviews = await Interview.find({
    candidate: candidateId,
    status: 'completed'
  }).lean();

  const skillEvidenceMap = new Map();

  const getOrCreateSkillRecord = (rawName) => {
    const canonicalName = normalizeSkillName(rawName);
    if (!canonicalName) return null;

    if (!skillEvidenceMap.has(canonicalName)) {
      skillEvidenceMap.set(canonicalName, {
        skillId: canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: canonicalName,
        category: getSkillCategory(canonicalName),
        sources: {
          resume: false,
          projects: [],
          certifications: [],
          assessments: [],
          mockInterviews: [],
          actualInterviews: []
        },
        verifiedAt: new Date()
      });
    }
    return skillEvidenceMap.get(canonicalName);
  };

  // 1. Ingest Resume & Profile Skills (CLAIMED)
  if (profile?.skills) {
    ['technical', 'frameworks', 'databases', 'tools', 'soft'].forEach(group => {
      (profile.skills[group] || []).forEach(s => {
        const record = getOrCreateSkillRecord(s);
        if (record) record.sources.resume = true;
      });
    });
  }

  if (resume?.keywords) {
    resume.keywords.forEach(k => {
      const record = getOrCreateSkillRecord(k);
      if (record) record.sources.resume = true;
    });
  }

  // 2. Ingest Candidate Projects (PROJECT_EVIDENCE)
  const projects = profile?.projects || [];
  projects.forEach(proj => {
    const techUsed = proj.technologies || [];
    techUsed.forEach(t => {
      const record = getOrCreateSkillRecord(t);
      if (record) {
        record.sources.projects.push({
          name: proj.title || proj.name || 'Project',
          description: proj.description || ''
        });
      }
    });
  });

  // 3. Ingest Certifications (CERTIFICATION)
  const certs = profile?.certifications || [];
  certs.forEach(c => {
    const certName = c.name || c.title || '';
    const record = getOrCreateSkillRecord(certName);
    if (record) {
      record.sources.certifications.push({
        name: certName,
        issuer: c.issuer || c.organization || 'Verified Issuer'
      });
    }
  });

  // 4. Ingest Evaluated Interview Questions (DEMONSTRATED & VERIFIED)
  completedInterviews.forEach(interview => {
    const isActual = interview.interviewCategory === 'actual';

    const questions = [
      ...(interview.mock_interview_questions?.mcq || []),
      ...(interview.mock_interview_questions?.voice || []),
      ...(interview.mock_interview_questions?.text || []),
      ...(interview.questions || [])
    ];

    questions.forEach(q => {
      const targetSkill = q.targetSkill || (Array.isArray(q.expectedSkills) ? q.expectedSkills[0] : null);
      if (!targetSkill) return;

      const record = getOrCreateSkillRecord(targetSkill);
      if (record && q.evaluation) {
        const scoreVal = q.evaluation.technicalScore !== undefined
          ? q.evaluation.technicalScore * 10
          : q.evaluation.overallScore || q.evaluation.score || 75;

        const evidenceItem = {
          interviewId: interview._id.toString(),
          jobTitle: interview.jobTitle || 'AI Mock Session',
          question: q.question || q.questionText || '',
          score: Math.min(100, Math.max(0, Number(scoreVal))),
          feedback: q.evaluation.feedback || q.evaluation.summaryExplanation || 'Demonstrated answer evaluated by CandidateIQ AI'
        };

        if (isActual) {
          record.sources.actualInterviews.push(evidenceItem);
        } else {
          record.sources.mockInterviews.push(evidenceItem);
        }
      }
    });
  });

  // Calculate Weighted Skill Scores & Confidence for each normalized skill
  const skillList = [];
  const weights = SCORING_CONFIG.skillEvidenceWeights;

  skillEvidenceMap.forEach(record => {
    let availableWeightedScore = 0;
    let availableWeightSum = 0;
    let confidenceSum = 0;
    const activeSources = [];

    // Source 1: Resume (Weight 0.10, Confidence 0.20)
    if (record.sources.resume) {
      const score = 70; // Self-declared baseline
      availableWeightedScore += score * weights.resume;
      availableWeightSum += weights.resume;
      confidenceSum += 0.20;
      activeSources.push('resume');
    }

    // Source 2: Projects (Weight 0.15, Confidence 0.25)
    if (record.sources.projects.length > 0) {
      const projCount = record.sources.projects.length;
      const score = Math.min(100, 75 + (projCount * 10));
      availableWeightedScore += score * weights.project;
      availableWeightSum += weights.project;
      confidenceSum += 0.25;
      activeSources.push('projects');
    }

    // Source 3: Certifications (Weight 0.10, Confidence 0.20)
    if (record.sources.certifications.length > 0) {
      const score = 88;
      availableWeightedScore += score * weights.certification;
      availableWeightSum += weights.certification;
      confidenceSum += 0.20;
      activeSources.push('certifications');
    }

    // Source 5: Mock Interviews (Weight 0.25, Confidence 0.35)
    if (record.sources.mockInterviews.length > 0) {
      const avgMockScore = Math.round(
        record.sources.mockInterviews.reduce((sum, item) => sum + item.score, 0) / record.sources.mockInterviews.length
      );
      availableWeightedScore += avgMockScore * weights.mockInterview;
      availableWeightSum += weights.mockInterview;
      confidenceSum += 0.35;
      activeSources.push('mock_interview');
    }

    // Source 6: Actual Interviews (Weight 0.15, Confidence 0.30)
    if (record.sources.actualInterviews.length > 0) {
      const avgActualScore = Math.round(
        record.sources.actualInterviews.reduce((sum, item) => sum + item.score, 0) / record.sources.actualInterviews.length
      );
      availableWeightedScore += avgActualScore * weights.actualInterview;
      availableWeightSum += weights.actualInterview;
      confidenceSum += 0.30;
      activeSources.push('actual_interview');
    }

    const calculatedScore = availableWeightSum > 0
      ? Math.round(availableWeightedScore / availableWeightSum)
      : 70;

    const confidenceVal = Number(Math.min(0.99, confidenceSum).toFixed(2));

    // Determine Evidence Level
    let evidenceLevel = 'CLAIMED';
    if (confidenceVal >= 0.70 && activeSources.length >= 2) {
      evidenceLevel = 'VERIFIED';
    } else if (record.sources.mockInterviews.length > 0 || record.sources.actualInterviews.length > 0) {
      evidenceLevel = 'DEMONSTRATED';
    } else if (record.sources.projects.length > 0) {
      evidenceLevel = 'PROJECT_EVIDENCE';
    }

    skillList.push({
      skillId: record.skillId,
      name: record.name,
      category: record.category,
      score: calculatedScore,
      confidence: Math.round(confidenceVal * 100),
      confidenceRaw: confidenceVal,
      proficiencyLevel: determineProficiency(calculatedScore, confidenceVal),
      evidenceLevel,
      evidenceSources: activeSources,
      evidenceDetails: {
        resume: record.sources.resume,
        projectCount: record.sources.projects.length,
        certificationCount: record.sources.certifications.length,
        mockInterviewsEvaluated: record.sources.mockInterviews.length,
        actualInterviewsEvaluated: record.sources.actualInterviews.length,
        sampleMockQuestion: record.sources.mockInterviews[0] || null
      },
      lastEvaluatedAt: record.verifiedAt
    });
  });

  // Sort by highest verified score & confidence
  skillList.sort((a, b) => (b.confidenceRaw * b.score) - (a.confidenceRaw * a.score));

  // Skill Gap Analysis against target role and active requisitions
  const targetRole = profile?.personalInfo?.headline || 'Full Stack MERN Developer';
  const activeJobs = await Job.find({ status: 'published' }).lean();

  const allJobRequiredSkills = new Set();
  activeJobs.forEach(job => {
    (job.requiredSkills || []).forEach(s => {
      const canonical = normalizeSkillName(s);
      if (canonical) allJobRequiredSkills.add(canonical);
    });
  });

  // Default required skills if database has few published jobs
  if (allJobRequiredSkills.size === 0) {
    ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'Docker', 'AWS Cloud'].forEach(s => allJobRequiredSkills.add(s));
  }

  const strongSkills = [];
  const developingSkills = [];
  const missingSkills = [];

  const candidateSkillMap = new Map();
  skillList.forEach(s => candidateSkillMap.set(s.name, s));

  allJobRequiredSkills.forEach(reqSkill => {
    const candidateSkill = candidateSkillMap.get(reqSkill);
    if (candidateSkill) {
      if (candidateSkill.score >= 75 && candidateSkill.confidence >= 50) {
        strongSkills.push(candidateSkill.name);
      } else {
        developingSkills.push(candidateSkill.name);
      }
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Distinct category list
  const categoriesSet = new Set(['All', 'Frontend', 'Backend', 'Database', 'Programming', 'Cloud', 'DevOps', 'AI/ML', 'Tools', 'Soft Skills']);
  skillList.forEach(s => categoriesSet.add(s.category));

  return {
    candidateId,
    skills: skillList,
    categories: Array.from(categoriesSet),
    skillGapAnalysis: {
      targetRole,
      strongSkills,
      developingSkills,
      missingSkills
    },
    summaryMetrics: {
      totalSkills: skillList.length,
      verifiedSkillsCount: skillList.filter(s => s.evidenceLevel === 'VERIFIED').length,
      demonstratedSkillsCount: skillList.filter(s => s.evidenceLevel === 'DEMONSTRATED' || s.evidenceLevel === 'VERIFIED').length,
      claimedOnlyCount: skillList.filter(s => s.evidenceLevel === 'CLAIMED').length,
      averageConfidence: skillList.length > 0
        ? Math.round(skillList.reduce((acc, s) => acc + s.confidence, 0) / skillList.length)
        : 0
    },
    lastEvaluatedAt: new Date()
  };
}

module.exports = {
  getCandidateSkillMatrix,
  normalizeSkillName,
  getSkillCategory
};
