const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../config/db');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const {
  getJobs,
  getJobById,
  applyToJob,
  getCandidateApplications
} = require('../controllers/jobController');

function mockReqRes(body = {}, query = {}, params = {}, user = {}) {
  const reqObj = { body, query, params, user };
  const resObj = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    }
  };
  return { req: reqObj, res: resObj };
}

async function runCandidateFlowTest() {
  console.log('=== CANDIDATEIQ CANDIDATE MODULE INTEGRATION TEST ===\n');

  try {
    await connectDB();
    console.log('[1/6] Connected to MongoDB Atlas.');

    // Find candidate user and recruiter user
    let candidateUser = await User.findOne({ role: 'candidate' });
    let recruiterUser = await User.findOne({ role: { $in: ['recruiter', 'hr', 'admin'] } });

    if (!candidateUser) {
      candidateUser = await User.create({
        name: 'Alex Johnson Candidate Test',
        email: `cand_test_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'candidate'
      });
    }

    if (!recruiterUser) {
      recruiterUser = candidateUser;
    }

    const candidateCtx = { id: candidateUser._id, _id: candidateUser._id, role: 'candidate', name: candidateUser.name, email: candidateUser.email };
    console.log(`[2/6] Candidate User ID: ${candidateUser._id} (${candidateUser.email})`);

    // Create a published test job
    const testJob = await Job.create({
      title: 'Senior MERN Developer Candidate Test Role',
      department: 'Engineering',
      description: 'Role for verifying candidate job application workflow.',
      requiredSkills: ['React', 'Node.js', 'MongoDB'],
      status: 'published',
      recruiter: recruiterUser._id,
      recruiterIdString: recruiterUser._id.toString()
    });

    console.log(`[3/6] Test Job Requisition Created ID: ${testJob._id}`);

    // --- TEST 1: Candidate Job Discovery GET /api/jobs ---
    console.log('\n[4/6] Testing Job Discovery API (getJobs)...');
    {
      const { req, res } = mockReqRes({}, {}, {}, candidateCtx);
      await getJobs(req, res, (err) => { if (err) throw err; });

      console.log(' - Discovery response status:', res.statusCode);
      console.log(' - Total published jobs count:', res.data?.jobs?.length);

      if (res.statusCode !== 200 || !Array.isArray(res.data?.jobs)) {
        throw new Error('Failed to fetch job discovery list');
      }
    }

    // --- TEST 2: Submit Application & Verify Persistence ---
    console.log('\n[5/6] Testing Application Submission & Duplicate Protection...');
    let applicationId;
    {
      const { req, res } = mockReqRes({
        candidateSnapshot: {
          name: candidateUser.name,
          email: candidateUser.email,
          mobile: '+91 98765 43210',
          location: 'Bangalore, India'
        },
        professionalSnapshot: {
          userType: 'Professional',
          designation: 'Frontend Engineer',
          experience: '3 Years',
          skills: ['React', 'JavaScript', 'TailwindCSS']
        },
        expectedCompensation: { amount: 1200000, currency: 'INR', period: 'year', formatted: '₹12.00 LPA' },
        termsAccepted: true
      }, {}, { id: testJob._id.toString() }, candidateCtx);

      await applyToJob(req, res, (err) => { if (err) throw err; });
      console.log(' - Application Submission Status:', res.statusCode, res.data?.message);
      if (res.statusCode !== 201 || !res.data?.application?._id) {
        throw new Error('Failed to submit application');
      }
      applicationId = res.data.application._id;

      // Verify Duplicate Submission Protection
      const { req: dupReq, res: dupRes } = mockReqRes({
        termsAccepted: true
      }, {}, { id: testJob._id.toString() }, candidateCtx);

      await applyToJob(dupReq, dupRes, (err) => { if (err) throw err; });
      console.log(' - Duplicate Application Status:', dupRes.statusCode, dupRes.data?.message);
      if (dupRes.statusCode !== 400 || !dupRes.data?.isApplied) {
        throw new Error('Duplicate application protection failed');
      }
    }

    // --- TEST 3: Fetch Tracker Applications & Verify Job Details State ---
    console.log('\n[6/6] Testing Tracker Applications & Application State Consistency...');
    {
      const { req, res } = mockReqRes({}, {}, {}, candidateCtx);
      await getCandidateApplications(req, res, (err) => { if (err) throw err; });

      console.log(' - Tracker Applications Count:', res.data?.applications?.length);
      const app = res.data?.applications?.find(a => String(a.job?._id || a.job) === String(testJob._id));

      console.log(' - Application found in Tracker:', Boolean(app));
      console.log(' - Persisted Application Status:', app?.status);

      if (res.statusCode !== 200 || !app) {
        throw new Error('Application not found in Tracker applications query');
      }

      // Cleanup test documents
      await Application.findByIdAndDelete(applicationId);
      await Job.findByIdAndDelete(testJob._id);
      console.log(' - Test application and test job cleaned up successfully.');
    }

    console.log('\n============================================================');
    console.log(' SUCCESS: ALL CANDIDATE MODULE INTEGRATION TESTS PASSED!');
    console.log('============================================================\n');

  } catch (err) {
    console.error('\n TEST FAILED WITH ERROR:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runCandidateFlowTest();
