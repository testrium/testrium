import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, MinusCircle, Clock,
  Play, ChevronRight, FileText, Save, Calendar, User, Bug, Square, CheckSquare
} from 'lucide-react';
import { testRunsAPI } from '../services/testRuns';
import { testExecutionsAPI } from '../services/testExecutions';
import { jiraAPI } from '../api/jira';
import usePageTitle from '../hooks/usePageTitle';

const TestRunExecution = () => {
  usePageTitle('Test Run');
  const { id } = useParams();
  const navigate = useNavigate();
  const [testRun, setTestRun] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [executionData, setExecutionData] = useState({
    status: 'NOT_EXECUTED',
    actualResult: '',
    comments: '',
    executionTimeMinutes: '',
    defectReference: ''
  });

  // Bulk update state
  const [selectedExecutionIds, setSelectedExecutionIds] = useState([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('PASS');

  // JIRA bug creation state
  const [showJiraBugModal, setShowJiraBugModal] = useState(false);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraBugData, setJiraBugData] = useState({
    summary: '',
    description: '',
    issueType: 'Bug',
    priority: 'Medium'
  });
  const [jiraResult, setJiraResult] = useState(null);

  useEffect(() => {
    loadTestRun();
    loadExecutions();
  }, [id]);

  useEffect(() => {
    if (selectedExecution) {
      setExecutionData({
        status: selectedExecution.status || 'NOT_EXECUTED',
        actualResult: selectedExecution.actualResult || '',
        comments: selectedExecution.comments || '',
        executionTimeMinutes: selectedExecution.executionTimeMinutes || '',
        defectReference: selectedExecution.defectReference || ''
      });
    }
  }, [selectedExecution]);

  const loadTestRun = async () => {
    try {
      const response = await testRunsAPI.getById(id);
      setTestRun(response.data);
    } catch (err) {
      console.error('Load test run error:', err);
      setError('Failed to load test run');
    }
  };

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const response = await testExecutionsAPI.getByTestRun(id);
      setExecutions(response.data);

      // Auto-select first execution if none selected
      if (response.data.length > 0 && !selectedExecution) {
        setSelectedExecution(response.data[0]);
      }

      setError('');
    } catch (err) {
      console.error('Load executions error:', err);
      setError('Failed to load test executions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTestRun = async () => {
    try {
      await testRunsAPI.updateStatus(id, 'IN_PROGRESS');
      loadTestRun();
    } catch (err) {
      console.error('Start test run error:', err);
      setError('Failed to start test run');
    }
  };

  const handleCompleteTestRun = async () => {
    if (!window.confirm('Are you sure you want to mark this test run as completed?')) {
      return;
    }

    try {
      await testRunsAPI.updateStatus(id, 'COMPLETED');
      loadTestRun();
    } catch (err) {
      console.error('Complete test run error:', err);
      setError('Failed to complete test run');
    }
  };

  const handleSaveExecution = async () => {
    try {
      await testExecutionsAPI.update(selectedExecution.id, executionData);
      await loadExecutions();
      await loadTestRun();

      // Update selected execution with new data
      const updatedExecution = executions.find(e => e.id === selectedExecution.id);
      if (updatedExecution) {
        setSelectedExecution({ ...selectedExecution, ...executionData });
      }

      setError('');
    } catch (err) {
      console.error('Save execution error:', err);
      setError('Failed to save execution');
    }
  };

  const handleNextTest = () => {
    const currentIndex = executions.findIndex(e => e.id === selectedExecution.id);
    if (currentIndex < executions.length - 1) {
      setSelectedExecution(executions[currentIndex + 1]);
    }
  };

  const handleOpenJiraBugModal = () => {
    // Pre-populate with test case title
    setJiraBugData({
      summary: `Test Failed: ${selectedExecution.testCaseTitle}`,
      description: `Test execution failed.\n\nActual Result: ${executionData.actualResult || 'Not specified'}`,
      issueType: 'Bug',
      priority: 'Medium'
    });
    setJiraResult(null);
    setShowJiraBugModal(true);
  };

  const handleCreateJiraBug = async (e) => {
    e.preventDefault();
    setJiraLoading(true);
    setError('');

    try {
      const issueData = {
        testExecutionId: selectedExecution.id,
        summary: jiraBugData.summary,
        description: jiraBugData.description,
        issueType: jiraBugData.issueType,
        priority: jiraBugData.priority
      };

      const response = await jiraAPI.createIssue(issueData, testRun.projectId);
      setJiraResult(response.data);

      if (response.data.status === 'Created') {
        // Update execution data with JIRA key
        setExecutionData(prev => ({
          ...prev,
          defectReference: response.data.jiraIssueKey
        }));

        // Reload executions to show updated defect reference
        setTimeout(() => {
          loadExecutions();
        }, 1000);
      }
    } catch (err) {
      console.error('Create JIRA bug error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      const errorMsg = err.response?.data?.errorMessage || err.response?.data?.message || 'Failed to create JIRA bug';
      setError(errorMsg);
    } finally {
      setJiraLoading(false);
    }
  };

  const handleCloseJiraBugModal = () => {
    setShowJiraBugModal(false);
    setJiraBugData({
      summary: '',
      description: '',
      issueType: 'Bug',
      priority: 'Medium'
    });
    setJiraResult(null);
  };

  // Bulk update handlers
  const handleToggleSelection = (executionId) => {
    setSelectedExecutionIds(prev => {
      if (prev.includes(executionId)) {
        return prev.filter(id => id !== executionId);
      } else {
        return [...prev, executionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedExecutionIds.length === executions.length) {
      setSelectedExecutionIds([]);
    } else {
      setSelectedExecutionIds(executions.map(e => e.id));
    }
  };

  const handleSelectByModule = () => {
    if (!testRun?.moduleName) {
      setError('No module associated with this test run');
      return;
    }
    // Since all tests in this run are from the same module, select all
    setSelectedExecutionIds(executions.map(e => e.id));
  };

  const handleBulkUpdate = async () => {
    if (selectedExecutionIds.length === 0) {
      setError('Please select at least one test to update');
      return;
    }

    try {
      await testExecutionsAPI.bulkUpdate(selectedExecutionIds, {
        status: bulkUpdateStatus
      });

      // Reload data
      await loadExecutions();
      await loadTestRun();

      // Clear selection
      setSelectedExecutionIds([]);
      setShowBulkUpdate(false);
      setError('');
    } catch (err) {
      console.error('Bulk update error:', err);
      setError('Failed to update test executions');
    }
  };

  const handleCancelBulkUpdate = () => {
    setSelectedExecutionIds([]);
    setShowBulkUpdate(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'BLOCKED':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'SKIPPED':
        return <MinusCircle className="w-5 h-5 text-gray-500" />;
      case 'NOT_EXECUTED':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-50 border-green-200';
      case 'FAIL':
        return 'bg-red-50 border-red-200';
      case 'BLOCKED':
        return 'bg-yellow-50 border-yellow-200';
      case 'SKIPPED':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading && !testRun) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading test run...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/test-runs')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{testRun?.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{testRun?.projectName}</span>
                  {testRun?.moduleName && <span>• {testRun.moduleName}</span>}
                  {testRun?.assignedToUsername && (
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {testRun.assignedToUsername}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {testRun?.status === 'NOT_STARTED' && (
                <button
                  onClick={handleStartTestRun}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Test Run
                </button>
              )}
              {testRun?.status === 'IN_PROGRESS' && (
                <button
                  onClick={handleCompleteTestRun}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Test Run
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{testRun ? Math.round(((testRun.totalTestCases - testRun.notExecutedCount) / testRun.totalTestCases) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${testRun ? Math.round(((testRun.totalTestCases - testRun.notExecutedCount) / testRun.totalTestCases) * 100) : 0}%`
                }}
              />
            </div>
            <div className="flex gap-6 mt-2 text-sm">
              <span className="text-green-600">Pass: {testRun?.passedCount || 0}</span>
              <span className="text-red-600">Fail: {testRun?.failedCount || 0}</span>
              <span className="text-yellow-600">Blocked: {testRun?.blockedCount || 0}</span>
              <span className="text-gray-600">Skipped: {testRun?.skippedCount || 0}</span>
              <span className="text-gray-500">Not Executed: {testRun?.notExecutedCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bulk Action Toolbar */}
        {selectedExecutionIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-900">
                  {selectedExecutionIds.length} test{selectedExecutionIds.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleCancelBulkUpdate}
                  className="text-sm text-blue-700 hover:text-blue-900 underline"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={bulkUpdateStatus}
                  onChange={(e) => setBulkUpdateStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="SKIPPED">Skipped</option>
                  <option value="NOT_EXECUTED">Not Executed</option>
                </select>
                <button
                  onClick={handleBulkUpdate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Selected
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Test Cases List */}
          <div className="col-span-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Test Cases ({executions.length})</h2>
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedExecutionIds.length === executions.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-1" />
                      Select All
                    </>
                  )}
                </button>
              </div>
              {testRun?.moduleName && (
                <button
                  onClick={handleSelectByModule}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Select All in Module: {testRun.moduleName}
                </button>
              )}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {executions.map((execution, index) => (
                <div
                  key={execution.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 ${
                    selectedExecution?.id === execution.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  } ${getStatusColor(execution.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedExecutionIds.includes(execution.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelection(execution.id);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Test case info - clickable */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedExecution(execution)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                        {getStatusIcon(execution.status)}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {execution.testCaseTitle}
                      </h3>
                    </div>

                    <ChevronRight
                      className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 cursor-pointer"
                      onClick={() => setSelectedExecution(execution)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Details */}
          <div className="col-span-8 bg-white rounded-lg shadow-sm border border-gray-200">
            {selectedExecution ? (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedExecution.testCaseTitle}</h2>
                  {selectedExecution.executedByUsername && (
                    <div className="text-sm text-gray-600">
                      Last executed by {selectedExecution.executedByUsername}
                      {selectedExecution.executedAt && ` on ${new Date(selectedExecution.executedAt).toLocaleString()}`}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Test Case Details */}
                  {selectedExecution.testCasePreconditions && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Preconditions</h3>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {selectedExecution.testCasePreconditions}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Steps</h3>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {selectedExecution.testCaseSteps}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Expected Result</h3>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {selectedExecution.testCaseExpectedResult}
                    </div>
                  </div>

                  {/* Execution Form */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Results</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {['PASS', 'FAIL', 'BLOCKED', 'SKIPPED', 'NOT_EXECUTED'].map(status => (
                            <button
                              key={status}
                              onClick={() => setExecutionData({ ...executionData, status })}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                executionData.status === status
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                {getStatusIcon(status)}
                                <span className="text-xs mt-1">{status.replace('_', ' ')}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Result</label>
                        <textarea
                          value={executionData.actualResult}
                          onChange={(e) => setExecutionData({ ...executionData, actualResult: e.target.value })}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe what actually happened..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                        <textarea
                          value={executionData.comments}
                          onChange={(e) => setExecutionData({ ...executionData, comments: e.target.value })}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional notes or observations..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Execution Time (minutes)
                          </label>
                          <input
                            type="number"
                            value={executionData.executionTimeMinutes}
                            onChange={(e) => setExecutionData({ ...executionData, executionTimeMinutes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 15"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Defect Reference
                          </label>
                          <input
                            type="text"
                            value={executionData.defectReference}
                            onChange={(e) => setExecutionData({ ...executionData, defectReference: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., BUG-123"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveExecution}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save & Continue
                          </button>

                          {(executionData.status === 'FAIL' || executionData.status === 'BLOCKED') && (
                            <button
                              onClick={handleOpenJiraBugModal}
                              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                              title="Create JIRA Bug"
                            >
                              <Bug className="w-4 h-4 mr-2" />
                              Create JIRA Bug
                            </button>
                          )}
                        </div>

                        {executions.findIndex(e => e.id === selectedExecution.id) < executions.length - 1 && (
                          <button
                            onClick={handleNextTest}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Next Test
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p>Select a test case to execute</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JIRA Bug Creation Modal */}
      {showJiraBugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateJiraBug}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create JIRA Bug</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create a defect in JIRA for this failed test case
                </p>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {jiraResult && jiraResult.status === 'Created' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-700 font-medium">JIRA bug created successfully!</p>
                        <p className="text-sm text-green-600 mt-1">
                          Issue Key: <strong>{jiraResult.jiraIssueKey}</strong>
                        </p>
                        <a
                          href={jiraResult.jiraIssueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View in JIRA →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {jiraResult && jiraResult.status === 'Failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <XCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium">Failed to create JIRA bug</p>
                        <p className="text-sm text-red-600 mt-1">{jiraResult.errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!jiraResult && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={jiraBugData.summary}
                        onChange={(e) => setJiraBugData({ ...jiraBugData, summary: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                        disabled={jiraLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={jiraBugData.description}
                        onChange={(e) => setJiraBugData({ ...jiraBugData, description: e.target.value })}
                        rows="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={jiraLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Test details will be automatically added to the description
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Type
                        </label>
                        <select
                          value={jiraBugData.issueType}
                          onChange={(e) => setJiraBugData({ ...jiraBugData, issueType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          disabled={jiraLoading}
                        >
                          <option value="Bug">Bug</option>
                          <option value="Defect">Defect</option>
                          <option value="Task">Task</option>
                          <option value="Story">Story</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={jiraBugData.priority}
                          onChange={(e) => setJiraBugData({ ...jiraBugData, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          disabled={jiraLoading}
                        >
                          <option value="Highest">Highest</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                          <option value="Lowest">Lowest</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Note:</strong> The bug will include test case details, expected vs actual results,
                        and will be linked to this test execution.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseJiraBugModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={jiraLoading}
                >
                  {jiraResult ? 'Close' : 'Cancel'}
                </button>
                {!jiraResult && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    disabled={jiraLoading}
                  >
                    {jiraLoading ? 'Creating...' : 'Create Bug'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunExecution;
