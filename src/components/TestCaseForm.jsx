import React, { useState, useEffect, useRef } from 'react';
import { testCasesAPI, projectsAPI, testModulesAPI, automationCommentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
import { AlertCircle, MessageSquare, History, Tag, X } from 'lucide-react';

const SUGGESTED_TAGS = ['smoke', 'regression', 'critical', 'sanity', 'e2e', 'login', 'payment', 'api', 'ui', 'integration'];

function TagInput({ tags, onChange, projectId }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [projectTags, setProjectTags] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      testCasesAPI.getTagsByProject(projectId)
        .then(res => setProjectTags(res.data || []))
        .catch(() => {});
    } else {
      setProjectTags([]);
    }
  }, [projectId]);

  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return; }
    const term = input.toLowerCase();
    const allSuggestions = [...new Set([...projectTags, ...SUGGESTED_TAGS])];
    setSuggestions(
      allSuggestions.filter(t => t.includes(term) && !tags.includes(t)).slice(0, 6)
    );
  }, [input, projectTags, tags]);

  const addTag = (tag) => {
    const normalized = tag.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
    if (normalized && !tags.includes(normalized) && tags.length < 10) {
      onChange([...tags, normalized]);
    }
    setInput('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-text"
           onClick={() => inputRef.current?.focus()}>
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <Tag className="h-2.5 w-2.5" />
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    className="hover:text-indigo-900 dark:hover:text-white ml-0.5">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map(s => (
            <button key={s} type="button" onClick={() => addTag(s)}
                    className="px-2 py-0.5 rounded-full text-xs border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestCaseForm({ isOpen, onClose, onSuccess, testCase = null, projects = [] }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [automationComment, setAutomationComment] = useState('');
  const [automationStatus, setAutomationStatus] = useState('');
  const [commentHistory, setCommentHistory] = useState([]);
  const [showCommentHistory, setShowCommentHistory] = useState(false);

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
    isRegression: false,
    tags: []
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
          isRegression: testCase.isRegression || false,
          tags: testCase.tags || []
        });
        if (testCase.projectId) {
          loadModulesByProject(testCase.projectId);
        }
        // Load automation comment if test case is not automated
        if (!testCase.isAutomated && testCase.id) {
          loadAutomationComment(testCase.id);
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

  const loadAutomationComment = async (testCaseId) => {
    try {
      const response = await automationCommentsAPI.getCurrentComment(testCaseId);
      if (response.data) {
        setAutomationComment(response.data.comment);
        setAutomationStatus(response.data.automationStatus || '');
      }
    } catch (err) {
      // No current comment exists, which is fine
      console.log('No automation comment found');
    }
  };

  const loadCommentHistory = async () => {
    if (!testCase || !testCase.id) return;
    try {
      const response = await automationCommentsAPI.getCommentHistory(testCase.id);
      setCommentHistory(response.data);
      setShowCommentHistory(true);
    } catch (err) {
      console.error('Load comment history error:', err);
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

      let savedTestCaseId;
      if (testCase) {
        await testCasesAPI.update(testCase.id, payload);
        savedTestCaseId = testCase.id;
      } else {
        const response = await testCasesAPI.create(payload);
        savedTestCaseId = response.data.id;
      }

      // Save automation comment if not automated and comment is provided
      if (!formData.isAutomated && automationComment.trim() && savedTestCaseId && user) {
        const commentPayload = {
          testCaseId: savedTestCaseId,
          comment: automationComment.trim(),
          automationStatus: automationStatus || null
        };
        await automationCommentsAPI.addComment(commentPayload, user.id);
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
      isRegression: false,
      tags: []
    });
    setAutomationComment('');
    setAutomationStatus('');
    setCommentHistory([]);
    setShowCommentHistory(false);
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

            {/* Automation Comment Section - Show only when NOT automated */}
            {!formData.isAutomated && (
              <div className="border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50/50 dark:bg-orange-900/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Why is this test not automated?
                  </label>
                  {testCase && testCase.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={loadCommentHistory}
                      className="text-xs text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-200"
                    >
                      <History className="h-3 w-3 mr-1" />
                      View History
                    </Button>
                  )}
                </div>

                {/* Automation Status */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5 block">
                    Automation Status
                  </label>
                  <Select
                    value={automationStatus}
                    onChange={(e) => setAutomationStatus(e.target.value)}
                    className="text-sm"
                  >
                    <option value="">Select status...</option>
                    <option value="NOT_FEASIBLE">Not Feasible</option>
                    <option value="REQUIRES_MANUAL">Requires Manual Testing</option>
                    <option value="BLOCKED">Blocked by Technical Limitations</option>
                    <option value="PENDING_TOOLING">Pending Tooling/Infrastructure</option>
                    <option value="PLANNED">Planned for Automation</option>
                    <option value="IN_PROGRESS">Automation in Progress</option>
                    <option value="DEFERRED">Deferred to Future Sprint</option>
                  </Select>
                </div>

                {/* Comment */}
                <Textarea
                  value={automationComment}
                  onChange={(e) => setAutomationComment(e.target.value)}
                  placeholder="Explain why this test case cannot be automated or what is blocking automation..."
                  rows={3}
                  className="text-sm"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This comment will be tracked with history for audit purposes
                </p>

                {/* Comment History Modal */}
                {showCommentHistory && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Comment History</h4>
                      <button
                        type="button"
                        onClick={() => setShowCommentHistory(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Close
                      </button>
                    </div>
                    {commentHistory.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                        No comment history available
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {commentHistory.map((historyItem, index) => (
                          <div
                            key={historyItem.id}
                            className={`p-2 rounded border ${
                              historyItem.isCurrent
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {historyItem.createdByUsername}
                                {historyItem.isCurrent && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px]">
                                    CURRENT
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(historyItem.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {historyItem.automationStatus && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                                Status: {historyItem.automationStatus.replace(/_/g, ' ')}
                              </p>
                            )}
                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {historyItem.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                Tags
                <span className="text-xs font-normal text-gray-400">(press Enter or comma to add)</span>
              </label>
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                projectId={formData.projectId}
              />
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
