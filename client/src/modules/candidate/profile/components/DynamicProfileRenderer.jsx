import React from 'react';
import {
  User, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap,
  Code, FolderGit2, Award, FileText, ExternalLink, Sparkles, CheckCircle2, Layers
} from 'lucide-react';

/**
 * Dynamic Profile Renderer for CandidateIQ
 * Follows the strict zero-hallucination principle:
 * Renders ONLY the sections and items that actually exist in the profile.
 */

export function DynamicProfileRenderer({ profile, isEditMode = false, onEditSection, onDeleteSection, onMoveSection }) {
  if (!profile || !Array.isArray(profile.sections) || profile.sections.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No profile sections available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Upload a resume or use the manual builder to populate your profile with verified sections.
        </p>
      </div>
    );
  }

  // Filter visible sections and sort by order
  const activeSections = profile.sections
    .filter((sec) => sec.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Separate personal_info as the top profile hero card, then render the remaining sections
  const personalInfoSection = activeSections.find((s) => s.type === 'personal_info');
  const contentSections = activeSections.filter((s) => s.type !== 'personal_info');

  return (
    <div className="space-y-6">
      {/* 1. Personal Information Hero Card */}
      {personalInfoSection && (
        <PersonalInfoHeroCard
          section={personalInfoSection}
          isEditMode={isEditMode}
          onEdit={() => onEditSection && onEditSection(personalInfoSection.id)}
        />
      )}

      {/* 2. Dynamic Content Sections */}
      <div className="space-y-5">
        {contentSections.map((section, idx) => (
          <SectionRenderer
            key={section.id || `sec_${idx}`}
            section={section}
            index={idx}
            total={contentSections.length}
            isEditMode={isEditMode}
            onEdit={() => onEditSection && onEditSection(section.id)}
            onDelete={() => onDeleteSection && onDeleteSection(section.id)}
            onMoveUp={() => onMoveSection && onMoveSection(section.id, 'up')}
            onMoveDown={() => onMoveSection && onMoveSection(section.id, 'down')}
          />
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Personal Info Header Card
// -------------------------------------------------------------
function PersonalInfoHeroCard({ section, isEditMode, onEdit }) {
  const d = section.data || {};
  const initials = (d.name || 'Candidate')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#606beb] to-[#8e98ff] text-white flex items-center justify-center font-black text-xl font-outfit shadow-md shadow-[#606beb]/20 flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight">
                {d.name || 'Candidate Name'}
              </h1>
              {section.confidence && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>
            {d.headline && (
              <p className="text-xs sm:text-sm font-semibold text-indigo-600 mt-0.5">
                {d.headline}
              </p>
            )}
          </div>
        </div>

        {isEditMode && (
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            Edit Header
          </button>
        )}
      </div>

      {/* Contact Details Badges */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-y-2.5 gap-x-5 text-xs text-slate-700 font-medium">
        {d.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <a href={`mailto:${d.email}`} className="hover:text-indigo-600 transition-colors font-semibold">
              {d.email}
            </a>
          </div>
        )}
        {d.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-700">{d.phone}</span>
          </div>
        )}
        {d.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-700">{d.location}</span>
          </div>
        )}
        {d.linkedin && (
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <a href={d.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">
              LinkedIn
            </a>
          </div>
        )}
        {d.github && (
          <div className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <a href={d.github} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">
              GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Generic Section Container & Switcher
// -------------------------------------------------------------
function SectionRenderer({ section, index, total, isEditMode, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const getSectionIcon = (type) => {
    switch (type) {
      case 'summary': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'skills': return <Code className="w-4 h-4 text-indigo-500" />;
      case 'experience': return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'projects': return <FolderGit2 className="w-4 h-4 text-amber-500" />;
      case 'certifications': return <Award className="w-4 h-4 text-emerald-500" />;
      default: return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
            {getSectionIcon(section.type)}
          </div>
          <h2 className="text-base font-black text-slate-900 font-outfit tracking-tight">
            {section.title}
          </h2>
          {section.source === 'resume' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
              Extracted
            </span>
          )}
        </div>

        {isEditMode && (
          <div className="flex items-center gap-1.5">
            <button
              disabled={index === 0}
              onClick={onMoveUp}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Up"
            >
              ↑
            </button>
            <button
              disabled={index === total - 1}
              onClick={onMoveDown}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Down"
            >
              ↓
            </button>
            <button
              onClick={onEdit}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Section"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Section Specific Content */}
      <div className="text-slate-700 text-xs sm:text-sm">
        {renderSectionBody(section)}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Type-Specific Body Renderers
// -------------------------------------------------------------
function renderSectionBody(section) {
  const d = section.data || {};

  switch (section.type) {
    case 'summary':
      return (
        <p className="text-slate-600 leading-relaxed font-normal whitespace-pre-line">
          {d.text || d.content || (typeof d === 'string' ? d : '')}
        </p>
      );

    case 'skills': {
      const groups = d.groups || [];
      const allSkills = d.allSkills || (Array.isArray(d) ? d : []);

      if (groups.length > 0) {
        return (
          <div className="space-y-3">
            {groups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                {grp.category && grp.category !== 'General' && (
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {grp.category}
                  </span>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {(grp.skills || []).map((sk, skIdx) => (
                    <span
                      key={skIdx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100/80 text-slate-800 border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {allSkills.map((sk, skIdx) => (
            <span
              key={skIdx}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100/80 text-slate-800 border border-slate-200/60"
            >
              {typeof sk === 'string' ? sk : sk.name || String(sk)}
            </span>
          ))}
        </div>
      );
    }

    case 'experience': {
      const records = d.records || (Array.isArray(d) ? d : []);
      if (records.length === 0) return null;

      return (
        <div className="space-y-5">
          {records.map((rec, rIdx) => (
            <div key={rec.id || rIdx} className="relative pl-4 border-l-2 border-slate-200 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {rec.title} <span className="text-slate-400 font-normal">at</span> <span className="text-indigo-600">{rec.company}</span>
                </h3>
                {rec.duration && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                    {rec.duration}
                  </span>
                )}
              </div>
              {rec.description && (
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                  {rec.description}
                </p>
              )}
              {Array.isArray(rec.responsibilities) && rec.responsibilities.length > 0 && (
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pt-1">
                  {rec.responsibilities.map((resp, bIdx) => (
                    <li key={bIdx}>{resp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'education': {
      const records = d.records || (Array.isArray(d) ? d : []);
      if (records.length === 0) return null;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {records.map((edu, eIdx) => (
            <div key={edu.id || eIdx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{edu.degree}</h3>
                {edu.graduationYear && (
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {edu.graduationYear}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
              {edu.cgpa && <p className="text-[11px] text-slate-500 font-semibold">{edu.cgpa}</p>}
            </div>
          ))}
        </div>
      );
    }

    case 'projects': {
      const records = d.records || (Array.isArray(d) ? d : []);
      if (records.length === 0) return null;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {records.map((proj, pIdx) => (
            <div key={proj.id || pIdx} className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm font-outfit">{proj.name}</h3>
                {proj.url && (
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    title="View Project"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              {proj.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {proj.description}
                </p>
              )}
              {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.technologies.map((tech, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'certifications': {
      const records = d.records || (Array.isArray(d) ? d : []);
      if (records.length === 0) return null;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {records.map((cert, cIdx) => (
            <div key={cert.id || cIdx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <div>
                <h3 className="font-bold text-xs text-slate-900">{cert.name}</h3>
                {cert.issuer && <p className="text-[11px] text-slate-500 font-medium">{cert.issuer}</p>}
              </div>
              {cert.date && (
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {cert.date}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }

    default: {
      // Custom / Arbitrary Section with Subsections
      return (
        <div className="space-y-3">
          {d.content && (
            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
              {d.content}
            </p>
          )}

          {Array.isArray(d.items) && d.items.length > 0 && (
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
              {d.items.map((item, iIdx) => (
                <li key={iIdx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
              ))}
            </ul>
          )}

          {Array.isArray(section.subsections) && section.subsections.length > 0 && (
            <div className="space-y-3 pt-2">
              {section.subsections.map((sub, subIdx) => (
                <div key={sub.id || subIdx} className="pl-3 border-l-2 border-indigo-200 space-y-1">
                  <h4 className="font-bold text-xs text-slate-800">{sub.title}</h4>
                  {Array.isArray(sub.items) && (
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                      {sub.items.map((it, itIdx) => (
                        <li key={itIdx}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  }
}

export default DynamicProfileRenderer;
