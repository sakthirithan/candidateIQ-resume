import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import {
  mockInterviewService,
  extractAIFeaturesFromJD,
  METHOD_CONFIG
} from '@/services/mockApi/interviewService';
import { getCurrentUser } from '@/utils/auth';
import { getScoreStatus } from '@/utils/scoreUtils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine } from 'recharts';
import MockInterviewPerformanceGraph from '@/modules/candidate/interview/components/MockInterviewPerformanceGraph';
import {
  Play, Send, Mic, Clock, Sparkles, MessageSquare, CheckCircle2, AlertCircle,
  Video, MicOff, Bot, Pause, RotateCcw, Briefcase, Calendar, Upload, FileText,
  AlertTriangle, ShieldCheck, Lock, LogOut, Check, Eye, Sun, Moon, ArrowLeft,
  CheckSquare, Square, ChevronRight, RefreshCw, X, Edit3, Layers, Sliders,
  Trash2, Plus, FileCode, History, UserCheck, Search, Filter, ArrowUpRight, ChevronDown,
  ChevronLeft, FileCheck, Info, HelpCircle, Activity, Maximize, Minimize, AlertOctagon,
  Target, Zap, Award, TrendingUp, BarChart2, CheckCircle, ArrowRight
} from 'lucide-react';

const SECTION_COLORS = {
  overall: '#6366f1',       // Indigo
  technical: '#3b82f6',     // Blue
  communication: '#10b981', // Emerald
  problemSolving: '#f59e0b',// Amber
  behavioural: '#f43f5e',   // Rose
  voice: '#06b6d4',         // Cyan
  mcq: '#8b5cf6'            // Violet
};

const SECTION_LABELS = {
  overall: 'Overall Score',
  technical: 'Technical',
  communication: 'Communication',
  problemSolving: 'Problem Solving',
  behavioural: 'Behavioural',
  voice: 'Voice / Fluency',
  mcq: 'MCQ Accuracy'
};

const CustomMultiAttemptTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isCurrent = data.isCurrentAttempt;

    return (
      <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 max-w-sm space-y-2.5 select-text font-sans text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-extrabold font-outfit text-indigo-400 flex items-center gap-1.5">
            {label} {isCurrent && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Current Attempt</span>}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {data.completedAt ? new Date(data.completedAt).toLocaleDateString() : ''}
          </span>
        </div>

        <div className="space-y-2">
          {payload.map((entry) => {
            const secKey = entry.dataKey;
            const score = entry.value;
            const meta = data.sectionsMeta?.[secKey] || {};
            const delta = meta.delta || 0;
            const prev = meta.previousScore;
            const color = entry.color;
            const secLabel = SECTION_LABELS[secKey] || secKey;

            return (
              <div key={secKey} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 font-outfit" style={{ color }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                    {secLabel}
                  </span>
                  <span className="font-mono text-white text-[11px]">
                    {score} {prev !== undefined && prev !== null ? `(prev: ${prev})` : ''} {delta !== 0 && (delta > 0 ? `↑ +${delta}` : `↓ ${delta}`)}
                  </span>
                </div>
                {meta.evidence && (
                  <p className="text-[11px] text-slate-300 leading-snug pl-3 border-l-2 border-indigo-500/40 font-medium">
                    {meta.evidence}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function AIMockInterviewRoom({ onComplete, targetSkill }) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Active Flow Step: 'hub' | 'generating' | 'guidelines' | 'testing' | 'completed'
  const [flowStep, setFlowStep] = useState('hub');

  // Hub View Sub-tab: 'create' | 'list'
  const [hubActiveTab, setHubActiveTab] = useState('create');
  const [newlyCreatedId, setNewlyCreatedId] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const hasUserToggledTabRef = useRef(false);

  // Workspaces (Active Mock Interview Cards, max 10)
  const [workspaces, setWorkspaces] = useState([]);
  const [slotsAvailable, setSlotsAvailable] = useState(10);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  // Resume State
  const [resumeList, setResumeList] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showResumeHistoryModal, setShowResumeHistoryModal] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Job Details Form State (User Provided)
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Config Form State
  const [interviewType, setInterviewType] = useState('Technical'); // 'Technical' | 'Behavioral' | 'Project' | 'Mixed'
  const [difficulty, setDifficulty] = useState('Medium'); // 'Easy' | 'Medium' | 'Hard'
  const [interviewMode, setInterviewMode] = useState('Voice'); // 'Text' | 'Voice' | 'Mixed'
  const [questionCount, setQuestionCount] = useState(10); // 10 | 15 | 20

  // Modals & Active Edit/Delete State
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState(null);
  const [creatingError, setCreatingError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Active Attempt Testing State
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testSecondsElapsed, setTestSecondsElapsed] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [draftMcqOption, setDraftMcqOption] = useState('');
  const [draftTextAnswer, setDraftTextAnswer] = useState('');
  const [draftVoiceTranscript, setDraftVoiceTranscript] = useState('');
  const [activeResponseTab, setActiveResponseTab] = useState('voice'); // 'voice' | 'transcript'
  const [isRecording, setIsRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceError, setVoiceError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [guidelinesChecked, setGuidelinesChecked] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showEndAssessmentModal, setShowEndAssessmentModal] = useState(false);
  const [showFinalSubmitConfirmModal, setShowFinalSubmitConfirmModal] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Real-time Voice Intelligence & Audio Engine State
  const [voiceAudioUrl, setVoiceAudioUrl] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waveformData, setWaveformData] = useState(new Array(16).fill(6));
  const [audioProcessingState, setAudioProcessingState] = useState('idle'); // 'idle' | 'recording' | 'processing' | 'recorded'
  const [voiceMetrics, setVoiceMetrics] = useState({
    wordCount: 0,
    wpm: 0,
    fillerCount: 0,
    fillerRate: '0.0',
    pauseCount: 0,
    longestPauseSeconds: '0.0',
    speakingDurationSeconds: 0,
    silenceDurationSeconds: 0,
    fillerEvents: [],
    pauseEvents: []
  });

  const [showRerecordConfirmModal, setShowRerecordConfirmModal] = useState(false);
  const [showNavDuringRecordModal, setShowNavDuringRecordModal] = useState(false);
  const [pendingNavIndex, setPendingNavIndex] = useState(null);

  // Mock Interview Review & Actionable AI Feedback Workspace State
  const [selectedReviewWorkspace, setSelectedReviewWorkspace] = useState(null);
  const [reviewAttempts, setReviewAttempts] = useState([]);
  const [activeAttemptIndex, setActiveAttemptIndex] = useState(0);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [solutionStatuses, setSolutionStatuses] = useState({});
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null);

  // Multi-Attempt Consistency Analytics State
  const [consistencyData, setConsistencyData] = useState(null);
  const [loadingConsistency, setLoadingConsistency] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    overall: true,
    technical: true,
    communication: true,
    problemSolving: true,
    behavioural: true,
    voice: true,
    mcq: true
  });

  useEffect(() => {
    if (flowStep === 'review' && (selectedReviewWorkspace?._id || selectedReviewWorkspace?.id)) {
      const targetWId = selectedReviewWorkspace._id || selectedReviewWorkspace.id;
      loadConsistencyForWorkspace(targetWId);
    }
  }, [flowStep, selectedReviewWorkspace]);

  const loadConsistencyForWorkspace = async (wId) => {
    try {
      setLoadingConsistency(true);
      const res = await mockInterviewService.getMockInterviewConsistency(wId);
      if (res) {
        setConsistencyData(res);
        if (res.sections && Array.isArray(res.sections)) {
          const vis = {};
          res.sections.forEach(s => { vis[s] = true; });
          setVisibleSections(vis);
        }
      }
    } catch (err) {
      console.warn('[AIMockInterviewRoom] Failed to load multi-attempt consistency:', err);
    } finally {
      setLoadingConsistency(false);
    }
  };

  // Dynamic Evidence & Evaluation Computation Engine
  const computeReviewData = (workspace, attempt) => {
    if (!attempt) return null;

    const questions = attempt.questions || [];
    const overallEval = attempt.overallEvaluation || attempt.evaluation || {};

    const questionDetails = questions.map((q, idx) => {
      const qType = (q.category || q.questionType || 'voice').toLowerCase();
      const qText = q.questionText || q.question || `Question ${idx + 1}`;
      const userAns = q.userAnswer || q.answer || q.voiceTranscript || q.textAnswer || q.selectedOption || '';
      const qEval = q.evaluation || {};

      let isCorrect = qEval.isCorrect;
      if (isCorrect === undefined && qType === 'mcq') {
        isCorrect = String(q.selectedOption || userAns).toUpperCase() === String(q.correctAnswer || '').toUpperCase();
      }

      let score = qEval.scores?.technical ?? qEval.score ?? (isCorrect ? 90 : userAns.toString().trim().length > 15 ? 72 : 45);
      if (!userAns || !userAns.toString().trim()) {
        score = 0;
      }

      const vm = q.voiceMetrics || qEval.voiceMetrics || null;

      let missing = qEval.missingAreas || qEval.missingConcepts || [];
      if (!Array.isArray(missing)) missing = [];
      if (missing.length === 0 && score < 80) {
        if (qText.toLowerCase().includes('react')) missing = ['Virtual DOM Reconciliation', 'Component Identity & Keys'];
        else if (qText.toLowerCase().includes('state') || qText.toLowerCase().includes('memo')) missing = ['Memoization Trade-offs', 'Re-render Trigger Mechanisms'];
        else if (qText.toLowerCase().includes('node') || qText.toLowerCase().includes('api')) missing = ['Event Loop Execution Phases', 'Non-blocking I/O Architecture'];
        else missing = ['Practical Code Examples', 'Engineering Trade-off Justification'];
      }

      return {
        index: idx,
        qId: q.questionId || q._id || `q_${idx}`,
        qType,
        qText,
        userAns: userAns.toString(),
        isCorrect,
        score,
        feedback: qEval.feedback || qEval.generalFeedback || (score >= 80 ? 'Demonstrated strong core understanding aligned with technical requirements.' : 'Response covers definition but lacks practical implementation examples and trade-offs.'),
        missingConcepts: missing,
        voiceMetrics: vm,
        topic: q.sourceKeyword || q.targetSkill || 'Technical'
      };
    });

    const validQs = questionDetails.filter(q => q.userAns.trim().length > 0);
    const totalCount = questions.length;
    const answeredCount = validQs.length;

    const techScores = questionDetails.map(q => q.score);
    const avgTech = techScores.length > 0 ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 70;

    const overallScore = overallEval.overallInterviewScore || overallEval.overallScore || avgTech;

    const sections = {
      technicalKnowledge: {
        score: overallEval.technicalProficiency || overallEval.technicalScore || avgTech,
        name: 'Technical Knowledge',
        description: 'Understanding and accuracy of core engineering concepts.',
        weight: 30
      },
      answerQuality: {
        score: Math.min(100, Math.round(avgTech * 0.95 + (answeredCount / (totalCount || 1) * 10))),
        name: 'Answer Quality & Relevance',
        description: 'Directness, relevance, and completeness of answers.',
        weight: 25
      },
      conceptExplanation: {
        score: Math.max(40, Math.round(avgTech * 0.84)),
        name: 'Concept Explanation',
        description: 'Ability to explain definitions, mechanisms, and trade-offs.',
        weight: 20
      },
      problemSolving: {
        score: overallEval.problemSolvingRating || overallEval.reasoningScore || Math.min(100, avgTech + 4),
        name: 'Problem Solving',
        description: 'Logical decomposition, trade-offs, and edge case awareness.',
        weight: 20
      },
      communication: {
        score: overallEval.communicationClarity || overallEval.communicationScore || Math.min(100, avgTech - 2),
        name: 'Communication',
        description: 'Clarity, sentence structure, and technical expression.',
        weight: 15
      },
      fluency: {
        score: Math.min(100, Math.max(50, Math.round(avgTech * 0.9))),
        name: 'Fluency & Pacing',
        description: 'Speaking rate, pause control, and smooth transitions.',
        weight: 15
      },
      answerStructure: {
        score: Math.min(100, Math.max(55, Math.round(avgTech * 0.92))),
        name: 'Answer Structure',
        description: 'Use of structured framework (Definition → Mechanism → Example).',
        weight: 15
      },
      conciseness: {
        score: Math.min(100, Math.max(60, Math.round(avgTech * 0.88))),
        name: 'Conciseness',
        description: 'Reaching the main point efficiently without fluff.',
        weight: 10
      }
    };

    // Aggregate Voice Analytics
    let totalWords = 0;
    let totalFillers = 0;
    let totalPauses = 0;
    let totalSpeakingSec = 0;
    let totalSilenceSec = 0;
    let voiceQuestionCount = 0;

    questionDetails.forEach(q => {
      if (q.voiceMetrics) {
        voiceQuestionCount++;
        totalWords += q.voiceMetrics.wordCount || 0;
        totalFillers += q.voiceMetrics.fillerCount || 0;
        totalPauses += q.voiceMetrics.pauseCount || 0;
        totalSpeakingSec += q.voiceMetrics.speakingDurationSeconds || 0;
        totalSilenceSec += q.voiceMetrics.silenceDurationSeconds || 0;
      }
    });

    const avgWpm = totalSpeakingSec > 0 ? Math.round((totalWords / totalSpeakingSec) * 60) : 145;
    const fillerRate = totalWords > 0 ? ((totalFillers / totalWords) * 100).toFixed(1) : '0.0';

    // Actionable Solutions Generator using the Priority Score Formula:
    // priorityScore = severity * 0.35 + frequency * 0.25 + interviewImpact * 0.25 + scoreGap * 0.15
    const solutions = [];

    if (sections.conceptExplanation.score < 80) {
      const gap = 100 - sections.conceptExplanation.score;
      const severity = gap > 30 ? 9 : 7;
      const frequency = Math.min(10, Math.round((questionDetails.filter(q => q.score < 75).length / (totalCount || 1)) * 10));
      const impact = 9;
      const scoreGapVal = Math.min(10, gap / 10);

      const prioScore = Number((severity * 0.35 + frequency * 0.25 + impact * 0.25 + scoreGapVal * 0.15).toFixed(2));
      const prioLevel = prioScore >= 7.0 ? 'HIGH' : prioScore >= 5.0 ? 'MEDIUM' : 'LOW';

      const affectedQs = questionDetails.filter(q => q.score < 75).map(q => `Q${q.index + 1}`);

      solutions.push({
        id: 'sol_concept_explanation',
        title: 'Concept Explanation Framework',
        section: 'Concept Explanation',
        score: sections.conceptExplanation.score,
        priority: prioLevel,
        priorityScore: prioScore,
        problem: 'Your technical responses frequently state definitions without explaining practical mechanisms or trade-offs.',
        evidence: affectedQs.length > 0 ? affectedQs : ['Q2', 'Q5', 'Q7'],
        impact: 'Interviewers may assume you memorized the definition without understanding real-world application.',
        solution: 'Apply the 5-Step Technical Explanation Framework: 1. Definition → 2. Mechanism → 3. Example → 4. Use Case → 5. Trade-off.',
        practiceTasks: [
          'Explain React reconciliation using all 5 steps',
          'Explain MongoDB indexing and B-Tree structure',
          'Compare REST vs GraphQL with production trade-offs',
          'Explain JWT authentication and session security'
        ],
        target: '≥ 4/5 practice explanations include all 5 framework steps.',
        status: 'NOT_STARTED'
      });
    }

    if (totalFillers > 3 || sections.fluency.score < 80) {
      const gap = 100 - sections.fluency.score;
      const severity = totalFillers > 8 ? 8 : 6;
      const frequency = Math.min(10, totalFillers || 4);
      const impact = 7;
      const scoreGapVal = Math.min(10, gap / 10);

      const prioScore = Number((severity * 0.35 + frequency * 0.25 + impact * 0.25 + scoreGapVal * 0.15).toFixed(2));
      const prioLevel = prioScore >= 7.0 ? 'HIGH' : prioScore >= 5.0 ? 'MEDIUM' : 'LOW';

      solutions.push({
        id: 'sol_filler_control',
        title: 'Filler Word & Pacing Control',
        section: 'Fluency & Speaking',
        score: sections.fluency.score,
        priority: prioLevel,
        priorityScore: prioScore,
        problem: `Detected ${totalFillers || 8} filler word occurrences (${fillerRate}% filler rate) across spoken responses.`,
        evidence: ['Spoken Voice Questions'],
        impact: 'Frequent fillers ("umm", "hmm", "like") create hesitation signals and reduce perceived confidence.',
        solution: 'Replace vocalized fillers with deliberate 1 to 2 second silent pauses when transitioning between concepts.',
        practiceTasks: [
          'Record 60s explanation of a core topic with zero filler words',
          'Practice deliberate 2-second pause before answering complex questions',
          'Record a mock response and self-audit filler count'
        ],
        target: '< 3 filler words total per interview session.',
        status: 'NOT_STARTED'
      });
    }

    if (sections.answerStructure.score < 80) {
      const gap = 100 - sections.answerStructure.score;
      const severity = gap > 25 ? 8 : 6;
      const frequency = 6;
      const impact = 8;
      const scoreGapVal = Math.min(10, gap / 10);

      const prioScore = Number((severity * 0.35 + frequency * 0.25 + impact * 0.25 + scoreGapVal * 0.15).toFixed(2));
      const prioLevel = prioScore >= 7.0 ? 'HIGH' : prioScore >= 5.0 ? 'MEDIUM' : 'LOW';

      solutions.push({
        id: 'sol_answer_structure',
        title: 'Structured Answer Formatting',
        section: 'Answer Structure',
        score: sections.answerStructure.score,
        priority: prioLevel,
        priorityScore: prioScore,
        problem: 'Several responses dive directly into code implementation before stating high-level approach or architecture.',
        evidence: ['Technical & Open Reasoning Questions'],
        impact: 'Unstructured answers force the interviewer to interrupt and ask for clarification.',
        solution: 'Use Problem-Solving Framework: Understand → Approach → Algorithm → Complexity → Edge Cases.',
        practiceTasks: [
          'Outline problem approach verbally for 30s before typing code',
          'Practice STAR method for behavioral/scenario questions'
        ],
        target: '100% of open-ended answers follow a recognized structure.',
        status: 'NOT_STARTED'
      });
    }

    solutions.sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      overallScore,
      scoreStatus: getScoreStatus(overallScore),
      sections,
      questionDetails,
      voiceAnalytics: {
        hasVoice: voiceQuestionCount > 0,
        avgWpm,
        totalFillers,
        fillerRate,
        totalPauses,
        totalSpeakingSec,
        totalSilenceSec
      },
      solutions
    };
  };

  const handleOpenReview = async (workspace, targetAttemptId = null) => {
    const targetId = workspace?._id || workspace?.id || targetAttemptId;
    setSelectedReviewWorkspace(workspace);
    setLoadingReview(true);
    setReviewError(null);
    setFlowStep('review');

    try {
      const res = await api.get(`/mock-interviews/${targetId}`);
      if (res.data?.workspace) {
        setSelectedReviewWorkspace(res.data.workspace);
      }
      
      const attemptsList = res.data?.attempts || (res.data?.interview ? [res.data.interview] : []);
      if (attemptsList.length > 0) {
        setReviewAttempts(attemptsList);
        if (targetAttemptId) {
          const foundIdx = attemptsList.findIndex(a => String(a._id) === String(targetAttemptId));
          setActiveAttemptIndex(foundIdx >= 0 ? foundIdx : 0);
        } else {
          setActiveAttemptIndex(0);
        }
      } else {
        setReviewAttempts([]);
      }
    } catch (err) {
      console.error('Error fetching mock interview review attempts:', err);
      setReviewError('Unable to load review data for this mock interview. Please try again.');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleToggleSolutionStatus = (solId) => {
    setSolutionStatuses(prev => {
      const curr = prev[solId] || 'NOT_STARTED';
      let next = 'IN_PROGRESS';
      if (curr === 'IN_PROGRESS') next = 'COMPLETED';
      else if (curr === 'COMPLETED') next = 'NOT_STARTED';
      return { ...prev, [solId]: next };
    });
  };

  // Voice Intelligence Refs
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speakingTimeRef = useRef(0);
  const silenceTimeRef = useRef(0);
  const lastAudioTimestampRef = useRef(Date.now());
  const silenceStartRef = useRef(null);
  const pauseEventsRef = useRef([]);
  const fillerEventsRef = useRef([]);

  // Fullscreen & Tab Switch Integrity State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenExitModal, setShowFullscreenExitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceTimerRef = useRef(null);
  const testStartTimeRef = useRef(null);
  const lastFocusLossRef = useRef(0);

  // Fetch Workspaces & Resumes on Mount
  useEffect(() => {
    loadWorkspacesData();
    loadUserResumes();
  }, []);

  // Timestamp-based Timer during active test
  useEffect(() => {
    let timer;
    if (flowStep === 'testing') {
      if (!testStartTimeRef.current) testStartTimeRef.current = Date.now();
      timer = setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - testStartTimeRef.current) / 1000));
        setTestSecondsElapsed(elapsed);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [flowStep]);

  // Fullscreen & Visibility Integrity Listeners
  useEffect(() => {
    if (flowStep !== 'testing') return;

    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull && flowStep === 'testing') {
        setShowFullscreenExitModal(true);
      }
    };

    const handleFocusLoss = () => {
      const now = Date.now();
      if (now - lastFocusLossRef.current > 1500) {
        lastFocusLossRef.current = now;
        setTabSwitchCount((prev) => prev + 1);
        setShowTabSwitchWarning(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFocusLoss();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusLoss);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLoss);
    };
  }, [flowStep]);

  // Recording Timer Effect
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setVoiceDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const loadWorkspacesData = async () => {
    setLoadingWorkspaces(true);
    try {
      const data = await mockInterviewService.getWorkspaces();
      if (data && data.workspaces) {
        setWorkspaces(data.workspaces);
        setSlotsAvailable(data.slotsAvailable ?? Math.max(0, 10 - data.workspaces.length));
        if (data.workspaces.length > 0 && !hasUserToggledTabRef.current) {
          setHubActiveTab('list');
        }
      }
    } catch (err) {
      console.warn('Error loading workspaces:', err);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const loadUserResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.data && res.data.resumes) {
        setResumeList(res.data.resumes);
        if (res.data.resumes.length > 0 && !selectedResume) {
          setSelectedResume(res.data.resumes[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading resumes:', err);
    }
  };

  // Upload New Resume handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.resume) {
        const uploaded = res.data.resume;
        setSelectedResume(uploaded);
        setResumeList((prev) => [uploaded, ...prev]);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      const fallbackRes = {
        _id: `res_fallback_${Date.now()}`,
        originalName: file.name,
        fileName: file.name,
        keywords: ['React', 'Node.js', 'TypeScript', 'MongoDB']
      };
      setSelectedResume(fallbackRes);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Import from Profile handler
  const handleImportProfileResume = () => {
    if (resumeList.length > 0) {
      setSelectedResume(resumeList[0]);
    } else {
      const profileRes = {
        _id: `profile_res_${Date.now()}`,
        originalName: 'My_Profile_Resume.pdf',
        fileName: 'My_Profile_Resume.pdf',
        keywords: ['React', 'Node.js', 'MongoDB', 'System Design']
      };
      setSelectedResume(profileRes);
    }
  };

  // CREATE MOCK INTERVIEW CARD WORKSPACE
  const handleCreateWorkspaceCard = async (e) => {
    e.preventDefault();
    setCreatingError(null);

    if (workspaces.length >= 10) {
      setCreatingError('Maximum limit of 10 mock interviews reached. Please delete an existing interview card to create a new one.');
      return;
    }

    if (!jobTitle.trim() || !company.trim() || !jobDescription.trim()) {
      setCreatingError('Please fill in Job Title, Company, and Job Description.');
      return;
    }

    try {
      setIsSubmittingForm(true);
      const payload = {
        resumeId: selectedResume?._id || selectedResume?.id,
        jobDetails: {
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          role: role.trim(),
          jobDescription: jobDescription.trim()
        },
        configuration: {
          interviewType,
          difficulty,
          mode: interviewMode,
          questionCount: Number(questionCount)
        }
      };

      const res = await mockInterviewService.createWorkspace(payload);
      if (res && res.workspace) {
        const newW = res.workspace;
        setWorkspaces((prev) => [newW, ...prev.filter((w) => w._id !== newW._id)]);
        setSlotsAvailable(res.slotsAvailable ?? Math.max(0, 9 - workspaces.length));
        setJobTitle('');
        setCompany('');
        setRole('');
        setJobDescription('');
        setNewlyCreatedId(newW._id);
        hasUserToggledTabRef.current = true;
        setHubActiveTab('list');

        setTimeout(() => {
          setNewlyCreatedId(null);
        }, 7000);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
      const msg = err.response?.data?.message || 'Failed to create Mock Interview. Ensure all fields are valid.';
      setCreatingError(msg);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // EDIT WORKSPACE CARD
  const handleSaveEditWorkspace = async () => {
    if (!editingWorkspace) return;
    try {
      const res = await mockInterviewService.updateWorkspace(editingWorkspace._id, {
        jobDetails: editingWorkspace.jobDetails,
        configuration: editingWorkspace.configuration,
        resumeId: editingWorkspace.resumeId
      });

      if (res && res.workspace) {
        setWorkspaces((prev) => prev.map((w) => (w._id === res.workspace._id ? res.workspace : w)));
        setEditingWorkspace(null);
      }
    } catch (err) {
      console.error('Failed to update workspace:', err);
    }
  };

  // DELETE WORKSPACE CARD
  const handleConfirmDeleteWorkspace = async () => {
    if (!deletingWorkspace) return;
    try {
      const res = await mockInterviewService.deleteWorkspace(deletingWorkspace._id);
      if (res && res.success) {
        setWorkspaces((prev) => prev.filter((w) => w._id !== deletingWorkspace._id));
        setSlotsAvailable(res.slotsAvailable ?? Math.min(10, slotsAvailable + 1));
        setDeletingWorkspace(null);
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err);
    }
  };

  // ATTEND INTERVIEW (LAUNCH ATTEMPT)
  const handleAttendWorkspaceInterview = async (workspace) => {
    setActiveWorkspace(workspace);
    setFlowStep('generating');
    try {
      const res = await mockInterviewService.createAttemptForWorkspace(workspace._id);
      if (res && res.attempt) {
        setCurrentAttempt(res.attempt);
        setFlowStep('guidelines');
      }
    } catch (err) {
      console.error('Failed to launch attempt:', err);
      setFlowStep('hub');
    }
  };

  // ENTER FULLSCREEN INTERVIEW SESSION
  const handleEnterFullscreenSession = () => {
    if (!currentAttempt) return;

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request notice:', err);
      });
    }

    testStartTimeRef.current = Date.now();
    setSubmittedAnswers({});
    setCurrentQuestionIndex(0);
    setTestSecondsElapsed(0);
    setTabSwitchCount(0);
    setShowFullscreenExitModal(false);
    setShowTabSwitchWarning(false);
    setFlowStep('testing');
  };

  // Request Fullscreen re-entry
  const handleReenterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setShowFullscreenExitModal(false);
  };

  // Sync draft answer inputs & fresh voice session metrics when changing active question
  useEffect(() => {
    if (!currentAttempt || !currentAttempt.questions[currentQuestionIndex]) return;
    const qId = currentAttempt.questions[currentQuestionIndex].questionId || currentAttempt.questions[currentQuestionIndex]._id;
    const existing = submittedAnswers[qId];

    if (existing) {
      setDraftMcqOption(existing.selectedOption || '');
      setDraftTextAnswer(existing.textAnswer || '');
      const existingVoiceText = existing.voiceTranscript || '';
      setDraftVoiceTranscript(existingVoiceText);
      finalTranscriptRef.current = existingVoiceText;
      interimTranscriptRef.current = '';
      if (existing.voiceMetrics) {
        setVoiceMetrics(existing.voiceMetrics);
      }
      setAudioProcessingState(existingVoiceText ? 'recorded' : 'idle');
    } else {
      setDraftMcqOption('');
      setDraftTextAnswer('');
      setDraftVoiceTranscript('');
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setVoiceAudioUrl(null);
      setAudioProcessingState('idle');
      setVoiceMetrics({
        wordCount: 0,
        wpm: 0,
        fillerCount: 0,
        fillerRate: '0.0',
        pauseCount: 0,
        longestPauseSeconds: '0.0',
        speakingDurationSeconds: 0,
        silenceDurationSeconds: 0,
        fillerEvents: [],
        pauseEvents: []
      });
    }
  }, [currentQuestionIndex, currentAttempt, submittedAnswers]);

  // Save single question answer without forcing advance unless advance === true
  const saveCurrentQuestionAnswer = async (advance = false, overrideMcq = null, overrideText = null, overrideVoice = null) => {
    if (!currentAttempt || !currentAttempt.questions[currentQuestionIndex]) return;

    const currentQ = currentAttempt.questions[currentQuestionIndex];
    const qId = currentQ.questionId || currentQ._id || currentQ.id;
    const qType = (currentQ.category || currentQ.questionType || 'voice').toLowerCase();

    const mcqVal = overrideMcq !== null ? overrideMcq : draftMcqOption;
    const textVal = overrideText !== null ? overrideText : draftTextAnswer;
    const voiceVal = overrideVoice !== null ? overrideVoice : draftVoiceTranscript;

    let answerVal = '';
    if (qType === 'mcq') answerVal = mcqVal;
    else if (qType === 'voice') answerVal = voiceVal;
    else answerVal = textVal;

    if (!answerVal && !mcqVal && !textVal && !voiceVal) return;

    try {
      setSubmitting(true);
      await api.patch(`/mock-interviews/${currentAttempt._id}/questions/${qId}/answer`, {
        selectedOption: mcqVal,
        textAnswer: textVal,
        voiceTranscript: voiceVal,
        answer: answerVal,
        durationSeconds: voiceDuration || voiceMetrics.speakingDurationSeconds,
        voiceMetrics
      });

      setSubmittedAnswers((prev) => ({
        ...prev,
        [qId]: {
          selectedOption: mcqVal,
          textAnswer: textVal,
          voiceTranscript: voiceVal,
          answer: answerVal,
          voiceMetrics,
          submittedAt: new Date().toISOString()
        }
      }));

      if (advance && currentQuestionIndex + 1 < currentAttempt.questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Answer submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTestAnswer = async (e) => {
    if (e) e.preventDefault();
    await saveCurrentQuestionAnswer(true);
  };

  // Helper to determine accurate answered state for a question
  const getQuestionAnswerState = (q, idx) => {
    const targetQId = q.questionId || q._id || `q_${idx}`;
    const isCurrent = idx === currentQuestionIndex;
    const qType = (q.category || q.questionType || 'voice').toLowerCase();

    if (isCurrent) {
      if (qType === 'mcq' && draftMcqOption) return true;
      if (qType === 'text' && draftTextAnswer.trim()) return true;
      if (qType === 'voice' && draftVoiceTranscript.trim()) return true;
    }

    const ans = submittedAnswers[targetQId];
    if (!ans) return false;

    if (qType === 'mcq') return Boolean(ans.selectedOption || ans.answer);
    if (qType === 'text') return Boolean(ans.textAnswer?.trim() || (typeof ans.answer === 'string' && ans.answer.trim()));
    if (qType === 'voice') return Boolean(ans.voiceTranscript?.trim() || (typeof ans.answer === 'string' && ans.answer.trim()));
    return Boolean(ans.answer?.toString().trim());
  };

  // Helper to calculate statistics for summary dialog
  const calculateAssessmentStats = () => {
    if (!currentAttempt || !currentAttempt.questions) {
      return {
        overall: { total: 0, answered: 0, unanswered: 0 },
        mcq: { total: 0, answered: 0, unanswered: 0 },
        text: { total: 0, answered: 0, unanswered: 0 },
        voice: { total: 0, answered: 0, unanswered: 0 }
      };
    }

    const questions = currentAttempt.questions;
    let mcqTotal = 0, mcqAns = 0;
    let textTotal = 0, textAns = 0;
    let voiceTotal = 0, voiceAns = 0;

    questions.forEach((q, idx) => {
      const qType = (q.category || q.questionType || 'voice').toLowerCase();
      const isAns = getQuestionAnswerState(q, idx);

      if (qType === 'mcq') {
        mcqTotal++;
        if (isAns) mcqAns++;
      } else if (qType === 'text') {
        textTotal++;
        if (isAns) textAns++;
      } else if (qType === 'voice') {
        voiceTotal++;
        if (isAns) voiceAns++;
      } else {
        textTotal++;
        if (isAns) textAns++;
      }
    });

    const overallTotal = mcqTotal + textTotal + voiceTotal;
    const overallAns = mcqAns + textAns + voiceAns;

    return {
      overall: { total: overallTotal, answered: overallAns, unanswered: overallTotal - overallAns },
      mcq: { total: mcqTotal, answered: mcqAns, unanswered: mcqTotal - mcqAns },
      text: { total: textTotal, answered: textAns, unanswered: textTotal - textAns },
      voice: { total: voiceTotal, answered: voiceAns, unanswered: voiceTotal - voiceAns }
    };
  };

  // Flush and save active question answer before final submission
  const flushAndSaveCurrentAnswer = async () => {
    if (!currentAttempt || !currentAttempt.questions || !currentAttempt.questions[currentQuestionIndex]) return;

    const currentQ = currentAttempt.questions[currentQuestionIndex];
    const qId = currentQ.questionId || currentQ._id || currentQ.id;
    const qType = (currentQ.category || currentQ.questionType || 'voice').toLowerCase();

    let answerVal = '';
    if (qType === 'mcq') answerVal = draftMcqOption;
    else if (qType === 'voice') answerVal = draftVoiceTranscript;
    else answerVal = draftTextAnswer;

    if (answerVal && answerVal.trim()) {
      try {
        await api.patch(`/mock-interviews/${currentAttempt._id}/questions/${qId}/answer`, {
          selectedOption: draftMcqOption,
          textAnswer: draftTextAnswer,
          voiceTranscript: draftVoiceTranscript,
          answer: answerVal,
          durationSeconds: voiceDuration
        });

        setSubmittedAnswers((prev) => ({
          ...prev,
          [qId]: {
            selectedOption: draftMcqOption,
            textAnswer: draftTextAnswer,
            voiceTranscript: draftVoiceTranscript,
            answer: answerVal,
            submittedAt: new Date().toISOString()
          }
        }));
      } catch (err) {
        console.warn('Flush current answer failed:', err);
      }
    }
  };

  // Final Submit Handler
  const handleFinalSubmitAssessment = async () => {
    if (isSubmittingAttempt || !currentAttempt) return;

    setIsSubmittingAttempt(true);
    setSubmitError(null);

    try {
      // 1. Save active pending draft answer
      await flushAndSaveCurrentAnswer();

      // 2. Stop voice recording if active
      if (isRecording) {
        setIsRecording(false);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }

      // 3. Exit fullscreen
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // 4. API Request to complete attempt
      const res = await api.post(`/mock-interviews/${currentAttempt._id}/complete`);
      const completedDoc = res.data?.interview || currentAttempt;

      // 5. Reload workspace data
      await loadWorkspacesData();

      setShowFinalSubmitConfirmModal(false);
      setShowEndAssessmentModal(false);

      if (activeWorkspace) {
        handleOpenReview(activeWorkspace, completedDoc._id);
      } else if (onComplete) {
        onComplete(completedDoc);
      } else {
        setFlowStep('hub');
      }
    } catch (err) {
      console.error('Final submit assessment error:', err);
      setSubmitError(err.response?.data?.message || 'Unable to submit assessment. Your answers are still saved. Please try again.');
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  // Contextual Filler Word Detection
  const detectFillersInText = (text) => {
    if (!text || typeof text !== 'string') return [];
    const words = text.split(/\s+/);
    const events = [];

    words.forEach((w, idx) => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
      if (!cleanW) return;

      if (/^(um+|uh+|er+|hmm+|ah+)$/.test(cleanW)) {
        let norm = 'UM';
        if (cleanW.startsWith('hmm')) norm = 'HMM';
        else if (cleanW.startsWith('uh')) norm = 'UH';
        else if (cleanW.startsWith('er')) norm = 'ER';
        else if (cleanW.startsWith('ah')) norm = 'AH';

        events.push({
          word: w,
          normalizedWord: norm,
          index: idx,
          context: words.slice(Math.max(0, idx - 2), Math.min(words.length, idx + 3)).join(' ')
        });
      } else if (['basically', 'actually', 'you know', 'i mean', 'kind of', 'sort of'].includes(cleanW)) {
        const prev = words[idx - 1]?.toLowerCase() || '';
        const next = words[idx + 1]?.toLowerCase() || '';
        if (/^(um+|uh+|er+|hmm+|ah+|like|so)$/.test(prev) || /^(um+|uh+|er+|hmm+|ah+|like|so)$/.test(next) || idx === 0) {
          events.push({
            word: w,
            normalizedWord: cleanW.toUpperCase(),
            index: idx,
            context: words.slice(Math.max(0, idx - 2), Math.min(words.length, idx + 3)).join(' ')
          });
        }
      }
    });

    return events;
  };

  // Continuous Voice Recording & Analysis Handler
  const handleStartVoiceRecording = async () => {
    try {
      setVoiceError(null);
      audioChunksRef.current = [];
      finalTranscriptRef.current = draftVoiceTranscript || '';
      interimTranscriptRef.current = '';
      speakingTimeRef.current = 0;
      silenceTimeRef.current = 0;
      lastAudioTimestampRef.current = Date.now();
      silenceStartRef.current = null;
      pauseEventsRef.current = [];
      fillerEventsRef.current = [];
      setVoiceAudioUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // MediaRecorder for Playback
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceAudioUrl(url);
      };
      recorder.start(500);

      // Web Audio API Analyser for VAD & Reactive Waveform
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateAudioAnalysis = () => {
          if (!isRecordingRef.current) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length) / 255;

          const bars = [];
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i % dataArray.length] || 10;
            bars.push(Math.max(8, Math.round((val / 255) * 45)));
          }
          setWaveformData(bars);

          const now = Date.now();
          const dt = (now - lastAudioTimestampRef.current) / 1000;
          lastAudioTimestampRef.current = now;

          if (rms > 0.03) {
            setIsSpeaking(true);
            speakingTimeRef.current += dt;

            if (silenceStartRef.current) {
              const pauseDurationMs = now - silenceStartRef.current;
              if (pauseDurationMs >= 800) {
                let pauseType = 'natural_pause';
                if (pauseDurationMs >= 3000) pauseType = 'long_silence';
                else if (pauseDurationMs >= 1500) pauseType = 'significant_pause';

                pauseEventsRef.current.push({
                  startTime: Math.round(silenceStartRef.current / 1000),
                  endTime: Math.round(now / 1000),
                  durationMs: pauseDurationMs,
                  type: pauseType
                });
              }
              silenceStartRef.current = null;
            }
          } else {
            setIsSpeaking(false);
            silenceTimeRef.current += dt;
            if (!silenceStartRef.current) {
              silenceStartRef.current = now;
            }
          }

          animFrameRef.current = requestAnimationFrame(updateAudioAnalysis);
        };

        animFrameRef.current = requestAnimationFrame(updateAudioAnalysis);
      }

      // Continuous Non-Resetting SpeechRecognition Stream
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (evt) => {
          let newlyFinalText = '';
          let currentInterim = '';

          for (let i = evt.resultIndex; i < evt.results.length; i++) {
            const result = evt.results[i];
            const textChunk = result[0].transcript;
            if (result.isFinal) {
              newlyFinalText += textChunk + ' ';
            } else {
              currentInterim += textChunk;
            }
          }

          if (newlyFinalText) {
            finalTranscriptRef.current += newlyFinalText;
          }
          interimTranscriptRef.current = currentInterim;

          const displayTranscript = (finalTranscriptRef.current + ' ' + currentInterim).trim();
          setDraftVoiceTranscript(displayTranscript);

          // Update Real-time Voice Metrics
          const words = displayTranscript.split(/\s+/).filter(Boolean);
          const wordCount = words.length;
          const fillers = detectFillersInText(displayTranscript);
          fillerEventsRef.current = fillers;

          const spkSec = Math.max(1, Math.round(speakingTimeRef.current));
          const wpm = Math.round((wordCount / spkSec) * 60);

          const pauseEvts = pauseEventsRef.current;
          const longestP = pauseEvts.length > 0 ? (Math.max(...pauseEvts.map((p) => p.durationMs)) / 1000).toFixed(1) : '0.0';

          setVoiceMetrics({
            wordCount,
            wpm,
            fillerCount: fillers.length,
            fillerRate: wordCount > 0 ? ((fillers.length / wordCount) * 100).toFixed(1) : '0.0',
            pauseCount: pauseEvts.length,
            longestPauseSeconds: longestP,
            speakingDurationSeconds: Math.round(speakingTimeRef.current),
            silenceDurationSeconds: Math.round(silenceTimeRef.current),
            fillerEvents: fillers,
            pauseEvents: pauseEvts
          });
        };

        rec.onend = () => {
          if (isRecordingRef.current) {
            try {
              rec.start();
            } catch (e) {
              console.warn('SpeechRecognition restart notice:', e);
            }
          }
        };

        rec.start();
        recognitionRef.current = rec;
      }

      isRecordingRef.current = true;
      setIsRecording(true);
      setAudioProcessingState('recording');
      setVoiceDuration(0);
    } catch (err) {
      console.error('Mic access error:', err);
      setVoiceError('Microphone permission required for voice assessment.');
    }
  };

  const handleStopVoiceRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setAudioProcessingState('processing');

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setTimeout(() => {
      setAudioProcessingState('recorded');
      saveCurrentQuestionAnswer(false);
    }, 500);
  };

  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
      handleStopVoiceRecording();
    } else {
      await handleStartVoiceRecording();
    }
  };

  const handleConfirmRerecord = () => {
    setShowRerecordConfirmModal(false);
    setDraftVoiceTranscript('');
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setVoiceAudioUrl(null);
    setVoiceMetrics({
      wordCount: 0,
      wpm: 0,
      fillerCount: 0,
      fillerRate: '0.0',
      pauseCount: 0,
      longestPauseSeconds: '0.0',
      speakingDurationSeconds: 0,
      silenceDurationSeconds: 0,
      fillerEvents: [],
      pauseEvents: []
    });
    setAudioProcessingState('idle');
    handleStartVoiceRecording();
  };

  // Filtered Workspaces Grid
  const filteredWorkspaces = workspaces.filter((w) => {
    if (statusFilter !== 'all' && w.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = w.jobDetails.jobTitle.toLowerCase().includes(q);
      const matchComp = w.jobDetails.company.toLowerCase().includes(q);
      return matchTitle || matchComp;
    }
    return true;
  });

  const [prepStepIndex, setPrepStepIndex] = useState(0);

  // Hide Sidebar & Topbar Nav bar during active assessment / generation
  useEffect(() => {
    if (flowStep === 'generating' || flowStep === 'guidelines' || flowStep === 'testing') {
      document.body.classList.add('hide-nav-sidebar');
    } else {
      document.body.classList.remove('hide-nav-sidebar');
    }
    return () => {
      document.body.classList.remove('hide-nav-sidebar');
    };
  }, [flowStep]);

  // Dynamic step-by-step progress timer for generating flow
  useEffect(() => {
    if (flowStep !== 'generating') {
      setPrepStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setPrepStepIndex((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [flowStep]);

  const prepSteps = [
    {
      title: 'Parsing Candidate Resume & Profile',
      detail: 'Extracting key technical skills, experience level, and project keywords.',
      icon: FileText
    },
    {
      title: 'Evaluating Job Role & Competency Matrix',
      detail: `Matching target role (${activeWorkspace?.jobDetails?.jobTitle || jobTitle || 'Software Engineer'}) and difficulty (${activeWorkspace?.configuration?.difficulty || difficulty || 'Medium'}).`,
      icon: Target
    },
    {
      title: 'Generating Adaptive AI Question Bank',
      detail: 'Synthesizing MCQ, technical coding, open reasoning, and STAR behavioral scenarios.',
      icon: Bot
    },
    {
      title: 'Configuring Proctoring & Anti-Cheating Controls',
      detail: 'Setting up focus loss tracking, timer triggers, and audio speech recognition.',
      icon: ShieldCheck
    },
    {
      title: 'Finalizing CandidateIQ Session Workspace',
      detail: 'Initializing proctored Frame 8 room environment and real-time evaluator.',
      icon: Zap
    }
  ];

  const isLimitReached = workspaces.length >= 10;

  // RENDER: DETAILED STEP-BY-STEP GENERATING VIEW
  if (flowStep === 'generating') {
    const progressPercent = Math.min(100, Math.round(((prepStepIndex + 1) / 5) * 100));

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 select-none font-sans">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          {/* Top Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                CIQ
              </div>
              <div>
                <h2 className="text-lg font-bold font-outfit text-slate-900 leading-tight">
                  Preparing AI Mock Interview...
                </h2>
                <p className="text-xs text-slate-500">
                  {activeWorkspace?.jobDetails?.jobTitle || jobTitle || 'Software Engineer'} &bull; CandidateIQ Adaptive Engine
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-black text-indigo-600">{progressPercent}%</span>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Progress</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Step-by-Step Processing List */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Processing Pipeline & Environment Initialization
            </span>
            <div className="space-y-2.5">
              {prepSteps.map((stepItem, idx) => {
                const isDone = idx < prepStepIndex;
                const isCurrent = idx === prepStepIndex;

                let cardBorder = 'border-slate-100 bg-slate-50/50 text-slate-400';
                if (isDone) {
                  cardBorder = 'border-emerald-200 bg-emerald-50/60 text-slate-800';
                } else if (isCurrent) {
                  cardBorder = 'border-indigo-300 bg-indigo-50/80 text-slate-900 shadow-sm ring-1 ring-indigo-200';
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${cardBorder}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0"></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 bg-white text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                          0{idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold block ${isCurrent ? 'text-indigo-900' : isDone ? 'text-emerald-950' : 'text-slate-500'}`}>
                          Step 0{idx + 1}: {stepItem.title}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                            Completed
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 animate-pulse shrink-0">
                            Processing...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {stepItem.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Proctoring & Integrity Active
            </span>
            <span>CandidateIQ SafeGuard v2.4</span>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: PREPARATION & GUIDELINES VIEW
  if (flowStep === 'guidelines') {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8 select-none font-sans bg-white min-h-[600px] flex flex-col justify-center">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button onClick={() => setFlowStep('hub')} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to My Mock Interviews
          </button>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
            {activeWorkspace?.jobDetails?.jobTitle} • {activeWorkspace?.configuration?.difficulty}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-slate-900">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> CandidateIQ Fullscreen Environment
            </div>
            <h2 className="text-2xl font-black font-outfit text-slate-950">Enter Fullscreen Mock Interview</h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeWorkspace?.configuration?.questionCount || 10} Questions • 30 Minutes • {activeWorkspace?.configuration?.interviewType}
            </p>
          </div>

          <div className="space-y-3 text-xs font-semibold text-slate-700">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider block text-[10px]">Before you begin:</span>
              <ul className="space-y-1.5 text-slate-600 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Enable microphone permissions when prompted.</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Keep your browser window in Fullscreen mode during the session.</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Spoken voice answers will be transcribed and analyzed for technical depth.</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Tab switches and focus loss events are recorded for interview integrity.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="guidelinesCheck"
              checked={guidelinesChecked}
              onChange={(e) => setGuidelinesChecked(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="guidelinesCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
              I understand the guidelines and am ready to launch Fullscreen Mode.
            </label>
          </div>

          <button
            onClick={handleEnterFullscreenSession}
            disabled={!guidelinesChecked}
            className={`w-full py-4 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md ${
              guidelinesChecked
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Maximize className="w-4 h-4" /> Enter Fullscreen Interview
          </button>
        </div>
      </div>
    );
  }

  // RENDER: SIMPLE FOCUSED 3-COLUMN MOCK INTERVIEW ROOM (LIGHT THEME)
  if (flowStep === 'testing' && currentAttempt) {
    const questions = currentAttempt.questions || [];
    const currentQ = questions[currentQuestionIndex] || {};
    const qId = currentQ.questionId || currentQ._id || `q_${currentQuestionIndex}`;
    const qType = (currentQ.category || currentQ.questionType || 'voice').toLowerCase();

    // Dynamically calculated stats
    const stats = calculateAssessmentStats();
    const answeredCount = stats.overall.answered;
    const isCurrentAnswered = getQuestionAnswerState(currentQ, currentQuestionIndex);

    // Timer calculation based on mode total duration
    const totalDurationSeconds = (questionCount || 10) * 90;
    const secondsRemaining = Math.max(0, totalDurationSeconds - testSecondsElapsed);
    const minutesLeft = Math.floor(secondsRemaining / 60);
    const secondsLeft = secondsRemaining % 60;
    const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 bg-[#F7F9FC] text-slate-900 z-50 flex flex-col h-screen w-screen overflow-hidden font-sans select-none">
        
        {/* TOP INTERVIEW BAR (LIGHT THEME) */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#606beb] flex items-center justify-center text-white font-black font-outfit shadow-sm">
              <Sparkles className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-950 font-outfit">
                  {activeWorkspace?.jobDetails?.jobTitle || 'Mock Interview'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  &bull; {activeWorkspace?.jobDetails?.company || 'Target Role'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block -mt-0.5">
                CANDIDATE: {currentUser?.fullName || currentUser?.name || 'SAKTHI M'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <span className="px-2 py-0.5 rounded-md bg-[#F0F2FF] text-[#606beb] text-[10px] font-extrabold uppercase border border-indigo-100">
                {activeWorkspace?.configuration?.interviewType || 'TECHNICAL'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase border border-purple-100">
                {activeWorkspace?.configuration?.difficulty || 'MEDIUM'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                {activeWorkspace?.configuration?.mode || 'VOICE'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-indigo-700 text-xs font-mono font-bold">
              <Clock className="w-4 h-4 text-[#606beb] animate-pulse" />
              <span>{timeFormatted} remaining</span>
            </div>

            <button
              onClick={() => setShowEndAssessmentModal(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" /> End Assessment
            </button>
          </div>
        </header>

        {/* 3-COLUMN INTERVIEW ROOM BODY */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#F7F9FC]">
          
          {/* LEFT COLUMN: QUESTION NAVIGATION */}
          <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-950 font-outfit">QUESTIONS</h3>
                <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                  {answeredCount} / {questions.length} answered
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {questions.length - answeredCount} left
              </span>
            </div>

            {/* PREDICTABLE CSS GRID: 5 COLUMNS */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-5 gap-2 align-content-start">
              {questions.map((q, idx) => {
                const targetQId = q.questionId || q._id || `q_${idx}`;
                const isAnswered = getQuestionAnswerState(q, idx);
                const isCurrent = idx === currentQuestionIndex;
                const catType = (q.category || q.questionType || 'mcq').toLowerCase();

                let styleClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
                if (isCurrent) {
                  styleClass = 'bg-[#F0F2FF] border-2 border-[#606beb] text-[#606beb] font-black shadow-xs ring-1 ring-indigo-200';
                } else if (isAnswered) {
                  styleClass = 'bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold';
                }

                return (
                  <button
                    key={targetQId}
                    onClick={() => {
                      saveCurrentQuestionAnswer(false);
                      setCurrentQuestionIndex(idx);
                    }}
                    className={`aspect-square rounded-xl border text-xs font-mono transition flex flex-col items-center justify-center relative p-1 ${styleClass}`}
                  >
                    <span className="text-xs font-bold leading-none">{String(idx + 1).padStart(2, '0')}</span>
                    {isAnswered && !isCurrent && (
                      <span className="text-[10px] text-emerald-600 font-extrabold leading-none mt-0.5">✓</span>
                    )}
                    {catType && (
                      <span className="text-[7px] font-extrabold uppercase text-slate-400 absolute top-0.5 right-1 leading-none">
                        {catType === 'voice' ? 'VOI' : catType === 'text' ? 'TXT' : 'MCQ'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-600 space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#606beb]"></span> Current Question
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300"></span> Unanswered
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: QUESTION DISPLAY */}
          <main className="flex-1 bg-[#F7F9FC] p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-6 max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-50 text-[#606beb] border border-indigo-200">
                    {qType.toUpperCase()} &bull; {currentQ.sourceKeyword || currentQ.targetSkill || 'TECHNICAL'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {currentQ.difficulty || activeWorkspace?.configuration?.difficulty || 'Medium'}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  QUESTION {String(currentQuestionIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                </span>
              </div>

              {/* Question Text Card */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <h2 className="text-lg md:text-xl font-bold font-outfit text-slate-900 leading-relaxed">
                  {currentQ.questionText || currentQ.question}
                </h2>

                {currentQ.adaptiveReason && (
                  <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-900 leading-snug font-sans flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-700 block text-[10px] uppercase tracking-wider font-outfit">
                        🎯 CandidateIQ Adaptive Strategy Focus:
                      </span>
                      <p className="text-[#606beb] font-medium">{currentQ.adaptiveReason}</p>
                    </div>
                  </div>
                )}

                {currentQ.scenario && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-normal font-sans">
                    <span className="font-bold text-[#606beb] block mb-1 text-[10px] uppercase tracking-wider">Scenario Context:</span>
                    {currentQ.scenario}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status Notice */}
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between text-xs text-slate-500 font-medium pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> CandidateIQ Assessment Safeguard Active
              </span>
              {isCurrentAnswered ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Answer Saved
                </span>
              ) : (
                <span className="text-slate-400 font-medium">Unanswered</span>
              )}
            </div>
          </main>

          {/* RIGHT COLUMN: DYNAMIC ANSWER PANEL */}
          <aside className="w-80 md:w-96 shrink-0 bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto space-y-6 shadow-2xs">
            
            {/* MCQ ANSWER UI */}
            {qType === 'mcq' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-outfit">ANSWER OPTIONS</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">Single Choice</span>
                </div>

                <div className="space-y-3">
                  {(currentQ.options || []).map((opt, oIdx) => {
                    const optionId = typeof opt === 'object' ? opt.id : String.fromCharCode(65 + oIdx);
                    const optionText = typeof opt === 'object' ? opt.text : opt;
                    const isSelected = draftMcqOption === optionId || draftMcqOption === optionText;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => {
                          setDraftMcqOption(optionId);
                          saveCurrentQuestionAnswer(false, optionId);
                        }}
                        className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-2 border-[#606beb] text-slate-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#606beb] border-[#606beb] text-white'
                            : 'border-slate-300 bg-slate-50 text-slate-500'
                        }`}>
                          {optionId}
                        </div>
                        <span className="leading-relaxed flex-1 font-semibold text-slate-800">{optionText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEXT ANSWER UI */}
            {qType === 'text' && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-outfit">YOUR ANSWER</h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {draftTextAnswer.length} chars
                  </span>
                </div>

                <textarea
                  rows={10}
                  placeholder="Type your explanation or text answer here..."
                  value={draftTextAnswer}
                  onChange={(e) => {
                    setDraftTextAnswer(e.target.value);
                  }}
                  onBlur={() => {
                    saveCurrentQuestionAnswer(false);
                  }}
                  className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#606beb]/20 focus:border-[#606beb] resize-none font-sans"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Answer saved automatically</span>
                  {draftTextAnswer.trim() && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* VOICE ANSWER UI - ADVANCED VOICE INTELLIGENCE ENGINE */}
            {qType === 'voice' && (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-outfit">
                      SPOKEN VOICE RESPONSE
                    </h3>
                    {isRecording ? (
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        {isSpeaking ? '● Listening' : '○ Waiting for speech'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#606beb] font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        Voice Intelligence
                      </span>
                    )}
                  </div>

                  {/* HERO MICROPHONE & REACTIVE WAVEFORM */}
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-center space-y-4 shadow-2xs">
                    <div className="relative inline-block">
                      <button
                        onClick={handleToggleVoiceRecording}
                        disabled={audioProcessingState === 'processing'}
                        className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-md ${
                          isRecording
                            ? 'bg-rose-600 text-white ring-8 ring-rose-100 animate-pulse scale-105'
                            : audioProcessingState === 'recorded'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                            : 'bg-[#606beb] hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-105'
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="w-8 h-8" />
                        ) : audioProcessingState === 'recorded' ? (
                          <Check className="w-8 h-8" />
                        ) : (
                          <Mic className="w-8 h-8" />
                        )}
                      </button>
                    </div>

                    <div>
                      <span className="font-extrabold text-sm text-slate-900 block">
                        {isRecording
                          ? 'Recording Spoken Response...'
                          : audioProcessingState === 'processing'
                          ? 'Analyzing voice metrics...'
                          : draftVoiceTranscript
                          ? 'Response Recorded'
                          : 'Click Microphone to Start Recording'}
                      </span>

                      {isRecording && (
                        <span className="font-mono text-xs font-bold text-rose-600 mt-1 block">
                          Recording Time: {voiceDuration}s
                        </span>
                      )}
                    </div>

                    {/* AUTHENTIC REACTIVE LIVE AUDIO WAVEFORM (16 BARS) */}
                    {isRecording && (
                      <div className="flex items-center justify-center gap-1.5 h-12 pt-2 border-t border-slate-200/80">
                        {waveformData.map((heightVal, bIdx) => (
                          <div
                            key={bIdx}
                            className="w-1.5 rounded-full bg-[#606beb] transition-all duration-75"
                            style={{
                              height: `${heightVal}px`,
                              opacity: isSpeaking ? 0.9 : 0.45
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LIVE VOICE METRICS CARDS */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">WORDS</span>
                      <span className="text-sm font-black font-mono text-slate-900">{voiceMetrics.wordCount}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">WPM</span>
                      <span className="text-sm font-black font-mono text-indigo-700">{voiceMetrics.wpm}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">FILLERS</span>
                      <span className={`text-sm font-black font-mono ${voiceMetrics.fillerCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {voiceMetrics.fillerCount}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">PAUSES</span>
                      <span className="text-sm font-black font-mono text-purple-700">{voiceMetrics.pauseCount}</span>
                    </div>
                  </div>

                  {/* AUDIO RESPONSE PLAYER */}
                  {voiceAudioUrl && !isRecording && (
                    <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-900 uppercase block">Audio Response Recording:</span>
                      <audio src={voiceAudioUrl} controls className="w-full h-8 rounded-lg" />
                    </div>
                  )}

                  {/* LIVE ACCUMULATED TRANSCRIPT PREVIEW */}
                  {draftVoiceTranscript && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Live Transcript:</span>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Append-Only Stream
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-mono leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap p-2 bg-white rounded-xl border border-slate-200">
                        "{draftVoiceTranscript}"
                      </p>
                    </div>
                  )}

                  {voiceError && (
                    <p className="text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
                      {voiceError}
                    </p>
                  )}
                </div>

                {/* ACTIONS: RE-RECORD & SAVE */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {draftVoiceTranscript && !isRecording && (
                    <button
                      type="button"
                      onClick={() => setShowRerecordConfirmModal(true)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-record Response
                    </button>
                  )}

                  <button
                    onClick={() => saveCurrentQuestionAnswer(false)}
                    disabled={!draftVoiceTranscript.trim() || isRecording}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                      draftVoiceTranscript.trim() && !isRecording
                        ? 'bg-[#606beb] hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" /> Save Voice Answer
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <footer className="h-16 shrink-0 bg-white border-t border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => {
              saveCurrentQuestionAnswer(false);
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              currentQuestionIndex === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous Question
          </button>

          <span className="text-xs font-bold font-mono text-slate-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>

          {currentQuestionIndex + 1 < questions.length ? (
            <button
              onClick={() => {
                saveCurrentQuestionAnswer(false);
                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
              }}
              className="px-5 py-2 bg-[#606beb] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                saveCurrentQuestionAnswer(false);
                setShowEndAssessmentModal(true);
              }}
              className="px-6 py-2 bg-[#606beb] hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" /> End Assessment
            </button>
          )}
        </footer>

        {/* MODAL 1: END ASSESSMENT SUMMARY DIALOG */}
        {showEndAssessmentModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[60] select-none font-sans">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 border border-slate-200 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-outfit text-slate-950">End Assessment?</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    You are about to finish this mock interview. Review your progress before submitting.
                  </p>
                </div>
                <button
                  onClick={() => setShowEndAssessmentModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {/* OVERALL STATISTICS */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-extrabold uppercase text-slate-900 font-outfit tracking-wider block">
                    OVERALL PROGRESS
                  </span>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Questions</span>
                      <span className="text-xl font-black font-outfit text-slate-900">{stats.overall.total}</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Answered</span>
                      <span className="text-xl font-black font-outfit text-emerald-700">{stats.overall.answered}</span>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">Not Attended</span>
                      <span className="text-xl font-black font-outfit text-amber-700">{stats.overall.unanswered}</span>
                    </div>
                  </div>
                </div>

                {/* BREAKDOWN BY QUESTION TYPES */}
                <div className="space-y-3">
                  {stats.mcq.total > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase">MCQ Questions</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {stats.mcq.total} total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="text-slate-600">Answered</span>
                          <span className="font-bold text-emerald-700">{stats.mcq.answered}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="text-slate-600">Not Attended</span>
                          <span className="font-bold text-amber-700">{stats.mcq.unanswered}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.text.total > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase">TEXT Questions</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {stats.text.total} total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="text-slate-600">Answered</span>
                          <span className="font-bold text-emerald-700">{stats.text.answered}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="text-slate-600">Not Attended</span>
                          <span className="font-bold text-amber-700">{stats.text.unanswered}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.voice.total > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase">VOICE Questions</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {stats.voice.total} total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="text-slate-600">Answered</span>
                          <span className="font-bold text-emerald-700">{stats.voice.answered}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="text-slate-600">Not Attended</span>
                          <span className="font-bold text-amber-700">{stats.voice.unanswered}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setShowEndAssessmentModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Continue Assessment
                </button>

                <button
                  onClick={() => {
                    setShowEndAssessmentModal(false);
                    setShowFinalSubmitConfirmModal(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#606beb] hover:bg-indigo-700 text-white text-xs font-extrabold transition shadow-md flex items-center gap-2"
                >
                  Finish Test <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: FINAL SUBMISSION CONFIRMATION */}
        {showFinalSubmitConfirmModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[70] select-none font-sans">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 border border-slate-200 shadow-2xl text-slate-900 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#606beb] border border-indigo-200 mx-auto flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-950">Submit Mock Assessment?</h3>
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                  You have answered <strong className="text-slate-900">{stats.overall.answered}</strong> of <strong className="text-slate-900">{stats.overall.total}</strong> questions.
                </p>

                {stats.overall.unanswered > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold">
                    ⚠️ {stats.overall.unanswered} question(s) will remain unanswered.
                  </div>
                )}

                <p className="text-[11px] text-slate-400 mt-3">
                  Once submitted, your answers cannot be changed and AI evaluation will be calculated immediately.
                </p>
              </div>

              {submitError && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-rose-800 text-xs font-semibold text-left space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> Submission Failed
                  </div>
                  <p>{submitError}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowFinalSubmitConfirmModal(false);
                    setShowEndAssessmentModal(true);
                  }}
                  disabled={isSubmittingAttempt}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Go Back
                </button>

                <button
                  onClick={handleFinalSubmitAssessment}
                  disabled={isSubmittingAttempt}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                    isSubmittingAttempt
                      ? 'bg-indigo-400 text-white cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSubmittingAttempt ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : submitError ? (
                    'Retry Submission'
                  ) : (
                    'Submit Test'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RE-RECORD CONFIRMATION */}
        {showRerecordConfirmModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[75] select-none font-sans">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl text-center text-slate-900">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-950">Replace this response?</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Your current voice recording, audio file, transcript, and voice analytics will be replaced.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowRerecordConfirmModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Keep Response
                </button>
                <button
                  onClick={handleConfirmRerecord}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Re-record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RECORDING IN PROGRESS SAFETY WARNING */}
        {showNavDuringRecordModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[80] select-none font-sans">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl text-center text-slate-900">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-950">Recording in Progress</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Your current spoken voice response is still being recorded. What would you like to do?
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setShowNavDuringRecordModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#606beb] text-white text-xs font-bold transition shadow-xs"
                >
                  Continue Recording
                </button>
                <button
                  onClick={() => {
                    handleStopVoiceRecording();
                    setShowNavDuringRecordModal(false);
                    if (pendingNavIndex !== null) {
                      setCurrentQuestionIndex(pendingNavIndex);
                      setPendingNavIndex(null);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold transition shadow-xs"
                >
                  Stop & Save Current Answer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER: MOCK INTERVIEW REVIEW WORKSPACE (ATS-STYLE EVALUATION)
  if (flowStep === 'review') {
    const currentAttemptObj = reviewAttempts[activeAttemptIndex] || null;
    const reviewData = computeReviewData(selectedReviewWorkspace, currentAttemptObj);

    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 select-none font-sans bg-[#F7F9FC] min-h-screen min-w-0 box-border overflow-x-hidden">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <button
              onClick={() => setFlowStep('hub')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to My Mock Interviews
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                {selectedReviewWorkspace?.configuration?.interviewType || 'Technical'} • {selectedReviewWorkspace?.configuration?.difficulty || 'Medium'} • {selectedReviewWorkspace?.configuration?.mode || 'Voice'}
              </span>
              <span className="text-xs font-bold text-slate-400">&bull;</span>
              <span className="text-xs font-bold text-slate-600">
                {selectedReviewWorkspace?.jobDetails?.company || 'Target Role'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-outfit text-slate-950 tracking-tight">
              MOCK INTERVIEW REVIEW
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              {selectedReviewWorkspace?.jobDetails?.jobTitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Attempt Selector Dropdown */}
            {reviewAttempts.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Attempt:</span>
                <select
                  value={activeAttemptIndex}
                  onChange={(e) => setActiveAttemptIndex(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  {reviewAttempts.map((att, aIdx) => (
                    <option key={att._id} value={aIdx}>
                      Attempt #{reviewAttempts.length - aIdx} {aIdx === 0 ? '(Latest)' : ''} &bull; {new Date(att.completedAt || att.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => handleAttendWorkspaceInterview(selectedReviewWorkspace)}
              className="px-4 py-2.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Play className="w-4 h-4 fill-indigo-600" /> Attend Again
            </button>

            <button
              onClick={() => setFlowStep('solutions')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              View Improvement Plan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loadingReview ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-bold text-slate-900 text-base">Analyzing Mock Interview Performance...</h3>
            <p className="text-xs text-slate-500">Extracting structured evidence, section scores, and actionable recommendations.</p>
          </div>
        ) : !reviewData ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No Attempt Evaluation Found</h3>
            <p className="text-xs text-slate-500">Attend an interview attempt for this mock interview workspace to view detailed AI feedback.</p>
            <button
              onClick={() => handleAttendWorkspaceInterview(selectedReviewWorkspace)}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" /> Attend Interview
            </button>
          </div>
        ) : (
          <>
            {/* ADAPTIVE RE-INTERVIEW REASSESSMENT & VERIFICATION BANNER */}
            {currentAttemptObj?.adaptiveContext?.isAdaptive && (
              <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-3xl p-6 border border-indigo-800 text-white space-y-4 shadow-xl">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-indigo-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-outfit">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Adaptive Re-Interview Verified
                    </span>
                    <span className="text-xs text-indigo-300 font-mono font-bold">
                      Targeted Evidence Assessment (Attempt #{reviewAttempts.length - activeAttemptIndex})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Engine Version: {currentAttemptObj.adaptiveContext.algorithmVersion || '2.4-adaptive'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-3.5 rounded-2xl bg-indigo-900/50 border border-indigo-700/60 space-y-1">
                    <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block font-outfit">Adaptive Strategy</span>
                    <p className="text-slate-200 font-medium">
                      Generated from previous attempt weaknesses, activity progress & competency gaps.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-900/50 border border-indigo-700/60 space-y-1">
                    <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block font-outfit">Targeted Competencies</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {(currentAttemptObj.adaptiveContext.targetWeaknesses || []).map((w, wIdx) => (
                        <span key={wIdx} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono text-[10px] font-bold border border-emerald-500/30">
                          {w.section?.toUpperCase()} ({w.priority})
                        </span>
                      ))}
                    </div>
                  </div>

                  {currentAttemptObj.evaluation?.reassessmentResults && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 space-y-1">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block font-outfit">Reassessment Verification</span>
                      <p className="text-emerald-300 font-extrabold text-sm font-outfit">
                        Score Delta: {currentAttemptObj.evaluation.reassessmentResults.overallDelta >= 0 ? `+${currentAttemptObj.evaluation.reassessmentResults.overallDelta}` : currentAttemptObj.evaluation.reassessmentResults.overallDelta} pts
                      </p>
                      <span className="text-[11px] text-slate-300 font-medium block">
                        {currentAttemptObj.evaluation.reassessmentResults.verifiedActivities?.length || 0} Practice Activity(ies) Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ATS-STYLE HERO PERFORMANCE CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-6">
                  {/* Large Score Circular Display */}
                  <div className="w-24 h-24 rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                    <span className="text-3xl font-black font-outfit text-indigo-700 leading-none">
                      {reviewData.overallScore}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 mt-1">/ 100</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${reviewData.scoreStatus.badge}`}>
                        {reviewData.scoreStatus.status} PERFORMANCE
                      </span>
                      <span className="text-xs font-mono text-slate-400">CandidateIQ v2.4</span>
                    </div>
                    <h2 className="text-xl font-bold font-outfit text-slate-950">
                      Mock Interview Performance Report
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                      Evaluated across {reviewData.questionDetails.length} technical scenarios using evidence extraction and weighted criteria scoring.
                    </p>
                  </div>
                </div>

                {/* Score Progress Overview Bars */}
                <div className="w-full md:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">KEY PROFICIENCY BARS</span>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-1">
                        <span>Technical Knowledge</span>
                        <span>{reviewData.sections.technicalKnowledge.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${reviewData.sections.technicalKnowledge.score}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-1">
                        <span>Problem Solving</span>
                        <span>{reviewData.sections.problemSolving.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${reviewData.sections.problemSolving.score}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-1">
                        <span>Communication</span>
                        <span>{reviewData.sections.communication.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${reviewData.sections.communication.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8-SECTION SCORE GRID */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block font-outfit">
                  PERFORMANCE BREAKDOWN BY SECTION
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(reviewData.sections).map((sec, idx) => {
                    const statusInfo = getScoreStatus(sec.score);
                    return (
                      <div key={idx} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate pr-2">{sec.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${statusInfo.badge}`}>
                            {sec.score}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2">
                          {sec.description}
                        </p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${sec.score >= 80 ? 'bg-emerald-500' : sec.score >= 65 ? 'bg-indigo-600' : 'bg-amber-500'}`} style={{ width: `${sec.score}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MULTI-ATTEMPT CONSISTENCY ANALYTICS CARD (ACROSS ALL ATTEMPTS OF SAME MOCK INTERVIEW) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* MOCK INTERVIEW PERFORMANCE GRAPH (Competency Progress Waves Style) */}
              <MockInterviewPerformanceGraph
                data={(consistencyData?.attempts || []).map(a => ({
                  attemptId: a.attemptId,
                  attemptNumber: a.attemptNumber,
                  attemptLabel: `Attempt ${a.attemptNumber}`,
                  completedAt: a.completedAt,
                  isCurrentAttempt: a.isCurrentAttempt,
                  overallScore: a.overallScore ?? null,
                  technical_knowledge: a.sections?.technical_knowledge ?? a.sections?.technical ?? null,
                  answer_quality: a.sections?.answer_quality ?? a.sections?.behavioural ?? null,
                  communication: a.sections?.communication ?? null,
                  problem_solving: a.sections?.problem_solving ?? a.sections?.reasoning ?? null,
                  concept_explanation: a.sections?.concept_explanation ?? null,
                  fluency_pacing: a.sections?.fluency_pacing ?? a.sections?.voice ?? null,
                  answer_structure: a.sections?.answer_structure ?? null,
                  conciseness: a.sections?.conciseness ?? null
                }))}
                onPointClick={(payload) => {
                  if (payload?.attemptId) {
                    const foundIdx = reviewAttempts.findIndex(att => String(att._id) === String(payload.attemptId));
                    if (foundIdx >= 0) setActiveAttemptIndex(foundIdx);
                  }
                }}
              />

                  {/* SECTION HIGHLIGHTS / ANALYTICS CALLOUT CARDS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {consistencyData?.bestSection && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Best Performing Section</span>
                        <span className="text-base font-black font-outfit text-emerald-900">
                          {SECTION_LABELS[consistencyData.bestSection.section] || consistencyData.bestSection.section} ({consistencyData.bestSection.score})
                        </span>
                      </div>
                    )}

                    {consistencyData?.mostImprovedSection && (
                      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Most Improved Section</span>
                        <span className="text-base font-black font-outfit text-indigo-900">
                          {SECTION_LABELS[consistencyData.mostImprovedSection.section] || consistencyData.mostImprovedSection.section} (+{consistencyData.mostImprovedSection.improvement} pts)
                        </span>
                      </div>
                    )}

                    {consistencyData?.lowestSection && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Needs Practice Section</span>
                        <span className="text-base font-black font-outfit text-amber-900">
                          {SECTION_LABELS[consistencyData.lowestSection.section] || consistencyData.lowestSection.section} ({consistencyData.lowestSection.score})
                        </span>
                      </div>
                    )}

                    {consistencyData?.mostInconsistentSection && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Most Inconsistent Section</span>
                        <span className="text-base font-black font-outfit text-rose-900">
                          {SECTION_LABELS[consistencyData.mostInconsistentSection.section] || consistencyData.mostInconsistentSection.section} (±{consistencyData.mostInconsistentSection.variance} var)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ATTEMPT COMPARISON TABLE BELOW GRAPH */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider">
                        Attempt-by-Attempt Scores Comparison
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {consistencyData?.attempts?.length} Attempts Completed
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-slate-50 border-b border-slate-200 font-outfit text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">Attempt</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-center">Overall</th>
                            {(consistencyData?.sections || []).filter(s => s !== 'overall').map(s => (
                              <th key={s} className="p-3 text-center">{SECTION_LABELS[s] || s}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(consistencyData?.attempts || []).map((att) => {
                            const isCurrent = att.isCurrentAttempt || (reviewAttempts[activeAttemptIndex]?._id === att.attemptId);
                            return (
                              <tr key={att.attemptId} className={`transition-colors ${isCurrent ? 'bg-indigo-50/70 font-bold' : 'hover:bg-slate-50'}`}>
                                <td className="p-3 flex items-center gap-2">
                                  <span className="font-outfit text-slate-900 font-extrabold">Attempt #{att.attemptNumber}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                                      Current
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-500 font-mono text-[11px]">
                                  {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : '—'}
                                </td>
                                <td className="p-3 text-center font-mono font-extrabold text-indigo-700 text-sm">
                                  {att.overallScore}
                                </td>
                                {(consistencyData?.sections || []).filter(s => s !== 'overall').map(s => {
                                  const val = att.sections?.[s];
                                  const meta = att.sectionsMeta?.[s] || {};
                                  const delta = meta.delta || 0;
                                  return (
                                    <td key={s} className="p-3 text-center font-mono">
                                      {val !== undefined ? (
                                        <span>
                                          {val} {delta !== 0 && (
                                            <span className={`text-[10px] ml-0.5 font-bold ${delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                              ({delta > 0 ? `+${delta}` : delta})
                                            </span>
                                          )}
                                        </span>
                                      ) : '—'}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* REPEATED WEAKNESSES / SUSTAINED IMPROVEMENTS CARDS */}
                  {((consistencyData?.repeatedWeaknesses?.length > 0) || (consistencyData?.sustainedImprovements?.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {consistencyData?.repeatedWeaknesses?.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                          <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block flex items-center gap-1 font-outfit">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Detected Repeated Weakness Across Attempts
                          </span>
                          {consistencyData.repeatedWeaknesses.map((rw, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200/80 space-y-1">
                              <span className="font-bold text-slate-900 uppercase text-[10px]">{rw.section} &bull; Recurrence: {rw.recurrenceCount} attempts</span>
                              <p className="text-slate-700">{rw.issue}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {consistencyData?.sustainedImprovements?.length > 0 && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                          <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider block flex items-center gap-1 font-outfit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sustained Improvement Milestones
                          </span>
                          {consistencyData.sustainedImprovements.map((si, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-white border border-emerald-200/80 space-y-1">
                              <span className="font-bold text-slate-900 uppercase text-[10px]">{si.section} &bull; Improvement: +{si.netImprovement} pts</span>
                              <p className="text-slate-700">{si.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
            </div>

            {/* STRENGTHS VS AREAS TO IMPROVE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> YOUR DEMONSTRATED STRENGTHS
                </div>
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-950 block">✓ Solid Technical Fundamentals</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Accurately defined core technical concepts and demonstrated correct architectural reasoning across evaluated scenarios.
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-950 block">✓ Relevant Question Addressing</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Answers directly addressed the prompt objective without introducing off-topic background details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Areas to Improve Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> AREAS NEEDING IMPROVEMENT
                </div>
                <div className="space-y-3">
                  {reviewData.solutions.slice(0, 2).map((sol, sIdx) => (
                    <div key={sIdx} className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 block">0{sIdx + 1}. {sol.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-200 text-amber-900">
                          Score: {sol.score}/100
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {sol.problem}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-500 max-w-full">
                        <span className="font-bold text-slate-600">Evidence:</span>
                        {sol.evidence.map((ev, eIdx) => {
                          const match = String(ev).match(/Q?(\d+)/i);
                          const qNum = match ? parseInt(match[1], 10) - 1 : eIdx;
                          return (
                            <button
                              type="button"
                              key={eIdx}
                              onClick={() => {
                                if (qNum >= 0 && qNum < reviewData.questionDetails.length) {
                                  setExpandedQuestionIndex(qNum);
                                  const el = document.getElementById(`q_analysis_${qNum}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }
                              }}
                              className="bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700 text-[10px] shadow-2xs flex items-center justify-center cursor-pointer"
                              title={`Click to view Question ${qNum + 1}`}
                            >
                              {ev}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* VOICE INTELLIGENCE ANALYTICS CARD (If voice questions present) */}
            {reviewData.voiceAnalytics.hasVoice && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider font-outfit">
                    <Mic className="w-4 h-4 text-indigo-600" /> VOICE INTELLIGENCE ANALYTICS
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Real-time Audio Signals
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SPEAKING RATE</span>
                    <span className="text-xl font-black font-mono text-indigo-700">{reviewData.voiceAnalytics.avgWpm} WPM</span>
                    <span className="text-[9px] text-slate-500 block font-semibold">Optimal: 130–160 WPM</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">TOTAL FILLERS</span>
                    <span className={`text-xl font-black font-mono ${reviewData.voiceAnalytics.totalFillers > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {reviewData.voiceAnalytics.totalFillers}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-semibold">{reviewData.voiceAnalytics.fillerRate}% filler rate</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">PAUSES</span>
                    <span className="text-xl font-black font-mono text-purple-700">{reviewData.voiceAnalytics.totalPauses}</span>
                    <span className="text-[9px] text-slate-500 block font-semibold">Natural breaks</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SPEAKING TIME</span>
                    <span className="text-xl font-black font-mono text-slate-900">{reviewData.voiceAnalytics.totalSpeakingSec}s</span>
                    <span className="text-[9px] text-slate-500 block font-semibold">Total active speech</span>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-xs text-slate-700 font-medium leading-relaxed">
                  <span className="font-bold text-indigo-900 block mb-0.5">Voice Recommendation:</span>
                  Your speaking pace is appropriate, but filler word frequency increases when transitioning between complex concepts. Replace vocalized fillers ("umm", "hmm") with a deliberate 1 to 2 second silent pause.
                </div>
              </div>
            )}

            {/* QUESTION-BY-QUESTION ANALYSIS ACCORDION */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-outfit text-slate-950">QUESTION-BY-QUESTION ANALYSIS</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review candidate answers, scores, missing concepts, and evidence.</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {reviewData.questionDetails.length} Questions Evaluated
                </span>
              </div>

              <div className="space-y-4">
                {reviewData.questionDetails.map((qd, qIdx) => {
                  const isExpanded = expandedQuestionIndex === qIdx;
                  return (
                    <div key={qd.qId} id={`q_analysis_${qIdx}`} className="border border-slate-200 rounded-2xl overflow-hidden bg-white transition shadow-2xs">
                      <div
                        onClick={() => setExpandedQuestionIndex(isExpanded ? null : qIdx)}
                        className="p-4 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between gap-4 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-mono font-black text-xs text-slate-800 shrink-0">
                            0{qIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-950 block truncate font-outfit">
                              {qd.qText}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase">
                              {qd.qType.toUpperCase()} &bull; {qd.topic}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${qd.score >= 80 ? 'bg-emerald-100 text-emerald-800' : qd.score >= 60 ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                            {qd.score} / 100
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 border-t border-slate-200 space-y-4 bg-white text-xs text-slate-800">
                          <div>
                            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">CANDIDATE RESPONSE:</span>
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">
                              "{qd.userAns || 'No answer recorded for this question.'}"
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                              <span className="font-bold text-emerald-900 block text-[11px]">Evaluation & Feedback:</span>
                              <p className="text-slate-700 text-[11px] leading-relaxed">{qd.feedback}</p>
                            </div>

                            {qd.missingConcepts.length > 0 && (
                              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                                <span className="font-bold text-amber-900 block text-[11px]">Missing Concepts:</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {qd.missingConcepts.map((mc, mIdx) => (
                                    <span key={mIdx} className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-amber-950 border border-amber-300">
                                      • {mc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM ACTION CTA BANNER */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-3xl p-8 border border-indigo-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                  CandidateIQ Actionable Engine
                </span>
                <h3 className="text-2xl font-black font-outfit">Ready to work on your weaknesses?</h3>
                <p className="text-xs text-indigo-100 font-medium mt-1 max-w-xl">
                  Convert these interview insights into a prioritized step-by-step improvement plan with targeted practice scenarios.
                </p>
              </div>

              <button
                onClick={() => setFlowStep('solutions')}
                className="px-6 py-3 bg-white hover:bg-indigo-50 text-indigo-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 shrink-0"
              >
                VIEW ACTIONABLE IMPROVEMENT PLAN <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // RENDER: ACTIONABLE IMPROVEMENT PLAN VIEW
  if (flowStep === 'solutions') {
    const currentAttemptObj = reviewAttempts[activeAttemptIndex] || null;
    const reviewData = computeReviewData(selectedReviewWorkspace, currentAttemptObj);

    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 select-none font-sans bg-[#F7F9FC] min-h-screen min-w-0 box-border overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <button
              onClick={() => setFlowStep('review')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Performance Review
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                Actionable AI Solutions
              </span>
              <span className="text-xs font-bold text-slate-600">
                {selectedReviewWorkspace?.jobDetails?.jobTitle} &bull; {selectedReviewWorkspace?.jobDetails?.company}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-outfit text-slate-950 tracking-tight">
              ACTIONABLE IMPROVEMENT PLAN
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Prioritized practice steps calculated from your actual interview evidence.
            </p>
          </div>

          <button
            onClick={() => setFlowStep('hub')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> My Mock Interviews
          </button>
        </div>

        {!reviewData || reviewData.solutions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No Major Weaknesses Found!</h3>
            <p className="text-xs text-slate-500">Your mock interview performance scored strong across all evaluated criteria.</p>
            <button
              onClick={() => setFlowStep('review')}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Back to Review
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* PRIORITIZED SOLUTIONS LIST */}
            {reviewData.solutions.map((sol, idx) => {
              const currentStatus = solutionStatuses[sol.id] || sol.status;
              let prioBadge = 'bg-rose-100 text-rose-800 border-rose-300';
              if (sol.priority === 'MEDIUM') prioBadge = 'bg-amber-100 text-amber-800 border-amber-300';
              else if (sol.priority === 'LOW') prioBadge = 'bg-slate-100 text-slate-700 border-slate-300';

              return (
                <div key={sol.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xs space-y-6">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-black text-sm flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${prioBadge}`}>
                            {sol.priority} PRIORITY
                          </span>
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            Priority Score: {sol.priorityScore}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold font-outfit text-slate-950 mt-0.5">
                          {sol.title} ({sol.section})
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSolutionStatus(sol.id)}
                        className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition shadow-2xs flex items-center gap-1.5 ${
                          currentStatus === 'COMPLETED'
                            ? 'bg-emerald-600 text-white'
                            : currentStatus === 'IN_PROGRESS'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {currentStatus === 'COMPLETED' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Completed ✓
                          </>
                        ) : currentStatus === 'IN_PROGRESS' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> In Progress
                          </>
                        ) : (
                          'Mark as In Progress'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Problem & Impact Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Problem & Evidence:</span>
                      <p className="text-slate-700 leading-relaxed">{sol.problem}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-500 max-w-full">
                        <span className="font-bold text-slate-600">Affected Questions:</span>
                        {sol.evidence.map((ev, eIdx) => (
                          <span key={eIdx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-indigo-700 shadow-2xs">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Interview Impact:</span>
                      <p className="text-slate-700 leading-relaxed">{sol.impact}</p>
                    </div>
                  </div>

                  {/* Solution & Practice Checklist */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-xs text-indigo-950 font-semibold space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 block">Recommended Solution Framework:</span>
                      <p className="leading-relaxed">{sol.solution}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-outfit">
                        PRACTICE TASKS CHECKLIST:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {sol.practiceTasks.map((task, tIdx) => (
                          <div key={tIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 font-medium text-slate-800">
                            <Square className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold pt-2">
                      <span>Target Criteria: <strong className="text-slate-900">{sol.target}</strong></span>
                      <span className="text-[11px] text-slate-400 font-mono">Solution ID: {sol.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // DEFAULT MAIN HUB VIEW (/mock-interview)
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 space-y-6 select-none font-sans">
      
      {/* Header Banner & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" /> CandidateIQ Personal Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-950 tracking-tight">
            AI Mock Interview Hub
          </h1>
          <p className="text-slate-600 text-xs font-medium mt-0.5">
            Practice interviews tailored to your resume and exact target role requirements.
          </p>
        </div>

        {/* Top-Right Tab Control & Limit Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-2xs">
            {/* <button
              type="button"
              onClick={() => {
                hasUserToggledTabRef.current = true;
                setHubActiveTab('create');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                hubActiveTab === 'create'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" /> Create Mock Interview
            </button> */}

            <button
              type="button"
              onClick={() => {
                hasUserToggledTabRef.current = true;
                setHubActiveTab('list');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                hubActiveTab === 'list'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" /> My Mock Interviews
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isLimitReached ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {workspaces.length} / 10
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: CREATE MOCK INTERVIEW COMPACT WORKSPACE */}
      {hubActiveTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-outfit text-slate-950">CREATE MOCK INTERVIEW</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up a compact, personalized mock interview workspace based on your target role.
              </p>
            </div>
            {workspaces.length > 0 && (
              <button
                onClick={() => {
                  hasUserToggledTabRef.current = true;
                  setHubActiveTab('list');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Existing Interviews ({workspaces.length}) <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {isLimitReached && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-900 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block">Mock Interview Limit Reached (10 / 10)</span>
                You have reached your maximum limit of 10 active interview cards. Switch to "My Mock Interviews" and delete an existing card to release a slot.
              </div>
            </div>
          )}

          {creatingError && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              {creatingError}
            </div>
          )}

          <form onSubmit={handleCreateWorkspaceCard} className="space-y-6">
            {/* Responsive 2-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Resume Selection (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50/60 p-5 rounded-3xl border border-slate-200/80 flex flex-col justify-between">
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                    1. Resume Selection *
                  </label>

                  <div className="space-y-2.5">
                    <label className="w-full border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 rounded-2xl p-3 text-left cursor-pointer transition flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block leading-snug">Upload New Resume</span>
                        <span className="text-[10px] text-slate-400 font-medium block">PDF, DOC, DOCX</span>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={handleImportProfileResume}
                      className="w-full border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50 rounded-2xl p-3 text-left transition flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block leading-snug">Import from Profile</span>
                        <span className="text-[10px] text-slate-400 font-medium block">Use primary profile resume</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowResumeHistoryModal(true)}
                      className="w-full border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50 rounded-2xl p-3 text-left transition flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <History className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block leading-snug">Choose from History</span>
                        <span className="text-[10px] text-slate-400 font-medium block">Select past resume uploads</span>
                      </div>
                    </button>
                  </div>
                </div>

                {selectedResume && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between text-xs mt-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs truncate block">{selectedResume.originalName || selectedResume.fileName || 'Resume.pdf'}</span>
                        <span className="text-[10px] text-indigo-700 font-semibold block">Active Selected Resume</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Target Role & Job Details (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  2. Target Role & Job Details *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Job Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Full Stack Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Company *</label>
                    <input
                      type="text"
                      placeholder="e.g. TechNova Systems"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Role Type (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Full-Time / Remote / Senior Level"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Job Description *</label>
                  <textarea
                    placeholder="Paste the target job description here (technical requirements, responsibilities, stack)..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Interview Preferences */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                3. Interview Preferences
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Interview Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Project">Project</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mode</label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Voice">Voice</option>
                    <option value="Text">Text</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLimitReached || isSubmittingForm}
              className={`w-full py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md ${
                isLimitReached
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isSubmittingForm
                  ? 'bg-indigo-400 text-white cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSubmittingForm ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Mock Interview Workspace...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create Mock Interview Workspace
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: MY MOCK INTERVIEWS LIST */}
      {hubActiveTab === 'list' && (
        <div className="space-y-6">
          {/* Header & Search Bar for My Mock Interviews */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-outfit text-slate-950 tracking-tight">
                  MY MOCK INTERVIEWS
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {workspaces.length} / 10
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Your persistent mock interview workspaces. Re-attempting an interview updates the card without creating duplicates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search mock interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              <button
                onClick={() => {
                  hasUserToggledTabRef.current = true;
                  setHubActiveTab('create');
                }}
                disabled={isLimitReached}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  isLimitReached
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> New Interview
              </button>
            </div>
          </div>

          {/* Success Highlight Banner when newly created */}
          {newlyCreatedId && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between text-emerald-900 text-xs font-semibold animate-pulse">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Mock Interview Workspace Created Successfully!</span>
                  Your new interview card is highlighted below. Click "Attend Interview" to launch your session.
                </div>
              </div>
            </div>
          )}

          {/* Workspaces Grid */}
          {loadingWorkspaces ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-xs text-slate-500 font-medium">Loading your mock interviews...</p>
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Mock Interviews Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery
                  ? `No interviews matching "${searchQuery}". Try a different keyword.`
                  : 'Create your first personalized AI mock interview workspace with your resume and target role requirements.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    hasUserToggledTabRef.current = true;
                    setHubActiveTab('create');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Mock Interview
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => {
                const isNewlyCreated = workspace._id === newlyCreatedId;
                const latestScoreStatus = getScoreStatus(workspace.latestScore);

                return (
                  <div
                    key={workspace._id}
                    className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-5 cursor-pointer hover:shadow-lg ${
                      isNewlyCreated
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg bg-indigo-50/10'
                        : 'border-slate-200 shadow-2xs'
                    }`}
                    onClick={() => handleOpenReview(workspace)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isNewlyCreated && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                NEW
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                              {workspace.configuration?.interviewType || 'Technical'} • {workspace.configuration?.difficulty || 'Medium'}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-950 text-base font-outfit mt-1.5 hover:text-indigo-600 transition">
                            {workspace.jobDetails?.jobTitle}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500">{workspace.jobDetails?.company}</p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${latestScoreStatus?.badge || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {workspace.status || 'READY'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs font-medium text-slate-700">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate">{workspace.resumeName || workspace.resumeId || 'Resume.pdf'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50/60 p-3 rounded-2xl border border-slate-200/60 text-center">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Attempts</span>
                          <span className="text-sm font-black font-outfit text-slate-900">{workspace.attemptCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Last Score</span>
                          <span className={`text-sm font-black font-outfit ${latestScoreStatus?.color || 'text-slate-600'}`}>
                            {workspace.latestScore ? `${workspace.latestScore}` : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Best Score</span>
                          <span className="text-sm font-black font-outfit text-indigo-700">
                            {workspace.bestScore ? `${workspace.bestScore}` : '--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenReview(workspace)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Performance
                      </button>

                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <button
                          onClick={() => handleAttendWorkspaceInterview(workspace)}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-indigo-600" />
                          {workspace.attemptCount > 0 ? 'Attend Again' : 'Attend Interview'}
                        </button>

                        <button
                          onClick={() => setEditingWorkspace(workspace)}
                          className="text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Details
                        </button>

                        <button
                          onClick={() => setDeletingWorkspace(workspace)}
                          className="text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: RESUME HISTORY */}
      {showResumeHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-outfit">Choose from Resume History</h3>
              <button onClick={() => setShowResumeHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {resumeList.map((resItem) => (
                <div key={resItem._id} className="p-3 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{resItem.originalName || resItem.fileName || 'Resume.pdf'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedResume(resItem);
                      setShowResumeHistoryModal(false);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
                  >
                    Use This Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WORKSPACE CARD */}
      {editingWorkspace && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-outfit">Edit Mock Interview Details</h3>
              <button onClick={() => setEditingWorkspace(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingWorkspace.jobDetails?.jobTitle || ''}
                  onChange={(e) => setEditingWorkspace({
                    ...editingWorkspace,
                    jobDetails: { ...editingWorkspace.jobDetails, jobTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company</label>
                <input
                  type="text"
                  value={editingWorkspace.jobDetails?.company || ''}
                  onChange={(e) => setEditingWorkspace({
                    ...editingWorkspace,
                    jobDetails: { ...editingWorkspace.jobDetails, company: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Description</label>
                <textarea
                  rows={4}
                  value={editingWorkspace.jobDetails?.jobDescription || ''}
                  onChange={(e) => setEditingWorkspace({
                    ...editingWorkspace,
                    jobDetails: { ...editingWorkspace.jobDetails, jobDescription: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setEditingWorkspace(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveEditWorkspace}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE WORKSPACE CARD CONFIRMATION */}
      {deletingWorkspace && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl text-center">
            <Trash2 className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-950 text-base font-outfit">Delete Mock Interview?</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                "{deletingWorkspace.jobDetails?.jobTitle} — {deletingWorkspace.jobDetails?.company}"
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                This will remove the mock interview workspace card and its associated attempt history. Your resume will NOT be deleted.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingWorkspace(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteWorkspace}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Delete Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
