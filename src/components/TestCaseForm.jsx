import React, { useState, useEffect } from 'react';
import { testCasesAPI, projectsAPI, testModulesAPI } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter
} from './ui/Modal';
import { AlertCircle } from 'lucide-react';

export default function TestCaseForm({ isOpen, onClose, onSuccess, testCase = null, projects = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preconditions: '',
    steps: '',
    expectedResult: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    type: 'FUNCTIONAL',
    projectId: '',
    moduleId: '',
    isAutomated: false,
    isRegression: false
  });

  useEffect(() => {
    if (isOpen) {
      if (testCase) {
        setFormData({
          title: testCase.title || '',
          description: testCase.description || '',
          preconditions: testCase.preconditions || '',
          steps: testCase.steps || '',
          expectedResult: testCase.expectedResult || '',
          priority: testCase.priority || 'MEDIUM',
          status: testCase.status || 'ACTIVE',
          type: testCase.type || 'FUNCTIONAL',
          projectId: testCase.projectId?.toString() || '',
          moduleId: testCase.moduleId?.toString() || '',
          isAutomated: testCase.isAutomated || false,
          isRegression: testCase.isRegression || false
        });
        if (testCase.projectId) {
          loadModulesByProject(testCase.projectId);
        }
      }
    }
  }, [isOpen, testCase]);

  useEffect(() => {
    if (formData.projectId) {
      loadModulesByProject(formData.projectId);
    } else {
      setModules([]);
      setFormData(prev => ({ ...prev, moduleId: '' }));
    }
  }, [formData.projectId]);

  const loadModulesByProject = async (projectId) => {
    try {
      const response = await testModulesAPI.getByProject(projectId);
      setModules(response.data);
    } catch (err) {
      console.error('Load modules error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        projectId: parseInt(formData.projectId),
        moduleId: formData.moduleId ? parseInt(formData.moduleId) : null
      };

      if (testCase) {
        await testCasesAPI.update(testCase.id, payload);
      } else {
        await testCasesAPI.create(payload);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test case');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      preconditions: '',
      steps: '',
      expectedResult: '',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      type: 'FUNCTIONAL',
      projectId: '',
      moduleId: '',
      isAutomated: false,
      isRegression: false
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-3xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={handleClose}>
          <div>
            <ModalTitle>
              {testCase ? 'Edit Test Case' : 'Create New Test Case'}
            </ModalTitle>
            <ModalDescription>
              {testCase
                ? 'Update the test case details below'
                : 'Fill in the details to create a new test case'}
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
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter test case title"
                required
              />
            </div>

            {/* Project and Module */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Project <span className="text-red-500">*</span>
                </label>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
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

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Test Module
                </label>
                <Select
                  name="moduleId"
                  value={formData.moduleId}
                  onChange={handleChange}
                  disabled={!formData.projectId}
                >
                  <option value="">No Module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Priority, Status, Type */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Priority <span className="text-red-500">*</span>
                </label>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DEPRECATED">Deprecated</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="FUNCTIONAL">Functional</option>
                  <option value="INTEGRATION">Integration</option>
                  <option value="REGRESSION">Regression</option>
                  <option value="SMOKE">Smoke</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="SECURITY">Security</option>
                  <option value="UI">UI</option>
                  <option value="API">API</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter test case description"
                rows={3}
              />
            </div>

            {/* Preconditions */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Preconditions
              </label>
              <Textarea
                name="preconditions"
                value={formData.preconditions}
                onChange={handleChange}
                placeholder="Enter any preconditions required before executing this test"
                rows={3}
              />
            </div>

            {/* Steps */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Steps <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="steps"
                value={formData.steps}
                onChange={handleChange}
                placeholder="1. First step&#10;2. Second step&#10;3. Third step"
                rows={5}
                required
              />
            </div>

            {/* Automation and Regression Flags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="isAutomated"
                  name="isAutomated"
                  checked={formData.isAutomated}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAutomated" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Automated Test
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="isRegression"
                  name="isRegression"
                  checked={formData.isRegression}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRegression" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Regression Test
                </label>
              </div>
            </div>

            {/* Expected Result */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Expected Result <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="expectedResult"
                value={formData.expectedResult}
                onChange={handleChange}
                placeholder="Describe the expected outcome"
                rows={4}
                required
              />
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? 'Saving...' : testCase ? 'Update Test Case' : 'Create Test Case'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
