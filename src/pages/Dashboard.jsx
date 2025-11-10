import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, projectMembersAPI, usersAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ProjectMembersModal from '../components/ProjectMembersModal';
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
import { FolderOpen, TrendingUp, CheckCircle2, FolderKanban, FileText, Layers, Plus, Edit, Trash2, AlertCircle, Users } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  // Members management
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [membersLoading, setMembersLoading] = useState(false);

  // Reload data whenever this component mounts or location changes
  useEffect(() => {
    loadProjects();
  }, [location]);

  useEffect(() => {
    if (showModal) {
      if (editingProject) {
        setFormData({
          name: editingProject.name || '',
          description: editingProject.description || '',
          status: editingProject.status || 'ACTIVE'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'ACTIVE'
        });
      }
    }
  }, [showModal, editingProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      // If user is ADMIN, show all projects
      // If user is regular user, show only projects they are member of
      if (user?.role === 'ADMIN') {
        console.log('Loading projects for ADMIN user');
        const response = await projectsAPI.getAll();
        console.log('Admin projects:', response.data);
        setProjects(response.data);
      } else if (user?.id) {
        console.log('Loading projects for regular user, userId:', user.id);
        // Get projects user is member of
        const membershipResponse = await projectMembersAPI.getUserProjects(user.id);
        const memberships = membershipResponse.data;
        console.log('User memberships:', memberships);

        // Get unique project IDs
        const projectIds = [...new Set(memberships.map(m => m.projectId))];
        console.log('Extracted project IDs:', projectIds);

        // Fetch all projects and filter to only those user is member of
        const allProjectsResponse = await projectsAPI.getAll();
        console.log('All projects:', allProjectsResponse.data);
        const userProjects = allProjectsResponse.data.filter(p => projectIds.includes(p.id));
        console.log('Filtered user projects:', userProjects);
        setProjects(userProjects);
      } else {
        console.log('No user or user.id found');
        setProjects([]);
      }
    } catch (err) {
      setError('Failed to load projects');
      console.error('Load projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, formData);
      } else {
        await projectsAPI.create(formData);
      }

      await loadProjects();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
      console.error('Submit error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(id);
      loadProjects();
    } catch (err) {
      setError('Failed to delete project');
      console.error('Delete error:', err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'ACTIVE'
    });
    setError('');
  };

  const handleManageMembers = async (project) => {
    setSelectedProject(project);
    setShowMembersModal(true);
    setMembersLoading(true);

    try {
      const [membersRes, usersRes] = await Promise.all([
        projectMembersAPI.getProjectMembers(project.id),
        projectMembersAPI.getAvailableUsers(project.id)
      ]);
      setProjectMembers(membersRes.data);
      setAvailableUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Failed to load project members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setMembersLoading(true);
    try {
      await projectMembersAPI.addMembers(selectedProject.id, {
        userIds: selectedUserIds,
        role: memberRole
      });

      // Reload members and available users
      const [membersRes, usersRes] = await Promise.all([
        projectMembersAPI.getProjectMembers(selectedProject.id),
        projectMembersAPI.getAvailableUsers(selectedProject.id)
      ]);
      setProjectMembers(membersRes.data);
      setAvailableUsers(usersRes.data);
      setSelectedUserIds([]);
      setError('');
    } catch (err) {
      console.error('Error adding members:', err);
      setError('Failed to add members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setMembersLoading(true);
    try {
      await projectMembersAPI.removeMember(memberId);

      // Reload members and available users
      const [membersRes, usersRes] = await Promise.all([
        projectMembersAPI.getProjectMembers(selectedProject.id),
        projectMembersAPI.getAvailableUsers(selectedProject.id)
      ]);
      setProjectMembers(membersRes.data);
      setAvailableUsers(usersRes.data);
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCloseMembersModal = () => {
    setShowMembersModal(false);
    setSelectedProject(null);
    setProjectMembers([]);
    setAvailableUsers([]);
    setSelectedUserIds([]);
    setMemberRole('MEMBER');
    setError('');
  };

  const handleLogout = async () => {
    await logout();
  };

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="mb-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome back, {user?.username}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-base">
              Here's an overview of your test management projects
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              onClick={() => navigate('/test-cases')}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 cursor-pointer hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Test Cases</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage test cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => navigate('/test-suites')}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 cursor-pointer hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Layers className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Test Suites</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Organize test suites</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => {
                // Scroll to projects section
                const projectsSection = document.getElementById('projects-section');
                if (projectsSection) {
                  projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 cursor-pointer hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <FolderKanban className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Projects</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View projects below</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Projects</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All available projects</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Projects</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{activeProjects}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Currently in progress</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Completed</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{completedProjects}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Successfully finished</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Projects Section */}
          <div id="projects-section">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1">View and browse your test case projects</p>
              </div>
              {user?.role === 'ADMIN' && (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              )}
            </div>

            {/* Projects List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
                    <FolderOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No projects available</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 max-w-sm">
                    Projects will appear here when they are created by your administrator
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card key={project.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => navigate(`/test-cases?projectId=${project.id}`)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {project.name}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              project.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                : project.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {project.status}
                            </span>
                          </div>

                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {user?.role === 'ADMIN' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManageMembers(project)}
                              className="hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                              title="Manage Members"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProject(project);
                                setShowModal(true);
                              }}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edit Project"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Create/Edit Project Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={handleCloseModal}>
            <div>
              <ModalTitle>
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </ModalTitle>
              <ModalDescription>
                {editingProject
                  ? 'Update the project details below'
                  : 'Fill in the details to create a new project'}
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
              {/* Project Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
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
                  placeholder="Enter project description"
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {formLoading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Project Members Modal */}
      <ProjectMembersModal
        isOpen={showMembersModal}
        onClose={handleCloseMembersModal}
        project={selectedProject}
        members={projectMembers}
        availableUsers={availableUsers}
        selectedUserIds={selectedUserIds}
        setSelectedUserIds={setSelectedUserIds}
        memberRole={memberRole}
        setMemberRole={setMemberRole}
        onAddMembers={handleAddMembers}
        onRemoveMember={handleRemoveMember}
        loading={membersLoading}
        error={error}
      />
    </div>
  );
}/* Force rebuild Mon, Nov 10, 2025 12:51:40 PM */
