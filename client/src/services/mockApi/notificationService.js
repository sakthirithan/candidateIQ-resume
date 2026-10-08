/**
 * Centralized Module 19: Notification & Platform Activity Store
 * Handles cross-module notification dispatching for Candidate and Recruiter roles.
 */

const INITIAL_NOTIFICATIONS = [
  // Candidate Notifications
  {
    id: 'notif_1',
    role: 'candidate',
    type: 'status',
    title: 'Application Status Updated',
    desc: 'Your application for Senior MERN Stack & AI Engineer was updated to "Shortlisted".',
    time: '10m ago',
    unread: true
  },
  {
    id: 'notif_2',
    role: 'candidate',
    type: 'interview',
    title: 'AI Mock Interview Scheduled',
    desc: 'Mock interview invitation scheduled for Senior MERN Engineer role.',
    time: '1h ago',
    unread: true
  },
  {
    id: 'notif_3',
    role: 'candidate',
    type: 'interview_complete',
    title: 'Interview Scorecard Evaluated',
    desc: 'Your technical interview analysis (Score: 86/100) is ready for review.',
    time: '2h ago',
    unread: false
  },
  {
    id: 'notif_4',
    role: 'candidate',
    type: 'job',
    title: 'New Job Recommendation Available',
    desc: 'NeuralCorp published "Lead AI Architect" (94% match rating).',
    time: '3h ago',
    unread: false
  },

  // Recruiter Notifications
  {
    id: 'notif_5',
    role: 'recruiter',
    type: 'application',
    title: 'New Application Received',
    desc: 'Alex Johnson applied for Senior MERN Stack & AI Engineer (92% AI Match).',
    time: '5m ago',
    unread: true
  },
  {
    id: 'notif_6',
    role: 'recruiter',
    type: 'interview_complete',
    title: 'Candidate Completed Interview',
    desc: 'John Doe completed AI technical assessment with an 88/100 score.',
    time: '30m ago',
    unread: true
  },
  {
    id: 'notif_7',
    role: 'recruiter',
    type: 'shortlist',
    title: 'Candidate Shortlisted',
    desc: 'Alex Johnson moved to Shortlisted pipeline status.',
    time: '1h ago',
    unread: false
  }
];

let notificationStore = [...INITIAL_NOTIFICATIONS];
let listeners = [];

export const mockNotificationService = {
  getNotifications: (role = 'candidate') => {
    return notificationStore.filter(
      (n) => n.role === (role === 'hr' ? 'recruiter' : role) || n.role === 'all'
    );
  },

  getUnreadCount: (role = 'candidate') => {
    const list = mockNotificationService.getNotifications(role);
    return list.filter((n) => n.unread).length;
  },

  addNotification: ({ role, type, title, desc }) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      role: role || 'recruiter',
      type: type || 'system',
      title,
      desc,
      time: 'Just now',
      unread: true
    };
    notificationStore = [newNotif, ...notificationStore];
    listeners.forEach((fn) => fn(notificationStore));
    return newNotif;
  },

  markAllAsRead: (role = 'candidate') => {
    const targetRole = role === 'hr' ? 'recruiter' : role;
    notificationStore = notificationStore.map((n) =>
      n.role === targetRole || n.role === 'all' ? { ...n, unread: false } : n
    );
    listeners.forEach((fn) => fn(notificationStore));
  },

  subscribe: (listenerFn) => {
    listeners.push(listenerFn);
    return () => {
      listeners = listeners.filter((fn) => fn !== listenerFn);
    };
  }
};
