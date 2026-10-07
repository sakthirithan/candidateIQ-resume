const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');

async function testPipelineLoop() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[TEST] Connected to MongoDB.');

    const interview = await Interview.findById('6ab7d637dbf2ecdc5c7f1b6f');
    if (!interview) {
      console.error('[TEST] Interview 6ab7d637dbf2ecdc5c7f1b6f not found');
      process.exit(1);
    }

    console.log(`[TEST] Starting question-by-question evaluation loop for interview ${interview._id}...`);

    let progressEventCount = 0;
    const progressLog = [];

    const finalEval = await evaluateMockInterview(interview, true, (evt) => {
      progressEventCount++;
      progressLog.push(evt);
      if (evt.type === 'question_started') {
        console.log(`  [PROGRESS] Q${evt.questionNumber}/${evt.totalQuestions} (${evt.questionId}) STARTED - Topic: "${evt.topic}" [${evt.progress}%]`);
      } else if (evt.type === 'question_completed') {
        console.log(`  [PROGRESS] Q${evt.questionNumber}/${evt.totalQuestions} (${evt.questionId}) COMPLETED - Status: ${evt.status} [${evt.progress}%]`);
      } else if (evt.type === 'evaluation_completed') {
        console.log(`  [PROGRESS] ALL QUESTIONS COMPLETED - Overall Score: ${evt.evaluation.overallScore}/100 [100%]`);
      }
    });

    console.log('\n==================================================');
    console.log('--- TEST VERIFICATION ---');
    console.log('Total Progress Events Received:', progressEventCount);
    console.log('Final Aggregate Score:', finalEval.overallScore);
    console.log('Technical Score:', finalEval.technicalScore);
    console.log('Communication Score:', finalEval.communicationScore);

    // Verify MongoDB state after loop
    const reloaded = await Interview.findById(interview._id);
    console.log('\nMongoose Persisted State:');
    console.log('  Evaluation Status:', reloaded.evaluation?.status);
    console.log('  Completed Questions:', reloaded.evaluation?.completedQuestions);
    console.log('  Total Questions:', reloaded.evaluation?.totalQuestions);
    
    const voiceEvals = (reloaded.mock_interview_questions?.voice || []).map(q => ({
      qId: q.questionId,
      status: q.evaluationStatus,
      topic: q.topic,
      feedback: q.evaluation?.feedback
    }));
    console.log('\nVoice Question Evaluations in MongoDB:');
    voiceEvals.forEach((v, idx) => {
      console.log(`  Q${idx + 1} (${v.qId}) [${v.status}]: Topic="${v.topic}"`);
      console.log(`      Feedback: "${v.feedback}"`);
    });

    console.log('\n✨ QUESTION-BY-QUESTION EVALUATION PIPELINE TEST COMPLETE ✨');

  } catch (err) {
    console.error('Test Pipeline Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testPipelineLoop();
