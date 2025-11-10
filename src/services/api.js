import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// Projects API
export const projectsAPI = {
  getAll: (status) => api.get('/projects', { params: { status } }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Test Cases API
export const testCasesAPI = {
  getAll: (params) => api.get('/test-cases', { params }),
  getById: (id) => api.get(`/test-cases/${id}`),
  getByProject: (projectId) => api.get('/test-cases', { params: { projectId } }),
  getBySuite: (suiteId) => api.get('/test-cases', { params: { suiteId } }),
  getByFilters: (filters) => api.get('/test-cases', { params: filters }),
  create: (data) => api.post('/test-cases', data),
  update: (id, data) => api.put(`/test-cases/${id}`, data),
  delete: (id) => api.delete(`/test-cases/${id}`),
};

// Test Suites API
export const testSuitesAPI = {
  getAll: () => api.get('/test-suites'),
  getById: (id) => api.get(`/test-suites/${id}`),
  getByProject: (projectId) => api.get('/test-suites', { params: { projectId } }),
  create: (data) => api.post('/test-suites', data),
  update: (id, data) => api.put(`/test-suites/${id}`, data),
  delete: (id) => api.delete(`/test-suites/${id}`),
};

export default api;
