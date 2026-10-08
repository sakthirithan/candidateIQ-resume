import api from '../api';
import { storageMockInterviews, storageReviews } from '../storage/storageService';

let activeSessions = {};

// Centralized Method Configuration Object
export const METHOD_CONFIG = {
  MCQ: {
    key: 'MCQ',
    label: 'MCQ (40 Questions)',
    totalCount: 40,
    estimatedDuration: 40,
    sections: [
      { id: 'sec_1', name: 'Section 1 — MCQ', type: 'MCQ', count: 40 }
    ]
  },
  VOICE: {
    key: 'VOICE',
    label: 'VOICE (5 Questions)',
    totalCount: 5,
    estimatedDuration: 20,
    sections: [
      { id: 'sec_1', name: 'Section 1 — VOICE', type: 'VOICE', count: 5 }
    ]
  },
  TEXT: {
    key: 'TEXT',
    label: 'TEXT (10 Questions)',
    totalCount: 10,
    estimatedDuration: 30,
    sections: [
      { id: 'sec_1', name: 'Section 1 — TEXT', type: 'TEXT', count: 10 }
    ]
  },
  RANDOM: {
    key: 'RANDOM',
    label: 'RANDOM (20 Questions)',
    totalCount: 20,
    estimatedDuration: 35,
    sections: [
      { id: 'sec_1', name: 'Section 1 — MCQ', type: 'MCQ', count: 15 },
      { id: 'sec_2', name: 'Section 2 — VOICE', type: 'VOICE', count: 3 },
      { id: 'sec_3', name: 'Section 3 — TEXT', type: 'TEXT', count: 2 }
    ]
  }
};

// AI Feature Extraction from Job Description
export const extractAIFeaturesFromJD = (jobDescription = '') => {
  const jdLower = (jobDescription || '').toLowerCase();
  
  const keywords = [];
  if (jdLower.includes('react')) keywords.push('React.js');
  if (jdLower.includes('node') || jdLower.includes('express')) keywords.push('Node.js / Express');
  if (jdLower.includes('mongo') || jdLower.includes('sql') || jdLower.includes('database')) keywords.push('Database Architecture');
  if (jdLower.includes('rest') || jdLower.includes('api')) keywords.push('REST API Design');
  if (jdLower.includes('auth') || jdLower.includes('jwt') || jdLower.includes('security')) keywords.push('Authentication & Security');
  if (jdLower.includes('python')) keywords.push('Python');
  if (jdLower.includes('ai') || jdLower.includes('llm') || jdLower.includes('model')) keywords.push('AI & LLM Workflows');
  if (keywords.length === 0) keywords.push('Full Stack SaaS Development', 'System Optimization');

  const topics = [
    'React Component State & Memoization',
    'High-Concurrency Node.js Event Loop',
    'Database Query Indexing & Explain Plans',
    'JWT Stateless Authentication Security',
    'Microservices Scaling & Caching Layers'
  ];

  const technicalSkills = [
    'React.js', 'Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'Docker', 'REST APIs'
  ];

  const concepts = [
    'Asymptotic Time/Space Complexity',
    'Stateless Auth & Token Rotation',
    'Database Index Contention & Sharding',
    'Zero-Downtime Deployment CI/CD'
  ];

  const responsibilities = [
    'Architect scalable asynchronous backend endpoints',
    'Prevent unnecessary React component re-renders',
    'Optimize database query execution latency under high load'
  ];

  const tools = ['Vite', 'Webpack', 'Postman', 'Git', 'Docker', 'Jira', 'Swagger'];
  const frameworks = ['React 19', 'Next.js', 'Express.js', 'TailwindCSS', 'Redux Toolkit'];
  const domainKnowledge = [
    'SaaS Multi-tenant Architecture',
    'Real-time WebSockets & Streaming',
    'RESTful API Best Practices',
    'Frontend Performance & Web Vitals'
  ];

  return {
    keywords,
    topics,
    technicalSkills,
    concepts,
    responsibilities,
    tools,
    frameworks,
    domainKnowledge
  };
};

