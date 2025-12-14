import api from './axios';

export const testDataAPI = {
  create: (testData) => api.post('/test-data', testData),
  update: (id, testData) => api.put(`/test-data/${id}`, testData),
  getById: (id) => api.get(`/test-data/${id}`),
  getByProject: (projectId) => api.get(`/test-data/project/${projectId}`),
  getByProjectAndEnvironment: (projectId, environment) =>
    api.get(`/test-data/project/${projectId}/environment/${environment}`),
  delete: (id) => api.delete(`/test-data/${id}`)
};
