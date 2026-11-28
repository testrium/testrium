// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

import api from '../api/axios';

export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  getActive: () => api.get('/applications/active'),
  getByProject: (projectId) => api.get(`/applications/project/${projectId}`),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`)
};
