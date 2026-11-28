// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

import api from './axios';

export const webhookConfigAPI = {
  getConfig:  (projectId)         => api.get(`/projects/${projectId}/webhook-config`),
  saveConfig: (projectId, data)   => api.put(`/projects/${projectId}/webhook-config`, data),
  test:       (projectId, target) => api.post(`/projects/${projectId}/webhook-config/test`, { target }),
};
