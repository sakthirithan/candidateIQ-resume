const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Interview = require('../models/Interview');

async function verifyDbRecords() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('[VERIFY] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[VERIFY] Connected to MongoDB.');

    const mockInterviews = await Interview.find({ interviewCategory: 'mock' }).sort({ createdAt: -1 });
    console.log(`[VERIFY] Found ${mockInterviews.length} mock interviews in MongoDB:`);

    mockInterviews.forEach((inv, i) => {
      console.log(`\n--- Mock Interview ${i + 1} ---`);
      console.log('ID:', inv._id.toString());
      console.log('Candidate ID:', inv.candidate?.toString() || inv.candidateIdString);
      console.log('Job Title:', inv.jobTitle);
      console.log('Status:', inv.status);
      console.log('Evaluation Status:', inv.evaluation?.status);
      console.log('Overall Score:', inv.evaluation?.overallScore);
      console.log('Technical Score:', inv.evaluation?.technicalScore);
      console.log('Communication Score:', inv.evaluation?.communicationScore);
      console.log('Question counts:', {
        mcq: inv.mock_interview_questions?.mcq?.length || 0,
        voice: inv.mock_interview_questions?.voice?.length || 0,
        text: inv.mock_interview_questions?.text?.length || 0
      });
    });

  } catch (err) {
    console.error('Verification Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyDbRecords();
