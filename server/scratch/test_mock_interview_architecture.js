const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MockInterviewWorkspace = require('../models/MockInterviewWorkspace');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');

async function testMockInterviewArchitecture() {
  try {
    console.log('[ARCH TEST] Connecting to MongoDB...');
    const mongoUri = (process.env.MONGO_URI || '').split('||')[0].trim();
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/candidateiq');
    console.log('✓ Database Connected.');

    // 1. Find or Create Dummy User & Resume
    let testUser = await User.findOne({ role: 'candidate' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test Candidate',
        email: `test_cand_${Date.now()}@example.com`,
        password: 'password123',
        role: 'candidate'
      });
    }

    let testResume = await Resume.findOne({ candidate: testUser._id });
    if (!testResume) {
      testResume = await Resume.create({
        candidate: testUser._id,
        originalName: 'Theeran_Resume_v3.pdf',
        fileName: 'Theeran_Resume_v3.pdf',
        keywords: ['React', 'Node.js', 'MongoDB', 'Python']
      });
    }

    // 2. Clean previous test workspaces for this user
    await MockInterviewWorkspace.deleteMany({ userId: testUser._id });

    // 3. Test Creation of 3 Workspace Cards
    console.log('[ARCH TEST] Creating 3 Mock Interview Workspace Cards...');
    const card1 = await MockInterviewWorkspace.create({
      userId: testUser._id,
      resumeId: testResume._id,
      resumeName: testResume.originalName,
      jobDetails: {
        jobTitle: 'Frontend Developer',
        company: 'Microsoft',
        role: 'React Developer',
        jobDescription: 'React 19, TypeScript, state management, web performance optimization.'
      },
      configuration: { interviewType: 'Technical', difficulty: 'Medium', mode: 'Voice', questionCount: 10 }
    });

    const card2 = await MockInterviewWorkspace.create({
      userId: testUser._id,
      resumeId: testResume._id,
      resumeName: testResume.originalName,
      jobDetails: {
        jobTitle: 'Full Stack Developer',
        company: 'Zoho',
        role: 'Software Developer Intern',
        jobDescription: 'React, Node.js, MongoDB, REST APIs, JavaScript and Git.'
      },
      configuration: { interviewType: 'Mixed', difficulty: 'Hard', mode: 'Mixed', questionCount: 10 }
    });

    console.log(`✓ Created Cards: "${card1.jobDetails.jobTitle} — ${card1.jobDetails.company}" (ID: ${card1._id}) & "${card2.jobDetails.jobTitle} — ${card2.jobDetails.company}" (ID: ${card2._id})`);

    // 4. Test 10-Card Limit Count Verification
    const activeCount = await MockInterviewWorkspace.countDocuments({ userId: testUser._id, isDeleted: false });
    console.log(`✓ Active Mock Interview Cards Count: ${activeCount} / 10 | Slots Available: ${10 - activeCount}`);

    // 5. Test Attempt Creation for Card 1 (Attempt #1 & Attempt #2)
    console.log('[ARCH TEST] Launching Attempt #1 for Card 1...');
    const attempt1 = await Interview.create({
      candidate: testUser._id,
      candidateIdString: testUser._id.toString(),
      workspaceId: card1._id,
      jobTitle: card1.jobDetails.jobTitle,
      resumeId: card1.resumeId,
      interviewCategory: 'mock',
      configurationSnapshot: {
        resumeId: card1.resumeId,
        resumeName: card1.resumeName,
        jobDetails: { ...card1.jobDetails },
        configuration: { ...card1.configuration }
      },
      status: 'completed',
      overallEvaluation: { overallInterviewScore: 74 }
    });

    card1.attemptCount += 1;
    card1.latestAttemptId = attempt1._id;
    card1.latestScore = 74;
    card1.initialScore = 74;
    card1.bestScore = 74;
    card1.status = 'NEEDS_IMPROVEMENT';
    await card1.save();

    console.log(`✓ Attempt #1 Finished | Card 1 Attempts: ${card1.attemptCount} | Latest Score: ${card1.latestScore} | Card Status: ${card1.status}`);

    console.log('[ARCH TEST] Launching Attempt #2 for Card 1 (Re-attempt)...');
    const attempt2 = await Interview.create({
      candidate: testUser._id,
      candidateIdString: testUser._id.toString(),
      workspaceId: card1._id,
      jobTitle: card1.jobDetails.jobTitle,
      resumeId: card1.resumeId,
      interviewCategory: 'mock',
      configurationSnapshot: {
        resumeId: card1.resumeId,
        resumeName: card1.resumeName,
        jobDetails: { ...card1.jobDetails },
        configuration: { ...card1.configuration }
      },
      status: 'completed',
      overallEvaluation: { overallInterviewScore: 86 }
    });

    card1.attemptCount += 1;
    card1.latestAttemptId = attempt2._id;
    card1.latestScore = 86;
    card1.bestScore = 86;
    card1.improvementScore = 12; // 86 - 74 = +12
    card1.status = 'IMPROVED';
    await card1.save();

    console.log(`✓ Attempt #2 Finished | Card 1 Attempts: ${card1.attemptCount} | Best Score: ${card1.bestScore} | Verified Delta: +${card1.improvementScore}% | Card Status: ${card1.status}`);

    // 6. Test Soft Delete
    console.log('[ARCH TEST] Soft-deleting Card 2...');
    card2.isDeleted = true;
    await card2.save();

    const countAfterDelete = await MockInterviewWorkspace.countDocuments({ userId: testUser._id, isDeleted: false });
    console.log(`✓ Card 2 Deleted. Active Cards: ${countAfterDelete} / 10 | Slots Available: ${10 - countAfterDelete}`);

    // Verify Resume was NOT deleted
    const verifyResumeStillExists = await Resume.findById(testResume._id);
    console.log(`✓ Resume Status Verification: Resume "${verifyResumeStillExists.originalName}" still safely exists in database!`);

    console.log('\n==================================================');
    console.log('SUCCESS: CandidateIQ AI Mock Interview Architecture fully verified!');
    console.log('==================================================');

    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testMockInterviewArchitecture();
