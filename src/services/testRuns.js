import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const testRunsAPI = {
  getAll: (params = {}) => {
    return axios.get(`${API_BASE_URL}/test-runs`, {
      headers: getAuthHeader(),
      params
    });
  },

  getById: (id) => {
    return axios.get(`${API_BASE_URL}/test-runs/${id}`, {
      headers: getAuthHeader()
    });
  },

  create: (testRunData) => {
    return axios.post(`${API_BASE_URL}/test-runs`, testRunData, {
      headers: getAuthHeader()
    });
  },

  updateStatus: (id, status) => {
    return axios.patch(`${API_BASE_URL}/test-runs/${id}/status`,
      { status },
      { headers: getAuthHeader() }
    );
  },

  delete: (id) => {
    return axios.delete(`${API_BASE_URL}/test-runs/${id}`, {
      headers: getAuthHeader()
    });
  }
};
