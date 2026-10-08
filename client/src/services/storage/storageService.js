// Centralized LocalStorage Service for CandidateIQ Single Source of Truth
// Manages persistence, reactive same-tab custom events, and cross-tab storage events

const KEYS = {
  USERS: 'candidateiq_users',
  CURRENT_USER: 'candidateiq_current_user',
  SESSION: 'candidateiq_session',
  JOBS: 'candidateiq_jobs',
  APPLICATIONS: 'candidateiq_applications',
  RESUMES: 'candidateiq_resumes',
  INTERVIEWS: 'candidateiq_interviews', // HR & Final recruiter-assigned interviews
  MOCK_INTERVIEWS: 'candidateiq_mock_interviews', // Candidate practice mock interviews
  QUESTION_BANKS: 'candidateiq_question_banks',
  PROFILES: 'candidateiq_profiles',
  REVIEWS: 'candidateiq_reviews',
  SETTINGS: 'candidateiq_settings'
};

const EVENT_NAME = 'candidateiq:data-updated';

// ----------------------------------------------------
// EVENT NOTIFICATION & SUBSCRIPTION HELPERS
// ----------------------------------------------------
export const notifyDataUpdated = (entity, action = 'updated', payload = null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { entity, action, payload, timestamp: Date.now() }
      })
    );
  }
};

export const subscribeToStorage = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    if (callback) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (callback) callback({ entity: e.key, action: 'storageEvent', newValue: e.newValue });
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------
const DEFAULT_USERS = [
  {
    id: 'cand_1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
    role: 'candidate',
    createdAt: '2026-01-01'
  },
  {
    id: 'cand_demo_001',
    name: 'Alex Johnson',
    email: 'candidate.demo@candidateiq.com',
    password: 'password123',
    role: 'candidate',
    createdAt: '2026-01-01'
  },
  {
    id: 'rec_1',
    name: 'Sarah Wilson',
    email: 'recruiter.demo@candidateiq.com',
    password: 'password123',
    role: 'hr',
    paymentStatus: 'paid',
    activated: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'admin_001',
    name: 'CandidateIQ System Admin',
    email: 'admin@candidateiq.com',
    password: 'Admin@123',
    role: 'admin',
    createdAt: '2025-01-01'
  }
];

const DEFAULT_JOBS = [
  {
    id: 'job_1',
    title: 'Senior MERN Stack & AI Engineer',
    department: 'Engineering',
    company: 'CandidateIQ Enterprise',
    location: 'Remote / San Francisco',
    type: 'Full-Time',
    experience: '4+ Years',
    salary: '$145,000 - $175,000',
    postedDate: '2026-09-01',
    status: 'Active',
    applicantsCount: 18,
    matchPercentage: 92,
    description: 'We are seeking a high-caliber Senior Full Stack Engineer with strong React, Node.js, and AI API integration experience to lead the next generation of our Talent Intelligence Platform.',
    requiredSkills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs'],
    preferredSkills: ['Python', 'Docker', 'AWS / GCP', 'Gemini API', 'Tailwind CSS'],
    requirements: [
      '4+ years building production-grade SaaS web applications with Node.js & React',
      'Solid grasp of SQL & NoSQL database performance optimization',
      'Experience implementing automated unit & integration testing suites'
    ]
  },
  {
    id: 'job_2',
    title: 'Lead Machine Learning & AI Architect',
    department: 'AI Research',
    company: 'NeuralCorp Global',
    location: 'Austin, TX / Hybrid',
    type: 'Full-Time',
    experience: '6+ Years',
    salary: '$180,000 - $220,000',
    postedDate: '2026-08-25',
    status: 'Active',
    applicantsCount: 12,
    matchPercentage: 86,
    description: 'Lead our AI models team to design, fine-tune, and deploy agentic LLM workflows for enterprise automated decision support systems.',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Vector DBs', 'FastAPI'],
    preferredSkills: ['LangChain', 'Kubernetes', 'MLOps', 'System Architecture'],
    requirements: [
      'Master degree or equivalent experience in Computer Science or Artificial Intelligence',
      'Proven track record scaling LLM deployments to high-throughput production environments'
    ]
  },
  {
    id: 'job_3',
    title: 'Principal Frontend UX/UI Engineer',
    department: 'Product Design',
    company: 'Vanguard SaaS Labs',
    location: 'New York, NY / Remote',
    type: 'Full-Time',
    experience: '5+ Years',
    salary: '$140,000 - $165,000',
    postedDate: '2026-08-18',
    status: 'Active',
    applicantsCount: 24,
    matchPercentage: 79,
    description: 'Craft stunning, high-performance web components using modern CSS, Tailwind, Recharts, and accessible React design systems.',
    requiredSkills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Figma', 'Web Vitals'],
    preferredSkills: ['Next.js', 'Framer Motion', 'Radix UI', 'Design Systems'],
    requirements: [
      'Deep mastery of modern visual layout patterns, accessibility standards, and micro-interactions',
      'Portfolio demonstrating high-craft SaaS interface designs'
    ]
  }
];