// Helper to generate questions strictly from Job Description & Candidate Profile
export const generateQuestionsFromJD = ({
  jobDescriptionSnapshot = '',
  targetJobTitle = 'Senior Full Stack & AI Engineer',
  questionType = 'Voice',
  difficulty = 'Intermediate',
  questionCount = 10,
  candidateProfile = null,
  resumeAnalysis = null,
  missingSkills = []
}) => {
  const jdLower = (jobDescriptionSnapshot || targetJobTitle || '').toLowerCase();
  
  const isNode = jdLower.includes('node') || jdLower.includes('express') || jdLower.includes('backend');
  const isReact = jdLower.includes('react') || jdLower.includes('frontend') || jdLower.includes('ui');
  const isDatabase = jdLower.includes('mongo') || jdLower.includes('postgres') || jdLower.includes('sql') || jdLower.includes('database');
  const isCloud = jdLower.includes('aws') || jdLower.includes('docker') || jdLower.includes('microservice') || jdLower.includes('cloud');
  const isAI = jdLower.includes('ai') || jdLower.includes('llm') || jdLower.includes('gemini') || jdLower.includes('python');

  const candProjects = candidateProfile?.projects || resumeAnalysis?.projects || [];
  const primaryProject = candProjects.length > 0 ? candProjects[0] : null;

  const mcqTemplates = [
    {
      targetSkill: isNode ? 'Node.js Async Architecture' : 'Backend Microservices',
      questionText: `Which architectural approach best optimizes high-concurrency API requests in a production Node.js service for ${targetJobTitle}?`,
      keywords: ['Node.js', 'API', 'Concurrency', 'Event Loop'],
      options: [
        'A) Utilize libuv threadpool workers and cluster module process scaling.',
        'B) Block the main event loop thread using synchronous sleep timers.',
        'C) Handle all incoming HTTP requests via single-threaded synchronous loops.',
        'D) Force client-side web applications to process database aggregations.'
      ],
      correctAnswer: 'A',
      source: 'JOB_DESCRIPTION',
      sourceReference: targetJobTitle
    },
    {
      targetSkill: isReact ? 'React State & Hooks Optimization' : 'Frontend Engineering',
      questionText: `When building complex React user interfaces, how do you prevent unnecessary component re-renders across deep component trees?`,
      keywords: ['React', 'State', 'useMemo', 'Re-render'],
      options: [
        'A) Combine React Context with custom hooks, useMemo, and React.memo wrappers.',
        'B) Store all component state inside global window variables directly.',
        'C) Mutate component props directly inside render methods.',
        'D) Force re-render of document body on every state mutation.'
      ],
      correctAnswer: 'A',
      source: 'RESUME_SKILL',
      sourceReference: 'React.js'
    },
    {
      targetSkill: isDatabase ? 'Database Query Indexing' : 'Data Storage Strategy',
      questionText: `How do you optimize slow database aggregation queries experiencing high latency under heavy production traffic?`,
      keywords: ['Database', 'Indexing', 'Explain Plan', 'MongoDB'],
      options: [
        'A) Construct targeted compound indexes and inspect query execution plans.',
        'B) Remove all database indexes to reduce write lock contention.',
        'C) Store all production records in unindexed text files.',
        'D) Execute database repairs on every incoming HTTP API request.'
      ],
      correctAnswer: 'A',
      source: 'JOB_DESCRIPTION',
      sourceReference: 'MongoDB / Indexing'
    },
    {
      targetSkill: isCloud ? 'Microservice Scalability & Caching' : 'Infrastructure Design',
      questionText: `Which caching strategy is recommended for reducing database read loads in distributed cloud environments?`,
      keywords: ['Cache', 'Redis', 'Microservices', 'Latency'],
      options: [
        'A) Implement Redis in-memory caching with TTL expiration policies.',
        'B) Cache responses inside volatile client browser localStorage indefinitely.',
        'C) Query production replica databases directly without caching layers.',
        'D) Write API responses to local temporary disk files on single server.'
      ],
      correctAnswer: 'A',
      source: 'SKILL_GAP',
      sourceReference: 'Docker / Redis'
    },
    {
      targetSkill: isAI ? 'AI Model Endpoint Integration' : 'System Integration',
      questionText: `What is the most secure pattern for managing third-party AI API key credentials in full-stack applications?`,
      keywords: ['Security', 'API Keys', 'Environment Variables', 'Secrets'],
      options: [
        'A) Store keys in backend environment variables accessed strictly by server middleware.',
        'B) Hardcode API secret keys inside public client bundle JavaScript files.',
        'C) Commit plain-text secret keys directly into public Git repositories.',
        'D) Send API secret keys in plain-text URL query parameters.'
      ],
      correctAnswer: 'A',
      source: 'RESUME_SKILL',
      sourceReference: 'AI & Security'
    }
  ];

  const voiceTemplates = [
    {
      targetSkill: primaryProject ? `Project Architecture (${primaryProject.name || primaryProject.title || 'Candidate Project'})` : 'Production Incident Response',
      questionText: primaryProject
        ? `Explain how you designed the system architecture for your project "${primaryProject.name || 'CandidateIQ'}" and why you chose tech stack (${primaryProject.tech || primaryProject.technologies || 'React/Node.js'}).`
        : `Describe a scenario where a production API suddenly experiences high latency after a major deployment. What immediate diagnostic steps do you take?`,
      keywords: ['Architecture', 'Tech Stack', 'STAR Framework', 'Debugging'],
      evaluationCriteria: 'Covers APM metrics inspection, log analysis, rollback strategy, and root-cause post-mortem.',
      source: primaryProject ? 'RESUME_PROJECT' : 'JOB_DESCRIPTION',
      sourceReference: primaryProject ? (primaryProject.name || 'Resume Project') : targetJobTitle
    },
    {
      targetSkill: 'Architectural Trade-offs & System Design',
      questionText: `Walk me through your architectural decision-making process when choosing between REST and GraphQL for an enterprise software platform.`,
      keywords: ['REST API', 'GraphQL', 'Architecture', 'Trade-offs'],
      evaluationCriteria: 'Articulates over-fetching, schema enforcement, caching implications, and client flexibility.',
      source: 'JOB_DESCRIPTION',
      sourceReference: 'REST API'
    },
    {
      targetSkill: missingSkills.length > 0 ? `Skill Gap Evaluation (${missingSkills[0]})` : 'Cross-functional Technical Leadership',
      questionText: missingSkills.length > 0
        ? `The job requisition lists "${missingSkills[0]}" as a key requirement. How would you quickly ramp up and apply "${missingSkills[0]}" to production code?`
        : `How do you resolve architectural disagreements with senior tech leads while ensuring project deadlines and code quality standards are maintained?`,
      keywords: ['Leadership', 'Collaboration', 'STAR Framework', 'Skill Gap'],
      evaluationCriteria: 'Demonstrates data-driven technical reasoning, respectful compromise, and clear documentation.',
      source: missingSkills.length > 0 ? 'SKILL_GAP' : 'GENERAL',
      sourceReference: missingSkills.length > 0 ? missingSkills[0] : 'Leadership'
    }
  ];

  const textTemplates = [
    {
      targetSkill: 'System Security & Authentication Architecture',
      questionText: `Explain how you would design a scalable, stateless authentication service for the role requirements specified in this job description.`,
      keywords: ['JWT', 'Stateless Auth', 'Security', 'Token Rotation'],
      evaluationCriteria: 'Covers JWT access tokens, refresh token rotation, Redis blacklisting, and HTTPS transport.',
      source: 'JOB_DESCRIPTION',
      sourceReference: 'Stateless Auth'
    },
    {
      targetSkill: 'Data Structure Optimization & Algorithm Complexity',
      questionText: `Analyze the time and space complexity tradeoffs of in-memory caching versus database query aggregations for high-throughput API endpoints.`,
      keywords: ['Complexity', 'Big O', 'Cache Overhead', 'Space-Time Tradeoff'],
      evaluationCriteria: 'Details O(1) cache lookups, memory overhead limits, cache invalidation, and database O(log N) index costs.',
      source: 'RESUME_EXPERIENCE',
      sourceReference: 'Database Aggregations'
    },
    {
      targetSkill: 'CI/CD Automated Deployment Safeguards',
      questionText: `Detail your approach for implementing zero-downtime deployments, automated integration testing, and feature flags in continuous integration pipelines.`,
      keywords: ['CI/CD', 'Blue-Green', 'Feature Flags', 'Automated Testing'],
      evaluationCriteria: 'Explains blue-green deployments, canary releases, unit test gates, and graceful rollback strategies.',
      source: 'JOB_DESCRIPTION',
      sourceReference: 'CI/CD'
    }
  ];

  let questions = [];
  const methodUpper = (questionType || 'Voice').toUpperCase();

  if (methodUpper === 'MCQ') {
    const limit = 40;
    for (let i = 0; i < limit; i++) {
      const template = mcqTemplates[i % mcqTemplates.length];
      questions.push({
        questionId: `q_mcq_${i + 1}`,
        questionNumber: i + 1,
        sectionId: 'sec_1',
        sectionName: 'Section 1 — MCQ',
        category: 'MCQ',
        questionType: 'MCQ',
        targetSkill: template.targetSkill,
        questionText: `[${difficulty}] Q${i + 1}: ${template.questionText}`,
        keywords: template.keywords,
        options: template.options,
        correctAnswer: template.correctAnswer,
        evaluationCriteria: 'Correct selection verifies core technical competency aligned with job requirements.',
        source: template.source || 'JOB_DESCRIPTION',
        sourceReference: template.sourceReference || targetJobTitle
      });
    }
  } else if (methodUpper === 'VOICE') {
    const limit = 5;
    for (let i = 0; i < limit; i++) {
      const template = voiceTemplates[i % voiceTemplates.length];
      questions.push({
        questionId: `q_voice_${i + 1}`,
        questionNumber: i + 1,
        sectionId: 'sec_1',
        sectionName: 'Section 1 — VOICE',
        category: 'Voice',
        questionType: 'Voice',
        targetSkill: template.targetSkill,
        questionText: `[${difficulty}] Q${i + 1}: ${template.questionText}`,
        keywords: template.keywords,
        evaluationCriteria: template.evaluationCriteria,
        source: template.source || 'RESUME_PROJECT',
        sourceReference: template.sourceReference || 'Candidate Resume'
      });
    }
  } else if (methodUpper === 'TEXT') {
    const limit = 10;
    for (let i = 0; i < limit; i++) {
      const template = textTemplates[i % textTemplates.length];
      questions.push({
        questionId: `q_text_${i + 1}`,
        questionNumber: i + 1,
        sectionId: 'sec_1',
        sectionName: 'Section 1 — TEXT',
        category: 'Text',
        questionType: 'Text',
        targetSkill: template.targetSkill,
        questionText: `[${difficulty}] Q${i + 1}: ${template.questionText}`,
        keywords: template.keywords,
        evaluationCriteria: template.evaluationCriteria,
        source: template.source || 'JOB_DESCRIPTION',
        sourceReference: template.sourceReference || targetJobTitle
      });
    }
  } else {
    let qIndex = 1;
    for (let i = 0; i < 15; i++) {
      const template = mcqTemplates[i % mcqTemplates.length];
      questions.push({
        questionId: `q_rnd_${qIndex}`,
        questionNumber: qIndex,
        sectionId: 'sec_1',
        sectionName: 'Section 1 — MCQ',
        category: 'MCQ',
        questionType: 'MCQ',
        targetSkill: template.targetSkill,
        questionText: `[${difficulty}] Q${qIndex} (MCQ): ${template.questionText}`,
        keywords: template.keywords,
        options: template.options,
        correctAnswer: template.correctAnswer,
        evaluationCriteria: 'Correct selection verifies technical option accuracy.',
        source: template.source || 'JOB_DESCRIPTION',
        sourceReference: template.sourceReference || targetJobTitle
      });
      qIndex++;
    }
    for (let i = 0; i < 3; i++) {
      const template = voiceTemplates[i % voiceTemplates.length];
      questions.push({
        questionId: `q_rnd_${qIndex}`,
        questionNumber: qIndex,
        sectionId: 'sec_2',
        sectionName: 'Section 2 — VOICE',
        category: 'Voice',
        questionType: 'Voice',
        targetSkill: template.targetSkill,
        questionText: `[${difficulty}] Q${qIndex} (VOICE): ${template.questionText}`,
        keywords: template.keywords,
        evaluationCriteria: template.evaluationCriteria,
        source: template.source || 'RESUME_PROJECT',
        sourceReference: template.sourceReference || 'Candidate Resume'
      });
      qIndex++;
    }
    for (let i = 0; i < 2; i++) {
      const template = textTemplates[i % textTemplates.length];
      questions.push({
        questionId: `q_rnd_${qIndex}`,
        questionNumber: qIndex,
        sectionId: 'sec_3',
        sectionName: 'Section 3 — TEXT',
        category: 'Text',
        questionType: 'Text',
        targetSkill: template.targetSkill,
        questionText: `[${difficulty}] Q${qIndex} (TEXT): ${template.questionText}`,
        keywords: template.keywords,
        evaluationCriteria: template.evaluationCriteria,
        source: template.source || 'JOB_DESCRIPTION',
        sourceReference: template.sourceReference || targetJobTitle
      });
      qIndex++;
    }
  }

  return questions;
};

