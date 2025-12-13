import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { reportsAPI } from '../api/reports';
import { projectsAPI } from '../services/api';
import { testRunsAPI } from '../services/testRuns';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Filter, TrendingUp, Save, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [projects, setProjects] = useState([]);
  const [testRuns, setTestRuns] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTestRun, setSelectedTestRun] = useState('');
  const [testRunReport, setTestRunReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Trend analysis state
  const [trendData, setTrendData] = useState([]);
  const [selectedTrendProject, setSelectedTrendProject] = useState('');
  const [loadingTrend, setLoadingTrend] = useState(false);

  // Template state
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateConfig, setTemplateConfig] = useState({
    includeOverallStats: true,
    includeProjectStats: true,
    includeTestRunDetails: true,
    includeTrendAnalysis: false,
    includeCharts: true,
    exportFormat: 'PDF'
  });

  useEffect(() => {
    loadStats();
    loadProjects();
    loadTemplates();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getOverallStats();
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Load stats error:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (err) {
      console.error('Load projects error:', err);
    }
  };

  const loadTestRuns = async (projectId) => {
    try {
      const response = await testRunsAPI.getAll({ projectId });
      setTestRuns(response.data);
    } catch (err) {
      console.error('Load test runs error:', err);
      setTestRuns([]);
    }
  };

  const loadTestRunReport = async (testRunId) => {
    try {
      setLoadingReport(true);
      const response = await reportsAPI.getTestRunReport(testRunId);
      setTestRunReport(response.data);
      setError('');
    } catch (err) {
      console.error('Load test run report error:', err);
      setError('Failed to load test run report');
      setTestRunReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setSelectedTestRun('');
    setTestRunReport(null);
    if (projectId) {
      loadTestRuns(projectId);
    } else {
      setTestRuns([]);
    }
  };

  const handleTestRunChange = (e) => {
    const testRunId = e.target.value;
    setSelectedTestRun(testRunId);
    if (testRunId) {
      loadTestRunReport(testRunId);
    } else {
      setTestRunReport(null);
    }
  };

  const loadTrendAnalysis = async (projectId) => {
    try {
      setLoadingTrend(true);
      const response = await reportsAPI.getTrendAnalysis(projectId, 10);
      setTrendData(response.data);
      setError('');
    } catch (err) {
      console.error('Load trend analysis error:', err);
      setError('Failed to load trend analysis');
      setTrendData([]);
    } finally {
      setLoadingTrend(false);
    }
  };

  const handleTrendProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedTrendProject(projectId);
    if (projectId) {
      loadTrendAnalysis(projectId);
    } else {
      setTrendData([]);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await reportsAPI.getUserTemplates();
      setTemplates(response.data);
    } catch (err) {
      console.error('Load templates error:', err);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!templateName.trim()) {
        setError('Template name is required');
        return;
      }

      const templateData = {
        name: templateName,
        description: templateDescription,
        projectId: selectedProject || null,
        ...templateConfig
      };

      await reportsAPI.createTemplate(templateData);
      setTemplateName('');
      setTemplateDescription('');
      setTemplateConfig({
        includeOverallStats: true,
        includeProjectStats: true,
        includeTestRunDetails: true,
        includeTrendAnalysis: false,
        includeCharts: true,
        exportFormat: 'PDF'
      });
      setShowTemplateForm(false);
      loadTemplates();
      setError('');
    } catch (err) {
      console.error('Save template error:', err);
      setError('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await reportsAPI.deleteTemplate(templateId);
      loadTemplates();
      setError('');
    } catch (err) {
      console.error('Delete template error:', err);
      setError('Failed to delete template');
    }
  };

  const handleLoadTemplate = async (templateId) => {
    try {
      const response = await reportsAPI.getTemplateById(templateId);
      const template = response.data;

      setTemplateConfig({
        includeOverallStats: template.includeOverallStats,
        includeProjectStats: template.includeProjectStats,
        includeTestRunDetails: template.includeTestRunDetails,
        includeTrendAnalysis: template.includeTrendAnalysis,
        includeCharts: template.includeCharts,
        exportFormat: template.exportFormat
      });

      if (template.projectId) {
        setSelectedProject(template.projectId.toString());
        loadTestRuns(template.projectId);
      }

      setError('');
    } catch (err) {
      console.error('Load template error:', err);
      setError('Failed to load template');
    }
  };

  const getStatusColor = (passRate) => {
    if (passRate >= 80) return 'text-green-600 dark:text-green-400';
    if (passRate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Test Execution Report', 14, 22);

    // Date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // If test run report is selected, export that
    if (testRunReport) {
      doc.setFontSize(14);
      doc.text(`Test Run: ${testRunReport.testRunName}`, 14, 45);
      doc.setFontSize(11);
      doc.text(`Project: ${testRunReport.projectName}`, 14, 52);

      // Summary Stats
      const summaryData = [
        ['Total Test Cases', testRunReport.totalTestCases],
        ['Passed', testRunReport.passedExecutions],
        ['Failed', testRunReport.failedExecutions],
        ['Skipped', testRunReport.skippedExecutions],
        ['Pass Rate', `${testRunReport.passRate.toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value']],
        body: summaryData,
      });

      // Test Cases Details
      const testCaseData = testRunReport.testCases.map(tc => [
        tc.testCaseName,
        tc.priority || 'N/A',
        tc.status,
        tc.executedByName || 'N/A',
        tc.executedAt ? new Date(tc.executedAt).toLocaleString() : 'N/A'
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Test Case', 'Priority', 'Status', 'Executed By', 'Execution Date']],
        body: testCaseData,
      });

      doc.save(`test-run-${testRunReport.testRunName.replace(/\s+/g, '-')}-report.pdf`);
    } else if (stats) {
      // Overall Stats
      doc.setFontSize(14);
      doc.text('Overall Statistics', 14, 45);

      const overallData = [
        ['Total Projects', stats.totalProjects],
        ['Total Test Cases', stats.totalTestCases],
        ['Total Test Runs', stats.totalTestRuns],
        ['Total Executions', stats.totalExecutions],
        ['Passed', stats.passedExecutions],
        ['Failed', stats.failedExecutions],
        ['Skipped', stats.skippedExecutions],
        ['Pass Rate', `${stats.overallPassRate.toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: overallData,
      });

      // Project Stats
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Project-wise Statistics', 14, 22);

      const projectData = stats.projectStats.map(p => [
        p.projectName,
        p.totalTestCases,
        p.totalTestRuns,
        p.totalExecutions,
        p.passedExecutions,
        p.failedExecutions,
        p.skippedExecutions,
        `${p.passRate.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: 28,
        head: [['Project', 'Test Cases', 'Test Runs', 'Executions', 'Passed', 'Failed', 'Skipped', 'Pass Rate']],
        body: projectData,
      });

      doc.save('test-execution-report.pdf');
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // If test run report is selected, export that
    if (testRunReport) {
      // Summary Sheet
      const summaryData = [
        ['Test Run', testRunReport.testRunName],
        ['Project', testRunReport.projectName],
        ['Status', testRunReport.status],
        [''],
        ['Metric', 'Value'],
        ['Total Test Cases', testRunReport.totalTestCases],
        ['Passed', testRunReport.passedExecutions],
        ['Failed', testRunReport.failedExecutions],
        ['Skipped', testRunReport.skippedExecutions],
        ['Pass Rate', `${testRunReport.passRate.toFixed(1)}%`]
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Test Cases Details Sheet
      const testCaseData = [
        ['Test Case', 'Description', 'Priority', 'Status', 'Executed By', 'Execution Date', 'Comments'],
        ...testRunReport.testCases.map(tc => [
          tc.testCaseName,
          tc.testCaseDescription || '',
          tc.priority || 'N/A',
          tc.status,
          tc.executedByName || 'N/A',
          tc.executedAt ? new Date(tc.executedAt).toLocaleString() : 'N/A',
          tc.comments || ''
        ])
      ];

      const ws2 = XLSX.utils.aoa_to_sheet(testCaseData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Test Cases');

      XLSX.writeFile(wb, `test-run-${testRunReport.testRunName.replace(/\s+/g, '-')}-report.xlsx`);
    } else if (stats) {
      // Overall Stats Sheet
      const overallData = [
        ['Metric', 'Value'],
        ['Total Projects', stats.totalProjects],
        ['Total Test Cases', stats.totalTestCases],
        ['Total Test Runs', stats.totalTestRuns],
        ['Total Executions', stats.totalExecutions],
        ['Passed', stats.passedExecutions],
        ['Failed', stats.failedExecutions],
        ['Skipped', stats.skippedExecutions],
        ['Pass Rate', `${stats.overallPassRate.toFixed(1)}%`]
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(overallData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Overall Stats');

      // Project Stats Sheet
      const projectData = [
        ['Project', 'Test Cases', 'Test Runs', 'Executions', 'Passed', 'Failed', 'Skipped', 'Pass Rate'],
        ...stats.projectStats.map(p => [
          p.projectName,
          p.totalTestCases,
          p.totalTestRuns,
          p.totalExecutions,
          p.passedExecutions,
          p.failedExecutions,
          p.skippedExecutions,
          `${p.passRate.toFixed(1)}%`
        ])
      ];

      const ws2 = XLSX.utils.aoa_to_sheet(projectData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Project Stats');

      XLSX.writeFile(wb, 'test-execution-report.xlsx');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading statistics...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const pieData = stats ? [
    { name: 'Passed', value: stats.passedExecutions, color: '#10b981' },
    { name: 'Failed', value: stats.failedExecutions, color: '#ef4444' },
    { name: 'Skipped', value: stats.skippedExecutions, color: '#f59e0b' }
  ] : [];

  const barData = stats ? stats.projectStats.map(p => ({
    name: p.projectName.length > 15 ? p.projectName.substring(0, 15) + '...' : p.projectName,
    Passed: p.passedExecutions,
    Failed: p.failedExecutions,
    Skipped: p.skippedExecutions
  })) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate detailed test execution reports for your projects
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Filter Section - Primary Report Generation */}
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Generate Test Run Report
                </CardTitle>
                {testRunReport && (
                  <div className="flex gap-3">
                    <Button
                      onClick={exportToPDF}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button
                      onClick={exportToExcel}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Select a project and test run to view detailed execution results
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={handleProjectChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a project --</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Test Run *
                  </label>
                  <select
                    value={selectedTestRun}
                    onChange={handleTestRunChange}
                    disabled={!selectedProject}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select a test run --</option>
                    {testRuns.map((testRun) => (
                      <option key={testRun.id} value={testRun.id}>
                        {testRun.name} ({testRun.status})
                      </option>
                    ))}
                  </select>
                  {!selectedProject && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Please select a project first
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Test Run Report */}
          {loadingReport && (
            <div className="mb-8 p-8 text-center text-gray-600 dark:text-gray-400">
              Loading test run report...
            </div>
          )}

          {testRunReport && (
            <>
              <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    {testRunReport.testRunName} - {testRunReport.projectName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Test Cases</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{testRunReport.totalTestCases}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{testRunReport.passedExecutions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{testRunReport.failedExecutions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Skipped</div>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{testRunReport.skippedExecutions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</div>
                      <div className={`text-2xl font-bold ${getStatusColor(testRunReport.passRate)}`}>
                        {testRunReport.passRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Test Case
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Executed By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Execution Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {testRunReport.testCases.map((testCase) => (
                          <tr key={testCase.testCaseId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{testCase.testCaseName}</div>
                              {testCase.testCaseDescription && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">
                                  {testCase.testCaseDescription}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                testCase.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                testCase.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                                testCase.priority === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}>
                                {testCase.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                testCase.status === 'PASS' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                testCase.status === 'FAIL' || testCase.status === 'BLOCKED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              }`}>
                                {testCase.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {testCase.executedByName || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {testCase.executedAt ? new Date(testCase.executedAt).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Trend Analysis Section */}
          {!testRunReport && (
            <>
              <div className="my-12 border-t border-gray-300 dark:border-gray-600"></div>

              <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-900">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Trend Analysis Over Time
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Visualize test execution trends across multiple test runs
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Project
                    </label>
                    <select
                      value={selectedTrendProject}
                      onChange={handleTrendProjectChange}
                      className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Select a project --</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {loadingTrend && (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      Loading trend data...
                    </div>
                  )}

                  {!loadingTrend && trendData.length > 0 && (
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="testRunName"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="passRate"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Pass Rate (%)"
                            dot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="totalTests"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Total Tests"
                            dot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {!loadingTrend && selectedTrendProject && trendData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No trend data available for this project
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Report Templates Section */}
              <Card className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 border-2 border-amber-200 dark:border-amber-900">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Custom Report Templates
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Save and reuse your report configurations
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowTemplateForm(!showTemplateForm)}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      {showTemplateForm ? 'Cancel' : 'New Template'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showTemplateForm && (
                    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Template</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Template Name *
                          </label>
                          <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Weekly Status Report"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={templateDescription}
                            onChange={(e) => setTemplateDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            rows="2"
                            placeholder="Optional description"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={templateConfig.includeOverallStats}
                                onChange={(e) => setTemplateConfig({ ...templateConfig, includeOverallStats: e.target.checked })}
                                className="rounded"
                              />
                              Include Overall Stats
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={templateConfig.includeProjectStats}
                                onChange={(e) => setTemplateConfig({ ...templateConfig, includeProjectStats: e.target.checked })}
                                className="rounded"
                              />
                              Include Project Stats
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={templateConfig.includeTestRunDetails}
                                onChange={(e) => setTemplateConfig({ ...templateConfig, includeTestRunDetails: e.target.checked })}
                                className="rounded"
                              />
                              Include Test Run Details
                            </label>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={templateConfig.includeTrendAnalysis}
                                onChange={(e) => setTemplateConfig({ ...templateConfig, includeTrendAnalysis: e.target.checked })}
                                className="rounded"
                              />
                              Include Trend Analysis
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={templateConfig.includeCharts}
                                onChange={(e) => setTemplateConfig({ ...templateConfig, includeCharts: e.target.checked })}
                                className="rounded"
                              />
                              Include Charts
                            </label>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Export Format
                              </label>
                              <select
                                value={templateConfig.exportFormat}
                                onChange={(e) => setTemplateConfig({ ...templateConfig, exportFormat: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="PDF">PDF</option>
                                <option value="EXCEL">Excel</option>
                                <option value="BOTH">Both</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleSaveTemplate}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        >
                          Save Template
                        </Button>
                      </div>
                    </div>
                  )}

                  {templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                            <div>Format: {template.exportFormat}</div>
                            {template.projectName && <div>Project: {template.projectName}</div>}
                          </div>
                          <Button
                            onClick={() => handleLoadTemplate(template.id)}
                            variant="outline"
                            className="w-full text-sm"
                          >
                            Load Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No templates saved yet. Create your first template above.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="my-12 border-t border-gray-300 dark:border-gray-600"></div>
            </>
          )}

          {stats && !testRunReport && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Overall Statistics
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Summary of all test execution across your projects
                </p>
              </div>

              {/* Overall Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalProjects}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Test Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalTestCases}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Test Runs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalTestRuns}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Overall Pass Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getStatusColor(stats.overallPassRate)}`}>
                      {stats.overallPassRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                      Execution Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                      Project-wise Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Passed" fill="#10b981" />
                        <Bar dataKey="Failed" fill="#ef4444" />
                        <Bar dataKey="Skipped" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Execution Summary */}
              <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Execution Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Executions</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalExecutions}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Passed</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.passedExecutions}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.failedExecutions}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skipped</div>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.skippedExecutions}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {stats.totalExecutions > 0 && (
                    <div className="mt-6">
                      <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div
                          className="bg-green-500 dark:bg-green-600"
                          style={{ width: `${(stats.passedExecutions / stats.totalExecutions) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 dark:bg-red-600"
                          style={{ width: `${(stats.failedExecutions / stats.totalExecutions) * 100}%` }}
                        />
                        <div
                          className="bg-yellow-500 dark:bg-yellow-600"
                          style={{ width: `${(stats.skippedExecutions / stats.totalExecutions) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Passed: {((stats.passedExecutions / stats.totalExecutions) * 100).toFixed(1)}%</span>
                        <span>Failed: {((stats.failedExecutions / stats.totalExecutions) * 100).toFixed(1)}%</span>
                        <span>Skipped: {((stats.skippedExecutions / stats.totalExecutions) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project-wise Statistics */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Project-wise Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Test Cases
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Test Runs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Executions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Pass Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.projectStats.map((project) => (
                          <tr key={project.projectId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {project.projectName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {project.totalTestCases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {project.totalTestRuns}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <div className="font-medium">{project.totalExecutions} total</div>
                                <div className="text-xs">
                                  <span className="text-green-600 dark:text-green-400">{project.passedExecutions}P</span>
                                  {' / '}
                                  <span className="text-red-600 dark:text-red-400">{project.failedExecutions}F</span>
                                  {' / '}
                                  <span className="text-yellow-600 dark:text-yellow-400">{project.skippedExecutions}S</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-semibold ${getStatusColor(project.passRate)}`}>
                                {project.passRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
