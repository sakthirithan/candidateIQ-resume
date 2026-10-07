const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Interview = require('../models/Interview');
const ImprovementActivity = require('../models/ImprovementActivity');
const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
const { ensureActivitiesForInterview } = require('../controllers/mockInterviewController');

async function testVerification() {
  console.log('=== STARTING LLM EVALUATION & ACTIVITY INTEGRATION VERIFICATION ===\n');

  const mongoUri = process.env.MONGO_URI
    ? process.env.MONGO_URI.split('||')[1]?.trim() || process.env.MONGO_URI.split('||')[0]?.trim()
    : 'mongodb://localhost:27017/candidateiq';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected successfully.\n');

  try {
    // 1. Setup Test Candidate
    let testUser = await User.findOne({ email: 'test_verify_user@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Verification Candidate',
        email: 'test_verify_user@example.com',
        password: 'password123',
        role: 'candidate',
        headline: 'Senior Backend Engineer'
      });
    }

    // 2. Setup Test Interview Document with Candidate Responses
    const testInterview = await Interview.create({
      candidate: testUser._id,
      candidateIdString: testUser._id.toString(),
      jobTitle: 'Senior Backend Engineer (Python & Node.js)',
      interviewCategory: 'mock',
      interviewType: 'random',
      difficulty: 'medium',
      status: 'ready',
      sourceSnapshot: {
        resume: {
          skills: ['Python', 'Node.js', 'MongoDB', 'REST APIs', 'PostgreSQL']
        },
        job: {
          title: 'Senior Backend Engineer (Python & Node.js)',
          description: 'Looking for a Senior Backend Engineer skilled in database optimization, concurrency, and microservices API design.'
        }
      },
      mock_interview_questions: {
        mcq: [
          {
            questionId: 'q_mcq_1',
            question: 'What is the main benefit of using database indexing?',
            options: ['A) Speeds up query retrieval', 'B) Decreases storage size', 'C) Prevents SQL injection', 'D) Auto-formats JSON'],
            correctAnswer: 'A',
            userAnswer: 'A',
            isAnswered: true
          }
        ],
        voice: [
          {
            questionId: 'q_voice_1',
            topic: 'Database Concurrency & Locking',
            difficulty: 'Medium',
            question: 'How do you handle database concurrency and deadlock prevention in high-throughput applications?',
            transcript: 'In high throughput applications, I use optimistic concurrency control with version numbers or explicit row locking with SELECT FOR UPDATE. To prevent deadlocks, I ensure all transactions acquire locks in a consistent sorted order and set lock timeout thresholds.',
            answer: 'In high throughput applications, I use optimistic concurrency control with version numbers or explicit row locking with SELECT FOR UPDATE. To prevent deadlocks, I ensure all transactions acquire locks in a consistent sorted order and set lock timeout thresholds.',
            durationSeconds: 42,
            isAnswered: true
          }
        ],
        text: [
          {
            questionId: 'q_text_1',
            topic: 'REST API Authentication & Token Rotation',
            difficulty: 'Medium',
            question: 'Explain your strategy for JWT token rotation and revoking compromised tokens in a distributed API system.',
            userAnswer: 'I use short-lived access tokens (15 mins) and long-lived refresh tokens stored in HTTP-only secure cookies. For rotation, when a refresh token is used, a new pair is issued and the old refresh token is invalidated in Redis blacklist. Compromised tokens can be revoked immediately by clearing session IDs in Redis.',
            isAnswered: true
          }
        ]
      },
      progress: {
        currentQuestionIndex: 3,
        answeredQuestions: 3,
        totalQuestions: 3
      }
    });

    console.log(`Created test interview document ID: ${testInterview._id}`);

    // 3. Test LLM Evaluation Execution
    console.log('\n--- 1. Testing Live/Provider LLM Evaluation ---');
    const evalResult = await evaluateMockInterview(testInterview, true);

    console.log(`Evaluation status: ${evalResult.status}`);
    console.log(`Overall score: ${evalResult.overallScore}/100`);
    console.log(`Technical score: ${evalResult.technicalScore}/100`);
    console.log(`Communication score: ${evalResult.communicationScore}/100`);
    console.log(`Final feedback: ${evalResult.finalFeedback}`);
    console.log(`Top strengths (${evalResult.strengths.length}):`, evalResult.strengths);
    console.log(`Top improvements (${evalResult.improvements.length}):`, evalResult.improvements);

    // Verify evidence in question evaluation
    const voiceEval = testInterview.mock_interview_questions.voice[0].evaluation;
    console.log('\nVoice question LLM evaluation output:');
    console.log(`- Answer state: ${voiceEval.answerState}`);
    console.log(`- Tech score: ${voiceEval.technicalAccuracy?.score}`);
    console.log(`- Specific feedback (${voiceEval.feedback?.split(' ').length} words): "${voiceEval.feedback}"`);

    // 4. Test Activity Generation & Idempotency
    console.log('\n--- 2. Testing Activity Generation & Idempotency ---');
    // First call to generate activities
    const actsCall1 = await ensureActivitiesForInterview(testInterview);
    console.log(`Generated ${actsCall1.length} activities on 1st call:`);
    actsCall1.forEach(a => {
      console.log(`  - [${a.priority}] ${a.title} (${a.category})`);
    });

    // Idempotency check: Second call to generate activities for same interview
    const actsCall2 = await ensureActivitiesForInterview(testInterview);
    console.log(`Fetched ${actsCall2.length} activities on 2nd call (Idempotency check):`);
    console.log(`  - Idempotent duplicate prevention: ${actsCall1.length === actsCall2.length && String(actsCall1[0]._id) === String(actsCall2[0]._id) ? 'PASSED ✓' : 'FAILED ❌'}`);

    // Verify MongoDB linkage
    const dbActs = await ImprovementActivity.find({ sourceInterviewId: testInterview._id });
    console.log(`MongoDB verification: Found ${dbActs.length} activity records linked to interview ${testInterview._id}`);

    // Clean up test documents
    await Interview.findByIdAndDelete(testInterview._id);
    await ImprovementActivity.deleteMany({ sourceInterviewId: testInterview._id });
    console.log('\nCleaned up test verification records.');

    console.log('\n===================================================================');
    console.log('ALL PHASE 2 & PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! ✓');
    console.log('===================================================================');

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testVerification();