const DEFAULT_APPLICATIONS = [
  {
    id: 'app_1',
    jobId: 'job_1',
    jobTitle: 'Senior MERN Stack & AI Engineer',
    company: 'CandidateIQ Enterprise',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    candidateEmail: 'alex@example.com',
    appliedDate: '2026-09-02',
    status: 'Shortlisted', // 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Rejected'
    matchPercentage: 92,
    iqScore: 88,
    timeline: [
      { step: 'Applied', date: '2026-09-02', done: true },
      { step: 'AI Resume Screened', date: '2026-09-02', done: true },
      { step: 'Shortlisted', date: '2026-09-03', done: true },
      { step: 'AI Mock Interview', date: 'Pending', done: false },
      { step: 'Final Offer Decision', date: 'Pending', done: false }
    ]
  },
  {
    id: 'app_2',
    jobId: 'job_2',
    jobTitle: 'Lead Machine Learning & AI Architect',
    company: 'NeuralCorp Global',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    candidateEmail: 'alex@example.com',
    appliedDate: '2026-08-30',
    status: 'Interview',
    matchPercentage: 94,
    iqScore: 89,
    interviewDetails: {
      round: 'Technical Architecture Round',
      date: '2026-09-12',
      time: '11:00 AM PST',
      mode: 'Google Meet / CandidateIQ Room'
    },
    timeline: [
      { step: 'Applied', date: '2026-08-30', done: true },
      { step: 'AI Resume Screened', date: '2026-08-30', done: true },
      { step: 'Shortlisted', date: '2026-08-31', done: true },
      { step: 'AI Mock Interview', date: '2026-09-02', done: true },
      { step: 'Final Offer Decision', date: 'Pending', done: false }
    ]
  },
  {
    id: 'app_3',
    jobId: 'job_3',
    jobTitle: 'Principal Frontend UX/UI Engineer',
    company: 'Vanguard SaaS Labs',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    candidateEmail: 'alex@example.com',
    appliedDate: '2026-08-20',
    status: 'Under Review',
    matchPercentage: 79,
    iqScore: 88,
    timeline: [
      { step: 'Applied', date: '2026-08-20', done: true },
      { step: 'AI Resume Screened', date: '2026-08-21', done: true },
      { step: 'Shortlisted', date: 'Pending', done: false },
      { step: 'AI Mock Interview', date: 'Pending', done: false },
      { step: 'Final Offer Decision', date: 'Pending', done: false }
    ]
  }
];

