const Interview = require('../models/Interview');
const ImprovementActivity = require('../models/ImprovementActivity');
const User = require('../models/User');

/**
 * Service to aggregate dynamic Candidate Interview Journey & longitudinal progression analytics
 * Calculates performance memory strictly from persisted database records.
 */
async function getCandidateInterviewJourney(candidateId) {
  const user = await User.findById(candidateId).select('name email role').lean();
  if (!user) {
    throw new Error('Candidate user not found');
  }

  // Fetch all interviews associated with candidate
  const interviews = await Interview.find({
    $or: [
      { candidate: candidateId },
      { candidateIdString: candidateId.toString() }
    ]
  }).sort({ createdAt: 1 }).lean();

  // Also fetch user's Improvement Activities to connect weak competencies to activities
  const userActivities = await ImprovementActivity.find({ userId: candidateId }).lean();

  const canonicalCompetencies = [
    { id: 'technical_knowledge', name: 'Technical Knowledge', category: 'Technical', targetScore: 85 },
    { id: 'answer_quality', name: 'Answer Quality & Relevance', category: 'Technical', targetScore: 85 },
    { id: 'concept_explanation', name: 'Concept Explanation', category: 'Technical', targetScore: 80 },
    { id: 'problem_solving', name: 'Problem Solving', category: 'Technical', targetScore: 85 },
    { id: 'communication', name: 'Communication', category: 'Communication', targetScore: 80 },
    { id: 'fluency_pacing', name: 'Fluency & Pacing', category: 'Communication', targetScore: 80 },
    { id: 'answer_structure', name: 'Answer Structure', category: 'Communication', targetScore: 80 },
    { id: 'conciseness', name: 'Conciseness', category: 'Communication', targetScore: 75 }
  ];

  if (!interviews || interviews.length === 0) {
    return {
      candidateId,
      hasInterviews: false,
      interviews: [],
      overview: {
        currentScore: 0,
        initialScore: 0,
        improvement: 0,
        totalInterviews: 0,
        totalAttempts: 0,
        strongestArea: null,
        needsMostImprovement: null
      },
      overallTrend: [],
      competencySummary: canonicalCompetencies.map(c => ({
        ...c,
        initialScore: 0,
        currentScore: 0,
        bestScore: 0,
        averageScore: 0,
        improvement: 0,
        trend: 'stable',
        attemptCount: 0,
        progressPercentage: 0
      })),
      competencyTrends: {},
      biggestImprovements: [],
      areasNeedingAttention: [],
      timeline: [],
      interviewHistory: []
    };
  }

  // Helper to extract question-level section averages safely
  const calculateQuestionScoreAvg = (inv, metricKey) => {
    const allQuestions = [
      ...(inv.mock_interview_questions?.mcq || []),
      ...(inv.mock_interview_questions?.voice || []),
      ...(inv.mock_interview_questions?.text || []),
      ...(inv.questions || [])
    ];
    const evaluated = allQuestions.filter(q => q.evaluation && typeof q.evaluation[metricKey] === 'number');
    if (evaluated.length === 0) return null;
    const sum = evaluated.reduce((acc, q) => acc + q.evaluation[metricKey], 0);
    return Math.round(sum / evaluated.length);
  };

  // Process completed interview attempts chronologically
  const attemptRecords = [];

  interviews.forEach((inv, invIdx) => {
    const isCompleted = inv.status === 'completed' || inv.completedAt || inv.overallEvaluation || inv.evaluation;
    if (!isCompleted) return;

    const overallEval = inv.overallEvaluation || {};
    const evalObj = inv.evaluation || {};
    const eng = inv.englishLanguageAnalysis || {};

    // Sanitize raw score values (prevent invalid negative numbers like -2)
    const sanitizeScore = (val) => {
      if (val === undefined || val === null || isNaN(val)) return null;
      const num = Number(val);
      if (num < 0) return 0;
      if (num > 100) return 100;
      return Math.round(num);
    };

    // Extract Overall score
    let rawOverall = overallEval.overallInterviewScore ?? evalObj.overallScore;
    if (rawOverall === undefined || rawOverall === null) {
      // Derive average from questions
      const qScores = [
        ...(inv.mock_interview_questions?.mcq || []).map(q => q.userAnswer === q.correctAnswer ? 100 : 0),
        ...(inv.mock_interview_questions?.voice || []).map(q => q.evaluation?.overallScore ?? q.evaluation?.technicalScore ?? 0),
        ...(inv.mock_interview_questions?.text || []).map(q => q.evaluation?.overallScore ?? q.evaluation?.technicalScore ?? 0)
      ];
      if (qScores.length > 0) {
        rawOverall = Math.round(qScores.reduce((a, b) => a + b, 0) / qScores.length);
      } else {
        rawOverall = 0;
      }
    }
    const overallScore = sanitizeScore(rawOverall) ?? 0;

    // Extract sub-competencies
    const techProf = sanitizeScore(overallEval.technicalProficiency ?? evalObj.technicalScore ?? calculateQuestionScoreAvg(inv, 'technicalScore'));
    const commClarity = sanitizeScore(overallEval.communicationClarity ?? evalObj.communicationScore ?? calculateQuestionScoreAvg(inv, 'communicationScore'));
    const behavComp = sanitizeScore(overallEval.behaviouralCompetency ?? evalObj.behaviouralScore ?? calculateQuestionScoreAvg(inv, 'relevanceScore'));
    const probSolve = sanitizeScore(overallEval.problemSolvingRating ?? calculateQuestionScoreAvg(inv, 'problemSolvingScore'));
    const depth = sanitizeScore(calculateQuestionScoreAvg(inv, 'depthScore') ?? techProf);
    const fluency = sanitizeScore(eng.fluencyScore ?? commClarity);
    const structure = sanitizeScore(eng.coherenceScore ?? eng.grammarScore ?? commClarity);
    const conciseness = sanitizeScore(eng.clarityScore ?? eng.vocabularyScore ?? commClarity);

    const scoresMap = {
      technical_knowledge: techProf ?? overallScore,
      answer_quality: behavComp ?? overallScore,
      concept_explanation: depth ?? overallScore,
      problem_solving: probSolve ?? overallScore,
      communication: commClarity ?? overallScore,
      fluency_pacing: fluency ?? commClarity ?? overallScore,
      answer_structure: structure ?? commClarity ?? overallScore,
      conciseness: conciseness ?? commClarity ?? overallScore
    };

    const completedDate = inv.completedAt || inv.startedAt || inv.updatedAt || inv.createdAt;

    attemptRecords.push({
      attemptIndex: attemptRecords.length + 1,
      interviewId: inv._id.toString(),
      jobTitle: inv.jobTitle || 'AI Mock Technical Interview',
      interviewType: inv.interviewType || 'mixed',
      difficulty: inv.difficulty || 'Mid-Level',
      completedAt: completedDate,
      dateFormatted: new Date(completedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      overallScore,
      scoresMap,
      topStrengths: overallEval.topStrengths || evalObj.strengths || [],
      improvements: overallEval.recommendedImprovementAreas || evalObj.improvements || []
    });
  });

  if (attemptRecords.length === 0) {
    return {
      candidateId,
      hasInterviews: true,
      interviews: interviews.map(i => ({
        interviewId: i._id.toString(),
        title: i.jobTitle || 'AI Mock Interview',
        status: i.status,
        createdAt: i.createdAt
      })),
      overview: {
        currentScore: 0,
        initialScore: 0,
        improvement: 0,
        totalInterviews: interviews.length,
        totalAttempts: 0,
        strongestArea: null,
        needsMostImprovement: null
      },
      overallTrend: [],
      competencySummary: canonicalCompetencies.map(c => ({
        ...c,
        initialScore: 0,
        currentScore: 0,
        bestScore: 0,
        averageScore: 0,
        improvement: 0,
        trend: 'stable',
        attemptCount: 0,
        progressPercentage: 0
      })),
      competencyTrends: {},
      biggestImprovements: [],
      areasNeedingAttention: [],
      timeline: [],
      interviewHistory: []
    };
  }

  // 1. Overall Trend
  const overallTrend = attemptRecords.map(att => ({
    attemptNumber: att.attemptIndex,
    interviewId: att.interviewId,
    title: att.jobTitle,
    date: att.dateFormatted,
    rawDate: att.completedAt,
    overallScore: att.overallScore,
    ...att.scoresMap
  }));

  // 2. Competency Summaries & Trends
  const competencyTrends = {};
  canonicalCompetencies.forEach(c => {
    competencyTrends[c.id] = attemptRecords.map(att => ({
      attemptNumber: att.attemptIndex,
      date: att.dateFormatted,
      score: att.scoresMap[c.id] ?? null
    }));
  });

  const competencySummary = canonicalCompetencies.map(comp => {
    const validScores = attemptRecords
      .map(att => att.scoresMap[comp.id])
      .filter(val => typeof val === 'number' && !isNaN(val));

    if (validScores.length === 0) {
      return {
        ...comp,
        initialScore: 0,
        currentScore: 0,
        bestScore: 0,
        averageScore: 0,
        improvement: 0,
        trend: 'stable',
        attemptCount: 0,
        progressPercentage: 0
      };
    }

    const initialScore = validScores[0];
    const currentScore = validScores[validScores.length - 1];
    const bestScore = Math.max(...validScores);
    const averageScore = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    const improvement = currentScore - initialScore;
    const trend = improvement > 2 ? 'improving' : improvement < -2 ? 'declining' : 'stable';
    const progressPercentage = Math.min(100, Math.round((currentScore / comp.targetScore) * 100));

    return {
      ...comp,
      initialScore,
      currentScore,
      bestScore,
      averageScore,
      improvement,
      trend,
      attemptCount: validScores.length,
      progressPercentage
    };
  });

  // Overview metrics
  const firstAttempt = attemptRecords[0];
  const latestAttempt = attemptRecords[attemptRecords.length - 1];
  const overallImprovement = latestAttempt.overallScore - firstAttempt.overallScore;

  // Find strongest and weakest competency
  const sortedByCurrent = [...competencySummary].sort((a, b) => b.currentScore - a.currentScore);
  const strongestArea = sortedByCurrent[0] || null;
  const weakestArea = sortedByCurrent[sortedByCurrent.length - 1] || null;

  // Biggest Improvements
  const biggestImprovements = [...competencySummary]
    .filter(c => c.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement);

  // Areas Needing Attention (currentScore < targetScore or gap > 0)
  const areasNeedingAttention = [...competencySummary]
    .filter(c => c.currentScore < c.targetScore)
    .map(c => {
      const gap = c.targetScore - c.currentScore;

      // Link to existing ImprovementActivity if present
      const matchingActivity = userActivities.find(act =>
        act.category?.toLowerCase() === c.category.toLowerCase() ||
        act.title?.toLowerCase().includes(c.name.toLowerCase()) ||
        act.skill?.toLowerCase().includes(c.name.toLowerCase())
      );

      return {
        ...c,
        gap,
        activityId: matchingActivity ? matchingActivity._id.toString() : null,
        activityStatus: matchingActivity ? matchingActivity.status : null
      };
    })
    .sort((a, b) => b.gap - a.gap);

  // Timeline progression
  const timeline = attemptRecords.map((att, idx) => {
    const prevScore = idx > 0 ? attemptRecords[idx - 1].overallScore : null;
    const delta = prevScore !== null ? att.overallScore - prevScore : 0;
    return {
      attemptNumber: att.attemptIndex,
      interviewId: att.interviewId,
      title: att.jobTitle,
      date: att.dateFormatted,
      score: att.overallScore,
      delta,
      milestoneNote: idx === 0 ? 'First baseline attempt' : delta >= 0 ? `+${delta} points improvement` : `${delta} score adjustment`
    };
  });

  // Comparison Table
  const interviewHistory = attemptRecords.map((att, idx) => {
    const prevScore = idx > 0 ? attemptRecords[idx - 1].overallScore : null;
    const delta = prevScore !== null ? att.overallScore - prevScore : 0;
    return {
      attemptNumber: att.attemptIndex,
      interviewId: att.interviewId,
      title: att.jobTitle,
      date: att.dateFormatted,
      overallScore: att.overallScore,
      technical_knowledge: att.scoresMap.technical_knowledge,
      communication: att.scoresMap.communication,
      problem_solving: att.scoresMap.problem_solving,
      answer_quality: att.scoresMap.answer_quality,
      delta
    };
  });

  return {
    candidateId,
    hasInterviews: true,
    interviews: interviews.map(i => ({
      interviewId: i._id.toString(),
      title: i.jobTitle || 'AI Mock Technical Interview',
      status: i.status,
      completedAt: i.completedAt || i.updatedAt
    })),
    overview: {
      currentScore: latestAttempt.overallScore,
      initialScore: firstAttempt.overallScore,
      improvement: overallImprovement,
      totalInterviews: interviews.length,
      totalAttempts: attemptRecords.length,
      strongestArea: strongestArea ? { name: strongestArea.name, score: strongestArea.currentScore } : null,
      needsMostImprovement: weakestArea ? { name: weakestArea.name, score: weakestArea.currentScore, gap: weakestArea.targetScore - weakestArea.currentScore } : null
    },
    overallTrend,
    competencySummary,
    competencyTrends,
    biggestImprovements,
    areasNeedingAttention,
    timeline,
    interviewHistory
  };
}

/**
 * Service to get single interview detailed evaluation by ID
 */
async function getInterviewDetailById(candidateId, interviewId) {
  const interview = await Interview.findById(interviewId).lean();
  if (!interview) {
    throw new Error('Interview record not found');
  }

  // Security check: Candidate must own this interview
  if (interview.candidate?.toString() !== candidateId.toString() && interview.candidateIdString !== candidateId.toString()) {
    throw new Error('Unauthorized access to interview record');
  }

  return interview;
}

module.exports = {
  getCandidateInterviewJourney,
  getInterviewDetailById
};
