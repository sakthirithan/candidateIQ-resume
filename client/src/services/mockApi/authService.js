import { mockUsers } from '../../data/mockUsers';

let usersState = [...mockUsers];

export const mockAuthService = {
  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 200));
    const user = usersState.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return { token: `mock_jwt_token_${user.id}`, user };
    }
    // Return fallback guest
    const newUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      headline: 'CandidateIQ Member'
    };
    usersState.push(newUser);
    return { token: `mock_jwt_token_${newUser.id}`, user: newUser };
  },

  register: async ({ name, email, password, role }) => {
    await new Promise((r) => setTimeout(r, 200));
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: role || 'candidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      headline: role === 'recruiter' ? 'Talent Acquisition Leader' : 'Full Stack Developer'
    };
    usersState.push(newUser);
    return { token: `mock_jwt_token_${newUser.id}`, user: newUser };
  },

  getCurrentUser: () => {
    return usersState[0];
  }
};