const DEFAULT_INTERVIEWS = [
  {
    id: 'hr_int_101',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    jobId: 'job_1',
    jobTitle: 'Senior MERN Stack & AI Engineer',
    company: 'CandidateIQ Enterprise',
    title: 'Technical HR Evaluation — Senior MERN Stack & AI Engineer',
    type: 'HR', // 'HR' or 'FINAL'
    scheduledDate: '2026-09-18',
    scheduledTime: '10:30 AM',
    duration: '45 minutes',
    interviewType: 'Technical & Culture Fit',
    interviewer: 'Sarah Jenkins (Lead Recruiter & Hiring Manager)',
    instructions: 'Please be ready to present your past architecture work, REST API scalability choices, and STAR situational leadership examples.',
    meetingLink: 'https://meet.candidateiq.com/room/hr-int-101',
    additionalDetails: 'Prepare 2-3 questions for the hiring committee regarding production deployment workflows.',
    status: 'Scheduled',
    createdAt: '2026-09-05T10:00:00.000Z'
  },
  {
    id: 'final_int_102',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    jobId: 'job_2',
    jobTitle: 'Lead Machine Learning & AI Architect',
    company: 'NeuralCorp Global',
    title: 'Final Architectural Interview — Lead Machine Learning Architect',
    type: 'FINAL', // 'HR' or 'FINAL'
    scheduledDate: '2026-09-20',
    scheduledTime: '02:00 PM',
    duration: '60 minutes',
    interviewType: 'Final Executive Architecture Round',
    interviewer: 'Dr. Marcus Vance (VP of AI Engineering)',
    instructions: 'System design deep-dive evaluation, LLM pipeline scalability, and team leadership alignment.',
    meetingLink: 'https://meet.candidateiq.com/room/final-int-102',
    additionalDetails: 'Bring 1-2 system architecture diagrams or code samples to discuss.',
    status: 'Scheduled',
    createdAt: '2026-09-06T14:00:00.000Z'
  }
];

const DEFAULT_MOCK_INTERVIEWS = [
  {
    id: 'mock_int_201',
    sessionId: 'mock_int_201',
    candidateId: 'cand_1',
    title: 'Full Stack Developer — MERN Practice',
    jobId: 'job_1',
    targetJobTitle: 'Senior MERN Stack & AI Engineer',
    company: 'CandidateIQ Enterprise',
    sourceType: 'POSTED_JOB',
    jobDescriptionSnapshot: 'We are seeking a high-caliber Senior Full Stack Engineer with strong React, Node.js, and AI API integration experience to lead the next generation of our Talent Intelligence Platform.',
    questionFormat: 'MCQ',
    questionCount: 40,
    difficulty: 'Medium',
    scheduledDate: '2026-09-15',
    scheduledTime: '11:00 AM',
    timerMinutes: 30,
    status: 'Scheduled',
    createdAt: '2026-09-08T09:00:00.000Z'
  },
  {
    id: 'mock_int_202',
    sessionId: 'mock_int_202',
    candidateId: 'cand_1',
    title: 'Backend API Scalability Practice',
    jobId: 'custom',
    targetJobTitle: 'Backend Engineer (Custom JD)',
    company: 'Custom Requisition',
    sourceType: 'CUSTOM_JD',
    jobDescriptionSnapshot: 'Designing high-concurrency Node.js APIs, Redis caching layers, and database sharding for enterprise microservice platforms.',
    questionFormat: 'Voice',
    questionCount: 10,
    difficulty: 'Hard',
    scheduledDate: '2026-09-18',
    scheduledTime: '03:30 PM',
    timerMinutes: 25,
    status: 'Scheduled',
    createdAt: '2026-09-09T14:00:00.000Z'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'int_1',
    candidateId: 'cand_1',
    jobId: 'job_1',
    jobTitle: 'Senior MERN Stack & AI Engineer',
    type: 'Technical & Behavioural',
    completedDate: '2026-09-04',
    overallScore: 83,
    scores: {
      technical: 86,
      relevance: 88,
      depth: 79,
      problemSolving: 82,
      communication: 78,
      behaviouralEvidence: 85
    },
    evaluations: [
      {
        questionId: 1,
        question: 'Explain how you optimize React component re-renders when managing global state with Context or Redux.',
        candidateResponse: 'I utilize React.memo alongside useMemo and useCallback hooks to maintain stable function references. Additionally, splitting context providers by read/write frequency prevents unnecessary child tree re-renders.',
        score: 88,
        feedback: 'Demonstrated strong technical understanding of memoization and context splitting.',
        strength: 'Strong technical understanding of React state architecture and reference stability',
        improvement: 'Could elaborate on compiler optimizations and automatic state memoization in React 19.'
      },
      {
        questionId: 2,
        question: 'Describe a situation where an API service experienced high latency under load and how you diagnosed it.',
        candidateResponse: 'We analyzed APM traces using MongoDB explain() queries and uncovered missing compound index coverage on candidate status queries. Adding targeted indices reduced DB response time from 1.2s to 45ms.',
        score: 72,
        feedback: 'Good problem-solving methodology shown, though implementation details could be expanded.',
        strength: 'Empirical root cause diagnosis using query execution statistics',
        improvement: 'Explain implementation details more clearly, specifically caching fallbacks and index creation migration scripts'
      }
    ]
  }
];

