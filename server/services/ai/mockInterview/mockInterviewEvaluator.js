const aiOrchestrator = require('../../../ai/orchestrator/aiOrchestrator');
const progressEmitter = require('./generationProgressEmitter');
const { z } = require('zod');

/**
 * CandidateIQ Multi-Stage Evidence-Based Mock Interview Evaluator
 * 
 * Pipeline:
 * Question-by-Question Loop → Absolute Context Isolation → Answer State Detection 
 * → Evidence Extraction → Validation Gate → Incremental MongoDB Persistence
 */

// Helper to normalize feedback to strictly 20-25 words
function normalizeFeedbackWordCount(feedbackText, answerState = 'answered', defaultType = 'voice') {
  let cleaned = (feedbackText || '').replace(/\s+/g, ' ').trim();

  if (!cleaned) {
    if (answerState === 'irrelevant') {
      cleaned = "Your response does not address the requested technical requirements, diagnostic sequence, or scenario objectives for this candidate evaluation.";
    } else if (answerState === 'unusable') {
      cleaned = "Your spoken voice response could not be reliably transcribed or evaluated due to audio distortion or missing speech clarity in recording.";
    } else if (answerState === 'not_answered') {
      cleaned = "No usable response was recorded for this question during the interview, so technical reasoning could not be evaluated for scoring.";
    } else if (defaultType === 'voice') {
      cleaned = "Your spoken response demonstrated relevant concepts, but adding concrete implementation details and system trade-offs would strengthen the technical explanation.";
    } else {
      cleaned = "Your written explanation addressed the core problem, but stronger justification of database and scalability trade-offs would demonstrate deeper engineering reasoning.";
    }
  }

  const words = cleaned.split(' ');

  if (words.length >= 20 && words.length <= 25) {
    return cleaned;
  }

  if (words.length > 25) {
    let sentenceCut = words.slice(0, 25).join(' ');
    sentenceCut = sentenceCut.replace(/[,;:]$/, '');
    if (!sentenceCut.endsWith('.')) {
      sentenceCut += '.';
    }
    const truncatedWords = sentenceCut.split(' ');
    if (truncatedWords.length >= 20 && truncatedWords.length <= 25) {
      return sentenceCut;
    }
    return words.slice(0, 22).join(' ') + ' for strong engineering depth.';
  }

  const fillerPool = "demonstrating solid technical engineering reasoning aligned with role expectations and candidate experience criteria for comprehensive profile verification.".split(' ');
  const combined = [...words];
  let fillerIdx = 0;
  while (combined.length < 22 && fillerIdx < fillerPool.length) {
    combined.push(fillerPool[fillerIdx++]);
  }
  let resultStr = combined.join(' ').replace(/[,;:]$/, '');
  if (!resultStr.endsWith('.')) resultStr += '.';
  return resultStr;
}

// Generate dynamic question-specific irrelevant feedback
function generateIrrelevantFeedback(questionText, topic) {
  const cleanTopic = (topic || '').trim();
  const summary = cleanTopic ? cleanTopic : (questionText ? questionText.slice(0, 30) + '...' : 'technical scenario');
  const text = `Your candidate response does not address the requested ${summary} technical requirements, diagnostic sequence, or expected scenario objectives for this target interview evaluation.`;
  return normalizeFeedbackWordCount(text, 'answered');
}

