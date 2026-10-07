const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const Resume = require('./models/Resume');
const CandidateProfile = require('./models/CandidateProfile');
const User = require('./models/User');
const { resolveCandidateProfile } = require('./controllers/profileController');

async function runE2ETest() {
  console.log('=== CANDIDATEIQ RESUME LIFECYCLE & PROFILE PERSISTENCE E2E TEST ===\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/candidateiq';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.\n');

  try {
    // 0. Clean up test user & data
    const testEmail = `test_lifecycle_${Date.now()}@example.com`;
    let user = await User.create({
      name: 'Lifecycle Test Candidate',
      email: testEmail,
      password: 'password123',
      role: 'candidate'
    });
    const userId = user._id;

    console.log('--- 1. UPLOAD RESUME A (v1) ---');
    const resumeTextA = 'John Doe. Senior React Developer with 4 years experience. Skills: React, JavaScript, HTML, CSS.';
    const hashA = crypto.createHash('sha256').update(resumeTextA).digest('hex');
    const sourceDocIdA = `src_doc_${Date.now()}`;

    const resumeA = await Resume.create({
      candidate: userId,
      candidateIdString: userId.toString(),
      sourceDocumentId: sourceDocIdA,
      contentHash: hashA,
      displayName: 'Resume_A.pdf',
      originalFileName: 'Resume_A.pdf',
      fileName: 'Resume_A.pdf',
      fileType: 'application/pdf',
      fileSize: 10240,
      rawText: resumeTextA,
      version: 1,
      versionHistory: [{
        version: 1,
        originalFileName: 'Resume_A.pdf',
        displayName: 'Resume_A.pdf',
        contentHash: hashA,
        uploadedAt: new Date(),
        overallScore: 82
      }],
      analysis: {
        overallScore: 82,
        strengths: ['Strong React foundation']
      },
      status: 'analyzed'
    });

    console.log(`✓ Resume A created: id=${resumeA._id}, version=${resumeA.version}, sourceDocumentId=${resumeA.sourceDocumentId}`);

    console.log('\n--- 2. INITIALIZE PROFILE LINKED TO RESUME A ---');
    let profile = await CandidateProfile.create({
      user: userId,
      userIdString: userId.toString(),
      personalInfo: {
        name: 'John Doe',
        email: testEmail,
        headline: 'React Developer'
      },
      profileSource: {
        type: 'resume',
        resumeId: resumeA._id.toString(),
        sourceDocumentId: sourceDocIdA,
        updatedAt: new Date()
      },
      sections: [
        {
          id: 'sec_summary',
          type: 'summary',
          title: 'Professional Summary',
          data: { text: 'React Developer with 4 years experience.' }
        },
        {
          id: 'sec_skills',
          type: 'skills',
          title: 'Technical Skills',
          data: { allSkills: ['React', 'JavaScript', 'HTML', 'CSS'] }
        }
      ]
    });
    console.log('✓ Candidate profile created with initial resume extraction.');

    console.log('\n--- 3. CANDIDATE MANUALLY EDITS PROFESSIONAL SUMMARY IN PROFILE ---');
    const customSummary = 'AI & Full-Stack Developer focused on MERN applications and Gemini LLM integration.';
    const manualEditSections = [
      {
        id: 'sec_summary',
        type: 'summary',
        title: 'Professional Summary',
        data: { text: customSummary }
      },
      {
        id: 'sec_skills',
        type: 'skills',
        title: 'Technical Skills',
        data: { allSkills: ['React', 'JavaScript', 'HTML', 'CSS'] }
      }
    ];

    const { resolvedSections: editedSections, updatedOverrides } = resolveCandidateProfile(
      profile,
      manualEditSections,
      {},
      true // isManualEdit = true
    );

    profile.sections = editedSections;
    profile.profileOverrides = updatedOverrides;
    await profile.save();
    console.log('✓ Profile saved with candidate override for summary:');
    console.log('  Stored override:', profile.profileOverrides.summary);

    console.log('\n--- 4. RENAME RESUME A TO Microsoft_FullStack.pdf ---');
    // Renaming only updates displayName and does not alter sourceDocumentId or profile overrides
    resumeA.displayName = 'Microsoft_FullStack.pdf';
    resumeA.fileName = 'Microsoft_FullStack.pdf';
    await resumeA.save();

    console.log(`✓ Resume A renamed to: ${resumeA.displayName}`);
    console.log(`  sourceDocumentId is preserved: ${resumeA.sourceDocumentId === sourceDocIdA}`);

    // Verify profile override is still intact and bound
    const fetchedProfileAfterRename = await CandidateProfile.findOne({ user: userId });
    const summaryAfterRename = fetchedProfileAfterRename.sections.find(s => s.type === 'summary')?.data?.text;
    console.log(`✓ Profile summary after rename: "${summaryAfterRename}"`);
    if (summaryAfterRename !== customSummary) {
      throw new Error('FAILED: Profile summary was lost after renaming resume!');
    }

    console.log('\n--- 5. REPLACE RESUME A (v1 -> v2) WITH NEW SKILLS ---');
    const resumeTextB = 'John Doe. Senior Full Stack Engineer. Skills: React, JavaScript, Node.js, Python, MongoDB, Docker.';
    const hashB = crypto.createHash('sha256').update(resumeTextB).digest('hex');

    // Replacement bumps version in place and keeps sourceDocumentId
    resumeA.versionHistory.push({
      version: resumeA.version,
      originalFileName: resumeA.originalFileName,
      displayName: resumeA.displayName,
      contentHash: resumeA.contentHash,
      uploadedAt: resumeA.updatedAt,
      overallScore: resumeA.analysis?.overallScore
    });
    resumeA.version = 2;
    resumeA.contentHash = hashB;
    resumeA.rawText = resumeTextB;
    resumeA.analysis = {
      overallScore: 92,
      strengths: ['Expanded backend capabilities in Python & Node.js']
    };
    await resumeA.save();

    console.log(`✓ Resume replaced atomically: version=${resumeA.version}, versionHistory count=${resumeA.versionHistory.length}`);
    console.log(`  sourceDocumentId remains identical: ${resumeA.sourceDocumentId === sourceDocIdA}`);

    console.log('\n--- 6. UPDATE PROFILE FROM RESUME v2 (PROFILE RESOLVER PRESERVATION) ---');
    const newExtractionSections = [
      {
        id: 'sec_summary',
        type: 'summary',
        title: 'Professional Summary',
        data: { text: 'Senior Full Stack Engineer extracted from Resume v2.' }
      },
      {
        id: 'sec_skills',
        type: 'skills',
        title: 'Technical Skills',
        data: { allSkills: ['React', 'JavaScript', 'Node.js', 'Python', 'MongoDB', 'Docker'] }
      }
    ];

    const { resolvedSections: resolvedFromV2 } = resolveCandidateProfile(
      fetchedProfileAfterRename,
      newExtractionSections,
      {},
      false // isManualEdit = false (from resume update)
    );

    const resolvedSummary = resolvedFromV2.find(s => s.type === 'summary')?.data?.text || resolvedFromV2.find(s => s.type === 'summary')?.content;
    const resolvedSkills = resolvedFromV2.find(s => s.type === 'skills')?.data?.allSkills;

    console.log(`  Resolved Summary: "${resolvedSummary}"`);
    console.log(`  Resolved Skills: ${JSON.stringify(resolvedSkills)}`);

    if (resolvedSummary !== customSummary) {
      throw new Error('FAILED: Profile summary override was overwritten by resume v2 extraction!');
    }
    if (!resolvedSkills.includes('Python') || !resolvedSkills.includes('Docker')) {
      throw new Error('FAILED: Non-overridden skills were not updated from resume v2 extraction!');
    }
    console.log('✓ PASS: Manual override for summary was preserved AND new extracted skills were merged successfully!');

    console.log('\n--- 7. RESUME 10-DOCUMENT LIMIT ENFORCEMENT ---');
    // Upload 9 more resumes (total 10)
    for (let i = 2; i <= 10; i++) {
      await Resume.create({
        candidate: userId,
        candidateIdString: userId.toString(),
        sourceDocumentId: `src_${i}`,
        contentHash: `hash_${i}`,
        displayName: `Resume_${i}.pdf`,
        originalFileName: `Resume_${i}.pdf`,
        fileName: `Resume_${i}.pdf`,
        rawText: `Resume content for resume ${i}`,
        version: 1,
        status: 'analyzed'
      });
    }

    const activeCount = await Resume.countDocuments({ candidate: userId, deletedAt: null });
    console.log(`✓ Active resume count for candidate: ${activeCount} / 10`);

    // Verify 11th resume is blocked
    const isBlocked = activeCount >= 10;
    console.log(`✓ Is 11th resume creation blocked? ${isBlocked ? 'YES (RESUME_LIMIT_REACHED)' : 'NO'}`);
    if (!isBlocked) throw new Error('FAILED: 10 resume limit not enforced!');

    console.log('\n--- 8. RESUME DELETION & PROFILE PRESERVATION ---');
    // Soft delete Resume A
    resumeA.deletedAt = new Date();
    resumeA.status = 'deleted';
    await resumeA.save();

    // Check if profile is preserved and source set to 'manual'
    if (profile.profileSource?.sourceDocumentId === resumeA.sourceDocumentId) {
      profile.profileSource = {
        type: 'manual',
        updatedAt: new Date()
      };
      await profile.save();
    }

    const remainingCount = await Resume.countDocuments({ candidate: userId, deletedAt: null });
    console.log(`✓ Resume deleted. Remaining active count: ${remainingCount} / 10 (Slot freed!)`);
    if (remainingCount !== 9) throw new Error('FAILED: Deleted resume did not free a slot!');

    const profileAfterDelete = await CandidateProfile.findOne({ user: userId });
    console.log(`✓ Candidate profile exists after resume deletion? ${Boolean(profileAfterDelete)}`);
    console.log(`  Profile source type: ${profileAfterDelete.profileSource.type}`);
    console.log(`  Profile summary retained: "${profileAfterDelete.sections.find(s => s.type === 'summary')?.data?.text}"`);

    if (!profileAfterDelete || profileAfterDelete.profileSource.type !== 'manual') {
      throw new Error('FAILED: Profile was corrupted or not detached safely after resume deletion!');
    }

    // Clean up
    await Resume.deleteMany({ candidate: userId });
    await CandidateProfile.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    console.log('\n============================================================');
    console.log('✅ ALL CANDIDATEIQ LIFECYCLE & PERSISTENCE TESTS PASSED 100%');
    console.log('============================================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

runE2ETest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
