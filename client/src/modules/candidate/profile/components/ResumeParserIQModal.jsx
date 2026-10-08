import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw,
  ArrowRight, ShieldCheck, Check, Trash2, Edit2, Info, ChevronRight, User, Briefcase, GraduationCap, Code, Award, Globe, Trophy, Plus, Layers
} from 'lucide-react';
import api from '@/services/api';
import { ALLOWED_RESUME_FORMATS } from '@/services/mockApi/resumeParserService';

function ResumeParserIQModal({ isOpen, onClose, onApplyData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  // Processing state: 'idle' | 'parsing' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [parsedSections, setParsedSections] = useState([]);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const fileInputRef = useRef(null);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setIsDragging(false);
      setSelectedFile(null);
      setValidationError('');
      setStatus('idle');
      setParsedSections([]);
      setCandidateInfo(null);
      setResumeId(null);
      setMetadata(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // File handling & validation
  const processFile = (file) => {
    setValidationError('');
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'txt'];
    if (!allowed.includes(ext)) {
      setValidationError('Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds 5MB limit.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setStatus('idle');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger real backend parse endpoint
  const handleParse = async () => {
    if (!selectedFile) return;
    setStatus('parsing');
    setValidationError('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        setResumeId(response.data.resumeId);
        setCandidateInfo(response.data.candidateInfo || {});
        setParsedSections(response.data.sections || []);
        setMetadata(response.data.metadata || {});
        setStatus('success');
      } else {
        throw new Error(response.data?.message || 'Parsing failed.');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setStatus('error');
      setValidationError(err.response?.data?.message || err.message || 'We could not process this resume. Please try again.');
    }
  };

  // Section toggle handler
  const handleToggleSection = (sectionId) => {
    setParsedSections(prev =>
      prev.map(sec => sec.id === sectionId ? { ...sec, selected: !sec.selected } : sec)
    );
  };

  // Confirm selected sections & persist to MongoDB via backend
  const handleConfirmApply = async () => {
    try {
      setStatus('parsing');
      const payload = {
        resumeId,
        candidateInfo,
        selectedSections: parsedSections.filter(sec => sec.selected)
      };

      const response = await api.post('/resumes/confirm', payload);
      if (response.data?.success) {
        onApplyData(response.data.profile);
        onClose();
      } else {
        throw new Error('Failed to save profile sections.');
      }
    } catch (err) {
      console.error('Confirm error:', err);
      setStatus('error');
      setValidationError('Failed to save selected sections to your profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="saas-card p-0 border border-indigo-100 w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-outfit text-white tracking-tight">Resume Parser AI</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Full Document Understanding
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Extracts standard and custom sections. Select sections to confirm before adding to your profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{validationError}</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {status === 'idle' && !selectedFile && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 font-outfit mb-1">Upload Resume Document</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                Drag and drop your PDF, DOCX, or TXT file here or click to browse.
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                Supports PDF, DOC, DOCX, TXT up to 5MB
              </div>
            </div>
          )}

          {/* Selected File Card */}
          {status === 'idle' && selectedFile && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedFile.name.split('.').pop().toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedFile.name}</h4>
                  <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Change File
              </button>
            </div>
          )}

          {/* Parsing Spinner */}
          {status === 'parsing' && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 font-outfit">AI Document Understanding Engine Active...</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Analyzing document structure, detecting standard & custom sections, and normalizing structured entities...
              </p>
            </div>
          )}

          {/* Confirmation List of Sections */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Full Resume Document Analyzed Successfully!</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {parsedSections.length} Sections Detected
                </span>
              </div>

              {candidateInfo?.fullName && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800">Extracted Candidate: </span>
                  <span className="text-slate-600">{candidateInfo.fullName} ({candidateInfo.email || 'Email not stated'})</span>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Sections to Add to Profile:</h4>

                {parsedSections.map((sec) => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      sec.selected ? 'border-indigo-200 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={sec.selected}
                          onChange={() => handleToggleSection(sec.id)}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900">{sec.title}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sec.sectionType === 'custom' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {sec.sectionType.toUpperCase()}
                            </span>
                          </div>
                          {sec.content && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{sec.content}</p>
                          )}
                          {sec.items && sec.items.length > 0 && (
                            <div className="mt-2 text-[11px] text-slate-500">
                              {sec.items.map((it, idx) => (
                                <span key={idx} className="inline-block bg-slate-100 text-slate-700 rounded px-2 py-0.5 mr-1 mb-1 font-medium">
                                  {it.title || it.name || it.organization || it.degree || it.category || `Item ${idx + 1}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(sec.confidence * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          
          {status === 'idle' && selectedFile && (
            <button
              onClick={handleParse}
              className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5"
            >
              <Sparkles className="w-4 h-4" /> Analyze Resume Document
            </button>
          )}

          {status === 'success' && (
            <button
              onClick={handleConfirmApply}
              className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5"
            >
              <Check className="w-4 h-4" /> Confirm & Save Selected Sections to MongoDB
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ResumeParserIQModal;
