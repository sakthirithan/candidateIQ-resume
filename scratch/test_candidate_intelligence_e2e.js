const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const User = require('../server/models/User');
const CandidateProfile = require('../server/models/CandidateProfile');
const Resume = require('../server/models/Resume');
const Interview = require('../server/models/Interview');
const Job = require('../server/models/Job');
const candidateIntelligenceService = require('../server/services/candidateIntelligenceService');

async function runE2ETest() {
  console.log('=== STARTING CANDIDATE INTELLIGENCE E2E TEST ===');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/candidateiq');
    console.log('[MongoDB] Connected successfully.');

    // Find candidate user
    let candidateUser = await User.findOne({ role: 'candidate' });
    if (!candidateUser) {
      candidateUser = await User.findOne({});
    }

    if (!candidateUser) {
      console.log('No user found in DB. Skipping live user query.');
      process.exit(0);
    }

    console.log(`[Test] Testing intelligence service for User ID: ${candidateUser._id} (${candidateUser.email})`);

    const intelligence = await candidateIntelligenceService.getCandidateIntelligence(candidateUser._id, {
      forceRefresh: true
    });

    console.log('\n--- CALCULATED INTELLIGENCE SNAPSHOT ---');
    console.log('Overall Candidate IQ Score:', JSON.stringify(intelligence.overallScore, null, 2));
    console.log('\nResume Quality:', JSON.stringify(intelligence.resumeQuality, null, 2));
    console.log('\nTechnical Score:', JSON.stringify(intelligence.technicalScore, null, 2));
    console.log('\nMarket Job Match:', JSON.stringify(intelligence.marketJobMatch, null, 2));
    console.log('\nTop Evaluated Technical Skills Count:', intelligence.technicalSkills?.length || 0);
    if (intelligence.technicalSkills?.length > 0) {
      console.log('Sample Technical Skill:', JSON.stringify(intelligence.technicalSkills[0], null, 2));
    }
    console.log('\nTop Matched Requisitions Count:', intelligence.matchedJobs?.length || 0);
    if (intelligence.matchedJobs?.length > 0) {
      console.log('Sample Matched Job:', JSON.stringify(intelligence.matchedJobs[0], null, 2));
    }

    console.log('\nData Completeness:', JSON.stringify(intelligence.dataCompleteness, null, 2));
    console.log('Formula Version:', intelligence.formulaVersion);

    console.log('\n=== CANDIDATE INTELLIGENCE E2E TEST COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runE2ETest();
