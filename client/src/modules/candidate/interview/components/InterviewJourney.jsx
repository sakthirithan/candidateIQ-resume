import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import {
  Sparkles, Brain, CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown,
  ArrowRight, FileText, Zap, RefreshCw, Play, Eye, Award, Target,
  Filter, Activity, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import CompetencyProgressWaves from './CompetencyProgressWaves';

function InterviewJourney({ onLaunchTargetedInterview, onNavigate }) {
  const navigate = useNavigate();
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [rangeFilter, setRangeFilter] = useState('all'); // 'all' | 'last5' | 'last10'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Technical' | 'Communication'
  const [selectedCompetencyWave, setSelectedCompetencyWave] = useState('all'); // 'all' | competencyId

  useEffect(() => {
    fetchInterviewJourney();
  }, []);

  const fetchInterviewJourney = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/candidates/me/interview-journey');
      if (res.data && res.data.data) {
        setJourneyData(res.data.data);
      } else {
        throw new Error('Interview journey format invalid');
      }
    } catch (err) {
      console.error('[InterviewJourney] Error loading interview journey:', err);
      setError('Unable to load your interview journey records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto animate-pulse">
        <div className="saas-card p-6 md:p-8 h-32 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="saas-card p-6 h-28 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="saas-card h-80 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 saas-card">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-outfit text-slate-950">{error}</h3>
        <p className="text-xs text-slate-500">Please check your database connection or refresh your session.</p>
        <button
          onClick={fetchInterviewJourney}
          className="btn-ai text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Journey
        </button>
      </div>
    );
  }

  const overview = journeyData?.overview || {};
  const rawOverallTrend = journeyData?.overallTrend || [];
  const rawCompetencies = journeyData?.competencySummary || [];
  const biggestImprovements = journeyData?.biggestImprovements || [];
  const areasNeedingAttention = journeyData?.areasNeedingAttention || [];

  // Filter trends by rangeFilter
  let overallTrend = [...rawOverallTrend];
  if (rangeFilter === 'last5') {
    overallTrend = overallTrend.slice(-5);
  } else if (rangeFilter === 'last10') {
    overallTrend = overallTrend.slice(-10);
  }

  // Filter competencies by categoryFilter
  let competencies = [...rawCompetencies];
  if (categoryFilter !== 'all') {
    competencies = competencies.filter(c => c.category?.toLowerCase() === categoryFilter.toLowerCase());
  }

  const handlePointClick = (data) => {
    if (data && data.interviewId) {
      navigate(`/mock-interview/review/${data.interviewId}`);
    }
  };

  const navigateToActivity = (activityId) => {
    if (activityId) {
      navigate(`/activities?activityId=${activityId}`);
    } else {
      navigate('/activities');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* 1. Header Banner & Filter Controls */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-950 tracking-tight">Interview Journey</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Longitudinal Performance Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Candidate-level performance memory calculated across all persisted mock interview attempts in database.
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={rangeFilter}
              onChange={(e) => setRangeFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="last5">Last 5 Attempts</option>
              <option value="last10">Last 10 Attempts</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical Only</option>
              <option value="Communication">Communication Only</option>
            </select>
          </div>

          <button
            onClick={() => onNavigate ? onNavigate('interview') : navigate('/interview')}
            className="btn-ai text-xs flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Start New Interview
          </button>
        </div>
      </div>

      {/* 2. Top Overview Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="saas-card p-5 border border-slate-200/80 space-y-1 bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overall Performance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-outfit text-indigo-600">{overview.currentScore || 0}</span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {overview.improvement >= 0 ? `+${overview.improvement}` : overview.improvement} pts since baseline
          </div>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 space-y-1 bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mock Sessions</span>
          <div className="text-3xl font-black font-outfit text-slate-950">{overview.totalInterviews || 0}</div>
          <span className="text-[11px] font-medium text-slate-500 block pt-1">
            {overview.totalAttempts || 0} Evaluated Attempt Records
          </span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 space-y-1 bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Strongest Competency</span>
          <div className="text-lg font-extrabold font-outfit text-slate-900 truncate">
            {overview.strongestArea?.name || 'Not Evaluated'}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 block pt-1">
            {overview.strongestArea?.score ? `Current Score: ${overview.strongestArea.score} / 100` : 'Complete interviews'}
          </span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 space-y-1 bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Needs Attention</span>
          <div className="text-lg font-extrabold font-outfit text-slate-900 truncate">
            {overview.needsMostImprovement?.name || 'All Target Met'}
          </div>
          <span className="text-[11px] font-bold text-amber-600 block pt-1">
            {overview.needsMostImprovement?.score ? `Current: ${overview.needsMostImprovement.score} (Gap: -${overview.needsMostImprovement.gap})` : 'Target scores achieved'}
          </span>
        </div>
      </div>

      {/* 3. Primary Overall Performance Trend Wave Graph */}
      <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Overall Performance Progression
            </h3>
            <p className="text-xs text-slate-500">
              Longitudinal score wave plotted across evaluated attempt records. Click any point to review that specific attempt.
            </p>
          </div>
          {overallTrend.length > 0 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Baseline: {overview.initialScore} $\rightarrow$ Latest: {overview.currentScore}
            </span>
          )}
        </div>

        {overallTrend.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-100">
            <Brain className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No completed interview attempts stored in database.</p>
            <button onClick={() => navigate('/interview')} className="btn-ai text-xs">Complete First Mock Interview</button>
          </div>
        ) : overallTrend.length === 1 ? (
          <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-bold bg-indigo-50 px-4 py-2 rounded-xl">
              ✓ Initial Baseline Attempt Recorded: Score {overallTrend[0].overallScore}
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Complete your second AI mock interview to generate your longitudinal improvement wave.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overallTrend} onClick={(e) => e && e.activePayload && handlePointClick(e.activePayload[0]?.payload)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                          <div className="font-bold text-indigo-300">Attempt #{data.attemptNumber}: {data.title}</div>
                          <div className="text-[11px] text-slate-400">{data.date}</div>
                          <div className="text-sm font-black text-emerald-400">Overall Score: {data.overallScore} / 100</div>
                          <div className="text-[10px] text-slate-400">Click point to view interview details</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="overallScore"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#6366f1', cursor: 'pointer' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Section / Competency Progress Waves (Standalone Component) */}
      <CompetencyProgressWaves
        data={overallTrend}
        onPointClick={handlePointClick}
      />

      {/* 5. Performance Breakdown by Section Cards (Current State Summary) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" /> Performance Breakdown by Section
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing {competencies.length} canonical competency dimensions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {competencies.map((comp) => {
            const isImproving = comp.improvement > 0;
            const isDeclining = comp.improvement < 0;

            return (
              <div
                key={comp.id}
                className="saas-card p-5 border border-slate-200/90 hover:border-indigo-300 transition-all space-y-4 bg-white hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {comp.category}
                    </span>
                    {isImproving ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +{comp.improvement} ↑
                      </span>
                    ) : isDeclining ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> {comp.improvement} ↓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Stable
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold font-outfit text-slate-950 leading-snug">{comp.name}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black font-outfit text-indigo-600">{comp.currentScore}</span>
                      <span className="text-xs text-slate-400 font-medium">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Sub-metrics Grid */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, comp.currentScore))}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                    <div>Initial: <span className="font-bold text-slate-800">{comp.initialScore}</span></div>
                    <div>Best: <span className="font-bold text-slate-800">{comp.bestScore}</span></div>
                    <div>Avg: <span className="font-bold text-slate-800">{comp.averageScore}</span></div>
                    <div>Target: <span className="font-bold text-indigo-600">{comp.targetScore}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Biggest Improvements & 7. Areas Needing Attention Dual Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Improvements */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" /> Biggest Competency Improvements
            </h3>
            <p className="text-xs text-slate-500">Largest positive score progression calculated from first baseline attempt.</p>
          </div>

          {biggestImprovements.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No competency score gains recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {biggestImprovements.slice(0, 5).map(item => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>{item.name}</span>
                    <span className="text-emerald-600">+{item.improvement} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, item.improvement * 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Areas Needing Attention connected to Activities */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" /> Areas Needing Attention
            </h3>
            <p className="text-xs text-slate-500">Competencies below target score connected to actionable practice activities.</p>
          </div>

          {areasNeedingAttention.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
              ✓ Excellent! All evaluated competencies meet or exceed target threshold goals.
            </div>
          ) : (
            <div className="space-y-3">
              {areasNeedingAttention.slice(0, 4).map(area => (
                <div key={area.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-950">{area.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Current: <span className="font-bold text-slate-800">{area.currentScore}</span> / Target: <span className="font-bold text-indigo-600">{area.targetScore}</span> (Gap: -{area.gap})
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToActivity(area.activityId)}
                    className="btn-ai text-[11px] py-1.5 px-3 shrink-0 flex items-center gap-1 font-bold"
                  >
                    {area.activityId ? 'Continue Activity' : 'Start Improvement'} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewJourney;
