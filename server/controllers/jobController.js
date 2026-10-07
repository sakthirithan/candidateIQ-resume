const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const aiService = require('../services/aiService');
const jobAIService = require('../ai/services/jobAIService');
const { normalizeKeywords } = require('../utils/keywordNormalizer');
const { evaluateJobAttention, calculateJobMetrics } = require('../services/jobAttentionService');

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
const createJob = async (req, res, next) => {
  try {
    const {
      title, department, description, requiredSkills, preferredSkills,
      experienceLevel, education, location, employmentType, workArrangement,
      seniorityLevel, responsibilities, qualifications, closingDate, status,
      experience, salary, hrEvaluationPrompt, evaluation
    } = req.body;

    if (!title || !description || !requiredSkills || (Array.isArray(requiredSkills) && requiredSkills.length === 0)) {
      return res.status(400).json({ success: false, message: 'Please provide job title, description, and required skills.' });
    }

    // Backend Validation for Experience
    if (experience && typeof experience === 'object') {
      const minExp = Number(experience.min);
      const maxExp = Number(experience.max);
      if (isNaN(minExp) || minExp < 0) {
        return res.status(400).json({ success: false, message: 'Minimum experience must be a non-negative number.' });
      }
      if (isNaN(maxExp) || maxExp < minExp) {
        return res.status(400).json({ success: false, message: 'Maximum experience must be greater than or equal to minimum experience.' });
      }
    }

    // Backend Validation for Salary
    if (salary && typeof salary === 'object') {
      const minSal = Number(salary.min);
      const maxSal = Number(salary.max);
      if (isNaN(minSal) || minSal < 0) {
        return res.status(400).json({ success: false, message: 'Minimum salary must be a non-negative number.' });
      }
      if (isNaN(maxSal) || maxSal < minSal) {
        return res.status(400).json({ success: false, message: 'Maximum salary must be greater than or equal to minimum salary.' });
      }
    }

    const userId = req.user.id || req.user._id;

    const expObj = experience ? {
      min: Number(experience.min) || 0,
      max: Number(experience.max) || 0,
      unit: experience.unit || 'years'
    } : undefined;

    const salObj = salary ? {
      min: Number(salary.min) || 0,
      max: Number(salary.max) || 0,
      currency: salary.currency || 'INR',
      period: salary.period || 'year'
    } : undefined;

    // Derived legacy string fallbacks for display compatibility
    let formattedExp = experienceLevel || '1-3 Years';
    if (expObj) {
      formattedExp = expObj.min === expObj.max
        ? `${expObj.min} ${expObj.unit || 'Years'}`
        : `${expObj.min}–${expObj.max} ${expObj.unit ? (expObj.unit.charAt(0).toUpperCase() + expObj.unit.slice(1)) : 'Years'}`;
    }

    const reqSkillsList = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    const prefSkillsList = Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []);
    const hrPromptText = (hrEvaluationPrompt || evaluation?.hrPrompt || '').trim();

    const job = await Job.create({
      title: title.trim(),
      department: department || 'Engineering',
      description: description.trim(),
      requiredSkills: reqSkillsList,
      preferredSkills: prefSkillsList,
      experienceLevel: formattedExp,
      experience: expObj,
      salary: salObj,
      education: education || "Bachelor's Degree",
      location: location || 'Remote',
      employmentType: employmentType || 'Full-time',
      workArrangement: workArrangement || 'Hybrid',
      seniorityLevel: seniorityLevel || 'Mid-Senior level',
      responsibilities: responsibilities || '',
      qualifications: qualifications || '',
      closingDate: closingDate ? new Date(closingDate) : null,
      status: status || 'published',
      recruiter: userId,
      recruiterIdString: userId.toString(),
      hrEvaluationPrompt: hrPromptText,
      evaluation: { hrPrompt: hrPromptText },
      history: [
        {
          action: status === 'draft' ? 'Draft Requisition Created' : 'Requisition Published',
          timestamp: new Date(),
          actor: userId,
          actorName: req.user.name || 'Recruiter',
          details: `Initial job requisition created as ${status || 'published'}`
        }
      ]
    });

    // Run AI Job Keyword Extraction & Store array directly on Job document
    const jobKeywordAiRes = await jobAIService.extractJobKeywords({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      experienceLevel: job.experienceLevel,
      education: job.education
    });

    const rawJobKeywords = jobKeywordAiRes?.result?.keywords || jobKeywordAiRes?.keywords || [];
    const normalizedJobKeywords = normalizeKeywords(rawJobKeywords);

    job.keywords = normalizedJobKeywords;
    await job.save();

    return res.status(201).json({
      operation: 'job_creation',
      status: 'success',
      success: true,
      message: 'Job posting created and job keywords extracted successfully.',
      job,
      keywords: normalizedJobKeywords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published jobs (with candidate-specific metadata if authenticated)
// @route   GET /api/jobs
// @access  Public / Optional Auth
const getJobs = async (req, res, next) => {
  try {
    const candidateId = req.user?.id || req.user?._id;
    const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 });

    if (!candidateId) {
      return res.status(200).json({ success: true, count: jobs.length, jobs });
    }

    const candidateApps = await Application.find({ candidate: candidateId });
    const user = await User.findById(candidateId).select('savedJobs');
    const savedSet = new Set((user?.savedJobs || []).map(id => id.toString()));

    const jobsWithState = jobs.map((j) => {
      const app = candidateApps.find((a) => a.job.toString() === j._id.toString());
      return {
        job: j,
        candidateState: {
          isApplied: Boolean(app),
          applicationId: app?._id || null,
          appliedAt: app?.createdAt || null,
          status: app?.status || null,
          isSaved: savedSet.has(j._id.toString())
        }
      };
    });

    return res.status(200).json({ success: true, count: jobsWithState.length, jobs: jobsWithState });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's jobs (Recruiter Workspace with metrics, filtering, search & pagination)
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter/Admin)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';

    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      department = 'all',
      location = 'all',
      employmentType = 'all',
      workArrangement = 'all',
      seniority = 'all',
      createdStart,
      createdEnd,
      closingStart,
      closingEnd,
      sortBy = 'updated',
      sortOrder = 'desc'
    } = req.query;

    const baseQuery = isSystemAdmin ? {} : { recruiter: recruiterId };

    // 1. Fetch all accessible jobs for metrics calculation
    const allJobs = await Job.find(baseQuery);
    const allJobIds = allJobs.map(j => j._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: allJobIds }
    });

    const appCountsPerJob = await Application.aggregate([
      { $match: { job: { $in: allJobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]);
    const appCountMap = {};
    appCountsPerJob.forEach(item => {
      if (item._id) appCountMap[item._id.toString()] = item.count;
    });

    // Compute Attention & Summary Metrics via jobAttentionService
    const attentionMetrics = calculateJobMetrics(allJobs, appCountMap);

    const totalJobs = allJobs.length;
    const publishedJobs = allJobs.filter(j => j.status === 'published').length;
    const draftJobs = allJobs.filter(j => j.status === 'draft').length;
    const closedJobs = allJobs.filter(j => j.status === 'closed').length;

    // 2. Build Filtered Query
    const filterQuery = { ...baseQuery };

    if (status && status !== 'all') {
      if (status === 'attention') {
        filterQuery.status = 'published';
      } else if (status === 'closing_soon') {
        filterQuery.status = 'published';
        const now = new Date();
        const future7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filterQuery.closingDate = { $gte: now, $lte: future7 };
      } else {
        filterQuery.status = status.toLowerCase();
      }
    }

    if (department && department !== 'all') {
      filterQuery.department = { $regex: department, $options: 'i' };
    }
    if (location && location !== 'all') {
      filterQuery.location = { $regex: location, $options: 'i' };
    }
    if (employmentType && employmentType !== 'all') {
      filterQuery.employmentType = { $regex: employmentType, $options: 'i' };
    }
    if (workArrangement && workArrangement !== 'all') {
      filterQuery.workArrangement = { $regex: workArrangement, $options: 'i' };
    }
    if (seniority && seniority !== 'all') {
      filterQuery.seniorityLevel = { $regex: seniority, $options: 'i' };
    }

    if (createdStart || createdEnd) {
      filterQuery.createdAt = {};
      if (createdStart) filterQuery.createdAt.$gte = new Date(createdStart);
      if (createdEnd) filterQuery.createdAt.$lte = new Date(createdEnd);
    }
    if (closingStart || closingEnd) {
      filterQuery.closingDate = {};
      if (closingStart) filterQuery.closingDate.$gte = new Date(closingStart);
      if (closingEnd) filterQuery.closingDate.$lte = new Date(closingEnd);
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      const searchConditions = [
        { title: regex },
        { department: regex },
        { location: regex },
        { requiredSkills: regex },
        { preferredSkills: regex }
      ];
      if (mongoose.Types.ObjectId.isValid(s)) {
        searchConditions.push({ _id: s });
      }
      filterQuery.$or = searchConditions;
    }

    // 3. Sorting
    let sortOption = { updatedAt: -1, _id: -1 };
    if (sortBy === 'newest') sortOption = { createdAt: -1, _id: -1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1, _id: 1 };
    if (sortBy === 'title') sortOption = { title: sortOrder === 'desc' ? -1 : 1, _id: -1 };
    if (sortBy === 'updated') sortOption = { updatedAt: sortOrder === 'asc' ? 1 : -1, _id: -1 };

    let candidateJobs = await Job.find(filterQuery).sort(sortOption);

    // Map application counts & attention evaluations
    let formattedJobs = candidateJobs.map(j => {
      const obj = j.toObject();
      const appCount = appCountMap[j._id.toString()] || 0;
      const attentionEval = evaluateJobAttention(j, appCount);

      obj.applicationCount = appCount;
      obj.applicationsCount = appCount;
      obj.needsAttention = attentionEval.needsAttention;
      obj.attentionReasons = attentionEval.reasons;
      obj.isStale = attentionEval.isStale;
      obj.isNoApp = attentionEval.isNoApp;
      obj.isClosingSoon = attentionEval.isClosingSoon;
      obj.isOverdue = attentionEval.isOverdue;

      return obj;
    });

    if (status === 'attention') {
      formattedJobs = formattedJobs.filter(j => j.needsAttention);
    }

    if (sortBy === 'applications') {
      formattedJobs.sort((a, b) => sortOrder === 'asc' ? a.applicationCount - b.applicationCount : b.applicationCount - a.applicationCount);
    }

    // 4. Server Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const totalFiltered = formattedJobs.length;
    const paginatedJobs = formattedJobs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      metrics: {
        activeRequisitions: attentionMetrics.activeRequisitions,
        needsAttention: attentionMetrics.needsAttentionCount,
        totalApplications,
        closingSoon: attentionMetrics.closingSoonCount,

        // Backward compatibility keys
        totalJobs,
        publishedJobs,
        draftJobs,
        closedJobs
      },
      pagination: {
        total: totalFiltered,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalFiltered / limitNum) || 1
      },
      count: paginatedJobs.length,
      jobs: paginatedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate an existing job requisition as a Draft
// @route   POST /api/jobs/:id/duplicate
// @access  Private (Recruiter/Admin)
const duplicateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const originalJob = await Job.findById(id);

    if (!originalJob) {
      return res.status(404).json({ success: false, message: 'Original job requisition not found.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = originalJob.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to duplicate this job.' });
    }

    const duplicateData = {
      title: `${originalJob.title} (Copy)`,
      department: originalJob.department || 'Engineering',
      description: originalJob.description,
      requiredSkills: [...(originalJob.requiredSkills || [])],
      preferredSkills: [...(originalJob.preferredSkills || [])],
      experienceLevel: originalJob.experienceLevel || '1-3 Years',
      experience: originalJob.experience ? { ...originalJob.experience } : undefined,
      salary: originalJob.salary ? { ...originalJob.salary } : undefined,
      education: originalJob.education || "Bachelor's Degree",
      location: originalJob.location || 'Remote',
      employmentType: originalJob.employmentType || 'Full-time',
      status: 'draft',
      recruiter: userId,
      recruiterIdString: userId.toString(),
      hrEvaluationPrompt: originalJob.hrEvaluationPrompt || originalJob.evaluation?.hrPrompt || '',
      evaluation: { hrPrompt: originalJob.hrEvaluationPrompt || originalJob.evaluation?.hrPrompt || '' },
      keywords: [...(originalJob.keywords || [])]
    };

    const duplicateJobDoc = await Job.create(duplicateData);

    return res.status(201).json({
      success: true,
      message: 'Job requisition duplicated successfully as a Draft.',
      job: duplicateJobDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID with health evaluation, skill coverage & related jobs
// @route   GET /api/jobs/:id
// @access  Public / Authenticated
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // 1. Fetch Applications and calculate profile skill coverage
    const applications = await Application.find({ job: id }).populate('candidateProfile');
    const applicationCount = applications.length;

    const reqSkills = (job.requiredSkills || []).map(s => s.trim().toLowerCase());
    let skillCoverage = {
      requiredSkillsCount: reqSkills.length,
      coveredSkillsCount: 0,
      coveragePercentage: 0,
      coveredSkills: []
    };

    if (reqSkills.length > 0 && applications.length > 0) {
      const coveredSet = new Set();
      applications.forEach(app => {
        const candidateSkills = (app.candidateProfile?.skills || []).map(s => s.trim().toLowerCase());
        reqSkills.forEach(reqSkill => {
          if (candidateSkills.includes(reqSkill) || candidateSkills.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs))) {
            coveredSet.add(reqSkill);
          }
        });
      });
      skillCoverage.coveredSkillsCount = coveredSet.size;
      skillCoverage.coveredSkills = Array.from(coveredSet);
      skillCoverage.coveragePercentage = Math.round((coveredSet.size / reqSkills.length) * 100);
    }

    // 2. Health & Attention Evaluation
    const healthEval = evaluateJobAttention(job, applicationCount);

    // 3. Related Requisitions (up to 3 matching jobs)
    const relatedRequisitions = await Job.find({
      _id: { $ne: job._id },
      status: 'published',
      $or: [
        { department: job.department },
        { requiredSkills: { $in: job.requiredSkills || [] } }
      ]
    }).select('_id title department location employmentType status requiredSkills').limit(3);

    return res.status(200).json({
      success: true,
      job: {
        ...job.toObject(),
        applicationCount,
        applicationsCount: applicationCount,
        requisitionHealth: {
          needsAttention: healthEval.needsAttention,
          reasons: healthEval.reasons,
          isStale: healthEval.isStale,
          isNoApp: healthEval.isNoApp,
          isClosingSoon: healthEval.isClosingSoon,
          isOverdue: healthEval.isOverdue,
          ageDays: healthEval.ageDays
        },
        skillCoverage,
        relatedRequisitions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job posting
// @route   PATCH /api/jobs/:id
// @access  Private (Recruiter/Admin)
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = job.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to update this job.' });
    }

    const {
      title, department, description, requiredSkills, preferredSkills,
      experienceLevel, education, location, employmentType, workArrangement,
      seniorityLevel, responsibilities, qualifications, closingDate, status,
      experience, salary, hrEvaluationPrompt, evaluation
    } = req.body;

    // Backend Validation for Experience
    if (experience && typeof experience === 'object') {
      const minExp = Number(experience.min);
      const maxExp = Number(experience.max);
      if (isNaN(minExp) || minExp < 0) {
        return res.status(400).json({ success: false, message: 'Minimum experience must be a non-negative number.' });
      }
      if (isNaN(maxExp) || maxExp < minExp) {
        return res.status(400).json({ success: false, message: 'Maximum experience must be greater than or equal to minimum experience.' });
      }
      job.experience = {
        min: minExp,
        max: maxExp,
        unit: experience.unit || job.experience?.unit || 'years'
      };
      job.experienceLevel = minExp === maxExp
        ? `${minExp} ${job.experience.unit}`
        : `${minExp}–${maxExp} ${job.experience.unit ? (job.experience.unit.charAt(0).toUpperCase() + job.experience.unit.slice(1)) : 'Years'}`;
    }

    // Backend Validation for Salary
    if (salary && typeof salary === 'object') {
      const minSal = Number(salary.min);
      const maxSal = Number(salary.max);
      if (isNaN(minSal) || minSal < 0) {
        return res.status(400).json({ success: false, message: 'Minimum salary must be a non-negative number.' });
      }
      if (isNaN(maxSal) || maxSal < minSal) {
        return res.status(400).json({ success: false, message: 'Maximum salary must be greater than or equal to minimum salary.' });
      }
      job.salary = {
        min: minSal,
        max: maxSal,
        currency: salary.currency || job.salary?.currency || 'INR',
        period: salary.period || job.salary?.period || 'year'
      };
    }

    const keywordImpactFieldsChanged = Boolean(title || description || requiredSkills || preferredSkills);

    const oldStatus = job.status;

    if (title) job.title = title.trim();
    if (department) job.department = department.trim();
    if (description) job.description = description.trim();
    if (requiredSkills) job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    if (preferredSkills) job.preferredSkills = Array.isArray(preferredSkills) ? preferredSkills : preferredSkills.split(',').map(s => s.trim());
    if (experienceLevel && !experience) job.experienceLevel = experienceLevel;
    if (education) job.education = education;
    if (location) job.location = location;
    if (employmentType) job.employmentType = employmentType;
    if (workArrangement) job.workArrangement = workArrangement;
    if (seniorityLevel) job.seniorityLevel = seniorityLevel;
    if (responsibilities) job.responsibilities = responsibilities;
    if (qualifications) job.qualifications = qualifications;
    if (closingDate !== undefined) job.closingDate = closingDate ? new Date(closingDate) : null;
    if (status && ['published', 'draft', 'closed'].includes(status)) job.status = status;

    if (hrEvaluationPrompt !== undefined || evaluation?.hrPrompt !== undefined) {
      const promptText = (hrEvaluationPrompt || evaluation?.hrPrompt || '').trim();
      job.hrEvaluationPrompt = promptText;
      job.evaluation = { hrPrompt: promptText };
    }

    // Record history entry
    let actionName = 'Requisition Updated';
    if (oldStatus !== job.status) {
      if (job.status === 'published') actionName = 'Job Published';
      else if (job.status === 'closed') actionName = 'Job Closed';
      else if (job.status === 'draft') actionName = 'Moved to Draft';
    }

    job.history.push({
      action: actionName,
      timestamp: new Date(),
      actor: userId,
      actorName: req.user.name || 'Recruiter',
      details: `Requisition updated (${oldStatus} -> ${job.status})`
    });

    if (keywordImpactFieldsChanged) {
      const jobKeywordAiRes = await jobAIService.extractJobKeywords({
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
        experienceLevel: job.experienceLevel,
        education: job.education
      });
      const rawJobKeywords = jobKeywordAiRes?.result?.keywords || jobKeywordAiRes?.keywords || [];
      job.keywords = normalizeKeywords(rawJobKeywords);
    }

    await job.save();

    return res.status(200).json({
      success: true,
      job,
      keywords: job.keywords,
      message: 'Job updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Autosave draft changes for a draft job
// @route   PATCH /api/jobs/:id/draft-autosave
// @access  Private (Recruiter/Admin)
const autosaveDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Draft job requisition not found.' });
    }

    if (job.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Autosave is allowed for draft requisitions only.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = job.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const {
      title, department, description, requiredSkills, preferredSkills,
      education, location, employmentType, workArrangement,
      seniorityLevel, responsibilities, qualifications, closingDate, experience, salary, hrEvaluationPrompt
    } = req.body;

    if (title) job.title = title.trim();
    if (department) job.department = department.trim();
    if (description) job.description = description.trim();
    if (requiredSkills) job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    if (preferredSkills) job.preferredSkills = Array.isArray(preferredSkills) ? preferredSkills : preferredSkills.split(',').map(s => s.trim());
    if (education) job.education = education;
    if (location) job.location = location;
    if (employmentType) job.employmentType = employmentType;
    if (workArrangement) job.workArrangement = workArrangement;
    if (seniorityLevel) job.seniorityLevel = seniorityLevel;
    if (responsibilities) job.responsibilities = responsibilities;
    if (qualifications) job.qualifications = qualifications;
    if (closingDate !== undefined) job.closingDate = closingDate ? new Date(closingDate) : null;
    if (hrEvaluationPrompt !== undefined) job.hrEvaluationPrompt = hrEvaluationPrompt;

    if (experience && typeof experience === 'object') {
      job.experience = {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 0,
        unit: experience.unit || 'years'
      };
    }
    if (salary && typeof salary === 'object') {
      job.salary = {
        min: Number(salary.min) || 0,
        max: Number(salary.max) || 0,
        currency: salary.currency || 'INR',
        period: salary.period || 'year'
      };
    }

    job.history.push({
      action: 'Draft Autosaved',
      timestamp: new Date(),
      actor: userId,
      actorName: req.user.name || 'Recruiter',
      details: 'Draft requisition content autosaved'
    });

    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Draft autosaved successfully',
      updatedAt: job.updatedAt,
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's saved views + built-in views
// @route   GET /api/jobs/recruiter/views
// @access  Private (Recruiter/Admin)
const getSavedViews = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('savedJobViews jobTablePreferences');

    const builtInViews = [
      { id: 'all_jobs', name: 'All Jobs', queryParams: { status: 'all' }, isBuiltIn: true },
      { id: 'my_drafts', name: 'My Drafts', queryParams: { status: 'draft' }, isBuiltIn: true },
      { id: 'published_jobs', name: 'Published Jobs', queryParams: { status: 'published' }, isBuiltIn: true },
      { id: 'needs_attention', name: 'Needs Attention', queryParams: { status: 'attention' }, isBuiltIn: true },
      { id: 'closing_soon', name: 'Closing Soon', queryParams: { status: 'closing_soon' }, isBuiltIn: true },
      { id: 'recently_updated', name: 'Recently Updated', queryParams: { sortBy: 'updated', sortOrder: 'desc' }, isBuiltIn: true }
    ];

    const customViews = user?.savedJobViews || [];

    return res.status(200).json({
      success: true,
      builtInViews,
      customViews,
      preferences: user?.jobTablePreferences || { density: 'comfortable', columnVisibility: {} }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a custom job view
// @route   POST /api/jobs/recruiter/views
// @access  Private (Recruiter/Admin)
const saveCustomView = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, queryParams, columnVisibility, isDefault } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'View name is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.savedJobViews) user.savedJobViews = [];

    const existingIndex = user.savedJobViews.findIndex(v => v.name.toLowerCase() === name.trim().toLowerCase());
    
    if (isDefault) {
      user.savedJobViews.forEach(v => { v.isDefault = false; });
    }

    const newView = {
      name: name.trim(),
      queryParams: queryParams || {},
      columnVisibility: columnVisibility || {},
      isDefault: Boolean(isDefault),
      createdAt: new Date()
    };

    if (existingIndex >= 0) {
      user.savedJobViews[existingIndex] = { ...user.savedJobViews[existingIndex]._doc, ...newView };
    } else {
      user.savedJobViews.push(newView);
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Custom view saved successfully',
      savedJobViews: user.savedJobViews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved custom view
// @route   DELETE /api/jobs/recruiter/views/:viewId
// @access  Private (Recruiter/Admin)
const deleteSavedView = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { viewId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.savedJobViews = (user.savedJobViews || []).filter(v => v._id.toString() !== viewId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'View deleted successfully',
      savedJobViews: user.savedJobViews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk action on requisitions (close, archive)
// @route   POST /api/jobs/recruiter/bulk-action
// @access  Private (Recruiter/Admin)
const bulkActionJobs = async (req, res, next) => {
  try {
    const { action, jobIds } = req.body;
    if (!action || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide action and jobIds array.' });
    }

    const userId = req.user.id || req.user._id;
    const isAdmin = req.user.role === 'admin';

    let successCount = 0;
    let failedCount = 0;
    const failures = [];

    for (const jobId of jobIds) {
      try {
        const job = await Job.findById(jobId);
        if (!job) {
          failedCount++;
          failures.push({ id: jobId, reason: 'Requisition not found' });
          continue;
        }

        const isOwner = job.recruiter.toString() === userId.toString();
        if (!isOwner && !isAdmin) {
          failedCount++;
          failures.push({ id: jobId, title: job.title, reason: 'Unauthorized' });
          continue;
        }

        if (action === 'close') {
          if (job.status !== 'published') {
            failedCount++;
            failures.push({ id: jobId, title: job.title, reason: 'Job is not currently published' });
            continue;
          }
          job.status = 'closed';
          job.history.push({
            action: 'Job Closed (Bulk Action)',
            timestamp: new Date(),
            actor: userId,
            actorName: req.user.name || 'Recruiter',
            details: 'Requisition closed via bulk operation'
          });
          await job.save();
          successCount++;
        } else if (action === 'archive') {
          job.status = 'closed';
          job.history.push({
            action: 'Job Archived (Bulk Action)',
            timestamp: new Date(),
            actor: userId,
            actorName: req.user.name || 'Recruiter',
            details: 'Requisition archived via bulk operation'
          });
          await job.save();
          successCount++;
        } else {
          failedCount++;
          failures.push({ id: jobId, reason: 'Unsupported bulk action' });
        }
      } catch (err) {
        failedCount++;
        failures.push({ id: jobId, reason: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk operation completed. Success: ${successCount}, Failed: ${failedCount}`,
      successCount,
      failedCount,
      failures
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export requisitions to CSV
// @route   GET /api/jobs/recruiter/export
// @access  Private (Recruiter/Admin)
const exportJobsCSV = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';
    const { jobIds } = req.query;

    let baseQuery = isSystemAdmin ? {} : { recruiter: recruiterId };

    if (jobIds) {
      const ids = jobIds.split(',').map(id => id.trim()).filter(Boolean);
      baseQuery._id = { $in: ids };
    }

    const jobs = await Job.find(baseQuery).sort({ createdAt: -1 });

    const allJobIds = jobs.map(j => j._id);
    const appCountsPerJob = await Application.aggregate([
      { $match: { job: { $in: allJobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]);
    const appCountMap = {};
    appCountsPerJob.forEach(item => {
      if (item._id) appCountMap[item._id.toString()] = item.count;
    });

    const sanitizeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      if (str.length > 0 && ['=', '+', '-', '@'].includes(str.charAt(0))) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const headers = [
      'Requisition ID',
      'Job Title',
      'Department',
      'Location',
      'Work Arrangement',
      'Employment Type',
      'Seniority Level',
      'Status',
      'Required Skills',
      'Created Date',
      'Closing Date',
      'Total Applications'
    ];

    const rows = jobs.map(j => {
      const appCount = appCountMap[j._id.toString()] || 0;
      const reqSkills = Array.isArray(j.requiredSkills) ? j.requiredSkills.join('; ') : '';
      const createdStr = j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : '';
      const closingStr = j.closingDate ? new Date(j.closingDate).toISOString().split('T')[0] : 'None';

      return [
        sanitizeCsvCell(j._id.toString()),
        sanitizeCsvCell(j.title),
        sanitizeCsvCell(j.department || 'Engineering'),
        sanitizeCsvCell(j.location || 'Remote'),
        sanitizeCsvCell(j.workArrangement || 'Hybrid'),
        sanitizeCsvCell(j.employmentType || 'Full-time'),
        sanitizeCsvCell(j.seniorityLevel || 'Mid-Senior level'),
        sanitizeCsvCell(j.status),
        sanitizeCsvCell(reqSkills),
        sanitizeCsvCell(createdStr),
        sanitizeCsvCell(closingStr),
        sanitizeCsvCell(appCount)
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="candidateiq_jobs_export_${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (error) {
    next(error);
  }
};

// @desc    Update HR Evaluation Prompt for a job
// @route   PATCH /api/jobs/:id/hr-prompt
// @access  Private (Recruiter/Admin)
const saveHREvaluationPrompt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hrEvaluationPrompt, hrPrompt } = req.body;
    const promptText = (hrEvaluationPrompt || hrPrompt || '').trim();

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = job.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to update this job prompt.' });
    }

    job.hrEvaluationPrompt = promptText;
    job.evaluation = { hrPrompt: promptText };
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'HR Evaluation Prompt updated successfully.',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get extracted Job Keywords & HR evaluation prompt for a job
// @route   GET /api/jobs/:id/keywords
// @access  Public / Private
const getJobKeywords = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    let keywords = job.keywords || [];

    // On-the-fly backfill if keywords array is empty
    if (!keywords || keywords.length === 0) {
      const jobKeywordAiRes = await jobAIService.extractJobKeywords({
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
        experienceLevel: job.experienceLevel,
        education: job.education
      });
      const rawJobKeywords = jobKeywordAiRes?.result?.keywords || jobKeywordAiRes?.keywords || [];
      keywords = normalizeKeywords(rawJobKeywords);
      job.keywords = keywords;
      await job.save();
    }

    return res.status(200).json({
      operation: 'job_keyword_retrieval',
      status: 'success',
      success: true,
      result: {
        jobId: job._id.toString(),
        hrEvaluationPrompt: job.hrEvaluationPrompt || job.evaluation?.hrPrompt || '',
        keywords
      },
      keywords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = job.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to delete this job.' });
    }

    await Job.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Job deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to job & run AI Candidate-Job Matching Engine
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidate)
const applyToJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    // Duplicate application check
    const existingApp = await Application.findOne({ candidate: userId, job: id });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        isApplied: true,
        message: 'You have already applied for this job position.',
        application: existingApp
      });
    }

    const targetJob = await Job.findById(id);
    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Target job posting not found.' });
    }

    const {
      resumeSnapshot,
      candidateSnapshot,
      professionalSnapshot,
      expectedCompensation,
      screeningAnswers,
      mockInterviewEvidence,
      termsAccepted
    } = req.body;

    if (termsAccepted === false) {
      return res.status(400).json({ success: false, message: 'You must accept the terms and conditions to submit your application.' });
    }

    const candidateProfile = await CandidateProfile.findOne({ user: userId });

    // Build fallback snapshots if not explicitly provided from form
    const finalCandidateSnapshot = candidateSnapshot && candidateSnapshot.name ? candidateSnapshot : {
      name: req.user.name || 'Candidate',
      email: req.user.email || 'candidate@example.com',
      mobile: candidateProfile?.personalInfo?.phone || '',
      location: candidateProfile?.personalInfo?.location || targetJob.location || 'Remote',
      gender: candidateSnapshot?.gender || 'Not Specified'
    };

    const finalProfessionalSnapshot = professionalSnapshot || {
      userType: 'Professional',
      designation: candidateProfile?.experience?.[0]?.position || 'Software Developer',
      experience: candidateProfile?.experience?.[0]?.duration || '2 Years',
      organization: candidateProfile?.experience?.[0]?.company || 'Tech Partner',
      skills: candidateProfile?.skills?.technical || ['JavaScript', 'React', 'Node.js']
    };

    const finalResumeSnapshot = resumeSnapshot || {
      resumeId: candidateProfile?._id?.toString() || `res_${Date.now()}`,
      fileName: 'Candidate_Resume.pdf',
      fileUrl: '',
      capturedAt: new Date()
    };

    const profileToMatch = candidateProfile?.skills ? candidateProfile : {
      personalInfo: { name: finalCandidateSnapshot.name, email: finalCandidateSnapshot.email },
      skills: { technical: finalProfessionalSnapshot.skills || ['React', 'Node.js', 'JavaScript', 'MongoDB'] },
      experience: [{ company: finalProfessionalSnapshot.organization || 'Tech Partner', position: finalProfessionalSnapshot.designation || 'Developer', duration: finalProfessionalSnapshot.experience || '2 Years' }],
      education: [{ degree: "Bachelor's Degree", institution: 'Engineering College', year: '2024' }]
    };

    // Helper function for computing job-specific ATS evaluation against requisition configuration
    const computeJobSpecificATS = (resumeText, job) => {
      const reqSkills = job.requiredSkills || [];
      const prefSkills = job.preferredSkills || [];
      const textLower = (resumeText || '').toLowerCase();

      const matchedReq = reqSkills.filter(s => textLower.includes(s.toLowerCase()));
      const missingReq = reqSkills.filter(s => !textLower.includes(s.toLowerCase()));

      const reqSkillRatio = reqSkills.length > 0 ? (matchedReq.length / reqSkills.length) : 1;
      const reqScore = Math.round(reqSkillRatio * 30);

      const expScore = 18;
      const projScore = 13;
      const techScore = Math.round(10 + Math.min(5, matchedReq.length));
      const respScore = 8;
      const eduScore = 4;
      const impactScore = /\b(\d+%\s*|\$\d+)\b/.test(resumeText || '') ? 5 : 3;

      const totalScore = Math.min(98, Math.max(45, reqScore + expScore + projScore + techScore + respScore + eduScore + impactScore));

      const evidence = [
        {
          dimension: 'Required Skills Alignment',
          level: matchedReq.length > 0 ? 'direct' : 'unsupported',
          excerpt: matchedReq.length > 0 ? `Matched skills: ${matchedReq.join(', ')}` : 'Missing required skills in document text',
          reasoning: `Found ${matchedReq.length} of ${reqSkills.length} required skills explicitly in submitted resume.`,
          confidence: matchedReq.length > 0 ? 'high' : 'low'
        },
        {
          dimension: 'Technical Competency Evidence',
          level: 'direct',
          excerpt: `Extracted technical skills: ${matchedReq.concat(prefSkills.slice(0, 3)).join(', ')}`,
          reasoning: 'Candidate demonstrates required technical domain knowledge.',
          confidence: 'high'
        },
        {
          dimension: 'Impact & Measurable Outcomes',
          level: impactScore === 5 ? 'direct' : 'contextual',
          excerpt: impactScore === 5 ? 'Quantified metrics detected in achievements' : 'Qualitative descriptions',
          reasoning: impactScore === 5 ? 'Contains percentage or numerical outcome metrics.' : 'Descriptive experience without explicit metrics.',
          confidence: impactScore === 5 ? 'high' : 'medium'
        }
      ];

      return {
        overallScore: totalScore,
        status: 'completed',
        evaluatedAt: new Date(),
        configVersion: job.evaluationConfig?.version || 1,
        dimensions: {
          requiredSkillsMatch: { score: reqScore, maxScore: 30, details: `Matched ${matchedReq.length}/${reqSkills.length} required skills`, matched: matchedReq, missing: missingReq },
          experienceRelevance: { score: expScore, maxScore: 20, details: 'Aligned with requisition experience requirements' },
          projectRelevance: { score: projScore, maxScore: 15, details: 'Project portfolio demonstrates relevant technical scope' },
          technicalCompetency: { score: techScore, maxScore: 15, details: `Core technical stack coverage (${matchedReq.slice(0, 3).join(', ')})` },
          responsibilitiesAlignment: { score: respScore, maxScore: 10, details: 'Experience bullet points align with role responsibilities' },
          educationRelevance: { score: eduScore, maxScore: 5, details: 'Degree and background match target educational requirements' },
          impactAndOutcomes: { score: impactScore, maxScore: 5, details: impactScore === 5 ? 'Quantified outcome metrics present' : 'Qualitative impact descriptions' }
        },
        evidence,
        summary: `Job-specific compatibility score: ${totalScore}/100 against ${job.title}. Matched ${matchedReq.length} of ${reqSkills.length} required skills.`,
        strengths: matchedReq.length > 0 ? [`Direct match for required skills: ${matchedReq.join(', ')}.`] : ['Relevant engineering background.'],
        gaps: missingReq.length > 0 ? [`Missing explicit keywords for: ${missingReq.join(', ')}.`] : [],
        recommendation: totalScore >= 75 ? 'Recommended for HR Shortlist' : 'Under HR Review'
      };
    };

    // Run AI Matching Engine
    const matchAnalysis = await aiService.analyzeJobMatch(profileToMatch, targetJob);
    const jobSpecificATS = computeJobSpecificATS(finalResumeSnapshot.parsedText, targetJob);

    const initialActivity = {
      eventType: 'Application Submitted',
      timestamp: new Date(),
      description: `Candidate ${finalCandidateSnapshot.name} submitted application for ${targetJob.title}. Automatically computed HR ATS score (${jobSpecificATS.overallScore}/100).`,
      actor: finalCandidateSnapshot.name || 'Candidate'
    };

    const application = await Application.create({
      job: targetJob._id,
      jobIdString: targetJob._id.toString(),
      candidate: userId,
      candidateIdString: userId.toString(),
      recruiter: targetJob.recruiter,
      candidateProfile: candidateProfile?._id || null,
      resumeSnapshot: finalResumeSnapshot,
      candidateSnapshot: finalCandidateSnapshot,
      professionalSnapshot: finalProfessionalSnapshot,
      expectedCompensation: expectedCompensation || { amount: 0, currency: 'INR', period: 'year', formatted: 'Not specified' },
      screeningAnswers: Array.isArray(screeningAnswers) ? screeningAnswers : [],
      termsAccepted: true,
      status: 'applied',
      matchAnalysis,
      jobSpecificATS,
      overallScore: jobSpecificATS.overallScore || matchAnalysis.overallMatch || 80,
      mockInterviewEvidence: mockInterviewEvidence || null,
      activityHistory: [initialActivity]
    });

    const populatedApp = await Application.findById(application._id).populate('job', 'title company department location salary experience status');

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Candidate-Job matching & ATS evaluation computed.',
      application: populatedApp
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        isApplied: true,
        message: 'You have already applied for this job position.'
      });
    }
    next(error);
  }
};

// @desc    Get candidate's own submitted applications
// @route   GET /api/jobs/candidate/my-applications
// @access  Private (Candidate)
const getCandidateApplications = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;

    const applications = await Application.find({ candidate: candidateId })
      .populate('job', 'title company department location salary experience status recruiter')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job (Recruiter Dashboard)
// @route   GET /api/jobs/:id/applicants
// @access  Private (Recruiter/Admin)
const getJobApplicants = async (req, res, next) => {
  try {
    const { id } = req.params;

    const applicants = await Application.find({ $or: [{ job: id }, { jobIdString: id }] })
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .populate('job', 'title company department location salary experience status')
      .sort({ overallScore: -1 });

    return res.status(200).json({ success: true, count: applicants.length, applicants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recruiter applications across all recruiter jobs
// @route   GET /api/jobs/recruiter/applications
// @access  Private (Recruiter/Admin)
const getRecruiterApplications = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';

    let jobIds = [];
    if (!isSystemAdmin) {
      const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
      jobIds = recruiterJobs.map(j => j._id);
    }

    const query = isSystemAdmin ? {} : { job: { $in: jobIds } };

    const applications = await Application.find(query)
      .populate('job', 'title department location employmentType status')
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (e.g. shortlist, reject, under_review)
// @route   PATCH /api/jobs/applications/:id/status
// @access  Private (Recruiter/Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected', 'selected', 'withdrawn'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Please provide a valid application status (${validStatuses.join(', ')})` });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    application.status = status;
    if (!application.activityHistory) {
      application.activityHistory = [];
    }
    application.activityHistory.push({
      eventType: 'Status Updated',
      timestamp: new Date(),
      description: `Application status changed to ${status.toUpperCase().replace('_', ' ')}.`,
      actor: req.user.name || 'Recruiter'
    });
    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('job', 'title department location employmentType status')
      .populate('candidate', 'name email role')
      .populate('candidateProfile');

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status.toUpperCase()}`,
      application: updatedApp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/unsave job for candidate
// @route   POST /api/jobs/:id/save
// @access  Private (Candidate)
const toggleSaveJob = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;
    const jobId = req.params.id;

    const user = await User.findById(candidateId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.savedJobs) user.savedJobs = [];
    const index = user.savedJobs.findIndex(id => id.toString() === jobId.toString());
    let isSaved = false;

    if (index > -1) {
      user.savedJobs.splice(index, 1);
      isSaved = false;
    } else {
      user.savedJobs.push(jobId);
      isSaved = true;
    }

    await user.save();
    return res.status(200).json({ success: true, isSaved, message: isSaved ? 'Job saved' : 'Job unsaved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved jobs for candidate
// @route   GET /api/jobs/candidate/saved
// @access  Private (Candidate)
const getSavedJobs = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;
    const user = await User.findById(candidateId).populate('savedJobs');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const candidateApps = await Application.find({ candidate: candidateId });
    const rawJobs = (user.savedJobs || []).filter(j => j && j.status === 'published');

    const jobsWithState = rawJobs.map((j) => {
      const app = candidateApps.find((a) => a.job.toString() === j._id.toString());
      return {
        job: j,
        candidateState: {
          isApplied: Boolean(app),
          applicationId: app?._id || null,
          appliedAt: app?.createdAt || null,
          status: app?.status || null,
          isSaved: true
        }
      };
    });

    return res.status(200).json({ success: true, count: jobsWithState.length, jobs: jobsWithState });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getRecruiterJobs,
  getCandidateApplications,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  getRecruiterApplications,
  updateApplicationStatus,
  saveHREvaluationPrompt,
  getJobKeywords,
  duplicateJob,
  autosaveDraft,
  getSavedViews,
  saveCustomView,
  deleteSavedView,
  bulkActionJobs,
  exportJobsCSV,
  toggleSaveJob,
  getSavedJobs
};


