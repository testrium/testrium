import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const testExecutionsAPI = {
  getByTestRun: (testRunId) => {
    return axios.get(`${API_BASE_URL}/test-executions`, {
      headers: getAuthHeader(),
      params: { testRunId }
    });
  },

  getById: (id) => {
    return axios.get(`${API_BASE_URL}/test-executions/${id}`, {
      headers: getAuthHeader()
    });
  },

  update: (id, executionData) => {
    return axios.put(`${API_BASE_URL}/test-executions/${id}`, executionData, {
      headers: getAuthHeader()
    });
  },

  bulkUpdate: (executionIds, updateRequest) => {
    return axios.put(`${API_BASE_URL}/test-executions/bulk-update`, {
      executionIds,
      updateRequest
    }, {
      headers: getAuthHeader()
    });
  }
};
