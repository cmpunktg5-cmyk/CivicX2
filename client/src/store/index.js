import { create } from 'zustand';

// ============ PRODUCTION MODE — Real backend required ============
const DEMO_MODE = false;

// ============ STORES ============

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('civicx_user') || 'null'),
  token: localStorage.getItem('civicx_token') || null,
  isAuthenticated: !!localStorage.getItem('civicx_token'),
  loading: false,
  theme: localStorage.getItem('civicx_theme') || 'dark',

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('civicx_theme', newTheme);
    return { theme: newTheme };
  }),

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).authAPI.login(credentials);
      localStorage.setItem('civicx_token', data.token);
      localStorage.setItem('civicx_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).authAPI.register(userData);
      localStorage.setItem('civicx_token', data.token);
      localStorage.setItem('civicx_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('civicx_token');
    localStorage.removeItem('civicx_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    try {
      const { data } = await (await import('../services/api')).authAPI.getMe();
      localStorage.setItem('civicx_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch { /* ignore */ }
  },

  updateUser: (updates) => {
    set((state) => {
      const u = { ...state.user, ...updates };
      localStorage.setItem('civicx_user', JSON.stringify(u));
      return { user: u };
    });
  }
}));

// Complaints Store
export const useComplaintsStore = create((set, get) => ({
  complaints: [],
  myComplaints: [],
  currentComplaint: null,
  stats: null,
  loading: false,

  fetchComplaints: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).complaintsAPI.getAll(params);
      set({ complaints: data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchStats: async () => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).complaintsAPI.getAdminStats();
      set({ stats: data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchMyComplaints: async () => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).complaintsAPI.getAll({ userOnly: true });
      set({ myComplaints: data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchComplaint: async (id) => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).complaintsAPI.getOne(id);
      set({ currentComplaint: data.complaint, loading: false });
      return data;
    } catch { set({ loading: false }); }
  },

  createComplaint: async (complaintData) => {
    try {
      const { data } = await (await import('../services/api')).complaintsAPI.create(complaintData);
      // Refresh user to sync points/badges immediately
      await useAuthStore.getState().refreshUser();
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to submit' };
    }
  },

  vote: async (id, type) => {
    try {
      const { data } = await (await import('../services/api')).complaintsAPI.vote(id, type);
      return data;
    } catch (error) {
      console.error("Vote error:", error);
    }
  }
}));

// Rewards Store
export const useRewardsStore = create((set, get) => ({
  transactions: [],
  redemptions: [],
  leaderboard: [],
  loading: false,

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).rewardsAPI.getHistory();
      set({ transactions: data.transactions, redemptions: data.redemptions, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchLeaderboard: async () => {
    try {
      const { data } = await (await import('../services/api')).rewardsAPI.getLeaderboard();
      set({ leaderboard: data });
    } catch { /* ignore */ }
  },

  redeem: async (rewardType) => {
    set({ loading: true });
    try {
      const { data } = await (await import('../services/api')).rewardsAPI.redeem(rewardType);
      const { user, updateUser } = useAuthStore.getState();
      updateUser({ points: data.newBalance });
      get().fetchHistory();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));
