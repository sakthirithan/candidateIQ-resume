import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, GitCompare, TrendingUp, CheckCircle2, AlertTriangle, ChevronDown,
  Sparkles, FileText, Award, HelpCircle, ShieldCheck
} from 'lucide-react';
import { evidenceIntelligenceService } from '@/services/mockApi/evidenceIntelligenceService';

function InterviewComparisonPage({ onBack, defaultType = 'MOCK' }) {
  const [interviewType, setInterviewType] = useState(defaultType); // 'MOCK' | 'FINAL'
  const [interviews, setInterviews] = useState([]);
  const [selectedId1, setSelectedId1] = useState('');
  const [selectedId2, setSelectedId2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState({});

  useEffect(() => {
    loadInterviews();
  }, [interviewType]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const list = await evidenceIntelligenceService.getInterviewRecords('cand_1', interviewType);
      setInterviews(list);

      if (list.length >= 2) {
        setSelectedId1(list[0].id);
        setSelectedId2(list[1].id);
        runComparison(list[0].id, list[1].id);
      } else if (list.length === 1) {
        setSelectedId1(list[0].id);
        setSelectedId2(list[0].id);
        runComparison(list[0].id, list[0].id);
      }
    } catch (err) {
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async (id1, id2) => {
    if (!id1 || !id2) return;
    setLoading(true);
    try {
      const res = await evidenceIntelligenceService.compareInterviews(id1, id2);
      setComparison(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (sectionKey) => {
    setExpandedBreakdowns((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getDecisionBadge = (state) => {
    switch (state) {
      case 'SIGNIFICANT_IMPROVEMENT':
        return <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">🚀 Significant Improvement</span>;
      case 'IMPROVED':
        return <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">↑ Improved</span>;
      case 'SLIGHT_IMPROVEMENT':
        return <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">↗ Slight Progress</span>;
      case 'NEEDS_ATTENTION':
        return <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">⚠ Practice Recommended</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">→ Consistent Performance</span>;
    }
  };

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none animate-fadeIn py-6">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-secondary text-xs flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-slate-600" /> Back to Profile Review
          </button>
          <div>
            <h1 className="text-2xl font-black font-outfit text-slate-950 tracking-tight">Interview Comparison</h1>
            <p className="text-xs text-slate-500 font-medium">
              Select two interviews to evaluate section-by-section changes in performance, reasoning, and communication depth.
            </p>
          </div>
        </div>

        {/* Tab Filter: Mock vs Final */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setInterviewType('MOCK')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-outfit transition-all ${
              interviewType === 'MOCK' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mock Interviews
          </button>
          <button
            onClick={() => setInterviewType('FINAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-outfit transition-all ${
              interviewType === 'FINAL' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Interviews
          </button>
        </div>
      </div>

      {/* Dropdown Interview Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Interview A (Baseline)
          </label>
          <select
            value={selectedId1}
            onChange={(e) => {
              setSelectedId1(e.target.value);
              runComparison(e.target.value, selectedId2);
            }}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20"
          >
            {interviews.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.title} ({inv.date}) &bull; Overall Score {inv.overallScore}%
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Interview B (Comparison Round)
          </label>
          <select
            value={selectedId2}
            onChange={(e) => {
              setSelectedId2(e.target.value);
              runComparison(selectedId1, e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20"
          >
            {interviews.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.title} ({inv.date}) &bull; Overall Score {inv.overallScore}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Evaluating section performance differences...</p>
        </div>
      ) : comparison ? (
        <div className="space-y-8">
          {/* Resume Snapshot Warning Banner (If applicable) */}
          {comparison.usedDifferentResumes && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-950 font-outfit">Different Profile Snapshots Detected</h5>
                <p className="mt-0.5 text-amber-800 leading-relaxed font-medium">
                  These interviews were evaluated using different profile snapshots (<span className="font-mono font-bold">{comparison.int1.resumeVersionLabel}</span> vs <span className="font-mono font-bold">{comparison.int2.resumeVersionLabel}</span>). Some variations in performance reflect profile updates made between interviews.
                </p>
              </div>
            </div>
          )}

          {/* Section-by-Section Comparison Cards */}
          <div className="space-y-6">
            {(comparison.sections || []).map((sec) => {
              const isExpanded = Boolean(expandedBreakdowns[sec.key]);

              return (
                <div key={sec.key} className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-xs">
                  {/* Section Header */}
                  <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs font-outfit">
                        {sec.title.charAt(0)}
                      </div>
                      <h3 className="text-base font-extrabold font-outfit text-slate-950">{sec.title}</h3>
                    </div>
                    {getDecisionBadge(sec.decisionState)}
                  </div>

                  {/* Side-by-Side Actual Results Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Interview A Actual Result */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Interview A &bull; {comparison.int1.date}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-white text-slate-800 text-xs font-extrabold border border-slate-200 font-mono">
                          {sec.interviewA.score}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 font-outfit">{comparison.int1.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">"{sec.interviewA.feedback}"</p>
                      <div className="text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">Observation:</span> {sec.interviewA.observations}
                      </div>
                    </div>

                    {/* Right: Interview B Actual Result */}
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          Interview B &bull; {comparison.int2.date}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-extrabold font-mono shadow-xs">
                          {sec.interviewB.score}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-indigo-950 font-outfit">{comparison.int2.title}</h4>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">"{sec.interviewB.feedback}"</p>
                      <div className="text-[11px] text-indigo-900/80 font-medium">
                        <span className="font-bold text-indigo-950">Observation:</span> {sec.interviewB.observations}
                      </div>
                    </div>
                  </div>

                  {/* Comparison Feedback Narrative (~25 words) */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1.5">
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> CandidateIQ Performance Feedback
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {sec.comparisonFeedback}
                    </p>
                  </div>

                  {/* INLINE QUESTION BREAKDOWN EXPANDABLE DISCLOSURE */}
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      onClick={() => toggleBreakdown(sec.key)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        Question Breakdown & Answers ({sec.interviewA.questions.length + sec.interviewB.questions.length})
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="pt-4 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Interview A Questions */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Interview A Answers ({comparison.int1.title})
                            </span>
                            {sec.interviewA.questions.map((q, qIdx) => (
                              <div key={qIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                                <h5 className="font-bold text-slate-900 font-outfit text-[11px]">{q.question}</h5>
                                <p className="text-slate-600 font-mono text-[11px]">"{q.candidateAnswer}"</p>
                              </div>
                            ))}
                          </div>

                          {/* Interview B Questions */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                              Interview B Answers ({comparison.int2.title})
                            </span>
                            {sec.interviewB.questions.map((q, qIdx) => (
                              <div key={qIdx} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-xs">
                                <h5 className="font-bold text-indigo-950 font-outfit text-[11px]">{q.question}</h5>
                                <p className="text-slate-700 font-mono text-[11px]">"{q.candidateAnswer}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* OVERALL COMPARISON DECISION SUMMARY BOX */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white space-y-4 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2.5 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> Overall Interview Comparison Decision
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black font-outfit text-white">
                {comparison.overallDecision.strongerTitle} is stronger overall ({comparison.overallDecision.strongerScore}%)
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium max-w-3xl">
                "{comparison.overallDecision.summary}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">
          Select two interviews above to compare performance.
        </div>
      )}
    </div>
  );
}

export default InterviewComparisonPage;
