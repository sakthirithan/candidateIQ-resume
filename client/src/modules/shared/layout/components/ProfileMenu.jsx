import React, { useState, useRef, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '@/utils/auth';
import { User, Settings, LogOut, ChevronDown, Shield, CheckCircle2 } from 'lucide-react';

function ProfileMenu({ onOpenSettings, onLogoutSuccess, onNavigateToProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const user = getCurrentUser() || { name: 'Guest User', email: 'guest@example.com', role: 'candidate' };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    if (onLogoutSuccess) onLogoutSuccess();
  };

  return (
    <div className="relative select-none" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-outfit shadow-xs">
          {getInitials(user.name)}
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-xs font-bold text-slate-900 block font-outfit leading-tight">{user.name}</span>
          <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider block">
            {user.role === 'hr' ? 'HR Recruiter' : user.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-slate-100 space-y-1">
            <p className="text-xs font-bold text-slate-900 font-outfit">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              {user.role} Workspace
            </span>
          </div>

          <div className="py-1 text-xs text-slate-700 font-medium">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToProfile) onNavigateToProfile();
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" /> View Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings();
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" /> Settings
            </button>
          </div>

          <div className="pt-1 border-t border-slate-100 text-xs">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
