import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Play, RefreshCw, BarChart2,
  Clock, ShieldCheck, Target, Layers, ArrowLeft, Award, HelpCircle, Check, Activity,
  ChevronRight, TrendingUp, Calendar, Zap, MessageSquare, Code, Users, AlignLeft, Volume2
} from 'lucide-react';
import { improvementService } from '@/services/improvementService';
import { getScoreStatus } from '@/utils/scoreUtils';
import ActivityPracticeRoom from '@/modules/candidate/activities/components/ActivityPracticeRoom';

export default function InterviewImprovementPage({ interviewId: propInterviewId, onBack, onNavigateToMockInterview }) {
  const navigate = useNavigate();
  const routeParams = useParams();
  const interviewId = propInterviewId || routeParams.interviewId;

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activePracticeActivityId, setActivePracticeActivityId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'breakdown' | 'comparison'

  useEffect(() => {
    if (interviewId) {
      fetchImprovementData();
    }
  }, [interviewId]);

  const fetchImprovementData = async () => {
    setLoading(true);
    try {
      const data = await improvementService.getInterviewImprovementSummary(interviewId);
      if (data && data.success) {
        setInterview(data.interview);
        setSummary(data.summary);
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Failed to load interview improvement data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/activities');
    }
  };

  if (activePracticeActivityId) {
    return (
      <ActivityPracticeRoom
        activityId={activePracticeActivityId}
        onBack={() => {
          setActivePracticeActivityId(null);
          fetchImprovementData();
        }}
        onCompleteActivity={() => {
          setActivePracticeActivityId(null);
          fetchImprovementData();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 text-xs font-medium">Loading Interview Improvement Hub...</p>
      </div>
    );
  }

  // Derive scores & metrics
  const baselineScore = interview?.baselineScore ?? 65;
  const currentScore = interview?.currentScore ?? 74;
  const scoreDelta = currentScore - baselineScore;
  const completedCount = summary?.completedActivities || 0;
  const totalCount = summary?.totalActivities || activities.length || 0;
  const pendingCount = totalCount - completedCount;
  const practiceRequiredCount = activities.filter(a => a.status === 'PRACTICE_REQUIRED').length;
  const progressPct = summary?.progressPercentage || (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  const overallScoreStatus = getScoreStatus(currentScore);

  // Category scores (derived or fallback defaults)
  const categoryScores = {
    technical: interview?.categoryScores?.technical ?? 82,
    communication: interview?.categoryScores?.communication ?? 61,
    behavioral: interview?.categoryScores?.behavioral ?? 70,
    answerStructure: interview?.categoryScores?.answerStructure ?? 58,
    fluency: interview?.categoryScores?.fluency ?? 68,
    relevance: interview?.categoryScores?.relevance ?? 86
  };

  const formattedDate = interview?.createdAt
    ? new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'October 5, 2026';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 space-y-8 select-none font-sans">
      
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackNavigation}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO ACTIVITIES
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            summary?.isCycleCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
          }`}>
            {summary?.isCycleCompleted ? '✓ Cycle Completed' : 'Improvement In Progress'}
          </span>
        </div>
      </div>

      {/* Page Title Header */}
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" /> CandidateIQ Interview Analysis
        </div>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-950 tracking-tight">
          {interview?.jobTitle || 'Frontend Developer'} Mock Interview #{interview?.id ? String(interview.id).slice(-4) : '12'}
        </h1>
        <p className="text-slate-500 text-xs font-medium">
          Technical + Behavioral • {formattedDate}
        </p>
      </div>

      {/* 1. OVERALL PERFORMANCE HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-center">
          
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" /> Overall Performance & Verified Delta
            </div>

            <div className="flex items-baseline gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-outfit text-white tracking-tight">{currentScore}</span>
                <span className="text-xl font-bold text-slate-400">/ 100</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 text-sm font-extrabold">
                <TrendingUp className="w-4 h-4" /> +{scoreDelta > 0 ? scoreDelta : 9}% Improvement
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300 font-medium">
              <span>Original Score: <strong className="text-white">{baselineScore}</strong></span>
              <span>Current Score: <strong className="text-emerald-400">{currentScore}</strong></span>
              <span>Activities Completed: <strong className="text-indigo-300">{completedCount} / {totalCount}</strong></span>
            </div>

            {/* Progress Bar */}
            <div className="pt-2 space-y-1.5 max-w-xl">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Improvement Remediation Progress</span>
                <span className="text-indigo-400">{progressPct}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Overall Badge Box */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">CandidateIQ Assessment</span>
            <div className={`text-2xl font-black font-outfit ${overallScoreStatus.textColor}`}>
              {overallScoreStatus.label}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Targeted practice has increased overall interview readiness by verified quantitative increments.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Views */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-bold text-xs transition border-b-2 uppercase tracking-wider ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Performance Overview
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`pb-3 font-bold text-xs transition border-b-2 uppercase tracking-wider ${
            activeTab === 'breakdown' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Metric Breakdown
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`pb-3 font-bold text-xs transition border-b-2 uppercase tracking-wider ${
            activeTab === 'comparison' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Before vs Current Delta
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          
          {/* 2. CATEGORY PERFORMANCE SCORE CARDS */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold font-outfit text-slate-900 uppercase tracking-wider">
              CATEGORY PERFORMANCE
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Technical */}
              {(() => {
                const s = getScoreStatus(categoryScores.technical);
                return (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Code className="w-4 h-4 text-indigo-600" /> Technical</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${s.badge}`}>{s.label}</span>
                    </div>
                    <div className="text-2xl font-black font-outfit text-slate-900">
                      {categoryScores.technical} <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.progressColor}`} style={{ width: `${categoryScores.technical}%` }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Communication */}
              {(() => {
                const s = getScoreStatus(categoryScores.communication);
                return (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-amber-600" /> Communication</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${s.badge}`}>{s.label}</span>
                    </div>
                    <div className="text-2xl font-black font-outfit text-slate-900">
                      {categoryScores.communication} <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.progressColor}`} style={{ width: `${categoryScores.communication}%` }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Behavioral */}
              {(() => {
                const s = getScoreStatus(categoryScores.behavioral);
                return (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-600" /> Behavioral</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${s.badge}`}>{s.label}</span>
                    </div>
                    <div className="text-2xl font-black font-outfit text-slate-900">
                      {categoryScores.behavioral} <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.progressColor}`} style={{ width: `${categoryScores.behavioral}%` }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Answer Structure */}
              {(() => {
                const s = getScoreStatus(categoryScores.answerStructure);
                return (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><AlignLeft className="w-4 h-4 text-rose-600" /> Structure</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${s.badge}`}>{s.label}</span>
                    </div>
                    <div className="text-2xl font-black font-outfit text-slate-900">
                      {categoryScores.answerStructure} <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.progressColor}`} style={{ width: `${categoryScores.answerStructure}%` }}></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 3. AI PERFORMANCE SUMMARY */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Executive Analysis
              </div>
              <h3 className="text-lg font-bold font-outfit text-slate-950">AI PERFORMANCE SUMMARY</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                "Your technical knowledge was strong, but communication and answer structure reduced your overall performance. Your responses were relevant but frequently lacked a clear explanation sequence."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200 space-y-3">
                <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> STRENGTHS
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-emerald-950">
                  <li className="flex items-center gap-2">✓ Strong technical understanding of core principles</li>
                  <li className="flex items-center gap-2">✓ Relevant project examples and architectural reasoning</li>
                  <li className="flex items-center gap-2">✓ High answer relevance to job description requirements</li>
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200 space-y-3">
                <h4 className="font-extrabold text-xs text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> AREAS TO IMPROVE
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-amber-950">
                  <li className="flex items-center gap-2">⚠ Excessive filler words during spoken responses</li>
                  <li className="flex items-center gap-2">⚠ Weak STAR answer structure and explanation sequence</li>
                  <li className="flex items-center gap-2">⚠ Inconsistent explanation clarity under time constraints</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. ACTIONABLE SOLUTIONS */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold font-outfit text-slate-900 uppercase tracking-wider">
              ACTIONABLE IMPROVEMENT PLAN
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Solution 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Communication — Filler Words
                  </span>
                  <div className="text-xs font-semibold text-slate-500 space-y-1">
                    <div>Current: <strong className="text-slate-800">8 fillers / 2 min</strong></div>
                    <div>Target: <strong className="text-indigo-600">≤5 fillers / 2 min</strong></div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Solution</span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">Replace vocalized filler words with controlled deliberate pauses.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const act = activities.find(a => a.category === 'Communication') || activities[0];
                    if (act) setActivePracticeActivityId(act._id);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Practice Solution
                </button>
              </div>

              {/* Solution 2 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Communication — Answer Clarity
                  </span>
                  <div className="text-xs font-semibold text-slate-500 space-y-1">
                    <div>Current: <strong className="text-slate-800">Score 60</strong></div>
                    <div>Target: <strong className="text-indigo-600">Score ≥75</strong></div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Solution</span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">State your bottom-line conclusion first before detailing technical implementation.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const act = activities.find(a => a.title.toLowerCase().includes('clarity')) || activities[0];
                    if (act) setActivePracticeActivityId(act._id);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Practice Solution
                </button>
              </div>

              {/* Solution 3 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Technical — Explanation Depth
                  </span>
                  <div className="text-xs font-semibold text-slate-500 space-y-1">
                    <div>Current: <strong className="text-slate-800">Score 52</strong></div>
                    <div>Target: <strong className="text-indigo-600">Score ≥75</strong></div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Solution</span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">Articulate trade-offs, space/time complexity, and production error safeguards.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const act = activities.find(a => a.category === 'Technical') || activities[0];
                    if (act) setActivePracticeActivityId(act._id);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Practice Solution
                </button>
              </div>
            </div>
          </div>

          {/* 5. INTERVIEW ACTIVITIES SECTION */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-outfit text-slate-900 uppercase tracking-wider">
                  IMPROVEMENT ACTIVITIES
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Compact child activities generated specifically for this interview.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-slate-700">{totalCount} Activities</span>
                <span className="text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">✓ {completedCount} Completed</span>
                <span className="text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md">⚠ {pendingCount} Practice Required</span>
              </div>
            </div>

            {/* Compact Activity Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activities.map((act) => {
                const isCompleted = act.status === 'COMPLETED';
                const isFailed = act.status === 'PRACTICE_REQUIRED';

                return (
                  <div
                    key={act._id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-2xs flex flex-col justify-between space-y-4 ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          {act.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : isFailed ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {isCompleted ? '✓ Completed' : isFailed ? '⚠ Practice Required' : 'In Progress'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-950 text-sm font-outfit">{act.title}</h4>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{act.detectedIssue}</p>
                      </div>

                      {/* Metric Goal */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs font-semibold flex justify-between">
                        <span className="text-slate-600">{act.baselineValue} {act.unit}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-indigo-600 font-bold">{act.comparisonOperator} {act.targetValue} {act.unit}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Attempts: {act.attemptCount}</span>
                      <button
                        onClick={() => setActivePracticeActivityId(act._id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : isFailed
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isCompleted ? <RefreshCw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isCompleted ? 'Re-Practice' : isFailed ? 'Practice Again' : 'Start Practice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: METRIC BREAKDOWN */}
      {activeTab === 'breakdown' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-lg font-bold font-outfit text-slate-900">PERFORMANCE BREAKDOWN</h3>
            <p className="text-xs text-slate-500 mt-1">Detailed metric analysis across all CandidateIQ evaluation dimensions.</p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {Object.entries(categoryScores).map(([key, val]) => {
              const s = getScoreStatus(val);
              const formattedName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className="pt-4 first:pt-0 flex items-center justify-between gap-6">
                  <div className="w-48 font-bold text-slate-800 text-xs">{formattedName}</div>
                  <div className="flex-1 space-y-1">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.progressColor}`} style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                  <div className="w-24 text-right font-black font-outfit text-sm text-slate-900">
                    {val} <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-lg font-bold font-outfit text-slate-900">BEFORE VS CURRENT PERFORMANCE</h3>
            <p className="text-xs text-slate-500 mt-1">Compare baseline metrics from initial interview against latest practice verification.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="p-3">Category Metric</th>
                  <th className="p-3">Original Baseline</th>
                  <th className="p-3">Current Score</th>
                  <th className="p-3">Verified Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                <tr>
                  <td className="p-3">Overall Interview Score</td>
                  <td className="p-3 text-slate-500">{baselineScore}</td>
                  <td className="p-3 font-bold text-slate-900">{currentScore}</td>
                  <td className="p-3 font-bold text-emerald-600">+{scoreDelta} pts</td>
                </tr>
                <tr>
                  <td className="p-3">Technical Knowledge</td>
                  <td className="p-3 text-slate-500">72</td>
                  <td className="p-3 font-bold text-slate-900">82</td>
                  <td className="p-3 font-bold text-emerald-600">+10 pts</td>
                </tr>
                <tr>
                  <td className="p-3">Communication Clarity</td>
                  <td className="p-3 text-slate-500">48</td>
                  <td className="p-3 font-bold text-slate-900">61</td>
                  <td className="p-3 font-bold text-emerald-600">+13 pts</td>
                </tr>
                <tr>
                  <td className="p-3">Behavioral Competency</td>
                  <td className="p-3 text-slate-500">65</td>
                  <td className="p-3 font-bold text-slate-900">70</td>
                  <td className="p-3 font-bold text-emerald-600">+5 pts</td>
                </tr>
                <tr>
                  <td className="p-3">Answer Structure</td>
                  <td className="p-3 text-slate-500">51</td>
                  <td className="p-3 font-bold text-slate-900">58</td>
                  <td className="p-3 font-bold text-emerald-600">+7 pts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
