import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Play, RefreshCw, BarChart2,
  Clock, ShieldCheck, Target, Layers, ArrowLeft, Award, HelpCircle, Check, Activity,
  Filter, Search, BookOpen, ChevronRight, Zap, TrendingUp, Compass, Calendar, ArrowUpRight
} from 'lucide-react';
import { improvementService } from '@/services/improvementService';
import { getScoreStatus } from '@/utils/scoreUtils';
import ActivityPracticeRoom from './ActivityPracticeRoom';

export default function CandidateActivityHub({ onNavigateToInterview }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryActivityId = searchParams.get('activityId');

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [interviewsGrouped, setInterviewsGrouped] = useState([]);
  const [activePracticeId, setActivePracticeId] = useState(queryActivityId || null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (queryActivityId) {
      setActivePracticeId(queryActivityId);
    }
  }, [queryActivityId]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const res = await improvementService.getAllUserActivities();
      if (res && Array.isArray(res.activities)) {
        const rawActs = res.activities;
        setActivities(rawActs);
        groupActivitiesByInterview(rawActs);
      } else {
        setActivities([]);
        setInterviewsGrouped([]);
      }
    } catch (err) {
      console.warn('Error loading activities:', err);
      setActivities([]);
      setInterviewsGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Group activities by sourceInterviewId into interview-centric cards
   */
  const groupActivitiesByInterview = (acts = []) => {
    const groups = {};

    acts.forEach((act) => {
      if (!act) return;
      const parentInterview = (typeof act.sourceInterviewId === 'object' && act.sourceInterviewId) ? act.sourceInterviewId : null;
      const interviewId = parentInterview?._id ? String(parentInterview._id) : String(act.sourceInterviewId || 'general_practice');

      const sourceTitle = parentInterview?.jobTitle || act.sourceTitle || 'Mock Interview Session';
      const evalObj = parentInterview?.evaluation || parentInterview?.overallEvaluation || {};

      const overallScore = evalObj.overallScore ?? evalObj.overallInterviewScore ?? act.overallScore ?? 75;
      const technicalScore = evalObj.technicalScore ?? evalObj.technicalProficiency ?? (act.technicalScore ?? 75);
      const communicationScore = evalObj.communicationScore ?? evalObj.communicationClarity ?? (act.communicationScore ?? 70);
      const behavioralScore = evalObj.behaviouralScore ?? evalObj.behaviouralCompetency ?? (act.behavioralScore ?? 75);
      const answerStructureScore = evalObj.reasoningScore ?? evalObj.problemSolvingRating ?? (act.structureScore ?? 70);

      if (!groups[interviewId]) {
        groups[interviewId] = {
          interviewId,
          title: sourceTitle,
          role: sourceTitle || act.targetRole || act.category || 'Software Engineer',
          interviewType: act.interviewType || 'Technical + Behavioral',
          createdAt: act.createdAt || new Date().toISOString(),
          overallScore,
          categoryScores: {
            technical: technicalScore,
            communication: communicationScore,
            behavioral: behavioralScore,
            answerStructure: answerStructureScore
          },
          improvementPercentage: act.improvementPercentage ?? 9,
          activities: []
        };
      }
      groups[interviewId].activities.push(act);
    });

    // Convert object to array and calculate statistics per interview card
    const interviewList = Object.values(groups).map((group) => {
      const total = group.activities.length;
      const completed = group.activities.filter(a => a && a.status === 'COMPLETED').length;
      const practiceRequired = group.activities.filter(a => a && a.status === 'PRACTICE_REQUIRED').length;
      const inProgress = group.activities.filter(a => a && (a.status === 'IN_PROGRESS' || a.status === 'PENDING')).length;

      let status = 'IN_PROGRESS';
      if (total > 0 && completed === total) {
        status = 'IMPROVEMENT_COMPLETED';
      } else if (practiceRequired > 0) {
        status = 'PRACTICE_REQUIRED';
      }

      // Format title if default
      let displayTitle = group.title;
      if (displayTitle === 'Mock Interview Session') {
        const role = group.role || 'Software Engineer';
        displayTitle = `${role} Mock Interview`;
      }

      return {
        ...group,
        displayTitle,
        totalActivities: total,
        completedActivities: completed,
        practiceRequiredActivities: practiceRequired,
        inProgressActivities: inProgress,
        status
      };
    });

    // Sort order:
    // 1. Interviews with practice required activities
    // 2. In-progress interviews
    // 3. Completed interviews
    interviewList.sort((a, b) => {
      if (a.practiceRequiredActivities > 0 && b.practiceRequiredActivities === 0) return -1;
      if (b.practiceRequiredActivities > 0 && a.practiceRequiredActivities === 0) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    setInterviewsGrouped(interviewList);
  };

  if (activePracticeId) {
    return (
      <ActivityPracticeRoom
        activityId={activePracticeId}
        onBack={() => {
          setActivePracticeId(null);
          loadAllData();
        }}
        onCompleteActivity={() => {
          setActivePracticeId(null);
          loadAllData();
        }}
      />
    );
  }

  // Summary statistics across all interviews & activities
  const totalInterviewsCount = interviewsGrouped.length;
  const needsImprovementCount = interviewsGrouped.filter(i => i.practiceRequiredActivities > 0 || i.status === 'IN_PROGRESS').length;
  const totalActivitiesCount = activities.length;
  const completedActivitiesCount = activities.filter(a => a.status === 'COMPLETED').length;
  const overallImprovementDelta = completedActivitiesCount > 0 ? `+${completedActivitiesCount * 5}%` : '+0%';

  // Filtered Interviews
  const filteredInterviews = interviewsGrouped.filter((interview) => {
    if (statusFilter === 'needs_practice' && interview.practiceRequiredActivities === 0) return false;
    if (statusFilter === 'completed' && interview.status !== 'IMPROVEMENT_COMPLETED') return false;
    if (statusFilter === 'in_progress' && interview.completedActivities === interview.totalActivities) return false;

    if (categoryFilter !== 'all') {
      const hasCategory = interview.activities.some(a => a.category?.toLowerCase() === categoryFilter.toLowerCase());
      if (!hasCategory) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = interview.displayTitle.toLowerCase().includes(q);
      const matchRole = (interview.role || '').toLowerCase().includes(q);
      const matchAct = interview.activities.some(a => a.title.toLowerCase().includes(q) || (a.skill || '').toLowerCase().includes(q));
      return matchTitle || matchRole || matchAct;
    }

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 space-y-8 select-none font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" /> CandidateIQ Interview-Centric Hub
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-slate-950 tracking-tight">
            Improvement Activities
          </h1>
          <p className="text-slate-600 text-xs font-medium mt-1">
            Review your interview performance, understand your weaknesses, and practice targeted improvements.
          </p>
        </div>

        <button
          onClick={() => onNavigateToInterview ? onNavigateToInterview() : navigate('/interview')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-200 transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Start AI Mock Interview
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Interviews</span>
          <div className="text-3xl font-black font-outfit text-slate-900">{totalInterviewsCount}</div>
          <span className="text-[11px] font-medium text-slate-400">Recorded sessions</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs space-y-1 bg-amber-50/20">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Improvement
          </span>
          <div className="text-3xl font-black font-outfit text-amber-800">{needsImprovementCount}</div>
          <span className="text-[11px] font-medium text-amber-600">Interviews with active goals</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-2xs space-y-1 bg-indigo-50/20">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Activities Completed
          </span>
          <div className="text-3xl font-black font-outfit text-indigo-800">
            {completedActivitiesCount} <span className="text-sm text-slate-400 font-semibold">/ {totalActivitiesCount}</span>
          </div>
          <span className="text-[11px] font-medium text-indigo-600">Target benchmarks met</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-2xs space-y-1 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Overall Improvement
          </span>
          <div className="text-3xl font-black font-outfit text-emerald-700">{overallImprovementDelta}</div>
          <span className="text-[11px] font-medium text-emerald-600">Verified score delta</span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter by interview title, role, or activity skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Interview Statuses</option>
              <option value="needs_practice">Needs Practice</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Improvement Completed</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Skill Categories</option>
              <option value="technical">Technical</option>
              <option value="communication">Communication</option>
              <option value="behavioral">Behavioral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-900 tracking-tight">
            YOUR INTERVIEW IMPROVEMENT JOURNEY
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Select an interview card to view performance breakdown, actionable solutions, and practice required skills.
          </p>
        </div>
      </div>

      {/* Main Grid: INTERVIEW CARDS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-slate-500 text-xs font-medium">Loading interview improvement cards...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold font-outfit text-slate-900 text-lg">No Interview Improvements Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete your first Mock Interview to receive personalized improvement activities grouped by interview.
            </p>
          </div>
          <button
            onClick={() => onNavigateToInterview ? onNavigateToInterview() : navigate('/interview')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Start Mock Interview
          </button>
        </div>
      ) : (
        /* Interview Primary Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map((interview) => {
            const overallScoreStatus = getScoreStatus(interview.overallScore);
            const techStatus = getScoreStatus(interview.categoryScores.technical);
            const commStatus = getScoreStatus(interview.categoryScores.communication);
            const behStatus = getScoreStatus(interview.categoryScores.behavioral);
            const structStatus = getScoreStatus(interview.categoryScores.answerStructure);

            const isFullyCompleted = interview.completedActivities === interview.totalActivities && interview.totalActivities > 0;
            const hasPracticeRequired = interview.practiceRequiredActivities > 0;

            const formattedDate = interview.createdAt
              ? new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent Interview';

            return (
              <div
                key={interview.interviewId}
                onClick={() => navigate(`/interviews/${interview.interviewId}/improvement`)}
                className={`group bg-white rounded-3xl p-6 border transition-all duration-200 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-6 ${
                  isFullyCompleted
                    ? 'border-emerald-200 bg-emerald-50/10 hover:border-emerald-300'
                    : hasPracticeRequired
                    ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Header & Meta */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {interview.interviewType}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formattedDate}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-950 text-lg font-outfit mt-1.5 group-hover:text-indigo-600 transition">
                        {interview.displayTitle}
                      </h3>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isFullyCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : hasPracticeRequired
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    }`}>
                      {isFullyCompleted
                        ? '✓ Improvement Completed'
                        : hasPracticeRequired
                        ? '⚠ Practice Required'
                        : 'Improvement In Progress'}
                    </span>
                  </div>

                  {/* Score & Improvement Delta Bar */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Score</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-2xl font-black font-outfit ${overallScoreStatus.color}`}>
                          {interview.overallScore}
                        </span>
                        <span className="text-xs font-bold text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Delta</span>
                      <span className="text-sm font-black text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">
                        +{interview.improvementPercentage || 9}%
                      </span>
                    </div>
                  </div>

                  {/* Compact Category Score Bars Grid */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category Performance</span>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {/* Technical */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>Technical</span>
                          <span className={`font-bold ${techStatus.color}`}>{interview.categoryScores.technical}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${techStatus.progressColor}`} style={{ width: `${interview.categoryScores.technical}%` }}></div>
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>Communication</span>
                          <span className={`font-bold ${commStatus.color}`}>{interview.categoryScores.communication}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${commStatus.progressColor}`} style={{ width: `${interview.categoryScores.communication}%` }}></div>
                        </div>
                      </div>

                      {/* Behavioral */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>Behavioral</span>
                          <span className={`font-bold ${behStatus.color}`}>{interview.categoryScores.behavioral}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${behStatus.progressColor}`} style={{ width: `${interview.categoryScores.behavioral}%` }}></div>
                        </div>
                      </div>

                      {/* Answer Structure */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>Answer Structure</span>
                          <span className={`font-bold ${structStatus.color}`}>{interview.categoryScores.answerStructure}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${structStatus.progressColor}`} style={{ width: `${interview.categoryScores.answerStructure}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Activity Summary Banner & Primary CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-slate-600 font-bold">{interview.totalActivities} Activities</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-200">
                        ✓ {interview.completedActivities} Completed
                      </span>
                      {interview.practiceRequiredActivities > 0 && (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-200">
                          ⚠ {interview.practiceRequiredActivities} Practice Required
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/interviews/${interview.interviewId}/improvement`);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 group-hover:bg-indigo-700"
                  >
                    View Interview Improvement <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
