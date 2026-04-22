import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('civicx_token');
      localStorage.removeItem('civicx_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Complaints
export const complaintsAPI = {
  create: (data) => api.post('/complaints', data),
  getAll: (params) => api.get('/complaints', { params }),
  getOne: (id) => api.get(`/complaints/${id}`),
  vote: (id, type) => api.post(`/complaints/${id}/vote`, { type }),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  getAdminStats: () => api.get('/complaints/admin-stats')
};

// Rewards
export const rewardsAPI = {
  getHistory: () => api.get('/rewards/history'),
  getLeaderboard: () => api.get('/rewards/leaderboard'),
  redeem: (rewardType) => api.post('/rewards/redeem', { rewardType })
};

export default api;
