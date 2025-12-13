import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testCasesAPI, projectsAPI, testModulesAPI, projectMembersAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TestCaseForm from '../components/TestCaseForm';
import {
  Plus, Search, Filter, ChevronRight,
  Edit, Trash2, AlertCircle, CheckCircle2, Clock, XCircle, FileText, Layers
} from 'lucide-react';

export default function TestCases() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    moduleId: '',
    status: '',
    priority: '',
    search: ''
  });

  // Reload data whenever this component mounts or location changes
  useEffect(() => {
    loadData();
  }, [location]);

  useEffect(() => {
    if (filters.projectId) {
      loadModulesByProject(filters.projectId);
    } else {
      setModules([]);
      setFilters(prev => ({ ...prev, moduleId: '' }));
    }
  }, [filters.projectId]);

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

  const loadModulesByProject = async (projectId) => {
    try {
      const response = await testModulesAPI.getByProject(projectId);
      setModules(response.data);
    } catch (err) {
      console.error('Load modules error:', err);
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
      moduleId: '',
      status: '',
      priority: '',
      search: ''
    });
  };

  const filteredTestCases = testCases.filter(tc => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return tc.title.toLowerCase().includes(searchLower) ||
             tc.description?.toLowerCase().includes(searchLower);
    }
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
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Test Case
            </Button>
          </div>

          {/* Filters Section */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle>Filters</CardTitle>
                </div>
                {(filters.projectId || filters.moduleId || filters.status || filters.priority || filters.search) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                    Test Module
                  </label>
                  <Select
                    value={filters.moduleId}
                    onChange={(e) => setFilters(prev => ({ ...prev, moduleId: e.target.value }))}
                    disabled={!filters.projectId}
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
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${getPriorityColor(testCase.priority)}`}>
                                    {testCase.priority}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${getStatusColor(testCase.status)}`}>
                                    {getStatusIcon(testCase.status)}
                                    {testCase.status}
                                  </span>
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

      <Footer />
    </div>
  );
}
/* Force rebuild Mon, Nov 10, 2025 12:51:40 PM */
