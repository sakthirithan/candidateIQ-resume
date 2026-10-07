const Interview = require('../models/Interview');
const MockInterviewWorkspace = require('../models/MockInterviewWorkspace');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
const ImprovementActivity = require('../models/ImprovementActivity');
const GenerateQuestionsService = require('../services/ai/mockInterview/generateQuestionsService');
const InterviewFinalEvaluator = require('../services/interview/InterviewFinalEvaluator');
const { ConfigurationInputSchema } = require('../services/ai/mockInterview/mockInterviewSchemas');
const { GENERATION_STAGES } = require('../services/ai/mockInterview/generationStages');
const progressEmitter = require('../services/ai/mockInterview/generationProgressEmitter');

/**
 * Helper to ensure at least 1 actionable Improvement Activity is generated and persisted for a completed interview.
 * Idempotent: Does not create duplicates if activities already exist for this interview.
 */
const ensureActivitiesForInterview = async (interview) => {
  try {
    if (!interview || !interview._id) return [];

    const existing = await ImprovementActivity.find({ sourceInterviewId: interview._id });
    if (existing && existing.length > 0) {
      return existing;
    }

    if (!interview.evaluation && !interview.overallEvaluation) {
      return [];
    }

    const userId = interview.candidate || interview.candidateIdString;
    if (!userId) return [];

    const { generateActivitiesForInterview } = require('../services/ai/improvement/activityGeneratorService');
    const activitySpecs = await generateActivitiesForInterview(interview);

    const createdActivities = [];
    for (const spec of activitySpecs) {
      const act = await ImprovementActivity.create({
        userId,
        sourceInterviewId: interview._id,
        ...spec,
        latestValue: spec.baselineValue,
        bestValue: spec.baselineValue,
        status: 'PENDING'
      });
      createdActivities.push(act);
    }
    return createdActivities;
  } catch (err) {
    console.error('[ensureActivitiesForInterview] Error generating activities:', err.message);
    return [];
  }
};

/**
 * Mock Interview Controller for CandidateIQ
 * Manages user-created persistent Mock Interview Workspace Cards (max 10 active cards)
 * and multi-attempt interview execution loops.
 */

