const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const { evaluateSingleQuestion } = require('../services/ai/mockInterview/mockInterviewEvaluator');

async function testQuestionIsolation() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[TEST] Connected to MongoDB.');

    const interview = await Interview.findById('6ab7d637dbf2ecdc5c7f1b6f');
    if (!interview) {
      console.error('[TEST] Interview 6ab7d637dbf2ecdc5c7f1b6f not found');
      process.exit(1);
    }

    const voiceQuestions = interview.mock_interview_questions?.voice || [];
    console.log(`[TEST] Loaded ${voiceQuestions.length} voice questions from interview.`);

    // Test Question 1 (voice-001): Microservices & Scalability
    const vq1 = voiceQuestions[0];
    console.log('\n==================================================');
    console.log('--- TESTING QUESTION 1 (voice-001: Microservice Architecture) ---');
    console.log('Question Text:', vq1.question);
    console.log('Transcript:', `"${vq1.transcript}"`);

    const eval1 = await evaluateSingleQuestion({
      questionItem: vq1,
      type: 'voice',
      resumeData: interview.sourceSnapshot?.resume,
      jobData: interview.sourceSnapshot?.job
    });

    console.log('\nQ1 EVALUATION RESULT:');
    console.log('Answer State:', eval1.answerState);
    console.log('Relevance Score:', eval1.relevance?.score);
    console.log('Technical Score:', eval1.technicalAccuracy?.score);
    console.log('Feedback:', `"${eval1.feedback}"`);

    // Test Question 2 (voice-002): Nginx 502 Bad Gateway Debugging
    const vq2 = voiceQuestions[1];
    console.log('\n==================================================');
    console.log('--- TESTING QUESTION 2 (voice-002: Nginx 502 Bad Gateway) ---');
    console.log('Question Text:', vq2.question);
    console.log('Transcript:', `"${vq2.transcript}"`);

    const eval2 = await evaluateSingleQuestion({
      questionItem: vq2,
      type: 'voice',
      resumeData: interview.sourceSnapshot?.resume,
      jobData: interview.sourceSnapshot?.job
    });

    console.log('\nQ2 EVALUATION RESULT:');
    console.log('Answer State:', eval2.answerState);
    console.log('Relevance Score:', eval2.relevance?.score);
    console.log('Technical Score:', eval2.technicalAccuracy?.score);
    console.log('Feedback:', `"${eval2.feedback}"`);

    // ASSERTION 1: Feedback must be completely different between Q1 and Q2
    console.log('\n==================================================');
    console.log('--- ISOLATION VERIFICATION ---');
    const isFeedbackDifferent = eval1.feedback !== eval2.feedback;
    console.log('Is Q1 feedback different from Q2 feedback?', isFeedbackDifferent ? 'YES (PASSED)' : 'NO (FAILED)');

    // ASSERTION 2: Q2 feedback must NOT mention Q1 microservice / gRPC / Kafka topics unless transcript has them
    const q2MentionsMicroserviceLeak = /gRPC|kafka|video upload/i.test(eval2.feedback);
    console.log('Does Q2 feedback leak Q1 terms (gRPC, Kafka, Video Upload)?', q2MentionsMicroserviceLeak ? 'YES (FAILED)' : 'NO (PASSED)');

    if (isFeedbackDifferent && !q2MentionsMicroserviceLeak) {
      console.log('\n✨ ABSOLUTE CONTEXT ISOLATION VERIFIED SUCCESSFULLY! ✨');
    } else {
      console.error('\n❌ CONTEXT ISOLATION FAILED!');
    }

  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testQuestionIsolation();
