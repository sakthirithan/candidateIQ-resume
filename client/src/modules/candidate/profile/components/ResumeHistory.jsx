import React, { useState, useEffect } from 'react';
import {
  FileText, UploadCloud, Search, Filter, Plus, Trash2, Download,
  ExternalLink, Sparkles, RefreshCw, CheckCircle2, Clock, AlertCircle, Building2, Briefcase
} from 'lucide-react';
import { ScoreCircle, ScoreBadgePill } from './ATSScoreGauge';
import { resumeHistoryService } from '@/services/storage/resumeHistoryService';
import { extractResumeDocument, generatePdfThumbnail } from '@/services/pdf/pdfService';
import { buildNormalizedCandidateProfile } from '@/services/pdf/resumeParserEngine';
import { evaluateResumeATS } from '@/services/ats/atsAnalysisEngine';
import { ResumeDetailWorkspace } from './ResumeDetailWorkspace';
import { ProfileReplacementModal } from './ProfileReplacementModal';

export function ResumeHistory({ onUpdateCandidateProfile, currentCandidateProfile, initialResumeId = null }) {
  const [resumes, setResumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'analyzed' | 'processing' | 'failed'
  const [activeResumeId, setActiveResumeId] = useState(initialResumeId);

  // New Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetJd, setTargetJd] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delete Confirmation Modal
  const [deleteTargetResume, setDeleteTargetResume] = useState(null);

  // Profile Replacement Modal
  const [profileReplaceResume, setProfileReplaceResume] = useState(null);

  const loadResumes = async () => {
    try {
      const list = await resumeHistoryService.getResumesAsync();
      setResumes(list || []);
    } catch (e) {
      setResumes(resumeHistoryService.getResumes());
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  // Rename Resume Modal State
  const [renameTargetResume, setRenameTargetResume] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const handleStartRename = (resume) => {
    setRenameTargetResume(resume);
    setRenameValue(resume.displayName || resume.file?.name || '');
  };

  const handleConfirmRename = async (e) => {
    e.preventDefault();
    if (!renameTargetResume || !renameValue.trim()) return;
    await resumeHistoryService.renameResume(renameTargetResume.id, renameValue.trim());
    await loadResumes();
    setRenameTargetResume(null);
  };

  // Filtered list
  const filteredResumes = resumes.filter((r) => {
    const name = r.displayName || r.file?.name || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  // Handle uploading and parsing a new resume record
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newFile) {
      setUploadError('Please select a resume file (.pdf, .docx, .txt).');
      return;
    }

    setIsProcessingUpload(true);
    setUploadError('');

    try {
      const extraction = await extractResumeDocument(newFile);
      if (!extraction.success) {
        setUploadError(extraction.error || 'Failed to extract text from resume.');
        setIsProcessingUpload(false);
        return;
      }

      let thumbUrl = '';
      let base64Pdf = '';
      if (newFile.type === 'application/pdf' || newFile.name.endsWith('.pdf')) {
        const thumbRes = await generatePdfThumbnail(newFile, 2.0);
        if (thumbRes.success) thumbUrl = thumbRes.thumbnailUrl;
      }

      const resumeId = `res_${Date.now()}`;
      const extractedProfile = buildNormalizedCandidateProfile(
        extraction.extractedText,
        newFile.name,
        resumeId,
        'cand_1'
      );

      const analysis = evaluateResumeATS(extraction.extractedText, {
        companyName: targetCompany,
        role: targetRole,
        jobDescription: targetJd
      });

      const newRecord = {
        id: resumeId,
        candidateId: 'cand_1',
        displayName: newFile.name,
        file: {
          name: newFile.name,
          size: newFile.size,
          mimeType: newFile.type || 'application/pdf',
          pageCount: extraction.pageCount || 1,
          rawText: extraction.extractedText,
          rawFile: newFile
        },
        preview: {
          thumbnailUrl: thumbUrl,
          pdfData: thumbUrl
        },
        target: {
          companyName: targetCompany,
          role: targetRole,
          jobDescription: targetJd
        },
        extractedProfile,
        analysis,
        version: 1,
        versionHistory: [
          { version: 1, fileName: newFile.name, uploadedAt: new Date().toISOString(), overallScore: analysis.overallScore }
        ],
        status: 'analyzed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await resumeHistoryService.saveResume(newRecord);
      await loadResumes();
      setIsUploadModalOpen(false);
      setNewFile(null);
      setTargetCompany('');
      setTargetRole('');
      setTargetJd('');
      setActiveResumeId(resumeId);
    } catch (err) {
      setUploadError(err.message || 'Error processing uploaded resume.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // Delete resume handler
  const confirmDelete = async () => {
    if (deleteTargetResume) {
      await resumeHistoryService.deleteResume(deleteTargetResume.id || deleteTargetResume._id);
      await loadResumes();
      setDeleteTargetResume(null);
    }
  };


  // If a specific resume is opened in detail view
  if (activeResumeId) {
    return (
      <ResumeDetailWorkspace
        resumeId={activeResumeId}
        onBack={() => {
          setActiveResumeId(null);
          loadResumes();
        }}
        currentCandidateProfile={currentCandidateProfile}
        onUpdateCandidateProfile={(extracted) => {
          if (onUpdateCandidateProfile) onUpdateCandidateProfile(extracted);
          setActiveResumeId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight">
              Resume History & Intelligence
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
              resumes.length >= 10
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              {resumes.length} / 10 Resumes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Manage your independent resume documents with high-resolution visual previews, evidence-based reasoning, and verified CandidateIQ profile updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {resumes.length >= 10 ? (
            <div className="text-right">
              <button
                disabled
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center gap-2"
                title="Maximum 10 resumes reached. You can replace or update existing resumes."
              >
                <Plus className="w-4 h-4" />
                Upload New Resume (10/10 Limit)
              </button>
              <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                Limit reached (10/10). Replace existing versions or delete unused.
              </span>
            </div>
          ) : (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Upload New Resume ({resumes.length}/10)
            </button>
          )}
        </div>
      </div>


      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resumes by filename, role title, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'analyzed', 'processing', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Resume Cards Grid */}
      {filteredResumes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No resumes found</h3>
          <p className="text-xs text-slate-500 mt-1">Upload a resume document to get started with ATS analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => {
            const analysis = resume.analysis;
            const target = resume.target || {};
            const thumb = resume.preview?.thumbnailUrl;
            const displayName = resume.displayName || resume.file?.name || 'Resume Document';

            return (
              <div
                key={resume.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group relative"
              >
                {/* Visual Document First Page Thumbnail */}
                <div
                  onClick={() => setActiveResumeId(resume.id || resume._id)}
                  className="h-44 w-full bg-slate-950 border-b border-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:opacity-95 transition-opacity"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={displayName}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 p-4 text-center">
                      <FileText className="w-10 h-10 text-indigo-400 opacity-60" />
                      <span className="text-[11px] font-bold text-slate-300">Document Canvas Preview</span>
                      <span className="text-[10px] text-slate-400">{resume.file?.pageCount || 1} Pages</span>
                    </div>
                  )}

                  {/* ATS Score Badge Overlay */}
                  {analysis && (
                    <div className="absolute top-3 right-3 shadow-md">
                      <ScoreCircle score={analysis.overallScore} size={40} />
                    </div>
                  )}

                  {/* Version Pill Overlay */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                    v{resume.version || 1}
                  </div>
                </div>

                {/* Card Info & Details */}
                <div className="p-5 space-y-3.5 flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 title" title={displayName}>
                        {displayName}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(resume);
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5"
                        title="Rename resume display name"
                      >
                        Rename
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Updated {new Date(resume.updatedAt).toLocaleDateString()} • {resume.file?.pageCount || 1} Pages • {analysis?.evidence?.evidenceQualityScore ? `${analysis.evidence.evidenceQualityScore}% Evidence Depth` : 'Analyzed'}
                    </p>
                  </div>

                  {/* Target Role & Company Details */}
                  {(target.role || target.companyName) ? (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      {target.role && (
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="line-clamp-1">{target.role}</span>
                        </div>
                      )}
                      {target.companyName && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="line-clamp-1">{target.companyName}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 text-[11px] text-slate-400 italic">
                      General Resume (No specific target role)
                    </div>
                  )}

                  {/* Strengths Snippet */}
                  {analysis?.strengths?.[0] && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      💡 {analysis.strengths[0]}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveResumeId(resume.id || resume._id);
                    }}
                    className="flex-1 py-1.5 rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-center"
                  >
                    Open & Review
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileReplaceResume(resume);
                    }}
                    className="px-2.5 py-1.5 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Update Candidate Profile from this Resume"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline text-[11px]">Update Profile</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetResume(resume);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Resume Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload New Resume Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 font-outfit">
                Upload New Resume
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* File Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 text-center space-y-2 cursor-pointer relative">
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  {newFile ? newFile.name : 'Select Resume File (.pdf, .docx, .txt)'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Client-side text extraction & thumbnail generation
                </p>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Role (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Job Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Paste job qualifications for specific keyword matching..."
                  value={targetJd}
                  onChange={(e) => setTargetJd(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUpload || !newFile}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 disabled:opacity-50"
                >
                  {isProcessingUpload ? 'Extracting & Parsing...' : 'Upload & Analyze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Resume Modal */}
      {renameTargetResume && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 font-outfit">
                Rename Resume Document
              </h3>
              <button onClick={() => setRenameTargetResume(null)} className="text-slate-400 hover:text-slate-700">
                ×
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Update the display name of this resume document. The resume ID, version, and underlying analysis will remain unchanged.
            </p>

            <form onSubmit={handleConfirmRename} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resume Name</label>
                <input
                  type="text"
                  required
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                  placeholder="e.g. Google_Staff_Frontend_Resume.pdf"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameTargetResume(null)}
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

      {/* Delete Resume Safety Confirmation Modal */}
      {deleteTargetResume && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 font-outfit">
                Delete Resume Document?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Deleting <span className="font-bold text-slate-800">{deleteTargetResume.file?.name}</span> will remove it from your resume history.
                <br /><br />
                <span className="font-semibold text-indigo-600">
                  Note: Deleting this resume will NOT delete or alter your active Candidate Profile.
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetResume(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Replacement Diff Modal */}
      {profileReplaceResume && (
        <ProfileReplacementModal
          isOpen={Boolean(profileReplaceResume)}
          onClose={() => setProfileReplaceResume(null)}
          currentProfile={currentCandidateProfile}
          newExtractedProfile={
            profileReplaceResume.extractedProfile ||
            buildNormalizedCandidateProfile(
              profileReplaceResume.file?.rawText || '',
              profileReplaceResume.file?.name,
              profileReplaceResume.id,
              profileReplaceResume.candidateId
            )
          }
          resumeName={profileReplaceResume.file?.name}
          onConfirm={() => {
            const extracted =
              profileReplaceResume.extractedProfile ||
              buildNormalizedCandidateProfile(
                profileReplaceResume.file?.rawText || '',
                profileReplaceResume.file?.name,
                profileReplaceResume.id,
                profileReplaceResume.candidateId
              );
            if (onUpdateCandidateProfile) onUpdateCandidateProfile(extracted);
            setProfileReplaceResume(null);
          }}
        />
      )}
    </div>
  );
}

export default ResumeHistory;
