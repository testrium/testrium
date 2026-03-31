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
  getByModule: (moduleId) => api.get('/test-cases', { params: { moduleId } }),
  getByFilters: (filters) => api.get('/test-cases', { params: filters }),
  create: (data) => api.post('/test-cases', data),
  update: (id, data) => api.put(`/test-cases/${id}`, data),
  delete: (id) => api.delete(`/test-cases/${id}`),
  getTagsByProject: (projectId) => api.get('/test-cases/tags', { params: { projectId } }),
  bulkImport: (formData) => {
    return axios.post(`${API_BASE_URL}/test-cases/bulk/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
};

// Test Modules API
export const testModulesAPI = {
  getAll: () => api.get('/test-modules'),
  getById: (id) => api.get(`/test-modules/${id}`),
  getByProject: (projectId) => api.get('/test-modules', { params: { projectId } }),
  create: (data) => api.post('/test-modules', data),
  update: (id, data) => api.put(`/test-modules/${id}`, data),
  delete: (id) => api.delete(`/test-modules/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
};

// Project Members API
export const projectMembersAPI = {
  getProjectMembers: (projectId) => api.get(`/project-members/project/${projectId}`),
  getUserProjects: (userId) => api.get(`/project-members/user/${userId}`),
  getAvailableUsers: (projectId) => api.get(`/project-members/project/${projectId}/available-users`),
  addMembers: (projectId, data) => api.post(`/project-members/project/${projectId}`, data),
  removeMember: (memberId) => api.delete(`/project-members/${memberId}`),
  updateMemberRole: (memberId, role) => api.put(`/project-members/${memberId}/role`, { role }),
};

// Applications API
export const applicationsAPI = {
  getByProject: (projectId) => api.get('/applications', { params: { projectId } }),
};

// Metrics API
export const metricsAPI = {
  getModuleMetrics: (moduleId) => api.get(`/metrics/module/${moduleId}`),
  getApplicationMetrics: (applicationId) => api.get(`/metrics/application/${applicationId}`),
  getProjectMetrics: (projectId) => api.get(`/metrics/project/${projectId}`),
  getAllApplicationMetricsForProject: (projectId) => api.get(`/metrics/project/${projectId}/applications`),
  getAllModuleMetricsForApplication: (applicationId) => api.get(`/metrics/application/${applicationId}/modules`),
};

// Automation Comments API
export const automationCommentsAPI = {
  addComment: (data, userId) => api.post('/automation-comments', data, { params: { userId } }),
  getCurrentComment: (testCaseId) => api.get(`/automation-comments/current/${testCaseId}`),
  getCommentHistory: (testCaseId) => api.get(`/automation-comments/history/${testCaseId}`),
  deleteComment: (commentId) => api.delete(`/automation-comments/${commentId}`),
};

export default api;
