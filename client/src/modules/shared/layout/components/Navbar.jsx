import React from 'react';
import { Cpu, User, Briefcase, Award, Shield, LogOut, CheckCircle } from 'lucide-react';

function Navbar({ activeTab, setActiveTab, userRole, setUserRole, currentUser, onLogout }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit gradient-text">TalentAI</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Candidate Profiling & Recruitment AI</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
          {userRole === 'candidate' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Candidate Profile
              </button>

              <button
                onClick={() => setActiveTab('resume')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resume Parsing
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'jobs' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jobs & Matching
              </button>

              <button
                onClick={() => setActiveTab('interview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'interview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Mock Interview
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('recruiter-dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'recruiter-dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recruiter Portal
              </button>

              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'comparison' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Candidate Matrix
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'assistant' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Assistant
              </button>
            </>
          )}
        </nav>

        {/* Role Toggle & Account Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                setUserRole('candidate');
                setActiveTab('dashboard');
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                userRole === 'candidate' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Candidate
            </button>
            <button
              onClick={() => {
                setUserRole('recruiter');
                setActiveTab('recruiter-dashboard');
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                userRole === 'recruiter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recruiter HR
            </button>
          </div>

          {currentUser && (
            <button
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
