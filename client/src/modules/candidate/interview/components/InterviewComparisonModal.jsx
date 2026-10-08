import React, { useState, useEffect } from 'react';
import {
  X, GitCompare, ArrowRight, TrendingUp, CheckCircle2, AlertTriangle,
  Sparkles, FileText, Award, HelpCircle
} from 'lucide-react';
import { evidenceIntelligenceService } from '@/services/mockApi/evidenceIntelligenceService';

function InterviewComparisonModal({ isOpen, onClose, interviewType = 'MOCK', initialInterviews = [] }) {
  const [interviews, setInterviews] = useState([]);
  const [selectedId1, setSelectedId1] = useState('');
  const [selectedId2, setSelectedId2] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInterviews();
    }
  }, [isOpen, interviewType]);

  const loadInterviews = async () => {
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
  };

  const runComparison = async (id1, id2) => {
    if (!id1 || !id2) return;
    setLoading(true);
    try {
      const res = await evidenceIntelligenceService.compareInterviews(id1, id2);
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleId1Change = (e) => {
    const val = e.target.value;
    setSelectedId1(val);
    if (selectedId2) runComparison(val, selectedId2);
  };

  const handleId2Change = (e) => {
    const val = e.target.value;
    setSelectedId2(val);
    if (selectedId1) runComparison(selectedId1, val);
  };

  if (!isOpen) return null;

  const isMock = interviewType === 'MOCK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-0 relative">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-20 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-outfit text-white">
                Compare {isMock ? 'Mock' : 'Final'} Interviews
              </h3>
              <p className="text-xs text-slate-400">See how your answers and explanations improved between practice rounds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Interview Selection Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                First Interview Record
              </label>
              <select
                value={selectedId1}
                onChange={handleId1Change}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20"
              >
                {interviews.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title} ({inv.date}) — Score {inv.overallScore}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Second Interview Record
              </label>
              <select
                value={selectedId2}
                onChange={handleId2Change}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20"
              >
                {interviews.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title} ({inv.date}) — Score {inv.overallScore}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Analyzing interview progress...</p>
            </div>
          ) : comparisonResult ? (
            <div className="space-y-6">
              {/* Resume Version Difference Warning if applicable */}
              {comparisonResult.usedDifferentResumes && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-950">Different Profile Versions Used</h5>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      These interviews were conducted against different resume snapshots (<span className="font-mono font-bold">{comparisonResult.int1.resumeVersionLabel}</span> vs <span className="font-mono font-bold">{comparisonResult.int2.resumeVersionLabel}</span>). Some differences in feedback stem from profile updates made between interviews.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Summary Hero Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3 relative overflow-hidden shadow-md">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> Progress Analysis
                </div>
                <h4 className="text-base font-bold font-outfit text-white leading-relaxed">
                  "{comparisonResult.narrative}"
                </h4>
                <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-800/80 text-slate-300 font-medium">
                  <span>Score Delta: <strong className={`font-bold ${comparisonResult.scoreDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{comparisonResult.scoreDiff >= 0 ? `+${comparisonResult.scoreDiff}%` : `${comparisonResult.scoreDiff}%`}</strong></span>
                  <span>&bull;</span>
                  <span>Compare: {comparisonResult.int1.overallScore}% &rarr; {comparisonResult.int2.overallScore}%</span>
                </div>
              </div>

              {/* Side by Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interview 1 Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Baseline</span>
                      <h5 className="text-sm font-bold text-slate-900 font-outfit">{comparisonResult.int1.title}</h5>
                      <span className="text-xs text-slate-500 font-medium">{comparisonResult.int1.date}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-sm">
                      {comparisonResult.int1.overallScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                    "{comparisonResult.int1.finalFeedback || 'Good foundational response.'}"
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Resume used:</span> {comparisonResult.int1.resumeVersionLabel}
                  </div>
                </div>

                {/* Interview 2 Card */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Comparison Round</span>
                      <h5 className="text-sm font-bold text-indigo-950 font-outfit">{comparisonResult.int2.title}</h5>
                      <span className="text-xs text-indigo-700/80 font-medium">{comparisonResult.int2.date}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-sm">
                      {comparisonResult.int2.overallScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-indigo-100 text-xs text-slate-700 leading-relaxed font-medium">
                    "{comparisonResult.int2.finalFeedback || 'Strong technical explanation.'}"
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Resume used:</span> {comparisonResult.int2.resumeVersionLabel}
                  </div>
                </div>
              </div>

              {/* What Improved Section */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Notable Performance Progress
                </h5>
                <div className="space-y-2">
                  {comparisonResult.improvements.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 font-medium flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">
              Select two interviews to generate comparative progress evaluation.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewComparisonModal;