// ----------------------------------------------------
// INITIALIZATION METHOD
// ----------------------------------------------------
export const initLocalStorageData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(KEYS.JOBS)) {
    localStorage.setItem(KEYS.JOBS, JSON.stringify(DEFAULT_JOBS));
  }
  if (!localStorage.getItem(KEYS.APPLICATIONS)) {
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS));
  }
  if (!localStorage.getItem(KEYS.INTERVIEWS)) {
    localStorage.setItem(KEYS.INTERVIEWS, JSON.stringify(DEFAULT_INTERVIEWS));
  }
  if (!localStorage.getItem(KEYS.MOCK_INTERVIEWS)) {
    localStorage.setItem(KEYS.MOCK_INTERVIEWS, JSON.stringify(DEFAULT_MOCK_INTERVIEWS));
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
  }
  if (!localStorage.getItem(KEYS.QUESTION_BANKS)) {
    localStorage.setItem(KEYS.QUESTION_BANKS, JSON.stringify([]));
  }
};

// Auto initialize on import
initLocalStorageData();

// Helper to safely get parsed array/object from localStorage
const getItem = (key, fallback = []) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error(`Error reading key ${key} from localStorage:`, e);
    return fallback;
  }
};

// Helper to set item and dispatch event
const setItem = (key, data, entityName, action = 'updated') => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyDataUpdated(entityName, action, data);
  } catch (e) {
    console.error(`Error writing key ${key} to localStorage:`, e);
  }
};

// ----------------------------------------------------
// USERS SERVICE API
// ----------------------------------------------------
export const storageUsers = {
  getAll: () => getItem(KEYS.USERS, DEFAULT_USERS),
  getCurrentUser: () => getItem(KEYS.CURRENT_USER, null),
  setCurrentUser: (user) => {
    setItem(KEYS.CURRENT_USER, user, 'user', 'currentUserChanged');
  },
  saveUser: (user) => {
    const users = storageUsers.getAll();
    const idx = users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (idx >= 0) users[idx] = { ...users[idx], ...user };
    else users.push(user);
    setItem(KEYS.USERS, users, 'user', 'saved');
    return user;
  }
};

// ----------------------------------------------------
// JOBS SERVICE API
// ----------------------------------------------------
export const storageJobs = {
  getAll: () => getItem(KEYS.JOBS, DEFAULT_JOBS),
  getById: (id) => storageJobs.getAll().find((j) => j.id === id),
  saveJob: (job) => {
    const jobs = storageJobs.getAll();
    const idx = jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) jobs[idx] = { ...jobs[idx], ...job };
    else jobs.unshift(job);
    setItem(KEYS.JOBS, jobs, 'job', 'saved');
    return job;
  }
};

