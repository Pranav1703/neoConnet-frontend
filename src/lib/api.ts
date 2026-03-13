import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: { email: string; password: string; name: string; role?: string; department: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const casesApi = {
  create: (data: FormData) => api.post('/cases', data),
  getAll: (params?: { status?: string; department?: string; category?: string }) =>
    api.get('/cases', { params }),
  getAllAdmin: (params?: { status?: string; department?: string; category?: string }) =>
    api.get('/cases/all', { params }),
  getById: (id: string) => api.get(`/cases/${id}`),
  update: (id: string, data: { status?: string; assignedTo?: string; notes?: string }) =>
    api.put(`/cases/${id}`, data),
};

export const pollsApi = {
  create: (data: { title: string; description: string; options: string[]; endsAt: string; allowMultiple?: boolean }) =>
    api.post('/polls', data),
  getAll: () => api.get('/polls'),
  getActive: () => api.get('/polls/active'),
  getById: (id: string) => api.get(`/polls/${id}`),
  vote: (id: string, data: { optionIndex: number }) => api.post(`/polls/${id}/vote`, data),
  delete: (id: string) => api.delete(`/polls/${id}`),
};

export const usersApi = {
  getAll: (params?: { role?: string; department?: string }) =>
    api.get('/users', { params }),
  getCaseManagers: () => api.get('/users/case-managers'),
  getDepartments: () => api.get('/users/departments'),
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getHotspots: () => api.get('/analytics/hotspots'),
  getDepartmentCases: (dept: string) => api.get(`/analytics/department/${dept}`),
  getTrends: () => api.get('/analytics/trends'),
};

export const digestsApi = {
  getAll: () => api.get('/digests'),
  getById: (id: string) => api.get(`/digests/${id}`),
  create: (data: { title: string; content: string; quarter: string; year: number }) =>
    api.post('/digests', data),
  delete: (id: string) => api.delete(`/digests/${id}`),
  getImpact: () => api.get('/digests/impact'),
  createImpact: (data: { title: string; description: string; changeSummary: string; quarter: string; year: number; casesResolved: number; satisfactionScore: number }) =>
    api.post('/digests/impact', data),
};

export const minutesApi = {
  getAll: (search?: string) => api.get('/minutes', { params: { search } }),
  create: (data: FormData) => api.post('/minutes', data),
  delete: (id: string) => api.delete(`/minutes/${id}`),
};