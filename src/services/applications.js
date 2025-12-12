import api from '../api/axios';

export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  getActive: () => api.get('/applications/active'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`)
};
