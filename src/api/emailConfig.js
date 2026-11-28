// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

import api from './axios';

export const emailConfigAPI = {
  getConfig: (projectId) => api.get(`/projects/${projectId}/email-config`),
  saveConfig: (projectId, data) => api.put(`/projects/${projectId}/email-config`, data),
  testEmail: (projectId, email) => api.post(`/projects/${projectId}/email-config/test`, { email }),
};
