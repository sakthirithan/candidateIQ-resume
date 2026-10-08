import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight, X, Layers, Briefcase, GraduationCap, Code, FolderGit2, Award } from 'lucide-react';

export function ProfileReplacementModal({ isOpen, onClose, currentProfile, newExtractedProfile, resumeName, onConfirm }) {
  if (!isOpen || !newExtractedProfile) return null;

  const currentSections = currentProfile?.sections || [];
  const newSections = newExtractedProfile?.sections || [];

  const currentTypes = currentSections.map((s) => s.type);
  const newTypes = newSections.map((s) => s.type);

  const addedSectionTypes = newTypes.filter((t) => !currentTypes.includes(t));
  const removedSectionTypes = currentTypes.filter((t) => !newTypes.includes(t));
  const maintainedSectionTypes = newTypes.filter((t) => currentTypes.includes(t));

  // Count items extracted
  const expSection = newSections.find((s) => s.type === 'experience');
  const eduSection = newSections.find((s) => s.type === 'education');
  const projSection = newSections.find((s) => s.type === 'projects');
  const skillsSection = newSections.find((s) => s.type === 'skills');
  const certSection = newSections.find((s) => s.type === 'certifications');

  const expCount = expSection?.data?.records?.length || 0;
  const eduCount = eduSection?.data?.records?.length || 0;
  const projCount = projSection?.data?.records?.length || 0;
  const skillsCount = skillsSection?.data?.allSkills?.length || 0;
  const certCount = certSection?.data?.records?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-outfit tracking-tight">
                Update Active Profile from Resume?
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Target Source: <span className="font-bold text-slate-800">{resumeName || 'Selected Resume'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            Your current profile will be updated with the information extracted from this resume. Only verified information extracted from this file will be saved.
          </p>
        </div>

        {/* Detected Metrics Grid */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Extracted Content Summary
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="font-black text-slate-900">{skillsCount}</span>
                <span className="text-slate-500 text-[11px] block">Skills</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-500" />
              <div>
                <span className="font-black text-slate-900">{expCount}</span>
                <span className="text-slate-500 text-[11px] block">Experiences</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-black text-slate-900">{projCount}</span>
                <span className="text-slate-500 text-[11px] block">Projects</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <div>
                <span className="font-black text-slate-900">{eduCount}</span>
                <span className="text-slate-500 text-[11px] block">Education</span>
              </div>
            </div>
            {certCount > 0 && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="font-black text-slate-900">{certCount}</span>
                  <span className="text-slate-500 text-[11px] block">Certifications</span>
                </div>
              </div>
            )}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-black text-slate-900">{newSections.length}</span>
                <span className="text-slate-500 text-[11px] block">Total Sections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Change Details */}
        <div className="space-y-2 text-xs">
          {addedSectionTypes.length > 0 && (
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black">+</span>
              <span>New sections to add: {addedSectionTypes.join(', ')}</span>
            </div>
          )}
          {removedSectionTypes.length > 0 && (
            <div className="flex items-center gap-2 text-rose-700 font-semibold">
              <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-black">-</span>
              <span>Sections not present in this resume: {removedSectionTypes.join(', ')}</span>
            </div>
          )}
          {maintainedSectionTypes.length > 0 && (
            <div className="flex items-center gap-2 text-indigo-700 font-semibold">
              <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black">~</span>
              <span>Sections updated with fresh extracted records: {maintainedSectionTypes.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/30 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm & Apply to Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileReplacementModal;
