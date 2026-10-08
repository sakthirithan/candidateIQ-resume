import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertCircle, FileText, Sparkles, ChevronDown, ChevronUp,
  Brain, HelpCircle, ShieldCheck, Download, Award, User, MessageSquare, Plus, Check,
  Clock, RefreshCw, AlertTriangle, BookOpen, Target, ArrowRight, CornerDownRight, Mic, Filter, X,
  TrendingUp, Activity, BarChart2, Layers, Zap, Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine, LineChart, Line } from 'recharts';
import { mockInterviewService } from '@/services/mockApi/interviewService';
import { improvementService } from '@/services/improvementService';
import InterviewImprovementPage from './InterviewImprovementPage';
import MockInterviewPerformanceGraph from '@/modules/candidate/interview/components/MockInterviewPerformanceGraph';

const SECTION_COLORS = {
  overall: '#6366f1',           // Indigo
  technical_knowledge: '#4f46e5',// Indigo Primary (Matches InterviewJourney)
  technical: '#4f46e5',         // Indigo Primary
  answer_quality: '#0284c7',    // Sky Blue (Matches InterviewJourney)
  behavioural: '#0284c7',       // Sky Blue
  concept_explanation: '#8b5cf6',// Purple (Matches InterviewJourney)
  problem_solving: '#d97706',   // Amber (Matches InterviewJourney)
  reasoning: '#d97706',         // Amber
  communication: '#059669',     // Emerald (Matches InterviewJourney)
  fluency_pacing: '#ec4899',    // Pink (Matches InterviewJourney)
  voice: '#ec4899',             // Pink
  answer_structure: '#10b981',  // Teal/Emerald Light (Matches InterviewJourney)
  conciseness: '#64748b',       // Slate (Matches InterviewJourney)
  mcq: '#8b5cf6'                // Violet
};

const SECTION_LABELS = {
  overall: 'Overall Score',
  technical_knowledge: 'Technical Knowledge',
  technical: 'Technical Knowledge',
  answer_quality: 'Answer Quality & Relevance',
  behavioural: 'Answer Quality & Relevance',
  concept_explanation: 'Concept Explanation',
  problem_solving: 'Problem Solving',
  reasoning: 'Problem Solving',
  communication: 'Communication',
  fluency_pacing: 'Fluency & Pacing',
  voice: 'Fluency & Pacing',
  answer_structure: 'Answer Structure',
  conciseness: 'Conciseness',
  mcq: 'MCQ Accuracy'
};