// Stage 1: Answer State Detection
function detectAnswerState(questionItem) {
  const transcript = (questionItem.transcript || questionItem.answer || questionItem.userAnswer || '').toString().trim();

  // Case 1: Not Answered
  if (!transcript || transcript.length === 0) {
    return { state: 'not_answered', reason: 'No transcript or answer text provided.' };
  }

  // Case 2: Audio/Transcription Unusable
  if (transcript.length < 5 || /^(na|n\/a|none|test|abcd|asdf|1234)$/i.test(transcript)) {
    return { state: 'unusable', reason: 'Answer text is too short or corrupted to reliably evaluate.' };
  }

  // Common dictation noise patterns
  const containsNoisePhrases = /how are you|thank you for your response|voice response not be|transcript must be|testing 1 2 3|hello hello|delta that dance/i.test(transcript);
  if (containsNoisePhrases) {
    return { state: 'irrelevant', reason: 'Spoken transcript contains dictation/UI noise and does not address technical prompt.' };
  }

  // Case 3: Irrelevance & Domain Keyword Overlap Check
  const stopWords = new Set(['explain', 'would', 'how', 'you', 'your', 'design', 'with', 'that', 'this', 'from', 'when', 'what', 'have', 'about', 'could', 'should', 'there', 'their', 'where', 'which', 'using', 'also', 'considering', 'walk', 'through']);
  
  const questionKeywords = (questionItem.question || questionItem.questionText || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const topicKeywords = (questionItem.topic || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const expectedSkills = (questionItem.expectedSkills || []).map(s => s.toLowerCase());

  const targetTerms = Array.from(new Set([...questionKeywords, ...topicKeywords, ...expectedSkills]));
  const transcriptLower = transcript.toLowerCase();

  let matchCount = 0;
  targetTerms.forEach(term => {
    if (transcriptLower.includes(term)) matchCount++;
  });

  if (targetTerms.length > 0 && matchCount === 0) {
    return { state: 'irrelevant', reason: 'Response has 0 domain keyword overlap with technical question scenario.' };
  }

  if (matchCount > 0 && matchCount < Math.max(2, Math.ceil(targetTerms.length * 0.35))) {
    return { state: 'partial', reason: 'Response addresses part of the question scenario.' };
  }

  return { state: 'answered', reason: 'Response provided with relevant domain concepts.' };
}

// MCQ Deterministic Evaluation (No LLM call)
function evaluateMCQ(mcqItem) {
  const userAns = (mcqItem.userAnswer || mcqItem.answer || '').toString().trim().toUpperCase();
  const correctAns = (mcqItem.correctAnswer || '').toString().trim().toUpperCase();

  const userFirstChar = userAns ? userAns.charAt(0) : '';
  const correctFirstChar = correctAns ? correctAns.charAt(0) : '';

  const isAnswered = Boolean(userAns);
  const isCorrect = isAnswered && (userAns === correctAns || userFirstChar === correctFirstChar);

  return {
    answerState: isAnswered ? 'answered' : 'not_answered',
    isCorrect,
    score: isCorrect ? 10 : 0,
    userAnswer: mcqItem.userAnswer || 'Not Answered',
    correctAnswer: mcqItem.correctAnswer || 'N/A'
  };
}

// Zod Schema for Structured AI Evidence Evaluation Output
const EvidenceEvaluationSchema = z.object({
  answerState: z.enum(['answered', 'partial', 'irrelevant', 'unusable', 'not_answered']).default('answered'),
  relevance: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  technicalAccuracy: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  reasoning: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  communication: z.object({
    score: z.number().min(0).max(10),
    evidence: z.array(z.string())
  }),
  tone: z.object({
    label: z.string().default('neutral'),
    evidence: z.array(z.string()).default([])
  }),
  sentiment: z.object({
    label: z.string().default('neutral'),
    evidence: z.array(z.string()).default([])
  }),
  demonstratedEvidence: z.array(z.string()).default([]),
  missingAreas: z.array(z.string()).default([]),
  behaviouralSignals: z.array(z.object({
    signal: z.string(),
    evidence: z.string()
  })).default([]),
  feedback: z.string()
});

// Stage 3: Evidence Validation Gate & Semantic Leak Protection
function validateEvidenceConsistency(evalData, answerState, candidateAnswerText, questionText, topic = '') {
  const result = {
    relevance: { score: 0, evidence: [] },
    technicalAccuracy: { score: 0, evidence: [] },
    reasoning: { score: 0, evidence: [] },
    communication: { score: 0, evidence: [] },
    tone: { label: 'neutral', evidence: [] },
    sentiment: { label: 'neutral', evidence: [] },
    demonstratedEvidence: [],
    missingAreas: [],
    behaviouralSignals: [],
    feedback: '',
    ...evalData
  };

  result.answerState = answerState;

  // RULE 1: Irrelevant Answer Guard
  if (answerState === 'irrelevant') {
    result.relevance = { score: 1, evidence: ['Response does not address the question scenario.'] };
    result.technicalAccuracy = { score: 1, evidence: ['No technical concepts demonstrated for this question.'] };
    result.reasoning = { score: 1, evidence: ['No diagnostic or technical reasoning demonstrated.'] };
    result.communication = { score: Math.min(3, result.communication?.score || 2), evidence: ['Phrasing provided but off-topic.'] };
    result.demonstratedEvidence = [];
    result.missingAreas = [questionText || topic || 'Required scenario topics'];
    result.behaviouralSignals = [];
    result.tone = { label: 'neutral', evidence: [] };
    result.sentiment = { label: 'neutral', evidence: [] };
    result.feedback = generateIrrelevantFeedback(questionText, topic);
    return result;
  }

  // RULE 2: Unusable Answer Guard
  if (answerState === 'unusable') {
    result.relevance = { score: 0, evidence: [] };
    result.technicalAccuracy = { score: 0, evidence: [] };
    result.reasoning = { score: 0, evidence: [] };
    result.communication = { score: 0, evidence: [] };
    result.demonstratedEvidence = [];
    result.missingAreas = [];
    result.behaviouralSignals = [];
    result.feedback = "Your spoken voice response could not be reliably transcribed or evaluated due to audio distortion or missing speech clarity.";
    return result;
  }

  // RULE 3: Empty Evidence Cap (Scores >= 7 require non-empty demonstratedEvidence)
  if ((!result.demonstratedEvidence || result.demonstratedEvidence.length === 0) && (result.technicalAccuracy?.score || 0) >= 7) {
    result.technicalAccuracy.score = 4;
    result.technicalAccuracy.evidence = ['Limited demonstrated evidence found in answer transcript.'];
  }

  // RULE 4: Generic Praise Sanitization
  if ((result.technicalAccuracy?.score || 0) <= 3 && /technically relevant|clearly structured/i.test(result.feedback)) {
    result.feedback = "Your explanation lacked specific technical depth and trade-offs required for this scenario. Focus on providing concrete architectural implementation steps.";
  }

  result.feedback = normalizeFeedbackWordCount(result.feedback, answerState);
  return result;
}

/**
 * Isolated Question-by-Question AI Evaluator
 * ABSOLUTE CONTEXT ISOLATION: Evaluates ONE question only, with zero previous question context
 */
async function evaluateSingleQuestion({ questionItem, type, resumeData, jobData }) {
  const detection = detectAnswerState(questionItem);
  const textOrTranscript = type === 'voice' 
    ? (questionItem.transcript || questionItem.answer || questionItem.userAnswer || '').toString().trim()
    : (questionItem.userAnswer || questionItem.answer || '').toString().trim();

  // 1. Handle Not Answered
  if (detection.state === 'not_answered') {
    return {
      answerState: 'not_answered',
      relevance: { score: null, evidence: [] },
      technicalAccuracy: { score: null, evidence: [] },
      reasoning: { score: null, evidence: [] },
      communication: { score: null, evidence: [] },
      tone: { label: 'neutral', evidence: [] },
      sentiment: { label: 'neutral', evidence: [] },
      demonstratedEvidence: [],
      missingAreas: [questionItem.question || questionItem.questionText || 'Required prompt'],
      behaviouralSignals: [],
      feedback: `No usable response was recorded for this ${type} question during the interview session.`
    };
  }

  // 2. Handle Unusable
  if (detection.state === 'unusable') {
    return validateEvidenceConsistency({}, 'unusable', textOrTranscript, questionItem.question || questionItem.questionText, questionItem.topic);
  }

  // 3. Handle Irrelevant
  if (detection.state === 'irrelevant') {
    return validateEvidenceConsistency({}, 'irrelevant', textOrTranscript, questionItem.question || questionItem.questionText, questionItem.topic);
  }

  // Sanitize isolated context
  const sanitizedJob = {
    title: jobData?.title || 'Software Engineer',
    skills: (jobData?.requiredSkills || []).slice(0, 6)
  };
  const sanitizedResume = {
    headline: resumeData?.headline || 'Candidate',
    skills: Array.isArray(resumeData?.skills) ? resumeData.skills.slice(0, 6) : []
  };

  // Build ISOLATED prompt for ONLY this question
  const prompt = `You are evaluating ONE interview question only for CandidateIQ.

STRICT CONTRACT:
- You are evaluating ONE question only (${questionItem.questionId}).
- Evaluate ONLY the supplied current question and current candidate response.
- Do NOT reference previous questions.
- Do NOT reference future questions.
- Do NOT reuse previous feedback.
- Do NOT infer candidate performance from other answers.
- The candidate's response is the ONLY evidence of demonstrated performance for this question.
- The question may contain technologies that the candidate never discussed. Those concepts are NOT evidence of candidate knowledge.
- CRITICAL: The "feedback" field MUST BE CONCISELY BETWEEN 20 AND 25 WORDS, SPECIFIC TO THIS QUESTION.

CONTEXT:
TARGET ROLE: ${JSON.stringify(sanitizedJob)}
CANDIDATE PROFILE: ${JSON.stringify(sanitizedResume)}

CURRENT QUESTION ONLY:
Question ID: "${questionItem.questionId}"
Type: "${type}"
Topic: "${questionItem.topic || 'Technical Deep Dive'}"
Difficulty: "${questionItem.difficulty || 'Medium'}"
Expected Skills: ${(questionItem.expectedSkills || []).join(', ')}
Question Text: "${questionItem.question || questionItem.questionText}"

CANDIDATE RESPONSE (RAW EVIDENCE FOR THIS QUESTION ONLY):
"${textOrTranscript}"
${type === 'voice' ? `Voice Performance Signals:
- Duration: ${questionItem.durationSeconds || 0}s
- Word Count: ${questionItem.voiceMetrics?.wordCount || 0}
- Speaking Rate: ${questionItem.voiceMetrics?.wpm || 0} WPM
- Speaking Duration: ${questionItem.voiceMetrics?.speakingDurationSeconds || 0}s
- Silence Duration: ${questionItem.voiceMetrics?.silenceDurationSeconds || 0}s
- Fillers Detected: ${questionItem.voiceMetrics?.fillerCount || 0} (Rate: ${questionItem.voiceMetrics?.fillerRate || 0}%)
- Pauses Recorded: ${questionItem.voiceMetrics?.pauseCount || 0} (Longest Pause: ${questionItem.voiceMetrics?.longestPauseSeconds || 0}s)` : ''}

SCORING GUIDANCE (0 to 10):
0: Unanswered or completely incorrect
1-2: Very limited, irrelevant, or incorrect response
3-4: Limited understanding
5-6: Basic / partially correct answer
7-8: Strong demonstrated understanding with concrete evidence
9-10: Exceptional response with deep architectural evidence

Return JSON matching this schema:
{
  "answerState": "answered" | "partial" | "irrelevant" | "unusable",
  "relevance": { "score": 8, "evidence": ["..."] },
  "technicalAccuracy": { "score": 7, "evidence": ["..."] },
  "reasoning": { "score": 7, "evidence": ["..."] },
  "communication": { "score": 8, "evidence": ["..."] },
  "tone": { "label": "professional", "evidence": ["..."] },
  "sentiment": { "label": "positive", "evidence": ["..."] },
  "demonstratedEvidence": ["..."],
  "missingAreas": ["..."],
  "behaviouralSignals": [
    { "signal": "structured_problem_solving", "evidence": "..." }
  ],
  "feedback": "20-25 words candidate-specific feedback for THIS QUESTION..."
}`;

  const aiRes = await aiOrchestrator.executeOperation({
    operation: `evaluate_${type}_question`,
    prompt,
    schema: EvidenceEvaluationSchema
  });

  const evalData = aiRes.result || aiRes.json;
  if (!evalData) {
    throw new Error(`AI Provider evaluation returned empty response for question ${questionItem.questionId}`);
  }

  return validateEvidenceConsistency(
    evalData, 
    evalData.answerState || detection.state, 
    textOrTranscript, 
    questionItem.question || questionItem.questionText,
    questionItem.topic
  );
}

/**
 * Main Evaluation Orchestrator with Incremental Question-by-Question Persistence
 */
async function evaluateMockInterview(interviewDoc, force = false, progressCallback = null) {
  const mockInterviewId = interviewDoc._id.toString();

  // Prevent concurrent duplicate evaluations unless forced
  if (!force && interviewDoc.evaluation?.status === 'evaluating') {
    return interviewDoc.evaluation;
  }

  // Idempotency: if completed and not forced, return existing evaluation
  if (!force && interviewDoc.evaluation && interviewDoc.evaluation.status === 'completed') {
    return interviewDoc.evaluation;
  }

  // Initialize Evaluation Status Header in Document
  interviewDoc.evaluation = interviewDoc.evaluation || {};
  interviewDoc.evaluation.status = 'evaluating';
  interviewDoc.evaluation.startedAt = interviewDoc.evaluation.startedAt || new Date();

  const mcqQuestions = interviewDoc.mock_interview_questions?.mcq || [];
  const voiceQuestions = interviewDoc.mock_interview_questions?.voice || [];
  const textQuestions = interviewDoc.mock_interview_questions?.text || [];

  const allQuestionItems = [
    ...mcqQuestions.map(q => ({ item: q, type: 'mcq' })),
    ...voiceQuestions.map(q => ({ item: q, type: 'voice' })),
    ...textQuestions.map(q => ({ item: q, type: 'text' }))
  ];

  const totalQuestions = allQuestionItems.length;
  let completedCount = 0;
  let failedCount = 0;

  interviewDoc.evaluation.totalQuestions = totalQuestions;
  interviewDoc.evaluation.completedQuestions = completedCount;
  interviewDoc.evaluation.failedQuestions = failedCount;

  // Save initial evaluating state to MongoDB
  await interviewDoc.save();

  const resumeData = interviewDoc.sourceSnapshot?.resume || {};
  const jobData = interviewDoc.sourceSnapshot?.job || {};

  // QUESTION-BY-QUESTION ITERATIVE EVALUATION LOOP
  for (let idx = 0; idx < allQuestionItems.length; idx++) {
    const { item, type } = allQuestionItems[idx];
    const questionNumber = idx + 1;
    const qId = item.questionId || `q_${questionNumber}`;

    // Skip if already completed and not forced (Resumable evaluation)
    if (!force && item.evaluationStatus === 'completed' && item.evaluation) {
      completedCount++;
      continue;
    }

    // Mark current question as evaluating
    item.evaluationStatus = 'evaluating';
    interviewDoc.evaluation.currentQuestion = questionNumber;
    interviewDoc.evaluation.currentQuestionId = qId;
    interviewDoc.evaluation.currentQuestionType = type;
    interviewDoc.evaluation.currentTopic = item.topic || type.toUpperCase();

    // Emit real-time progress: question_started
    const startPayload = {
      type: 'question_started',
      stage: 'EVALUATING_QUESTION',
      mockInterviewId,
      questionNumber,
      totalQuestions,
      completedQuestions: completedCount,
      questionId: qId,
      questionType: type,
      topic: item.topic || type.toUpperCase(),
      progress: Math.round((completedCount / totalQuestions) * 100)
    };

    if (progressCallback) progressCallback(startPayload);
    progressEmitter.updateProgress(mockInterviewId, startPayload);

    let evalRes = null;
    let evalStatus = 'completed';

    try {
      if (type === 'mcq') {
        evalRes = evaluateMCQ(item);
      } else {
        evalRes = await evaluateSingleQuestion({ questionItem: item, type, resumeData, jobData });
      }
    } catch (err) {
      console.error(`[EVALUATION] Question ${qId} evaluation failed:`, err.message);
      evalStatus = 'failed';
      evalRes = {
        answerState: 'unusable',
        evaluationStatus: 'failed',
        feedback: `Evaluation for this question encountered an error: ${err.message}`
      };
      failedCount++;
    }

    item.evaluationStatus = evalStatus;
    item.evaluation = evalRes;

    if (evalStatus === 'completed') {
      completedCount++;
    }

    // Sync flat questions array for backward compatibility
    if (interviewDoc.questions && interviewDoc.questions.length > 0) {
      const flatMatch = interviewDoc.questions.find((q) => String(q.questionId) === String(qId) || String(q._id) === String(qId));
      if (flatMatch) {
        flatMatch.evaluation = {
          technicalScore: evalRes.technicalAccuracy?.score !== null && evalRes.technicalAccuracy?.score !== undefined ? evalRes.technicalAccuracy.score * 10 : (evalRes.isCorrect ? 100 : 0),
          communicationScore: evalRes.communication?.score !== null && evalRes.communication?.score !== undefined ? evalRes.communication.score * 10 : null,
          problemSolvingScore: evalRes.reasoning?.score !== null && evalRes.reasoning?.score !== undefined ? evalRes.reasoning.score * 10 : null,
          relevanceScore: evalRes.relevance?.score !== null && evalRes.relevance?.score !== undefined ? evalRes.relevance.score * 10 : null,
          feedback: evalRes.feedback || 'Evaluated by CandidateIQ',
          behaviouralEvidence: (evalRes.behaviouralSignals || []).map(s => typeof s === 'string' ? s : s.signal),
          keyStrengths: evalRes.demonstratedEvidence || [],
          areasForImprovement: evalRes.missingAreas || []
        };
      }
    }

    // INCREMENTAL DATABASE PERSISTENCE AFTER EACH QUESTION
    interviewDoc.evaluation.completedQuestions = completedCount;
    interviewDoc.evaluation.failedQuestions = failedCount;
    interviewDoc.markModified('mock_interview_questions');
    interviewDoc.markModified('questions');
    interviewDoc.markModified('evaluation');

    await interviewDoc.save();

    // Emit real-time progress: question_completed
    const completePayload = {
      type: 'question_completed',
      stage: 'QUESTION_COMPLETED',
      mockInterviewId,
      questionNumber,
      totalQuestions,
      completedQuestions: completedCount,
      failedQuestions: failedCount,
      questionId: qId,
      questionType: type,
      status: evalStatus,
      scores: {
        technical: evalRes.technicalAccuracy?.score ?? (evalRes.isCorrect ? 10 : 0),
        communication: evalRes.communication?.score ?? null
      },
      progress: Math.round((completedCount / totalQuestions) * 100)
    };

    if (progressCallback) progressCallback(completePayload);
    progressEmitter.updateProgress(mockInterviewId, completePayload);
  }

  // FINAL AGGREGATION LAST (Derived ONLY from persisted question evaluations)
  const mcqResults = mcqQuestions.map(q => q.evaluation).filter(Boolean);
  const voiceResults = voiceQuestions.map(q => q.evaluation).filter(Boolean);
  const textResults = textQuestions.map(q => q.evaluation).filter(Boolean);

  const answeredMCQs = mcqResults.filter(m => m.answerState === 'answered');
  let totalMcqScore = null;
  if (answeredMCQs.length > 0) {
    const correctCount = answeredMCQs.filter((r) => r.isCorrect).length;
    totalMcqScore = Math.round((correctCount / answeredMCQs.length) * 100);
  }

  let voiceTechSum = 0, voiceCommSum = 0, voiceReasonSum = 0;
  let voiceValidCount = 0;
  voiceResults.forEach((v) => {
    if (v.answerState !== 'not_answered' && v.answerState !== 'unusable' && v.technicalAccuracy?.score !== null && v.technicalAccuracy?.score !== undefined) {
      voiceTechSum += (v.technicalAccuracy?.score || 0) * 10;
      voiceCommSum += (v.communication?.score || 0) * 10;
      voiceReasonSum += (v.reasoning?.score || 0) * 10;
      voiceValidCount++;
    }
  });

  let textTechSum = 0, textCommSum = 0, textReasonSum = 0;
  let textValidCount = 0;
  textResults.forEach((t) => {
    if (t.answerState !== 'not_answered' && t.answerState !== 'unusable' && t.technicalAccuracy?.score !== null && t.technicalAccuracy?.score !== undefined) {
      textTechSum += (t.technicalAccuracy?.score || 0) * 10;
      textCommSum += (t.communication?.score || 0) * 10;
      textReasonSum += (t.reasoning?.score || 0) * 10;
      textValidCount++;
    }
  });

  const techScoresList = [];
  if (totalMcqScore !== null) techScoresList.push(totalMcqScore);
  if (voiceValidCount > 0) techScoresList.push(Math.round(voiceTechSum / voiceValidCount));
  if (textValidCount > 0) techScoresList.push(Math.round(textTechSum / textValidCount));
  const technicalScore = techScoresList.length > 0 ? Math.round(techScoresList.reduce((a, b) => a + b, 0) / techScoresList.length) : null;

  const commScoresList = [];
  if (voiceValidCount > 0) commScoresList.push(Math.round(voiceCommSum / voiceValidCount));
  if (textValidCount > 0) commScoresList.push(Math.round(textCommSum / textValidCount));
  const communicationScore = commScoresList.length > 0 ? Math.round(commScoresList.reduce((a, b) => a + b, 0) / commScoresList.length) : null;

  const reasonScoresList = [];
  if (voiceValidCount > 0) reasonScoresList.push(Math.round(voiceReasonSum / voiceValidCount));
  if (textValidCount > 0) reasonScoresList.push(Math.round(textReasonSum / textValidCount));
  const reasoningScore = reasonScoresList.length > 0 ? Math.round(reasonScoresList.reduce((a, b) => a + b, 0) / reasonScoresList.length) : null;

  const behaviouralScore = (communicationScore !== null && reasoningScore !== null)
    ? Math.round((communicationScore * 0.5) + (reasoningScore * 0.5))
    : (communicationScore ?? reasoningScore ?? null);

  let overallScore = null;
  if (technicalScore !== null) {
    const weights = [];
    weights.push(technicalScore * 0.45);
    if (reasoningScore !== null) weights.push(reasoningScore * 0.25);
    if (communicationScore !== null) weights.push(communicationScore * 0.20);
    if (behaviouralScore !== null) weights.push(behaviouralScore * 0.10);

    const totalWeight = 0.45 + (reasoningScore !== null ? 0.25 : 0) + (communicationScore !== null ? 0.20 : 0) + (behaviouralScore !== null ? 0.10 : 0);
    overallScore = Math.round(weights.reduce((a, b) => a + b, 0) / totalWeight);
  }

/**
 * Helper to compute 4-Level Evaluation Hierarchy & Consistency Analytics Engine
 */
function computeComprehensiveInterviewAnalytics(allQuestionItems, overallScore, technicalScore, communicationScore, reasoningScore, behaviouralScore) {
  const performanceTimeline = [];
  let prevScore = null;
  const questionScores = [];
  const drops = [];

  allQuestionItems.forEach(({ item, type }, idx) => {
    const qNum = idx + 1;
    const qId = item.questionId || `q_${qNum}`;
    const topic = item.topic || (type === 'mcq' ? 'Technical MCQ' : type === 'voice' ? 'Voice Architecture' : 'Written System Design');
    const difficulty = item.difficulty || 'Medium';

    let score = 0;
    let techScore = 0;
    let commScore = null;
    let reasScore = null;

    const ev = item.evaluation || {};
    if (type === 'mcq') {
      score = ev.isCorrect ? 100 : (ev.score ? ev.score * 10 : 0);
      techScore = score;
    } else {
      techScore = ev.technicalAccuracy?.score !== undefined && ev.technicalAccuracy?.score !== null ? ev.technicalAccuracy.score * 10 : (ev.isCorrect ? 100 : 50);
      commScore = ev.communication?.score !== undefined && ev.communication?.score !== null ? ev.communication.score * 10 : null;
      reasScore = ev.reasoning?.score !== undefined && ev.reasoning?.score !== null ? ev.reasoning.score * 10 : null;
      
      if (commScore !== null && reasScore !== null) {
        score = Math.round(techScore * 0.5 + commScore * 0.25 + reasScore * 0.25);
      } else {
        score = techScore;
      }
    }

    let expectedBaseline = 75;
    if (String(difficulty).toLowerCase() === 'hard') expectedBaseline = 65;
    if (String(difficulty).toLowerCase() === 'easy') expectedBaseline = 85;
    const normalizedScore = Math.max(0, Math.min(100, score + (75 - expectedBaseline)));

    questionScores.push(score);

    const delta = prevScore !== null ? score - prevScore : 0;
    let status = 'stable';
    if (idx > 0 && drops.length > 0 && delta >= 10) {
      status = 'recovery';
    } else if (score >= 90) {
      status = 'strong';
    } else if (delta >= 12) {
      status = 'significant_improvement';
    } else if (delta >= 6) {
      status = 'improving';
    } else if (delta <= -12) {
      status = 'significant_drop';
    } else if (delta <= -6) {
      status = 'declining';
    } else {
      status = 'stable';
    }

    let whatChanged = '';
    let why = '';
    let impact = '';
    let recommendedImprovement = '';

    if (status === 'recovery') {
      whatChanged = 'Recovery detected after previous performance drop.';
      why = 'Candidate recovered technical focus, answer completeness, and confidence.';
      impact = `Recovered by +${delta} points following previous drop.`;
      recommendedImprovement = 'Maintain steady composure throughout technical scenarios.';
    } else if (status === 'strong') {
      whatChanged = 'High performance demonstrated.';
      why = ev.feedback || 'Exceptional technical accuracy with practical implementation examples.';
      impact = `High score of ${score}/100 achieved.`;
      recommendedImprovement = 'Continue providing concrete implementation examples.';
    } else if (status === 'significant_improvement' || status === 'improving') {
      whatChanged = 'Technical accuracy and explanation depth increased.';
      why = ev.feedback || 'Candidate connected domain concepts with practical implementation details.';
      impact = `Performance increased by +${delta} points.`;
      recommendedImprovement = 'Maintain providing structured technical examples.';
    } else if (status === 'significant_drop' || status === 'declining') {
      if (commScore !== null && commScore < 60) {
        whatChanged = 'Communication clarity and response structure dropped.';
        why = 'Answer was partially correct but lacked structured explanation sequence and had lower clarity.';
        impact = `Communication & overall score dropped by ${Math.abs(delta)} points.`;
        recommendedImprovement = 'Practice structured STAR/PEEL-style technical responses.';
      } else if (techScore < 60) {
        whatChanged = 'Technical accuracy and edge-case coverage decreased.';
        why = 'Candidate struggled with scenario-specific architectural requirements.';
        impact = `Technical performance dropped by ${Math.abs(delta)} points.`;
        recommendedImprovement = 'Review core architectural patterns and error-handling edge cases.';
      } else {
        whatChanged = 'Answer depth decreased under question constraints.';
        why = ev.feedback || 'Response lacked specific trade-off analysis.';
        impact = `Performance dropped by ${Math.abs(delta)} points.`;
        recommendedImprovement = 'Articulate space/time trade-offs explicitly.';
      }

      drops.push({
        sequence: qNum,
        questionId: qId,
        topic,
        score,
        previousScore: prevScore,
        delta,
        whatChanged,
        why,
        impact,
        recommendedImprovement,
        evidence: ev.missingAreas || []
      });
    } else {
      whatChanged = 'Stable performance across question sequence.';
      why = 'Consistent alignment with expected scenario criteria.';
      impact = `Delta: ${delta >= 0 ? '+' : ''}${delta} pts (Stable performance)`;
      recommendedImprovement = 'Continue consistent technical precision.';
    }

    performanceTimeline.push({
      sequence: qNum,
      questionId: qId,
      section: type,
      topic,
      difficulty,
      score,
      normalizedScore,
      technicalScore: techScore,
      communicationScore: commScore,
      reasoningScore: reasScore,
      deltaFromPrevious: delta,
      status,
      hoverAnalysis: {
        sequence: qNum,
        questionId: qId,
        section: type,
        topic,
        score,
        previousScore: prevScore,
        delta,
        status,
        whatChanged,
        why,
        impact,
        recommendedImprovement
      },
      strengths: ev.demonstratedEvidence || [],
      weaknesses: ev.missingAreas || [],
      feedback: ev.feedback || ''
    });

    prevScore = score;
  });

  const n = questionScores.length;
  const meanScore = n > 0 ? Math.round(questionScores.reduce((a, b) => a + b, 0) / n) : 0;
  
  const variance = n > 0 ? questionScores.reduce((sum, s) => sum + Math.pow(s - meanScore, 2), 0) / n : 0;
  const stdDeviation = Math.round(Math.sqrt(variance) * 10) / 10;
  const range = n > 0 ? Math.max(...questionScores) - Math.min(...questionScores) : 0;

  let streakInc = 0, maxStreakInc = 0;
  let streakDec = 0, maxStreakDec = 0;
  let recoveryDetected = false;
  let hadDrop = false;

  for (let i = 1; i < n; i++) {
    const diff = questionScores[i] - questionScores[i - 1];
    if (diff > 0) {
      streakInc++;
      streakDec = 0;
      if (hadDrop && diff >= 10) {
        recoveryDetected = true;
      }
    } else if (diff < 0) {
      streakDec++;
      streakInc = 0;
      if (diff <= -10) {
        hadDrop = true;
      }
    } else {
      streakInc = 0;
      streakDec = 0;
    }
    if (streakInc > maxStreakInc) maxStreakInc = streakInc;
    if (streakDec > maxStreakDec) maxStreakDec = streakDec;
  }

  const instabilityPenalty = Math.min(45, Math.round((stdDeviation * 1.4) + (maxStreakDec * 3.5) + (drops.length * 4)));
  const consistencyScore = Math.max(0, Math.min(100, 100 - instabilityPenalty));

  let performanceTrend = 'stable';
  if (n < 3) {
    performanceTrend = 'insufficient_data';
  } else if (maxStreakInc >= 3) {
    performanceTrend = 'improving';
  } else if (maxStreakDec >= 3) {
    performanceTrend = 'declining';
  } else if (stdDeviation > 16) {
    performanceTrend = 'fluctuating';
  } else if (stdDeviation <= 8) {
    performanceTrend = 'stable';
  }

  const mcqs = allQuestionItems.filter(q => q.type === 'mcq');
  const voices = allQuestionItems.filter(q => q.type === 'voice');
  const texts = allQuestionItems.filter(q => q.type === 'text');

  const sectionScores = {
    mcq: {
      score: mcqs.length > 0 ? Math.round(mcqs.filter(m => m.item.evaluation?.isCorrect).length / mcqs.length * 100) : null,
      count: mcqs.length,
      correctCount: mcqs.filter(m => m.item.evaluation?.isCorrect).length
    },
    voice: {
      score: voices.length > 0 ? Math.round(voices.reduce((acc, v) => acc + (v.item.evaluation?.technicalAccuracy?.score || 5) * 10, 0) / voices.length) : null,
      count: voices.length
    },
    text: {
      score: texts.length > 0 ? Math.round(texts.reduce((acc, t) => acc + (t.item.evaluation?.technicalAccuracy?.score || 5) * 10, 0) / texts.length) : null,
      count: texts.length
    },
    technical: { score: technicalScore, trend: performanceTrend },
    communication: { score: communicationScore, trend: performanceTrend },
    reasoning: { score: reasoningScore, trend: performanceTrend },
    behavioural: { score: behaviouralScore, trend: performanceTrend }
  };

  const improvementRecommendations = [];

  if (communicationScore !== null && communicationScore < 75) {
    improvementRecommendations.push({
      id: 'rec_comm_structure',
      title: 'Structure Technical Responses Using STAR Framework',
      category: 'Communication',
      priority: communicationScore < 60 ? 'Critical' : 'High',
      severity: communicationScore < 60 ? 'High' : 'Medium',
      problem: `Communication score was ${communicationScore}/100 with lower clarity observed in complex scenario questions.`,
      evidence: performanceTimeline.filter(p => p.communicationScore !== null && p.communicationScore < 70).map(p => ({
        questionId: p.questionId,
        topic: p.topic,
        score: p.communicationScore,
        signal: 'Low communication clarity'
      })),
      whyItMatters: 'Clear architectural communication is a primary signal of engineering seniority during recruiter evaluations.',
      action: 'Practice 5 technical scenario questions stating the core bottom line first before detailing trade-offs.',
      practiceMethod: 'Structured voice practice focusing on deliberate pauses and STAR format.',
      expectedOutcome: 'Achieve communication clarity score of 80+ across technical questions.',
      measurableTarget: '5 structured practice sessions',
      estimatedEffort: '25 minutes',
      relatedQuestionIds: performanceTimeline.filter(p => p.communicationScore !== null && p.communicationScore < 70).map(p => p.questionId)
    });
  }

  if (technicalScore !== null && technicalScore < 80) {
    improvementRecommendations.push({
      id: 'rec_tech_depth',
      title: 'Deepen Architectural Trade-Offs & Edge Case Explanations',
      category: 'Technical',
      priority: technicalScore < 65 ? 'Critical' : 'High',
      severity: technicalScore < 65 ? 'High' : 'Medium',
      problem: `Technical proficiency score of ${technicalScore}/100 indicates missing depth in scenario edge cases.`,
      evidence: performanceTimeline.filter(p => p.technicalScore < 70).map(p => ({
        questionId: p.questionId,
        topic: p.topic,
        score: p.technicalScore,
        signal: 'Limited trade-off depth'
      })),
      whyItMatters: 'Hiring managers test whether candidates understand production failure modes and trade-offs.',
      action: 'Complete 5 practice questions focusing on database consistency, caching strategies, and concurrency failure modes.',
      practiceMethod: 'Targeted code & system design scenario practice.',
      expectedOutcome: 'Raise technical depth rating above 85/100.',
      measurableTarget: '5 practice questions completed',
      estimatedEffort: '35 minutes',
      relatedQuestionIds: performanceTimeline.filter(p => p.technicalScore < 70).map(p => p.questionId)
    });
  }

  if (drops.length > 0) {
    improvementRecommendations.push({
      id: 'rec_consistency_recovery',
      title: 'Maintain Performance Consistency Under Sequential Time Pressure',
      category: 'Structure',
      priority: drops.length >= 2 ? 'High' : 'Medium',
      severity: 'Medium',
      problem: `Detected ${drops.length} significant score drops during the interview sequence.`,
      evidence: drops.map(d => ({
        questionId: d.questionId,
        topic: d.topic,
        score: d.score,
        signal: `Dropped by ${Math.abs(d.delta)} points`
      })),
      whyItMatters: 'Consistent performance demonstrates composure and steady technical reasoning.',
      action: 'Complete full mock interview simulations with timed response windows to build stamina.',
      practiceMethod: 'Timed voice & text mock interview sessions.',
      expectedOutcome: 'Reduce performance variance below 8.0 std deviation.',
      measurableTarget: '2 full mock interview attempts',
      estimatedEffort: '45 minutes',
      relatedQuestionIds: drops.map(d => d.questionId)
    });
  }

  const hrAnalytics = {
    overallScore,
    consistencyScore,
    performanceTrend,
    stabilityLabel: consistencyScore >= 80 ? 'High Stability' : consistencyScore >= 60 ? 'Moderate Stability' : 'Fluctuating Performance',
    sectionScores: {
      technical: technicalScore,
      communication: communicationScore,
      reasoning: reasoningScore,
      behavioural: behaviouralScore,
      mcqAccuracy: sectionScores.mcq.score
    },
    topStrengths: performanceTimeline.flatMap(p => p.strengths).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    topWeaknesses: performanceTimeline.flatMap(p => p.weaknesses).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    significantDropCount: drops.length,
    recoveryDetected,
    evidenceSummary: `Candidate completed ${n} question scenarios with an overall score of ${overallScore} and a consistency score of ${consistencyScore}.`,
    evaluatedAt: new Date()
  };

  return {
    performanceTimeline,
    consistencyAnalytics: {
      meanScore,
      scoreVariance: Math.round(variance * 10) / 10,
      stdDeviation,
      range,
      consecutiveImprovement: maxStreakInc,
      consecutiveDecline: maxStreakDec,
      recoveryDetected,
      consistencyScore,
      performanceTrend,
      significantDropsCount: drops.length
    },
    sectionScores,
    performanceDrops: drops,
    improvementRecommendations,
    hrAnalytics
  };
}

  const allStrengths = [];
  const allImprovements = [];
  [...voiceResults, ...textResults].forEach((r) => {
    if (r.demonstratedEvidence) allStrengths.push(...r.demonstratedEvidence);
    if (r.missingAreas) allImprovements.push(...r.missingAreas);
  });

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const uniqueImprovements = Array.from(new Set(allImprovements)).slice(0, 4);

  const comprehensiveAnalytics = computeComprehensiveInterviewAnalytics(
    allQuestionItems,
    overallScore,
    technicalScore,
    communicationScore,
    reasoningScore,
    behaviouralScore
  );

  const overallEvaluation = {
    status: 'completed',
    evaluationVersion: 'mock-review-v2',
    totalQuestions,
    completedQuestions: completedCount,
    failedQuestions: failedCount,
    overallScore,
    technicalScore,
    communicationScore,
    reasoningScore,
    behaviouralScore,
    consistencyScore: comprehensiveAnalytics.consistencyAnalytics.consistencyScore,
    performanceTimeline: comprehensiveAnalytics.performanceTimeline,
    consistencyAnalytics: comprehensiveAnalytics.consistencyAnalytics,
    sectionScores: comprehensiveAnalytics.sectionScores,
    performanceDrops: comprehensiveAnalytics.performanceDrops,
    improvementRecommendations: comprehensiveAnalytics.improvementRecommendations,
    hrAnalytics: comprehensiveAnalytics.hrAnalytics,
    sentimentSummary: 'Evidence-based analysis of candidate responses.',
    strengths: uniqueStrengths,
    improvements: uniqueImprovements,
    finalFeedback: overallScore !== null
      ? `Candidate scored ${overallScore}/100 based on demonstrated technical evidence across ${completedCount} evaluated question scenarios with a consistency score of ${comprehensiveAnalytics.consistencyAnalytics.consistencyScore}/100.`
      : `Evaluation completed based on available response evidence.`,
    evaluatedAt: new Date(),
    startedAt: interviewDoc.evaluation?.startedAt || interviewDoc.createdAt,
    completedAt: new Date()
  };

  interviewDoc.evaluation = overallEvaluation;
  interviewDoc.overallEvaluation = {
    overallInterviewScore: overallScore,
    technicalProficiency: technicalScore,
    behaviouralCompetency: behaviouralScore,
    communicationClarity: communicationScore,
    problemSolvingRating: reasoningScore,
    summaryExplanation: overallEvaluation.finalFeedback,
    topStrengths: uniqueStrengths,
    recommendedImprovementAreas: uniqueImprovements
  };

  interviewDoc.markModified('mock_interview_questions');
  interviewDoc.markModified('questions');
  interviewDoc.markModified('evaluation');
  interviewDoc.markModified('overallEvaluation');

  await interviewDoc.save();

  const finalPayload = {
    type: 'evaluation_completed',
    stage: 'COMPLETED',
    mockInterviewId,
    progress: 100,
    evaluation: overallEvaluation
  };

  if (progressCallback) progressCallback(finalPayload);
  progressEmitter.updateProgress(mockInterviewId, finalPayload);

  return overallEvaluation;
}

module.exports = {
  detectAnswerState,
  evaluateMCQ,
  evaluateSingleQuestion,
  evaluateMockInterview,
  validateEvidenceConsistency,
  normalizeFeedbackWordCount,
  generateIrrelevantFeedback
};

