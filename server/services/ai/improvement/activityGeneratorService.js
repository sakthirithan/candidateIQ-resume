const aiOrchestrator = require('../../../ai/orchestrator/aiOrchestrator');

/**
 * Helper: Extract transcript filler words deterministically from candidate responses
 */
function calculateTranscriptFillers(interview) {
  const fillerRegex = /\b(um|uh|like|actually|basically|you know|literally|so|right)\b/gi;
  let totalFillers = 0;
  let totalWords = 0;
  let totalSeconds = 0;

  const voiceQuestions = interview.mock_interview_questions?.voice || [];
  const textQuestions = interview.mock_interview_questions?.text || [];
  const flatQuestions = interview.questions || [];

  const allResponses = [
    ...voiceQuestions.map(v => ({ text: v.transcript || v.userAnswer || v.answer || '', duration: v.durationSeconds || 60 })),
    ...textQuestions.map(t => ({ text: t.userAnswer || t.answer || '', duration: 60 })),
    ...flatQuestions.map(f => ({ text: f.candidateResponse || f.voiceMeta?.transcript || '', duration: f.voiceMeta?.durationSeconds || 60 }))
  ];

  allResponses.forEach(r => {
    if (!r.text) return;
    const matches = r.text.match(fillerRegex);
    if (matches) totalFillers += matches.length;
    const words = r.text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    totalSeconds += r.duration || 60;
  });

  const minutes = Math.max(1, totalSeconds / 60);
  const normalizedFillersPer2Min = Math.round((totalFillers / minutes) * 2);
  const wordsPerMinute = Math.round((totalWords / totalSeconds) * 60) || 120;

  return {
    rawFillerCount: totalFillers,
    normalizedFillersPer2Min,
    totalWords,
    wordsPerMinute
  };
}

/**
 * Generate 3-5 prioritized Improvement Activities from a completed Mock Interview
 */
