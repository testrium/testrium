import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, metricsAPI, projectMembersAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import {
  BarChart3, TrendingUp, Target, CheckCircle2, AlertCircle,
  Activity, FileText, Layers, Box
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Metrics() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectMetrics, setProjectMetrics] = useState(null);
  const [applicationMetrics, setApplicationMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMetrics();
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      let userProjects = [];
      if (user?.role === 'ADMIN') {
        const projectsRes = await projectsAPI.getAll();
        userProjects = projectsRes.data;
      } else if (user?.id) {
        const membershipResponse = await projectMembersAPI.getUserProjects(user.id);
        const memberships = membershipResponse.data;
        const projectIds = [...new Set(memberships.map(m => m.projectId))];
        const allProjectsResponse = await projectsAPI.getAll();
        userProjects = allProjectsResponse.data.filter(p => projectIds.includes(p.id));
      }

      setProjects(userProjects);

      if (userProjects.length > 0) {
        setSelectedProjectId(userProjects[0].id.toString());
      }
    } catch (err) {
      setError('Failed to load projects');
      console.error('Load projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectMetricsRes, appMetricsRes] = await Promise.all([
        metricsAPI.getProjectMetrics(selectedProjectId),
        metricsAPI.getAllApplicationMetricsForProject(selectedProjectId)
      ]);

      setProjectMetrics(projectMetricsRes.data);
      setApplicationMetrics(appMetricsRes.data);
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Load metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card className={`border-0 shadow-md bg-gradient-to-br ${color}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-sm mt-1 opacity-70">{subtitle}</p>}
          </div>
          {Icon && <Icon className="h-10 w-10 opacity-30" />}
        </div>
      </CardContent>
    </Card>
  );

  const ApplicationMetricsCard = ({ metrics }) => (
    <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg">{metrics.entityName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Tests */}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium">Total Tests</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {metrics.totalTestCases}
            </span>
          </div>

          {/* Automation */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Automation Coverage</span>
              <span className="font-semibold">{metrics.automationPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${metrics.automationPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>🤖 Automated: {metrics.automatedTestCases}</span>
              <span>👤 Manual: {metrics.manualTestCases}</span>
            </div>
          </div>

          {/* Regression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Regression Coverage</span>
              <span className="font-semibold">{metrics.regressionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${metrics.regressionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>🔄 Regression: {metrics.regressionTestCases}</span>
              <span>Regular: {metrics.nonRegressionTestCases}</span>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Low</p>
              <p className="text-sm font-bold">{metrics.lowPriority}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Medium</p>
              <p className="text-sm font-bold">{metrics.mediumPriority}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">High</p>
              <p className="text-sm font-bold">{metrics.highPriority}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{metrics.criticalPriority}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation user={user} onLogout={logout} />

      <main className="flex-1 p-4 md:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Test Metrics Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive overview of test automation and regression coverage
              </p>
            </div>
          </div>

          {/* Project Selector */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Select Project</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="max-w-md"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : projectMetrics ? (
            <>
              {/* Project-level Metrics Summary */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Project Overview
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Test Cases"
                    value={projectMetrics.totalTestCases}
                    icon={FileText}
                    color="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-900 dark:text-blue-100"
                  />
                  <MetricCard
                    title="Automation Coverage"
                    value={`${projectMetrics.automationPercentage}%`}
                    subtitle={`${projectMetrics.automatedTestCases} automated`}
                    icon={Activity}
                    color="from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-900 dark:text-green-100"
                  />
                  <MetricCard
                    title="Regression Coverage"
                    value={`${projectMetrics.regressionPercentage}%`}
                    subtitle={`${projectMetrics.regressionTestCases} regression tests`}
                    icon={TrendingUp}
                    color="from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-900 dark:text-orange-100"
                  />
                  <MetricCard
                    title="Active Tests"
                    value={projectMetrics.activeTestCases}
                    subtitle={`${projectMetrics.draftTestCases} draft, ${projectMetrics.deprecatedTestCases} deprecated`}
                    icon={CheckCircle2}
                    color="from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-900 dark:text-purple-100"
                  />
                </div>
              </div>

              {/* Application-level Metrics - Table View */}
              {applicationMetrics.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Application Metrics
                  </h3>

                  {/* Metrics Table */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Application</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold">Total Test Cases</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold">Regression</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold">Automated</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold">Manual</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold">Automated %</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold">Manual %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {applicationMetrics.map((metrics, index) => {
                              const manualTests = metrics.totalTestCases - metrics.automatedTestCases;
                              const manualPercentage = metrics.totalTestCases > 0
                                ? Math.round((manualTests * 100.0 / metrics.totalTestCases) * 100.0) / 100.0
                                : 0;

                              return (
                                <tr
                                  key={metrics.entityId}
                                  className={`${
                                    index % 2 === 0
                                      ? 'bg-white dark:bg-gray-800'
                                      : 'bg-gray-50 dark:bg-gray-800/50'
                                  } hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors`}
                                >
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                    {metrics.entityName}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {metrics.totalTestCases}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    {metrics.regressionTestCases}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                    {metrics.automatedTestCases}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                                    {manualTests}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-bold text-green-700 dark:text-green-300">
                                    {metrics.automationPercentage}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-bold text-purple-700 dark:text-purple-300">
                                    {manualPercentage}
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Total Row */}
                            {applicationMetrics.length > 1 && (
                              <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 font-bold">
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                  Total
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-blue-700 dark:text-blue-300">
                                  {applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0)}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-orange-700 dark:text-orange-300">
                                  {applicationMetrics.reduce((sum, m) => sum + m.regressionTestCases, 0)}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-green-700 dark:text-green-300">
                                  {applicationMetrics.reduce((sum, m) => sum + m.automatedTestCases, 0)}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-purple-700 dark:text-purple-300">
                                  {applicationMetrics.reduce((sum, m) => sum + (m.totalTestCases - m.automatedTestCases), 0)}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-green-800 dark:text-green-200">
                                  {(() => {
                                    const totalTests = applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0);
                                    const totalAutomated = applicationMetrics.reduce((sum, m) => sum + m.automatedTestCases, 0);
                                    return totalTests > 0
                                      ? Math.round((totalAutomated * 100.0 / totalTests) * 100.0) / 100.0
                                      : 0;
                                  })()}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-purple-800 dark:text-purple-200">
                                  {(() => {
                                    const totalTests = applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0);
                                    const totalManual = applicationMetrics.reduce((sum, m) => sum + (m.totalTestCases - m.automatedTestCases), 0);
                                    return totalTests > 0
                                      ? Math.round((totalManual * 100.0 / totalTests) * 100.0) / 100.0
                                      : 0;
                                  })()}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Graphical Views */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    {/* Bar Chart - Automation Coverage Overview */}
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Automation Coverage Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={[
                              ...applicationMetrics.map(m => ({
                                name: m.entityName,
                                Total: m.totalTestCases,
                                Automated: m.automatedTestCases,
                                Manual: m.totalTestCases - m.automatedTestCases
                              })),
                              {
                                name: 'Total',
                                Total: applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0),
                                Automated: applicationMetrics.reduce((sum, m) => sum + m.automatedTestCases, 0),
                                Manual: applicationMetrics.reduce((sum, m) => sum + (m.totalTestCases - m.automatedTestCases), 0)
                              }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                            <XAxis
                              dataKey="name"
                              className="text-xs fill-gray-600 dark:fill-gray-400"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px' }}
                              iconType="rect"
                            />
                            <Bar dataKey="Total" fill="#3b82f6" name="Total" />
                            <Bar dataKey="Automated" fill="#61BF3D" name="Automated" />
                            <Bar dataKey="Manual" fill="#9ca3af" name="Manual" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Pie Chart - Overall Test Distribution */}
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Test Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: 'Automated',
                                  value: applicationMetrics.reduce((sum, m) => sum + m.automatedTestCases, 0),
                                  percentage: (() => {
                                    const total = applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0);
                                    const automated = applicationMetrics.reduce((sum, m) => sum + m.automatedTestCases, 0);
                                    return total > 0 ? Math.round((automated * 100.0 / total)) : 0;
                                  })()
                                },
                                {
                                  name: 'Manual',
                                  value: applicationMetrics.reduce((sum, m) => sum + (m.totalTestCases - m.automatedTestCases), 0),
                                  percentage: (() => {
                                    const total = applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0);
                                    const manual = applicationMetrics.reduce((sum, m) => sum + (m.totalTestCases - m.automatedTestCases), 0);
                                    return total > 0 ? Math.round((manual * 100.0 / total)) : 0;
                                  })()
                                }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percentage, value }) => `${percentage}%`}
                              labelLine={false}
                            >
                              <Cell fill="#61BF3D" />
                              <Cell fill="#9ca3af" />
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                              formatter={(value, name) => {
                                const total = applicationMetrics.reduce((sum, m) => sum + m.totalTestCases, 0);
                                const percentage = total > 0 ? Math.round((value * 100.0 / total)) : 0;
                                return [`${value} (${percentage}%)`, name];
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Card View (Optional - can be toggled) */}
                  <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {applicationMetrics.map(metrics => (
                      <ApplicationMetricsCard key={metrics.entityId} metrics={metrics} />
                    ))}
                  </div>
                </div>
              )}

              {applicationMetrics.length === 0 && (
                <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Box className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      No applications found
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 max-w-sm">
                      Create applications and add test cases to see metrics
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select a project to view metrics
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
