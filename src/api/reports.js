import api from './axios';

export const reportsAPI = {
  getOverallStats: () => api.get('/reports/overall'),
  getProjectStats: (projectId) => api.get(`/reports/project/${projectId}`)
};
