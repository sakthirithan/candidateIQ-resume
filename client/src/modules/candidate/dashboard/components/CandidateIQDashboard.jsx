import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import { getCurrentUser } from '@/utils/auth';
import {
  Sparkles, FileText, Play, RefreshCw, AlertCircle, Brain, Zap,
  CheckCircle2, ArrowRight, ShieldCheck, UserCheck, BookOpen
} from 'lucide-react';
import CandidateScoreCard from '../../mock-interview/components/CandidateScoreCard';
import { InterviewTimelineCard } from '@/modules/shared';

export default function CandidateIQDashboard({ onNavigate }) {
  const currentUser = getCurrentUser();
  const displayName = currentUser ? currentUser.name : 'Candidate';

  // Data States
  const [profile, setProfile] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [activitiesData, setActivitiesData] = useState({ activities: [], summary: { total: 0, completed: 0 } });
  const [myResume, setMyResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const intelUrl = forceRefresh ? '/candidates/me/intelligence?refresh=true' : '/candidates/me/intelligence';

      const [profRes, intelRes, intRes, actRes, resRes] = await Promise.all([
        api.get('/candidates/profile').catch(() => ({ data: { profile: null } })),
        api.get(intelUrl).catch(() => ({ data: { data: null } })),
        api.get('/interviews/candidate').catch(() => ({ data: { interviews: [] } })),
        api.get('/activities').catch(() => ({ data: { activities: [], summary: { total: 0, completed: 0 } } })),
        api.get('/resumes/my-resume').catch(() => ({ data: { resume: null } }))
      ]);

      if (profRes.data?.profile) setProfile(profRes.data.profile);
      if (intelRes.data?.data) setIntelligence(intelRes.data.data);
      if (intRes.data?.interviews) setInterviews(intRes.data.interviews);
      if (actRes.data) {
        setActivitiesData({
          activities: actRes.data.activities || [],
          summary: actRes.data.summary || { total: 0, completed: 0 }
        });
      }
      if (resRes.data?.resume) setMyResume(resRes.data.resume);

    } catch (err) {
      console.error('[CandidateIQDashboard] Error loading dashboard data:', err);
      setError("Failed to load candidate intelligence dashboard. Please check server connectivity.");
    } finally {
      setLoading(false);
    }
  };

  // Derived Metrics & State Calculations
  const completedInterviews = useMemo(() => {
    return interviews.filter(i =>
      i.status === 'completed' || i.status === 'Completed' || i.overallEvaluation || i.evaluation
    );
  }, [interviews]);

  const latestCompletedInterview = useMemo(() => {
    if (!completedInterviews.length) return null;
    return completedInterviews[0];
  }, [completedInterviews]);

  // Real Profile Completion Percentage
  const profileCompletionPct = useMemo(() => {
    if (!profile) return 30;
    let score = 20; // Base registered user
    if (profile.personalInfo?.headline) score += 20;
    if (profile.skills?.technical?.length > 0 || myResume?.keywords?.length > 0) score += 20;
    if (profile.experience?.length > 0) score += 20;
    if (profile.projects?.length > 0) score += 20;
    return score;
  }, [profile, myResume]);

  // Real Competency Evidence Summary
  const evaluationCounts = useMemo(() => {
    if (!intelligence?.technicalSkills || intelligence.technicalSkills.length === 0) {
      return null;
    }
    const skills = intelligence.technicalSkills;
    const supported = skills.filter(s => s.score >= 80 || s.evidence?.mockInterviewScores?.length > 0).length;
    const partial = skills.filter(s => s.score >= 50 && s.score < 80).length;
    const contradicted = skills.filter(s => s.score < 50 && s.evidence?.mockInterviewScores?.length > 0).length;

    return { supported, partial, contradicted, total: skills.length };
  }, [intelligence]);

  // Recommended Next Step Selector Logic (Priority-based)
  const recommendedStep = useMemo(() => {
    // Priority 1: No Resume
    if (!myResume && (!profile?.resumeReference?.resumeId)) {
      return {
        title: 'Upload Resume for ATS Intelligence',
        description: 'Upload your resume to extract core technical skills, evaluate ATS quality score, and unlock target interview practice.',
        primaryText: 'Upload Resume',
        primaryIcon: FileText,
        primaryTab: 'resume-intelligence',
        secondaryText: 'Complete Profile',
        secondaryTab: 'profile'
      };
    }

    // Priority 2: Resume exists but not analyzed
    const resumeQualityVal = intelligence?.resumeQuality?.value;
    if (myResume && (resumeQualityVal === undefined || resumeQualityVal === null)) {
      return {
        title: 'Run Resume ATS Analysis',
        description: 'Analyze your uploaded resume against real target job requisitions to identify missing keywords and formatting improvements.',
        primaryText: 'Run ATS Analysis',
        primaryIcon: FileText,
        primaryTab: 'resume-intelligence',
        secondaryText: null,
        secondaryTab: null
      };
    }

    // Priority 3: No Completed Mock Interview
    if (!latestCompletedInterview) {
      return {
        title: 'Complete First AI Mock Interview',
        description: 'Take a 5-minute interactive AI mock interview to generate evidence-backed skill ratings and performance feedback.',
        primaryText: 'Start AI Mock Interview',
        primaryIcon: Play,
        primaryTab: 'interview',
        secondaryText: 'Explore Journey',
        secondaryTab: 'interview-journey'
      };
    }

    // Priority 4: Actionable Weakness in Evaluation / Outstanding Activities
    const pendingAct = activitiesData.activities.find(a => a.status === 'PENDING' || a.status === 'PRACTICE_REQUIRED');
    if (pendingAct) {
      return {
        title: `Practice ${pendingAct.title || pendingAct.competencyName}`,
        description: pendingAct.description || 'Targeted practice session derived from your recent interview evaluation to close skill gaps.',
        primaryText: 'Start Practice Session',
        primaryIcon: Zap,
        primaryTab: 'activities',
        secondaryText: 'View All Activities',
        secondaryTab: 'activities'
      };
    }

    // Priority 5: Evaluation & Improvement Data Exist -> Review & Reassess
    return {
      title: 'Review Skill Matrix & Reassess',
      description: 'Your recent interview evaluation and improvement tasks are up to date. Re-attempt a mock session to raise overall Candidate IQ.',
      primaryText: 'Review Skill Matrix',
      primaryIcon: Sparkles,
      primaryTab: 'skills',
      secondaryText: 'Re-attempt Mock Session',
      secondaryTab: 'interview'
    };
  }, [myResume, profile, intelligence, latestCompletedInterview, activitiesData]);

  // Real Timeline Activity Events
  const timelineActivities = useMemo(() => {
    const events = [];

    completedInterviews.forEach((inv) => {
      const score = inv.overallEvaluation?.overallInterviewScore ||
        inv.overallEvaluation?.technicalProficiency ||
        inv.evaluation?.overallScore ||
        inv.score;

      const dateObj = inv.createdAt ? new Date(inv.createdAt) : new Date();
      events.push({
        id: inv._id || inv.id,
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateStr: dateObj.toLocaleDateString(),
        title: `AI Mock Interview — ${inv.jobTitle || inv.targetSkill || inv.interviewType || 'General'}`,
        type: 'mock',
        status: 'completed',
        score: score ? Number(score) : undefined
      });
    });

    if (myResume) {
      const resDate = myResume.updatedAt ? new Date(myResume.updatedAt) : new Date();
      events.unshift({
        id: 'res_event',
        time: resDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateStr: resDate.toLocaleDateString(),
        title: `Resume Parsed (${myResume.keywords?.length || 0} skills extracted)`,
        type: 'resume',
        status: 'completed'
      });
    }

    return events.slice(0, 5);
  }, [completedInterviews, myResume]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto animate-pulse">
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-48 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{error}</h3>
        <p className="text-xs text-slate-500">Please verify connection or refresh session.</p>
        <button
          onClick={() => fetchDashboardData(true)}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Dashboard
        </button>
      </div>
    );
  }

  const resume = intelligence?.resumeQuality || {};
  const tech = intelligence?.technicalScore || {};
  const candName = profile?.personalInfo?.name || displayName;
  const isVerified = profile?.isVerified || false;
  const extractedSkillsCount = myResume?.keywords?.length || profile?.skills?.technical?.length || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto font-sans">
      {/* 1. Compact Candidate Readiness & Next Steps Panel (Replaces Oversized Top Banner) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Candidate Readiness */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-outfit text-slate-900 leading-none">Candidate Readiness</h2>
                <span className="text-[11px] text-slate-500 font-medium">Real-time profile & evidence status for {candName}</span>
              </div>
            </div>
            {isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Profile
              </span>
            )}
          </div>

          {/* Status Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block font-medium">Profile Completion</span>
              <span className="font-bold text-slate-900 text-sm">{profileCompletionPct}%</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${profileCompletionPct}%` }}></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block font-medium">Resume Status</span>
              <span className="font-bold text-slate-900 text-sm">
                {myResume ? `Parsed (${myResume.keywords?.length || 0} skills)` : 'Not Uploaded'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {myResume ? `Updated ${new Date(myResume.updatedAt).toLocaleDateString()}` : 'Upload required'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block font-medium">Latest Mock Session</span>
              <span className="font-bold text-slate-900 text-sm">
                {latestCompletedInterview
                  ? `${latestCompletedInterview.overallEvaluation?.overallInterviewScore || latestCompletedInterview.score || 80}% Score`
                  : 'None Completed'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {latestCompletedInterview ? new Date(latestCompletedInterview.createdAt).toLocaleDateString() : 'Awaiting first attempt'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block font-medium">Skill Evidence</span>
              <span className="font-bold text-slate-900 text-sm">
                {extractedSkillsCount} Extracted & Declared
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">From resume & profile data</span>
            </div>
          </div>

          {/* Competency Evaluation Evidence Summary */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Competency Evaluation:</span>
            {evaluationCounts ? (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  {evaluationCounts.supported} Supported
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                  {evaluationCounts.partial} Partial
                </span>
                {evaluationCounts.contradicted > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                    {evaluationCounts.contradicted} Contradiction
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs">No competency evaluation yet</span>
            )}
          </div>
        </div>

        {/* Right Column — Recommended Next Step */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">Recommended Next Step</span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{recommendedStep.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{recommendedStep.description}</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate(recommendedStep.primaryTab)}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <recommendedStep.primaryIcon className="w-4 h-4" />
              <span>{recommendedStep.primaryText}</span>
            </button>

            {recommendedStep.secondaryText && (
              <button
                onClick={() => onNavigate(recommendedStep.secondaryTab)}
                className="px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition shadow-xs"
              >
                {recommendedStep.secondaryText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Four Key Performance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resume ATS Quality Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume ATS Quality</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black font-outfit text-slate-900">
              {resume.value ? `${resume.value}%` : 'Not Assessed'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {resume.dataAvailable ? `✓ ${resume.criteria?.length || 0} Criteria Analyzed` : 'Upload resume to evaluate ATS quality'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('resume-intelligence')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1"
          >
            {resume.dataAvailable ? 'View ATS Analysis' : 'Run ATS Analysis'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Latest Mock Interview Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Mock Interview</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black font-outfit text-slate-900">
              {latestCompletedInterview
                ? `${latestCompletedInterview.overallEvaluation?.overallInterviewScore || latestCompletedInterview.score || 80}%`
                : 'No Attempts'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {latestCompletedInterview
                ? `Completed ${new Date(latestCompletedInterview.createdAt).toLocaleDateString()}`
                : 'No mock interview recorded yet'}
            </p>
          </div>

          <button
            onClick={() => onNavigate(latestCompletedInterview ? 'activities' : 'interview')}
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 pt-1"
          >
            {latestCompletedInterview ? 'Review Attempt' : 'Start Mock Session'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Extracted & Declared Skills Card (Truthful Label) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extracted & Declared Skills</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black font-outfit text-slate-900">
              {extractedSkillsCount} Skills
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {tech.skillsEvaluatedCount ? `${tech.skillsEvaluatedCount} Skills with Evidence` : 'Extracted from uploaded resume'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('skills')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 pt-1"
          >
            Skill Matrix <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Improvement Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Improvement Progress</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black font-outfit text-slate-900">
              {activitiesData.summary.completed} / {activitiesData.summary.total} Done
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activitiesData.summary.total > 0
                ? `${Math.round((activitiesData.summary.completed / activitiesData.summary.total) * 100)}% Tasks Completed`
                : 'No active improvement tasks'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('activities')}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 pt-1"
          >
            View Activities <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. Concise Recent Interview Performance Section */}
      <InterviewTimelineCard
        activities={timelineActivities}
        onActionClick={() => onNavigate('hr-interviews')}
      />

      {/* 4. Concise Candidate Journey Progression */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold font-outfit text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Candidate Journey Progression
          </h3>
          <button
            onClick={() => onNavigate('interview-journey')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            View Full Journey <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${myResume ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">1. Resume Parsed</span>
              {myResume ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
            </div>
            <p className="text-[11px] text-slate-500">
              {myResume ? `${myResume.keywords?.length || 0} skills extracted` : 'Upload resume to start'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${completedInterviews.length > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">2. Mock Interview</span>
              {completedInterviews.length > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
            </div>
            <p className="text-[11px] text-slate-500">
              {completedInterviews.length > 0 ? `${completedInterviews.length} Attempt(s) logged` : 'Take your first session'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${latestCompletedInterview ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">3. Evaluation Report</span>
              {latestCompletedInterview ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
            </div>
            <p className="text-[11px] text-slate-500">
              {latestCompletedInterview ? 'AI Report generated' : 'Pending completion'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${activitiesData.summary.completed > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">4. Skill Improvement</span>
              {activitiesData.summary.completed > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
            </div>
            <p className="text-[11px] text-slate-500">
              {activitiesData.summary.completed > 0 ? `${activitiesData.summary.completed} Tasks completed` : 'Complete practice sessions'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