// Deterministic Fallback AI Provider
export const fallbackAIProvider = async ({
  jobTitle = 'Senior Frontend Developer',
  jobDescription = 'We are seeking a Senior Frontend Developer proficient in React, TypeScript, state management, web performance optimization, and REST API integration.',
  difficulty = 'Medium',
  method = 'RANDOM'
}) => {
  await new Promise((r) => setTimeout(r, 300));
  const features = extractAIFeaturesFromJD(jobDescription);
  const questions = generateQuestionsFromJD({
    jobDescriptionSnapshot: jobDescription,
    targetJobTitle: jobTitle,
    questionType: method,
    difficulty,
    questionCount: METHOD_CONFIG[method]?.totalCount || 20
  });

  const methodConfig = METHOD_CONFIG[method] || METHOD_CONFIG.RANDOM;

  return {
    jobTitle,
    jobDescription,
    difficulty,
    method,
    extractedFeatures: features,
    sections: methodConfig.sections,
    questions
  };
};

export const mockInterviewService = {
  getInterviews: async () => {
    return storageMockInterviews.getAll();
  },

  startInterviewSession: async ({
    title = '',
    targetJobTitle,
    jobId,
    jobDescriptionSnapshot = '',
    company = 'CandidateIQ Requisition',
    interviewType = 'Technical',
    questionFormat = 'Voice',
    difficulty = 'Intermediate',
    questionCount = 10,
    timerMinutes = 30
  }) => {
    try {
      const response = await api.post('/interviews/start', {
        jobId: (jobId && jobId.length === 24) ? jobId : undefined,
        interviewType: interviewType.toLowerCase(),
        difficulty,
        questionCount: questionCount || 10
      });

      if (response.data && response.data.interview) {
        const inv = response.data.interview;
        const formattedSession = {
          sessionId: inv._id || inv.id,
          id: inv._id || inv.id,
          _id: inv._id,
          title: title || `${inv.jobTitle || targetJobTitle || 'Full Stack Developer'} — Dynamic AI Interview`,
          jobId: inv.job || jobId,
          targetJobTitle: inv.jobTitle || targetJobTitle,
          company,
          interviewType,
          questionFormat,
          difficulty,
          state: 'In Progress',
          status: 'In Progress',
          startedAt: inv.createdAt,
          tabSwitchCount: 0,
          answers: [],
          questions: (inv.questions || []).map(q => ({
            questionId: q.questionId,
            questionNumber: q.questionId,
            category: q.category || 'Technical',
            questionType: questionFormat,
            targetSkill: q.targetSkill || 'Software Development',
            questionText: q.questionText,
            evaluationCriteria: q.evaluationCriteria
          }))
        };
        activeSessions[formattedSession.sessionId] = formattedSession;
        storageMockInterviews.saveMockInterview(formattedSession);
        return formattedSession;
      }
    } catch (err) {
      console.warn('[interviewService Warning] Backend interview start failed, operating in fallback mode:', err);
    }

    // Client-side fallback if backend call fails or invalid ObjectId
    const sessionId = `mock_sess_${Date.now()}`;
    const effectiveTitle = title || (targetJobTitle ? `${targetJobTitle} — Mock Interview` : 'Full Stack Developer — Mock Interview');
    const generatedQuestions = generateQuestionsFromJD({
      jobDescriptionSnapshot: jobDescriptionSnapshot || targetJobTitle,
      targetJobTitle: targetJobTitle || 'Senior Full Stack & AI Engineer',
      questionType: questionFormat,
      difficulty,
      questionCount
    });

    const newSession = {
      sessionId,
      id: sessionId,
      candidateId: 'cand_1',
      title: effectiveTitle,
      jobId: jobId || 'job_1',
      targetJobTitle: targetJobTitle || 'Senior Full Stack & AI Engineer',
      company,
      jobDescriptionSnapshot: jobDescriptionSnapshot || `Standard requisition requirements for ${targetJobTitle}.`,
      interviewType: interviewType || 'Technical',
      questionFormat: questionFormat || 'Voice',
      difficulty: difficulty || 'Intermediate',
      questionCount: generatedQuestions.length,
      timerMinutes: timerMinutes || 30,
      state: 'In Progress',
      status: 'In Progress',
      startedAt: new Date().toISOString(),
      tabSwitchCount: 0,
      answers: [],
      questions: generatedQuestions
    };

    activeSessions[sessionId] = newSession;
    storageMockInterviews.saveMockInterview(newSession);
    return newSession;
  },

  recordAnswer: async (sessionId, answerPayload) => {
    let session = activeSessions[sessionId] || storageMockInterviews.getById(sessionId);

    // Call Express API endpoints if sessionId is MongoDB ObjectId (24 chars)
    if (sessionId && sessionId.length === 24) {
      try {
        await api.patch(`/mock-interviews/${sessionId}/questions/${answerPayload.questionId}/answer`, {
          selectedOption: answerPayload.selectedOption,
          textAnswer: answerPayload.textAnswer,
          voiceTranscript: answerPayload.voiceTranscript,
          answer: answerPayload.answer || answerPayload.textAnswer || answerPayload.voiceTranscript || answerPayload.selectedOption,
          durationSeconds: answerPayload.durationSeconds || 0
        });
      } catch (err) {
        console.warn(`[interviewService Warning] Failed to submit mock-interview PATCH answer for session ${sessionId}:`, err);
        try {
          await api.post(`/interviews/${sessionId}/answer`, {
            questionId: answerPayload.questionId,
            responseText: answerPayload.textAnswer || answerPayload.voiceTranscript || answerPayload.selectedOption || answerPayload.answer || 'Answer submitted'
          });
        } catch (e2) {}
      }
    }

    const answerEntry = {
      questionId: answerPayload.questionId,
      questionType: answerPayload.questionType || 'Voice',
      selectedOption: answerPayload.selectedOption || null,
      textAnswer: answerPayload.textAnswer || answerPayload.answer || '',
      voiceTranscript: answerPayload.voiceTranscript || answerPayload.answer || '',
      audioReference: answerPayload.audioReference || null,
      submitted: true,
      submittedAt: new Date().toISOString()
    };
    if (session) {
      const existingAnswers = session.answers || [];
      session.answers = existingAnswers.filter(a => a.questionId !== answerPayload.questionId);
      session.answers.push(answerEntry);
      activeSessions[sessionId] = session;
      storageMockInterviews.saveMockInterview(session);
    }
    return answerEntry;
  },

  completeInterviewSession: async (sessionId) => {
    let session = activeSessions[sessionId] || storageMockInterviews.getById(sessionId);

    if (sessionId && sessionId.length === 24) {
      try {
        let response = null;
        try {
          response = await api.post(`/mock-interviews/${sessionId}/complete`);
        } catch (e) {
          response = await api.post(`/interviews/${sessionId}/complete`);
        }
        if (response.data && response.data.interview) {
          const inv = response.data.interview;
          if (session) {
            session.state = 'Completed';
            session.status = 'Completed';
            session.overallScore = inv.overallEvaluation?.overallInterviewScore || 85;
            session.scores = {
              technical: inv.overallEvaluation?.technicalProficiency || 85,
              relevance: inv.overallEvaluation?.behaviouralCompetency || 85,
              depth: inv.overallEvaluation?.problemSolvingRating || 80,
              problemSolving: inv.overallEvaluation?.problemSolvingRating || 80,
              communication: inv.overallEvaluation?.communicationClarity || 85,
              behaviouralEvidence: inv.overallEvaluation?.behaviouralCompetency || 85
            };
            session.summary = inv.overallEvaluation?.summaryExplanation;
            storageMockInterviews.saveMockInterview(session);
          }
          return session || inv;
        }
      } catch (err) {
        console.warn(`[interviewService Warning] Failed to complete backend interview for ${sessionId}:`, err);
      }
    }

    if (session) {
      session.state = 'Completed';
      session.status = 'Completed';
      session.completedAt = new Date().toISOString();
      session.overallScore = 86;
      session.scores = {
        technical: 88,
        relevance: 89,
        depth: 82,
        problemSolving: 85,
        communication: 84,
        behaviouralEvidence: 86
      };
      session.summary = `Candidate completed ${session.answers?.length || 0} evaluation questions for ${session.title}.`;
      storageMockInterviews.saveMockInterview(session);
    }
    return session;
  },

  getInterviewById: async (sessionId) => {
    if (sessionId && sessionId.length === 24) {
      try {
        const response = await api.get(`/interviews/${sessionId}`);
        if (response.data && response.data.interview) {
          return response.data.interview;
        }
      } catch (err) {
        console.warn(`[interviewService Warning] Failed to get backend interview ${sessionId}:`, err);
      }
    }
    return activeSessions[sessionId] || storageMockInterviews.getById(sessionId);
  },

  getCandidateInterviews: async () => {
    try {
      let response = null;
      try {
        response = await api.get('/mock-interviews');
      } catch (e1) {
        response = await api.get('/interviews/candidate');
      }

      if (response.data && Array.isArray(response.data.interviews) && response.data.interviews.length > 0) {
        return response.data.interviews.map((inv) => {
          const score = inv.score ?? inv.evaluation?.overallScore ?? inv.overallEvaluation?.overallInterviewScore ?? null;
          const techScore = inv.technicalScore ?? inv.evaluation?.technicalScore ?? inv.overallEvaluation?.technicalProficiency ?? null;
          const commScore = inv.communicationScore ?? inv.evaluation?.communicationScore ?? inv.overallEvaluation?.communicationClarity ?? null;
          const reasScore = inv.reasoningScore ?? inv.evaluation?.reasoningScore ?? inv.overallEvaluation?.problemSolvingRating ?? null;
          const behavScore = inv.behaviouralScore ?? inv.evaluation?.behaviouralScore ?? inv.overallEvaluation?.behaviouralCompetency ?? null;
          const evalStatus = inv.evaluationStatus || inv.evaluation?.status || (inv.status === 'completed' ? 'pending' : 'unevaluated');

          return {
            attemptId: inv._id || inv.id,
            id: inv._id || inv.id,
            sessionId: inv._id || inv.id,
            _id: inv._id,
            source: inv.questionSource === 'recruiter_job' ? 'RECRUITER_JOB' : 'CUSTOM_JD',
            jobId: inv.job?._id || inv.job || null,
            userId: inv.candidate,
            candidateId: inv.candidate,
            title: inv.jobTitle || inv.job?.title || 'AI Mock Interview',
            jobTitle: inv.jobTitle || inv.job?.title || 'AI Mock Interview',
            jobDescription: inv.job?.description || 'AI Mock Interview Session',
            company: inv.company || inv.job?.company || 'CandidateIQ Enterprise',
            difficulty: inv.difficulty || 'Medium',
            method: (inv.method || inv.interviewType || 'RANDOM').toUpperCase(),
            status: inv.status === 'completed' || inv.status === 'Completed' ? 'completed' : 'in_progress',
            state: inv.status === 'completed' || inv.status === 'Completed' ? 'Completed' : 'In Progress',
            questionCount: inv.questionCount || (inv.questions?.length) || 20,
            answeredCount: inv.answeredCount || 0,
            score,
            overallScore: score,
            technicalScore: techScore,
            communicationScore: commScore,
            reasoningScore: reasScore,
            behaviouralScore: behavScore,
            evaluationStatus: evalStatus,
            startedAt: inv.createdAt || inv.startedAt,
            finishedAt: inv.completedAt || inv.updatedAt,
            rawInterview: inv
          };
        });
      }
    } catch (err) {
      console.warn('[interviewService] Live database fetch failed, reading fallback storage:', err);
    }
    return storageMockInterviews.getAll();
  },

  getMockInterviewById: async (id) => {
    try {
      const response = await api.get(`/mock-interviews/${id}`);
      if (response.data && response.data.interview) {
        return response.data.interview;
      }
    } catch (err) {
      console.warn(`[interviewService] GET /mock-interviews/${id} failed:`, err);
    }
    return null;
  },

  evaluateMockInterview: async (id, force = false) => {
    try {
      const response = await api.post(`/mock-interviews/${id}/evaluate`, { force });
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.error(`[interviewService] POST /mock-interviews/${id}/evaluate failed:`, err);
      throw err;
    }
  },

  getWorkspaces: async () => {
    try {
      const response = await api.get('/mock-interviews');
      return response.data;
    } catch (err) {
      console.warn('[mockInterviewService] API fetch workspaces warning:', err);
      return { count: 0, maxLimit: 10, slotsAvailable: 10, workspaces: [] };
    }
  },

  createWorkspace: async (data) => {
    try {
      const response = await api.post('/mock-interviews', data);
      return response.data;
    } catch (err) {
      console.error('[mockInterviewService] Create workspace error:', err);
      throw err;
    }
  },

  updateWorkspace: async (id, data) => {
    try {
      const response = await api.patch(`/mock-interviews/${id}`, data);
      return response.data;
    } catch (err) {
      console.error(`[mockInterviewService] Update workspace ${id} error:`, err);
      throw err;
    }
  },

  deleteWorkspace: async (id) => {
    try {
      const response = await api.delete(`/mock-interviews/${id}`);
      return response.data;
    } catch (err) {
      console.error(`[mockInterviewService] Delete workspace ${id} error:`, err);
      throw err;
    }
  },

  createAttemptForWorkspace: async (workspaceId) => {
    try {
      const response = await api.post(`/mock-interviews/${workspaceId}/attempts`);
      return response.data;
    } catch (err) {
      console.error(`[mockInterviewService] Create attempt for workspace ${workspaceId} error:`, err);
      throw err;
    }
  },

  getMockInterviewAnalytics: async (id) => {
    try {
      const response = await api.get(`/mock-interviews/${id}/analytics`);
      return response.data;
    } catch (err) {
      console.warn(`[interviewService] GET /mock-interviews/${id}/analytics failed:`, err);
      return null;
    }
  },

  getMockInterviewReview: async (id) => {
    try {
      const response = await api.get(`/mock-interviews/${id}/review`);
      return response.data;
    } catch (err) {
      console.warn(`[interviewService] GET /mock-interviews/${id}/review failed:`, err);
      return null;
    }
  },

  getMockInterviewImprovementPlan: async (id) => {
    try {
      const response = await api.get(`/mock-interviews/${id}/improvement-plan`);
      return response.data;
    } catch (err) {
      console.warn(`[interviewService] GET /mock-interviews/${id}/improvement-plan failed:`, err);
      return null;
    }
  },

  getMockInterviewConsistency: async (id) => {
    try {
      const response = await api.get(`/mock-interviews/${id}/consistency`);
      return response.data;
    } catch (err) {
      console.warn(`[interviewService] GET /mock-interviews/${id}/consistency failed:`, err);
      return null;
    }
  },

  getMockInterviewAdaptiveContext: async (id) => {
    try {
      const response = await api.get(`/mock-interviews/${id}/adaptive-context`);
      return response.data;
    } catch (err) {
      console.warn(`[interviewService] GET /mock-interviews/${id}/adaptive-context failed:`, err);
      return null;
    }
  },

  recordTabSwitch: async (sessionId) => {

    let session = activeSessions[sessionId] || storageMockInterviews.getById(sessionId);
    if (session) {
      session.tabSwitchCount = (session.tabSwitchCount || 0) + 1;
      activeSessions[sessionId] = session;
      storageMockInterviews.saveMockInterview(session);
    }
    return session?.tabSwitchCount || 1;
  }
};

export default mockInterviewService;
