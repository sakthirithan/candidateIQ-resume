import React, { useState, useEffect, useCallback, useMemo } from 'react';
import recruiterService from '@/services/recruiter/recruiterService';
import { matchingService } from '@/services/mockApi/matchingService';
import { evaluateResumeATS } from '@/services/ats/atsAnalysisEngine';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip,
  CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Users, User, Search, ArrowUpDown, ChevronLeft, ChevronRight, UserCheck, XCircle,
  Sparkles, Archive, BarChart3, CheckCircle2, FileText, Brain, Briefcase, Layers,
  Award, Zap, RefreshCw, AlertTriangle, Activity, Clock, ShieldCheck, Eye, Download,
  Filter, X, Check, HelpCircle, Calendar, DollarSign, Mail, Phone, MapPin, MoreVertical,
  SlidersHorizontal, CheckSquare, Square, ChevronDown, ExternalLink, ArrowRight,
  TrendingUp, CheckSquare2, FileCheck, Layers3, Target, UserPlus, Trash2, Plus, AlertCircle, Video
} from 'lucide-react';

const CANONICAL_COMPETENCIES = [
  { id: 'technical_knowledge', name: 'Technical Knowledge', category: 'Core', color: '#4F46E5' },
  { id: 'answer_quality', name: 'Answer Quality & Relevance', category: 'Core', color: '#059669' },
  { id: 'concept_explanation', name: 'Concept Explanation', category: 'Technical', color: '#D97706' },
  { id: 'problem_solving', name: 'Problem Solving', category: 'Analytical', color: '#7C3AED' },
  { id: 'communication', name: 'Communication', category: 'Behavioral', color: '#2563EB' },
  { id: 'fluency_pacing', name: 'Fluency & Pacing', category: 'Behavioral', color: '#DB2777' },
  { id: 'answer_structure', name: 'Answer Structure', category: 'Communication', color: '#0284C7' },
  { id: 'conciseness', name: 'Conciseness', category: 'Communication', color: '#059669' }
];

const DEFAULT_ROUND_TEMPLATES = {
  hr_screening: {
    title: 'HR Screening & Behavioral Round',
    candidateInstructions: 'Please prepare to discuss your background, career trajectory, availability, and alignment with the role.',
    internalNotes: 'Assess cultural fit, communication clarity, salary expectation alignment, and notice period.',
    rubricCriteria: [
      { id: 'comm', name: 'Communication & Clarity', weight: 25, scale: '1-5', description: 'Articulates ideas clearly and professionally' },
      { id: 'motivation', name: 'Role Motivation & Expectations', weight: 20, scale: '1-5', description: 'Genuine interest in company and position' },
      { id: 'behavioral', name: 'Behavioral Accountability', weight: 25, scale: '1-5', description: 'Demonstrates ownership and structured STAR responses' },
      { id: 'collaboration', name: 'Collaboration & Judgment', weight: 20, scale: '1-5', description: 'Team orientation and professional conduct' },
      { id: 'logistics', name: 'Availability & Logistics', weight: 10, scale: '1-5', description: 'Notice period, remote flexibility, budget fit' }
    ],
    questions: [
      { id: 'q1', text: 'Walk us through your professional journey and key achievements in your recent role.', duration: 5, required: true },
      { id: 'q2', text: 'Describe a situation where you had a disagreement with a team member and how you resolved it.', duration: 5, required: true },
      { id: 'q3', text: 'What motivates you about this position and our engineering culture?', duration: 5, required: false }
    ]
  },
  aptitude: {
    title: 'Aptitude & Logical Reasoning Assessment',
    candidateInstructions: 'Ensure a quiet environment for logical reasoning, numerical analysis, and problem-solving questions.',
    internalNotes: 'Evaluate speed of analysis, structured thinking, and numerical accuracy under timed conditions.',
    rubricCriteria: [
      { id: 'logical', name: 'Logical Reasoning', weight: 30, scale: '1-5', description: 'Pattern identification and deduction' },
      { id: 'numerical', name: 'Numerical Reasoning', weight: 25, scale: '1-5', description: 'Quantitative accuracy and data interpretation' },
      { id: 'analytical', name: 'Analytical Accuracy', weight: 25, scale: '1-5', description: 'Precision in evaluating multi-variable problems' },
      { id: 'time_mgmt', name: 'Time Management', weight: 20, scale: '1-5', description: 'Pacing across complex problem sets' }
    ],
    questions: [
      { id: 'q1', text: 'Analyze the given data set and determine the optimal resource allocation strategy.', duration: 10, required: true },
      { id: 'q2', text: 'Solve the sequence logic puzzle under constraint limits.', duration: 10, required: true }
    ]
  },
  technical: {
    title: 'Technical Deep-Dive Interview',
    candidateInstructions: 'Be ready to discuss software development fundamentals, core technology stack, and architectural choices.',
    internalNotes: 'Focus on technical depth, core principles, problem breakdown, and edge case identification.',
    rubricCriteria: [
      { id: 'core_knowledge', name: 'Core Technical Knowledge', weight: 25, scale: '1-5', description: 'Mastery of target frameworks and language concepts' },
      { id: 'prob_solving', name: 'Problem-Solving Ability', weight: 25, scale: '1-5', description: 'Systematic approach to technical challenges' },
      { id: 'tech_explanation', name: 'Technical Explanation', weight: 15, scale: '1-5', description: 'Ability to explain complex concepts clearly' },
      { id: 'impl_quality', name: 'Implementation Quality', weight: 20, scale: '1-5', description: 'Clean code practices, modularity, and standards' },
      { id: 'testing_edge', name: 'Testing & Edge Cases', weight: 15, scale: '1-5', description: 'Awareness of error conditions and boundary cases' }
    ],
    questions: [
      { id: 'q1', text: 'Explain the event loop and asynchronous concurrency model in Node.js/JavaScript.', duration: 10, required: true },
      { id: 'q2', text: 'How do you approach optimizing database index strategies in MongoDB for high-read applications?', duration: 10, required: true },
      { id: 'q3', text: 'Walk us through your approach to state management and performance tuning in React applications.', duration: 10, required: true }
    ]
  },
  coding: {
    title: 'Live Coding & Algorithms Assessment',
    candidateInstructions: 'You will solve a practical live coding challenge. Screen sharing or embedded IDE will be used.',
    internalNotes: 'Evaluate algorithmic efficiency (Time/Space Complexity), code cleanliness, variable naming, and live debugging.',
    rubricCriteria: [
      { id: 'correctness', name: 'Correctness & Functionality', weight: 30, scale: '1-5', description: 'Passes core test cases and requirements' },
      { id: 'algo_reasoning', name: 'Algorithmic Reasoning', weight: 20, scale: '1-5', description: 'Optimal algorithm selection and logic' },
      { id: 'complexity', name: 'Complexity Analysis', weight: 15, scale: '1-5', description: 'Accurate Big-O time and space complexity analysis' },
      { id: 'code_quality', name: 'Code Quality & Cleanliness', weight: 15, scale: '1-5', description: 'Readable, structured, well-named code' },
      { id: 'edge_cases', name: 'Testing & Edge Cases', weight: 15, scale: '1-5', description: 'Handles null, empty, or overflow inputs gracefully' },
      { id: 'comm', name: 'Thought Process Communication', weight: 5, scale: '1-5', description: 'Explains code while writing' }
    ],
    questions: [
      { id: 'q1', text: 'Implement a function to find the longest substring without repeating characters and state its time/space complexity.', duration: 20, required: true },
      { id: 'q2', text: 'Write a LRU (Least Recently Used) Cache with O(1) get and put operations.', duration: 25, required: true }
    ]
  },
  system_design: {
    title: 'System Design & Architecture Interview',
    candidateInstructions: 'Prepare to design scalable distributed systems, APIs, database schemas, and trade-off considerations.',
    internalNotes: 'Assess high-level component layout, data store choice, caching strategy, load balancing, and failure modes.',
    rubricCriteria: [
      { id: 'req_clarification', name: 'Requirements Clarification', weight: 15, scale: '1-5', description: 'Asks functional & non-functional scoping questions' },
      { id: 'arch_design', name: 'Architecture & Component Design', weight: 25, scale: '1-5', description: 'High-level component partitioning and data flow' },
      { id: 'scalability', name: 'Scalability & Reliability', weight: 20, scale: '1-5', description: 'Handling load spikes, replication, and failover' },
      { id: 'data_modeling', name: 'Data Modeling & APIs', weight: 15, scale: '1-5', description: 'Schema design and REST/gRPC API contracts' },
      { id: 'tradeoffs', name: 'Trade-off Analysis', weight: 15, scale: '1-5', description: 'Evaluating SQL vs NoSQL, consistency vs availability' },
      { id: 'sec_obs', name: 'Security & Observability', weight: 10, scale: '1-5', description: 'Authentication, rate limiting, and telemetry logging' }
    ],
    questions: [
      { id: 'q1', text: 'Design a real-time notification system serving 10 million daily active users.', duration: 30, required: true },
      { id: 'q2', text: 'How would you scale a URL shortening service (e.g. TinyURL) for high availability and low latency?', duration: 25, required: true }
    ]
  },
  managerial: {
    title: 'Managerial & Leadership Round',
    candidateInstructions: 'Be prepared to discuss team leadership, project ownership, conflict resolution, and strategic decision making.',
    internalNotes: 'Evaluate leadership style, stakeholder management, mentoring mindset, and execution track record.',
    rubricCriteria: [
      { id: 'leadership', name: 'Leadership & Ownership', weight: 25, scale: '1-5', description: 'Takes initiative and drives initiatives to completion' },
      { id: 'decisions', name: 'Decision-Making', weight: 20, scale: '1-5', description: 'Data-informed choices under uncertainty' },
      { id: 'conflict', name: 'Conflict Resolution', weight: 20, scale: '1-5', description: 'Constructive management of technical/personal friction' },
      { id: 'planning', name: 'Planning & Execution', weight: 20, scale: '1-5', description: 'Roadmapping, sprint velocity, and deadline management' },
      { id: 'mentoring', name: 'Mentoring & Collaboration', weight: 15, scale: '1-5', description: 'Up-leveling junior engineers and cross-functional teamwork' }
    ],
    questions: [
      { id: 'q1', text: 'Describe a project that missed its deadline. How did you manage stakeholder expectations and adjust delivery?', duration: 15, required: true },
      { id: 'q2', text: 'How do you mentor junior developers and foster technical growth within your team?', duration: 15, required: true }
    ]
  },
  final: {
    title: 'Executive / Final Decision Interview',
    candidateInstructions: 'Final round with engineering management or hiring leads to align on vision, culture, and expectations.',
    internalNotes: 'Comprehensive review across technical competency, long-term fit, career alignment, and compensation expectations.',
    rubricCriteria: [
      { id: 'role_align', name: 'Role & Mission Alignment', weight: 25, scale: '1-5', description: 'Long-term commitment and strategic alignment' },
      { id: 'tech_depth', name: 'Technical / Functional Depth', weight: 25, scale: '1-5', description: 'Sustained capability across previous round domains' },
      { id: 'evidence', name: 'Cross-Round Evidence Verification', weight: 20, scale: '1-5', description: 'Consistent performance across evaluation history' },
      { id: 'comm_collab', name: 'Communication & Culture Fit', weight: 15, scale: '1-5', description: 'Interpersonal maturity and team alignment' },
      { id: 'expectations', name: 'Expectations & Mutual Alignment', weight: 15, scale: '1-5', description: 'Clear agreement on responsibilities and offer terms' }
    ],
    questions: [
      { id: 'q1', text: 'What are your key goals for your first 90 days in this position?', duration: 15, required: true },
      { id: 'q2', text: 'What technical or architectural direction are you most excited to contribute to at CandidateIQ?', duration: 15, required: true }
    ]
  }
};

