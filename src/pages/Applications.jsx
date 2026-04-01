import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { applicationsAPI } from '../services/applications';
import { projectsAPI, projectMembersAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../components/ui/Modal';
import { Plus, Edit, Trash2, AlertCircle, Package } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

export default function Applications() {
  usePageTitle('Applications');
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [canManageApps, setCanManageApps] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    projectId: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
      checkUserPermissions();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [appsRes, projectsRes] = await Promise.all([
        applicationsAPI.getAll(),
        user.role === 'ADMIN' ? projectsAPI.getAll() : loadUserProjects()
      ]);
      setApplications(appsRes.data);
      setProjects(projectsRes?.data || projectsRes || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProjects = async () => {
    if (!user?.id) return [];
    const membershipRes = await projectMembersAPI.getUserProjects(user.id);
    const projectIds = [...new Set(membershipRes.data.map(m => m.projectId))];
    const allProjectsRes = await projectsAPI.getAll();
    return allProjectsRes.data.filter(p => projectIds.includes(p.id));
  };

  const checkUserPermissions = async () => {
    if (!user) {
      setCanManageApps(false);
      return;
    }

    // Admin users can always manage applications
    if (user.role === 'ADMIN') {
      setCanManageApps(true);
      return;
    }

    // Check if user is LEAD in any project
    try {
      const response = await projectMembersAPI.getUserProjects(user.id);
      const memberships = response.data;
      const hasLeadRole = memberships.some(m => m.role === 'LEAD');
      setCanManageApps(hasLeadRole);
    } catch (err) {
      console.error('Error checking user permissions:', err);
      setCanManageApps(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        project: { id: parseInt(formData.projectId) }
      };
      if (editingApp) {
        await applicationsAPI.update(editingApp.id, payload);
      } else {
        await applicationsAPI.create(payload);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save application');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this application?')) return;
    try {
      await applicationsAPI.delete(id);
      loadData();
    } catch (err) {
      setError('Failed to delete application');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingApp(null);
    setFormData({ name: '', description: '', status: 'ACTIVE', projectId: '' });
    setError('');
  };

  useEffect(() => {
    if (showModal && editingApp) {
      setFormData({
        name: editingApp.name || '',
        description: editingApp.description || '',
        status: editingApp.status || 'ACTIVE',
        projectId: editingApp.project?.id?.toString() || ''
      });
    }
  }, [showModal, editingApp]);

  const activeApps = applications.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your test applications</p>
            </div>
            {canManageApps && (
              <Button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Total Applications</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Active</CardTitle>
                <Package className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeApps}</div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Package className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">No applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <Card key={app.id} className="border-0 shadow-md hover:shadow-xl transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{app.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    {app.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{app.description}</p>
                    )}
                    {canManageApps && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingApp(app); setShowModal(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(app.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={handleCloseModal}>
            <ModalTitle>{editingApp ? 'Edit Application' : 'Create Application'}</ModalTitle>
            <ModalDescription>Fill in the application details</ModalDescription>
          </ModalHeader>
          <ModalContent>
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project <span className="text-red-500">*</span></label>
                <Select value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})} required>
                  <option value="">Select Project</option>
                  {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name <span className="text-red-500">*</span></label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} />
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : editingApp ? 'Update' : 'Create'}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
