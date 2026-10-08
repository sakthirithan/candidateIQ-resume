import React, { useState } from 'react';
import { X, Sparkles, User, Briefcase, Award, CheckCircle2, Search, Filter, Code, ArrowRight, ShieldCheck } from 'lucide-react';

function DemoModal({ isOpen, onClose, onLaunchFullWorkspace }) {
  const [demoRole, setDemoRole] = useState('candidate'); // 'candidate' or 'recruiter'
  const [recruiterSearch, setRecruiterSearch] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden select-none">
        {/* Modal Window Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm font-outfit shadow-xs">
              IQ
            </div>
            <div>
              <h3 className="text-sm font-bold font-outfit text-slate-100 flex items-center gap-2">
                CandidateIQ Interactive Sandbox Demo
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase tracking-wider font-semibold">
                  Live Preview • No Redirect
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Switch role tabs to test candidate profile insights and HR recruiter tools live.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setDemoRole('candidate')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  demoRole === 'candidate' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Candidate View
              </button>
              <button
                onClick={() => setDemoRole('recruiter')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  demoRole === 'recruiter' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> HR Recruiter View
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Demo Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {demoRole === 'candidate' ? (
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <div className="saas-card p-6 bg-white border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black font-outfit">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold font-outfit text-slate-900">Alex Johnson</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        AI Verified Candidate
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold">Senior Full Stack MERN & AI Developer</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">alex.johnson@example.com • San Francisco, CA</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900 px-5 py-3 rounded-xl text-white">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unified IQ Score</span>
                    <span className="text-2xl font-black font-outfit text-indigo-400">88 / 100</span>
                  </div>
                </div>
              </div>

              {/* Grid Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Breakdown */}
                <div className="saas-card p-5 bg-white border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" /> Multi-Dimensional Evaluation
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">Technical Depth (25%)</span>
                        <span className="text-indigo-600 font-bold">91/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">Mock Interview Score (20%)</span>
                        <span className="text-cyan-600 font-bold">86/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '86%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">Job Match Alignment (20%)</span>
                        <span className="text-emerald-600 font-bold">89/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="saas-card p-5 bg-white border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-600" /> Verified Core Skills
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {['React.js (Expert)', 'Node.js (Expert)', 'TypeScript (Advanced)', 'MongoDB (Advanced)', 'Python (Intermediate)', 'Docker (Intermediate)'].map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 text-xs font-semibold border border-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recruiter Header Bar */}
              <div className="saas-card p-5 bg-white border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h4 className="text-base font-bold font-outfit text-slate-900">Talent Acquisition Command Sandbox</h4>
                  <p className="text-xs text-slate-500">Filter candidate pool, inspect job matches, and review AI decision-support scores.</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search candidate name or skill..."
                    value={recruiterSearch}
                    onChange={(e) => setRecruiterSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Recruiter Candidate Table */}
              <div className="saas-card p-5 bg-white border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Technical</th>
                      <th className="py-3 px-4">Job Match</th>
                      <th className="py-3 px-4">Overall IQ</th>
                      <th className="py-3 px-4">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { name: 'Alex Johnson', role: 'Full Stack MERN Lead', tech: 91, match: 92, overall: 88, rec: 'Top Match' },
                      { name: 'John Doe', role: 'AI Systems Architect', tech: 94, match: 94, overall: 89, rec: 'Top Match' },
                      { name: 'Sarah Wilson', role: 'Backend Engineer', tech: 84, match: 79, overall: 82, rec: 'Recommended' }
                    ]
                      .filter(c => c.name.toLowerCase().includes(recruiterSearch.toLowerCase()) || c.role.toLowerCase().includes(recruiterSearch.toLowerCase()))
                      .map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3 px-4 text-slate-600">{c.role}</td>
                          <td className="py-3 px-4 text-indigo-600 font-mono font-bold">{c.tech}/100</td>
                          <td className="py-3 px-4 text-emerald-600 font-mono font-bold">{c.match}%</td>
                          <td className="py-3 px-4 text-slate-900 font-mono font-black text-sm">{c.overall}/100</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              {c.rec}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Demonstrating CandidateIQ Interactive Frontend Prototype</span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onLaunchFullWorkspace) onLaunchFullWorkspace(demoRole);
            }}
            className="btn-primary text-xs flex items-center gap-2"
          >
            Create Your Account & Enter Platform <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoModal;