function RecruiterCandidateManagement({ onNavigate, autoOpenSchedule = false, initialTab = 'All' }) {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Status Tab, & Advanced Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'New' | 'In Review' | 'Shortlisted' | 'Interview' | 'Offer' | 'Closed'
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [matchScoreFilter, setMatchScoreFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Table Selection & Pagination
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' | 'matchScore' | 'name'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Drawer State (Opened by clicking row or View action)
  const [drawerAppId, setDrawerAppId] = useState(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState('overview'); // 'overview' | 'resume' | 'interview' | 'history'
  const [selectedWaveCompetency, setSelectedWaveCompetency] = useState('all');

  // Action Overflow Dropdown State (per row)
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Modals State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: null, // 'shortlist' | 'reject' | 'bulk_shortlist' | 'bulk_reject'
    targetApp: null,
    submitting: false
  });

  const [showScheduleHRModal, setShowScheduleHRModal] = useState(false);
  const [scheduleApp, setScheduleApp] = useState(null);
  const [hrFormSection, setHrFormSection] = useState('A'); // 'A' | 'B' | 'C'
  const [hrFormSubmitting, setHrFormSubmitting] = useState(false);
  const [hrForm, setHrForm] = useState({
    roundType: 'technical',
    title: 'Technical Deep-Dive Interview',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:00',
    timeZone: 'IST',
    durationMinutes: 45,
    candidateInstructions: DEFAULT_ROUND_TEMPLATES.technical.candidateInstructions,
    internalNotes: DEFAULT_ROUND_TEMPLATES.technical.internalNotes,
    assignmentMode: 'single', // 'single' | 'panel'
    primaryInterviewer: { name: 'Primary HR Recruiter', role: 'Lead Interviewer', email: 'recruiter@company.org' },
    panelMembers: [
      { id: 'p1', name: 'Senior Tech Lead', role: 'Technical Evaluator', email: 'tech-lead@company.org' }
    ],
    rubricCriteria: DEFAULT_ROUND_TEMPLATES.technical.rubricCriteria,
    questions: DEFAULT_ROUND_TEMPLATES.technical.questions,
    newCriterionName: '',
    newCriterionWeight: 10,
    newQuestionText: ''
  });

  const [showResumePreviewModal, setShowResumePreviewModal] = useState(false);
  const [previewResumeData, setPreviewResumeData] = useState(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Applications & Jobs from MongoDB Backend
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        recruiterService.getRecruiterApplications().catch(() => ({ applications: [] })),
        recruiterService.getRecruiterJobs().catch(() => ({ jobs: [] }))
      ]);

      const fetchedApps = appsRes?.applications || [];
      setApplications(fetchedApps);
      setJobs(jobsRes?.jobs || []);
    } catch (err) {
      console.error('[Applications & Candidates] Error loading data:', err);
      setError('Failed to fetch candidate applications from MongoDB.');
    } finally {
      setLoading(false);
    }
  }, []);

  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (autoOpenSchedule && !loading && !showScheduleHRModal) {
      const targetApp = applications.length > 0 ? applications[0] : {
        _id: 'app_new_demo',
        candidate: { name: 'Alex Johnson', email: 'alex.j@example.com' },
        job: { title: 'Senior Full Stack Engineer', department: 'Engineering' }
      };
      handleOpenScheduleHRModal(targetApp);
    }
  }, [autoOpenSchedule, loading, applications]);

  // Derived Active Drawer Application Record
  const activeDrawerApp = useMemo(() => {
    if (!drawerAppId) return null;
    return applications.find(a => a._id === drawerAppId || a.id === drawerAppId) || null;
  }, [applications, drawerAppId]);

  // Compute Deterministic ATS Intelligence Analysis for Active Drawer Candidate Resume
  const drawerAtsAnalysis = useMemo(() => {
    if (!activeDrawerApp) return null;

    const rawText = activeDrawerApp.resumeSnapshot?.parsedText ||
      `Experienced Full Stack Engineer with proficiency in React, Node.js, Express, MongoDB, REST API architecture, system design, microservices, unit testing, and UI/UX design. Demonstrated track record of optimizing page performance and delivering scalable software architectures.`;

    const jobTitle = activeDrawerApp.job?.title || activeDrawerApp.jobTitle || 'Full Stack Engineer';
    const reqSkills = activeDrawerApp.job?.requiredSkills || ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs', 'System Design'];

    const targetContext = {
      title: jobTitle,
      requiredSkills: reqSkills,
      company: activeDrawerApp.job?.company || 'CandidateIQ Partner'
    };

    return evaluateResumeATS(rawText, targetContext);
  }, [activeDrawerApp]);

  // Mock Interview Performance Attempt History Graph Data for Active Drawer Candidate
  const mockAttemptHistoryData = useMemo(() => {
    if (!activeDrawerApp) return [];

    const baseScore = activeDrawerApp.mockInterviewEvidence?.overallScore || activeDrawerApp.overallScore || 80;
    const baseTech = activeDrawerApp.mockInterviewEvidence?.technicalScore || 82;
    const baseComm = activeDrawerApp.mockInterviewEvidence?.communicationScore || 85;

    return [
      {
        attemptLabel: 'Attempt 1',
        attemptNumber: 1,
        completedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        overallScore: Math.max(65, baseScore - 12),
        technical_knowledge: Math.max(68, baseTech - 10),
        answer_quality: Math.max(64, baseScore - 14),
        concept_explanation: Math.max(66, baseTech - 12),
        problem_solving: Math.max(62, baseScore - 15),
        communication: Math.max(72, baseComm - 8),
        fluency_pacing: Math.max(70, baseComm - 10),
        answer_structure: Math.max(65, baseScore - 12),
        conciseness: Math.max(68, baseScore - 10)
      },
      {
        attemptLabel: 'Attempt 2',
        attemptNumber: 2,
        completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        overallScore: Math.max(72, baseScore - 5),
        technical_knowledge: Math.max(75, baseTech - 4),
        answer_quality: Math.max(71, baseScore - 6),
        concept_explanation: Math.max(73, baseTech - 5),
        problem_solving: Math.max(70, baseScore - 7),
        communication: Math.max(78, baseComm - 4),
        fluency_pacing: Math.max(76, baseComm - 5),
        answer_structure: Math.max(72, baseScore - 5),
        conciseness: Math.max(74, baseScore - 4)
      },
      {
        attemptLabel: 'Attempt 3 (Latest)',
        attemptNumber: 3,
        completedAt: activeDrawerApp.mockInterviewEvidence?.attemptDate || new Date().toISOString(),
        overallScore: baseScore,
        technical_knowledge: baseTech,
        answer_quality: baseScore + 1,
        concept_explanation: baseTech + 2,
        problem_solving: baseScore - 2,
        communication: baseComm,
        fluency_pacing: baseComm + 2,
        answer_structure: baseScore,
        conciseness: baseScore + 1
      }
    ];
  }, [activeDrawerApp]);

  // Mock Competency Radar Graph Data
  const mockRadarCompetencyData = useMemo(() => {
    if (!mockAttemptHistoryData.length) return [];
    const latestAttempt = mockAttemptHistoryData[mockAttemptHistoryData.length - 1];

    return CANONICAL_COMPETENCIES.map(c => ({
      competency: c.name,
      score: latestAttempt[c.id] || 80,
      fullMark: 100
    }));
  }, [mockAttemptHistoryData]);

  // Scope applications for selected Job Filter (for KPI counts & table)
  const jobScopedApps = useMemo(() => {
    if (selectedJobFilter === 'All') return applications;
    return applications.filter(a => (a.job?.title || a.job?.name || '') === selectedJobFilter);
  }, [applications, selectedJobFilter]);

  // Dynamic KPI Metrics Summary
  const kpiStats = useMemo(() => {
    const total = jobScopedApps.length;
    const needsReview = jobScopedApps.filter(a => {
      const s = (a.status || 'applied').toLowerCase();
      return s === 'applied' || s === 'under_review' || s === 'new';
    }).length;
    const shortlisted = jobScopedApps.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length;
    const interviewsScheduled = jobScopedApps.filter(a => {
      const s = (a.status || '').toLowerCase();
      return s === 'interview' || s === 'interview_scheduled' || s === 'scheduled';
    }).length;

    return { total, needsReview, shortlisted, interviewsScheduled };
  }, [jobScopedApps]);

  // Filter Applications based on search query, primary tab, & advanced filters
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const candName = app.candidate?.name || app.candidateSnapshot?.name || app.candidateProfile?.personalInfo?.name || '';
      const candEmail = app.candidate?.email || app.candidateSnapshot?.email || '';
      const jobTitle = app.job?.title || app.jobTitle || '';
      const skills = (app.professionalSnapshot?.skills || []).join(' ') + ' ' + (app.candidateProfile?.skills?.technical || []).join(' ');
      const q = searchQuery.toLowerCase().trim();

      // Search match
      if (q && !candName.toLowerCase().includes(q) && !candEmail.toLowerCase().includes(q) && !jobTitle.toLowerCase().includes(q) && !skills.toLowerCase().includes(q)) {
        return false;
      }

      // Requisition filter
      if (selectedJobFilter !== 'All' && jobTitle !== selectedJobFilter) return false;

      // Primary Status Tab Filter
      const status = (app.status || 'applied').toLowerCase();
      if (activeTab === 'New' && status !== 'applied' && status !== 'new') return false;
      if (activeTab === 'In Review' && status !== 'under_review') return false;
      if (activeTab === 'Shortlisted' && status !== 'shortlisted') return false;
      if (activeTab === 'Interview' && status !== 'interview' && status !== 'interview_scheduled') return false;
      if (activeTab === 'Offer' && status !== 'offer' && status !== 'offered') return false;
      if (activeTab === 'Closed' && status !== 'rejected' && status !== 'withdrawn') return false;

      // Match Score Filter
      const score = app.overallScore || app.matchAnalysis?.overallMatch || app.mockInterviewEvidence?.overallScore || 80;
      if (matchScoreFilter === '90%+' && score < 90) return false;
      if (matchScoreFilter === '80%+' && score < 80) return false;
      if (matchScoreFilter === '70%+' && score < 70) return false;

      // Experience Filter
      const expStr = app.professionalSnapshot?.experience || app.candidateProfile?.experience?.[0]?.years || '0';
      const numExp = parseFloat(expStr) || 0;
      if (experienceFilter === 'Fresher' && numExp > 1) return false;
      if (experienceFilter === '1-3 Years' && (numExp < 1 || numExp > 3)) return false;
      if (experienceFilter === '3-5 Years' && (numExp < 3 || numExp > 5)) return false;
      if (experienceFilter === '5+ Years' && numExp < 5) return false;

      // Date Filter
      if (dateFilter !== 'All' && app.createdAt) {
        const appDate = new Date(app.createdAt);
        const now = new Date();
        const diffDays = (now - appDate) / (1000 * 3600 * 24);
        if (dateFilter === 'Today' && diffDays > 1) return false;
        if (dateFilter === 'Last 7 Days' && diffDays > 7) return false;
        if (dateFilter === 'Last 30 Days' && diffDays > 30) return false;
      }

      return true;
    });
  }, [applications, searchQuery, activeTab, selectedJobFilter, matchScoreFilter, experienceFilter, dateFilter]);

  // Sort Applications
  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      if (sortBy === 'matchScore') {
        const scoreA = a.overallScore || a.matchAnalysis?.overallMatch || 80;
        const scoreB = b.overallScore || b.matchAnalysis?.overallMatch || 80;
        return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      } else if (sortBy === 'name') {
        const nameA = a.candidate?.name || a.candidateSnapshot?.name || '';
        const nameB = b.candidate?.name || b.candidateSnapshot?.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [filteredApplications, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedApplications.length / pageSize) || 1;
  const paginatedApps = useMemo(() => {
    return sortedApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [sortedApplications, currentPage, pageSize]);

  // Multi-Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = sortedApplications.map(a => a._id || a.id);
      setSelectedAppIds(allIds);
    } else {
      setSelectedAppIds([]);
    }
  };

  const handleToggleSelectRow = (appId) => {
    setSelectedAppIds(prev => {
      if (prev.includes(appId)) {
        return prev.filter(id => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  };

  // CSV Export Action
  const handleExportCSV = () => {
    try {
      const headers = ['Application ID', 'Candidate Name', 'Email', 'Job Title', 'Status', 'Match Score', 'Applied Date'];
      const rows = filteredApplications.map(a => [
        a._id || a.id,
        `"${a.candidate?.name || a.candidateSnapshot?.name || 'Candidate'}"`,
        `"${a.candidate?.email || a.candidateSnapshot?.email || 'N/A'}"`,
        `"${a.job?.title || a.jobTitle || 'Requisition'}"`,
        a.status || 'applied',
        `${a.overallScore || a.matchAnalysis?.overallMatch || 80}%`,
        a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `CandidateIQ_Applications_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${filteredApplications.length} application records to CSV.`);
    } catch (e) {
      showToast('Failed to export applications CSV.', 'error');
    }
  };

  // Shortlist Action Trigger
  const handleShortlistClick = (app) => {
    const candName = app.candidate?.name || app.candidateSnapshot?.name || 'Candidate';
    setConfirmModal({
      isOpen: true,
      title: 'Shortlist Candidate',
      message: `Shortlist "${candName}" for job "${app.job?.title || 'Requisition'}"? The application status will be updated to SHORTLISTED.`,
      actionType: 'shortlist',
      targetApp: app,
      submitting: false
    });
  };

  // Reject Action Trigger
  const handleRejectClick = (app) => {
    const candName = app.candidate?.name || app.candidateSnapshot?.name || 'Candidate';
    setConfirmModal({
      isOpen: true,
      title: 'Reject Application',
      message: `Reject application for "${candName}"? The candidate will be notified according to HR policy.`,
      actionType: 'reject',
      targetApp: app,
      submitting: false
    });
  };

  // Bulk Action Trigger
  const handleBulkAction = (actionType) => {
    if (selectedAppIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: actionType === 'bulk_shortlist' ? 'Bulk Shortlist Applications' : 'Bulk Reject Applications',
      message: `Are you sure you want to ${actionType === 'bulk_shortlist' ? 'shortlist' : 'reject'} ${selectedAppIds.length} selected applications?`,
      actionType,
      targetApp: null,
      submitting: false
    });
  };

  // Execute Confirmed Mutation
  const handleConfirmAction = async () => {
    setConfirmModal(prev => ({ ...prev, submitting: true }));

    try {
      if (confirmModal.actionType === 'shortlist' && confirmModal.targetApp) {
        const res = await recruiterService.updateApplicationStatus(confirmModal.targetApp._id, 'shortlisted');
        if (res.success || res) {
          showToast(`Candidate "${confirmModal.targetApp.candidate?.name || 'Candidate'}" Shortlisted!`);
          loadData();
        }
      } else if (confirmModal.actionType === 'reject' && confirmModal.targetApp) {
        const res = await recruiterService.updateApplicationStatus(confirmModal.targetApp._id, 'rejected');
        if (res.success || res) {
          showToast(`Application marked as Rejected.`, 'info');
          loadData();
        }
      } else if (confirmModal.actionType === 'bulk_shortlist') {
        await Promise.all(selectedAppIds.map(id => recruiterService.updateApplicationStatus(id, 'shortlisted').catch(() => null)));
        showToast(`Successfully shortlisted ${selectedAppIds.length} candidates!`);
        setSelectedAppIds([]);
        loadData();
      } else if (confirmModal.actionType === 'bulk_reject') {
        await Promise.all(selectedAppIds.map(id => recruiterService.updateApplicationStatus(id, 'rejected').catch(() => null)));
        showToast(`Marked ${selectedAppIds.length} applications as Rejected.`, 'info');
        setSelectedAppIds([]);
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application status.', 'error');
    } finally {
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        actionType: null,
        targetApp: null,
        submitting: false
      });
    }
  };

  // Schedule Interview Modal Trigger
  const handleOpenScheduleHRModal = (app) => {
    setScheduleApp(app);
    setHrFormSection('A');
    const defaultRound = DEFAULT_ROUND_TEMPLATES.technical;
    setHrForm({
      roundType: 'technical',
      title: defaultRound.title,
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '10:00',
      timeZone: 'IST',
      durationMinutes: 45,
      candidateInstructions: defaultRound.candidateInstructions,
      internalNotes: defaultRound.internalNotes,
      assignmentMode: 'single',
      primaryInterviewer: { name: 'Primary HR Recruiter', role: 'Lead Interviewer', email: 'recruiter@company.org' },
      panelMembers: [
        { id: 'p1', name: 'Senior Tech Lead', role: 'Technical Evaluator', email: 'tech-lead@company.org' }
      ],
      rubricCriteria: JSON.parse(JSON.stringify(defaultRound.rubricCriteria)),
      questions: JSON.parse(JSON.stringify(defaultRound.questions)),
      newCriterionName: '',
      newCriterionWeight: 10,
      newQuestionText: ''
    });
    setShowScheduleHRModal(true);
  };

  // Validate & Advance from Section A -> Section B
  const handleNextFromSectionA = () => {
    if (!hrForm.date) {
      showToast('Please select a valid interview date.', 'error');
      return;
    }
    if (!hrForm.time) {
      showToast('Please select a valid start time.', 'error');
      return;
    }
    if (!hrForm.title || !hrForm.title.trim()) {
      showToast('Please enter an interview title.', 'error');
      return;
    }
    setHrFormSection('B');
  };

  // Validate & Advance from Section B -> Section C
  const handleNextFromSectionB = () => {
    if (!hrForm.primaryInterviewer.name || !hrForm.primaryInterviewer.name.trim()) {
      showToast('Please specify the primary lead interviewer name.', 'error');
      return;
    }
    setHrFormSection('C');
  };

  // Safe Close with Unsaved Discard Confirmation
  const handleAttemptCloseScheduleModal = () => {
    if (hrFormSection !== 'A' || hrForm.internalNotes || hrForm.panelMembers.length > 1) {
      setShowDiscardConfirmModal(true);
    } else {
      setShowScheduleHRModal(false);
    }
  };

  const handleConfirmDiscardForm = () => {
    setShowDiscardConfirmModal(false);
    setShowScheduleHRModal(false);
  };

  // Switch Round Type in Section A
  const handleRoundTypeChange = (newRoundType) => {
    const template = DEFAULT_ROUND_TEMPLATES[newRoundType] || DEFAULT_ROUND_TEMPLATES.technical;
    setHrForm(prev => ({
      ...prev,
      roundType: newRoundType,
      title: template.title,
      candidateInstructions: template.candidateInstructions,
      internalNotes: template.internalNotes,
      rubricCriteria: JSON.parse(JSON.stringify(template.rubricCriteria)),
      questions: JSON.parse(JSON.stringify(template.questions))
    }));
  };

  // Add Custom Panel Member
  const handleAddPanelMember = () => {
    setHrForm(prev => ({
      ...prev,
      panelMembers: [
        ...prev.panelMembers,
        { id: `panel_${Date.now()}`, name: 'New Panelist', role: 'Technical Evaluator', email: 'panelist@company.org' }
      ]
    }));
  };

  // Remove Panel Member
  const handleRemovePanelMember = (id) => {
    setHrForm(prev => ({
      ...prev,
      panelMembers: prev.panelMembers.filter(m => m.id !== id)
    }));
  };

  // Add Custom Rubric Criterion
  const handleAddRubricCriterion = () => {
    if (!hrForm.newCriterionName.trim()) return;
    setHrForm(prev => ({
      ...prev,
      rubricCriteria: [
        ...prev.rubricCriteria,
        {
          id: `crit_${Date.now()}`,
          name: prev.newCriterionName.trim(),
          weight: Number(prev.newCriterionWeight) || 10,
          scale: '1-5',
          description: 'Evaluated according to role standard'
        }
      ],
      newCriterionName: '',
      newCriterionWeight: 10
    }));
  };

  // Remove Rubric Criterion
  const handleRemoveRubricCriterion = (critId) => {
    setHrForm(prev => ({
      ...prev,
      rubricCriteria: prev.rubricCriteria.filter(c => c.id !== critId)
    }));
  };

  // Add Custom Question
  const handleAddQuestion = () => {
    if (!hrForm.newQuestionText.trim()) return;
    setHrForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q_${Date.now()}`,
          text: prev.newQuestionText.trim(),
          duration: 10,
          required: true
        }
      ],
      newQuestionText: ''
    }));
  };

  // Remove Question
  const handleRemoveQuestion = (qId) => {
    setHrForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
  };

  // Total Rubric Weight Calculation
  const totalRubricWeight = useMemo(() => {
    return hrForm.rubricCriteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  }, [hrForm.rubricCriteria]);

  // Confirm Schedule HR / Job Interview
  const handleScheduleHRSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleApp) return;

    if (Math.abs(totalRubricWeight - 100) > 0.01) {
      showToast(`Evaluation rubric weights must total exactly 100%. Provided total: ${totalRubricWeight}%.`, 'error');
      return;
    }

    try {
      setHrFormSubmitting(true);

      const scheduledDateISO = `${hrForm.date}T${hrForm.time}:00.000Z`;
      const interviewersPayload = [
        {
          name: hrForm.primaryInterviewer.name || 'Primary HR Recruiter',
          role: hrForm.primaryInterviewer.role || 'Lead Interviewer',
          email: hrForm.primaryInterviewer.email || 'recruiter@company.org',
          isPrimary: true
        },
        ...(hrForm.assignmentMode === 'panel' ? hrForm.panelMembers.map(m => ({
          name: m.name,
          role: m.role || 'Panel Member',
          email: m.email || 'panelist@company.org',
          isPrimary: false
        })) : [])
      ];

      const payload = {
        candidateId: scheduleApp.candidate?._id || scheduleApp.candidate || scheduleApp.candidateSnapshot?.id,
        jobId: scheduleApp.job?._id || scheduleApp.job,
        applicationId: scheduleApp._id || scheduleApp.id,
        roundType: hrForm.roundType,
        title: hrForm.title || 'Official Interview',
        scheduledDate: scheduledDateISO,
        scheduledTime: hrForm.time,
        timeZone: hrForm.timeZone,
        durationMinutes: Number(hrForm.durationMinutes) || 45,
        candidateInstructions: hrForm.candidateInstructions,
        internalNotes: hrForm.internalNotes,
        interviewers: interviewersPayload,
        rubricSnapshot: {
          version: 1,
          criteria: hrForm.rubricCriteria
        },
        selectedQuestions: hrForm.questions
      };

      const res = await recruiterService.scheduleInterview(payload);
      if (res.success || res) {
        await recruiterService.updateApplicationStatus(scheduleApp._id || scheduleApp.id, 'interview_scheduled').catch(() => null);
        const invStatus = res.interview?.invitationDeliveryStatus === 'sent' 
          ? 'Invitation email delivered via Resend.' 
          : 'Interview scheduled (Invitation email pending).';
        showToast(`Official ${hrForm.title} scheduled! ${invStatus}`);
        setShowScheduleHRModal(false);
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule interview.', 'error');
    } finally {
      setHrFormSubmitting(false);
    }
  };

  // Compare Selected Action Trigger
  const handleCompareSelected = () => {
    if (selectedAppIds.length < 2) {
      showToast('Please select at least 2 candidate applications to compare.', 'info');
      return;
    }
    if (onNavigate) {
      onNavigate('comparison', selectedAppIds);
    }
  };

  // Count Active Advanced Filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedJobFilter !== 'All') count++;
    if (matchScoreFilter !== 'All') count++;
    if (experienceFilter !== 'All') count++;
    if (dateFilter !== 'All') count++;
    return count;
  }, [selectedJobFilter, matchScoreFilter, experienceFilter, dateFilter]);

  const clearAllFilters = () => {
    setSelectedJobFilter('All');
    setMatchScoreFilter('All');
    setExperienceFilter('All');
    setDateFilter('All');
    setSearchQuery('');
    setActiveTab('All');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto font-sans">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-md animate-fade-in ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : toastMsg.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold font-outfit">
            {toastMsg.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            MongoDB Verified
          </span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Applications & Candidates
                </h1>
                {selectedJobFilter !== 'All' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Filter: {selectedJobFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Review applicants, evaluate role fit, and manage every stage of your recruitment pipeline.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          <button
            type="button"
            disabled={selectedAppIds.length < 2}
            onClick={handleCompareSelected}
            className="btn-saas px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <BarChart3 className="w-4 h-4" /> Compare Selected {selectedAppIds.length >= 2 ? `(${selectedAppIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY STRIP — EXACTLY FOUR METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
        <div
          onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
          className={`saas-card p-5 border rounded-2xl cursor-pointer transition-all space-y-2 ${
            activeTab === 'All'
              ? 'border-indigo-600 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 ring-2 ring-indigo-500/10 shadow-sm'
              : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-outfit text-slate-400">Total Applications</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-950">{kpiStats.total}</span>
            <span className="text-[10px] font-bold text-slate-400">All Requisitions</span>
          </div>
        </div>

        {/* Card 2: Needs Review */}
        <div
          onClick={() => { setActiveTab('New'); setCurrentPage(1); }}
          className={`saas-card p-5 border rounded-2xl cursor-pointer transition-all space-y-2 ${
            activeTab === 'New' || activeTab === 'In Review'
              ? 'border-indigo-600 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 ring-2 ring-indigo-500/10 shadow-sm'
              : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-outfit text-indigo-600">Needs Review</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold font-outfit text-indigo-600">{kpiStats.needsReview}</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Action Required</span>
          </div>
        </div>

        {/* Card 3: Shortlisted */}
        <div
          onClick={() => { setActiveTab('Shortlisted'); setCurrentPage(1); }}
          className={`saas-card p-5 border rounded-2xl cursor-pointer transition-all space-y-2 ${
            activeTab === 'Shortlisted'
              ? 'border-emerald-600 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 ring-2 ring-emerald-500/10 shadow-sm'
              : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-outfit text-emerald-700">Shortlisted</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold font-outfit text-emerald-700">{kpiStats.shortlisted}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Pre-Screened</span>
          </div>
        </div>

        {/* Card 4: Interviews Scheduled */}
        <div
          onClick={() => { setActiveTab('Interview'); setCurrentPage(1); }}
          className={`saas-card p-5 border rounded-2xl cursor-pointer transition-all space-y-2 ${
            activeTab === 'Interview'
              ? 'border-purple-600 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 ring-2 ring-purple-500/10 shadow-sm'
              : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-outfit text-purple-700">Interviews Scheduled</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold font-outfit text-purple-700">{kpiStats.interviewsScheduled}</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Active Rounds</span>
          </div>
        </div>
      </div>

      {/* 3. APPLICATION SEARCH, PRIMARY STATUS TABS & ADVANCED FILTERS */}
      <div className="saas-card p-5 border border-slate-200/90 bg-white space-y-4 shadow-xs rounded-2xl">
        {/* Search Field & Sort Row */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search candidate, email, skills, or job title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-saas pl-10 pr-4 py-2.5 w-full text-xs bg-slate-50/60 focus:bg-white border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="createdAt">Date Applied</option>
                <option value="matchScore">Match Score</option>
                <option value="name">Candidate Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Primary Status Tabs Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          {[
            { id: 'All', label: 'All Applications' },
            { id: 'New', label: 'New' },
            { id: 'In Review', label: 'In Review' },
            { id: 'Shortlisted', label: 'Shortlisted' },
            { id: 'Interview', label: 'Interview' },
            { id: 'Offer', label: 'Offer' },
            { id: 'Closed', label: 'Closed' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Collapsible Filter Panel */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 animate-fade-in text-xs font-medium">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] font-outfit">
                Advanced Filter Panel
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Requisition</label>
                <select
                  value={selectedJobFilter}
                  onChange={(e) => { setSelectedJobFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
                >
                  <option value="All">All Requisitions</option>
                  {jobs.map(j => (
                    <option key={j._id || j.id} value={j.title}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Job Match Score</label>
                <select
                  value={matchScoreFilter}
                  onChange={(e) => { setMatchScoreFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
                >
                  <option value="All">All Match Scores</option>
                  <option value="90%+">90%+ High Match</option>
                  <option value="80%+">80%+ Match</option>
                  <option value="70%+">70%+ Match</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Experience Level</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => { setExperienceFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
                >
                  <option value="All">All Experience</option>
                  <option value="Fresher">Fresher (&lt; 1 Year)</option>
                  <option value="1-3 Years">1 - 3 Years</option>
                  <option value="3-5 Years">3 - 5 Years</option>
                  <option value="5+ Years">5+ Years Senior</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Applied Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BULK SELECTION ACTIONS BAR */}
      {selectedAppIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl animate-scale-up border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center font-mono">
              {selectedAppIds.length}
            </span>
            <span className="text-xs font-bold font-outfit">Applications Selected for Bulk Action</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompareSelected}
              disabled={selectedAppIds.length < 2}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Compare Selected
            </button>
            <button
              onClick={() => handleBulkAction('bulk_shortlist')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> Bulk Shortlist
            </button>
            <button
              onClick={() => handleBulkAction('bulk_reject')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" /> Bulk Reject
            </button>
            <button
              onClick={() => setSelectedAppIds([])}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. COMPACT APPLICATION RESULTS TABLE */}
      <div className="saas-card border border-slate-200/90 bg-white rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading candidate applications from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 text-rose-800 text-xs font-medium space-y-2">
            <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
            <p>{error}</p>
          </div>
        ) : sortedApplications.length === 0 ? (
          <div className="py-16 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit">No Applications Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              No candidate applications match your search query or active filter criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold font-outfit h-11">
                  <th className="p-3 pl-5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedAppIds.length === sortedApplications.length && sortedApplications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Applied For</th>
                  <th className="p-3 text-center">Fit Score</th>
                  <th className="p-3">Application Stage</th>
                  <th className="p-3">Applied On</th>
                  <th className="p-3">Last Activity</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedApps.map(app => {
                  const appId = app._id || app.id;
                  const isChecked = selectedAppIds.includes(appId);
                  const candName = app.candidate?.name || app.candidateSnapshot?.name || 'Candidate';
                  const candEmail = app.candidate?.email || app.candidateSnapshot?.email || 'N/A';
                  const jobTitle = app.job?.title || app.jobTitle || 'Requisition';
                  const dept = app.job?.department || app.job?.location || 'Talent Partner';
                  const score = app.overallScore || app.matchAnalysis?.overallMatch || app.mockInterviewEvidence?.overallScore || null;
                  const status = (app.status || 'applied').toLowerCase();
                  const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently';

                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  );

                  if (status === 'applied' || status === 'new') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                        Applied
                      </span>
                    );
                  } else if (status === 'under_review') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                        Under Review
                      </span>
                    );
                  } else if (status === 'shortlisted') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        Shortlisted
                      </span>
                    );
                  } else if (status === 'interview' || status === 'interview_scheduled') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 capitalize">
                        Interview Scheduled
                      </span>
                    );
                  } else if (status === 'offer' || status === 'offered') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                        Offer Extended
                      </span>
                    );
                  } else if (status === 'rejected') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 capitalize">
                        Rejected
                      </span>
                    );
                  }

                  const initials = candName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CN';

                  return (
                    <tr
                      key={appId}
                      className={`hover:bg-indigo-50/20 transition-all h-[68px] ${
                        drawerAppId === appId ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="p-3 pl-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(appId)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td
                        onClick={() => { setDrawerAppId(appId); setDrawerActiveTab('overview'); }}
                        className="p-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center font-outfit shadow-2xs shrink-0">
                            {initials}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-slate-950 block hover:text-indigo-600 font-outfit truncate">
                              {candName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono truncate block">
                              {candEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td
                        onClick={() => { setDrawerAppId(appId); setDrawerActiveTab('overview'); }}
                        className="p-3 cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block truncate">{jobTitle}</span>
                          <span className="text-[11px] text-slate-500 font-medium block">{dept}</span>
                        </div>
                      </td>

                      <td
                        onClick={() => { setDrawerAppId(appId); setDrawerActiveTab('overview'); }}
                        className="p-3 text-center cursor-pointer"
                      >
                        {score !== null ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-xs">
                            {score}/100
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">Not evaluated</span>
                        )}
                      </td>

                      <td
                        onClick={() => { setDrawerAppId(appId); setDrawerActiveTab('overview'); }}
                        className="p-3 cursor-pointer"
                      >
                        {statusBadge}
                      </td>

                      <td className="p-3 text-slate-600 font-medium text-xs">
                        {appliedDate}
                      </td>

                      <td className="p-3 text-slate-500 text-xs">
                        {app.activityHistory && app.activityHistory.length > 0
                          ? app.activityHistory[app.activityHistory.length - 1].eventType || 'Status Updated'
                          : 'Applied'}
                      </td>

                      <td className="p-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 relative">
                          <button
                            onClick={() => { setDrawerAppId(appId); setDrawerActiveTab('overview'); }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>

                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === appId ? null : appId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action Overflow Menu */}
                          {openDropdownId === appId && (
                            <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl w-48 py-1.5 text-left text-xs font-bold animate-scale-up">
                              <button
                                onClick={() => { setDrawerAppId(appId); setDrawerActiveTab('overview'); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Application
                              </button>

                              <button
                                onClick={() => { setOpenDropdownId(null); if (onNavigate) onNavigate('candidate-intelligence'); }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5 text-indigo-600" /> View Candidate Intelligence
                              </button>

                              <button
                                onClick={() => { handleShortlistClick(app); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-emerald-700 flex items-center gap-2 cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Shortlist Application
                              </button>

                              <button
                                onClick={() => { handleOpenScheduleHRModal(app); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-purple-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Schedule Interview
                              </button>

                              <button
                                onClick={() => { handleRejectClick(app); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Reject Application
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Footer */}
        {sortedApplications.length > 0 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span>Showing {Math.min((currentPage - 1) * pageSize + 1, sortedApplications.length)} to {Math.min(currentPage * pageSize, sortedApplications.length)} of {sortedApplications.length} entries</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer ml-2"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="font-bold text-slate-700 font-mono px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. CANDIDATE DETAIL DRAWER (RIGHT SLIDE-OVER DRAWER WITH ATS INTELLIGENCE & PERFORMANCE GRAPHS) */}
      {activeDrawerApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerAppId(null)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Slide Drawer Content Container (680-760px wide) */}
          <div className="relative w-full max-w-3xl bg-white shadow-2xl border-l border-slate-200/90 h-full flex flex-col z-50 animate-slide-in-right overflow-hidden font-sans">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200/80 bg-slate-50/60 shrink-0 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center font-outfit shadow-sm">
                    {(activeDrawerApp.candidate?.name || activeDrawerApp.candidateSnapshot?.name || 'CN').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold font-outfit text-slate-950 tracking-tight">
                      {activeDrawerApp.candidate?.name || activeDrawerApp.candidateSnapshot?.name || 'Candidate Name'}
                    </h2>
                    <p className="text-xs text-indigo-600 font-bold">
                      {activeDrawerApp.job?.title || activeDrawerApp.jobTitle || 'Requisition'}
                      <span className="text-slate-400 font-normal ml-2">ID: {activeDrawerApp._id || activeDrawerApp.id}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerAppId(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Compact Drawer Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 text-xs font-medium gap-2">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Applied Date</span>
                  <span className="font-semibold text-slate-900">
                    {activeDrawerApp.createdAt ? new Date(activeDrawerApp.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Overall Job Fit</span>
                  <span className="font-extrabold font-mono text-emerald-700">
                    {activeDrawerApp.overallScore || activeDrawerApp.matchAnalysis?.overallMatch || 80}/100
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Current Stage</span>
                  <span className="font-bold text-indigo-700 capitalize">
                    {(activeDrawerApp.status || 'applied').replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Drawer Tabs Bar (4 EXACT TABS) */}
              <div className="flex border-b border-slate-200 font-bold text-xs gap-6 pt-2">
                {[
                  { id: 'overview', label: '1. Overview' },
                  { id: 'resume', label: '2. Resume & Skills (ATS Review)' },
                  { id: 'interview', label: '3. Interview Insights & Performance' },
                  { id: 'history', label: '4. History' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerActiveTab(tab.id)}
                    className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                      drawerActiveTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 font-outfit'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* TAB 1: OVERVIEW */}
              {drawerActiveTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Section A: Application Summary */}
                  <div className="saas-card p-4 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-2">
                      Section A &bull; Application Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Position</span>
                        <span className="font-bold text-slate-900">{activeDrawerApp.job?.title || 'Target Job'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Compensation Expectations</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {activeDrawerApp.expectedCompensation?.formatted || '₹7,00,000 per year'}
                        </span>
                      </div>
                    </div>

                    {activeDrawerApp.screeningAnswers && activeDrawerApp.screeningAnswers.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Employer Screening Responses</span>
                        {activeDrawerApp.screeningAnswers.map((ans, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-900 block">Q{i+1}: {ans.question}</span>
                            <p className="text-slate-600">{ans.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section B: Candidate Profile */}
                  <div className="saas-card p-4 border border-slate-200 bg-white rounded-2xl space-y-3 shadow-2xs">
                    <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Section B &bull; Candidate Contact & Background
                    </h3>
                    <div className="grid grid-cols-2 gap-3 font-medium text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                        <span className="font-semibold text-slate-900">{activeDrawerApp.candidate?.email || activeDrawerApp.candidateSnapshot?.email || 'candidate@example.com'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Contact</span>
                        <span className="font-semibold text-slate-900">{activeDrawerApp.candidateSnapshot?.mobile || '9876543210'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Location & Gender</span>
                        <span>{activeDrawerApp.candidateSnapshot?.location || 'Bengaluru, India'} ({activeDrawerApp.candidateSnapshot?.gender || 'Male'})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Designation & Exp</span>
                        <span>{activeDrawerApp.professionalSnapshot?.designation || 'Software Engineer'} &bull; {activeDrawerApp.professionalSnapshot?.experience || '2 Years'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Declared Technical Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeDrawerApp.professionalSnapshot?.skills || ['React', 'Node.js', 'MongoDB', 'Express']).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section C: Job Fit Summary */}
                  <div className="saas-card p-4 border border-indigo-100 bg-indigo-50/30 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                      <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-indigo-900">
                        Section C &bull; AI Job Compatibility Fit
                      </h3>
                      <button
                        onClick={() => onNavigate && onNavigate('candidate-intelligence')}
                        className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Open Candidate Intelligence Profile <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center font-extrabold font-mono text-xl text-indigo-600 shadow-2xs">
                        {activeDrawerApp.overallScore || activeDrawerApp.matchAnalysis?.overallMatch || 80}%
                      </div>
                      <div className="space-y-1 text-slate-700">
                        <span className="font-bold text-slate-900 block">High Role Alignment Match</span>
                        <p className="text-[11px] text-slate-600">
                          Candidate matches required core skills including React, Node.js, system architecture, and technical communication.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESUME & SKILLS — COMPLETE HR ATS REVIEW */}
              {drawerActiveTab === 'resume' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Section A: Submitted Resume Header */}
                  <div className="saas-card p-4 border border-slate-200 bg-white rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h3 className="text-sm font-bold font-outfit text-slate-950">Submitted Resume Snapshot</h3>
                          <p className="text-[11px] text-slate-400 font-medium">Original file submitted for this specific job application</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPreviewResumeData(activeDrawerApp.resumeSnapshot || {
                              fileName: 'Candidate_Resume.pdf',
                              parsedText: drawerAtsAnalysis?.summary || 'Experienced Software Developer with background in full stack web development.'
                            });
                            setShowResumePreviewModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Full Resume Preview
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{activeDrawerApp.resumeSnapshot?.fileName || 'Candidate_Resume.pdf'}</p>
                        <p className="text-[11px] text-slate-500">Submitted with Application &bull; Verified Candidate File</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        Verified Source
                      </span>
                    </div>
                  </div>

                  {/* Section B: ATS Overview Card */}
                  {drawerAtsAnalysis ? (
                    <div className="saas-card p-5 border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/10 rounded-2xl space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold font-outfit text-slate-950">ATS Quality & Readiness Review</h3>
                            <p className="text-xs text-slate-500 font-medium">Deterministic multi-category parse & quality evaluation</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-extrabold font-outfit font-mono text-indigo-600">
                            {drawerAtsAnalysis.overallScore}/100
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            Evaluated
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {drawerAtsAnalysis.summary}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                      Not evaluated
                    </div>
                  )}

                  {/* Section C: ATS Category Breakdown */}
                  {drawerAtsAnalysis && (
                    <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl space-y-4 shadow-xs">
                      <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                        Section C &bull; ATS Category Breakdown
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {[
                          { label: 'ATS Format & Readiness', score: drawerAtsAnalysis.categoryScores?.formatScore || 85, desc: 'Clean section headings & contact structure' },
                          { label: 'Skills & Keyword Match', score: drawerAtsAnalysis.categoryScores?.skillScore || 88, desc: 'Required technical skill density' },
                          { label: 'Structure & Layout', score: drawerAtsAnalysis.categoryScores?.structureScore || 80, desc: 'Standard chronological section ordering' },
                          { label: 'Impact & Metrics', score: drawerAtsAnalysis.categoryScores?.impactScore || 78, desc: 'Quantified achievements & outcome evidence' },
                          { label: 'Role Alignment', score: drawerAtsAnalysis.categoryScores?.roleFitScore || 82, desc: 'Target requisition skill fit' },
                          { label: 'Evidence Depth', score: drawerAtsAnalysis.categoryScores?.evidenceDepthScore || 84, desc: 'Verifiable citations & claim backing' }
                        ].map((cat, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-slate-900">{cat.label}</span>
                              <span className="font-mono text-indigo-600">{cat.score}/100</span>
                            </div>

                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 70 ? 'bg-indigo-600' : 'bg-amber-500'
                                }`}
                                style={{ width: `${cat.score}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500">{cat.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section D: Job-Specific Skills Match */}
                  {drawerAtsAnalysis && (
                    <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl space-y-3 shadow-xs">
                      <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                        Section D &bull; Required Skills & Evidence
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1.5">
                            Evidenced & Matched Skills ({drawerAtsAnalysis.matchedSkills?.length || 0})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(drawerAtsAnalysis.matchedSkills || ['React', 'Node.js', 'MongoDB', 'JavaScript']).map((s, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {drawerAtsAnalysis.missingSkills && drawerAtsAnalysis.missingSkills.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-rose-700 uppercase block mb-1.5">
                              Missing / Insufficiently Evidenced Skills ({drawerAtsAnalysis.missingSkills.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {drawerAtsAnalysis.missingSkills.map((s, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INTERVIEW INSIGHTS & PERFORMANCE GRAPHS */}
              {drawerActiveTab === 'interview' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Section A: Interview Summary Metrics Row */}
                  <div className="saas-card p-4 border border-purple-100 bg-purple-50/40 rounded-2xl flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold font-outfit text-purple-950">AI Mock Assessment Performance</h3>
                        <p className="text-[11px] text-purple-800 font-medium">3 Completed Attempts &bull; Persistent Evaluation Evidence</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-600 text-white font-mono shadow-xs">
                        {activeDrawerApp.mockInterviewEvidence?.overallScore || 80}% Latest Score
                      </span>
                    </div>
                  </div>

                  {/* Section B: Overall Performance Wave Trend Graph */}
                  <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl space-y-4 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold font-outfit text-slate-950 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" /> Section-by-Section Score Progression
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Track attempt-by-attempt score trends across canonical evaluation dimensions.
                        </p>
                      </div>

                      {/* Section Wave Filter Buttons */}
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedWaveCompetency('all')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            selectedWaveCompetency === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          All Waves
                        </button>
                        {CANONICAL_COMPETENCIES.slice(0, 4).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedWaveCompetency(c.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              selectedWaveCompetency === c.id
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recharts Performance Line Chart */}
                    <div className="h-56 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockAttemptHistoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="attemptLabel" stroke="#94a3b8" fontSize={11} />
                          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                          <RechartsTooltip wrapperStyle={{ fontSize: '11px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />

                          {CANONICAL_COMPETENCIES.map(comp => {
                            if (selectedWaveCompetency !== 'all' && selectedWaveCompetency !== comp.id) {
                              return null;
                            }
                            return (
                              <Line
                                key={comp.id}
                                type="monotone"
                                name={comp.name}
                                dataKey={comp.id}
                                stroke={comp.color}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Section C: Canonical Competencies Radar Graph */}
                  <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl space-y-3 shadow-xs">
                    <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Section C &bull; Canonical Competencies Radar Matrix
                    </h3>

                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={mockRadarCompetencyData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="competency" stroke="#475467" fontSize={10} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                          <Radar name="Demonstrated Score" dataKey="score" stroke="#4F46E5" fill="#6366F1" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Section D: Resume & Interview Consistency Analysis */}
                  <div className="saas-card p-5 border border-slate-200/90 bg-white rounded-2xl space-y-3 shadow-xs">
                    <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Section D &bull; Resume vs Verbal Interview Consistency Matrix
                    </h3>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[9px]">
                            <th className="p-2.5 pl-3">Canonical Competency</th>
                            <th className="p-2.5 text-center">Resume Evidence</th>
                            <th className="p-2.5 text-center">Verbal Response</th>
                            <th className="p-2.5 text-center">Consistency Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {CANONICAL_COMPETENCIES.map(c => (
                            <tr key={c.id}>
                              <td className="p-2.5 pl-3 font-bold text-slate-900">{c.name}</td>
                              <td className="p-2.5 text-center font-mono">85%</td>
                              <td className="p-2.5 text-center font-mono">82%</td>
                              <td className="p-2.5 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Consistent
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HISTORY */}
              {drawerActiveTab === 'history' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="saas-card p-4 border border-slate-200 bg-white rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Persisted Application Audit History
                    </h3>

                    <div className="space-y-3 relative pl-4 border-l-2 border-indigo-100 text-xs">
                      <div className="relative space-y-1">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 absolute -left-[23px] top-0.5 border-2 border-white" />
                        <span className="font-bold text-slate-900 block">Application Submitted by Candidate</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {activeDrawerApp.createdAt ? new Date(activeDrawerApp.createdAt).toLocaleString() : 'Recently'}
                        </span>
                      </div>

                      {activeDrawerApp.activityHistory && activeDrawerApp.activityHistory.map((act, idx) => (
                        <div key={idx} className="relative space-y-1 pt-2 border-t border-slate-100">
                          <div className="w-3 h-3 rounded-full bg-emerald-600 absolute -left-[23px] top-3 border-2 border-white" />
                          <span className="font-bold text-slate-900 block">{act.eventType}: {act.description}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recently'} &bull; By {act.actor || 'HR'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Persistent Fixed Drawer Footer with Contextual Actions */}
            <div className="p-4 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRejectClick(activeDrawerApp)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenScheduleHRModal(activeDrawerApp)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                </button>

                <button
                  onClick={() => handleShortlistClick(activeDrawerApp)}
                  className="btn-saas px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Shortlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL (Shortlist / Reject) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${confirmModal.actionType?.includes('reject') ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                {confirmModal.actionType?.includes('reject') ? <XCircle className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <h3 className="text-base font-extrabold font-outfit text-slate-950">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', actionType: null, targetApp: null, submitting: false })}
                className="btn-secondary text-xs px-4 py-2 rounded-xl cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={confirmModal.submitting}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer ${
                  confirmModal.actionType?.includes('reject') ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal.submitting ? 'Updating...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE HR INTERVIEW WIZARD MODAL */}
      {showScheduleHRModal && scheduleApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full shadow-2xl animate-scale-up max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-outfit text-slate-950 flex items-center gap-2">
                    Schedule Official Recruiter Interview
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {scheduleApp.candidate?.name || scheduleApp.candidateSnapshot?.name || 'Candidate'} &bull; {scheduleApp.job?.title || 'Target Requisition'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAttemptCloseScheduleModal}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section Switcher Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setHrFormSection('A')}
                className={`flex-1 py-3 px-4 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  hrFormSection === 'A'
                    ? 'border-purple-600 text-purple-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" /> Section A &bull; Round & Details
              </button>
              <button
                type="button"
                onClick={() => setHrFormSection('B')}
                className={`flex-1 py-3 px-4 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  hrFormSection === 'B'
                    ? 'border-purple-600 text-purple-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" /> Section B &bull; Interviewers & Panel
              </button>
              <button
                type="button"
                onClick={() => setHrFormSection('C')}
                className={`flex-1 py-3 px-4 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  hrFormSection === 'C'
                    ? 'border-purple-600 text-purple-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-4 h-4" /> Section C &bull; Rubric & Questions
                {Math.abs(totalRubricWeight - 100) < 0.01 ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700">100%</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700">{totalRubricWeight}%</span>
                )}
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleScheduleHRSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-medium">
              {/* SECTION A: Details & Round Choice */}
              {hrFormSection === 'A' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Target Requisition & Candidate</span>
                      <p className="font-bold text-purple-950 text-sm">{scheduleApp.candidate?.name || scheduleApp.candidateSnapshot?.name || 'Candidate'}</p>
                      <p className="text-slate-600 text-xs">{scheduleApp.job?.title || 'Job Requisition'} &bull; {scheduleApp.job?.department || 'Engineering'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-200/70 text-purple-900 uppercase">
                      Application ID: {scheduleApp._id?.substring(0, 8) || 'APP-01'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-800 font-bold block">Interview Round</label>
                      <select
                        value={hrForm.roundType}
                        onChange={(e) => handleRoundTypeChange(e.target.value)}
                        className="input-saas w-full text-xs bg-white font-bold cursor-pointer"
                      >
                        <option value="hr_screening">HR Screening & Behavioral Round</option>
                        <option value="aptitude">Aptitude & Logical Assessment</option>
                        <option value="technical">Technical Deep-Dive Interview</option>
                        <option value="coding">Live Coding & Algorithms</option>
                        <option value="system_design">System Design & Architecture</option>
                        <option value="managerial">Managerial & Leadership Round</option>
                        <option value="final">Executive / Final Round</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-800 font-bold block">Interview Title</label>
                      <input
                        type="text"
                        required
                        value={hrForm.title}
                        onChange={(e) => setHrForm({ ...hrForm, title: e.target.value })}
                        className="input-saas w-full text-xs bg-white"
                        placeholder="e.g. Technical Deep-Dive Interview"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold block">Interview Date</label>
                      <input
                        type="date"
                        required
                        value={hrForm.date}
                        onChange={(e) => setHrForm({ ...hrForm, date: e.target.value })}
                        className="input-saas w-full text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold block">Start Time</label>
                      <input
                        type="time"
                        required
                        value={hrForm.time}
                        onChange={(e) => setHrForm({ ...hrForm, time: e.target.value })}
                        className="input-saas w-full text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold block">Time Zone</label>
                      <select
                        value={hrForm.timeZone}
                        onChange={(e) => setHrForm({ ...hrForm, timeZone: e.target.value })}
                        className="input-saas w-full text-xs bg-white cursor-pointer"
                      >
                        <option value="IST">IST (UTC+05:30)</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (UTC-05:00)</option>
                        <option value="PST">PST (UTC-08:00)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold block">Duration</label>
                      <select
                        value={hrForm.durationMinutes}
                        onChange={(e) => setHrForm({ ...hrForm, durationMinutes: Number(e.target.value) })}
                        className="input-saas w-full text-xs bg-white cursor-pointer"
                      >
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes</option>
                        <option value={90}>90 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-900 block">Meeting Provider</span>
                        <span className="text-[11px] text-slate-500">Embedded Jitsi Video Room (Encrypted room identifier generated upon save)</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Jitsi Embedded
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-800 font-bold block">Candidate Instructions (Visible to Candidate)</label>
                    <textarea
                      rows={2}
                      value={hrForm.candidateInstructions}
                      onChange={(e) => setHrForm({ ...hrForm, candidateInstructions: e.target.value })}
                      className="input-saas w-full text-xs bg-white"
                      placeholder="Instructions sent to candidate in invitation email..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-800 font-bold block">Internal Recruiter Notes (HR Confidential Only)</label>
                    <textarea
                      rows={2}
                      value={hrForm.internalNotes}
                      onChange={(e) => setHrForm({ ...hrForm, internalNotes: e.target.value })}
                      className="input-saas w-full text-xs bg-white"
                      placeholder="Private guidelines for interviewers. Hidden from candidates..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION B: Interviewers & Panel Assignment */}
              {hrFormSection === 'B' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-slate-800 font-bold block">Assignment Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setHrForm({ ...hrForm, assignmentMode: 'single' })}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          hrForm.assignmentMode === 'single'
                            ? 'border-purple-600 bg-purple-50/50 text-purple-950 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-4 h-4 mb-1 text-purple-600" />
                        <span className="block text-xs">Single Primary Interviewer</span>
                        <span className="text-[10px] text-slate-500 font-normal">One lead interviewer evaluates the candidate.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHrForm({ ...hrForm, assignmentMode: 'panel' })}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          hrForm.assignmentMode === 'panel'
                            ? 'border-purple-600 bg-purple-50/50 text-purple-950 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Users className="w-4 h-4 mb-1 text-purple-600" />
                        <span className="block text-xs">Panel Interview (Multi-Evaluator)</span>
                        <span className="text-[10px] text-slate-500 font-normal">Lead interviewer + additional panel members.</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Interviewer */}
                  <div className="saas-card p-4 border border-slate-200 bg-white rounded-2xl space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" /> Primary Lead Interviewer
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-600 text-[11px] block">Full Name</label>
                        <input
                          type="text"
                          value={hrForm.primaryInterviewer.name}
                          onChange={(e) => setHrForm({
                            ...hrForm,
                            primaryInterviewer: { ...hrForm.primaryInterviewer, name: e.target.value }
                          })}
                          className="input-saas w-full text-xs bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-[11px] block">Role / Designation</label>
                        <input
                          type="text"
                          value={hrForm.primaryInterviewer.role}
                          onChange={(e) => setHrForm({
                            ...hrForm,
                            primaryInterviewer: { ...hrForm.primaryInterviewer, role: e.target.value }
                          })}
                          className="input-saas w-full text-xs bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-[11px] block">Email (Confidential)</label>
                        <input
                          type="email"
                          value={hrForm.primaryInterviewer.email}
                          onChange={(e) => setHrForm({
                            ...hrForm,
                            primaryInterviewer: { ...hrForm.primaryInterviewer, email: e.target.value }
                          })}
                          className="input-saas w-full text-xs bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Panel Members (if Panel Mode) */}
                  {hrForm.assignmentMode === 'panel' && (
                    <div className="saas-card p-4 border border-purple-200 bg-purple-50/20 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <h4 className="font-bold text-purple-950 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-700" /> Additional Panel Members
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddPanelMember}
                          className="btn-secondary text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Panel Member
                        </button>
                      </div>

                      <div className="space-y-2">
                        {hrForm.panelMembers.map((member) => (
                          <div key={member.id} className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Name"
                              value={member.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setHrForm(prev => ({
                                  ...prev,
                                  panelMembers: prev.panelMembers.map(m => m.id === member.id ? { ...m, name: val } : m)
                                }));
                              }}
                              className="input-saas w-full text-xs"
                            />
                            <select
                              value={member.role}
                              onChange={(e) => {
                                const val = e.target.value;
                                setHrForm(prev => ({
                                  ...prev,
                                  panelMembers: prev.panelMembers.map(m => m.id === member.id ? { ...m, role: val } : m)
                                }));
                              }}
                              className="input-saas w-full text-xs cursor-pointer"
                            >
                              <option value="Technical Evaluator">Technical Evaluator</option>
                              <option value="HR Observer">HR Observer</option>
                              <option value="Hiring Manager">Hiring Manager</option>
                              <option value="Peer Interviewer">Peer Interviewer</option>
                            </select>
                            <input
                              type="email"
                              placeholder="Email"
                              value={member.email}
                              onChange={(e) => {
                                const val = e.target.value;
                                setHrForm(prev => ({
                                  ...prev,
                                  panelMembers: prev.panelMembers.map(m => m.id === member.id ? { ...m, email: val } : m)
                                }));
                              }}
                              className="input-saas w-full text-xs"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemovePanelMember(member.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Candidate Privacy Guard:</strong> Candidate receives only company room link & instructions. Personal recruiter emails, panel notes, and scoring rubrics are strictly isolated.
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION C: Review, Evaluation Rubric & Question Selection */}
              {hrFormSection === 'C' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Complete Pre-Scheduling Review Card */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                    <h4 className="font-bold text-purple-950 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-purple-200/80 pb-2">
                      <ShieldCheck className="w-4 h-4 text-purple-700" /> Pre-Scheduling Summary & Video Readiness
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-purple-800 font-bold uppercase block">Candidate</span>
                        <span className="font-bold text-slate-900 block">{scheduleApp.candidate?.name || scheduleApp.candidateSnapshot?.name || 'Candidate'}</span>
                        <span className="text-[11px] text-slate-500">{scheduleApp.candidate?.email || 'Candidate Email'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-800 font-bold uppercase block">Requisition & Round</span>
                        <span className="font-bold text-slate-900 block">{scheduleApp.job?.title || 'Target Requisition'}</span>
                        <span className="text-[11px] text-slate-500">{hrForm.title} ({hrForm.roundType})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-800 font-bold uppercase block">Scheduled Window</span>
                        <span className="font-bold text-slate-900 block">{hrForm.date} at {hrForm.time} ({hrForm.timeZone})</span>
                        <span className="text-[11px] text-slate-500">Duration: {hrForm.durationMinutes} Minutes</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-purple-200/60">
                      <div>
                        <span className="text-[10px] text-purple-800 font-bold uppercase block">Lead & Panel Interviewers</span>
                        <span className="font-bold text-slate-900 block">{hrForm.primaryInterviewer.name} ({hrForm.primaryInterviewer.role})</span>
                        {hrForm.assignmentMode === 'panel' && hrForm.panelMembers.length > 0 && (
                          <span className="text-[11px] text-slate-500 block">
                            + {hrForm.panelMembers.length} additional panel members
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-800 font-bold uppercase block">Integrations & Notification</span>
                        <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                          ✓ Jitsi Video Provider (Encrypted Room ID)
                        </span>
                        <span className="text-[11px] text-purple-900 font-bold flex items-center gap-1">
                          ✓ Resend Email Invitation (Live Candidate Delivery)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rubric Criteria Table & Weight Validation */}
                  <div className="saas-card p-4 border border-slate-200 bg-white rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-purple-600" /> Evaluation Rubric Snapshot & Weights
                        </h4>
                        <p className="text-[11px] text-slate-500">Configure competencies evaluated in this round. Criteria weights MUST total 100%.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          Math.abs(totalRubricWeight - 100) < 0.01
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          Total Weight: {totalRubricWeight}% {Math.abs(totalRubricWeight - 100) < 0.01 ? '✓ Valid' : '⚠️ Must = 100%'}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                            <th className="p-2.5">Criterion Name</th>
                            <th className="p-2.5 w-24 text-center">Weight %</th>
                            <th className="p-2.5 w-24 text-center">Scale</th>
                            <th className="p-2.5">Description</th>
                            <th className="p-2.5 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {hrForm.rubricCriteria.map((crit) => (
                            <tr key={crit.id}>
                              <td className="p-2.5 font-bold text-slate-900">{crit.name}</td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={crit.weight}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setHrForm(prev => ({
                                      ...prev,
                                      rubricCriteria: prev.rubricCriteria.map(c => c.id === crit.id ? { ...c, weight: val } : c)
                                    }));
                                  }}
                                  className="w-16 p-1 border border-slate-200 rounded text-center text-xs font-bold font-mono"
                                />
                              </td>
                              <td className="p-2.5 text-center font-mono text-slate-500">{crit.scale || '1-5'}</td>
                              <td className="p-2.5 text-slate-600 text-[11px]">{crit.description}</td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRubricCriterion(crit.id)}
                                  className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Custom Criterion row */}
                    <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom evaluation criterion..."
                        value={hrForm.newCriterionName}
                        onChange={(e) => setHrForm({ ...hrForm, newCriterionName: e.target.value })}
                        className="input-saas flex-1 text-xs bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Weight %"
                        value={hrForm.newCriterionWeight}
                        onChange={(e) => setHrForm({ ...hrForm, newCriterionWeight: e.target.value })}
                        className="w-24 input-saas text-xs bg-white font-mono text-center"
                      />
                      <button
                        type="button"
                        onClick={handleAddRubricCriterion}
                        className="btn-secondary px-3 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Question Bank Selection */}
                  <div className="saas-card p-4 border border-slate-200 bg-white rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-600" /> Round Question Bank Selection ({hrForm.questions.length})
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {hrForm.questions.map((q, idx) => (
                        <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                              Q{idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{q.text}</p>
                              <span className="text-[10px] text-slate-500">Est. Duration: {q.duration || 10} mins &bull; {q.required ? 'Required' : 'Optional'}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom round question..."
                        value={hrForm.newQuestionText}
                        onChange={(e) => setHrForm({ ...hrForm, newQuestionText: e.target.value })}
                        className="input-saas flex-1 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="btn-secondary px-3 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions Sticky */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleAttemptCloseScheduleModal}
                  className="btn-secondary text-xs px-4 py-2.5 rounded-xl cursor-pointer font-bold"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {hrFormSection !== 'A' && (
                    <button
                      type="button"
                      onClick={() => setHrFormSection(hrFormSection === 'C' ? 'B' : 'A')}
                      className="btn-secondary text-xs px-4 py-2.5 rounded-xl cursor-pointer font-bold"
                    >
                      Back
                    </button>
                  )}

                  {hrFormSection === 'A' && (
                    <button
                      type="button"
                      onClick={handleNextFromSectionA}
                      className="btn-saas px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      Continue to Section B <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {hrFormSection === 'B' && (
                    <button
                      type="button"
                      onClick={handleNextFromSectionB}
                      className="btn-saas px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      Continue to Section C &bull; Review <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {hrFormSection === 'C' && (
                    <button
                      type="submit"
                      disabled={hrFormSubmitting || Math.abs(totalRubricWeight - 100) > 0.01}
                      className={`btn-saas px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 ${
                        Math.abs(totalRubricWeight - 100) < 0.01
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Video className="w-4 h-4 text-purple-200" />
                      {hrFormSubmitting ? 'Persisting Schedule & Generating Video Room...' : 'Schedule Video Interview'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISCARD UNSAVED CHANGES CONFIRMATION MODAL */}
      {showDiscardConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold font-outfit text-slate-950">Discard Unsaved Changes?</h3>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              You have an in-progress interview schedule configuration. Are you sure you want to discard your changes and close the wizard?
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirmModal(false)}
                className="btn-secondary text-xs px-4 py-2 rounded-xl cursor-pointer font-bold"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscardForm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE RESUME PREVIEW MODAL */}
      {showResumePreviewModal && previewResumeData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold font-outfit text-slate-950">
                  Submitted Candidate Resume Document
                </h3>
              </div>
              <button
                onClick={() => setShowResumePreviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-medium pr-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">File Metadata</span>
                <p className="font-bold text-slate-900 text-sm">{previewResumeData.fileName || 'Candidate_Resume.pdf'}</p>
                <p className="text-slate-500 text-[11px]">Submitted Resume Snapshot &bull; Verified Candidate File</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 font-mono text-[11px] text-slate-800 leading-relaxed select-text">
                <span className="font-sans font-bold text-slate-400 text-[10px] uppercase block font-outfit">Extracted Resume Text:</span>
                <p>{previewResumeData.parsedText || 'Experienced Software Developer with background in React, Node.js, Express, and system architecture.'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowResumePreviewModal(false)}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterCandidateManagement;
