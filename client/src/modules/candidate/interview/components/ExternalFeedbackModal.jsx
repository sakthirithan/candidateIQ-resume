import React, { useState, useRef } from 'react';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, X, RefreshCw,
  Sparkles, ArrowRight, ShieldCheck, FileCheck
} from 'lucide-react';
import { evidenceIntelligenceService } from '@/services/mockApi/evidenceIntelligenceService';

const ALLOWED_FORMATS = ['.pdf', '.doc', '.docx', '.txt'];
const MAX_SIZE_MB = 10;

function ExternalFeedbackModal({ isOpen, onClose, targetInterview, onFeedbackUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [progressMsg, setProgressMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateFile = (file) => {
    setError('');
    if (!file) return false;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FORMATS.includes(ext)) {
      setError(`Unsupported file format (${ext}). Please upload a PDF, DOC, DOCX, or TXT file.`);
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds limit (${MAX_SIZE_MB}MB). Please select a smaller file.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && validateFile(files[0])) {
      setSelectedFile(files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setStatus('processing');
    setProgressMsg('Reading interviewer feedback document...');

    try {
      setTimeout(() => setProgressMsg('Extracting recruiter feedback notes & key impressions...'), 600);
      setTimeout(() => setProgressMsg('Comparing interviewer feedback with candidate interview evidence...'), 1200);

      const feedbackRecord = await evidenceIntelligenceService.uploadExternalFeedback({
        interviewId: targetInterview?.id || 'INT-004',
        file: selectedFile
      });

      setStatus('success');
      if (onFeedbackUploaded) {
        onFeedbackUploaded(feedbackRecord);
      }
    } catch (err) {
      setStatus('error');
      setError('We couldn\'t parse this feedback file. Please verify the document format and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0 relative">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-outfit text-white">Add Interviewer Feedback</h3>
              <p className="text-xs text-slate-400">Upload recruiter or employer notes to compare with your interview</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Target Interview Badge */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Comparing against:</span>
            <span className="font-bold text-indigo-950 font-outfit truncate max-w-[260px]">
              {targetInterview?.title || 'Final Technical Interview #01'}
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {status === 'idle' && (
            <>
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 font-mono">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {(selectedFile.size / 1024).toFixed(0)} KB &bull; Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Drop your interviewer feedback report here, or <span className="text-indigo-600 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports PDF, DOC, DOCX, TXT up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Security & Privacy Note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>External feedback is stored securely and processed privately to enrich your interview review.</span>
              </div>
            </>
          )}

          {status === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-outfit">{progressMsg}</h4>
                <p className="text-xs text-slate-500 mt-1">Comparing interviewer remarks with candidate responses...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-950 font-outfit">Feedback Report Added Successfully!</h4>
                <p className="text-xs text-slate-600 mt-1">CandidateIQ has extracted key impressions and compared them with your interview.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          {status === 'idle' && (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUploadAndAnalyze}
                disabled={!selectedFile}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Compare Feedback
              </button>
            </>
          )}

          {status === 'success' && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              View Feedback Comparison
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExternalFeedbackModal;
