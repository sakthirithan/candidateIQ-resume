import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
  UserCheck
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { mockInterviewService } from '@/services/mockApi/interviewService';
import { ResponsibleAIDisclaimer } from '@/modules/shared';

function InterviewEvaluationAnalytics({ initialReport, onEvaluationComplete }) {
  // Input State: Array of Question + Answer pairs
  const [qaPairs, setQaPairs] = useState([
    {
      id: 1,
      question: 'Explain how you optimize React component re-renders when managing global state with Context or Redux.',
      answer: 'I utilize React.memo alongside useMemo and useCallback hooks to maintain stable function references. Additionally, splitting context providers by read/write frequency prevents unnecessary child tree re-renders.'
    },
    {
      id: 2,
      question: 'Describe a situation where an API service experienced high latency under load and how you diagnosed it.',
      answer: 'We analyzed APM traces using MongoDB explain() queries and uncovered missing compound index coverage on candidate status queries. Adding targeted indices reduced DB response time from 1.2s to 45ms.'
    },
    {
      id: 3,
      question: 'How do you coordinate with product managers and junior developers when delivering critical breaking changes to an API?',
      answer: 'I authored an API migration RFC, established automated deprecation header alerts for consumer teams, and hosted a pair-programming workshop to help junior engineers transition smoothly without downtime.'
    }
  ]);

  const [jobTitle, setJobTitle] = useState('Senior MERN Stack & AI Engineer');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [showInputForm, setShowInputForm] = useState(false);

  // Load initial data or run evaluation on mount
  useEffect(() => {
    if (initialReport) {
      setEvaluationReport(initialReport);
    } else {
      runEvaluation(qaPairs);
    }
  }, [initialReport]);

  const runEvaluation = async (pairsToEval) => {
    setIsEvaluating(true);
    try {
      const result = await mockInterviewService.evaluateQAPairs(pairsToEval);
      setEvaluationReport(result);
      if (onEvaluationComplete) {
        onEvaluationComplete(result);
      }
    } catch (err) {
      console.error('Error evaluating interview Q&A:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddQAPair = () => {
    const newId = Date.now();
    setQaPairs([
      ...qaPairs,
      { id: newId, question: '', answer: '' }
    ]);
  };

  const handleRemoveQAPair = (id) => {
    if (qaPairs.length <= 1) return;
    setQaPairs(qaPairs.filter((p) => p.id !== id));
  };

  const handleUpdateQAPair = (id, field, value) => {
    setQaPairs(
      qaPairs.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runEvaluation(qaPairs);
  };

  const handleLoadSampleScenario = () => {
    const sample = [
      {
        id: 101,
        question: 'Explain how you optimize React component re-renders when managing global state with Context or Redux.',
        answer: 'I utilize React.memo alongside useMemo and useCallback hooks to maintain stable function references. Additionally, splitting context providers by read/write frequency prevents unnecessary child tree re-renders.'
      },
      {
        id: 102,
        question: 'Describe a situation where an API service experienced high latency under load and how you diagnosed it.',
        answer: 'We analyzed APM traces using MongoDB explain() queries and uncovered missing compound index coverage on candidate status queries. Adding targeted indices reduced DB response time from 1.2s to 45ms.'
      },
      {
        id: 103,
        question: 'How do you coordinate with product managers and junior developers when delivering critical breaking changes to an API?',
        answer: 'I authored an API migration RFC, established automated deprecation header alerts for consumer teams, and hosted a pair-programming workshop to help junior engineers transition smoothly without downtime.'
      }
    ];
    setQaPairs(sample);
    runEvaluation(sample);
  };

  // Scores fallback matching specification
  const scores = evaluationReport?.scores || {
    technical: 86,
    communication: 78,
    problemSolving: 82,
    relevance: 88,
    depth: 79,
    behaviouralEvidence: 85
  };

  // Recharts radar data for visualization
  const radarChartData = [
    { metric: 'Technical', value: scores.technical, fullMark: 100 },
    { metric: 'Relevance', value: scores.relevance, fullMark: 100 },
    { metric: 'Depth', value: scores.depth, fullMark: 100 },
    { metric: 'Problem Solving', value: scores.problemSolving, fullMark: 100 },
    { metric: 'Communication', value: scores.communication, fullMark: 100 },
    { metric: 'Behavioural', value: scores.behaviouralEvidence, fullMark: 100 }
  ];

  const barChartData = [
    { name: 'Technical', score: scores.technical, color: '#6366f1' },
    { name: 'Relevance', score: scores.relevance, color: '#3b82f6' },
    { name: 'Depth', score: scores.depth, color: '#8b5cf6' },
    { name: 'Problem Solving', score: scores.problemSolving, color: '#06b6d4' },
    { name: 'Communication', score: scores.communication, color: '#10b981' }
  ];

  const questionsList = evaluationReport?.evaluations || [
    {
      questionId: 1,
      question: 'Question 1: Explain how you optimize React component re-renders when managing global state with Context or Redux.',
      score: 88,
      strength: 'Strong technical understanding of React state architecture and reference stability',
      improvement: 'Could elaborate on compiler optimizations and automatic state memoization in React 19.'
    },
    {
      questionId: 2,
      question: 'Question 2: Describe a situation where an API service experienced high latency under load and how you diagnosed it.',
      score: 72,
      strength: 'Empirical root cause diagnosis using query execution statistics',
      improvement: 'Explain implementation details more clearly, specifically caching fallbacks and index creation migration scripts'
    }
  ];

  const behaviouralEvidenceList = evaluationReport?.behaviouralEvidence || [
    {
      category: 'Evidence of Collaboration',
      details: 'Authored cross-team RFCs, conducted code review pair sessions with junior developers, and coordinated breaking API migrations across departments.'
    },
    {
      category: 'Evidence of Ownership',
      details: 'Initiated APM trace analysis during high-latency production incidents and took responsibility for database index optimizations.'
    },
    {
      category: 'Evidence of Problem Solving',
      details: 'Diagnosed slow candidate status queries using MongoDB explain plans and reduced query execution latency from 1.2s to 45ms.'
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 11 — Interview Evaluation & Analytics
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Structured Evaluation Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Converts interview Question + Answer responses into structured evaluations across 6 score dimensions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowInputForm(!showInputForm)}
            className="btn-saas px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            {showInputForm ? 'Hide Input Panel' : 'Edit Q&A Input'}
          </button>

          <button
            type="button"
            onClick={handleLoadSampleScenario}
            disabled={isEvaluating}
            className="btn-ai px-4 py-2.5 text-xs font-bold text-white rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            {isEvaluating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            Run Evaluation
          </button>
        </div>
      </div>

      {/* Interactive Input Section: Questions + Answers */}
      {showInputForm && (
        <div className="saas-card p-6 md:p-8 border border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Interview Question + Answer Responses (Input)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter candidate interview questions and responses to evaluate technical correctness, depth, relevance, and problem solving.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddQAPair}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
              <button
                type="button"
                onClick={handleLoadSampleScenario}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Load Preset Q&A
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Target Role / Job Position
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="input-saas w-full text-xs font-medium text-slate-900 bg-white"
                  placeholder="e.g. Senior MERN Stack & AI Engineer"
                />
              </div>
            </div>

            <div className="space-y-4">
              {qaPairs.map((pair, index) => (
                <div
                  key={pair.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-outfit flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      Question {index + 1}
                    </span>
                    {qaPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQAPair(pair.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={pair.question}
                      onChange={(e) =>
                        handleUpdateQAPair(pair.id, 'question', e.target.value)
                      }
                      placeholder={`Enter question ${index + 1}...`}
                      className="input-saas w-full text-xs font-semibold text-slate-900 bg-slate-50/50"
                    />

                    <textarea
                      rows={3}
                      value={pair.answer}
                      onChange={(e) =>
                        handleUpdateQAPair(pair.id, 'answer', e.target.value)
                      }
                      placeholder={`Paste or type candidate response for question ${index + 1}...`}
                      className="input-saas w-full text-xs font-normal text-slate-800 bg-white resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isEvaluating}
                className="btn-ai px-6 py-2.5 text-xs font-bold text-white rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Responses...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Evaluate Q&A Responses with AI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Results Grid */}
      <div className="space-y-6">
        {/* Results Metrics Overview */}
        <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-outfit text-slate-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Evaluation Results & 6-Dimension Scorecard
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Structured multi-attribute evaluation computed from candidate interview responses.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Rating</span>
                <span className="text-2xl font-black font-outfit text-indigo-900">
                  {evaluationReport?.overallScore ?? '—'} <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* 5 Core Required Metrics Cards + 1 Behavioral Metric Card */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 transition-all hover:border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technical</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              </div>
              <div className="text-3xl font-black font-outfit text-slate-950">
                {scores.technical}
              </div>
              <p className="text-[10px] font-medium text-slate-500">Technical Correctness</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 transition-all hover:border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Relevance</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="text-3xl font-black font-outfit text-blue-600">
                {scores.relevance}
              </div>
              <p className="text-[10px] font-medium text-slate-500">Answer Relevance</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 transition-all hover:border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Depth</span>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              </div>
              <div className="text-3xl font-black font-outfit text-purple-600">
                {scores.depth}
              </div>
              <p className="text-[10px] font-medium text-slate-500">Technical Depth</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 transition-all hover:border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Problem Solving</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              </div>
              <div className="text-3xl font-black font-outfit text-cyan-600">
                {scores.problemSolving}
              </div>
              <p className="text-[10px] font-medium text-slate-500">Diagnostic Method</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 transition-all hover:border-indigo-200 col-span-2 sm:col-span-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Communication</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-3xl font-black font-outfit text-emerald-600">
                {scores.communication}
              </div>
              <p className="text-[10px] font-medium text-slate-500">Clarity & STAR Method</p>
            </div>
          </div>

          {/* Visual Evaluation Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Recharts Radar Chart */}
            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Evaluation Radar Spectrum
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="Evaluation Score" dataKey="value" stroke="#6366f1" fill="#818cf8" fillOpacity={0.45} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Bar Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Metric Score Comparison
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      formatter={(val) => [`${val} / 100`, 'Score']}
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={18}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Question-Level Analysis Section */}
        <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-outfit text-slate-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Question-Level Analysis
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Granular scoring, evaluated strengths, and improvement points per interview question.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {questionsList.length} Questions Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {questionsList.map((q, idx) => {
              const qNum = idx + 1;
              const isExpanded = expandedQuestionId === q.questionId || expandedQuestionId === idx;
              
              return (
                <div
                  key={q.questionId || idx}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/40 transition-all hover:border-indigo-200"
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.questionId || idx)}
                    className="p-4 md:p-5 bg-white cursor-pointer flex flex-wrap items-start justify-between gap-4 select-none"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-bold font-outfit text-xs">
                          Question {qNum}
                        </span>
                        <span className="text-xs font-bold font-outfit text-indigo-600">
                          Score: {q.score}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {q.question.replace(/^Question \d+:\s*/, '')}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-lg font-black font-outfit ${q.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {q.score}
                        </span>
                        <span className="text-xs font-medium text-slate-400"> / 100</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Question Cards: Strength & Improvement */}
                  <div className="p-4 md:p-5 space-y-3 bg-slate-50/60 border-t border-slate-100">
                    {q.candidateResponse && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                          Candidate Answer:
                        </span>
                        "{q.candidateResponse}"
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strength Card */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs font-outfit">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Strength:</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                          {q.strength || 'Strong technical understanding'}
                        </p>
                      </div>

                      {/* Improvement Card */}
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs font-outfit">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Improvement:</span>
                        </div>
                        <p className="text-xs text-amber-950 font-medium leading-relaxed">
                          {q.improvement || 'Explain implementation details more clearly'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsible AI & Behavioural Principle Compliance Section */}
        <div className="saas-card p-6 md:p-8 border border-purple-200/80 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
                  Behavioural Principle & Responsible AI Compliance
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  CandidateIQ enforces objective work evidence verification without subjective personality claims.
                </p>
              </div>
            </div>

            <span className="badge-pill bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-purple-600" /> Responsible AI Policy Enforced
            </span>
          </div>

          {/* Do Not Display Unsupported Personality Claims Rule Box */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950 font-outfit">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Strict Evaluation Standard: No Unsupported Personality Claims</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              CandidateIQ evaluates candidates based solely on verifiable work samples, technical accuracy, and STAR methodology.
              System models do <span className="font-bold underline">not</span> generate psychological profiles or unsupported personality traits.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block text-rose-950 mb-0.5">❌ Prohibited Output:</span>
                "Candidate is highly extroverted" / "Candidate has personality X"
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold block text-emerald-950 mb-0.5">✅ Compliant Output Standard:</span>
                Objective evidence of collaboration, ownership, and problem solving
              </div>
            </div>
          </div>

          {/* Objective Behavioural Evidence Callouts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">
              Verified Objective Work Evidence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {behaviouralEvidenceList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 font-outfit">
                      {item.category}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ResponsibleAIDisclaimer />
      </div>
    </div>
  );
}

export default InterviewEvaluationAnalytics;
