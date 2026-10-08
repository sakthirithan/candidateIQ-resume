import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Sparkles, AlertCircle, X, Check, Filter, Plus, Briefcase, Calendar, ShieldCheck } from 'lucide-react';
import { mockNotificationService } from '@/services/mockApi/notificationService';

function NotificationCenter({ isOpen, onClose, userRole }) {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const normalizedRole = userRole === 'hr' ? 'recruiter' : (userRole || 'candidate');

  useEffect(() => {
    if (isOpen) {
      setNotifications(mockNotificationService.getNotifications(normalizedRole));
    }
    const unsubscribe = mockNotificationService.subscribe(() => {
      setNotifications(mockNotificationService.getNotifications(normalizedRole));
    });
    return () => unsubscribe();
  }, [isOpen, normalizedRole]);

  if (!isOpen) return null;

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => {
        if (filter === 'status') return n.type === 'status' || n.type === 'application';
        if (filter === 'interview') return n.type === 'interview' || n.type === 'interview_complete';
        if (filter === 'job') return n.type === 'job' || n.type === 'shortlist';
        return true;
      });

  const handleMarkAllRead = () => {
    mockNotificationService.markAllAsRead(normalizedRole);
  };

  const handleSimulateEvent = (type) => {
    if (normalizedRole === 'candidate') {
      if (type === 'status') {
        mockNotificationService.addNotification({
          role: 'candidate',
          type: 'status',
          title: 'Application Status Updated',
          desc: 'Your application for Senior MERN Stack & AI Engineer was updated to "Shortlisted".'
        });
      } else if (type === 'interview') {
        mockNotificationService.addNotification({
          role: 'candidate',
          type: 'interview',
          title: 'Interview Scheduled',
          desc: 'HR team scheduled technical round for Senior MERN Stack role tomorrow at 2:00 PM.'
        });
      } else if (type === 'job') {
        mockNotificationService.addNotification({
          role: 'candidate',
          type: 'job',
          title: 'Job Recommendation Available',
          desc: 'New 95% AI Match role available: "Principal AI Architect" at TechNova.'
        });
      }
    } else {
      // Recruiter
      if (type === 'app') {
        mockNotificationService.addNotification({
          role: 'recruiter',
          type: 'application',
          title: 'New Application Received',
          desc: 'David Kim applied for Senior MERN Stack & AI Engineer (89% AI Match).'
        });
      } else if (type === 'interview') {
        mockNotificationService.addNotification({
          role: 'recruiter',
          type: 'interview_complete',
          title: 'Candidate Completed Interview',
          desc: 'Sarah Wilson completed AI Technical Assessment (Score: 92/100).'
        });
      } else if (type === 'shortlist') {
        mockNotificationService.addNotification({
          role: 'recruiter',
          type: 'shortlist',
          title: 'Candidate Shortlisted',
          desc: 'Alex Johnson moved to Shortlisted stage in requisition pipeline.'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 select-none transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full border-l border-slate-200 p-6 space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-outfit text-slate-900 leading-none">
                  {normalizedRole === 'recruiter' ? 'Recruiter Activity Stream' : 'Candidate Activity Stream'}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Module 19 Notification Store</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Simulation Trigger Toolbar */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulate Live Flow Action</span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded capitalize">{normalizedRole}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {normalizedRole === 'candidate' ? (
                <>
                  <button
                    onClick={() => handleSimulateEvent('status')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-indigo-600" /> Status Update
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('interview')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3 text-purple-600" /> Interview Scheduled
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('job')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> Job Recommendation
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSimulateEvent('app')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-indigo-600" /> New Application
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('interview')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Candidate Interview Complete
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('shortlist')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-purple-600" /> Candidate Shortlisted
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/70 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('status')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'status' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Status / Apps
            </button>
            <button
              onClick={() => setFilter('interview')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'interview' ? 'bg-white text-purple-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Interviews
            </button>
            <button
              onClick={() => setFilter('job')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${filter === 'job' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Job / Pipeline
            </button>
          </div>

          {/* List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-290px)] pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No notifications for this filter category.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.unread
                      ? 'bg-gradient-to-r from-indigo-50/60 to-purple-50/30 border-indigo-200 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/70 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5">
                      {n.type === 'status' && <Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
                      {n.type === 'application' && <Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
                      {n.type === 'interview' && <Calendar className="w-3.5 h-3.5 text-purple-600" />}
                      {n.type === 'interview_complete' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {n.type === 'job' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      {n.type === 'shortlist' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                      <h4 className="text-xs font-bold text-slate-900 font-outfit">{n.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">{n.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleMarkAllRead}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;

