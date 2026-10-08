import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Sparkles, ShieldCheck, Database, Building2, Sliders, CheckCircle2, Save, Key, Shield, Layers } from 'lucide-react';
import { getCurrentUser, updateUser } from '@/utils/auth';

function SettingsPage({ userRole = 'candidate', currentUser }) {
  const role = userRole === 'hr' ? 'recruiter' : (userRole || 'candidate');

  // Define tab lists by role according to Module 20 specs
  const getTabsForRole = () => {
    if (role === 'candidate') {
      return [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'notifications', label: 'Notification Settings', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
        { id: 'account', label: 'Account', icon: Lock }
      ];
    } else if (role === 'recruiter') {
      return [
        { id: 'company', label: 'Company / Profile', icon: Building2 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Sliders },
        { id: 'account', label: 'Account', icon: Lock }
      ];
    } else {
      // Admin
      return [
        { id: 'system', label: 'System Preferences', icon: Layers },
        { id: 'account', label: 'Account', icon: Key }
      ];
    }
  };

  const tabs = getTabsForRole();
  const [activeSubTab, setActiveSubTab] = useState(tabs[0].id);
  const [successMsg, setSuccessMsg] = useState('');

  // Candidate state
  const [candidateName, setCandidateName] = useState(currentUser?.name || 'Alex Johnson');
  const [candidateHeadline, setCandidateHeadline] = useState('Senior MERN Stack & AI Engineer');
  const [candidateTargetRole, setCandidateTargetRole] = useState('Full Stack AI Developer');
  const [candidateLocation, setCandidateLocation] = useState('San Francisco, CA (Remote)');
  const [candidateBio, setCandidateBio] = useState('Passionate about building full-stack Web apps integrated with AI models.');

  // Recruiter state
  const [companyName, setCompanyName] = useState('TechNova Solutions');
  const [industry, setIndustry] = useState('Enterprise AI & SaaS');
  const [website, setWebsite] = useState('https://technova.ai');
  const [recruiterName, setRecruiterName] = useState(currentUser?.name || 'Sarah Jenkins');
  const [recruiterSignature, setRecruiterSignature] = useState('Sarah Jenkins | Head of Talent Acquisition @ TechNova');

  // Admin state
  const [weightTech, setWeightTech] = useState(40);
  const [weightBehavioral, setWeightBehavioral] = useState(30);
  const [weightExperience, setWeightExperience] = useState(30);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logRetentionDays, setLogRetentionDays] = useState(90);

  // Common Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [aiJobAlerts, setAiJobAlerts] = useState(true);

  // Privacy toggles
  const [publicProfile, setPublicProfile] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [aiDataSharing, setAiDataSharing] = useState(true);

  // Recruiter Preferences
  const [matchThreshold, setMatchThreshold] = useState(80);
  const [autoShortlist, setAutoShortlist] = useState(true);

  useEffect(() => {
    setActiveSubTab(tabs[0].id);
  }, [role]);

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({ name: role === 'recruiter' ? recruiterName : candidateName });
    setSuccessMsg(`${tabs.find(t => t.id === activeSubTab)?.label || 'Settings'} updated and saved successfully.`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-outfit text-slate-900">Module 20 — Shared Settings</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-50 border border-indigo-200 text-indigo-700">
              {role} role view
            </span>
          </div>
          <p className="text-xs text-slate-500">Configure profile settings, notifications, privacy, preferences, and system parameters.</p>
        </div>
      </div>

      <div className="saas-card p-6 border border-slate-200 bg-white space-y-6 shadow-sm">
        {/* Role Settings Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === t.id ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 max-w-xl">
          {/* ================= CANDIDATE TABS ================= */}
          {role === 'candidate' && activeSubTab === 'profile' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Professional Headline</label>
                <input
                  type="text"
                  value={candidateHeadline}
                  onChange={(e) => setCandidateHeadline(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Target Role Title</label>
                  <input
                    type="text"
                    value={candidateTargetRole}
                    onChange={(e) => setCandidateTargetRole(e.target.value)}
                    className="input-saas w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Location / Work Mode</label>
                  <input
                    type="text"
                    value={candidateLocation}
                    onChange={(e) => setCandidateLocation(e.target.value)}
                    className="input-saas w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
                <textarea
                  rows="3"
                  value={candidateBio}
                  onChange={(e) => setCandidateBio(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>
            </div>
          )}

          {/* ================= RECRUITER TABS ================= */}
          {role === 'recruiter' && activeSubTab === 'company' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Industry Domain</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="input-saas w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Corporate Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="input-saas w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Lead Recruiter Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Signature Template</label>
                <input
                  type="text"
                  value={recruiterSignature}
                  onChange={(e) => setRecruiterSignature(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>
            </div>
          )}

          {/* ================= ADMIN TABS ================= */}
          {role === 'admin' && activeSubTab === 'system' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 font-outfit">CandidateIQ AI Scoring Weight Ratios</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Technical Score</span>
                    <input
                      type="number"
                      value={weightTech}
                      onChange={(e) => setWeightTech(e.target.value)}
                      className="w-full text-center font-bold text-indigo-600 bg-white border border-slate-200 rounded py-1 text-sm mt-1"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">% Weight</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Behavioral Score</span>
                    <input
                      type="number"
                      value={weightBehavioral}
                      onChange={(e) => setWeightBehavioral(e.target.value)}
                      className="w-full text-center font-bold text-purple-600 bg-white border border-slate-200 rounded py-1 text-sm mt-1"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">% Weight</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Experience Match</span>
                    <input
                      type="number"
                      value={weightExperience}
                      onChange={(e) => setWeightExperience(e.target.value)}
                      className="w-full text-center font-bold text-emerald-600 bg-white border border-slate-200 rounded py-1 text-sm mt-1"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">% Weight</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">System Maintenance Mode</h4>
                    <p className="text-[11px] text-slate-500">Temporarily restrict candidate applications for maintenance.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Audit Log Retention Period</h4>
                    <p className="text-[11px] text-slate-500">Retention timeframe for candidate activity logs.</p>
                  </div>
                  <select
                    value={logRetentionDays}
                    onChange={(e) => setLogRetentionDays(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================= COMMON NOTIFICATIONS TAB ================= */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Email Application Updates</span>
                    <span className="text-[11px] text-slate-500">Receive instant email alerts when application status changes.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                  />
                </label>

                <div className="border-t border-slate-200/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">SMS Interview Reminders</span>
                      <span className="text-[11px] text-slate-500">Receive SMS notifications 30 minutes prior to scheduled interviews.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </label>
                </div>

                <div className="border-t border-slate-200/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">AI Job Match Digest</span>
                      <span className="text-[11px] text-slate-500">Receive daily AI curated candidate/job match recommendations.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiJobAlerts}
                      onChange={(e) => setAiJobAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= PRIVACY TAB ================= */}
          {activeSubTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Public Recruiter Discoverability</span>
                    <span className="text-[11px] text-slate-500">Allow verified recruiters to search and view your candidate score profile.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={publicProfile}
                    onChange={(e) => setPublicProfile(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                  />
                </label>

                <div className="border-t border-slate-200/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Anonymous Evaluation Mode</span>
                      <span className="text-[11px] text-slate-500">Hide full name and contact information during initial screening stage.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={anonymousMode}
                      onChange={(e) => setAnonymousMode(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </label>
                </div>

                <div className="border-t border-slate-200/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">AI Resume Training Consent</span>
                      <span className="text-[11px] text-slate-500">Allow anonymized resume benchmarks to improve AI matching accuracy.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiDataSharing}
                      onChange={(e) => setAiDataSharing(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= RECRUITER PREFERENCES TAB ================= */}
          {activeSubTab === 'preferences' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Minimum AI Match Threshold</span>
                    <span className="font-extrabold text-indigo-600">{matchThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">Candidates below this threshold will be flagged as low match.</span>
                </div>

                <div className="border-t border-slate-200/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Auto-Shortlist Top Match Profiles</span>
                      <span className="text-[11px] text-slate-500">Automatically advance candidates with AI Match score &gt; 90%.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoShortlist}
                      onChange={(e) => setAutoShortlist(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= ACCOUNT TAB ================= */}
          {activeSubTab === 'account' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || (role === 'recruiter' ? 'hr@technova.ai' : role === 'admin' ? 'admin@candidateiq.io' : 'alex.johnson@example.com')}
                  className="input-saas w-full text-xs bg-slate-100/80 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Change Security Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Two-Factor Authentication (2FA)</span>
                  <span className="text-[11px] text-slate-500">Secure your account with TOTP authenticator app.</span>
                </div>
                <button type="button" className="btn-secondary text-[11px] py-1 px-2.5">
                  Configure 2FA
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-indigo-400" /> Save Settings Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;