// Custom Interactive Tooltip for Multi-Attempt Consistency Graph (Matches Journey Tooltip)
const CustomMultiAttemptTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 select-text min-w-[190px] font-sans">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 font-outfit">
          {label || (data.completedAt ? new Date(data.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Attempt')}
        </div>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 font-semibold text-[11px]">
              <span style={{ color: entry.color }}>
                {entry.name} :
              </span>
              <span className="font-bold text-slate-900 font-outfit">
                {entry.value !== null && entry.value !== undefined ? entry.value : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Interactive Tooltip for Recharts Performance Timeline
const CustomPerformanceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const hover = data.hoverAnalysis || {};
    const delta = data.deltaFromPrevious || 0;
    const isDrop = delta <= -10 || data.status === 'significant_drop';
    const isGain = delta >= 10 || data.status === 'strong' || data.status === 'significant_improvement';
    const isRecovery = data.status === 'recovery';

    return (
      <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 max-w-sm space-y-2.5 select-text font-sans text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-extrabold font-outfit text-indigo-400">
            Q{data.sequence} &bull; {data.topic || (data.section ? data.section.toUpperCase() : 'Technical Question')}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
            isRecovery ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
            isDrop ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
            isGain ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
          }`}>
            Score: {data.score} {delta !== 0 && (delta > 0 ? `(↑ +${delta})` : `(↓ ${delta})`)}
          </span>
        </div>

        {hover.whatChanged && (
          <div>
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">What Changed / Status</span>
            <p className="text-slate-200 font-medium">{hover.whatChanged}</p>
          </div>
        )}

        {hover.why && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Why / Root Cause</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{hover.why}</p>
          </div>
        )}

        {hover.impact && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impact</span>
            <p className="text-slate-300 font-mono text-[11px]">{hover.impact}</p>
          </div>
        )}

        {hover.recommendedImprovement && (
          <div className="pt-1.5 border-t border-slate-800">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Recommended Action</span>
            <p className="text-indigo-200 font-medium text-[11px]">{hover.recommendedImprovement}</p>
          </div>
        )}
        <div className="text-[9px] text-slate-400 text-right pt-1 font-mono italic">
          💡 Click point to view question detail
        </div>
      </div>
    );
  }
  return null;
};

function InterviewReviewDetail({ interviewId, onBack, onOpenUploadFeedback }) {
  const navigate = useNavigate();
  const [interviewDoc, setInterviewDoc] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [showImprovementPage, setShowImprovementPage] = useState(false);
  const [evalProgress, setEvalProgress] = useState(null);

  // Linked Improvement Activities from DB
  const [linkedActivities, setLinkedActivities] = useState([]);

  // Filter State: 'all' | 'mcq' | 'voice' | 'text' | 'correct' | 'incorrect' | 'needs_improvement'
  const [activeFilter, setActiveFilter] = useState('all');

  // Multi-Attempt Consistency Analytics State
  const [consistencyData, setConsistencyData] = useState(null);
  const [loadingConsistency, setLoadingConsistency] = useState(true);
  const [selectedCompetencyWave, setSelectedCompetencyWave] = useState('all');
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
    loadInterviewAndEvaluation();
    loadConsistencyData();
    loadLinkedActivities();
  }, [interviewId]);

  const loadLinkedActivities = async () => {
    try {
      const res = await improvementService.getActivitiesForInterview(interviewId);
      if (res && res.activities) {
        setLinkedActivities(res.activities);
      }
    } catch (err) {
      console.warn('[InterviewReviewDetail] Could not load linked activities:', err);
    }
  };

  const loadConsistencyData = async () => {
    try {
      setLoadingConsistency(true);
      const res = await mockInterviewService.getMockInterviewConsistency(interviewId);
      if (res) {
        setConsistencyData(res);
        const sectionsList = res.availableSections || res.sections || [];
        if (Array.isArray(sectionsList)) {
          const vis = {};
          sectionsList.forEach(s => { vis[s] = true; });
          setVisibleSections(vis);
        }
      }
    } catch (err) {
      console.warn('[InterviewReviewDetail] Failed to load multi-attempt consistency data:', err);
    } finally {
      setLoadingConsistency(false);
    }
  };

  // Real-time SSE Evaluation Progress Listener
  useEffect(() => {
    let eventSource = null;
    if (evaluating && interviewId) {
      const url = `/api/mock-interviews/${interviewId}/evaluation-progress`;
      eventSource = new EventSource(url);
      eventSource.addEventListener('evaluation-progress', (e) => {
        try {
          const data = JSON.parse(e.data);
          setEvalProgress(data);
          if (data.type === 'evaluation_completed' || data.stage === 'COMPLETED') {
            eventSource.close();
            loadInterviewAndEvaluation();
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      });
      eventSource.onerror = () => {
        eventSource.close();
      };
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [evaluating, interviewId]);

  const loadInterviewAndEvaluation = async () => {
    try {
      setLoading(true);
      setEvalError(null);

      let doc = await mockInterviewService.getMockInterviewById(interviewId);
      if (!doc) {
        setInterviewDoc(null);
        setLoading(false);
        return;
      }

      setInterviewDoc(doc);

      if (doc.evaluation && doc.evaluation.status === 'completed') {
        setEvaluation(doc.evaluation);
      } else if (doc.status === 'completed') {
        setEvaluating(true);
        const evalRes = await mockInterviewService.evaluateMockInterview(interviewId, false);
        if (evalRes && evalRes.evaluation) {
          setEvaluation(evalRes.evaluation);
          setInterviewDoc(evalRes.interview || doc);
        } else {
          setEvaluation(doc.evaluation || null);
        }
        setEvaluating(false);
      } else {
        setEvaluation(doc.evaluation || null);
      }
    } catch (err) {
      console.error('Error loading Profile Review evaluation from MongoDB:', err);
      setEvalError('CandidateIQ review could not be completed at this time.');
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  const handleRetryEvaluation = async () => {
    try {
      setEvaluating(true);
      setEvalError(null);
      const evalRes = await mockInterviewService.evaluateMockInterview(interviewId, true);
      if (evalRes && evalRes.evaluation) {
        setEvaluation(evalRes.evaluation);
        setInterviewDoc(evalRes.interview || interviewDoc);
      }
    } catch (err) {
      console.error('Retry evaluation failed:', err);
      setEvalError('Retry failed. Please check AI provider status.');
    } finally {
      setEvaluating(false);
    }
  };

  if (showImprovementPage) {
    return (
      <InterviewImprovementPage
        interviewId={interviewId}
        onBack={() => setShowImprovementPage(false)}
      />
    );
  }

  if (!loading && !interviewDoc) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-white border border-slate-200/90 rounded-2xl my-8 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-outfit">Mock Interview Record Unavailable</h3>
        <p className="text-xs text-slate-500">
          The requested mock interview (ID: <code className="font-mono">{interviewId}</code>) could not be found in MongoDB.
        </p>
        <button type="button" onClick={onBack} className="btn-secondary text-xs cursor-pointer">
          Back to Profile Review
        </button>
      </div>
    );
  }

  // Extract question lists
  const mcqList = interviewDoc?.mock_interview_questions?.mcq || [];
  const voiceList = interviewDoc?.mock_interview_questions?.voice || [];
  const textList = interviewDoc?.mock_interview_questions?.text || [];

  const allQuestions = [];
  mcqList.forEach((q, idx) => {
    allQuestions.push({
      type: 'MCQ',
      index: idx + 1,
      questionId: q.questionId,
      questionText: q.question || q.questionText,
      options: q.options || [],
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
      isAnswered: q.isAnswered,
      evaluation: q.evaluation || (q.isAnswered ? { isCorrect: q.userAnswer === q.correctAnswer, score: q.userAnswer === q.correctAnswer ? 1 : 0 } : null),
      topic: q.topic || 'Technical MCQ'
    });
  });

  voiceList.forEach((q, idx) => {
    allQuestions.push({
      type: 'VOICE',
      index: mcqList.length + idx + 1,
      questionId: q.questionId,
      questionText: q.question || q.questionText,
      transcript: q.transcript || q.answer || q.userAnswer,
      durationSeconds: q.durationSeconds || 0,
      isAnswered: q.isAnswered,
      evaluation: q.evaluation || null,
      topic: q.topic || 'Voice Architecture & Communication'
    });
  });

  textList.forEach((q, idx) => {
    allQuestions.push({
      type: 'TEXT',
      index: mcqList.length + voiceList.length + idx + 1,
      questionId: q.questionId,
      questionText: q.question || q.questionText,
      userAnswer: q.userAnswer || q.answer,
      isAnswered: q.isAnswered,
      evaluation: q.evaluation || null,
      topic: q.topic || 'Written Technical Reasoning'
    });
  });

  const filteredQuestions = allQuestions.filter((q) => {
    if (activeFilter === 'mcq') return q.type === 'MCQ';
    if (activeFilter === 'voice') return q.type === 'VOICE';
    if (activeFilter === 'text') return q.type === 'TEXT';
    if (activeFilter === 'correct') {
      if (q.type === 'MCQ') return q.evaluation?.isCorrect === true;
      return (q.evaluation?.technicalAccuracy?.score || 0) >= 8;
    }
    if (activeFilter === 'incorrect') {
      if (q.type === 'MCQ') return q.evaluation?.isCorrect === false;
      return q.evaluation && (q.evaluation?.technicalAccuracy?.score || 0) < 6;
    }
    if (activeFilter === 'needs_improvement') {
      if (q.type === 'MCQ') return q.evaluation?.isCorrect === false;
      return q.evaluation && (q.evaluation?.technicalAccuracy?.score || 0) < 8;
    }
    return true;
  });

  const overallScore = evaluation?.overallScore ?? interviewDoc?.overallEvaluation?.overallInterviewScore ?? null;
  const techScore = evaluation?.technicalScore ?? interviewDoc?.overallEvaluation?.technicalProficiency ?? null;
  const commScore = evaluation?.communicationScore ?? interviewDoc?.overallEvaluation?.communicationClarity ?? null;
  const reasScore = evaluation?.reasoningScore ?? interviewDoc?.overallEvaluation?.problemSolvingRating ?? null;
  const behavScore = evaluation?.behaviouralScore ?? interviewDoc?.overallEvaluation?.behaviouralCompetency ?? null;
  const consistencyScore = evaluation?.consistencyScore ?? evaluation?.consistencyAnalytics?.consistencyScore ?? (overallScore ? Math.max(60, overallScore - 6) : null);
  const isEvaluated = evaluation && evaluation.status === 'completed';

  // Build performance timeline dataset for Recharts
  const rawTimelineData = evaluation?.performanceTimeline || allQuestions.map((q, idx) => {
    const score = q.type === 'MCQ'
      ? (q.evaluation?.isCorrect ? 100 : 0)
      : (q.evaluation?.technicalAccuracy?.score ? q.evaluation.technicalAccuracy.score * 10 : 70);
    
    let prev = 75;
    if (idx > 0) {
      const prevQ = allQuestions[idx - 1];
      prev = prevQ.type === 'MCQ' ? (prevQ.evaluation?.isCorrect ? 100 : 0) : (prevQ.evaluation?.technicalAccuracy?.score ? prevQ.evaluation.technicalAccuracy.score * 10 : 75);
    }
    const delta = idx === 0 ? 0 : score - prev;

    return {
      sequence: idx + 1,
      questionId: q.questionId,
      section: q.type.toLowerCase(),
      topic: q.topic,
      score,
      deltaFromPrevious: delta,
      status: delta >= 12 ? 'significant_improvement' : delta <= -12 ? 'significant_drop' : 'stable',
      hoverAnalysis: {
        sequence: idx + 1,
        questionId: q.questionId,
        topic: q.topic,
        score,
        previousScore: prev,
        delta,
        whatChanged: delta >= 10 ? 'Technical accuracy & explanation depth increased.' : delta <= -10 ? 'Communication clarity & structure dropped.' : 'Performance remained steady.',
        why: q.evaluation?.feedback || 'Candidate response evaluated by CandidateIQ AI.',
        impact: delta !== 0 ? `Performance shifted by ${delta} points.` : 'Consistent score maintained.',
        recommendedImprovement: 'Practice structured technical explanations focusing on edge cases.'
      }
    };
  });

  // Filter graph data according to active section filter
  const timelineData = rawTimelineData.filter((item) => {
    if (activeFilter === 'mcq') return item.section === 'mcq';
    if (activeFilter === 'voice') return item.section === 'voice';
    if (activeFilter === 'text') return item.section === 'text';
    if (activeFilter === 'correct') return item.score >= 80;
    if (activeFilter === 'needs_improvement') return item.score < 80;
    return true;
  });

  const handleGraphClick = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      const targetQId = e.activePayload[0].payload.questionId;
      const el = document.getElementById(`q_card_${targetQId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-indigo-500', 'transition-all');
        setTimeout(() => el.classList.remove('ring-4', 'ring-indigo-500'), 2500);
      }
    }
  };

  const consistency = evaluation?.consistencyAnalytics || {
    meanScore: overallScore ?? null,
    stdDeviation: 0,
    range: 0,
    consecutiveImprovement: 0,
    consecutiveDecline: 0,
    recoveryDetected: false,
    consistencyScore: consistencyScore ?? null,
    performanceTrend: 'stable',
    significantDropsCount: (evaluation?.performanceDrops || []).length
  };

  const recommendations = evaluation?.improvementRecommendations || [];

  const drops = evaluation?.performanceDrops || [];

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none animate-fadeIn py-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button type="button" onClick={onBack} className="btn-secondary text-xs flex items-center gap-2 cursor-pointer font-bold font-outfit">
          <ArrowLeft className="w-4 h-4 text-slate-600" /> ← Back to Profile Review
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold font-mono">
            Mock Interview ID: {interviewDoc?._id || interviewId}
          </span>
        </div>
      </div>

      {/* 1. INTERVIEW SUMMARY HERO CARD */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 relative overflow-hidden shadow-xs rounded-2xl">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                AI Interview Intelligence Layer
              </span>
              <span className="text-xs text-slate-500 font-medium">
                &bull; Evaluated: {evaluation?.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <h1 className="text-2xl font-black font-outfit text-slate-950 tracking-tight">{interviewDoc?.jobTitle || 'AI Mock Interview'}</h1>
            <p className="text-xs text-indigo-600 font-bold">
              {interviewDoc?.sourceSnapshot?.job?.company || 'CandidateIQ Requisition'} &bull; Difficulty: {interviewDoc?.difficulty || 'Medium'} &bull; Mode: {(interviewDoc?.interviewType || 'RANDOM').toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-slate-950 text-white text-center space-y-0.5 shadow-md">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Overall Performance</span>
              <span className="text-3xl font-black font-outfit text-indigo-400">
                {overallScore !== null ? `${overallScore} / 100` : '—'}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold block pt-0.5">
                {overallScore !== null
                  ? overallScore >= 80 ? 'Strong Performance' : overallScore >= 70 ? 'Proficient Alignment' : 'Needs Technical Practice'
                  : 'Evaluation Pending'}
              </span>
            </div>

            <div className="px-6 py-4 rounded-2xl bg-indigo-950 text-white text-center space-y-0.5 shadow-md border border-indigo-800">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block tracking-wider flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Consistency Score
              </span>
              <span className="text-3xl font-black font-outfit text-emerald-400">
                {consistencyScore !== null ? `${consistencyScore} / 100` : '—'}
              </span>
              <span className="text-[11px] text-indigo-200 font-bold block pt-0.5">
                {consistency.performanceTrend ? consistency.performanceTrend.toUpperCase() : 'STABLE'} TREND
              </span>
            </div>
          </div>
        </div>

        {/* 2. TOP SCORE METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Technical Proficiency</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{techScore !== null ? techScore : '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Communication Clarity</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{commScore !== null ? commScore : '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Reasoning & Depth</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{reasScore !== null ? reasScore : '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Behavioural Signals</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{behavScore !== null ? behavScore : '—'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MULTI-ATTEMPT CONSISTENCY ANALYTICS CARD (MOCK INTERVIEW PERFORMANCE GRAPH) */}
      {/* ========================================================================= */}
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
          if (payload?.attemptId && payload.attemptId !== interviewId) {
            navigate(`/mock-interview/review/${payload.attemptId}`);
          }
        }}
      />

      {/* SECTION HIGHLIGHTS / ANALYTICS CALLOUT CARDS */}
      <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
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
                      {(consistencyData?.availableSections || consistencyData?.sections || []).filter(s => s !== 'overall').map(s => (
                        <th key={s} className="p-3 text-center">{SECTION_LABELS[s] || s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(consistencyData?.attempts || []).map((att) => {
                      const isCurrent = att.isCurrentAttempt;
                      return (
                        <tr
                          key={att.attemptId}
                          onClick={() => {
                            if (att.attemptId && att.attemptId !== interviewId) {
                              navigate(`/mock-interview/review/${att.attemptId}`);
                            }
                          }}
                          className={`transition-colors cursor-pointer ${isCurrent ? 'bg-indigo-50/70 font-bold' : 'hover:bg-slate-50'}`}
                        >
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
                          {(consistencyData?.availableSections || consistencyData?.sections || []).filter(s => s !== 'overall').map(s => {
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

      {/* REAL-TIME EVALUATING PROGRESS CARD */}
      {evaluating && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-6 shadow-2xl max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              <div>
                <h3 className="text-base font-bold font-outfit text-white">✨ CandidateIQ AI Review Engine</h3>
                <p className="text-xs text-slate-400">Evaluating responses question-by-question & building consistency timeline...</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
              {evalProgress?.completedQuestions || 0} / {evalProgress?.totalQuestions || allQuestions.length || 20} Analyzed
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300 font-mono">
                Question {evalProgress?.questionNumber || (evalProgress?.completedQuestions ? evalProgress.completedQuestions + 1 : 1)} of {evalProgress?.totalQuestions || allQuestions.length || 20}
              </span>
              <span className="text-indigo-400 font-mono font-bold">{evalProgress?.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${Math.max(5, evalProgress?.progress || 0)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERVIEW PERFORMANCE CONSISTENCY CHART (INTERACTIVE VISUALIZATION) */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-xs rounded-2xl">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
              <Activity className="w-4 h-4 text-emerald-500" /> Sequential Performance Consistency Engine
            </span>
            <h2 className="text-xl font-black font-outfit text-slate-950 tracking-tight">
              Interview Performance Timeline (Hover / Click Points for Evidence Analysis)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold font-mono">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> High / Improved
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Detected Drop
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Recovery
            </span>
          </div>
        </div>

        {/* RECHARTS AREA CHART */}
        <div className="h-64 w-full pt-2 cursor-pointer">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} onClick={handleGraphClick} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="sequence" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} tickFormatter={(val) => `Q${val}`} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<CustomPerformanceTooltip />} />
              <ReferenceLine y={75} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Target Baseline (75)', fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 3. CONSISTENCY ANALYTICS STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-xs font-medium">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mean Score</span>
            <span className="text-lg font-black font-outfit text-slate-900">{consistency.meanScore} / 100</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Std Deviation</span>
            <span className="text-lg font-black font-outfit text-slate-900">±{consistency.stdDeviation}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Score Range</span>
            <span className="text-lg font-black font-outfit text-slate-900">{consistency.range} pts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recovery Detected</span>
            <span className={`text-sm font-extrabold font-outfit block pt-0.5 ${consistency.recoveryDetected ? 'text-emerald-600' : 'text-slate-500'}`}>
              {consistency.recoveryDetected ? '✓ Yes (Recovered)' : '— None Required'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trend Classification</span>
            <span className="text-sm font-extrabold font-outfit text-indigo-600 uppercase block pt-0.5">
              {consistency.performanceTrend || 'Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. DETECTED PERFORMANCE DROPS & ROOT CAUSE EVIDENCE */}
      {drops.length > 0 && (
        <div className="saas-card p-6 border border-amber-200 bg-amber-50/40 rounded-2xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm font-outfit">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Detected Performance Drops & Evidence Diagnosis ({drops.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drops.map((d, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-amber-200/80 space-y-2 text-xs shadow-2xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="font-outfit text-slate-900 text-sm font-extrabold">Q{d.sequence} &bull; {d.topic}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[11px]">
                    {d.score} (↓ {Math.abs(d.delta)} pts)
                  </span>
                </div>
                <p className="text-slate-700 font-medium"><strong>What changed:</strong> {d.whatChanged}</p>
                <p className="text-slate-600"><strong>Why:</strong> {d.why}</p>
                <p className="text-indigo-700 font-semibold pt-1"><strong>Action:</strong> {d.recommendedImprovement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ACTIONABLE IMPROVEMENT RECOMMENDATIONS PLAN (INTEGRATED WITH ACTIVITIES) */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-xs rounded-2xl">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider block">CandidateIQ Improvement Engine</span>
            <h2 className="text-xl font-black font-outfit text-slate-950 tracking-tight">
              Actionable Improvement Plan & Activities ({linkedActivities.length > 0 ? linkedActivities.length : recommendations.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/activities')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Go to Activities Tab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {linkedActivities.length > 0 ? (
            linkedActivities.map((act) => {
              const isCompleted = act.status === 'COMPLETED';
              const isPracticeReq = act.status === 'PRACTICE_REQUIRED';
              const isInProgress = act.status === 'IN_PROGRESS';

              return (
                <div key={act._id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                        {act.category} &bull; Priority: {act.priority || 'MEDIUM'}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isPracticeReq
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isInProgress
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}>
                        {isCompleted ? '✓ Completed' : isPracticeReq ? 'Practice Required' : isInProgress ? 'In Progress' : 'Pending'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-outfit text-slate-950">{act.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.detectedIssue}</p>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 font-mono">
                        <span>Baseline: <strong className="text-slate-800">{act.baselineValue} {act.unit}</strong></span>
                        <span>Latest: <strong className="text-indigo-600">{act.latestValue ?? act.baselineValue} {act.unit}</strong></span>
                        <span>Target: <strong className="text-emerald-700">{act.comparisonOperator || '≥'} {act.targetValue} {act.unit}</strong></span>
                      </div>
                      <p className="text-slate-800 font-medium text-[11px] pt-1 border-t border-slate-100">
                        <strong>Solution:</strong> {act.solutionDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-medium font-mono">
                      Attempts: {act.attemptCount || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/activities?activityId=${act._id}`)}
                      className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                        isCompleted
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isCompleted ? 'Review Activity' : 'Start Practice Activity'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                      {rec.category} &bull; Priority: {rec.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">Target: {rec.measurableTarget}</span>
                  </div>

                  <h3 className="text-base font-bold font-outfit text-slate-950">{rec.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.problem}</p>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Actionable Method</span>
                    <p className="text-slate-800 font-medium">{rec.action}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Est. Effort: {rec.estimatedEffort || '30 mins'}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/activities')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    View in Activities <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. QUESTION-BY-QUESTION REVIEW SECTION & FILTERS */}
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider block">Question Level Evaluation</span>
            <h2 className="text-xl font-extrabold font-outfit text-slate-950 tracking-tight">Question-by-Question Detailed Review ({allQuestions.length})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
            {[
              { id: 'all', label: `All (${allQuestions.length})` },
              { id: 'mcq', label: `MCQ (${mcqList.length})` },
              { id: 'voice', label: `Voice (${voiceList.length})` },
              { id: 'text', label: `Text (${textList.length})` },
              { id: 'correct', label: 'Correct' },
              { id: 'needs_improvement', label: 'Needs Improvement' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* QUESTION CARDS LIST */}
        <div className="space-y-6">
          {filteredQuestions.map((q) => {
            const cardId = `q_card_${q.questionId}`;
            if (q.type === 'MCQ') {
              const hasAnswered = q.userAnswer && q.userAnswer.trim().length > 0;
              const isCorrect = q.evaluation?.isCorrect === true;
              return (
                <div id={cardId} key={q.questionId || q.index} className="saas-card p-6 border border-slate-200/90 space-y-4 bg-white shadow-xs rounded-2xl transition-all">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">Question {q.index} &bull; MCQ</span>
                        <span>Topic: {q.topic}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-950 font-outfit">{q.questionText}</h3>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border shrink-0 ${
                      !hasAnswered
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {!hasAnswered ? '⚪ Not Answered' : isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Selected Option</span>
                      <span className={`font-mono font-bold ${!hasAnswered ? 'text-slate-400 italic' : isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {q.userAnswer || 'Not Answered'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Correct Option</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {q.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            if (q.type === 'VOICE') {
              const ev = q.evaluation;
              const hasVoiceAns = q.transcript && q.transcript.trim().length > 0;

              return (
                <div id={cardId} key={q.questionId || q.index} className="saas-card p-6 border border-slate-200/90 space-y-5 bg-white shadow-xs rounded-2xl transition-all">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center gap-1 font-outfit">
                          <Mic className="w-3 h-3 text-indigo-600" /> Question {q.index} &bull; VOICE RESPONSE
                        </span>
                        <span>Topic: {q.topic}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-950 font-outfit">{q.questionText}</h3>
                    </div>

                    {ev ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-extrabold">
                          Tech Accuracy: {ev.technicalAccuracy?.score ?? '—'}/10
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-extrabold">
                          Communication: {ev.communication?.score ?? '—'}/10
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                        Evaluation Pending
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 text-slate-100 space-y-2.5 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                        <Mic className="w-3.5 h-3.5 text-indigo-400" /> 🎙 Voice Response (Read-Only Evidence)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        Duration: {q.durationSeconds || 0} seconds
                      </span>
                    </div>
                    <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap font-sans select-text">
                      {hasVoiceAns ? `"${q.transcript}"` : 'No spoken voice transcript recorded.'}
                    </pre>
                  </div>

                  {ev ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Communication & Behavioral Signals</span>
                        <div className="flex flex-wrap gap-2 text-slate-700 font-medium">
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <strong>Tone:</strong> {ev.tone?.label || 'Neutral'}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <strong>Sentiment:</strong> {ev.sentiment?.label || 'Neutral'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-indigo-950 text-white space-y-2 border border-indigo-800 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                          <Sparkles className="w-3.5 h-3.5" /> AI Feedback (20–25 Words Concise Opinion)
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium bg-indigo-900/60 p-3 rounded-lg border border-indigo-800">
                          "{ev.feedback || 'Evaluation not available yet.'}"
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (q.type === 'TEXT') {
              const ev = q.evaluation;
              const hasTextAns = q.userAnswer && q.userAnswer.trim().length > 0;

              return (
                <div id={cardId} key={q.questionId || q.index} className="saas-card p-6 border border-slate-200/90 space-y-5 bg-white shadow-xs rounded-2xl transition-all">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-100 font-outfit font-bold">
                          ✍ Question {q.index} &bull; TEXT RESPONSE
                        </span>
                        <span>Topic: {q.topic}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-950 font-outfit">{q.questionText}</h3>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block font-outfit">
                      ✍ Text Response (Read-Only Evidence)
                    </span>
                    <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap font-sans select-text">
                      {hasTextAns ? `"${q.userAnswer}"` : 'No written text response submitted.'}
                    </pre>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* 4. OVERALL INSIGHTS SECTION (BOTTOM) */}
      {isEvaluated && (
        <div className="saas-card p-6 md:p-8 border border-slate-900 bg-slate-950 text-white rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black font-outfit text-white">Overall Mock Interview Insights</h2>
              <span className="text-xs text-indigo-400 font-semibold">Aggregated CandidateIQ Strengths, Improvement Areas & Final Recommendation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-3 text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What You Did Well
              </span>
              <div className="space-y-2 text-slate-200">
                {(evaluation?.strengths || []).map((st, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-950/60 border border-amber-800/80 space-y-3 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Areas to Improve
              </span>
              <div className="space-y-2 text-slate-200">
                {(evaluation?.improvements || []).map((im, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&rarr;</span>
                    <span>{im}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block font-outfit">Recommended Focus & Final Feedback</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              {evaluation?.finalFeedback || 'Evaluation summary generated by CandidateIQ.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default InterviewReviewDetail;
