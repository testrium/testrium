import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Search, Filter, Play, CheckCircle2, Clock, XCircle, Calendar, User, Trash2, AlertCircle, ChevronLeft, ChevronRight, Eye, Copy, Pencil
} from 'lucide-react';
import { testRunsAPI } from '../services/testRuns';
import { projectsAPI, testModulesAPI, testCasesAPI, projectMembersAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter
} from '../components/ui/Modal';

export default function TestRuns() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [testRuns, setTestRuns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    projectId: '',
    status: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cloneModal, setCloneModal] = useState({ open: false, id: null, name: '' });
  const [editModal, setEditModal] = useState({ open: false, run: null, name: '', description: '', assignedToUserId: '' });
  const [newTestRun, setNewTestRun] = useState({
    name: '',
    description: '',
    projectId: '',
    moduleId: '',
    assignedToUserId: '',
    testCaseIds: []
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reload data whenever this component mounts or location changes
  useEffect(() => {
    loadData();
    loadAllUsers();
  }, [location]);

  useEffect(() => {
    if (projects.length > 0 || user?.role === 'ADMIN') {
      loadTestRuns();
    }
  }, [filters.projectId, filters.status, projects]);

  useEffect(() => {
    if (newTestRun.projectId) {
      loadModulesForProject(newTestRun.projectId);
      loadTestCasesForProject(newTestRun.projectId);
    }
  }, [newTestRun.projectId]);

  useEffect(() => {
    if (newTestRun.moduleId) {
      loadTestCasesForModule(newTestRun.moduleId);
    } else if (newTestRun.projectId) {
      loadTestCasesForProject(newTestRun.projectId);
    }
  }, [newTestRun.moduleId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load projects based on user role
      let userProjects = [];
      if (user?.role === 'ADMIN') {
        const projectsRes = await projectsAPI.getAll();
        userProjects = projectsRes.data;
      } else if (user?.id) {
        // Get projects user is member of
        const membershipResponse = await projectMembersAPI.getUserProjects(user.id);
        const memberships = membershipResponse.data;

        // Get unique project IDs
        const projectIds = [...new Set(memberships.map(m => m.projectId))];

        // Fetch all projects and filter to only those user is member of
        const allProjectsResponse = await projectsAPI.getAll();
        userProjects = allProjectsResponse.data.filter(p => projectIds.includes(p.id));
      }

      setProjects(userProjects);
      setError('');
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTestRuns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.projectId) params.projectId = filters.projectId;

      const response = await testRunsAPI.getAll(params);
      let testRunsList = response.data;

      // Filter by accessible projects
      if (!filters.projectId && user?.role !== 'ADMIN') {
        const userProjectIds = projects.map(p => p.id);
        testRunsList = testRunsList.filter(tr => userProjectIds.includes(tr.projectId));
      }

      // Filter by status
      if (filters.status) {
        testRunsList = testRunsList.filter(tr => tr.status === filters.status);
      }

      setTestRuns(testRunsList);
      setError('');
    } catch (err) {
      console.error('Load test runs error:', err);
      setError('Failed to load test runs');
      setTestRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModulesForProject = async (projectId) => {
    try {
      const response = await testModulesAPI.getByProject(projectId);
      setModules(response.data);
    } catch (err) {
      console.error('Load suites error:', err);
    }
  };

  const loadTestCasesForProject = async (projectId) => {
    try {
      const response = await testCasesAPI.getAll({ projectId });
      setTestCases(response.data);
    } catch (err) {
      console.error('Load test cases error:', err);
    }
  };

  const loadTestCasesForModule = async (moduleId) => {
    try {
      const response = await testCasesAPI.getAll({ moduleId });
      setTestCases(response.data);
    } catch (err) {
      console.error('Load test cases error:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error('Load users error:', err);
    }
  };

  const handleCreateTestRun = async () => {
    try {
      if (!newTestRun.name || !newTestRun.projectId || newTestRun.testCaseIds.length === 0) {
        setError('Please fill in all required fields and select at least one test case');
        return;
      }

      await testRunsAPI.create(newTestRun);
      setShowCreateModal(false);
      setNewTestRun({
        name: '',
        description: '',
        projectId: '',
        moduleId: '',
        assignedToUserId: '',
        testCaseIds: []
      });
      loadTestRuns();
      setError('');
    } catch (err) {
      console.error('Create test run error:', err);
      setError(err.response?.data?.message || 'Failed to create test run');
    }
  };

  const openCloneModal = (testRun) => {
    setCloneModal({ open: true, id: testRun.id, name: testRun.name });
  };

  const handleCloneConfirm = async () => {
    try {
      await testRunsAPI.clone(cloneModal.id, cloneModal.name);
      setCloneModal({ open: false, id: null, name: '' });
      loadTestRuns();
    } catch (err) {
      console.error('Clone test run error:', err);
      setError(err.response?.data?.message || 'Failed to clone test run');
    }
  };

  const openEditModal = (testRun) => {
    setEditModal({
      open: true,
      run: testRun,
      name: testRun.name,
      description: testRun.description || '',
      assignedToUserId: testRun.assignedToUserId ? String(testRun.assignedToUserId) : ''
    });
  };

  const handleEditSave = async () => {
    try {
      await testRunsAPI.update(editModal.run.id, {
        name: editModal.name,
        description: editModal.description,
        assignedToUserId: editModal.assignedToUserId || null
      });
      setEditModal({ open: false, run: null, name: '', description: '', assignedToUserId: '' });
      loadTestRuns();
    } catch (err) {
      console.error('Edit test run error:', err);
      setError(err.response?.data?.message || 'Failed to update test run');
    }
  };

  const handleDeleteTestRun = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test run? All execution data will be lost.')) {
      return;
    }

    try {
      await testRunsAPI.delete(id);
      loadTestRuns();
    } catch (err) {
      console.error('Delete test run error:', err);
      setError('Failed to delete test run');
    }
  };

  const handleTestCaseSelection = (testCaseId) => {
    setNewTestRun(prev => {
      const isSelected = prev.testCaseIds.includes(testCaseId);
      return {
        ...prev,
        testCaseIds: isSelected
          ? prev.testCaseIds.filter(id => id !== testCaseId)
          : [...prev.testCaseIds, testCaseId]
      };
    });
  };

  const handleSelectAllTestCases = () => {
    if (newTestRun.testCaseIds.length === testCases.length) {
      setNewTestRun(prev => ({ ...prev, testCaseIds: [] }));
    } else {
      setNewTestRun(prev => ({ ...prev, testCaseIds: testCases.map(tc => tc.id) }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'NOT_STARTED':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'NOT_STARTED': 'bg-gray-100 text-gray-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const calculateProgress = (testRun) => {
    const total = testRun.totalTestCases || 0;
    if (total === 0) return 0;
    const executed = total - (testRun.notExecutedCount || 0);
    return Math.round((executed / total) * 100);
  };

  const filteredTestRuns = testRuns.filter(testRun =>
    testRun.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testRun.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredTestRuns.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredTestRuns.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.projectId, filters.status]);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Play className="mr-3 h-8 w-8" />
                Test Runs
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Execute and track test case results
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Test Run
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Search and Filters Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Search Field */}
              <div className="lg:col-span-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search test runs by name or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Project Filter */}
              <div className="lg:col-span-3">
                <Select
                  value={filters.projectId}
                  onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                  className="w-full"
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-3">
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full"
                >
                  <option value="">All Status</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Test Runs Table */}
          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading test runs...</p>
            </div>
          ) : filteredTestRuns.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No test runs found. Create your first test run.</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Test Run
              </Button>
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
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Results
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map(testRun => (
                      <tr
                        key={testRun.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/test-runs/${testRun.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{testRun.name}</div>
                          {testRun.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {testRun.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{testRun.projectName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(testRun.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${calculateProgress(testRun)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{calculateProgress(testRun)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-4 text-xs">
                            <div className="text-center">
                              <div className="text-green-600 dark:text-green-400 font-semibold">{testRun.passedCount || 0}</div>
                              <div className="text-gray-500 dark:text-gray-400">Pass</div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-600 dark:text-red-400 font-semibold">{testRun.failedCount || 0}</div>
                              <div className="text-gray-500 dark:text-gray-400">Fail</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600 dark:text-gray-300 font-semibold">{testRun.totalTestCases || 0}</div>
                              <div className="text-gray-500 dark:text-gray-400">Total</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {testRun.assignedToUsername || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {testRun.startDate ? new Date(testRun.startDate).toLocaleDateString() : 'Not started'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/test-runs/${testRun.id}`);
                              }}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(testRun);
                              }}
                              className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                              title="Edit Test Run"
                            >
                              <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCloneModal(testRun);
                              }}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Clone Test Run"
                            >
                              <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTestRun(testRun.id);
                              }}
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
                    Showing {filteredTestRuns.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredTestRuns.length)} of {filteredTestRuns.length} results
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
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => {
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

          {/* Clone Modal */}
          <Modal
            isOpen={cloneModal.open}
            onClose={() => setCloneModal({ open: false, id: null, name: '' })}
            className="max-w-md"
          >
            <ModalHeader onClose={() => setCloneModal({ open: false, id: null, name: '' })}>
              <div>
                <ModalTitle>Clone Test Run</ModalTitle>
                <ModalDescription>Enter a name for the cloned test run</ModalDescription>
              </div>
            </ModalHeader>
            <ModalContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={cloneModal.name}
                  onChange={(e) => setCloneModal(prev => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCloneConfirm()}
                  autoFocus
                />
              </div>
            </ModalContent>
            <ModalFooter>
              <Button variant="outline" onClick={() => setCloneModal({ open: false, id: null, name: '' })}>
                Cancel
              </Button>
              <Button
                onClick={handleCloneConfirm}
                disabled={!cloneModal.name.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone
              </Button>
            </ModalFooter>
          </Modal>

          {/* Edit Modal */}
          <Modal
            isOpen={editModal.open}
            onClose={() => setEditModal({ open: false, run: null, name: '', description: '', assignedToUserId: '' })}
            className="max-w-lg"
          >
            <ModalHeader onClose={() => setEditModal({ open: false, run: null, name: '', description: '', assignedToUserId: '' })}>
              <div>
                <ModalTitle>Edit Test Run</ModalTitle>
                <ModalDescription>Update name, description, or assignee</ModalDescription>
              </div>
            </ModalHeader>
            <ModalContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editModal.name}
                    onChange={(e) => setEditModal(prev => ({ ...prev, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <Textarea
                    value={editModal.description}
                    onChange={(e) => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                  <Select
                    value={editModal.assignedToUserId}
                    onChange={(e) => setEditModal(prev => ({ ...prev, assignedToUserId: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button variant="outline" onClick={() => setEditModal({ open: false, run: null, name: '', description: '', assignedToUserId: '' })}>
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={!editModal.name.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </Modal>

          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setNewTestRun({
                name: '',
                description: '',
                projectId: '',
                moduleId: '',
                assignedToUserId: '',
                testCaseIds: []
              });
              setError('');
            }}
            className="max-w-2xl"
          >
            <ModalHeader onClose={() => setShowCreateModal(false)}>
              <div>
                <ModalTitle>Create Test Run</ModalTitle>
                <ModalDescription>
                  Select test cases to execute and track their results
                </ModalDescription>
              </div>
            </ModalHeader>

            <ModalContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newTestRun.name}
                    onChange={(e) => setNewTestRun({ ...newTestRun, name: e.target.value })}
                    placeholder="e.g., Sprint 1 Regression"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <Textarea
                    value={newTestRun.description}
                    onChange={(e) => setNewTestRun({ ...newTestRun, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the test run..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newTestRun.projectId}
                    onChange={(e) => setNewTestRun({ ...newTestRun, projectId: e.target.value, moduleId: '', testCaseIds: [] })}
                  >
                    <option value="">Select project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Module (Optional)</label>
                  <Select
                    value={newTestRun.moduleId}
                    onChange={(e) => setNewTestRun({ ...newTestRun, moduleId: e.target.value, testCaseIds: [] })}
                    disabled={!newTestRun.projectId}
                  >
                    <option value="">All test cases in project</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To (Optional)</label>
                  <Select
                    value={newTestRun.assignedToUserId}
                    onChange={(e) => setNewTestRun({ ...newTestRun, assignedToUserId: e.target.value })}
                    disabled={!newTestRun.projectId}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </Select>
                </div>

                {newTestRun.projectId && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Test Cases <span className="text-red-500">*</span>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAllTestCases}
                      >
                        {newTestRun.testCaseIds.length === testCases.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                      {testCases.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No test cases available</div>
                      ) : (
                        testCases.map(testCase => (
                          <label
                            key={testCase.id}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={newTestRun.testCaseIds.includes(testCase.id)}
                              onChange={() => handleTestCaseSelection(testCase.id)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{testCase.title}</div>
                              {testCase.suiteName && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{testCase.suiteName}</div>
                              )}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {newTestRun.testCaseIds.length} test case(s) selected
                    </div>
                  </div>
                )}
              </div>
            </ModalContent>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTestRun({
                    name: '',
                    description: '',
                    projectId: '',
                    moduleId: '',
                    assignedToUserId: '',
                    testCaseIds: []
                  });
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTestRun}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Create Test Run
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
