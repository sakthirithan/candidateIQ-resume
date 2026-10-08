import api from '../services/api';

const USERS_KEY = 'candidateiq_users';
const CURRENT_USER_KEY = 'candidateiq_current_user';
const SESSION_KEY = 'candidateiq_session';

// Predefined demo accounts
const DEFAULT_USERS = [
  {
    id: 'cand_demo_001',
    name: 'Alex Johnson',
    email: 'candidate.demo@candidateiq.com',
    password: 'password123',
    role: 'candidate',
    createdAt: '2026-01-01'
  },
  {
    id: 'rec_demo_001',
    name: 'Sarah Wilson',
    email: 'recruiter.demo@candidateiq.com',
    password: 'password123',
    role: 'hr',
    paymentStatus: 'paid',
    activated: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'admin_001',
    name: 'CandidateIQ System Admin',
    email: 'admin@candidateiq.com',
    password: 'Admin@123',
    role: 'admin',
    createdAt: '2025-01-01'
  }
];

export const initAuthStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
};

export const getUsers = () => {
  initAuthStorage();
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || DEFAULT_USERS;
  } catch (e) {
    return DEFAULT_USERS;
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!foundUser) {
    return { success: false, message: 'Invalid email or password.' };
  }

  if (foundUser.password !== password) {
    return { success: false, message: 'Invalid email or password.' };
  }

  // Create mock token for offline fallback
  const mockToken = `mock_jwt_token_${foundUser.id}_${Date.now()}`;
  localStorage.setItem('token', mockToken);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
  localStorage.setItem(SESSION_KEY, `session_${Date.now()}`);
  return { success: true, user: foundUser, token: mockToken };
};

export const loginUserApi = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.success) {
      const { token, user } = response.data;
      if (token) localStorage.setItem('token', token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(SESSION_KEY, `session_${Date.now()}`);
      return { success: true, user, token };
    }
    return { success: false, message: response.data?.message || 'Login failed.' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Invalid email or password.'
    };
  }
};

export const registerUserApi = async ({ name, email, password, role }) => {
  try {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.data && response.data.success) {
      const { token, user } = response.data;
      if (token) localStorage.setItem('token', token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(SESSION_KEY, `session_${Date.now()}`);
      return { success: true, user, token };
    }
    return { success: false, message: response.data?.message || 'Registration failed.' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Registration failed.'
    };
  }
};

export const restoreSession = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const res = await api.get('/auth/me');
    if (res.data && res.data.success && res.data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.data.user));
      return res.data.user;
    }
  } catch (e) {
    // Clear session if backend authentication check fails
    logoutUser();
    return null;
  }
  return getCurrentUser();
};

export const activateHrPayment = (userId) => {
  const users = getUsers();
  let updatedUser = null;

  const updatedUsers = users.map((u) => {
    if (u.id === userId || u._id === userId || u.email === userId) {
      updatedUser = { ...u, paymentStatus: 'paid', activated: true };
      return updatedUser;
    }
    return u;
  });

  if (updatedUser) {
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  } else {
    const currentUser = getCurrentUser();
    if (currentUser) {
      updatedUser = { ...currentUser, paymentStatus: 'paid', activated: true };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  }

  return updatedUser;
};

export const updateUser = (updatedFields) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getUsers();
  const updatedUser = { ...currentUser, ...updatedFields };

  const newUsers = users.map((u) => (u.id === currentUser.id || u._id === currentUser.id ? updatedUser : u));

  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

  return updatedUser;
};

export const forgotPasswordApi = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    if (response.data && response.data.success) {
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data?.message || 'Verification failed.' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Account not found with this email.'
    };
  }
};

export const resetPasswordApi = async (email, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    if (response.data && response.data.success) {
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data?.message || 'Password reset failed.' };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Password reset failed.'
    };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
};
