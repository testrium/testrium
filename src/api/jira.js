import api from './axios';

export const jiraAPI = {
  // Configuration
  saveConfiguration: (configData) => api.post('/jira/config', configData),
  getConfigByProject: (projectId) => api.get(`/jira/config/project/${projectId}`),
  deleteConfiguration: (configId) => api.delete(`/jira/config/${configId}`),

  // Issue Creation
  createIssue: (issueData, projectId) => api.post('/jira/issue', issueData, { params: { projectId } })
};