// ----------------------------------------------------
// APPLICATIONS SERVICE API
// ----------------------------------------------------
export const storageApplications = {
  getAll: () => getItem(KEYS.APPLICATIONS, DEFAULT_APPLICATIONS),
  getById: (id) => storageApplications.getAll().find((a) => a.id === id),
  getByCandidateId: (candidateId) => {
    const apps = storageApplications.getAll();
    if (!candidateId) return apps;
    return apps.filter((a) => a.candidateId === candidateId);
  },
  getByCandidateAndJob: (candidateId, jobId) => {
    const apps = storageApplications.getAll();
    return apps.find((a) => a.candidateId === candidateId && (a.jobId === jobId || a.jobId === String(jobId)));
  },
  saveApplication: (app) => {
    const apps = storageApplications.getAll();
    const idx = apps.findIndex((a) => a.id === app.id || (a.candidateId === app.candidateId && a.jobId === app.jobId));
    if (idx >= 0) apps[idx] = { ...apps[idx], ...app };
    else apps.unshift(app);
    setItem(KEYS.APPLICATIONS, apps, 'application', 'saved');
    return app;
  },
  updateStatus: (appId, status) => {
    const apps = storageApplications.getAll();
    let updatedApp = null;
    const updated = apps.map((app) => {
      if (app.id === appId) {
        const updatedTimeline = (app.timeline || []).map((item) => {
          if (item.step.toLowerCase().includes(status.toLowerCase())) {
            return { ...item, date: new Date().toISOString().split('T')[0], done: true };
          }
          return item;
        });
        updatedApp = { ...app, status, timeline: updatedTimeline };
        return updatedApp;
      }
      return app;
    });
    setItem(KEYS.APPLICATIONS, updated, 'application', 'statusUpdated');
    return updatedApp;
  }
};

// ----------------------------------------------------
// RESUMES SERVICE API
// ----------------------------------------------------
export const storageResumes = {
  getAll: () => getItem(KEYS.RESUMES, []),
  getByCandidateId: (candidateId) => {
    const list = storageResumes.getAll();
    return list.filter((r) => r.candidateId === candidateId);
  },
  getPrimaryByCandidateId: (candidateId) => {
    const candidateResumes = storageResumes.getByCandidateId(candidateId);
    return candidateResumes.find((r) => r.isPrimary) || candidateResumes[0] || null;
  },
  saveResume: (resumeItem) => {
    const resumes = storageResumes.getAll();
    // If this is set as primary, un-primary others for this candidate
    if (resumeItem.isPrimary) {
      resumes.forEach((r) => {
        if (r.candidateId === resumeItem.candidateId) r.isPrimary = false;
      });
    }
    const idx = resumes.findIndex((r) => r.id === resumeItem.id || r.resumeId === resumeItem.id);
    if (idx >= 0) resumes[idx] = { ...resumes[idx], ...resumeItem };
    else resumes.unshift(resumeItem);
    setItem(KEYS.RESUMES, resumes, 'resume', 'saved');
    return resumeItem;
  },
  setPrimary: (resumeId, candidateId) => {
    const resumes = storageResumes.getAll();
    resumes.forEach((r) => {
      if (r.candidateId === candidateId) {
        r.isPrimary = (r.id === resumeId || r.resumeId === resumeId);
      }
    });
    setItem(KEYS.RESUMES, resumes, 'resume', 'primaryUpdated');
    return resumes.filter((r) => r.candidateId === candidateId);
  },
  deleteResume: (resumeId) => {
    const resumes = storageResumes.getAll();
    const filtered = resumes.filter((r) => r.id !== resumeId && r.resumeId !== resumeId);
    setItem(KEYS.RESUMES, filtered, 'resume', 'deleted');
    return true;
  }
};

