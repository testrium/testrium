import api from './axios';

export const reportsAPI = {
  getOverallStats: () => api.get('/reports/overall'),
  getProjectStats: (projectId) => api.get(`/reports/project/${projectId}`),
  getTestRunReport: (testRunId) => api.get(`/reports/test-run/${testRunId}`),
  getTrendAnalysis: (projectId, limit = 10) => api.get(`/reports/trend/${projectId}`, { params: { limit } }),
  createTemplate: (templateData) => api.post('/reports/templates', templateData),
  getUserTemplates: () => api.get('/reports/templates'),
  getTemplateById: (templateId) => api.get(`/reports/templates/${templateId}`),
  deleteTemplate: (templateId) => api.delete(`/reports/templates/${templateId}`)
};
