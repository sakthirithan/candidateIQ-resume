import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Plus, Trash2, ArrowLeft, Save,
  FileText, Briefcase, GraduationCap, Code, FolderGit2, Award, Layers, Sparkles
} from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';

export function ManualProfileBuilder({ onSaveProfile, onCancel }) {
  const currentUser = getCurrentUser() || {};

  // Initial contact info setup
  const [personalInfo, setPersonalInfo] = useState({
    name: currentUser.name || '',
    headline: '',
    email: currentUser.email || '',
    phone: '',
    location: '',
    linkedin: ''
  });

  // Dynamic sections chosen by user
  const [sections, setSections] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [error, setError] = useState('');

  const addSection = (type) => {
    let title = 'New Section';
    let data = {};

    switch (type) {
      case 'summary':
        title = 'Professional Summary';
        data = { text: '' };
        break;
      case 'skills':
        title = 'Skills & Competencies';
        data = { allSkills: [], groups: [{ category: 'Technical', skills: [] }] };
        break;
      case 'experience':
        title = 'Work Experience';
        data = { records: [{ id: `exp_${Date.now()}`, title: '', company: '', duration: '', description: '' }] };
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
        data = { content: '' };
        break;
    }

    const newSec = {
      id: `sec_manual_${Date.now()}_${sections.length}`,
      type,
      title,
      order: sections.length + 1,
      visible: true,
      source: 'manual',
      data
    };

    setSections((prev) => [...prev, newSec]);
    setShowAddMenu(false);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSectionData = (id, data) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, data } : s)));
  };

  const updateSectionTitle = (id, title) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personalInfo.name || !personalInfo.email) {
      setError('Please provide at least your Name and Email address.');
      return;
    }

    const personalSection = {
      id: `sec_personal_${Date.now()}`,
      type: 'personal_info',
      title: 'Contact Information',
      order: 0,
      visible: true,
      source: 'manual',
      data: personalInfo
    };

    const finalSections = [personalSection, ...sections].map((sec, idx) => ({
      ...sec,
      order: idx
    }));

    const normalizedProfile = {
      candidateId: currentUser.id || 'cand_1',
      profileSource: {
        type: 'manual',
        updatedAt: new Date().toISOString()
      },
      sections: finalSections,
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isComplete: finalSections.length > 0
      }
    };

    onSaveProfile(normalizedProfile);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight">
              Create Candidate Profile Manually
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Build your verified profile section by section. You decide what sections to include.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#606beb] to-[#8e98ff] text-white hover:opacity-95 shadow-md shadow-[#606beb]/20 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Submit & Save Profile
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* 1. Header / Contact Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-black uppercase text-slate-800 font-outfit tracking-wider">
          1. Basic & Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Professional Headline</label>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack & AI Engineer"
              value={personalInfo.headline}
              onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 0199"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Location</label>
            <input
              type="text"
              placeholder="San Francisco, CA"
              value={personalInfo.location}
              onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">LinkedIn / Portfolio URL</label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/username"
              value={personalInfo.linkedin}
              onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. User-Added Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                className="font-bold text-sm text-slate-900 border-b border-dashed border-slate-300 focus:outline-none px-1"
              />
              <button
                onClick={() => removeSection(section.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Section
              </button>
            </div>

            {/* Render section builder fields */}
            {renderManualFields(section, (data) => updateSectionData(section.id, data))}
          </div>
        ))}
      </div>

      {/* 3. Section Selection Menu */}
      <div className="pt-2">
        {!showAddMenu ? (
          <button
            onClick={() => setShowAddMenu(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Section to Your Profile
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-indigo-700 font-outfit tracking-wider">
                Choose a Section to Add
              </h3>
              <button
                onClick={() => setShowAddMenu(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'summary', label: 'Summary', icon: FileText, desc: 'Overview of your background' },
                { type: 'experience', label: 'Experience', icon: Briefcase, desc: 'Work & roles history' },
                { type: 'education', label: 'Education', icon: GraduationCap, desc: 'Degrees & institutions' },
                { type: 'skills', label: 'Skills', icon: Code, desc: 'Technical & soft skills' },
                { type: 'projects', label: 'Projects', icon: FolderGit2, desc: 'Software & key builds' },
                { type: 'certifications', label: 'Certifications', icon: Award, desc: 'Licenses & credentials' },
                { type: 'custom', label: 'Custom Section', icon: Layers, desc: 'Publications, awards, etc.' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => addSection(item.type)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 text-left transition-all group"
                  >
                    <Icon className="w-4 h-4 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderManualFields(section, onUpdate) {
  const d = section.data || {};

  switch (section.type) {
    case 'summary':
      return (
        <textarea
          rows={3}
          value={d.text || ''}
          onChange={(e) => onUpdate({ ...d, text: e.target.value })}
          placeholder="Enter a brief summary of your professional expertise..."
          className="w-full p-3 rounded-xl border border-slate-200 text-xs"
        />
      );

    case 'skills':
      return (
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Enter Skills (Comma-separated)
          </label>
          <input
            type="text"
            value={(d.allSkills || []).join(', ')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
              onUpdate({
                allSkills: parsed,
                groups: [{ category: 'Core Skills', skills: parsed }]
              });
            }}
            placeholder="React, TypeScript, Python, Node.js, Cloud Architecture..."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>
      );

    case 'experience': {
      const records = d.records || [];
      const addExp = () => onUpdate({ ...d, records: [...records, { id: `exp_${Date.now()}`, title: '', company: '', duration: '', description: '' }] });
      const updateExp = (idx, fields) => {
        const u = [...records];
        u[idx] = { ...u[idx], ...fields };
        onUpdate({ ...d, records: u });
      };
      return (
        <div className="space-y-3">
          {records.map((rec, rIdx) => (
            <div key={rec.id || rIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={rec.title || ''}
                  onChange={(e) => updateExp(rIdx, { title: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={rec.company || ''}
                  onChange={(e) => updateExp(rIdx, { company: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2023 - Present)"
                  value={rec.duration || ''}
                  onChange={(e) => updateExp(rIdx, { duration: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Responsibilities and achievements"
                value={rec.description || ''}
                onChange={(e) => updateExp(rIdx, { description: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          ))}
          <button
            onClick={addExp}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700"
          >
            + Add Role
          </button>
        </div>
      );
    }

    case 'education': {
      const records = d.records || [];
      const addEdu = () => onUpdate({ ...d, records: [...records, { id: `edu_${Date.now()}`, degree: '', institution: '', graduationYear: '' }] });
      const updateEdu = (idx, fields) => {
        const u = [...records];
        u[idx] = { ...u[idx], ...fields };
        onUpdate({ ...d, records: u });
      };
      return (
        <div className="space-y-3">
          {records.map((edu, eIdx) => (
            <div key={edu.id || eIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree || ''}
                  onChange={(e) => updateEdu(eIdx, { degree: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution || ''}
                  onChange={(e) => updateEdu(eIdx, { institution: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Graduation Year"
                  value={edu.graduationYear || ''}
                  onChange={(e) => updateEdu(eIdx, { graduationYear: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addEdu}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700"
          >
            + Add Education
          </button>
        </div>
      );
    }

    case 'projects': {
      const records = d.records || [];
      const addProj = () => onUpdate({ ...d, records: [...records, { id: `proj_${Date.now()}`, name: '', description: '', technologies: [] }] });
      const updateProj = (idx, fields) => {
        const u = [...records];
        u[idx] = { ...u[idx], ...fields };
        onUpdate({ ...d, records: u });
      };
      return (
        <div className="space-y-3">
          {records.map((proj, pIdx) => (
            <div key={proj.id || pIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={proj.name || ''}
                  onChange={(e) => updateProj(pIdx, { name: e.target.value })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Tech stack (comma separated)"
                  value={(proj.technologies || []).join(', ')}
                  onChange={(e) => updateProj(pIdx, { technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className="p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Project overview and impact"
                value={proj.description || ''}
                onChange={(e) => updateProj(pIdx, { description: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          ))}
          <button
            onClick={addProj}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700"
          >
            + Add Project
          </button>
        </div>
      );
    }

    default:
      return (
        <textarea
          rows={3}
          value={d.content || ''}
          onChange={(e) => onUpdate({ ...d, content: e.target.value })}
          placeholder="Enter details for this custom section..."
          className="w-full p-3 rounded-xl border border-slate-200 text-xs"
        />
      );
  }
}

export default ManualProfileBuilder;
