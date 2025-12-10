import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Search, Filter, Play, CheckCircle2, Clock, XCircle, Calendar, User, Trash2, AlertCircle
} from 'lucide-react';
import { testRunsAPI } from '../services/testRuns';
import { projectsAPI, testSuitesAPI, testCasesAPI, projectMembersAPI } from '../services/api';
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
  const [suites, setSuites] = useState([]);
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
  const [newTestRun, setNewTestRun] = useState({
    name: '',
    description: '',
    projectId: '',
    suiteId: '',
    assignedToUserId: '',
    testCaseIds: []
  });

  // Reload data whenever this component mounts or location changes
  useEffect(() => {
    loadData();
  }, [location]);

  useEffect(() => {
    if (projects.length > 0 || user?.role === 'ADMIN') {
      loadTestRuns();
    }
  }, [filters.projectId, filters.status, projects]);

  useEffect(() => {
    if (newTestRun.projectId) {
      loadSuitesForProject(newTestRun.projectId);
      loadTestCasesForProject(newTestRun.projectId);
      loadProjectMembers(newTestRun.projectId);
    }
  }, [newTestRun.projectId]);

  useEffect(() => {
    if (newTestRun.suiteId) {
      loadTestCasesForSuite(newTestRun.suiteId);
    } else if (newTestRun.projectId) {
      loadTestCasesForProject(newTestRun.projectId);
    }
  }, [newTestRun.suiteId]);

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

  const loadSuitesForProject = async (projectId) => {
    try {
      const response = await testSuitesAPI.getByProject(projectId);
      setSuites(response.data);
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

  const loadTestCasesForSuite = async (suiteId) => {
    try {
      const response = await testCasesAPI.getAll({ suiteId });
      setTestCases(response.data);
    } catch (err) {
      console.error('Load test cases error:', err);
    }
  };

  const loadProjectMembers = async (projectId) => {
    try {
      const response = await projectMembersAPI.getByProject(projectId);
      setUsers(response.data);
    } catch (err) {
      console.error('Load project members error:', err);
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
        suiteId: '',
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Runs</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Execute and track test case results</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search test runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.projectId}
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>

              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </Select>

              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Test Run
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading test runs...</p>
            </div>
          ) : filteredTestRuns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <CardTitle className="mt-4">No test runs found</CardTitle>
                <CardDescription className="mt-2">Get started by creating a new test run.</CardDescription>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Test Run
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTestRuns.map(testRun => (
                <Card
                  key={testRun.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/test-runs/${testRun.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{testRun.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testRun.projectName}</p>
                      </div>
                      {getStatusIcon(testRun.status)}
                    </div>

                    {testRun.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{testRun.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {testRun.startDate ? new Date(testRun.startDate).toLocaleDateString() : 'Not started'}
                      </div>
                      {testRun.assignedToUsername && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4 mr-2" />
                          {testRun.assignedToUsername}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{calculateProgress(testRun)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${calculateProgress(testRun)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                      <div>
                        <div className="text-green-600 dark:text-green-400 font-semibold">{testRun.passedCount || 0}</div>
                        <div className="text-gray-500 dark:text-gray-400">Passed</div>
                      </div>
                      <div>
                        <div className="text-red-600 dark:text-red-400 font-semibold">{testRun.failedCount || 0}</div>
                        <div className="text-gray-500 dark:text-gray-400">Failed</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-300 font-semibold">{testRun.totalTestCases || 0}</div>
                        <div className="text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      {getStatusBadge(testRun.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTestRun(testRun.id);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setNewTestRun({
                name: '',
                description: '',
                projectId: '',
                suiteId: '',
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
                    onChange={(e) => setNewTestRun({ ...newTestRun, projectId: e.target.value, suiteId: '', testCaseIds: [] })}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Suite (Optional)</label>
                  <Select
                    value={newTestRun.suiteId}
                    onChange={(e) => setNewTestRun({ ...newTestRun, suiteId: e.target.value, testCaseIds: [] })}
                    disabled={!newTestRun.projectId}
                  >
                    <option value="">All test cases in project</option>
                    {suites.map(suite => (
                      <option key={suite.id} value={suite.id}>
                        {suite.name}
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
                    {users.map(member => (
                      <option key={member.userId} value={member.userId}>
                        {member.username}
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
                    suiteId: '',
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
