import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testCasesAPI, projectsAPI, applicationsAPI, testModulesAPI, projectMembersAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TestCaseForm from '../components/TestCaseForm';
import BulkImportModal from '../components/BulkImportModal';
import {
  Plus, Search, Filter, ChevronRight,
  Edit, Trash2, AlertCircle, CheckCircle2, Clock, XCircle, FileText, Layers, Upload, Tag
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

export default function TestCases() {
  usePageTitle('Test Cases');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    applicationId: '',
    moduleId: '',
    status: '',
    priority: '',
    search: '',
    automationStatus: '',
    regressionStatus: '',
    tag: ''
  });
  const [availableTags, setAvailableTags] = useState([]);

  // Reload data whenever this component mounts or location changes
  useEffect(() => {
    loadData();

    // Check if there's an edit query parameter
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId) {
      loadTestCaseForEdit(editId);
    }
  }, [location]);

  useEffect(() => {
    if (filters.projectId) {
      loadApplicationsByProject(filters.projectId);
      testCasesAPI.getTagsByProject(filters.projectId)
        .then(res => setAvailableTags(res.data || []))
        .catch(() => setAvailableTags([]));
    } else {
      setApplications([]);
      setAvailableTags([]);
      setFilters(prev => ({ ...prev, applicationId: '', moduleId: '', tag: '' }));
    }
  }, [filters.projectId]);

  useEffect(() => {
    if (filters.applicationId) {
      loadModulesByApplication(filters.applicationId);
    } else {
      setModules([]);
      setFilters(prev => ({ ...prev, moduleId: '' }));
    }
  }, [filters.applicationId]);

  useEffect(() => {
    // Only load test cases if projects are loaded (or if user is admin)
    if (projects.length > 0 || user?.role === 'ADMIN') {
      loadTestCases();
    }
  }, [filters.projectId, filters.moduleId, filters.status, filters.priority, projects]);

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
      await loadTestCases();
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTestCases = async () => {
    try {
      const params = {};
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.moduleId) params.moduleId = filters.moduleId;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const response = await testCasesAPI.getAll(params);
      let testCasesList = response.data;

      // Filter test cases based on user's accessible projects when no specific project is selected
      if (!filters.projectId && user?.role !== 'ADMIN') {
        const userProjectIds = projects.map(p => p.id);
        testCasesList = testCasesList.filter(tc => userProjectIds.includes(tc.projectId));
      }

      setTestCases(testCasesList);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Load test cases error:', err);
      setError('Failed to load test cases');
      setTestCases([]); // Ensure we show empty state on error
    }
  };

  const loadApplicationsByProject = async (projectId) => {
    try {
      const response = await applicationsAPI.getByProject(projectId);
      setApplications(response.data);
    } catch (err) {
      console.error('Load applications error:', err);
    }
  };

  const loadModulesByApplication = async (applicationId) => {
    try {
      const response = await testModulesAPI.getAll();
      const filtered = response.data.filter(m => m.applicationId === parseInt(applicationId));
      setModules(filtered);
    } catch (err) {
      console.error('Load modules error:', err);
    }
  };

  const loadTestCaseForEdit = async (testCaseId) => {
    try {
      const response = await testCasesAPI.getById(testCaseId);
      setEditingTestCase(response.data);
      // Clear the query parameter from URL
      navigate('/test-cases', { replace: true });
    } catch (err) {
      console.error('Load test case for edit error:', err);
      setError('Failed to load test case for editing');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;

    try {
      await testCasesAPI.delete(id);
      loadTestCases();
    } catch (err) {
      setError('Failed to delete test case');
      console.error('Delete error:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      projectId: '',
      applicationId: '',
      moduleId: '',
      status: '',
      priority: '',
      search: '',
      automationStatus: '',
      regressionStatus: '',
      tag: ''
    });
  };

  const filteredTestCases = testCases.filter(tc => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = tc.title.toLowerCase().includes(searchLower) ||
             tc.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Automation filter
    if (filters.automationStatus === 'AUTOMATED' && !tc.isAutomated) return false;
    if (filters.automationStatus === 'MANUAL' && tc.isAutomated) return false;

    // Regression filter
    if (filters.regressionStatus === 'REGRESSION' && !tc.isRegression) return false;
    if (filters.regressionStatus === 'NON_REGRESSION' && tc.isRegression) return false;

    // Tag filter
    if (filters.tag && !(tc.tags || []).includes(filters.tag)) return false;

    return true;
  });

  // Group test cases by module when no module filter is selected
  const groupedTestCases = () => {
    if (filters.moduleId) {
      // If a specific module is selected, return as is
      return [{ moduleName: null, testCases: filteredTestCases }];
    }

    // Group by module
    const groups = {};
    filteredTestCases.forEach(tc => {
      const moduleKey = tc.moduleName || 'No Module';
      if (!groups[moduleKey]) {
        groups[moduleKey] = [];
      }
      groups[moduleKey].push(tc);
    });

    // Convert to array and sort: "No Module" last, others alphabetically
    return Object.entries(groups)
      .map(([moduleName, testCases]) => ({ moduleName, testCases }))
      .sort((a, b) => {
        if (a.moduleName === 'No Module') return 1;
        if (b.moduleName === 'No Module') return -1;
        return a.moduleName.localeCompare(b.moduleName);
      });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
      CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusIcon = (status) => {
    const icons = {
      ACTIVE: <CheckCircle2 className="h-4 w-4" />,
      DEPRECATED: <XCircle className="h-4 w-4" />,
      DRAFT: <Clock className="h-4 w-4" />
    };
    return icons[status] || icons.DRAFT;
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      DEPRECATED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      DRAFT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Test Cases</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and organize your test cases</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBulkImportModal(true)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Bulk Import
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Test Case
              </Button>
            </div>
          </div>

          {/* Summary Metrics */}
          {filteredTestCases.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Tests</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{filteredTestCases.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Automated</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {filteredTestCases.filter(tc => tc.isAutomated).length}
                        <span className="text-sm font-normal text-green-600 dark:text-green-400 ml-2">
                          ({filteredTestCases.length > 0 ? Math.round((filteredTestCases.filter(tc => tc.isAutomated).length / filteredTestCases.length) * 100) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="text-3xl">🤖</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Manual</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {filteredTestCases.filter(tc => !tc.isAutomated).length}
                        <span className="text-sm font-normal text-purple-600 dark:text-purple-400 ml-2">
                          ({filteredTestCases.length > 0 ? Math.round((filteredTestCases.filter(tc => !tc.isAutomated).length / filteredTestCases.length) * 100) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="text-3xl">👤</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Regression</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {filteredTestCases.filter(tc => tc.isRegression).length}
                        <span className="text-sm font-normal text-orange-600 dark:text-orange-400 ml-2">
                          ({filteredTestCases.length > 0 ? Math.round((filteredTestCases.filter(tc => tc.isRegression).length / filteredTestCases.length) * 100) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="text-3xl">🔄</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters Section */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle>Filters</CardTitle>
                </div>
                {(filters.projectId || filters.applicationId || filters.moduleId || filters.status || filters.priority || filters.search || filters.automationStatus || filters.regressionStatus || filters.tag) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search test cases..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Project
                  </label>
                  <Select
                    value={filters.projectId}
                    onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
                  >
                    <option value="">All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Application
                  </label>
                  <Select
                    value={filters.applicationId}
                    onChange={(e) => setFilters(prev => ({ ...prev, applicationId: e.target.value }))}
                    disabled={!filters.projectId}
                  >
                    <option value="">All Applications</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Test Module
                  </label>
                  <Select
                    value={filters.moduleId}
                    onChange={(e) => setFilters(prev => ({ ...prev, moduleId: e.target.value }))}
                    disabled={!filters.applicationId}
                  >
                    <option value="">All Modules</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>{module.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="DEPRECATED">Deprecated</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Priority
                  </label>
                  <Select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Automation
                  </label>
                  <Select
                    value={filters.automationStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, automationStatus: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="AUTOMATED">🤖 Automated</option>
                    <option value="MANUAL">👤 Manual</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Regression
                  </label>
                  <Select
                    value={filters.regressionStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, regressionStatus: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="REGRESSION">🔄 Regression</option>
                    <option value="NON_REGRESSION">Non-Regression</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Tag
                  </label>
                  <Select
                    value={filters.tag}
                    onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                    disabled={availableTags.length === 0}
                  >
                    <option value="">All Tags</option>
                    {availableTags.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Test Cases List */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Test Cases ({filteredTestCases.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
                </div>
              </div>
            ) : filteredTestCases.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
                    <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No test cases found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 max-w-sm">
                    Create your first test case to get started
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test Case
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {groupedTestCases().map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    {/* Module Header - only show if not filtering by specific module */}
                    {!filters.moduleId && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-semibold text-purple-900 dark:text-purple-300">
                            {group.moduleName}
                          </span>
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            ({group.testCases.length} {group.testCases.length === 1 ? 'test' : 'tests'})
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent dark:from-purple-800"></div>
                      </div>
                    )}

                    {/* Test Cases in this group */}
                    {group.testCases.map((testCase) => (
                      <Card key={testCase.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {testCase.title}
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${getPriorityColor(testCase.priority)}`}>
                                    {testCase.priority}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${getStatusColor(testCase.status)}`}>
                                    {getStatusIcon(testCase.status)}
                                    {testCase.status}
                                  </span>
                                  {testCase.isAutomated && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                      🤖 Automated
                                    </span>
                                  )}
                                  {testCase.isRegression && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                      🔄 Regression
                                    </span>
                                  )}
                                  {(testCase.tags || []).map(tag => (
                                    <button
                                      key={tag}
                                      onClick={() => setFilters(prev => ({ ...prev, tag }))}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
                                    >
                                      <Tag className="h-2.5 w-2.5" />
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {testCase.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {testCase.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  <span className="font-medium">Project:</span>
                                  <span>{testCase.projectName}</span>
                                </div>
                                {testCase.moduleName && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    <span className="font-medium">Module:</span>
                                    <span>{testCase.moduleName}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                  <span className="font-medium">Type:</span>
                                  <span>{testCase.type}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                  <span>Created by {testCase.createdByUsername}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/test-cases/${testCase.id}`)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTestCase(testCase)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(testCase.id)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <TestCaseForm
        isOpen={showCreateModal || !!editingTestCase}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTestCase(null);
        }}
        onSuccess={loadTestCases}
        testCase={editingTestCase}
        projects={projects}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImportComplete={loadTestCases}
      />

      <Footer />
    </div>
  );
}
/* Force rebuild Mon, Nov 10, 2025 12:51:40 PM */