// @desc    Create Mock Interview Workspace Card (Max 10 active cards per user)
// @route   POST /api/mock-interviews
// @access  Private (Candidate)
const createMockInterviewWorkspace = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;
    const { resumeId, jobDetails, configuration } = req.body;

    // 1. Enforce Server-Side Maximum 10 Active Cards Limit
    const activeCount = await MockInterviewWorkspace.countDocuments({
      userId: candidateId,
      isDeleted: false
    });

    if (activeCount >= 10) {
      return res.status(409).json({
        success: false,
        code: 'MOCK_INTERVIEW_LIMIT_REACHED',
        message: 'Maximum 10 mock interviews allowed. Delete an existing mock interview to create a new one.',
        activeCount,
        maxLimit: 10,
        slotsAvailable: 0
      });
    }

    // 2. Validate Inputs
    if (!jobDetails || !jobDetails.jobTitle || !jobDetails.company || !jobDetails.jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job Title, Company, and Job Description are required fields.'
      });
    }

    if (jobDetails.jobDescription.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Job Description must be at least 15 characters long.'
      });
    }

    // 3. Resolve & Validate Resume Ownership
    let targetResumeId = resumeId;
    let targetResumeName = 'Candidate_Resume.pdf';

    if (targetResumeId) {
      const resDoc = await Resume.findOne({ _id: targetResumeId, candidate: candidateId });
      if (resDoc) {
        targetResumeName = resDoc.originalName || resDoc.fileName || 'Candidate_Resume.pdf';
      }
    }

    if (!targetResumeId) {
      const resDoc = await Resume.findOne({ candidate: candidateId }).sort({ updatedAt: -1 });
      if (resDoc) {
        targetResumeId = resDoc._id;
        targetResumeName = resDoc.originalName || resDoc.fileName || 'Candidate_Resume.pdf';
      }
    }

    if (!targetResumeId) {
      return res.status(400).json({
        success: false,
        message: 'Please select or upload a resume to create a Mock Interview.'
      });
    }

    // 4. Create MockInterviewWorkspace Card
    const workspace = await MockInterviewWorkspace.create({
      userId: candidateId,
      resumeId: targetResumeId,
      resumeName: targetResumeName,
      jobDetails: {
        jobTitle: jobDetails.jobTitle.trim(),
        company: jobDetails.company.trim(),
        role: (jobDetails.role || '').trim(),
        jobDescription: jobDetails.jobDescription.trim()
      },
      configuration: {
        interviewType: configuration?.interviewType || 'Technical',
        difficulty: configuration?.difficulty || 'Medium',
        mode: configuration?.mode || 'Voice',
        questionCount: configuration?.questionCount || 10
      },
      status: 'READY'
    });

    const newActiveCount = activeCount + 1;

    return res.status(201).json({
      success: true,
      message: 'Mock Interview card created successfully.',
      workspace,
      activeCount: newActiveCount,
      slotsAvailable: Math.max(0, 10 - newActiveCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Candidate's Active Mock Interview Workspace Cards
// @route   GET /api/mock-interviews
// @access  Private (Candidate)
const getCandidateMockInterviews = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;

    // Query active workspaces (isDeleted !== true)
    let workspaces = await MockInterviewWorkspace.find({
      userId: candidateId,
      isDeleted: false
    }).sort({ updatedAt: -1 });

    const activeCount = workspaces.length;

    return res.status(200).json({
      success: true,
      count: activeCount,
      maxLimit: 10,
      slotsAvailable: Math.max(0, 10 - activeCount),
      workspaces
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Mock Interview Workspace Card Details
// @route   PATCH /api/mock-interviews/:id
// @access  Private (Candidate)
const updateMockInterviewWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;
    const { resumeId, jobDetails, configuration } = req.body;

    const workspace = await MockInterviewWorkspace.findOne({ _id: id, userId: candidateId, isDeleted: false });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Mock Interview card not found.' });
    }

    if (jobDetails) {
      if (jobDetails.jobTitle) workspace.jobDetails.jobTitle = jobDetails.jobTitle.trim();
      if (jobDetails.company) workspace.jobDetails.company = jobDetails.company.trim();
      if (jobDetails.role !== undefined) workspace.jobDetails.role = jobDetails.role.trim();
      if (jobDetails.jobDescription) workspace.jobDetails.jobDescription = jobDetails.jobDescription.trim();
    }

    if (configuration) {
      if (configuration.interviewType) workspace.configuration.interviewType = configuration.interviewType;
      if (configuration.difficulty) workspace.configuration.difficulty = configuration.difficulty;
      if (configuration.mode) workspace.configuration.mode = configuration.mode;
      if (configuration.questionCount) workspace.configuration.questionCount = configuration.questionCount;
    }

    if (resumeId) {
      const resDoc = await Resume.findOne({ _id: resumeId, candidate: candidateId });
      if (resDoc) {
        workspace.resumeId = resumeId;
        workspace.resumeName = resDoc.originalName || resDoc.fileName || 'Candidate_Resume.pdf';
      }
    }

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: 'Mock Interview card updated.',
      workspace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete Mock Interview Workspace Card (Releases 1 slot)
// @route   DELETE /api/mock-interviews/:id
// @access  Private (Candidate)
const deleteMockInterviewWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const workspace = await MockInterviewWorkspace.findOne({ _id: id, userId: candidateId });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Mock Interview card not found.' });
    }

    workspace.isDeleted = true;
    await workspace.save();

    const activeCount = await MockInterviewWorkspace.countDocuments({ userId: candidateId, isDeleted: false });

    return res.status(200).json({
      success: true,
      message: 'Mock Interview card deleted successfully. Slot released.',
      activeCount,
      slotsAvailable: Math.max(0, 10 - activeCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Launch New Interview Attempt for Workspace Card
// @route   POST /api/mock-interviews/:id/attempts
// @access  Private (Candidate)
const createMockInterviewAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const workspace = await MockInterviewWorkspace.findOne({ _id: id, userId: candidateId, isDeleted: false });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Mock Interview card not found.' });
    }

    // Load Resume Data
    let resumeRecord = null;
    if (workspace.resumeId) {
      resumeRecord = await Resume.findById(workspace.resumeId);
    }
    if (!resumeRecord) {
      resumeRecord = await Resume.findOne({ candidate: candidateId }).sort({ updatedAt: -1 });
    }

    const userRecord = await User.findById(candidateId).select('name headline summary bio skills experience projects');

    const resumeData = {
      resumeId: resumeRecord?._id ? resumeRecord._id.toString() : null,
      name: userRecord?.name || resumeRecord?.extractedData?.name || 'Candidate',
      headline: userRecord?.headline || resumeRecord?.extractedData?.headline || 'Software Engineer',
      summary: userRecord?.summary || resumeRecord?.extractedData?.summary || '',
      skills: resumeRecord?.keywords || resumeRecord?.extractedData?.skills || userRecord?.skills || ['React', 'Node.js', 'MongoDB'],
      projects: resumeRecord?.extractedData?.projects || userRecord?.projects || [],
      experiences: resumeRecord?.extractedData?.experiences || userRecord?.experience || []
    };

    const jobData = {
      jobId: workspace._id.toString(),
      title: workspace.jobDetails.jobTitle,
      company: workspace.jobDetails.company,
      role: workspace.jobDetails.role,
      description: workspace.jobDetails.jobDescription,
      requiredSkills: resumeData.skills,
      preferredSkills: [],
      experienceLevel: 'Mid-Level',
      location: 'Remote'
    };

    const modeUpper = (workspace.configuration.mode || 'Voice').toUpperCase();
    let qCount = workspace.configuration.questionCount || 10;
    let sectionsConfig = [];

    if (modeUpper === 'MCQ') {
      qCount = 40;
      sectionsConfig = [{ type: 'mcq', count: 40 }];
    } else if (modeUpper === 'VOICE') {
      qCount = 5;
      sectionsConfig = [{ type: 'voice', count: 5 }];
    } else if (modeUpper === 'TEXT') {
      qCount = 10;
      sectionsConfig = [{ type: 'text', count: 10 }];
    } else { // RANDOM mode
      qCount = 30;
      sectionsConfig = [
        { type: 'mcq', count: 20 },
        { type: 'voice', count: 3 },
        { type: 'text', count: 7 }
      ];
    }

    const config = {
      difficulty: (workspace.configuration.difficulty || 'Medium').toLowerCase(),
      assessmentMethod: (workspace.configuration.interviewType || 'Technical').toLowerCase(),
      totalQuestions: qCount,
      sections: sectionsConfig
    };

    // Build Evidence-Driven Adaptive Blueprint from Previous Attempt History
    const AdaptiveInterviewEngine = require('../services/ai/mockInterview/adaptiveInterviewEngine');
    const adaptiveBlueprint = await AdaptiveInterviewEngine.createAdaptiveBlueprint({
      workspaceId: workspace._id,
      candidateId,
      jobDetails: workspace.jobDetails,
      configuration: workspace.configuration
    });

    if (adaptiveBlueprint && adaptiveBlueprint.isAdaptive && adaptiveBlueprint.targetDifficulty) {
      config.difficulty = adaptiveBlueprint.targetDifficulty.toLowerCase();
    }

    // Generate AI Questions tailored to Resume + Job Details + Historical Adaptive Evidence
    const generatedAI = await GenerateQuestionsService.generateStructuredInterview({
      resumeData,
      jobData,
      configuration: config,
      adaptiveBlueprint
    });

    const mcqQuestions = generatedAI.questions.mcq || [];
    const voiceQuestions = generatedAI.questions.voice || [];
    const textQuestions = generatedAI.questions.text || [];
    const totalQuestions = mcqQuestions.length + voiceQuestions.length + textQuestions.length;

    const flatQuestions = [
      ...mcqQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'MCQ',
        category: 'mcq',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Technical',
        options: (q.options || []).map((opt, idx) => ({ id: String.fromCharCode(65 + idx), text: opt })),
        correctAnswer: q.correctAnswer,
        adaptiveReason: q.adaptiveReason || `Targeted assessment for ${q.topic || 'technical proficiency'}`,
        adaptiveMetadata: q.adaptiveMetadata || { source: 'adaptive-blueprint', competency: q.topic || 'technical' },
        candidateResponse: ''
      })),
      ...voiceQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'Voice',
        category: 'voice',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Architecture & Communication',
        adaptiveReason: q.adaptiveReason || `Targeted voice assessment for ${q.topic || 'communication'}`,
        adaptiveMetadata: q.adaptiveMetadata || { source: 'adaptive-blueprint', competency: q.topic || 'communication' },
        candidateResponse: ''
      })),
      ...textQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'Text',
        category: 'text',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Problem Solving',
        adaptiveReason: q.adaptiveReason || `Targeted text reasoning for ${q.topic || 'problem solving'}`,
        adaptiveMetadata: q.adaptiveMetadata || { source: 'adaptive-blueprint', competency: q.topic || 'problem-solving' },
        candidateResponse: ''
      }))
    ];

    // Safety Fallback: Ensure attempt contains questions
    if (flatQuestions.length === 0) {
      flatQuestions.push({
        questionId: 'voice-default-01',
        sourceKeyword: 'Architecture',
        category: 'voice',
        questionText: `Describe your technical background for ${workspace.jobDetails.jobTitle || 'Software Engineer'} and explain your step-by-step approach to designing resilient applications.`,
        targetSkill: 'Architecture & Communication',
        adaptiveReason: 'Baseline architectural assessment',
        adaptiveMetadata: { source: 'safety-fallback', competency: 'architecture' },
        candidateResponse: ''
      });
    }

    // Create Attempt preserving configuration snapshot & adaptive context
    const attempt = await Interview.create({
      candidate: candidateId,
      candidateIdString: candidateId.toString(),
      workspaceId: workspace._id,
      jobTitle: workspace.jobDetails.jobTitle,
      resumeId: workspace.resumeId,
      interviewCategory: 'mock',
      questionSource: 'resume_keywords',
      interviewType: workspace.configuration.interviewType,
      difficulty: adaptiveBlueprint?.targetDifficulty || workspace.configuration.difficulty,
      status: 'ready',
      adaptiveContext: {
        isAdaptive: adaptiveBlueprint?.isAdaptive || false,
        sourceAttemptIds: adaptiveBlueprint?.sourceAttemptIds || [],
        adaptiveBlueprint,
        targetWeaknesses: adaptiveBlueprint?.targetWeaknesses || [],
        targetUncertainties: adaptiveBlueprint?.targetUncertainties || [],
        activityInterventions: adaptiveBlueprint?.activityInterventions || [],
        previousCoverage: adaptiveBlueprint?.previousQuestionCoverage || [],
        generatedAt: new Date(),
        algorithmVersion: '2.4-adaptive'
      },
      configurationSnapshot: {
        resumeId: workspace.resumeId,
        resumeName: workspace.resumeName,
        jobDetails: { ...workspace.jobDetails },
        configuration: { ...workspace.configuration }
      },
      sourceSnapshot: {
        resume: resumeData,
        job: jobData
      },
      mock_interview_questions: {
        mcq: mcqQuestions,
        voice: voiceQuestions,
        text: textQuestions
      },
      progress: {
        currentQuestionIndex: 0,
        answeredQuestions: 0,
        totalQuestions
      },
      questions: flatQuestions
    });

    // Update parent card workspace metrics
    workspace.attemptCount += 1;
    workspace.latestAttemptId = attempt._id;
    workspace.status = 'IN_PROGRESS';
    await workspace.save();

    return res.status(201).json({
      success: true,
      message: 'Interview attempt created.',
      attemptId: attempt._id,
      attempt,
      workspace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start AI Mock Interview (Transition ready -> in_progress)
// @route   POST /api/mock-interviews/:id/start
// @access  Private (Candidate)
const startMockInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview attempt not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    interview.status = 'in_progress';
    interview.startedAt = interview.startedAt || new Date();
    await interview.save();

    const sanitizedDoc = interview.toObject();
    if (sanitizedDoc.mock_interview_questions?.mcq) {
      sanitizedDoc.mock_interview_questions.mcq = sanitizedDoc.mock_interview_questions.mcq.map((q) => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mock interview session started.',
      interview: sanitizedDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit single question answer (MCQ / Text / Voice transcript)
// @route   PATCH /api/mock-interviews/:id/questions/:questionId/answer
// @access  Private (Candidate)
const submitQuestionAnswer = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const candidateId = req.user.id || req.user._id;
    const { selectedOption, textAnswer, voiceTranscript, answer, durationSeconds, voiceMetrics } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview attempt not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    if (interview.mock_interview_questions?.mcq) {
      const mcqItem = interview.mock_interview_questions.mcq.find((q) => String(q.questionId) === String(questionId));
      if (mcqItem) {
        mcqItem.userAnswer = selectedOption || answer || mcqItem.userAnswer;
        mcqItem.isAnswered = true;
        mcqItem.answeredAt = new Date();
      }
    }

    if (interview.mock_interview_questions?.voice) {
      const voiceItem = interview.mock_interview_questions.voice.find((q) => String(q.questionId) === String(questionId));
      if (voiceItem) {
        voiceItem.transcript = voiceTranscript || answer || voiceItem.transcript;
        voiceItem.answer = answer || voiceTranscript || voiceItem.answer;
        voiceItem.userAnswer = answer || voiceTranscript || voiceItem.userAnswer;
        voiceItem.durationSeconds = durationSeconds || voiceItem.durationSeconds || 0;
        if (voiceMetrics) voiceItem.voiceMetrics = voiceMetrics;
        voiceItem.isAnswered = true;
        voiceItem.answeredAt = new Date();
      }
    }

    if (interview.mock_interview_questions?.text) {
      const textItem = interview.mock_interview_questions.text.find((q) => String(q.questionId) === String(questionId));
      if (textItem) {
        textItem.userAnswer = textAnswer || answer || textItem.userAnswer;
        textItem.isAnswered = true;
        textItem.answeredAt = new Date();
      }
    }

    if (interview.questions) {
      const flatItem = interview.questions.find((q) => String(q.questionId) === String(questionId) || String(q._id) === String(questionId));
      if (flatItem) {
        flatItem.candidateResponse = textAnswer || voiceTranscript || selectedOption || answer || flatItem.candidateResponse;
      }
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer persisted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete Mock Interview & Sync Workspace Metrics
// @route   POST /api/mock-interviews/:id/complete
// @access  Private (Candidate)
const completeMockInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview attempt not found.' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
    const evaluation = await evaluateMockInterview(interview, true);

    const score = evaluation?.overallScore ?? evaluation?.overallInterviewScore ?? 75;

    // Sync Parent Workspace Metrics
    if (interview.workspaceId) {
      const workspace = await MockInterviewWorkspace.findById(interview.workspaceId);
      if (workspace) {
        if (workspace.initialScore === null) {
          workspace.initialScore = score;
        }
        workspace.latestScore = score;
        workspace.bestScore = Math.max(workspace.bestScore ?? score, score);
        workspace.improvementScore = Math.max(0, workspace.latestScore - (workspace.initialScore || score));
        workspace.status = score >= 75 ? 'IMPROVED' : 'NEEDS_IMPROVEMENT';
        await workspace.save();
      }
    }

    // Closed-Loop Reassessment Verification & Competency Profile Update
    const previousAttempts = await Interview.find({
      workspaceId: interview.workspaceId,
      candidate: candidateId,
      status: 'completed',
      _id: { $ne: interview._id }
    }).sort({ createdAt: -1 });

    if (previousAttempts.length > 0) {
      const reassessmentResults = await AdaptiveInterviewEngine.compareAndVerifyReassessment({
        previousAttempt: previousAttempts[0],
        currentAttempt: interview,
        candidateId,
        workspaceId: interview.workspaceId
      });

      if (reassessmentResults && evaluation) {
        evaluation.reassessmentResults = reassessmentResults;
        interview.evaluation = evaluation;
        await interview.save();
      }
    }

    // Automatically generate/ensure linked Improvement Activities for this completed interview
    const activities = await ensureActivitiesForInterview(interview);

    return res.status(200).json({
      success: true,
      message: 'Mock Interview completed and workspace updated.',
      evaluation,
      activities,
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Adaptive Context & Reassessment Analysis for an Interview
// @route   GET /api/mock-interviews/:id/adaptive-context
// @access  Private (Candidate)
const getMockInterviewAdaptiveContext = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview attempt not found.' });
    }

    const AdaptiveInterviewEngine = require('../services/ai/mockInterview/adaptiveInterviewEngine');
    const blueprint = await AdaptiveInterviewEngine.createAdaptiveBlueprint({
      workspaceId: interview.workspaceId || interview._id,
      candidateId,
      jobDetails: interview.configurationSnapshot?.jobDetails || {},
      configuration: interview.configurationSnapshot?.configuration || {}
    });

    const CompetencyProfile = require('../models/CompetencyProfile');
    const competencyProfiles = await CompetencyProfile.find({ candidateId, workspaceId: interview.workspaceId });

    return res.status(200).json({
      success: true,
      interviewId: id,
      adaptiveContext: interview.adaptiveContext || null,
      reassessmentResults: interview.evaluation?.reassessmentResults || null,
      blueprint,
      competencyProfiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate Mock Interview
// @route   POST /api/mock-interviews/:id/evaluate
// @access  Private (Candidate)
const evaluateMockInterviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.body || {};

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview attempt not found.' });
    }

    const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
    const evaluation = await evaluateMockInterview(interview, Boolean(force));

    // Automatically generate/ensure linked Improvement Activities for this evaluated interview
    const activities = await ensureActivitiesForInterview(interview);

    return res.status(200).json({
      success: true,
      evaluation,
      activities,
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Mock Interview Document by ID (Workspace ID or Attempt ID)
// @route   GET /api/mock-interviews/:id
// @access  Private (Candidate)
const getMockInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Try finding by MockInterviewWorkspace ID
    const workspace = await MockInterviewWorkspace.findById(id);
    if (workspace) {
      const attempts = await Interview.find({
        $or: [{ workspaceId: id }, { workspaceId: workspace._id }]
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        workspace,
        attempts: attempts || []
      });
    }

    // 2. Try finding by Interview Attempt ID
    const interview = await Interview.findById(id);
    if (interview) {
      let parentWorkspace = null;
      let attempts = [interview];

      if (interview.workspaceId) {
        parentWorkspace = await MockInterviewWorkspace.findById(interview.workspaceId);
        attempts = await Interview.find({
          $or: [{ workspaceId: interview.workspaceId }, { workspaceId: interview.workspaceId.toString() }]
        }).sort({ createdAt: -1 });
      }

      return res.status(200).json({
        success: true,
        workspace: parentWorkspace,
        interview,
        attempts: attempts.length > 0 ? attempts : [interview]
      });
    }

    return res.status(404).json({ success: false, message: 'Mock Interview document not found.' });
  } catch (error) {
    next(error);
  }
};

// SSE stream stubs
const getGenerationProgressStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.write(`event: generation-progress\ndata: ${JSON.stringify({ progress: 100, stage: 'COMPLETED' })}\n\n`);
  res.end();
};

const getEvaluationProgressStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.write(`event: evaluation-progress\ndata: ${JSON.stringify({ progress: 100, stage: 'COMPLETED' })}\n\n`);
  res.end();
};

const evaluateSingleQuestionController = async (req, res) => {
  return res.status(200).json({ success: true });
};

// @desc    Get Mock Interview Analytics (Consistency, Timeline, HR Data)
// @route   GET /api/mock-interviews/:id/analytics
// @access  Private (Candidate / HR)
const getMockInterviewAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    let interview = await Interview.findById(id);
    if (!interview) {
      const workspace = await MockInterviewWorkspace.findById(id);
      if (workspace && workspace.latestAttemptId) {
        interview = await Interview.findById(workspace.latestAttemptId);
      }
    }
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview evaluation not found.' });
    }

    const evaluation = interview.evaluation || {};
    return res.status(200).json({
      success: true,
      interviewId: interview._id,
      overallScore: evaluation.overallScore ?? interview.overallEvaluation?.overallInterviewScore ?? 0,
      consistencyAnalytics: evaluation.consistencyAnalytics || {},
      sectionScores: evaluation.sectionScores || {},
      performanceTimeline: evaluation.performanceTimeline || [],
      performanceDrops: evaluation.performanceDrops || [],
      hrAnalytics: evaluation.hrAnalytics || {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Mock Interview Structured Review
// @route   GET /api/mock-interviews/:id/review
// @access  Private (Candidate / HR)
const getMockInterviewReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    let interview = await Interview.findById(id);
    if (!interview) {
      const workspace = await MockInterviewWorkspace.findById(id);
      if (workspace && workspace.latestAttemptId) {
        interview = await Interview.findById(workspace.latestAttemptId);
      }
    }
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    return res.status(200).json({
      success: true,
      interview,
      evaluation: interview.evaluation || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Mock Interview Improvement Recommendations
// @route   GET /api/mock-interviews/:id/improvement-plan
// @access  Private (Candidate)
const getMockInterviewImprovementPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    let interview = await Interview.findById(id);
    if (!interview) {
      const workspace = await MockInterviewWorkspace.findById(id);
      if (workspace && workspace.latestAttemptId) {
        interview = await Interview.findById(workspace.latestAttemptId);
      }
    }
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    const recommendations = interview.evaluation?.improvementRecommendations || [];
    return res.status(200).json({
      success: true,
      interviewId: interview._id,
      improvementRecommendations: recommendations,
      actionItems: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Multi-Attempt Consistency Analytics for a Mock Interview Workspace
// @route   GET /api/mock-interviews/:id/consistency
// @access  Private (Candidate / HR)
const getMockInterviewConsistency = async (req, res, next) => {
  try {
    const { id } = req.params;
    let workspace = await MockInterviewWorkspace.findById(id);
    let attempts = [];

    if (workspace) {
      attempts = await Interview.find({
        $or: [{ workspaceId: id }, { workspaceId: workspace._id }]
      }).sort({ createdAt: 1 });
    } else {
      const targetInterview = await Interview.findById(id);
      if (targetInterview) {
        if (targetInterview.workspaceId) {
          workspace = await MockInterviewWorkspace.findById(targetInterview.workspaceId);
          attempts = await Interview.find({
            $or: [{ workspaceId: targetInterview.workspaceId }, { workspaceId: targetInterview.workspaceId.toString() }]
          }).sort({ createdAt: 1 });
        } else {
          attempts = await Interview.find({
            $or: [
              { candidate: targetInterview.candidate },
              { candidateIdString: targetInterview.candidateIdString }
            ],
            jobTitle: targetInterview.jobTitle
          }).sort({ createdAt: 1 });

          if (!attempts || attempts.length === 0) {
            attempts = [targetInterview];
          }
        }
      }
    }

    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'No mock interview attempts found.' });
    }

    const sanitizeScore = (val) => {
      if (val === undefined || val === null || isNaN(val)) return null;
      const num = Number(val);
      if (num < 0) return 0;
      if (num > 100) return 100;
      return Math.round(num);
    };

    const formattedAttempts = attempts.map((att, idx) => {
      const ev = att.evaluation || {};
      const ov = att.overallEvaluation || {};
      const eng = att.englishLanguageAnalysis || {};

      const overallScore = sanitizeScore(ev.overallScore ?? ov.overallInterviewScore);
      const technical = sanitizeScore(ev.technicalScore ?? ov.technicalProficiency);
      const communication = sanitizeScore(ev.communicationScore ?? ov.communicationClarity);
      const reasoning = sanitizeScore(ev.reasoningScore ?? ov.problemSolvingRating);
      const behavioural = sanitizeScore(ev.behaviouralScore ?? ov.behaviouralCompetency);
      const voice = sanitizeScore(eng.fluencyScore ?? ev.sectionScores?.voice?.score);
      const mcq = sanitizeScore(ev.sectionScores?.mcq?.score);

      const isCurrentAttempt = att._id.toString() === id.toString();

      const sections = {
        overall: overallScore,
        technical,
        communication,
        reasoning,
        behavioural,
        voice,
        mcq,
        // Canonical 8 competencies matching InterviewJourney
        technical_knowledge: technical ?? overallScore,
        answer_quality: behavioural ?? overallScore,
        concept_explanation: sanitizeScore(ev.depthScore) ?? technical ?? overallScore,
        problem_solving: reasoning ?? overallScore,
        fluency_pacing: voice ?? communication ?? overallScore,
        answer_structure: sanitizeScore(eng.coherenceScore ?? eng.grammarScore) ?? communication ?? overallScore,
        conciseness: sanitizeScore(eng.clarityScore ?? eng.vocabularyScore) ?? communication ?? overallScore
      };

      // Compute section deltas relative to previous attempt
      const sectionsMeta = {};
      if (idx > 0) {
        const prevSections = attempts[idx - 1].evaluation || {};
        const prevOverall = attempts[idx - 1].overallEvaluation || {};
        const prevScores = {
          overall: sanitizeScore(prevSections.overallScore ?? prevOverall.overallInterviewScore),
          technical: sanitizeScore(prevSections.technicalScore ?? prevOverall.technicalProficiency),
          communication: sanitizeScore(prevSections.communicationScore ?? prevOverall.communicationClarity),
          reasoning: sanitizeScore(prevSections.reasoningScore ?? prevOverall.problemSolvingRating),
          behavioural: sanitizeScore(prevSections.behaviouralScore ?? prevOverall.behaviouralCompetency),
          voice: sanitizeScore(prevSections.sectionScores?.voice?.score),
          mcq: sanitizeScore(prevSections.sectionScores?.mcq?.score),
          technical_knowledge: sanitizeScore(prevSections.technicalScore ?? prevOverall.technicalProficiency),
          answer_quality: sanitizeScore(prevSections.behaviouralScore ?? prevOverall.behaviouralCompetency),
          concept_explanation: sanitizeScore(prevSections.depthScore),
          problem_solving: sanitizeScore(prevSections.reasoningScore ?? prevOverall.problemSolvingRating),
          fluency_pacing: sanitizeScore(prevSections.sectionScores?.voice?.score),
          answer_structure: sanitizeScore(prevSections.communicationScore),
          conciseness: sanitizeScore(prevSections.communicationScore)
        };

        Object.keys(sections).forEach(secKey => {
          const currentVal = sections[secKey];
          const prevVal = prevScores[secKey];
          if (currentVal !== null && prevVal !== null && prevVal !== undefined) {
            sectionsMeta[secKey] = {
              previousScore: prevVal,
              delta: currentVal - prevVal,
              evidence: currentVal >= prevVal
                ? `Improved by +${currentVal - prevVal} points from Attempt #${idx}`
                : `Adjusted by ${currentVal - prevVal} points from Attempt #${idx}`
            };
          }
        });
      }

      return {
        attemptId: att._id.toString(),
        attemptNumber: idx + 1,
        isCurrentAttempt,
        createdAt: att.createdAt,
        completedAt: att.completedAt || att.startedAt || att.updatedAt,
        status: att.status,
        overallScore,
        sections,
        sectionsMeta,
        strengths: ev.strengths || ov.topStrengths || [],
        weaknesses: ev.improvements || ov.recommendedImprovementAreas || [],
        feedback: ev.finalFeedback || ov.summaryExplanation || ''
      };
    });

    const sectionKeys = ['overall', 'technical_knowledge', 'communication', 'problem_solving', 'answer_quality', 'concept_explanation', 'fluency_pacing', 'answer_structure', 'conciseness', 'technical', 'reasoning', 'behavioural', 'voice', 'mcq'];
    const availableSections = sectionKeys.filter(sec =>
      formattedAttempts.some(att => att.sections[sec] !== null && att.sections[sec] !== undefined)
    );

    const sectionDeltas = {};
    const sectionVariances = {};
    const repeatedWeaknesses = [];
    const sustainedImprovements = [];

    availableSections.forEach(sec => {
      const scores = formattedAttempts.map(a => a.sections[sec]).filter(s => s !== null);
      if (scores.length > 0) {
        const first = scores[0];
        const last = scores[scores.length - 1];
        const delta = last - first;
        sectionDeltas[sec] = delta;

        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        sectionVariances[sec] = Math.round(Math.sqrt(variance) * 10) / 10;

        const lowCount = scores.filter(s => s < 70).length;
        if (lowCount >= 2) {
          repeatedWeaknesses.push({
            section: sec,
            occurrences: lowCount,
            latestScore: last,
            message: `${sec.replace('_', ' ').toUpperCase()} score has remained under 70 across ${lowCount} attempts.`
          });
        }

        if (delta >= 10 && scores.length >= 2) {
          sustainedImprovements.push({
            section: sec,
            totalGain: delta,
            message: `${sec.replace('_', ' ').toUpperCase()} improved by +${delta} points from Attempt 1 (${first}) to Attempt ${scores.length} (${last}).`
          });
        }
      }
    });

    let bestSection = null, maxScore = -1;
    let mostImprovedSection = null, maxDelta = -999;
    let lowestSection = null, minScore = 999;
    let mostInconsistentSection = null, maxVar = -1;

    availableSections.forEach(sec => {
      const scores = formattedAttempts.map(a => a.sections[sec]).filter(s => s !== null);
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const last = scores[scores.length - 1];
        if (avg > maxScore) { maxScore = Math.round(avg); bestSection = sec; }
        if (last < minScore) { minScore = last; lowestSection = sec; }

        const delta = sectionDeltas[sec] ?? 0;
        if (delta > maxDelta) { maxDelta = delta; mostImprovedSection = sec; }

        const variance = sectionVariances[sec] ?? 0;
        if (variance > maxVar && scores.length >= 2) { maxVar = variance; mostInconsistentSection = sec; }
      }
    });

    return res.status(200).json({
      success: true,
      mockInterviewId: workspace?._id || id,
      jobTitle: workspace?.jobDetails?.jobTitle || attempts[0]?.jobTitle || 'AI Mock Interview',
      company: workspace?.jobDetails?.company || attempts[0]?.company || 'CandidateIQ Enterprise',
      totalAttemptsCount: attempts.length,
      consistencyScore: formattedAttempts.length > 1 ? Math.min(100, Math.max(0, 80 + Math.round(maxDelta / 2))) : (formattedAttempts[0]?.overallScore || 75),
      availableSections,
      sections: availableSections,
      attempts: formattedAttempts,
      bestSection: bestSection ? { section: bestSection, score: maxScore } : null,
      mostImprovedSection: mostImprovedSection && maxDelta > 0 ? { section: mostImprovedSection, improvement: maxDelta } : null,
      lowestSection: lowestSection ? { section: lowestSection, score: minScore } : null,
      mostInconsistentSection: mostInconsistentSection && maxVar > 5 ? { section: mostInconsistentSection, variance: maxVar } : null,
      repeatedWeaknesses,
      sustainedImprovements
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMockInterviewWorkspace,
  getCandidateMockInterviews,
  updateMockInterviewWorkspace,
  deleteMockInterviewWorkspace,
  createMockInterviewAttempt,
  startMockInterview,
  submitQuestionAnswer,
  completeMockInterview,
  getMockInterviewById,
  getGenerationProgressStream,
  getEvaluationProgressStream,
  evaluateMockInterviewController,
  evaluateSingleQuestionController,
  getMockInterviewAnalytics,
  getMockInterviewReview,
  getMockInterviewImprovementPlan,
  getMockInterviewConsistency,
  getMockInterviewAdaptiveContext,
  ensureActivitiesForInterview
};


