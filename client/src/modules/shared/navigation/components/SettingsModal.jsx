import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '@/utils/auth';
import { X, User, Lock, Bell, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

function SettingsModal({ isOpen, onClose, onUserUpdated }) {
  const [activeSubTab, setActiveSubTab] = useState('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const updated = updateUser({ name, email });
    setSuccessMsg('Settings updated and saved to localStorage successfully.');
    if (onUserUpdated) onUserUpdated(updated);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="saas-card p-6 md:p-8 bg-white border border-slate-200 w-full max-w-lg space-y-6 relative shadow-2xl select-none">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-outfit text-slate-950">Workspace Settings</h3>
          <p className="text-xs text-slate-500">Manage account information, security credentials, and preferences.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3 text-xs font-semibold">
          {[
            { id: 'account', label: 'Account Profile', icon: User },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'preferences', label: 'Preferences', icon: Bell }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveSubTab(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeSubTab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {activeSubTab === 'account' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>
            </>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-saas w-full text-xs"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'preferences' && (
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                <span className="text-slate-700 font-medium">Enable AI profile matching alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                <span className="text-slate-700 font-medium">Enable mock interview scorecard notifications</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs font-bold">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
