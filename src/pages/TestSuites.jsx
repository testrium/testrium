import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testSuitesAPI, projectsAPI, projectMembersAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter
} from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import {
  Plus, Search, Edit, Trash2, AlertCircle, FileText, Filter, FolderKanban
} from 'lucide-react';

export default function TestSuites() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [suites, setSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSuite, setEditingSuite] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    search: ''
  });

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: ''
  });

  // Reload data whenever this component mounts or location changes
  useEffect(() => {
    loadData();
  }, [location]);

  useEffect(() => {
    // Only load suites if projects are loaded (or if user is admin)
    if (projects.length > 0 || user?.role === 'ADMIN') {
      loadSuites();
    }
  }, [filters.projectId, projects]);

  useEffect(() => {
    if (showModal) {
      if (editingSuite) {
        setFormData({
          name: editingSuite.name || '',
          description: editingSuite.description || '',
          projectId: editingSuite.projectId?.toString() || ''
        });
      } else {
        setFormData({
          name: '',
          description: '',
          projectId: ''
        });
      }
    }
  }, [showModal, editingSuite]);

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
      await loadSuites();
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuites = async () => {
    try {
      let response;
      if (filters.projectId) {
        response = await testSuitesAPI.getByProject(filters.projectId);
      } else {
        response = await testSuitesAPI.getAll();
      }

      let suitesList = response.data;

      // Filter suites based on user's accessible projects when no specific project is selected
      if (!filters.projectId && user?.role !== 'ADMIN') {
        const userProjectIds = projects.map(p => p.id);
        suitesList = suitesList.filter(suite => userProjectIds.includes(suite.projectId));
      }

      setSuites(suitesList);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Load suites error:', err);
      setError('Failed to load test suites');
      setSuites([]); // Ensure we show empty state on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        projectId: parseInt(formData.projectId)
      };

      if (editingSuite) {
        await testSuitesAPI.update(editingSuite.id, payload);
      } else {
        await testSuitesAPI.create(payload);
      }

      await loadSuites();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test suite');
      console.error('Submit error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test suite? This will not delete the test cases inside it.')) return;

    try {
      await testSuitesAPI.delete(id);
      loadSuites();
    } catch (err) {
      setError('Failed to delete test suite');
      console.error('Delete error:', err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSuite(null);
    setFormData({
      name: '',
      description: '',
      projectId: ''
    });
    setError('');
  };

  const clearFilters = () => {
    setFilters({
      projectId: '',
      search: ''
    });
  };

  const filteredSuites = suites.filter(suite => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return suite.name.toLowerCase().includes(searchLower) ||
             suite.description?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Test Suites</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Organize your test cases into suites</p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Test Suite
            </Button>
          </div>

          {/* Filters Section */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <CardTitle>Filters</CardTitle>
                </div>
                {(filters.projectId || filters.search) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search test suites..."
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

          {/* Test Suites List */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Test Suites ({filteredSuites.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 dark:border-purple-900"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 absolute top-0"></div>
                </div>
              </div>
            ) : filteredSuites.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
                    <FolderKanban className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No test suites found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 max-w-sm">
                    Create your first test suite to organize your test cases
                  </p>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test Suite
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSuites.map((suite) => (
                  <Card key={suite.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {suite.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {suite.testCaseCount || 0}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                test {suite.testCaseCount === 1 ? 'case' : 'cases'}
                              </span>
                            </div>
                          </div>

                          {suite.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {suite.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span className="font-medium">Project:</span>
                              <span>{suite.projectName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              <span>Created by {suite.createdByUsername}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSuite(suite);
                              setShowModal(true);
                            }}
                            className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(suite.id)}
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
      <Modal isOpen={showModal} onClose={handleCloseModal} className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={handleCloseModal}>
            <div>
              <ModalTitle>
                {editingSuite ? 'Edit Test Suite' : 'Create New Test Suite'}
              </ModalTitle>
              <ModalDescription>
                {editingSuite
                  ? 'Update the test suite details below'
                  : 'Fill in the details to create a new test suite'}
              </ModalDescription>
            </div>
          </ModalHeader>

          <ModalContent>
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Suite Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter test suite name"
                  required
                />
              </div>

              {/* Project */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Project <span className="text-red-500">*</span>
                </label>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test suite description"
                  rows={4}
                />
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {formLoading ? 'Saving...' : editingSuite ? 'Update Suite' : 'Create Suite'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
/* Force rebuild Mon, Nov 10, 2025 12:51:40 PM */
