import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, MinusCircle, Clock,
  Play, ChevronRight, FileText, Save, Calendar, User
} from 'lucide-react';
import { testRunsAPI } from '../services/testRuns';
import { testExecutionsAPI } from '../services/testExecutions';

const TestRunExecution = () => {
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
                  {testRun?.suiteName && <span>• {testRun.suiteName}</span>}
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
        <div className="grid grid-cols-12 gap-6">
          {/* Test Cases List */}
          <div className="col-span-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Test Cases ({executions.length})</h2>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {executions.map((execution, index) => (
                <div
                  key={execution.id}
                  onClick={() => setSelectedExecution(execution)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedExecution?.id === execution.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  } ${getStatusColor(execution.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                        {getStatusIcon(execution.status)}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {execution.testCaseTitle}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
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
                        <button
                          onClick={handleSaveExecution}
                          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save & Continue
                        </button>

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
    </div>
  );
};

export default TestRunExecution;
