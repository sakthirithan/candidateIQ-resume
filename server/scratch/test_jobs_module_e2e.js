const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../config/db');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const { createJob, getRecruiterJobs, duplicateJob, updateJob, deleteJob } = require('../controllers/jobController');

let req, res;

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

async function runJobsModuleTests() {
  console.log('=== CANDIDATEIQ JOBS MODULE E2E & UNIT VERIFICATION ===\n');

  try {
    await connectDB();
    console.log('[1/7] Connected to MongoDB Atlas.');

    // Find a recruiter user or admin user
    let recruiterUser = await User.findOne({ role: { $in: ['recruiter', 'hr', 'admin'] } });
    if (!recruiterUser) {
      recruiterUser = await User.findOne({});
    }
    if (!recruiterUser) {
      throw new Error('No user found in database for testing.');
    }
    console.log(`[2/7] Testing with User ID: ${recruiterUser._id}, Role: ${recruiterUser.role}`);

    const userCtx = { id: recruiterUser._id, _id: recruiterUser._id, role: recruiterUser.role };

    // --- TEST 1: Validation of Experience and Salary ---
    console.log('\n[3/7] Testing Experience & Compensation Validation...');
    {
      const { req, res } = mockReqRes({
        title: 'Invalid Exp Job',
        description: 'Test Description',
        requiredSkills: ['React'],
        experience: { min: 5, max: 2 } // Invalid min > max
      }, {}, {}, userCtx);

      let nextCalled = false;
      await createJob(req, res, () => { nextCalled = true; });
      console.log(' - Min > Max Experience validation result:', res.statusCode === 400 ? 'PASSED (400 returned)' : `FAILED (${res.statusCode})`);
      if (res.statusCode !== 400) throw new Error('Experience validation failed');
    }

    {
      const { req, res } = mockReqRes({
        title: 'Invalid Salary Job',
        description: 'Test Description',
        requiredSkills: ['React'],
        salary: { min: 100000, max: 50000 } // Invalid min > max
      }, {}, {}, userCtx);

      await createJob(req, res, () => {});
      console.log(' - Min > Max Salary validation result:', res.statusCode === 400 ? 'PASSED (400 returned)' : `FAILED (${res.statusCode})`);
      if (res.statusCode !== 400) throw new Error('Salary validation failed');
    }

    // --- TEST 2: Job Creation ---
    console.log('\n[4/7] Creating a new test job requisition...');
    let createdJobId;
    {
      const { req, res } = mockReqRes({
        title: 'Senior Full Stack Engineer Test Requisition',
        department: 'Engineering',
        description: 'Building scalable modern Web applications with React and Node.js.',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        preferredSkills: ['TypeScript', 'Docker'],
        experienceLevel: '3–6 Years',
        experience: { min: 3, max: 6, unit: 'years' },
        salary: { min: 1200000, max: 2200000, currency: 'INR', period: 'year' },
        location: 'Bangalore, India (Hybrid)',
        employmentType: 'Full-time',
        status: 'draft',
        hrEvaluationPrompt: 'Evaluate candidate architecture design, clean code, and API security capabilities.'
      }, {}, {}, userCtx);

      await createJob(req, res, (err) => { if (err) throw err; });
      console.log(' - Job creation status:', res.statusCode, res.data?.message);
      if (res.statusCode !== 201 || !res.data?.job?._id) throw new Error('Failed to create job requisition');
      createdJobId = res.data.job._id;
      console.log(' - Created Job ID:', createdJobId);
      console.log(' - Saved HR Evaluation Prompt:', res.data.job.hrEvaluationPrompt);
    }

    // --- TEST 3: Get Recruiter Jobs with Metrics, Filtering & Pagination ---
    console.log('\n[5/7] Testing getRecruiterJobs workspace query (metrics, pagination, search, status)...');
    {
      const { req, res } = mockReqRes({}, {
        page: 1,
        limit: 10,
        search: 'Senior Full Stack Engineer',
        status: 'draft',
        department: 'Engineering'
      }, {}, userCtx);

      await getRecruiterJobs(req, res, (err) => { if (err) throw err; });
      console.log(' - Fetch Workspace response code:', res.statusCode);
      console.log(' - Workspace Metrics:', JSON.stringify(res.data?.metrics));
      console.log(' - Pagination info:', JSON.stringify(res.data?.pagination));
      console.log(' - Filtered jobs count:', res.data?.jobs?.length);

      if (res.statusCode !== 200 || !res.data?.metrics) throw new Error('Failed to fetch recruiter jobs workspace metrics');
      if (typeof res.data.metrics.totalJobs !== 'number' || typeof res.data.metrics.draftJobs !== 'number') {
        throw new Error('Metrics missing expected numbers');
      }
    }

    // --- TEST 4: Job Duplication ---
    console.log('\n[6/7] Testing Job Duplication Workflow...');
    let duplicatedJobId;
    {
      const { req, res } = mockReqRes({}, {}, { id: createdJobId.toString() }, userCtx);

      await duplicateJob(req, res, (err) => { if (err) throw err; });
      console.log(' - Duplication status:', res.statusCode, res.data?.message);
      if (res.statusCode !== 201 || !res.data?.job?._id) throw new Error('Failed to duplicate job requisition');

      duplicatedJobId = res.data.job._id;
      const dupJob = res.data.job;

      console.log(' - Original Job Title:', 'Senior Full Stack Engineer Test Requisition');
      console.log(' - Duplicated Job Title:', dupJob.title);
      console.log(' - Duplicated Job Status:', dupJob.status);
      console.log(' - HR Evaluation Prompt copied:', dupJob.hrEvaluationPrompt === 'Evaluate candidate architecture design, clean code, and API security capabilities.');

      // Verify no applications copied
      const appCount = await Application.countDocuments({ job: duplicatedJobId });
      console.log(' - Applications count for duplicated job (must be 0):', appCount);

      if (dupJob.status !== 'draft' || appCount !== 0) {
        throw new Error('Duplicate job failed criteria (must be draft and have 0 applications)');
      }
    }

    // --- TEST 5: Job Update & Cleanup ---
    console.log('\n[7/7] Testing Job Update (Publish lifecycle) & Cleanup...');
    {
      const { req, res } = mockReqRes({
        title: 'Senior Full Stack Engineer Test Requisition (Published)',
        status: 'published'
      }, {}, { id: createdJobId.toString() }, userCtx);

      await updateJob(req, res, (err) => { if (err) throw err; });
      console.log(' - Job publish update status:', res.statusCode);
      if (res.statusCode !== 200 || res.data?.job?.status !== 'published') {
        throw new Error('Failed to publish job via updateJob');
      }

      // Clean up test documents
      await Job.findByIdAndDelete(createdJobId);
      await Job.findByIdAndDelete(duplicatedJobId);
      console.log(' - Cleaned up test jobs successfully.');
    }

    console.log('\n=================================================');
    console.log(' SUCCESS: ALL JOBS MODULE BACKEND TESTS PASSED!');
    console.log('=================================================\n');

  } catch (err) {
    console.error('\n TEST FAILED WITH ERROR:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runJobsModuleTests();
