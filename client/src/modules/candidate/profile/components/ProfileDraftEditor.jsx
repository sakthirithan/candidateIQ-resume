import React, { useState } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save, RotateCcw,
  CheckCircle2, AlertCircle, X, Layers, Briefcase, GraduationCap, Code, FolderGit2, Award, FileText
} from 'lucide-react';

export function ProfileDraftEditor({ initialProfile, onSave, onDiscard }) {
  // Deep clone initial profile to create isolated draft state
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(initialProfile || { sections: [] })));
  const [activeEditingSectionId, setActiveEditingSectionId] = useState(null);
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [saveError, setSaveError] = useState('');

  const sections = draft.sections || [];

  // Update a specific section in draft
  const updateSection = (sectionId, updatedFields) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...updatedFields } : sec))
    }));
  };

  // Reorder sections
  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate order property
    newSections.forEach((sec, idx) => {
      sec.order = idx;
    });

    setDraft((prev) => ({ ...prev, sections: newSections }));
  };

  // Toggle section visibility
  const toggleVisibility = (sectionId) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === sectionId ? { ...sec, visible: sec.visible === false } : sec))
    }));
  };

  // Delete section
  const deleteSection = (sectionId) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== sectionId)
    }));
    if (activeEditingSectionId === sectionId) {
      setActiveEditingSectionId(null);
    }
  };

  // Add new section
  const addNewSection = (type) => {
    const sectionId = `sec_${type}_${Date.now()}`;
    let title = 'New Section';
    let data = {};

    switch (type) {
      case 'summary':
        title = 'Professional Summary';
        data = { text: '' };
        break;
      case 'skills':
        title = 'Skills & Competencies';
        data = { groups: [{ category: 'Technical', skills: [] }], allSkills: [] };
        break;
      case 'experience':
        title = 'Work Experience';
        data = { records: [{ id: `exp_${Date.now()}`, title: '', company: '', duration: '', description: '', responsibilities: [] }] };
        break;
      case 'education':
        title = 'Education';
        data = { records: [{ id: `edu_${Date.now()}`, degree: '', institution: '', graduationYear: '', cgpa: '' }] };
        break;
      case 'projects':
        title = 'Key Projects';
        data = { records: [{ id: `proj_${Date.now()}`, name: '', description: '', technologies: [], url: '' }] };
        break;
      case 'certifications':
        title = 'Certifications';
        data = { records: [{ id: `cert_${Date.now()}`, name: '', issuer: '', date: '' }] };
        break;
      default:
        title = 'Custom Section';
        data = { content: '', items: [] };
        break;
    }

    const newSec = {
      id: sectionId,
      type,
      title,
      order: sections.length,
      visible: true,
      source: 'manual',
      data,
      subsections: []
    };

    setDraft((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec]
    }));
    setActiveEditingSectionId(sectionId);
    setShowAddSectionMenu(false);
  };

  // Commit changes to database via callback
  const handleSaveDraft = () => {
    setSaveError('');
    try {
      const normalizedPayload = {
        ...draft,
        metadata: {
          ...(draft.metadata || {}),
          updatedAt: new Date().toISOString()
        }
      };
      onSave(normalizedPayload);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="sticky top-16 z-30 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-sm font-black font-outfit uppercase tracking-wider text-amber-300">
              Profile Edit Mode (Draft Active)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Changes remain isolated in local draft state until you click Submit Changes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDiscardConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Discard Changes
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/30 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Submit Changes
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {saveError}
        </div>
      )}

      {/* Sections List & Inline Editors */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`rounded-2xl border transition-all ${
              section.visible === false ? 'opacity-50 bg-slate-50 border-slate-200' : 'bg-white border-slate-200/90 shadow-xs'
            }`}
          >
            {/* Section Header Bar */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5"
                  />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block ml-1 mt-0.5">
                    Type: {section.type} • Source: {section.source}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, 'up')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Section Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === sections.length - 1}
                  onClick={() => moveSection(idx, 'down')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Section Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleVisibility(section.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title={section.visible === false ? 'Show Section' : 'Hide Section'}
                >
                  {section.visible === false ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Edit Form */}
            <div className="p-5">
              <SectionFormFields section={section} onUpdate={(data) => updateSection(section.id, { data })} />
            </div>
          </div>
        ))}
      </div>

      {/* Add New Section Floating / Bottom Button */}
      <div className="relative pt-2">
        {!showAddSectionMenu ? (
          <button
            onClick={() => setShowAddSectionMenu(true)}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Section to Profile
          </button>
        ) : (
          <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-indigo-700 font-outfit tracking-wider">
                Select Section Type to Add
              </h3>
              <button
                onClick={() => setShowAddSectionMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: 'summary', label: 'Summary', icon: FileText },
                { type: 'experience', label: 'Experience', icon: Briefcase },
                { type: 'education', label: 'Education', icon: GraduationCap },
                { type: 'skills', label: 'Skills', icon: Code },
                { type: 'projects', label: 'Projects', icon: FolderGit2 },
                { type: 'certifications', label: 'Certifications', icon: Award },
                { type: 'custom', label: 'Custom Section', icon: Layers }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => addNewSection(item.type)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 text-left transition-all group"
                  >
                    <Icon className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 font-outfit">Discard Unsaved Changes?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Any modifications made to your draft will be lost and the database will remain unchanged.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onDiscard();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Form Fields for Individual Section Types
// -------------------------------------------------------------
function SectionFormFields({ section, onUpdate }) {
  const d = section.data || {};

  switch (section.type) {
    case 'personal_info':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={d.name || ''}
              onChange={(e) => onUpdate({ ...d, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Headline</label>
            <input
              type="text"
              value={d.headline || ''}
              onChange={(e) => onUpdate({ ...d, headline: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
            <input
              type="email"
              value={d.email || ''}
              onChange={(e) => onUpdate({ ...d, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={d.phone || ''}
              onChange={(e) => onUpdate({ ...d, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location</label>
            <input
              type="text"
              value={d.location || ''}
              onChange={(e) => onUpdate({ ...d, location: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={d.linkedin || ''}
              onChange={(e) => onUpdate({ ...d, linkedin: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      );

    case 'summary':
      return (
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Summary Content</label>
          <textarea
            rows={4}
            value={d.text || d.content || ''}
            onChange={(e) => onUpdate({ ...d, text: e.target.value, content: e.target.value })}
            placeholder="Describe your background and core impact..."
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs leading-relaxed"
          />
        </div>
      );

    case 'skills': {
      const allSkills = d.allSkills || [];
      const skillText = allSkills.join(', ');

      return (
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Skills (Comma-separated)
          </label>
          <textarea
            rows={3}
            value={skillText}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
              onUpdate({
                ...d,
                allSkills: parsed,
                groups: [{ category: 'Technical & Core Skills', skills: parsed }]
              });
            }}
            placeholder="React, TypeScript, Node.js, Python, MongoDB, Docker..."
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
          />
        </div>
      );
    }

    case 'experience': {
      const records = d.records || [];
      const addExp = () => {
        onUpdate({
          ...d,
          records: [...records, { id: `exp_${Date.now()}`, title: '', company: '', duration: '', description: '' }]
        });
      };
      const updateExp = (idx, fields) => {
        const updated = [...records];
        updated[idx] = { ...updated[idx], ...fields };
        onUpdate({ ...d, records: updated });
      };
      const removeExp = (idx) => {
        onUpdate({ ...d, records: records.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          {records.map((rec, rIdx) => (
            <div key={rec.id || rIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Role #{rIdx + 1}</span>
                <button
                  onClick={() => removeExp(rIdx)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  Remove Role
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={rec.title || ''}
                  onChange={(e) => updateExp(rIdx, { title: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={rec.company || ''}
                  onChange={(e) => updateExp(rIdx, { company: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2023 - Present)"
                  value={rec.duration || ''}
                  onChange={(e) => updateExp(rIdx, { duration: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Description & Responsibilities"
                value={rec.description || ''}
                onChange={(e) => updateExp(rIdx, { description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
              />
            </div>
          ))}
          <button
            onClick={addExp}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Experience Record
          </button>
        </div>
      );
    }

    case 'education': {
      const records = d.records || [];
      const addEdu = () => {
        onUpdate({
          ...d,
          records: [...records, { id: `edu_${Date.now()}`, degree: '', institution: '', graduationYear: '', cgpa: '' }]
        });
      };
      const updateEdu = (idx, fields) => {
        const updated = [...records];
        updated[idx] = { ...updated[idx], ...fields };
        onUpdate({ ...d, records: updated });
      };
      const removeEdu = (idx) => {
        onUpdate({ ...d, records: records.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          {records.map((edu, eIdx) => (
            <div key={edu.id || eIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Education #{eIdx + 1}</span>
                <button
                  onClick={() => removeEdu(eIdx)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree || ''}
                  onChange={(e) => updateEdu(eIdx, { degree: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution || ''}
                  onChange={(e) => updateEdu(eIdx, { institution: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Graduation Year"
                  value={edu.graduationYear || ''}
                  onChange={(e) => updateEdu(eIdx, { graduationYear: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="CGPA / Grade"
                  value={edu.cgpa || ''}
                  onChange={(e) => updateEdu(eIdx, { cgpa: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addEdu}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Education Record
          </button>
        </div>
      );
    }

    case 'projects': {
      const records = d.records || [];
      const addProj = () => {
        onUpdate({
          ...d,
          records: [...records, { id: `proj_${Date.now()}`, name: '', description: '', technologies: [], url: '' }]
        });
      };
      const updateProj = (idx, fields) => {
        const updated = [...records];
        updated[idx] = { ...updated[idx], ...fields };
        onUpdate({ ...d, records: updated });
      };
      const removeProj = (idx) => {
        onUpdate({ ...d, records: records.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          {records.map((proj, pIdx) => (
            <div key={proj.id || pIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Project #{pIdx + 1}</span>
                <button
                  onClick={() => removeProj(pIdx)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  Remove Project
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={proj.name || ''}
                  onChange={(e) => updateProj(pIdx, { name: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="URL / GitHub Link"
                  value={proj.url || ''}
                  onChange={(e) => updateProj(pIdx, { url: e.target.value })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <input
                type="text"
                placeholder="Technologies used (comma separated)"
                value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.tech || '')}
                onChange={(e) => updateProj(pIdx, { technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
              />
              <textarea
                rows={2}
                placeholder="Project Description"
                value={proj.description || ''}
                onChange={(e) => updateProj(pIdx, { description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
              />
            </div>
          ))}
          <button
            onClick={addProj}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project Record
          </button>
        </div>
      );
    }

    default: {
      // Custom Section Editor
      return (
        <div className="space-y-3">
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Section Content</label>
          <textarea
            rows={4}
            value={d.content || ''}
            onChange={(e) => onUpdate({ ...d, content: e.target.value })}
            placeholder="Enter custom section details..."
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
          />
        </div>
      );
    }
  }
}

export default ProfileDraftEditor;
