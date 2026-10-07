const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const candidateSkillIntelligenceService = require('../services/candidateSkillIntelligence.service');
const candidateInterviewJourneyService = require('../services/candidateInterviewJourney.service');

async function testE2E() {
  console.log('=== STARTING SKILL MATRIX & INTERVIEW JOURNEY E2E TEST ===');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/candidateiq');
    console.log('[MongoDB] Connected.');

    const user = await User.findOne({ role: 'candidate' }) || await User.findOne({});
    if (!user) {
      console.log('No user found in DB.');
      process.exit(0);
    }

    console.log(`[Test] User: ${user._id} (${user.email})`);

    // 1. Skill Matrix Test
    const skillMatrix = await candidateSkillIntelligenceService.getCandidateSkillMatrix(user._id);
    console.log('\n--- SKILL MATRIX RESPONSE ---');
    console.log('Total Skills:', skillMatrix.skills.length);
    console.log('Summary Metrics:', JSON.stringify(skillMatrix.summaryMetrics, null, 2));
    console.log('Skill Gap Analysis:', JSON.stringify(skillMatrix.skillGapAnalysis, null, 2));
    if (skillMatrix.skills.length > 0) {
      console.log('Sample Skill Record:', JSON.stringify(skillMatrix.skills[0], null, 2));
    }

    // 2. Interview Journey Test
    const journey = await candidateInterviewJourneyService.getCandidateInterviewJourney(user._id);
    console.log('\n--- INTERVIEW JOURNEY RESPONSE ---');
    console.log('Has Interviews:', journey.hasInterviews);
    console.log('Total Attempts:', journey.summaryMetrics.totalAttempts);
    console.log('Performance Trend:', JSON.stringify(journey.performanceTrend, null, 2));
    if (journey.interviews.length > 0) {
      console.log('Sample Journey Attempt:', JSON.stringify(journey.interviews[0], null, 2));
    }

    console.log('\n=== SKILL MATRIX & INTERVIEW JOURNEY E2E TEST PASSED ===');
  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testE2E();
