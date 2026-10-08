import React, { useState, useEffect, useCallback } from 'react';
import adminService from '@/services/admin/adminService';
import { getCurrentUser } from '@/utils/auth';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  Activity,
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Cpu,
  ShieldAlert,
  Server
} from 'lucide-react';

function AdminManagement() {
  const currentUser = getCurrentUser();

  // Dashboard Aggregated Stats
  const [stats, setStats] = useState({
    users: { total: 0, candidates: 0, recruiters: 0, admins: 0, active: 0, deactivated: 0 },
    jobs: { total: 0, published: 0, draft: 0, closed: 0 },
    applications: { total: 0 },
    aiProvider: { provider: 'Loading...', status: 'Checking...', isFallback: false }
  });

  // User List & Pagination
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Activity Audit Log
  const [activityLogs, setActivityLogs] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    status: 'active'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: null, // 'delete' | 'deactivate' | 'activate'
    targetUser: null,
    onConfirm: null
  });

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Load Dashboard Aggregate Statistics
  const loadDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await adminService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('[Admin] Error fetching dashboard stats:', err);
      setStatsError(err.response?.data?.message || 'Failed to load system statistics.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Database Users with Search and Filtering
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (roleFilter !== 'All') params.role = roleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await adminService.getUsers(params);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        generateAuditLogs(res.data);
      }
    } catch (err) {
      console.error('[Admin] Error fetching users:', err);
      setUsersError(err.response?.data?.message || 'Failed to connect to database API.');
    } finally {
      setUsersLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  // Generate audit logs from current DB state
  const generateAuditLogs = (userList) => {
    const logs = [];
    userList.slice(0, 5).forEach((u, i) => {
      const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently';
      logs.push({
        id: `act_${u._id || i}`,
        time: createdDate,
        user: u.name,
        action: `System user registered with role "${(u.role || 'candidate').toUpperCase()}" [Status: ${u.activated !== false ? 'Active' : 'Deactivated'}]`
      });
    });
    setActivityLogs(logs);
  };

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Refresh all data
  const handleRefreshAll = () => {
    loadDashboardStats();
    loadUsers();
    showToast('Admin data synchronized with MongoDB source of truth.', 'success');
  };

  // User Create / Edit Handlers
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'candidate', status: 'active' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'candidate',
      status: user.activated !== false ? 'active' : 'deactivated'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email) {
      setFormError('Name and Email are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          activated: formData.status === 'active'
        };

        const res = await adminService.updateUser(editingUser._id || editingUser.id, updatePayload);
        if (res.success) {
          showToast(`User "${formData.name}" successfully updated in MongoDB.`);
          setIsModalOpen(false);
          loadUsers();
          loadDashboardStats();
        }
      } else {
        // Create user
        const createPayload = {
          name: formData.name,
          email: formData.email,
          password: formData.password || 'Password123',
          role: formData.role,
          activated: formData.status === 'active'
        };

        const res = await adminService.createUser(createPayload);
        if (res.success) {
          showToast(`New user "${formData.name}" created and saved to MongoDB.`);
          setIsModalOpen(false);
          loadUsers();
          loadDashboardStats();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save user record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Self-Protection check helper
  const isSelfUser = (targetUser) => {
    if (!currentUser || !targetUser) return false;
    return (
      (targetUser._id && currentUser._id && targetUser._id.toString() === currentUser._id.toString()) ||
      (targetUser.id && currentUser.id && targetUser.id === currentUser.id) ||
      (targetUser.email && currentUser.email && targetUser.email.toLowerCase() === currentUser.email.toLowerCase())
    );
  };

  // Toggle Status Handler
  const handleToggleStatusClick = (user) => {
    if (isSelfUser(user)) {
      showToast('Self-Protection Alert: You cannot deactivate your own logged-in admin account.', 'error');
      return;
    }

    const isDeactivated = user.activated === false;
    const actionName = isDeactivated ? 'Activate' : 'Deactivate';

    setConfirmModal({
      isOpen: true,
      title: `${actionName} User Account`,
      message: `Are you sure you want to ${actionName.toLowerCase()} account for "${user.name}" (${user.email})?`,
      actionType: isDeactivated ? 'activate' : 'deactivate',
      targetUser: user,
      onConfirm: async () => {
        try {
          const res = await adminService.updateUserActivation(user._id || user.id, isDeactivated);
          if (res.success) {
            showToast(`User status updated to ${isDeactivated ? 'ACTIVE' : 'DEACTIVATED'}.`);
            loadUsers();
            loadDashboardStats();
          }
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to update activation status.', 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Delete User Handler
  const handleDeleteUserClick = (user) => {
    if (isSelfUser(user)) {
      showToast('Self-Protection Alert: You cannot delete your own logged-in admin account.', 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete User Record',
      message: `Are you sure you want to PERMANENTLY DELETE user "${user.name}" (${user.email}) from MongoDB? This action cannot be undone.`,
      actionType: 'delete',
      targetUser: user,
      onConfirm: async () => {
        try {
          const res = await adminService.deleteUser(user._id || user.id);
          if (res.success) {
            showToast(`User "${user.name}" deleted from database.`);
            loadUsers();
            loadDashboardStats();
          }
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete user record.', 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Role Change Handler
  const handleRoleChangeSelect = async (user, newRole) => {
    if (isSelfUser(user) && newRole !== 'admin') {
      showToast('Self-Protection Alert: You cannot remove your own admin privileges.', 'error');
      return;
    }

    try {
      const res = await adminService.updateUserRole(user._id || user.id, newRole);
      if (res.success) {
        showToast(`Role for "${user.name}" changed to "${newRole.toUpperCase()}".`);
        loadUsers();
        loadDashboardStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role.', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-md transition-all animate-fade-in ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold font-outfit">
            {toastMsg.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              toastMsg.type === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            MongoDB Sync
          </span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  System Administration & Control Desk
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> MongoDB Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time MongoDB database administration, user management suite, AI provider verification, and system security.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            title="Sync with MongoDB"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${usersLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-primary px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Create New User
          </button>
        </div>
      </div>

      {/* AI PROVIDER STATUS CARD */}
      <div className="saas-card p-4 md:p-5 border border-slate-200/90 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>DB Status: <strong className="text-white">Connected (MongoDB)</strong></span>
          </div>
        </div>
      </div>

      {/* 5 CORE DASHBOARD OPERATIONAL METRIC CARDS */}
      {statsError ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{statsError}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Users */}
          <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Total Users</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl font-black font-outfit text-slate-950 block">
              {statsLoading ? '...' : stats.users?.total || 0}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">MongoDB Accounts</span>
          </div>

          {/* Candidates */}
          <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm hover:border-emerald-200 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Candidates</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black font-outfit text-emerald-600 block">
              {statsLoading ? '...' : stats.users?.candidates || 0}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium block">Candidate Profiles</span>
          </div>

          {/* Recruiters */}
          <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm hover:border-purple-200 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Recruiters</span>
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-black font-outfit text-purple-600 block">
              {statsLoading ? '...' : stats.users?.recruiters || 0}
            </span>
            <span className="text-[10px] text-purple-700 font-medium block">HR Accounts</span>
          </div>

          {/* Active Jobs */}
          <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm hover:border-cyan-200 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Active Jobs</span>
              <Layers className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-2xl font-black font-outfit text-cyan-600 block">
              {statsLoading ? '...' : stats.jobs?.published || 0}
            </span>
            <span className="text-[10px] text-cyan-700 font-medium block">
              Published Requisitions ({stats.jobs?.total || 0} Total)
            </span>
          </div>

          {/* Applications */}
          <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm hover:border-amber-200 transition-colors">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Applications</span>
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-black font-outfit text-amber-600 block">
              {statsLoading ? '...' : stats.applications?.total || 0}
            </span>
            <span className="text-[10px] text-amber-700 font-medium block">Total Pipeline Records</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID: USER MANAGEMENT (LEFT 2 COLS) vs SYSTEM AUDIT STREAM (RIGHT 1 COL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: USER MANAGEMENT SUITE & FILTERS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold font-outfit text-slate-950">
                  User Management Suite (MongoDB)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Create, update, change role, activate/deactivate, or delete real database user records.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                {usersLoading ? 'Loading...' : `Showing ${users.length} Users`}
              </span>
            </div>

            {/* FILTERS TOOLBAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative sm:col-span-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-saas pl-10 w-full text-xs bg-white"
                />
              </div>

              {/* 1. Role Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Role Filter
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-saas text-xs bg-slate-50 font-semibold text-slate-800 cursor-pointer w-full"
                >
                  <option value="All">All Roles</option>
                  <option value="candidate">Candidate</option>
                  <option value="hr">HR / Recruiter</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              {/* 2. Status Filter */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-saas text-xs bg-slate-50 font-semibold text-slate-800 cursor-pointer w-full"
                >
                  <option value="All">All Account Statuses</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            {/* USER MANAGEMENT TABLE */}
            {usersError ? (
              <div className="p-6 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium space-y-2">
                <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
                <p>{usersError}</p>
                <button
                  onClick={loadUsers}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
                >
                  Retry API Connection
                </button>
              </div>
            ) : usersLoading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70">
                      <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">User Profile</th>
                      <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">System Role</th>
                      <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">Reg. Date</th>
                      <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((user) => {
                      const isDeactivated = user.activated === false;
                      const isSelf = isSelfUser(user);

                      return (
                        <tr key={user._id || user.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-outfit">
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-950 font-outfit">{user.name}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-800 uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium block">{user.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <select
                              value={user.role || 'candidate'}
                              onChange={(e) => handleRoleChangeSelect(user, e.target.value)}
                              disabled={isSelf}
                              className="text-xs font-bold py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="candidate">Candidate</option>
                              <option value="hr">HR Recruiter</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-3">
                            {isDeactivated ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                Deactivated
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit User Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleStatusClick(user)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelf
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : isDeactivated
                                    ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                    : 'text-amber-600 hover:bg-amber-50 cursor-pointer'
                                }`}
                                title={isSelf ? 'Cannot deactivate self' : isDeactivated ? 'Activate Account' : 'Deactivate Account'}
                              >
                                {isDeactivated ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteUserClick(user)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelf ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                                }`}
                                title={isSelf ? 'Cannot delete self' : 'Delete Account'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 text-xs font-medium">
                          No users found matching current filter options.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM AUDIT LOG STREAM */}
        <div className="space-y-4">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-outfit text-slate-950 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Database Activity Stream
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">MongoDB Sync</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span className="text-indigo-600">{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{log.action}</p>
                </div>
              ))}

              {activityLogs.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No recent audit activity recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 md:p-8 bg-white border border-slate-200/90 max-w-md w-full rounded-2xl shadow-xl space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold font-outfit text-slate-950">
                {editingUser ? 'Edit User Record' : 'Create New System User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Password (Default: Password123)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-saas w-full bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="hr">HR Recruiter</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmModal.actionType === 'delete'
                    ? 'bg-rose-100 text-rose-600'
                    : confirmModal.actionType === 'deactivate'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold font-outfit text-slate-950">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">{confirmModal.message}</p>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="btn-secondary text-xs px-3.5 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`text-xs px-4 py-1.5 rounded-xl font-bold text-white shadow-xs ${
                  confirmModal.actionType === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmModal.actionType === 'deactivate'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {confirmModal.actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
