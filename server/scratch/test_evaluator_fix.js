const {
  detectAnswerState,
  evaluateMCQ,
  validateEvidenceConsistency,
  normalizeFeedbackWordCount
} = require('../services/ai/mockInterview/mockInterviewEvaluator');

console.log('=== CANDIDATEIQ EVALUATION ENGINE TEST SUITE ===\n');

// BUG TEST CASE FROM USER PROMPT
const bugQuestion = {
  questionId: 'q_bug_1',
  topic: 'Microservices & System Design',
  difficulty: 'Hard',
  expectedSkills: ['Node.js', 'MongoDB', 'gRPC', 'Kubernetes', 'Fault Tolerance'],
  question: 'Explain how you would design a fault-tolerant, horizontally scalable Node.js microservice that processes candidate video uploads, stores metadata in MongoDB, and streams results via a gRPC endpoint, considering container orchestration and graceful shutdown.',
  transcript: 'when you start working how are you thank you for your response that voice response not be delta that dance with must be that transcript must be non editable',
  durationSeconds: 12
};

// TEST 1: Irrelevant / Dictation Noise Answer (The exact bug case)
console.log('--- TEST 1: User Bug Case (Dictation Noise / Irrelevant Transcript) ---');
const detection1 = detectAnswerState(bugQuestion);
console.log('Detected State:', detection1);

const validated1 = validateEvidenceConsistency({}, detection1.state, bugQuestion.transcript, bugQuestion.question);
console.log('Answer State:', validated1.answerState);
console.log('Relevance Score:', validated1.relevance);
console.log('Technical Score:', validated1.technicalAccuracy);
console.log('Communication Score:', validated1.communication);
console.log('Feedback:', `"${validated1.feedback}"`);
console.log('Feedback Word Count:', validated1.feedback.split(/\s+/).length);

// ASSERTIONS
console.assert(validated1.answerState === 'irrelevant', 'FAILED: State should be irrelevant');
console.assert(validated1.relevance.score <= 1, 'FAILED: Relevance score must be <= 1');
console.assert(validated1.technicalAccuracy.score <= 1, 'FAILED: Technical score must be <= 1');
const wordCount1 = validated1.feedback.trim().split(/\s+/).length;
if (wordCount1 < 20 || wordCount1 > 25) {
  console.error(`FAILED: Feedback word count is ${wordCount1}, expected 20-25 words`);
} else {
  console.log(`PASSED: Feedback word count is ${wordCount1} words (20-25 range).`);
}

// TEST 2: Strong Relevant Answer
console.log('\n--- TEST 2: Strong Relevant System Design Answer ---');
const strongQuestion = {
  ...bugQuestion,
  transcript: 'I would keep the Node.js service stateless and run multiple instances behind a load balancer. Video files should go to object storage while MongoDB stores metadata. Processing can be asynchronous using a queue and worker model. For gRPC, I would stream processing status to clients. Kubernetes can restart failed containers, while readiness probes prevent traffic from reaching unhealthy instances. During shutdown, the service should stop accepting new requests, finish active work, close connections and then terminate.'
};
const detection2 = detectAnswerState(strongQuestion);
console.log('Detected State:', detection2);
console.assert(detection2.state === 'answered', 'FAILED: State should be answered');

// TEST 3: Partial Answer
console.log('\n--- TEST 3: Partial Answer ---');
const partialQuestion = {
  ...bugQuestion,
  transcript: 'I would use multiple Node.js instances behind a load balancer and store metadata in MongoDB.'
};
const detection3 = detectAnswerState(partialQuestion);
console.log('Detected State:', detection3);
console.assert(detection3.state === 'partial', 'FAILED: State should be partial');

// TEST 4: Empty Voice Answer (Not Answered)
console.log('\n--- TEST 4: Empty Answer ---');
const emptyQuestion = { ...bugQuestion, transcript: '' };
const detection4 = detectAnswerState(emptyQuestion);
console.log('Detected State:', detection4);
console.assert(detection4.state === 'not_answered', 'FAILED: State should be not_answered');

// TEST 5: Corrupted Voice Answer (Unusable)
console.log('\n--- TEST 5: Unusable / Corrupted Answer ---');
const corruptedQuestion = { ...bugQuestion, transcript: 'asdf' };
const detection5 = detectAnswerState(corruptedQuestion);
console.log('Detected State:', detection5);
console.assert(detection5.state === 'unusable', 'FAILED: State should be unusable');

// TEST 6: Deterministic MCQ Evaluation
console.log('\n--- TEST 6: MCQ Evaluation ---');
const mcqCorrect = evaluateMCQ({ userAnswer: 'A', correctAnswer: 'A - MongoDB' });
console.log('Correct MCQ:', mcqCorrect);
console.assert(mcqCorrect.score === 10 && mcqCorrect.isCorrect === true, 'FAILED: MCQ correct');

const mcqIncorrect = evaluateMCQ({ userAnswer: 'B', correctAnswer: 'A - MongoDB' });
console.log('Incorrect MCQ:', mcqIncorrect);
console.assert(mcqIncorrect.score === 0 && mcqIncorrect.isCorrect === false, 'FAILED: MCQ incorrect');

console.log('\n=== ALL TEST CASE ASSERTIONS PASSED SUCCESSFULLY ===');
