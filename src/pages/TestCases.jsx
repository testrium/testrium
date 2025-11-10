import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testCasesAPI, projectsAPI, testSuitesAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TestCaseForm from '../components/TestCaseForm';
import {
  Plus, Search, Filter, FileText, ChevronRight,
  Edit, Trash2, AlertCircle, CheckCircle2, Clock, XCircle, Home, LogOut
} from 'lucide-react';

export default function TestCases() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    suiteId: '',
    status: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filters.projectId) {
      loadSuitesByProject(filters.projectId);
    } else {
      setSuites([]);
      setFilters(prev => ({ ...prev, suiteId: '' }));
    }
  }, [filters.projectId]);

  useEffect(() => {
    loadTestCases();
  }, [filters.projectId, filters.suiteId, filters.status, filters.priority]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes] = await Promise.all([
        projectsAPI.getAll()
      ]);
      setProjects(projectsRes.data);
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
      if (filters.suiteId) params.suiteId = filters.suiteId;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const response = await testCasesAPI.getAll(params);
      setTestCases(response.data);
    } catch (err) {
      console.error('Load test cases error:', err);
      setError('Failed to load test cases');
    }
  };

  const loadSuitesByProject = async (projectId) => {
    try {
      const response = await testSuitesAPI.getByProject(projectId);
      setSuites(response.data);
    } catch (err) {
      console.error('Load suites error:', err);
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
      suiteId: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                  Test Cases
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800">
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'User'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Test Case
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters Section */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle>Filters</CardTitle>
                </div>
                {(filters.projectId || filters.suiteId || filters.status || filters.priority || filters.search) && (
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
                    Test Suite
                  </label>
                  <Select
                    value={filters.suiteId}
                    onChange={(e) => setFilters(prev => ({ ...prev, suiteId: e.target.value }))}
                    disabled={!filters.projectId}
                  >
                    <option value="">All Suites</option>
                    {suites.map(suite => (
                      <option key={suite.id} value={suite.id}>{suite.name}</option>
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
              <div className="space-y-3">
                {filteredTestCases.map((testCase) => (
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
                            {testCase.suiteName && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <span className="font-medium">Suite:</span>
                                <span>{testCase.suiteName}</span>
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
                            onClick={() => {/* TODO: View details */}}
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
      />
    </div>
  );
}
