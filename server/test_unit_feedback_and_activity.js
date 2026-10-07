const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const assert = require('assert');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Interview = require('./models/Interview');
const ImprovementActivity = require('./models/ImprovementActivity');

const {
  detectAnswerState,
  evaluateMCQ,
  evaluateSingleQuestion,
  evaluateMockInterview,
  validateEvidenceConsistency,
  normalizeFeedbackWordCount,
  generateIrrelevantFeedback
} = require('./services/ai/mockInterview/mockInterviewEvaluator');

const {
  calculateTranscriptFillers,
  generateActivitiesForInterview
} = require('./services/ai/improvement/activityGeneratorService');

const { ensureActivitiesForInterview } = require('./controllers/mockInterviewController');

async function runUnitTests() {
  console.log('===================================================================');
  console.log('=== CANDIDATEIQ UNIT TESTS: AI FEEDBACK & ACTIVITY GENERATION ===');
  console.log('===================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(testName, testFn) {
    totalTests++;
    try {
      testFn();
      console.log(`  ✓ PASSED: ${testName}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${testName}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  async function runAsyncTest(testName, testFn) {
    totalTests++;
    try {
      await testFn();
      console.log(`  ✓ PASSED: ${testName}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${testName}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  // -------------------------------------------------------------------------
  // SECTION 1: DETECT ANSWER STATE & GUARD LOGIC UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('--- SECTION 1: Answer State Detection & Guard Logic ---');

  runTest('detectAnswerState - Empty/missing answer returns not_answered', () => {
    const res = detectAnswerState({ question: 'Explain React hooks', transcript: '' });
    assert.strictEqual(res.state, 'not_answered');
  });

  runTest('detectAnswerState - Short/corrupted text returns unusable', () => {
    const res = detectAnswerState({ question: 'Explain React hooks', transcript: 'abcd' });
    assert.strictEqual(res.state, 'unusable');
  });

  runTest('detectAnswerState - Dictation/UI noise returns irrelevant', () => {
    const res = detectAnswerState({ question: 'Explain React hooks', transcript: 'testing 1 2 3 hello hello how are you' });
    assert.strictEqual(res.state, 'irrelevant');
  });

  runTest('detectAnswerState - Zero keyword overlap returns irrelevant', () => {
    const res = detectAnswerState({
      question: 'Explain PostgreSQL B-tree indexing and query optimization',
      topic: 'PostgreSQL Indexing',
      expectedSkills: ['PostgreSQL', 'B-tree', 'SQL'],
      transcript: 'I enjoy baking chocolate chip cookies on weekends with warm milk.'
    });
    assert.strictEqual(res.state, 'irrelevant');
  });

  runTest('detectAnswerState - Relevant technical domain response returns answered', () => {
    const res = detectAnswerState({
      question: 'Explain PostgreSQL B-tree indexing and query optimization',
      topic: 'PostgreSQL Indexing',
      expectedSkills: ['PostgreSQL', 'B-tree', 'SQL'],
      transcript: 'PostgreSQL B-tree indexes speed up query execution by organizing key values in a balanced tree structure for fast logarithmic lookups.'
    });
    assert.strictEqual(res.state, 'answered');
  });

  // -------------------------------------------------------------------------
  // SECTION 2: MCQ DETERMINISTIC EVALUATION UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: MCQ Evaluation Unit Tests ---');

  runTest('evaluateMCQ - Correct answer gives 10/10 score and isCorrect=true', () => {
    const res = evaluateMCQ({
      userAnswer: 'A) Speeds up query retrieval',
      correctAnswer: 'A) Speeds up query retrieval'
    });
    assert.strictEqual(res.isCorrect, true);
    assert.strictEqual(res.score, 10);
    assert.strictEqual(res.answerState, 'answered');
  });

  runTest('evaluateMCQ - Incorrect option gives 0 score and isCorrect=false', () => {
    const res = evaluateMCQ({
      userAnswer: 'B) Decreases storage size',
      correctAnswer: 'A) Speeds up query retrieval'
    });
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.score, 0);
    assert.strictEqual(res.answerState, 'answered');
  });

  runTest('evaluateMCQ - Unanswered MCQ gives not_answered state', () => {
    const res = evaluateMCQ({
      userAnswer: '',
      correctAnswer: 'A'
    });
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.score, 0);
    assert.strictEqual(res.answerState, 'not_answered');
  });

  // -------------------------------------------------------------------------
  // SECTION 3: WORD COUNT & CONSISTENCY SANITIZATION UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Feedback Word Count & Consistency Sanitization ---');

  runTest('normalizeFeedbackWordCount - Normalizes long text to 20-25 words', () => {
    const longText = 'Your explanation of microservices architectural patterns and database query indexing strategies demonstrated good foundational domain knowledge, but adding more detailed trade-offs regarding memory management, async event loops, and concurrency limits would significantly strengthen your engineering response.';
    const normalized = normalizeFeedbackWordCount(longText, 'answered', 'voice');
    const wordCount = normalized.trim().split(/\s+/).length;
    assert(wordCount >= 20 && wordCount <= 25, `Word count ${wordCount} should be between 20 and 25`);
  });

  runTest('normalizeFeedbackWordCount - Normalizes short text to 20-25 words', () => {
    const shortText = 'Good answer on database indexing concepts.';
    const normalized = normalizeFeedbackWordCount(shortText, 'answered', 'text');
    const wordCount = normalized.trim().split(/\s+/).length;
    assert(wordCount >= 20 && wordCount <= 25, `Word count ${wordCount} should be between 20 and 25`);
  });

  runTest('generateIrrelevantFeedback - Returns question-specific irrelevant message with 20-25 words', () => {
    const feedback = generateIrrelevantFeedback('How do you optimize React render cycles?', 'React Performance');
    const wordCount = feedback.trim().split(/\s+/).length;
    assert(wordCount >= 20 && wordCount <= 25, `Word count ${wordCount} should be between 20 and 25`);
    assert(feedback.includes('React Performance') || feedback.includes('technical requirements'));
  });

  // -------------------------------------------------------------------------
  // SECTION 4: AI MOCK INTERVIEW EVALUATOR UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 4: AI Mock Interview Evaluator (Live LLM Prompt Evaluation) ---');

  await runAsyncTest('evaluateSingleQuestion - Evaluates technical voice response via LLM Orchestrator', async () => {
    const qItem = {
      questionId: 'unit_q_voice_1',
      topic: 'React State Management & Performance',
      difficulty: 'Medium',
      question: 'How do you prevent unnecessary component re-renders in a large React application?',
      transcript: 'I use React.memo for pure functional components, useMemo to cache expensive computations, and useCallback to preserve reference equality for callback props. Additionally, I flatten context state to avoid re-rendering consumer components.',
      durationSeconds: 30,
      voiceMetrics: { wordCount: 42, wpm: 140, fillerCount: 1 }
    };

    const evalRes = await evaluateSingleQuestion({
      questionItem: qItem,
      type: 'voice',
      resumeData: { headline: 'Senior Frontend Developer', skills: ['React', 'TypeScript', 'Redux'] },
      jobData: { title: 'Senior Frontend Engineer', requiredSkills: ['React', 'TypeScript'] }
    });

    assert.strictEqual(evalRes.answerState, 'answered');
    assert(evalRes.technicalAccuracy.score >= 7, 'Technical score should be >= 7 for a strong React answer');
    assert(Array.isArray(evalRes.demonstratedEvidence), 'demonstratedEvidence should be an array');
    assert(evalRes.demonstratedEvidence.length > 0, 'Should extract demonstrated evidence from candidate answer');
    
    const wordCount = evalRes.feedback.trim().split(/\s+/).length;
    assert(wordCount >= 20 && wordCount <= 25, `Feedback word count (${wordCount}) must be strictly 20-25 words`);
  });

  // -------------------------------------------------------------------------
  // SECTION 5: ACTIVITY GENERATOR SERVICE UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Improvement Activity Generator Unit Tests ---');

  runTest('generateActivitiesForInterview - Weak technical candidate generates CEET Technical activity', async () => {
    const dummyInterview = {
      jobTitle: 'Backend Engineer',
      evaluation: {
        overallScore: 65,
        technicalScore: 60,
        communicationScore: 75,
        behaviouralScore: 80,
        improvements: ['Database query indexing', 'Concurrency trade-offs']
      }
    };
    const activities = await generateActivitiesForInterview(dummyInterview);
    assert(activities.length >= 1, 'Should generate at least 1 activity');
    const techAct = activities.find(a => a.category === 'technical');
    assert(techAct !== undefined, 'Should generate a technical improvement activity');
    assert.strictEqual(techAct.recommendedFramework, 'CEET');
    assert.strictEqual(techAct.targetMetricName, 'technicalScore');
    assert(techAct.detectedIssue.includes('60/100'));
  });

  runTest('generateActivitiesForInterview - High vocal fillers candidate generates CONTROLLED_PAUSE activity', async () => {
    const dummyInterview = {
      jobTitle: 'Full Stack Engineer',
      evaluation: { overallScore: 75, technicalScore: 80, communicationScore: 60, behaviouralScore: 75 },
      mock_interview_questions: {
        voice: [
          { transcript: 'Um so basically like I created like a React component um you know and like it re-renders so basically yeah.', durationSeconds: 60 }
        ]
      }
    };
    const activities = await generateActivitiesForInterview(dummyInterview);
    const fillerAct = activities.find(a => a.skill === 'filler_words');
    assert(fillerAct !== undefined, 'Should generate a vocal filler reduction activity');
    assert.strictEqual(fillerAct.recommendedFramework, 'CONTROLLED_PAUSE');
    assert.strictEqual(fillerAct.comparisonOperator, '<=');
  });

  runTest('generateActivitiesForInterview - High performing candidate (Score 90+) generates Advanced Architecture activity', async () => {
    const dummyInterview = {
      jobTitle: 'Senior AI Engineer',
      evaluation: { overallScore: 92, technicalScore: 94, communicationScore: 90, behaviouralScore: 92 }
    };
    const activities = await generateActivitiesForInterview(dummyInterview);
    assert(activities.length >= 1, 'High performing candidate must still receive at least 1 activity');
    const advAct = activities.find(a => a.skill === 'advanced_architecture');
    assert(advAct !== undefined, 'High performing candidate should receive an advanced architecture mastery activity');
    assert(advAct.title.includes('Advanced Senior AI Engineer System Architecture Mastery'));
  });

  // -------------------------------------------------------------------------
  // SECTION 6: ACTIVITY IDEMPOTENCY & DATABASE INTEGRATION UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 6: MongoDB Persistence & Idempotency Unit Tests ---');

  const mongoUri = process.env.MONGO_URI
    ? process.env.MONGO_URI.split('||')[1]?.trim() || process.env.MONGO_URI.split('||')[0]?.trim()
    : 'mongodb://localhost:27017/candidateiq';

  console.log('Connecting to MongoDB for database persistence unit tests...');
  await mongoose.connect(mongoUri);

  try {
    let candidateUser = await User.findOne({ email: 'unit_activity_tester@example.com' });
    if (!candidateUser) {
      candidateUser = await User.create({
        name: 'Unit Tester',
        email: 'unit_activity_tester@example.com',
        password: 'password123',
        role: 'candidate'
      });
    }

    const testInterviewDoc = await Interview.create({
      candidate: candidateUser._id,
      candidateIdString: candidateUser._id.toString(),
      jobTitle: 'DevOps / Site Reliability Engineer',
      interviewCategory: 'mock',
      interviewType: 'voice',
      difficulty: 'hard',
      status: 'completed',
      evaluation: {
        overallScore: 72,
        technicalScore: 68,
        communicationScore: 65,
        behaviouralScore: 70,
        improvements: ['Kubernetes cluster security', 'Prometheus monitoring metrics']
      }
    });

    await runAsyncTest('ensureActivitiesForInterview - Creates linked ImprovementActivity records in MongoDB', async () => {
      const created = await ensureActivitiesForInterview(testInterviewDoc);
      assert(created.length >= 1, 'Should create activity records');
      assert.strictEqual(String(created[0].userId), String(candidateUser._id));
      assert.strictEqual(String(created[0].sourceInterviewId), String(testInterviewDoc._id));
      assert.strictEqual(created[0].status, 'PENDING');
    });

    await runAsyncTest('ensureActivitiesForInterview - Idempotency Check (Does not duplicate on re-run)', async () => {
      const secondCall = await ensureActivitiesForInterview(testInterviewDoc);
      const allInDb = await ImprovementActivity.find({ sourceInterviewId: testInterviewDoc._id });
      assert.strictEqual(secondCall.length, allInDb.length, 'Second call must return existing activities without duplicating');
      assert.strictEqual(String(secondCall[0]._id), String(allInDb[0]._id), 'Activity IDs must match existing DB records');
    });

    // Cleanup test records
    await Interview.findByIdAndDelete(testInterviewDoc._id);
    await ImprovementActivity.deleteMany({ sourceInterviewId: testInterviewDoc._id });
    console.log('  ✓ Cleaned up database test records');

  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }

  // -------------------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n===================================================================');
  console.log(`UNIT TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED ✓`);
  console.log('===================================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runUnitTests();
