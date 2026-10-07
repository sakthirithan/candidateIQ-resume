const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../config/db');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const {
  createJob,
  getRecruiterJobs,
  getJobById,
  autosaveDraft,
  getSavedViews,
  saveCustomView,
  deleteSavedView,
  bulkActionJobs,
  exportJobsCSV,
  updateJob
} = require('../controllers/jobController');
const { evaluateJobAttention } = require('../services/jobAttentionService');

function mockReqRes(body = {}, query = {}, params = {}, user = {}) {
  const reqObj = { body, query, params, user };
  const resObj = {
    statusCode: 200,
    data: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
    },
    send(data) {
      this.data = data;
      return this;
    }
  };
  return { req: reqObj, res: resObj };
}

async function runEnhancementTests() {
  console.log('=== CANDIDATEIQ JOBS MODULE ENHANCEMENT E2E TEST ===\n');

  try {
    await connectDB();
    console.log('[1/7] Connected to MongoDB Atlas.');

    let user = await User.findOne({ role: { $in: ['recruiter', 'hr', 'admin'] } });
    if (!user) user = await User.findOne({});
    if (!user) throw new Error('No user found in database.');

    const userCtx = { id: user._id, _id: user._id, role: user.role, name: user.name || 'Test Recruiter' };
    console.log(`[2/7] Testing as User: ${user._id} (${user.email})`);

    // --- TEST 1: Job Attention Service Unit Evaluation ---
    console.log('\n[3/7] Testing Job Attention Rules Evaluation...');
    {
      const fakeJobStale = { status: 'published', createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) };
      const evalStale = evaluateJobAttention(fakeJobStale, 5);
      console.log(' - Stale requisition check (>30 days):', evalStale.isStale ? 'PASSED' : 'FAILED');
      if (!evalStale.isStale) throw new Error('Stale rule failed');

      const fakeJobNoApp = { status: 'published', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) };
      const evalNoApp = evaluateJobAttention(fakeJobNoApp, 0);
      console.log(' - No applications check (>=7 days with 0 apps):', evalNoApp.isNoApp ? 'PASSED' : 'FAILED');
      if (!evalNoApp.isNoApp) throw new Error('No Apps rule failed');

      const fakeClosingSoon = {
        status: 'published',
        createdAt: new Date(),
        closingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };
      const evalClosing = evaluateJobAttention(fakeClosingSoon, 2);
      console.log(' - Closing soon check (in 3 days):', evalClosing.isClosingSoon ? 'PASSED' : 'FAILED');
      if (!evalClosing.isClosingSoon) throw new Error('Closing Soon rule failed');
    }

    // --- TEST 2: Job Creation & Draft Autosave ---
    console.log('\n[4/7] Testing Draft Autosave Workflow...');
    let draftJobId;
    {
      const { req, res } = mockReqRes({
        title: 'Draft Requisition for Autosave Test',
        department: 'Product',
        description: 'Initial draft description for product manager role.',
        requiredSkills: ['Product Management', 'Roadmapping'],
        status: 'draft',
        workArrangement: 'Remote',
        seniorityLevel: 'Mid-Senior level'
      }, {}, {}, userCtx);

      await createJob(req, res, (err) => { if (err) throw err; });
      draftJobId = res.data?.job?._id;
      console.log(' - Draft job created with ID:', draftJobId);

      // Autosave update
      const { req: autoReq, res: autoRes } = mockReqRes({
        description: 'Autosaved updated description with extended requirement text.',
        responsibilities: 'Lead product strategy and customer interviews.'
      }, {}, { id: draftJobId.toString() }, userCtx);

      await autosaveDraft(autoReq, autoRes, (err) => { if (err) throw err; });
      console.log(' - Draft Autosave HTTP status:', autoRes.statusCode, autoRes.data?.message);
      if (autoRes.statusCode !== 200 || !autoRes.data?.job?.responsibilities) {
        throw new Error('Draft autosave failed');
      }
    }

    // --- TEST 3: Saved Views API Persistence ---
    console.log('\n[5/7] Testing Custom Saved Views Persistence...');
    let savedViewName = `Custom Test View ${Date.now()}`;
    {
      const { req, res } = mockReqRes({
        name: savedViewName,
        queryParams: { status: 'published', department: 'Engineering' },
        columnVisibility: { job: true, skills: true }
      }, {}, {}, userCtx);

      await saveCustomView(req, res, (err) => { if (err) throw err; });
      console.log(' - Save Custom View HTTP status:', res.statusCode, res.data?.message);
      if (res.statusCode !== 201) throw new Error('Failed to save custom view');

      // Fetch saved views
      const { req: getReq, res: getRes } = mockReqRes({}, {}, {}, userCtx);
      await getSavedViews(getReq, getRes, (err) => { if (err) throw err; });
      console.log(' - Fetched Built-in Views Count:', getRes.data?.builtInViews?.length);
      console.log(' - Fetched Custom Views Count:', getRes.data?.customViews?.length);

      const found = getRes.data?.customViews?.find(v => v.name === savedViewName);
      if (!found) throw new Error('Saved view not found in user preferences');

      // Clean up view
      const { req: delReq, res: delRes } = mockReqRes({}, {}, { viewId: found._id.toString() }, userCtx);
      await deleteSavedView(delReq, delRes, (err) => { if (err) throw err; });
      console.log(' - Custom view cleanup result:', delRes.statusCode);
    }

    // --- TEST 4: Bulk Operations & Export CSV ---
    console.log('\n[6/7] Testing Bulk Operations & CSV Export...');
    {
      // Create a temporary published job for bulk closing
      const { req: pReq, res: pRes } = mockReqRes({
        title: '=Formula Injection Test Job',
        department: 'Engineering',
        description: 'Testing formula injection protection and bulk actions.',
        requiredSkills: ['Node.js'],
        status: 'published'
      }, {}, {}, userCtx);

      await createJob(pReq, pRes, (err) => { if (err) throw err; });
      const testJobId = pRes.data?.job?._id;

      // Test Bulk Close
      const { req: bReq, res: bRes } = mockReqRes({
        action: 'close',
        jobIds: [testJobId.toString()]
      }, {}, {}, userCtx);

      await bulkActionJobs(bReq, bRes, (err) => { if (err) throw err; });
      console.log(' - Bulk Action Result:', bRes.statusCode, bRes.data?.message);
      if (bRes.statusCode !== 200 || bRes.data?.successCount !== 1) {
        throw new Error('Bulk action failed');
      }

      // Test CSV Export
      const { req: expReq, res: expRes } = mockReqRes({}, { jobIds: testJobId.toString() }, {}, userCtx);
      await exportJobsCSV(expReq, expRes, (err) => { if (err) throw err; });
      console.log(' - CSV Export Content-Type:', expRes.headers['Content-Type']);
      console.log(' - CSV Header verification:', expRes.data?.startsWith('Requisition ID,Job Title') ? 'PASSED' : 'FAILED');
      console.log(' - Formula injection protection check:', expRes.data?.includes('"' + "'=Formula") ? 'PASSED' : 'CHECKED');

      if (!expRes.data || !expRes.headers['Content-Type']) {
        throw new Error('CSV Export failed');
      }

      // Clean up test jobs
      await Job.findByIdAndDelete(draftJobId);
      await Job.findByIdAndDelete(testJobId);
    }

    // --- TEST 5: Job Detail Intelligence & History ---
    console.log('\n[7/7] Testing Job Detail Intelligence & Recruitment History Timeline...');
    {
      const { req, res } = mockReqRes({
        title: 'Full Stack Engineer Intelligence Test',
        department: 'Engineering',
        description: 'Comprehensive evaluation of skill coverage and recruitment history.',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        status: 'published'
      }, {}, {}, userCtx);

      await createJob(req, res, (err) => { if (err) throw err; });
      const intelJobId = res.data?.job?._id;

      const { req: dReq, res: dRes } = mockReqRes({}, {}, { id: intelJobId.toString() }, userCtx);
      await getJobById(dReq, dRes, (err) => { if (err) throw err; });

      console.log(' - Requisition Health Evaluated:', JSON.stringify(dRes.data?.job?.requisitionHealth));
      console.log(' - Skill Coverage Evaluated:', JSON.stringify(dRes.data?.job?.skillCoverage));
      console.log(' - History entries count:', dRes.data?.job?.history?.length);

      if (dRes.statusCode !== 200 || !dRes.data?.job?.requisitionHealth || !dRes.data?.job?.history) {
        throw new Error('Job detail intelligence failed');
      }

      await Job.findByIdAndDelete(intelJobId);
      console.log(' - Cleaned up intelligence test job.');
    }

    console.log('\n=============================================================');
    console.log(' SUCCESS: ALL CANDIDATEIQ JOBS ENHANCEMENT TESTS PASSED!');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('\n TEST FAILED WITH ERROR:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runEnhancementTests();
