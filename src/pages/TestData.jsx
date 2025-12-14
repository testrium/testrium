import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { testDataAPI } from '../api/testData';

export default function TestData() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [testDataList, setTestDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [error, setError] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState('ALL');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    environment: 'DEV',
    dataType: 'KEY_VALUE',
    dataContent: '{}',
    projectId: projectId
  });

  const environments = ['DEV', 'QA', 'STAGING', 'PROD'];
  const dataTypes = ['KEY_VALUE', 'JSON', 'CSV'];

  useEffect(() => {
    if (projectId) {
      loadTestData();
    }
  }, [projectId, filterEnvironment]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      const response = filterEnvironment === 'ALL'
        ? await testDataAPI.getByProject(projectId)
        : await testDataAPI.getByProjectAndEnvironment(projectId, filterEnvironment);
      setTestDataList(response.data);
    } catch (err) {
      setError('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (data = null) => {
    if (data) {
      setEditingData(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        environment: data.environment,
        dataType: data.dataType,
        dataContent: data.dataContent,
        projectId: projectId
      });
    } else {
      setEditingData(null);
      setFormData({
        name: '',
        description: '',
        environment: 'DEV',
        dataType: 'KEY_VALUE',
        dataContent: '{}',
        projectId: projectId
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate JSON if dataType is JSON
      if (formData.dataType === 'JSON') {
        JSON.parse(formData.dataContent);
      }

      if (editingData) {
        await testDataAPI.update(editingData.id, formData);
      } else {
        await testDataAPI.create(formData);
      }
      handleCloseModal();
      loadTestData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test data');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test data?')) return;

    try {
      await testDataAPI.delete(id);
      loadTestData();
    } catch (err) {
      setError('Failed to delete test data');
    }
  };

  const getEnvironmentColor = (env) => {
    const colors = {
      DEV: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      QA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      STAGING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      PROD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[env] || 'bg-gray-100 text-gray-800';
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a project to manage test data</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Database className="mr-2" />
            Test Data Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage test data sets for your test cases
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Plus className="w-4 h-4 mr-2" />
          New Test Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Environment Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterEnvironment('ALL')}
          className={`px-4 py-2 rounded-lg ${filterEnvironment === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          All
        </button>
        {environments.map(env => (
          <button
            key={env}
            onClick={() => setFilterEnvironment(env)}
            className={`px-4 py-2 rounded-lg ${filterEnvironment === env ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            {env}
          </button>
        ))}
      </div>

      {/* Test Data List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : testDataList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No test data found. Create your first test data set.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testDataList.map(data => (
            <div key={data.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{data.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(data)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(data.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getEnvironmentColor(data.environment)}`}>
                  {data.environment}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {data.dataType}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created by {data.createdByName}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingData ? 'Edit Test Data' : 'New Test Data'}</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Environment *</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    {environments.map(env => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Type *</label>
                  <select
                    value={formData.dataType}
                    onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    {dataTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data Content * {formData.dataType === 'JSON' && '(Valid JSON)'}
                  </label>
                  <textarea
                    value={formData.dataContent}
                    onChange={(e) => setFormData({ ...formData, dataContent: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                    rows="8"
                    required
                  />
                  {formData.dataType === 'KEY_VALUE' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Example: {`{"username": "testuser", "password": "test123"}`}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