async function generateActivitiesForInterview(interview) {
  const evaluation = interview.evaluation || interview.overallEvaluation || {};
  const speechStats = calculateTranscriptFillers(interview);

  const candidateSkills = interview.sourceSnapshot?.resume?.skills || [];
  const jobTitle = interview.jobTitle || interview.sourceSnapshot?.job?.title || 'Software Engineer';
  const overallScore = evaluation.overallScore ?? evaluation.overallInterviewScore ?? 65;
  const techScore = evaluation.technicalScore ?? evaluation.technicalProficiency ?? 65;
  const commScore = evaluation.communicationScore ?? evaluation.communicationClarity ?? 60;
  const behavScore = evaluation.behaviouralScore ?? evaluation.behaviouralCompetency ?? 70;

  const activities = [];

  // 1. Communication Activity: Filler Words Control (If fillers > 5 per 2 min or comm score < 75)
  if (speechStats.normalizedFillersPer2Min > 5 || commScore < 70) {
    const currentVal = Math.max(speechStats.normalizedFillersPer2Min, 8);
    activities.push({
      category: 'communication',
      skill: 'filler_words',
      title: 'Reduce Vocalized Filler Words',
      detectedIssue: `Candidate used approximately ${currentVal} filler words ("um", "uh", "like", "basically") per 2-minute response window.`,
      rootCause: 'Speaking rapidly without utilizing strategic pauses to organize thoughts.',
      solutionDescription: 'Replace filler words with controlled 1-2 second pauses. Pause at sentence boundaries rather than vocalizing hesitation.',
      recommendedFramework: 'CONTROLLED_PAUSE',
      practiceType: 'voice',
      durationMinutes: 5,
      priority: currentVal > 10 ? 'HIGH' : 'MEDIUM',
      targetMetricName: 'fillerWordCount',
      unit: 'fillers / 2 min',
      comparisonOperator: '<=',
      baselineValue: currentVal,
      targetValue: 5
    });
  }

  // 2. Communication Activity: Answer Structure & Clarity (P-E-E Framework)
  if (commScore < 75 || evaluation.improvements?.some(i => /clarity|structure|explanation/i.test(i))) {
    activities.push({
      category: 'communication',
      skill: 'answer_clarity',
      title: 'Improve Technical Answer Clarity',
      detectedIssue: `Communication clarity score is ${commScore}/100. Explanations lacked structured flow and explicit example backing.`,
      rootCause: 'Jumping directly into implementation details without defining the core thesis first.',
      solutionDescription: 'Structure responses using the P-E-E Framework: State the main Point, provide the technical Explanation, and illustrate with a practical Example.',
      recommendedFramework: 'PEE',
      practiceType: 'voice',
      durationMinutes: 5,
      priority: commScore < 60 ? 'HIGH' : 'MEDIUM',
      targetMetricName: 'clarityScore',
      unit: 'score (0-100)',
      comparisonOperator: '>=',
      baselineValue: commScore,
      targetValue: 75
    });
  }

  // 3. Technical Activity: Concept & Trade-off Depth (C-E-E-T Framework)
  if (techScore < 80 || evaluation.improvements?.length > 0) {
    const weakTopic = evaluation.improvements?.[0] || candidateSkills[0] || 'Core Architecture';
    activities.push({
      category: 'technical',
      skill: 'technical_depth',
      title: `Deepen Technical Reasoning (${weakTopic})`,
      detectedIssue: `Technical proficiency score is ${techScore}/100. Responses lacked internal mechanism explanations and trade-off comparisons.`,
      rootCause: 'Focusing on high-level definitions without detailing memory, asymptotic complexity, or scaling trade-offs.',
      solutionDescription: 'Apply the C-E-E-T Framework: Explain Concept -> Mechanism -> Real-world Example -> Engineering Trade-off.',
      recommendedFramework: 'CEET',
      practiceType: 'voice',
      durationMinutes: 5,
      priority: techScore < 65 ? 'HIGH' : 'MEDIUM',
      targetMetricName: 'technicalScore',
      unit: 'score (0-100)',
      comparisonOperator: '>=',
      baselineValue: techScore,
      targetValue: Math.max(75, Math.min(90, techScore + 15))
    });
  }

  // 4. Behavioral Activity: STAR Framework Execution
  if (behavScore < 75 || activities.length < 3) {
    activities.push({
      category: 'behavioral',
      skill: 'star_response',
      title: 'Master STAR Behavioral Response Structure',
      detectedIssue: `Behavioral competency score is ${behavScore}/100. Responses missed explicit Action steps and quantifiable Result metrics.`,
      rootCause: 'Describing general team actions ("we did") rather than personal individual ownership ("I implemented").',
      solutionDescription: 'Deliver structured stories using STAR: Situation -> Task -> Action (I-focused) -> Quantified Result.',
      recommendedFramework: 'STAR',
      practiceType: 'voice',
      durationMinutes: 5,
      priority: 'MEDIUM',
      targetMetricName: 'starScore',
      unit: 'score (0-100)',
      comparisonOperator: '>=',
      baselineValue: behavScore,
      targetValue: 75
    });
  }

  // 5. Speaking Pace Activity (WPM)
  if (speechStats.wordsPerMinute < 100 || speechStats.wordsPerMinute > 170) {
    activities.push({
      category: 'communication',
      skill: 'speaking_pace',
      title: 'Optimize Cadence and Speaking Pace',
      detectedIssue: `Speaking pace is ${speechStats.wordsPerMinute} WPM. Optimal technical articulation cadence is 120-150 WPM.`,
      rootCause: speechStats.wordsPerMinute < 100 ? 'Hesitation during speech generation.' : 'Speaking too fast under pressure.',
      solutionDescription: 'Pace your cadence to ~130 WPM using steady breath control and clear articulation.',
      recommendedFramework: 'CONTROLLED_PAUSE',
      practiceType: 'voice',
      durationMinutes: 3,
      priority: 'LOW',
      targetMetricName: 'wordsPerMinute',
      unit: 'WPM',
      comparisonOperator: '>=',
      baselineValue: speechStats.wordsPerMinute,
      targetValue: 130
    });
  }

  // 6. High Performing Candidate Reinforcement Activity
  if (overallScore >= 85 || activities.length === 0) {
    activities.push({
      category: 'technical',
      skill: 'advanced_architecture',
      title: `Advanced ${jobTitle} System Architecture Mastery`,
      detectedIssue: `Strong overall performance (${overallScore}/100) demonstrated across evaluation dimensions.`,
      rootCause: 'High core competency achieved. Practice focused on senior architectural trade-offs and resilience.',
      solutionDescription: 'Apply the C-E-E-T Framework to explain multi-region database replication, caching invalidation, and zero-downtime deployment pipelines.',
      recommendedFramework: 'CEET',
      practiceType: 'voice',
      durationMinutes: 5,
      priority: 'LOW',
      targetMetricName: 'technicalScore',
      unit: 'score (0-100)',
      comparisonOperator: '>=',
      baselineValue: techScore,
      targetValue: Math.min(100, techScore + 10)
    });
  }

  // Cap activities between 3 and 5
  return activities.slice(0, 5);
}

module.exports = {
  calculateTranscriptFillers,
  generateActivitiesForInterview
};
