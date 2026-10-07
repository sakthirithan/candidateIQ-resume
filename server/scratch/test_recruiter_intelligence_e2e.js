const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const candidateJobIntelligenceService = require('../services/candidateJobIntelligence.service');

async function testRecruiterIntelligenceE2E() {
  console.log('=== STARTING RECRUITER CANDIDATE INTELLIGENCE E2E TEST ===');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/candidateiq');
    console.log('[MongoDB] Connected successfully.');

    // 1. Find Application record
    let application = await Application.findOne({}).populate('job candidate').lean();

    if (!application) {
      console.log('No Application record found in DB. Creating dummy application for verification...');
      const candidateUser = await User.findOne({ role: 'candidate' }) || await User.findOne({});
      const recruiterUser = await User.findOne({ role: 'recruiter' }) || await User.findOne({});
      let job = await Job.findOne({});

      if (!job) {
        job = await Job.create({
          title: 'Senior MERN Developer',
          department: 'Engineering',
          description: 'Build full stack web apps with React and Node.js',
          requiredSkills: ['React', 'Node.js', 'MongoDB', 'REST API'],
          preferredSkills: ['Docker', 'AWS'],
          experienceLevel: '3-5 Years',
          status: 'published',
          recruiter: recruiterUser._id
        });
      }

      application = await Application.create({
        job: job._id,
        candidate: candidateUser._id,
        recruiter: recruiterUser._id,
        status: 'applied',
        resumeSnapshot: {
          resumeId: `res_${Date.now()}`,
          fileName: 'Candidate_Resume_Snapshot.pdf',
          fileUrl: '',
          capturedAt: new Date()
        },
        professionalSnapshot: {
          skills: ['React', 'Node.js', 'MongoDB', 'JavaScript']
        }
      });

      application = await Application.findById(application._id).populate('job candidate').lean();
    }

    console.log(`[Test] Application ID: ${application._id}`);
    console.log(`[Test] Candidate: ${application.candidate?.name || application.candidate} | Job: ${application.job?.title}`);

    // 2. Generate Application & Job Specific Intelligence
    const intelligence = await candidateJobIntelligenceService.generateCandidateJobIntelligence({
      applicationId: application._id.toString()
    });

    console.log('\n--- APPLICATION-SPECIFIC CANDIDATE INTELLIGENCE ---');
    console.log('Overall Job Fit:', JSON.stringify(intelligence.overallJobFit, null, 2));
    console.log('\nIntelligence Pillars Evaluated:', JSON.stringify(intelligence.pillars, null, 2));
    console.log('\nSubmitted Resume Snapshot:', JSON.stringify(intelligence.submittedResumeSnapshot, null, 2));
    console.log('\nSkill Matching Breakdown:', JSON.stringify(intelligence.skillMatching, null, 2));
    console.log('\nExplainable Insights:', JSON.stringify(intelligence.explainableInsights, null, 2));
    console.log('Formula Version:', intelligence.formulaVersion);

    console.log('\n=== RECRUITER CANDIDATE INTELLIGENCE E2E TEST PASSED ===');
  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testRecruiterIntelligenceE2E();
