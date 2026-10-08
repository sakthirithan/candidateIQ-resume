import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import {
  Brain, Code, Cpu, Database, Cloud, Server, Sparkles, Layers, Award,
  Plus, Edit2, Trash2, X, CheckCircle2, Filter, Search, ShieldCheck, RefreshCw, BarChart2,
  AlertTriangle, HelpCircle, ChevronRight, Info
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

function SkillIntelligence({ onNavigate }) {
  const [skillMatrix, setSkillMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillForDetails, setSelectedSkillForDetails] = useState(null);

  useEffect(() => {
    fetchSkillMatrix();
  }, []);

  const fetchSkillMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/candidates/me/skills');
      if (res.data && res.data.data) {
        setSkillMatrix(res.data.data);
      } else {
        throw new Error('Skill matrix format invalid');
      }
    } catch (err) {
      console.error('[SkillIntelligence] Failed to load skill matrix:', err);
      setError('Unable to load your candidate skill intelligence matrix.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto animate-pulse">
        <div className="saas-card p-6 md:p-8 h-32 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl lg:col-span-1"></div>
          <div className="saas-card p-6 h-80 bg-slate-100 rounded-2xl lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 saas-card">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-outfit text-slate-950">{error}</h3>
        <p className="text-xs text-slate-500">Please check your database connectivity or refresh your session.</p>
        <button
          onClick={fetchSkillMatrix}
          className="btn-ai text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Skill Matrix
        </button>
      </div>
    );
  }

  const skills = skillMatrix?.skills || [];
  const categories = skillMatrix?.categories || ['All', 'Frontend', 'Backend', 'Database', 'Programming', 'Cloud', 'DevOps', 'AI/ML', 'Tools', 'Soft Skills'];
  const gapAnalysis = skillMatrix?.skillGapAnalysis || {};
  const metrics = skillMatrix?.summaryMetrics || {};

  // Filter skills by Category & Search
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamic Radar Chart Data
  const radarCategories = ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Tools'];
  const radarData = radarCategories.map((cat) => {
    const catSkills = skills.filter((s) => s.category.includes(cat) || cat.includes(s.category));
    const avgScore = catSkills.length > 0
      ? Math.round(catSkills.reduce((acc, curr) => acc + curr.score, 0) / catSkills.length)
      : 0;
    return { category: cat, score: avgScore };
  });

  const getEvidenceLevelBadge = (level) => {
    switch (level) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ VERIFIED</span>;
      case 'DEMONSTRATED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">🎯 DEMONSTRATED</span>;
      case 'PROJECT_EVIDENCE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">📁 PROJECT EVIDENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">📄 CLAIMED ONLY</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Top Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Candidate Skill Intelligence</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Evidence Matrix Active
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Multi-level evidence hierarchy distinguishing self-declared resume claims from project demonstrations and interview evaluations.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200/80">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Evaluated</span>
            <span className="text-xl font-bold font-outfit text-slate-950">{metrics.totalSkills || 0} Skills</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Confidence</span>
            <span className="text-xl font-bold font-outfit text-indigo-600">{metrics.averageConfidence || 0}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Analysis & Skill Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competency Density Radar */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" /> Domain Competency Radar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Strength distribution across tech stacks</p>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Candidate" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Evidence Level Breakdown
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-slate-600">
              <span>Verified: <strong className="text-indigo-700">{metrics.verifiedSkillsCount || 0}</strong></span>
              <span>Demonstrated: <strong className="text-indigo-700">{metrics.demonstratedSkillsCount || 0}</strong></span>
              <span>Claimed Only: <strong className="text-slate-700">{metrics.claimedOnlyCount || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Real Skill Gap Intelligence Card */}
        <div className="saas-card p-6 border border-slate-200/80 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Requisition Skill Gap Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Role: <strong className="text-slate-800 font-semibold">{gapAnalysis.targetRole || 'Software Candidate'}</strong>
              </p>
            </div>
            <span className="badge-pill badge-ai text-[10px]">Real Job Match</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Strong Competencies */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Strong Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {gapAnalysis.strongSkills && gapAnalysis.strongSkills.length > 0 ? (
                  gapAnalysis.strongSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 italic">Complete interviews to verify strong skills</span>
                )}
              </div>
            </div>

            {/* Developing Competencies */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Developing Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {gapAnalysis.developingSkills && gapAnalysis.developingSkills.length > 0 ? (
                  gapAnalysis.developingSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white text-indigo-800 text-[11px] font-bold border border-indigo-200">
                      ◐ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-indigo-700 italic">None currently developing</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Missing / Unverified</span>
              <div className="flex flex-wrap gap-1.5">
                {gapAnalysis.missingSkills && gapAnalysis.missingSkills.length > 0 ? (
                  gapAnalysis.missingSkills.slice(0, 6).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white text-amber-800 text-[11px] font-bold border border-amber-200">
                      ⚠ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">✓ All target role skills verified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="saas-card p-4 border border-slate-200/80 flex flex-wrap justify-between items-center gap-4 bg-slate-50/60">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skill evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-saas pl-9 py-1.5 text-xs w-full bg-white"
          />
        </div>
      </div>

      {/* Main Skill Matrix Grid */}
      {filteredSkills.length === 0 ? (
        <div className="saas-card p-12 text-center space-y-4 border border-slate-200/80">
          <Brain className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold font-outfit text-slate-950">No skill evidence found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your resume or practice an AI mock interview to extract and verify skills.
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('resume')}
            className="btn-ai text-xs inline-flex items-center gap-2"
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.skillId}
              className="saas-card p-5 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 hover:shadow-md bg-white group cursor-pointer"
              onClick={() => setSelectedSkillForDetails(skill)}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold font-outfit text-slate-950 group-hover:text-indigo-600 transition-colors">
                      {skill.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">Category: {skill.category}</span>
                  </div>
                  {getEvidenceLevelBadge(skill.evidenceLevel)}
                </div>

                {/* Score & Progress */}
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{skill.proficiencyLevel}</span>
                    <span className="font-mono text-indigo-600 font-bold">{skill.score} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${skill.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Evidence & Confidence Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {skill.confidence}% Confidence
                </span>
                <span className="text-indigo-600 font-bold group-hover:underline flex items-center gap-0.5">
                  View Evidence <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Evidence Detail Modal */}
      {selectedSkillForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden space-y-6 p-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg font-outfit">
                  {selectedSkillForDetails.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-outfit text-slate-950">{selectedSkillForDetails.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{selectedSkillForDetails.category} Stack</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkillForDetails(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Calculated Rating</span>
                  <span className="text-2xl font-black font-outfit text-slate-950">{selectedSkillForDetails.score} / 100</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Evidence Level</span>
                  {getEvidenceLevelBadge(selectedSkillForDetails.evidenceLevel)}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Evidence Sources</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span>Parsed Resume Keyword</span>
                    <span className={selectedSkillForDetails.evidenceDetails?.resume ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {selectedSkillForDetails.evidenceDetails?.resume ? '✓ Verified' : '✕ Not declared'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span>Portfolio Projects</span>
                    <span className="font-mono text-indigo-600 font-bold">{selectedSkillForDetails.evidenceDetails?.projectCount || 0} projects</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span>Mock Interview Questions Evaluated</span>
                    <span className="font-mono text-purple-600 font-bold">{selectedSkillForDetails.evidenceDetails?.mockInterviewsEvaluated || 0} questions</span>
                  </div>
                </div>
              </div>

              {selectedSkillForDetails.evidenceDetails?.sampleMockQuestion && (
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1">
                  <span className="font-bold text-indigo-900 block">Sample Evaluated Question Response:</span>
                  <p className="text-indigo-800 italic">"{selectedSkillForDetails.evidenceDetails.sampleMockQuestion.question}"</p>
                  <p className="text-[11px] text-indigo-700 font-medium pt-1">
                    Score: <strong>{selectedSkillForDetails.evidenceDetails.sampleMockQuestion.score}%</strong> — {selectedSkillForDetails.evidenceDetails.sampleMockQuestion.feedback}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSkillForDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillIntelligence;
