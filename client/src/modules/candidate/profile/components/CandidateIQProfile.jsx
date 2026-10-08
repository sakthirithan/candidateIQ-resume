import React, { useState, useEffect } from 'react';
import candidateService from '@/services/mockApi/candidateService';
import { getCurrentUser } from '@/utils/auth';
import { extractResumeDocument, generatePdfThumbnail } from '@/services/pdf/pdfService';
import { buildNormalizedCandidateProfile } from '@/services/pdf/resumeParserEngine';
import { evaluateResumeATS } from '@/services/ats/atsAnalysisEngine';
import { resumeHistoryService } from '@/services/storage/resumeHistoryService';
import { DynamicProfileRenderer } from './DynamicProfileRenderer';
import { ProfileDraftEditor } from './ProfileDraftEditor';
import { ManualProfileBuilder } from './ManualProfileBuilder';
import { ResumeHistory } from './ResumeHistory';
import {
  User, Sparkles, FileText, UploadCloud, Plus, Edit2, RotateCcw,
  CheckCircle2, AlertCircle, ArrowRight, Layers, History, Loader2
} from 'lucide-react';

const PROFILE_STORAGE_KEY = 'candidateiq_normalized_profile_v2';

export function CandidateIQProfile() {
  const currentUser = getCurrentUser() || { id: 'cand_1', name: 'Alex Johnson', email: 'alex.johnson@example.com' };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('profile'); // 'profile' | 'edit_draft' | 'manual_builder' | 'resume_upload' | 'resume_history'
  const [toastMessage, setToastMessage] = useState('');

  // Resume Upload Flow state
  const [uploadFile, setUploadFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Fetch current profile from backend MongoDB / local cache on mount
  const fetchActiveProfile = async () => {
    setLoading(true);
    try {
      const dbProfile = await candidateService.getMyProfile();
      if (dbProfile && Array.isArray(dbProfile.sections) && dbProfile.sections.length > 0) {
        setProfile(dbProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(dbProfile));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('[CandidateIQProfile] Could not fetch profile from server:', e.message);
    }

    // Check local storage cache
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          setProfile(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Initial default profile for verified demo experience
    const defaultRaw = `Alex Johnson
alex.johnson@example.com | +1 (555) 0199 | San Francisco, CA
linkedin.com/in/alexjohnson-tech | github.com/alexjohnson

PROFESSIONAL SUMMARY
Senior Full-Stack & AI Engineer with 5+ years of experience engineering scalable React web applications, Node.js REST APIs, and Gemini LLM pipelines.

SKILLS & TECHNOLOGIES
Frontend: React.js, TypeScript, Next.js, Redux, Tailwind CSS, HTML5, CSS3
Backend: Node.js, Express.js, Python, FastAPI, REST APIs, GraphQL
Databases & Cloud: MongoDB, PostgreSQL, Docker, AWS, Git

WORK EXPERIENCE
Senior Full Stack Developer | ApexCloud Systems
2023 - Present | San Francisco, CA
• Spearheaded migration of legacy web app to React & TypeScript, cutting render latency by 35%.
• Architected dynamic SaaS analytics dashboards visualizing real-time metrics for 50k+ enterprise users.
• Mentored 6 junior engineers in modern React patterns and automated testing.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley
2017 - 2021 | GPA: 3.85 / 4.0

PROJECTS
CandidateIQ SaaS Platform (React, Node.js, Express, MongoDB)
• Intelligent candidate profiling and AI interview analytics dashboard with dynamic section rendering.
• Designed real-time audio and video mock interview room with automated feedback scoring.

CERTIFICATIONS
AWS Certified Solutions Architect - Associate (2024)`;

    const initialProf = buildNormalizedCandidateProfile(defaultRaw, 'Alex_Johnson_Resume_2026.pdf', 'res_seed_frontend_01', currentUser.id || 'cand_1');
    setProfile(initialProf);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(initialProf));
      candidateService.saveProfile(initialProf);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveProfile();
  }, []);

  // 2. Persist Profile to MongoDB and refresh state
  const saveProfileToDatabase = async (newProfile, isManual = true) => {
    try {
      setLoading(true);
      const saved = await candidateService.saveProfile(newProfile, isManual);
      setProfile(saved || newProfile);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(saved || newProfile));
      showToast(isManual ? 'Candidate Profile changes saved to database.' : 'Candidate Profile updated from resume (preserving manual overrides).');
    } catch (err) {
      console.error('[CandidateIQProfile] Save Error:', err);
      setProfile(newProfile);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      showToast('Profile updated.');
    } finally {
      setLoading(false);
      setViewMode('profile');
    }
  };

  // Upload Resume Flow
  const handleUploadResumeFile = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a resume file (.pdf, .docx, .txt).');
      return;
    }

    setIsExtracting(true);
    setUploadError('');

    try {
      const extraction = await extractResumeDocument(uploadFile);
      if (!extraction.success) {
        setUploadError(extraction.error || 'Failed to extract readable text.');
        setIsExtracting(false);
        return;
      }

      let thumbUrl = '';
      if (uploadFile.type === 'application/pdf' || uploadFile.name.endsWith('.pdf')) {
        const thumbRes = await generatePdfThumbnail(uploadFile);
        if (thumbRes.success) thumbUrl = thumbRes.thumbnailUrl;
      }

      const resumeId = `res_${Date.now()}`;
      const normalizedProf = buildNormalizedCandidateProfile(
        extraction.extractedText,
        uploadFile.name,
        resumeId,
        currentUser.id || 'cand_1'
      );

      const analysis = evaluateResumeATS(extraction.extractedText, {});
      const resumeRecord = {
        id: resumeId,
        candidateId: currentUser.id || 'cand_1',
        file: {
          name: uploadFile.name,
          size: uploadFile.size,
          mimeType: uploadFile.type || 'application/pdf',
          pageCount: extraction.pageCount || 1,
          rawText: extraction.extractedText,
          rawFile: uploadFile
        },
        preview: { thumbnailUrl: thumbUrl },
        target: { companyName: '', role: '', jobDescription: '' },
        extractedProfile: normalizedProf,
        analysis,
        version: 1,
        status: 'analyzed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await resumeHistoryService.saveResume(resumeRecord);

      setExtractedPreview(normalizedProf);
    } catch (err) {
      setUploadError(err.message || 'Error processing resume.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmExtractedProfile = () => {
    if (extractedPreview) {
      saveProfileToDatabase(extractedPreview, false);
      setExtractedPreview(null);
      setUploadFile(null);
    }
  };

  if (loading && !profile) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span>Loading Candidate Profile...</span>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Resume History View
  // ----------------------------------------------------------------------
  if (viewMode === 'resume_history') {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => setViewMode('profile')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            ← Back to Candidate Profile
          </button>
        </div>
        <ResumeHistory
          currentCandidateProfile={profile}
          onUpdateCandidateProfile={(newExtracted) => {
            saveProfileToDatabase(newExtracted, false);
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Manual Profile Builder
  // ----------------------------------------------------------------------
  if (viewMode === 'manual_builder') {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <ManualProfileBuilder
          onSaveProfile={(builtProfile) => saveProfileToDatabase(builtProfile)}
          onCancel={() => setViewMode('profile')}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Draft Editor Mode
  // ----------------------------------------------------------------------
  if (viewMode === 'edit_draft') {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <ProfileDraftEditor
          initialProfile={profile}
          onSave={(updatedDraft) => saveProfileToDatabase(updatedDraft)}
          onDiscard={() => setViewMode('profile')}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Resume Upload Wizard Mode
  // ----------------------------------------------------------------------
  if (viewMode === 'resume_upload') {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit">
              Extract Profile from Resume
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your resume for automated client-side text extraction and structured section normalization.
            </p>
          </div>
          <button
            onClick={() => {
              setViewMode('profile');
              setExtractedPreview(null);
              setUploadFile(null);
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}

        {!extractedPreview ? (
          <form onSubmit={handleUploadResumeFile} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 text-center space-y-3 cursor-pointer relative transition-all">
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {uploadFile ? uploadFile.name : 'Choose or drop your resume file'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT files (up to 10 MB)</p>
              </div>
              <input
                type="file"
                required
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                🔒 Verified client-side extraction. No hallucinated content.
              </span>
              <button
                type="submit"
                disabled={!uploadFile || isExtracting}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 disabled:opacity-50"
              >
                {isExtracting ? 'Extracting & Normalizing...' : 'Extract & Preview'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 font-outfit">
                  Extraction Preview Complete
                </h3>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Detected {extractedPreview.sections?.length || 0} verified sections. Inspect before applying to profile.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExtractedPreview(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700"
                >
                  Re-upload
                </button>
                <button
                  onClick={handleConfirmExtractedProfile}
                  className="px-5 py-1.5 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save as My Profile
                </button>
              </div>
            </div>

            <DynamicProfileRenderer profile={extractedPreview} isEditMode={false} />
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Main Active Profile View (Zero-Hallucination Dynamic Renderer)
  // ----------------------------------------------------------------------
  const hasSections = profile && Array.isArray(profile.sections) && profile.sections.length > 0;
  const profileSource = profile?.profileSource || {};

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Profile Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit tracking-tight">
            Candidate Profile
          </h1>
          {/* Source Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-semibold">Profile Source:</span>
            {profileSource.type === 'resume' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <FileText className="w-3 h-3 text-indigo-500" />
                Resume — {profileSource.resumeName || 'Verified Resume'} (v{profileSource.resumeVersion || 1})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                <User className="w-3 h-3 text-slate-500" />
                Manual User Created
              </span>
            )}
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setViewMode('resume_history')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-indigo-600" />
            Resume History
          </button>

          {hasSections && (
            <button
              onClick={() => setViewMode('edit_draft')}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 flex items-center gap-1.5 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Initial Empty Experience: If no profile exists */}
      {!hasSections ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight">
              Create Your Candidate Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Choose how you want to build your verified candidate representation. You can extract it directly from a resume or construct it manually.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            {/* Branch 1: Upload Resume */}
            <div
              onClick={() => setViewMode('resume_upload')}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 font-outfit">
                    Upload Resume
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Extract profile automatically using AI. Validates text, detects genuine sections, and calculates ATS compatibility.
                  </p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Select Resume File</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Branch 2: Create Manually */}
            <div
              onClick={() => setViewMode('manual_builder')}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 font-outfit">
                    Create Manually
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Build your profile section by section. Choose your own sections without forced predefined templates.
                  </p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                <span>Start Blank Builder</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Dynamic Profile Rendering */
        <DynamicProfileRenderer
          profile={profile}
          isEditMode={false}
          onEditSection={() => setViewMode('edit_draft')}
        />
      )}
    </div>
  );
}

export default CandidateIQProfile;
