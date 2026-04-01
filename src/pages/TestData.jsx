import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, Plus, Edit, Trash2, X, Save, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { testDataAPI } from '../api/testData';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import usePageTitle from '../hooks/usePageTitle';

export default function TestData() {
  usePageTitle('Test Data');
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [testDataList, setTestDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [error, setError] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Filter test data based on search query
  const filteredTestData = testDataList.filter(data => {
    const matchesSearch = searchQuery === '' ||
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.description && data.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTestData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredTestData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterEnvironment]);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
        <Navigation />
        <div className="flex items-center justify-center h-64 flex-1">
          <p className="text-gray-500">Please select a project to manage test data</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Database className="mr-3 h-8 w-8" />
                Test Data Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Manage test data sets for your test cases
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Test Data
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Search and Filters Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            {/* Search Field */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Environment Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment:</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterEnvironment('ALL')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterEnvironment === 'ALL'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {environments.map(env => (
                  <button
                    key={env}
                    onClick={() => setFilterEnvironment(env)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterEnvironment === env
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Data Table */}
          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : testDataList.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No test data found. Create your first test data set.</p>
            </div>
          ) : filteredTestData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No test data matches your search criteria.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Environment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map(data => (
                      <tr key={data.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{data.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                            {data.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(data.environment)}`}>
                            {data.environment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {data.dataType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {data.createdByName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(data)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(data.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Pagination Info */}
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {filteredTestData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredTestData.length)} of {filteredTestData.length} results
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis between non-consecutive pages
                          const previousPage = array[index - 1];
                          const showEllipsis = previousPage && page - previousPage > 1;

                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && (
                                <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

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
