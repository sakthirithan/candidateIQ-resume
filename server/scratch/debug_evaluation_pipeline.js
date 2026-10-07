const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');

async function debugEvaluationPipeline() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/candidateiq';
    console.log('[DEBUG] Connecting to MongoDB:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(mongoUri);
    console.log('[DEBUG] MongoDB Connected successfully.');

    // Find the specified mock interview or latest mock interview
    let interview = await Interview.findById('6ab7d637dbf2ecdc5c7f1b6f');
    if (!interview) {
      console.log('[DEBUG] Mock interview 6ab7d637dbf2ecdc5c7f1b6f not found by exact ID, fetching latest mock interview...');
      interview = await Interview.findOne({ interviewCategory: 'mock' }).sort({ createdAt: -1 });
    }

    if (!interview) {
      console.error('[DEBUG_ERROR] No mock interview document found in database!');
      process.exit(1);
    }

    console.log('[DEBUG] Target MockInterview ID:', interview._id.toString());
    console.log('[DEBUG] Interview Status:', interview.status);
    
    const voiceQuestions = interview.mock_interview_questions?.voice || [];
    console.log('[DEBUG] Voice Questions Count:', voiceQuestions.length);
    voiceQuestions.forEach((vq, i) => {
      console.log(`\n--- Voice Question ${i + 1} (${vq.questionId}) ---`);
      console.log('Question:', vq.question);
      console.log('Transcript:', `"${vq.transcript || vq.answer || vq.userAnswer || ''}"`);
      console.log('IsAnswered:', vq.isAnswered);
    });

    console.log('\n[DEBUG] Running full evaluateMockInterview pipeline...');
    const finalEval = await evaluateMockInterview(interview, true);
    console.log('\n[DEBUG_SUCCESS] Full MockInterview Evaluation Persisted to MongoDB:');
    console.log(JSON.stringify(finalEval, null, 2));

    const updatedDoc = await Interview.findById(interview._id);
    console.log('\n[DEBUG] Updated Mongoose Document State:');
    console.log('Document ID:', updatedDoc._id);
    console.log('Status:', updatedDoc.status);
    console.log('Evaluation Status:', updatedDoc.evaluation?.status);
    console.log('Overall Score:', updatedDoc.evaluation?.overallScore);
    console.log('Technical Score:', updatedDoc.evaluation?.technicalScore);
    console.log('Communication Score:', updatedDoc.evaluation?.communicationScore);
    console.log('Reasoning Score:', updatedDoc.evaluation?.reasoningScore);
    console.log('Behavioural Score:', updatedDoc.evaluation?.behaviouralScore);

  } catch (err) {
    console.error('[DEBUG_FAILURE] Evaluation pipeline failed with error:');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Stack Trace:', err.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugEvaluationPipeline();
