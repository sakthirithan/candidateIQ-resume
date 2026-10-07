const aiOrchestrator = require('../../../ai/orchestrator/aiOrchestrator');

/**
 * Deterministically count filler words from transcript text
 */
function extractFillerWords(text) {
  if (!text || typeof text !== 'string') return { count: 0, matches: [] };
  const fillerPattern = /\b(um|uh|like|actually|basically|you know|literally|so|right)\b/gi;
  const matches = text.match(fillerPattern) || [];
  return {
    count: matches.length,
    matches
  };
}

/**
 * Deterministically compute speech metrics
 */
function computeSpeechMetrics(responses) {
  let totalFillers = 0;
  let totalWords = 0;
  let totalSeconds = 0;

  responses.forEach(r => {
    const text = r.rawTranscript || r.textAnswer || '';
    const fillers = extractFillerWords(text);
    totalFillers += fillers.count;

    const words = text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    totalSeconds += (r.durationSeconds || 60);
  });

  const durationMin = Math.max(1, totalSeconds / 60);
  const normalizedFillersPer2Min = Math.round((totalFillers / durationMin) * 2);
  const wpm = Math.round((totalWords / Math.max(10, totalSeconds)) * 60) || 120;

  return {
    fillerWordCount: normalizedFillersPer2Min,
    rawFillerCount: totalFillers,
    wordsPerMinute: wpm,
    wordCount: totalWords,
    durationSeconds: totalSeconds
  };
}

/**
 * Evaluate Practice Attempt against Activity Target
 */
async function evaluatePracticeSession({ activity, practiceSession, responses }) {
  const speechMetrics = computeSpeechMetrics(responses);
  const combinedTranscript = responses.map(r => r.rawTranscript || r.textAnswer || '').join('\n\n');

  let clarityScore = 70;
  let structureScore = 70;
  let technicalScore = 70;
  let starScore = 70;
  let feedbackText = '';

  // Use AI Evaluator to assess clarity, structure, and STAR completeness
  const prompt = `You are CandidateIQ Practice Evaluator.
Evaluate the candidate's practice attempt for the activity: "${activity.title}".

Activity Context:
- Target Metric: ${activity.targetMetricName} (${activity.unit})
- Target Threshold: ${activity.comparisonOperator} ${activity.targetValue}
- Recommended Framework: ${activity.recommendedFramework}

Candidate Transcript:
"""
${combinedTranscript.slice(0, 1500)}
"""

Evaluate the candidate's response and return valid JSON with scores (0-100 integer):
{
  "clarityScore": 75,
  "structureScore": 70,
  "technicalScore": 75,
  "starScore": 70,
  "frameworkAdherence": true,
  "feedback": "20-25 word constructive summary of performance",
  "remediationTip": "Clear actionable instruction for next attempt"
}`;

  try {
    const aiRes = await aiOrchestrator.executeOperation({
      operation: 'evaluate_practice_session',
      prompt
    });

    if (aiRes) {
      clarityScore = aiRes.clarityScore ?? clarityScore;
      structureScore = aiRes.structureScore ?? structureScore;
      technicalScore = aiRes.technicalScore ?? technicalScore;
      starScore = aiRes.starScore ?? starScore;
      feedbackText = aiRes.feedback || '';
    }
  } catch (err) {
    console.warn('[PRACTICE_EVAL] LLM evaluation fallback:', err.message);
  }

  // Determine actual evaluated metric value for target verification
  let evaluatedValue = 0;
  const targetMetricName = activity.targetMetricName;

  if (targetMetricName === 'fillerWordCount') {
    evaluatedValue = speechMetrics.fillerWordCount;
  } else if (targetMetricName === 'wordsPerMinute') {
    evaluatedValue = speechMetrics.wordsPerMinute;
  } else if (targetMetricName === 'clarityScore') {
    evaluatedValue = clarityScore;
  } else if (targetMetricName === 'technicalScore') {
    evaluatedValue = technicalScore;
  } else if (targetMetricName === 'starScore') {
    evaluatedValue = starScore;
  } else {
    evaluatedValue = clarityScore;
  }

  // Deterministic Target Verification Gate (Pure Code Logic - No LLM Hallucination!)
  let isPass = false;
  const operator = activity.comparisonOperator;
  const target = activity.targetValue;

  if (operator === '<=') {
    isPass = evaluatedValue <= target;
  } else if (operator === '>=') {
    isPass = evaluatedValue >= target;
  }

  const result = isPass ? 'PASS' : 'FAIL';

  // Compute Improvement Delta compared to baseline
  let scoreDelta = 0;
  if (operator === '<=') {
    scoreDelta = activity.baselineValue - evaluatedValue; // Positive if fillers decreased
  } else {
    scoreDelta = evaluatedValue - activity.baselineValue; // Positive if score increased
  }

  const improvementPercentage = Math.round(
    operator === '<='
      ? Math.max(0, ((activity.baselineValue - evaluatedValue) / Math.max(1, activity.baselineValue)) * 100)
      : Math.max(0, ((evaluatedValue - activity.baselineValue) / Math.max(1, 100 - activity.baselineValue)) * 100)
  );

  // Remediation Guidance for FAIL state
  let remediationGuidance = '';
  if (!isPass) {
    if (targetMetricName === 'fillerWordCount') {
      remediationGuidance = `You reduced filler words to ${evaluatedValue}, but your target is ≤ ${target}. Focus on taking deliberate 1-second pauses before starting each sentence during your next attempt.`;
    } else if (targetMetricName === 'wordsPerMinute') {
      remediationGuidance = `Your pace was ${evaluatedValue} WPM. Target is ${target} WPM. Slow down your cadence and articulate technical keywords clearly.`;
    } else {
      remediationGuidance = `Your ${targetMetricName} score reached ${evaluatedValue}, but the target benchmark is ${target}. Ensure you strictly apply the ${activity.recommendedFramework} framework with a clear example.`;
    }
  } else {
    remediationGuidance = `Congratulations! You satisfied the target benchmark (${evaluatedValue} vs goal ${target}). Activity marked COMPLETED.`;
  }

  return {
    result,
    evaluatedValue,
    scoreDelta,
    improvementPercentage,
    extractedMetrics: {
      fillerWordCount: speechMetrics.fillerWordCount,
      wordsPerMinute: speechMetrics.wordsPerMinute,
      wordCount: speechMetrics.wordCount,
      clarityScore,
      structureScore,
      technicalScore,
      starScore
    },
    feedbackText: feedbackText || (isPass ? 'Target benchmark achieved cleanly.' : 'Benchmark target not met yet.'),
    remediationGuidance
  };
}

module.exports = {
  extractFillerWords,
  computeSpeechMetrics,
  evaluatePracticeSession
};
