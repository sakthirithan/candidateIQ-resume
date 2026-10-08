import React, { useState, useEffect, Component } from 'react';
import {
  ArrowLeft, Download, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, AlertCircle,
  FileText, Briefcase, Building2, ChevronRight, ChevronDown, Check, UploadCloud, Target, Search, Layers,
  RotateCcw, ShieldAlert
} from 'lucide-react';
import { ATSScoreGauge, ScoreBadgePill } from './ATSScoreGauge';
import { PdfDocumentViewer } from './PdfDocumentViewer';
import { resumeHistoryService } from '@/services/storage/resumeHistoryService';
import { extractResumeDocument, generatePdfThumbnail } from '@/services/pdf/pdfService';
import { buildNormalizedCandidateProfile } from '@/services/pdf/resumeParserEngine';
import { evaluateResumeATS } from '@/services/ats/atsAnalysisEngine';
import { ProfileReplacementModal } from './ProfileReplacementModal';

/**
 * Route-Level & Component Error Boundary to ensure the page NEVER crashes into a blank screen.
 */
export class ResumeReviewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ResumeReviewErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 shadow-xl max-w-2xl mx-auto my-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 font-outfit">
              Resume Review
            </h2>
            <p className="text-sm font-bold text-slate-700">
              Unable to load this resume review.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left font-mono break-all max-h-36 overflow-y-auto">
            <span className="font-bold text-slate-800 block mb-1">Reason:</span>
            {this.state.error?.message || 'A visual component could not be rendered.'}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onRetry) this.props.onRetry();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
            {this.props.onBack && (
              <button
                onClick={this.props.onBack}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back to Resume History
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ResumeDetailWorkspaceInner({ resumeId, onBack, onUpdateCandidateProfile, currentCandidateProfile }) {
  // Review States: 'loading' | 'ready' | 'processing' | 'not_analyzed' | 'failed' | 'not_found' | 'unauthorized'
  const [reviewState, setReviewState] = useState('loading');
  const [resumeRecord, setResumeRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Target Role & JD Inputs
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  // Accordion and Modals
  const [activeAccordion, setActiveAccordion] = useState('ats');
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);

  // Replacement file upload state
  const [replaceFile, setReplaceFile] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState('');

  // Rename State
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Target context for replacement
  const [replaceCompany, setReplaceCompany] = useState('');
  const [replaceRole, setReplaceRole] = useState('');
  const [replaceJd, setReplaceJd] = useState('');

  const loadResume = async () => {
    if (!resumeId) {
      setReviewState('not_found');
      return;
    }

    setReviewState('loading');
    setErrorMessage('');

    try {
      let rec = resumeHistoryService.getResumeById(resumeId);
      if (!rec) {
        rec = await resumeHistoryService.getResumeByIdAsync(resumeId);
      }

      if (!rec) {
        setReviewState('not_found');
        return;
      }

      setResumeRecord(rec);
      setCompanyName(rec.target?.companyName || '');
      setRole(rec.target?.role || '');
      setJobDescription(rec.target?.jobDescription || '');

      if (!rec.analysis) {
        setReviewState('not_analyzed');
      } else {
        setReviewState('ready');
      }
    } catch (err) {
      console.error('[ResumeDetailWorkspace] Load error:', err);
      setErrorMessage(err.message || 'Failed to load resume document.');
      setReviewState('failed');
    }
  };

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  // Handle Rerun Analysis with dynamic LLM Reasoning and deterministic ATS scoring
  const handleRerunAnalysis = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisStep('1. Reading document text & extracting structured entities...');

    try {
      await new Promise((r) => setTimeout(r, 300));
      setAnalysisStep('2. LLM Evidence Extraction & contextual reasoning over claims...');
      await new Promise((r) => setTimeout(r, 300));
      setAnalysisStep('3. Validating citations & computing deterministic ATS metrics...');

      const targetCtx = { companyName, role, jobDescription };
      const updated = await resumeHistoryService.analyzeResumeAsync(resumeRecord.id, targetCtx);

      if (updated) {
        setResumeRecord(updated);
        setReviewState('ready');
      }
    } catch (err) {
      console.error('[handleRerunAnalysis] Error:', err);
      setErrorMessage(err.message || 'Analysis operation encountered an issue.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // 1. Loading State
  if (reviewState === 'loading') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-900 font-outfit">Loading Resume Review</h3>
        <p className="text-xs text-slate-500">Retrieving document preview, evidence graph, and ATS metrics...</p>
      </div>
    );
  }

  // 2. Not Found State
  if (reviewState === 'not_found' || !resumeRecord) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 font-outfit">Resume Not Found</h2>
          <p className="text-xs text-slate-500">The requested resume ID ({resumeId}) does not exist in history.</p>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resume History
        </button>
      </div>
    );
  }

  // 3. Unauthorized State
  if (reviewState === 'unauthorized') {
    return (
      <div className="bg-white rounded-3xl border border-amber-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 font-outfit">Unauthorized Access</h2>
          <p className="text-xs text-slate-500">You do not have permission to view this resume document.</p>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          Back to Resume History
        </button>
      </div>
    );
  }

  // 4. Failed State
  if (reviewState === 'failed') {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 font-outfit">Unable to Load Review</h2>
          <p className="text-xs text-rose-600 font-medium">{errorMessage || 'Analysis data could not be loaded.'}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={loadResume}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to Resume History
          </button>
        </div>
      </div>
    );
  }

  const analysis = (resumeRecord?.analysis && resumeRecord.analysis.evidence)
    ? resumeRecord.analysis
    : (resumeRecord?.file?.rawText ? evaluateResumeATS(resumeRecord.file.rawText, resumeRecord.target || {}) : null);
  const tips = analysis?.tipsByCategory || {};


  // Replace resume file in-place (preserves ID, bumps version, invalidates stale analysis)
  const handleReplaceResumeFile = async (e) => {
    e.preventDefault();
    if (!replaceFile) {
      setReplaceError('Please select a replacement resume file.');
      return;
    }

    setIsReplacing(true);
    setReplaceError('');

    try {
      const extraction = await extractResumeDocument(replaceFile);
      if (!extraction.success) {
        setReplaceError(extraction.error || 'Failed to extract text from new file.');
        setIsReplacing(false);
        return;
      }

      let thumbUrl = '';
      if (replaceFile.type === 'application/pdf' || replaceFile.name.endsWith('.pdf')) {
        const thumbRes = await generatePdfThumbnail(replaceFile, 2.0);
        if (thumbRes.success) thumbUrl = thumbRes.thumbnailUrl;
      }

      const extractedProfile = buildNormalizedCandidateProfile(
        extraction.extractedText,
        replaceFile.name,
        resumeRecord.id,
        resumeRecord.candidateId
      );

      // Update target context if modified in modal
      if (replaceCompany) setCompanyName(replaceCompany);
      if (replaceRole) setRole(replaceRole);
      if (replaceJd) setJobDescription(replaceJd);

      const updated = resumeHistoryService.updateResumeFile(
        resumeRecord.id,
        replaceFile,
        extraction.extractedText,
        extraction.pageCount,
        thumbUrl,
        extractedProfile
      );

      if (updated) {
        // If target context was updated in modal, re-run target analysis
        if (replaceCompany !== companyName || replaceRole !== role || replaceJd !== jobDescription) {
          const withTarget = resumeHistoryService.updateTargetAndReanalyze(resumeRecord.id, {
            companyName: replaceCompany || companyName,
            role: replaceRole || role,
            jobDescription: replaceJd || jobDescription
          });
          setResumeRecord(withTarget || updated);
        } else {
          setResumeRecord(updated);
        }

        setShowReplaceModal(false);
        setReplaceFile(null);
      }
    } catch (err) {
      setReplaceError(err.message || 'Error updating resume.');
    } finally {
      setIsReplacing(false);
    }
  };

  const getEffectiveExtractedProfile = () => {
    if (resumeRecord.extractedProfile) return resumeRecord.extractedProfile;
    const rawText = resumeRecord.file?.rawText || '';
    return buildNormalizedCandidateProfile(rawText, resumeRecord.file?.name, resumeRecord.id, resumeRecord.candidateId);
  };

  const handleStartRename = () => {
    setRenameValue(resumeRecord.displayName || resumeRecord.file?.name || '');
    setShowRenameModal(true);
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    const updated = await resumeHistoryService.renameResume(resumeRecord.id, renameValue.trim());
    if (updated) setResumeRecord(updated);
    setShowRenameModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 font-outfit tracking-tight">
                {resumeRecord.displayName || resumeRecord.file?.name}
              </h1>
              <button
                onClick={handleStartRename}
                className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition-colors"
                title="Rename resume display name"
              >
                Rename
              </button>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                v{resumeRecord.version}
              </span>
              {analysis && <ScoreBadgePill score={analysis.overallScore} />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Updated: {new Date(resumeRecord.updatedAt).toLocaleDateString()} • {resumeRecord.file?.pageCount || 1} Pages • {(resumeRecord.file?.size / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReplaceCompany(companyName);
              setReplaceRole(role);
              setReplaceJd(jobDescription);
              setShowReplaceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Update Resume File
          </button>

          <button
            onClick={() => setShowProfileConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Update My Profile
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: VISUAL ACTUAL PDF VIEWER (5 Cols) */}
        <div className="lg:col-span-5 sticky top-20 h-[82vh]">
          <PdfDocumentViewer
            file={resumeRecord.file?.rawFile}
            fileData={resumeRecord.preview?.pdfData || resumeRecord.preview?.thumbnailUrl}
            rawText={resumeRecord.file?.rawText}
            fileName={resumeRecord.file?.name}
          />
        </div>

        {/* RIGHT COLUMN: TARGET CONTEXT & COMPLETE ATS ANALYSIS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Role & Context Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-black uppercase text-slate-900 font-outfit tracking-wider">
                  Target Role Context & Job Description
                </h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Input Context
              </span>
            </div>

            <form onSubmit={handleRerunAnalysis} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Anthropic, Stripe"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Frontend Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Job Description Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Paste job qualifications for specific keyword matching..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    {analysisStep}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Analyze role fit without modifying your candidate profile.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
            </form>
          </div>

          {/* ATS Intelligence Output Card */}
          {analysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* ATS Scores Top Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <ATSScoreGauge score={analysis.overallScore} size="lg" />
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 font-outfit">
                      ATS Quality Assessment
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">ATS Format</span>
                    <span className="font-black text-slate-900 text-sm">{analysis.format?.score || 85}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Impact & Metrics</span>
                    <span className="font-black text-slate-900 text-sm">{analysis.impact?.score || 80}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Skills Match</span>
                    <span className="font-black text-slate-900 text-sm">{analysis.keywords?.score || 88}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Structure</span>
                    <span className="font-black text-slate-900 text-sm">{analysis.structure?.score || 82}/100</span>
                  </div>
                </div>
              </div>

              {/* NEW: Evidence & Reasoning Intelligence Section */}
              {analysis?.evidence && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 border border-indigo-100 shadow-xs space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase tracking-wider text-indigo-950 font-outfit text-sm flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" /> Evidence & Reasoning Intelligence
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                          {analysis.evidence.evidenceQualityScore}% Evidence Depth
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Multi-tier verification distinguishing explicit facts, contextual signals, and derived architectural capabilities.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {analysis.evidence.counts?.direct || 0} Direct
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {analysis.evidence.counts?.contextual || 0} Contextual
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        {analysis.evidence.counts?.derived || 0} Derived
                      </span>
                      {analysis.evidence.counts?.unsupported > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          {analysis.evidence.counts.unsupported} Gaps
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Items List */}
                  <div className="space-y-2.5">
                    {(analysis.evidence.items || []).map((item) => {
                      const levelConfig = {
                        direct: {
                          bg: 'bg-emerald-50/70 border-emerald-200/80',
                          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                          label: 'Direct Evidence',
                          dot: 'bg-emerald-500'
                        },
                        contextual: {
                          bg: 'bg-indigo-50/60 border-indigo-200/70',
                          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                          label: 'Contextual Signal',
                          dot: 'bg-indigo-500'
                        },
                        derived: {
                          bg: 'bg-purple-50/60 border-purple-200/70',
                          badge: 'bg-purple-100 text-purple-800 border-purple-300',
                          label: 'Derived Architecture',
                          dot: 'bg-purple-500'
                        },
                        unsupported: {
                          bg: 'bg-amber-50/60 border-amber-200/70',
                          badge: 'bg-amber-100 text-amber-900 border-amber-300',
                          label: 'Verification Gap',
                          dot: 'bg-amber-500'
                        }
                      }[item.level] || {
                        bg: 'bg-slate-50 border-slate-200',
                        badge: 'bg-slate-100 text-slate-800 border-slate-200',
                        label: item.level,
                        dot: 'bg-slate-400'
                      };

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border ${levelConfig.bg} space-y-2 transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`w-2 h-2 rounded-full ${levelConfig.dot}`} />
                              <h4 className="font-bold text-slate-900 text-xs">
                                {item.claim}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${levelConfig.badge}`}>
                                {levelConfig.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 capitalize px-2 py-0.5 rounded bg-white border border-slate-200">
                              Confidence: {item.confidence}
                            </span>
                          </div>

                          {/* Supporting Signals */}
                          {item.supportingEvidence && item.supportingEvidence.length > 0 && (
                            <div className="text-[11px] text-slate-700 space-y-1 pl-4 border-l-2 border-slate-200/80">
                              <span className="font-semibold text-slate-500 text-[10px] uppercase block">
                                Supporting Signals:
                              </span>
                              {item.supportingEvidence.map((ev, eIdx) => (
                                <div key={eIdx} className="flex items-center gap-1.5">
                                  <span className="text-slate-400">•</span>
                                  <span>{ev}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Contextual Reasoning */}
                          {item.reasoning && (
                            <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white/70 p-2 rounded-lg border border-slate-100">
                              <span className="font-bold not-italic text-slate-700">Reasoning: </span>
                              {item.reasoning}
                            </p>
                          )}

                          {/* Verification Gap Callout */}
                          {item.verificationGap && (
                            <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-950 text-[11px] flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Verification Note: </span>
                                <span>{item.verificationGap}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Keyword & Job Match Analysis */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-wider text-slate-800 font-outfit flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" /> Keyword & Role Fit Analysis
                  </span>
                  {analysis.keywords?.coverage !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {analysis.keywords.coverage}% Keyword Coverage
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Matched Technical Keywords ({analysis.technicalSkills?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysis.technicalSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {Array.isArray(analysis.missingRecommendedSkills) && analysis.missingRecommendedSkills.length > 0 ? (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-amber-800 block mb-1">
                        Missing Target Job Keywords ({analysis.missingRecommendedSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingRecommendedSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            + {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : jobDescription ? (
                    <div className="text-[11px] text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> All required skills in job description matched!
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Strengths & Critical Fixes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
                  <span className="font-bold text-emerald-800 text-xs uppercase tracking-wider block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
                  </span>
                  <ul className="space-y-1.5 text-emerald-900 text-[11px]">
                    {(analysis.strengths || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/60 space-y-2">
                  <span className="font-bold text-rose-800 text-xs uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Critical Fixes
                  </span>
                  {analysis.criticalFixes && analysis.criticalFixes.length > 0 ? (
                    <ul className="space-y-1.5 text-rose-900 text-[11px]">
                      {analysis.criticalFixes.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-semibold italic">
                      No critical formatting or structural issues detected.
                    </p>
                  )}
                </div>
              </div>

              {/* Category Breakdown Accordions */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase text-slate-800 font-outfit tracking-wider block">
                  Actionable Category Breakdown
                </span>

                {['ATS', 'toneAndStyle', 'content', 'structure', 'skills'].map((catKey) => {
                  const catTips = tips[catKey] || [];
                  const titles = {
                    ATS: 'ATS Format & Keyword Readiness',
                    toneAndStyle: 'Tone & Style',
                    content: 'Impact & Metrics',
                    structure: 'Structure & Brevity',
                    skills: 'Skills Coverage'
                  };
                  const isOpen = activeAccordion === catKey;

                  return (
                    <div key={catKey} className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setActiveAccordion(isOpen ? null : catKey)}
                        className="w-full p-3.5 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                      >
                        <span>{titles[catKey]}</span>
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-white border-t border-slate-100 space-y-2.5">
                          {catTips.map((tip, tIdx) => (
                            <div
                              key={tIdx}
                              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                                tip.type === 'good' ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900' : 'bg-amber-50/50 border-amber-200/60 text-amber-900'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                {tip.type === 'good' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                                <span>{tip.tip}</span>
                              </div>
                              {tip.explanation && <p className="text-[11px] opacity-90">{tip.explanation}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Replacement Confirmation Modal */}
      {showProfileConfirm && (
        <ProfileReplacementModal
          isOpen={showProfileConfirm}
          onClose={() => setShowProfileConfirm(false)}
          currentProfile={currentCandidateProfile}
          newExtractedProfile={getEffectiveExtractedProfile()}
          resumeName={resumeRecord.file?.name}
          onConfirm={() => {
            const extracted = getEffectiveExtractedProfile();
            onUpdateCandidateProfile(extracted);
          }}
        />
      )}

      {/* Resume Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 font-outfit">
                Rename Resume Document
              </h3>
              <button onClick={() => setShowRenameModal(false)} className="text-slate-400 hover:text-slate-700">
                ×
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Update the display name of this resume document.
            </p>

            <form onSubmit={handleSaveRename} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resume Name</label>
                <input
                  type="text"
                  required
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                  placeholder="e.g. Staff_Engineer_Resume.pdf"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameValue.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Place Unified Resume Replacement Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-outfit">
                  Upload / Update Resume Document
                </h3>
                <span className="text-[11px] text-slate-400">
                  Replacing v{resumeRecord.version} → will become v{resumeRecord.version + 1}
                </span>
              </div>
              <button onClick={() => setShowReplaceModal(false)} className="text-slate-400 hover:text-slate-700">
                ×
              </button>
            </div>

            {replaceError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {replaceError}
              </div>
            )}

            <form onSubmit={handleReplaceResumeFile} className="space-y-3.5 text-xs">
              {/* Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 text-center space-y-2 cursor-pointer relative">
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  {replaceFile ? replaceFile.name : 'Select Resume File (.pdf, .docx, .txt)'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Client-side text extraction & high-res thumbnail rendering
                </p>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft"
                    value={replaceCompany}
                    onChange={(e) => setReplaceCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Role (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Full-Stack Engineer"
                    value={replaceRole}
                    onChange={(e) => setReplaceRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Job Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Paste job qualifications for specific keyword matching..."
                  value={replaceJd}
                  onChange={(e) => setReplaceJd(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replaceFile || isReplacing}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 disabled:opacity-50"
                >
                  {isReplacing ? 'Extracting & Updating...' : 'Replace & Re-analyze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Exported Workspace wrapped in Error Boundary
 */
export function ResumeDetailWorkspace(props) {
  return (
    <ResumeReviewErrorBoundary onBack={props.onBack}>
      <ResumeDetailWorkspaceInner {...props} />
    </ResumeReviewErrorBoundary>
  );
}

export default ResumeDetailWorkspace;

