import React from 'react';
import { getCurrentUser, updateUser } from '@/utils/auth';
import {
  LayoutDashboard,
  User,
  FileText,
  Brain,
  Briefcase,
  Layers,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Zap,
  ChevronDown,
  Bot,
  BookmarkCheck,
  Calendar,
  Video
} from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, userRole, setUserRole, onRoleChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const currentUser = getCurrentUser() || { name: 'User', role: userRole || 'candidate' };
  const initials = currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const isDemoAccount = Boolean(
    !currentUser ||
    currentUser.isDemo ||
    currentUser.email?.includes('demo') ||
    currentUser.id?.includes('demo') ||
    currentUser.email === 'candidate.demo@candidateiq.com' ||
    currentUser.email === 'recruiter.demo@candidateiq.com' ||
    currentUser.email === 'admin@candidateiq.com'
  );

  const effectiveRole = currentUser.role || userRole || 'candidate';
  const isCandidate = effectiveRole === 'candidate';
  const isRecruiter = effectiveRole === 'hr' || effectiveRole === 'recruiter';
  const isAdmin = effectiveRole === 'admin';

  const getNavButtonClass = (tabName, isAi = false) => {
    const isActive = activeTab === tabName;
    if (isActive) {
      return `w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-b from-[#8e98ff] to-[#606beb] text-white shadow-md shadow-[#606beb]/30 transition-all`;
    }
    return `w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all`;
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-[#e4e7ec] flex flex-col justify-between h-screen shrink-0 z-40 select-none shadow-xs transition-all duration-300 font-sans`}>
      {/* Top Header Logo & Collapse Toggle */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group overflow-hidden" onClick={() => setActiveTab('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#8e98ff] to-[#606beb] flex items-center justify-center text-white font-black font-outfit shadow-md shadow-[#606beb]/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg font-outfit text-slate-900 tracking-tight">Candidate</span>
                <span className="font-black text-lg font-outfit text-[#606beb]">IQ</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block -mt-1">AI Intelligence SaaS</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Role Switcher Selector / Locked Role Badge */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium text-[11px]">Workspace Role</span>
        {isDemoAccount ? (
          <select
            value={isRecruiter ? 'recruiter' : isAdmin ? 'admin' : 'candidate'}
            onChange={(e) => {
              const val = e.target.value;
              const targetRole = val === 'recruiter' ? 'hr' : val;
              updateUser({ role: targetRole });
              if (onRoleChange) {
                onRoleChange(targetRole);
              } else if (setUserRole) {
                setUserRole(targetRole);
              }
              const nextTab = targetRole === 'candidate' ? 'dashboard' : targetRole === 'admin' ? 'admin-dashboard' : 'recruiter-dashboard';
              setActiveTab(nextTab);
            }}
            className="bg-white border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-[11px] cursor-pointer shadow-2xs"
          >
            <option value="candidate">Candidate Demo</option>
            <option value="recruiter">Recruiter HR Demo</option>
            <option value="admin">System Admin</option>
          </select>
        ) : (
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100 capitalize">
            {isRecruiter ? 'HR Recruiter' : isCandidate ? 'Candidate' : 'Admin'}
          </span>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-6">
        {isCandidate && (
          <>
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Core Candidate Suite</span>
              
              <button onClick={() => setActiveTab('dashboard')} className={getNavButtonClass('dashboard')}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" /> Overview Dashboard
                </div>
              </button>

              <button onClick={() => setActiveTab('jobs')} className={getNavButtonClass('jobs')}>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" /> Job Discovery
                </div>
              </button>

              <button onClick={() => setActiveTab('tracker')} className={getNavButtonClass('tracker')}>
                <div className="flex items-center gap-3">
                  <BookmarkCheck className="w-4 h-4" /> Tracker
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                  3
                </span>
              </button>

              <button onClick={() => setActiveTab('hr-interviews')} className={getNavButtonClass('hr-interviews')}>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-purple-600" /> Interview
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-100">
                  2
                </span>
              </button>

              <button onClick={() => setActiveTab('profile')} className={getNavButtonClass('profile')}>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" /> My Profile
                </div>
              </button>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-100">
              <span className="px-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" /> AI Practice Studio
              </span>

              <button onClick={() => setActiveTab('interview')} className={getNavButtonClass('interview', true)}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4" /> AI Mock Interview
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white">LIVE</span>
              </button>

              <button onClick={() => setActiveTab('activities')} className={getNavButtonClass('activities')}>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Activities
                </div>
              </button>

              <button onClick={() => setActiveTab('interview-journey')} className={getNavButtonClass('interview-journey')}>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" /> My Interview Journey
                </div>
              </button>

              <button onClick={() => setActiveTab('skills')} className={getNavButtonClass('skills')}>
                <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4" /> Skill Matrix
                </div>
              </button>
            </div>
          </>
        )}

        {isRecruiter && (
          <>
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Recruiter Workspace
                </span>
              )}

              <button
                onClick={() => setActiveTab('recruiter-dashboard')}
                className={getNavButtonClass('recruiter-dashboard')}
                title={isCollapsed ? 'Dashboard' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Dashboard</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shrink-0 ml-auto">
                    M14
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('jobs-recruiter')}
                className={getNavButtonClass('jobs-recruiter')}
                title={isCollapsed ? 'Jobs' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Jobs</span>}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('candidates-recruiter')}
                className={getNavButtonClass('candidates-recruiter')}
                title={isCollapsed ? 'Applications & Candidates' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Users className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Applications & Candidates</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shrink-0 ml-auto">
                    M15
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('hr-interviews-recruiter')}
                className={getNavButtonClass('hr-interviews-recruiter')}
                title={isCollapsed ? 'Candidate Interviews' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Video className="w-4 h-4 text-purple-600 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Candidate Interviews</span>}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('create-interview-recruiter')}
                className={getNavButtonClass('create-interview-recruiter')}
                title={isCollapsed ? 'Create Interview' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Calendar className="w-4 h-4 text-[#606beb] shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Create Interview</span>}
                </div>
              </button>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-100">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" /> Hiring Intelligence
                </span>
              )}

              <button
                onClick={() => setActiveTab('candidate-intelligence')}
                className={getNavButtonClass('candidate-intelligence', true)}
                title={isCollapsed ? 'Candidate Intelligence' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Zap className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Candidate Intelligence</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shrink-0 ml-auto">
                    M13
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('interview-evaluation')}
                className={getNavButtonClass('interview-evaluation', true)}
                title={isCollapsed ? 'Interview Analytics' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Award className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Interview Analytics</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500 text-white shrink-0 ml-auto">
                    M11
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('comparison')}
                className={getNavButtonClass('comparison', true)}
                title={isCollapsed ? 'Compare Candidates' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">Compare Candidates</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white shrink-0 ml-auto">
                    M16
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className={getNavButtonClass('assistant', true)}
                title={isCollapsed ? 'AI Assistant' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate font-semibold">AI Assistant</span>}
                </div>
                {!isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shrink-0 ml-auto">
                    M17
                  </span>
                )}
              </button>
            </div>
          </>
        )}

        {isAdmin && (
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Admin Control
              </span>
            )}
            <button
              onClick={() => setActiveTab('admin-dashboard')}
              className={getNavButtonClass('admin-dashboard')}
              title={isCollapsed ? 'System Administration' : undefined}
            >
              <div className="flex items-center gap-3 min-w-0 truncate">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate font-semibold">System Administration</span>}
              </div>
              {!isCollapsed && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-white shrink-0 ml-auto">
                  M18
                </span>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Footer Settings & Account */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('settings')}
          className={getNavButtonClass('settings')}
          title={isCollapsed ? 'System Settings' : undefined}
        >
          <div className="flex items-center gap-3 min-w-0 truncate">
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate font-semibold">System Settings</span>}
          </div>
        </button>

        <div className="pt-2 flex items-center gap-3 border-t border-slate-200/60 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white shadow-xs font-outfit shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 truncate">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold block truncate uppercase tracking-wider">
                {currentUser.role === 'hr' ? 'HR Recruiter' : currentUser.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