// ----------------------------------------------------
// INTERVIEWS SERVICE API (Recruiter HR & Final Rounds)
// ----------------------------------------------------
export const storageInterviews = {
  getAll: () => getItem(KEYS.INTERVIEWS, DEFAULT_INTERVIEWS),
  getById: (id) => storageInterviews.getAll().find((i) => i.id === id),
  getByCandidateId: (candidateId) => {
    const list = storageInterviews.getAll();
    return list.filter((i) => i.candidateId === candidateId || candidateId === 'cand_1' || candidateId === 'cand_demo_001');
  },
  saveInterview: (interview) => {
    const interviews = storageInterviews.getAll();
    const idx = interviews.findIndex((i) => i.id === interview.id);
    if (idx >= 0) interviews[idx] = { ...interviews[idx], ...interview };
    else interviews.unshift(interview);
    setItem(KEYS.INTERVIEWS, interviews, 'interview', 'saved');
    return interview;
  },
  updateInterview: (id, changes) => {
    const interviews = storageInterviews.getAll();
    let updated = null;
    const list = interviews.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...changes };
        return updated;
      }
      return item;
    });
    setItem(KEYS.INTERVIEWS, list, 'interview', 'updated');
    return updated;
  }
};

// ----------------------------------------------------
// MOCK INTERVIEWS SERVICE API (Candidate Practice Rounds)
// ----------------------------------------------------
export const storageMockInterviews = {
  getAll: () => getItem(KEYS.MOCK_INTERVIEWS, DEFAULT_MOCK_INTERVIEWS),
  getById: (id) => storageMockInterviews.getAll().find((m) => m.id === id || m.sessionId === id || m.attemptId === id),
  saveMockInterview: (mockItem) => {
    const mocks = storageMockInterviews.getAll();
    const targetId = mockItem.attemptId || mockItem.id || mockItem.sessionId;
    const idx = mocks.findIndex((m) => (m.attemptId && m.attemptId === targetId) || (m.id && m.id === targetId) || (m.sessionId && m.sessionId === targetId));
    if (idx >= 0) mocks[idx] = { ...mocks[idx], ...mockItem };
    else mocks.unshift(mockItem);
    setItem(KEYS.MOCK_INTERVIEWS, mocks, 'mockInterview', 'saved');
    return mockItem;
  },
  updateMockInterview: (id, changes) => {
    const mocks = storageMockInterviews.getAll();
    let updated = null;
    const list = mocks.map((item) => {
      if (item.id === id || item.sessionId === id || item.attemptId === id) {
        updated = { ...item, ...changes };
        return updated;
      }
      return item;
    });
    setItem(KEYS.MOCK_INTERVIEWS, list, 'mockInterview', 'updated');
    return updated;
  }
};

// Section 30 Safety Helpers
export const getMockInterviewAttempts = () => storageMockInterviews.getAll();
export const getMockInterviewAttemptById = (id) => storageMockInterviews.getById(id);
export const saveMockInterviewAttempt = (attempt) => storageMockInterviews.saveMockInterview(attempt);
export const updateMockInterviewAttempt = (id, changes) => storageMockInterviews.updateMockInterview(id, changes);
export const completeMockInterviewAttempt = (id, resultData = {}) => {
  return storageMockInterviews.updateMockInterview(id, {
    status: 'completed',
    state: 'Completed',
    finishedAt: new Date().toISOString(),
    result: resultData
  });
};

// ----------------------------------------------------
// QUESTION BANKS SERVICE API
// ----------------------------------------------------
export const storageQuestionBanks = {
  getAll: () => getItem(KEYS.QUESTION_BANKS, []),
  saveBank: (bank) => {
    const banks = storageQuestionBanks.getAll();
    banks.push(bank);
    setItem(KEYS.QUESTION_BANKS, banks, 'questionBank', 'saved');
    return bank;
  }
};

// ----------------------------------------------------
// REVIEWS & EVALUATIONS SERVICE API
// ----------------------------------------------------
export const storageReviews = {
  getAll: () => getItem(KEYS.REVIEWS, DEFAULT_REVIEWS),
  saveReview: (review) => {
    const reviews = storageReviews.getAll();
    const idx = reviews.findIndex((r) => r.id === review.id);
    if (idx >= 0) reviews[idx] = { ...reviews[idx], ...review };
    else reviews.unshift(review);
    setItem(KEYS.REVIEWS, reviews, 'review', 'saved');
    return review;
  }
};
