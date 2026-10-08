import React, { useState, useEffect } from 'react';
import { evidenceIntelligenceService, VALIDATION_STATES } from '@/services/mockApi/evidenceIntelligenceService';
import {
  Sparkles, ShieldCheck, AlertCircle, FileText, CheckCircle2, XCircle, Clock,
  ArrowRight, RefreshCw, Layers, Brain, Search, ChevronRight, HelpCircle, UserCheck,
  TrendingUp, Award, Zap, Copy, Filter, RotateCcw, AlertTriangle, Eye
} from 'lucide-react';

function ProfileEvidenceIntelligence({ onLaunchTargetedInterview }) {
  const [loading, setLoading] = useState(true);
  const [activeViewTab, setActiveViewTab] = useState('matrix'); // 'matrix' | 'records' | 'gaps' | 'progression'
  
  const [resumeRecords, setResumeRecords] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [interviewRecords, setInterviewRecords] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [progressionData, setProgressionData] = useState(null);

  // Selected Item for Transcript Modal
  const [selectedClaimDetail, setSelectedClaimDetail] = useState(null);
  const [selectedInterviewRecord, setSelectedInterviewRecord] = useState(null);

  // Re-Analysis Modal state
  const [reanalyzeModal, setReanalyzeModal] = useState({ isOpen: false, interview: null, targetResumeId: '' });
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalysisResult, setReanalysisResult] = useState(null);

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true);
      const rList = await evidenceIntelligenceService.getResumeRecords('cand_1');
      const latestR = await evidenceIntelligenceService.getLatestResumeRecord('cand_1');
      const iList = await evidenceIntelligenceService.getInterviewRecords('cand_1');
      
      setResumeRecords(rList);
      setSelectedResume(latestR);
      setInterviewRecords(iList);

      // Compute initial claim-evidence matrix for latest resume across all interviews
      const matrix = evidenceIntelligenceService.calculateClaimEvidenceMatrix(latestR, iList);
      setMatrixData(matrix);

      // Compute progression data
      if (iList.length >= 2) {
        const prog = await evidenceIntelligenceService.getProgressionAnalysis(iList[0].id, iList[1].id);
        setProgressionData(prog);
      }
    } catch (err) {
      console.error('Error fetching evidence intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSelect = (resId) => {
    const target = resumeRecords.find((r) => r.id === resId);
    if (target) {
      setSelectedResume(target);
      const updatedMatrix = evidenceIntelligenceService.calculateClaimEvidenceMatrix(target, interviewRecords);
      setMatrixData(updatedMatrix);
    }
  };

  const handleExecuteReanalysis = async () => {
    if (!reanalyzeModal.interview || !reanalyzeModal.targetResumeId) return;
    try {
      setReanalyzing(true);
      const newAnalysis = await evidenceIntelligenceService.reanalyzeInterview(
        reanalyzeModal.interview.id,
        reanalyzeModal.targetResumeId
      );
      setReanalysisResult(newAnalysis);
      fetchIntelligenceData();
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  const getValidationBadge = (stateKey) => {
    const config = VALIDATION_STATES[stateKey] || VALIDATION_STATES.NOT_TESTED;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${config.badgeClass}`}>
        {stateKey === 'SUPPORTED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        {stateKey === 'PARTIALLY_SUPPORTED' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
        {stateKey === 'UNSUPPORTED' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
        {stateKey === 'NOT_TESTED' && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
        {stateKey === 'CONTRADICTED' && <XCircle className="w-3.5 h-3.5 text-purple-600" />}
        <span>{config.label}</span>
      </span>
    );
  };



  const supportedCount = matrixData.filter((m) => m.validationState === 'SUPPORTED').length;
  const partialCount = matrixData.filter((m) => m.validationState === 'PARTIALLY_SUPPORTED').length;
  const gapCount = matrixData.filter((m) => m.validationState === 'NOT_TESTED' || m.validationState === 'UNSUPPORTED').length;
  const coveragePercent = Math.round(((matrixData.length - gapCount) / Math.max(1, matrixData.length)) * 100);

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white shadow-sm space-y-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                Profile–Interview Evidence Intelligence
              </h1>
              <span className="badge-pill badge-ai text-[10px]">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Evidence-First Validation
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed">
              CandidateIQ continuously aligns your resume claims against verified interview evidence. Validate what you claim, detect profile risks, and prove missing skills through targeted practice.
            </p>
          </div>

          {/* Resume Version Selector */}
          <div className="flex items-center gap-3 self-end lg:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-2">Resume Context:</span>
            <select
              value={selectedResume?.id || ''}
              onChange={(e) => handleResumeSelect(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
            >
              {resumeRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.version} — {r.sourceName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intelligence Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Resume Claims</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-slate-950 font-outfit text-xl">{matrixData.length}</span>
              <span className="text-[10px] font-bold text-slate-500">Skills & Matrix</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Strongly Supported</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-emerald-950 font-outfit text-xl">{supportedCount}</span>
              <span className="text-[10px] font-bold text-emerald-700">Validated</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Partially Supported</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-amber-950 font-outfit text-xl">{partialCount}</span>
              <span className="text-[10px] font-bold text-amber-700">Needs Depth</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Evidence Coverage</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-indigo-950 font-outfit text-xl">{coveragePercent}%</span>
              <span className="text-[10px] font-bold text-indigo-700">{gapCount} Untested / Risks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 text-xs overflow-x-auto pb-1">
        <button
          onClick={() => setActiveViewTab('matrix')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'matrix'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Claim–Evidence Matrix</span>
        </button>

        <button
          onClick={() => setActiveViewTab('records')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'records'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Interview Records & Re-Analysis</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500 text-white font-mono">
            {interviewRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveViewTab('gaps')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'gaps'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Evidence Gaps & Risk</span>
          {gapCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono">
              {gapCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveViewTab('progression')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'progression'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Mock vs Final Trajectory</span>
        </button>
      </div>

      {/* VIEW 1: CLAIM-EVIDENCE MATRIX */}
      {activeViewTab === 'matrix' && (
        <div className="space-y-4">
          <div className="saas-card p-4 bg-white border border-slate-200/90 flex flex-wrap justify-between items-center gap-4 text-xs rounded-xl">
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 font-outfit">Claim Validation Matrix — {selectedResume?.version}</h3>
              <p className="text-slate-500 text-[11px]">
                Showing direct alignment between claims in {selectedResume?.sourceName} and answers in verified interviews.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              Traceable Question Evidence Layer
            </span>
          </div>

          <div className="saas-card border border-slate-200/90 bg-white overflow-hidden rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Resume Skill Claim</th>
                    <th className="p-4">Claimed Profile Context</th>
                    <th className="p-4">Observed Interview Evidence</th>
                    <th className="p-4 text-center">Validation State</th>
                    <th className="p-4 text-right">Action / Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900 font-outfit text-sm">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{row.skillName}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 max-w-xs font-medium leading-snug">
                        {row.resumeClaim}
                      </td>

                      <td className="p-4 text-slate-700 max-w-sm font-medium">
                        <p className="line-clamp-2">{row.observedEvidence}</p>
                        {row.evidenceSource && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            Source: {row.evidenceSource}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {getValidationBadge(row.validationState)}
                        </div>
                      </td>

                      <td className="p-4 text-right space-y-1">
                        {row.validationState === 'SUPPORTED' || row.validationState === 'PARTIALLY_SUPPORTED' ? (
                          <button
                            onClick={() => setSelectedClaimDetail(row)}
                            className="btn-secondary text-[11px] px-3 py-1.5 inline-flex items-center gap-1.5 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Evidence
                          </button>
                        ) : (
                          <button
                            onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview(row.skillName)}
                            className="btn-primary text-[11px] px-3 py-1.5 inline-flex items-center gap-1.5 font-bold shadow-xs"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" /> Prove This Skill
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERVIEW RECORDS & RE-ANALYSIS STUDIO */}
      {activeViewTab === 'records' && (
        <div className="space-y-6">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-4 rounded-2xl">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-outfit text-slate-950 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> Immutable Interview Record Library
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Interviews are permanent evidence snapshots. Re-analyze any historical interview against updated resume versions without altering the original record.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewRecords.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-4 shadow-2xs hover:border-indigo-200 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black font-mono ${
                          inv.type === 'FINAL' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {inv.type} RECORD
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{inv.date}</span>
                      </div>
                      <h4 className="text-base font-extrabold font-outfit text-slate-900">{inv.title}</h4>
                      <p className="text-xs text-indigo-600 font-bold">{inv.targetRole}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold font-outfit text-slate-950 block">{inv.overallScore}%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Observed Rating</span>
                    </div>
                  </div>

                  {/* Resume Snapshot Metadata */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Resume Context Used:</span>
                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200 font-mono text-[11px]">
                      {inv.resumeVersionLabel}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setSelectedInterviewRecord(inv)}
                      className="btn-secondary text-xs px-3 py-1.5 font-bold inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Record Transcript
                    </button>

                    <button
                      onClick={() =>
                        setReanalyzeModal({
                          isOpen: true,
                          interview: inv,
                          targetResumeId: selectedResume?.id || 'RES-002'
                        })
                      }
                      className="btn-primary text-xs px-3.5 py-1.5 font-bold inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-200" /> Re-Analyze with Current Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: EVIDENCE GAPS & PROFILE RISK */}
      {activeViewTab === 'gaps' && (
        <div className="space-y-6">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 rounded-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold font-outfit text-slate-950">Detected Profile Risk & Evidence Gaps</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                High-risk claims are resume skills marked as "Advanced" or "Expert" that lack verified interview evidence. Proactively prove them before real recruiter rounds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matrixData
                .filter((m) => m.validationState === 'NOT_TESTED' || m.validationState === 'UNSUPPORTED' || m.validationState === 'PARTIALLY_SUPPORTED')
                .map((gap, idx) => (
                  <div key={idx} className="saas-card p-5 border border-slate-200/90 bg-slate-50/50 space-y-4 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold font-outfit text-slate-900">{gap.skillName}</h4>
                          {getValidationBadge(gap.validationState)}
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{gap.resumeClaim}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observed Evidence Status</span>
                      <p className="text-slate-700 font-semibold">{gap.observedEvidence}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Interview Risk Detected
                      </span>

                      <button
                        onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview(gap.skillName)}
                        className="btn-primary text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5 shadow-md"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" /> Prove {gap.skillName}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MOCK VS FINAL TRAJECTORY */}
      {activeViewTab === 'progression' && progressionData && (
        <div className="space-y-6">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 rounded-2xl">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold font-outfit text-slate-950 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Practice Mock vs Final Interview Evidence Trajectory
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comparing evidence progression between {progressionData.mockTitle} ({progressionData.mockDate}) and {progressionData.finalTitle} ({progressionData.finalDate}).
              </p>
            </div>

            <div className="saas-card border border-slate-200/90 bg-white overflow-hidden rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Resume Skill Claim</th>
                    <th className="p-4 text-center">Practice Mock Evidence</th>
                    <th className="p-4 text-center">Job Interview Evidence</th>
                    <th className="p-4 text-right">Evidence Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {progressionData.progressionData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 font-outfit text-sm">
                        {row.skillName} <span className="text-xs font-semibold text-slate-400">({row.resumeClaim})</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">{getValidationBadge(row.mockEvidenceState)}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">{getValidationBadge(row.finalEvidenceState)}</div>
                      </td>
                      <td className="p-4 text-right font-extrabold text-indigo-600 font-outfit">
                        {row.trajectory}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION TRANSCRIPT / EVIDENCE DETAIL MODAL */}
      {selectedClaimDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-2xl w-full rounded-2xl shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold font-outfit text-slate-950">{selectedClaimDetail.skillName}</h3>
                  {getValidationBadge(selectedClaimDetail.validationState)}
                </div>
                <p className="text-xs text-slate-500 font-medium">Traceable Interview Evidence & Response Analysis</p>
              </div>
              <button
                onClick={() => setSelectedClaimDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume Claim Text</span>
                <p className="font-semibold text-slate-900">{selectedClaimDetail.resumeClaim}</p>
              </div>

              {selectedClaimDetail.matchingQuestions?.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-indigo-900 font-outfit text-xs">
                      {q.interviewTitle} — Question {q.questionId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      {q.observedLevel} Level
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Question Asked</span>
                    <p className="font-medium text-slate-800">{q.questionText}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Response Transcript</span>
                    <p className="font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed italic">
                      "{q.candidateResponse}"
                    </p>
                  </div>

                  {q.detectedConcepts && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Detected Technical Concepts</span>
                      <div className="flex flex-wrap gap-1.5">
                        {q.detectedConcepts.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white text-indigo-700 font-bold border border-indigo-200 text-[11px]">
                            ✓ {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-indigo-100 text-[11px] font-medium text-indigo-900">
                    <span className="font-bold">AI Evidence Reasoning:</span> {q.reasoning}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={() => setSelectedClaimDetail(null)} className="btn-secondary text-xs px-5 py-2 font-bold">
                Close Evidence Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RE-ANALYSIS MODAL */}
      {reanalyzeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-lg w-full rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-outfit text-slate-950">Re-Analyze Interview Evidence</h3>
              <button
                onClick={() => {
                  setReanalyzeModal({ isOpen: false, interview: null, targetResumeId: '' });
                  setReanalysisResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                Re-analysis evaluates candidate answers from <strong className="text-slate-900">{reanalyzeModal.interview?.title}</strong> against a selected resume version without modifying historical records.
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Select Target Resume Version to Compare Against:</label>
                <select
                  value={reanalyzeModal.targetResumeId}
                  onChange={(e) => setReanalyzeModal({ ...reanalyzeModal, targetResumeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-2.5 focus:outline-none"
                >
                  {resumeRecords.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.version} — {r.sourceName} ({r.claimedSkills.length} claims)
                    </option>
                  ))}
                </select>
              </div>

              {reanalysisResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold font-outfit text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> New Analysis Record Created ({reanalysisResult.analysisVersion})
                  </div>
                  <div className="text-[11px] text-emerald-800 space-y-1 font-medium">
                    <p>• Alignment Match: <strong>{reanalysisResult.overallAlignment}</strong></p>
                    <p>• Evidence Coverage: <strong>{reanalysisResult.evidenceCoverage}</strong></p>
                    <p>• Risk Status: <strong>{reanalysisResult.riskLevel}</strong></p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setReanalyzeModal({ isOpen: false, interview: null, targetResumeId: '' });
                  setReanalysisResult(null);
                }}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                {reanalysisResult ? 'Done' : 'Cancel'}
              </button>

              {!reanalysisResult && (
                <button
                  onClick={handleExecuteReanalysis}
                  disabled={reanalyzing}
                  className="btn-primary text-xs px-5 py-2 font-bold shadow-md flex items-center gap-2"
                >
                  {reanalyzing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Execute Re-Analysis
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileEvidenceIntelligence;
