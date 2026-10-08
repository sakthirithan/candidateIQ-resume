import api from '../api';

export const adminService = {
  // Get aggregated admin dashboard metrics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get users list with optional search, role filter, status filter, page, limit
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user details by ID
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Create user
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Update user fields
  updateUser: async (userId, userData) => {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Update user activation status (true/false)
  updateUserActivation: async (userId, activated) => {
    const response = await api.patch(`/admin/users/${userId}/activation`, { activated });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get all jobs for audit
  getJobs: async () => {
    const response = await api.get('/admin/jobs');
    return response.data;
  },

  // Get all applications for audit
  getApplications: async () => {
    const response = await api.get('/admin/applications');
    return response.data;
  },

  // Get AI Provider status
  getAIStatus: async () => {
    const response = await api.get('/admin/ai-status');
    return response.data;
  }
};

export default adminService;
