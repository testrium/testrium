import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { metricsAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FolderKanban, FileText, Play, Users, TrendingUp, CheckCircle2,
  XCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const STATUS_COLORS = {
  COMPLETED:   '#22c55e',
  FAILED:      '#ef4444',
  IN_PROGRESS: '#f59e0b',
  NOT_STARTED: '#94a3b8',
};

const PRIORITY_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#7f1d1d'];

const statusLabel = (s) => ({
  COMPLETED: 'Completed', FAILED: 'Failed',
  IN_PROGRESS: 'In Progress', NOT_STARTED: 'Not Started'
}[s] || s);

export default function Overview() {
  usePageTitle('Overview');
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    metricsAPI.getOverview()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load overview data'))
      .finally(() => setLoading(false));
  }, []);

  const runStatusData = data ? [
    { name: 'Completed',   value: data.runsPassed,     color: STATUS_COLORS.COMPLETED },
    { name: 'Failed',      value: data.runsFailed,     color: STATUS_COLORS.FAILED },
    { name: 'In Progress', value: data.runsInProgress, color: STATUS_COLORS.IN_PROGRESS },
    { name: 'Not Started', value: data.runsNotStarted, color: STATUS_COLORS.NOT_STARTED },
  ].filter(d => d.value > 0) : [];

  const priorityData = data ? [
    { name: 'Low',      value: data.priorityLow,      fill: PRIORITY_COLORS[0] },
    { name: 'Medium',   value: data.priorityMedium,   fill: PRIORITY_COLORS[1] },
    { name: 'High',     value: data.priorityHigh,     fill: PRIORITY_COLORS[2] },
    { name: 'Critical', value: data.priorityCritical, fill: PRIORITY_COLORS[3] },
  ].filter(d => d.value > 0) : [];

  const automationData = data ? [
    { name: 'Automated', value: data.automatedCases, fill: '#6366f1' },
    { name: 'Manual',    value: data.manualCases,    fill: '#e2e8f0' },
  ].filter(d => d.value > 0) : [];

  const projectBarData = data?.projects?.slice(0, 8).map(p => ({
    name: p.projectName.length > 14 ? p.projectName.slice(0, 14) + '…' : p.projectName,
    fullName: p.projectName,
    'Test Cases': p.testCaseCount,
    'Test Runs':  p.testRunCount,
  })) || [];

  const kpis = data ? [
    { label: 'Projects',    value: data.totalProjects,  icon: FolderKanban, gradient: 'from-indigo-500 to-purple-600',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Test Cases',  value: data.totalTestCases, icon: FileText,     gradient: 'from-blue-500 to-cyan-600',       bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Test Runs',   value: data.totalTestRuns,  icon: Play,         gradient: 'from-emerald-500 to-teal-600',    bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Team Members',value: data.totalUsers,     icon: Users,        gradient: 'from-amber-500 to-orange-600',    bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Overall Pass Rate', value: data.overallPassRate + '%', icon: TrendingUp, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ] : [];

  const statusIcon = (s) => {
    if (s === 'COMPLETED')   return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (s === 'FAILED')      return <XCircle className="h-4 w-4 text-red-500" />;
    if (s === 'IN_PROGRESS') return <Clock className="h-4 w-4 text-amber-500" />;
    return <Clock className="h-4 w-4 text-slate-400" />;
  };

  const statusBadge = (s) => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    if (s === 'COMPLETED')   return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    if (s === 'FAILED')      return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    if (s === 'IN_PROGRESS') return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
    return `${base} bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cross-Project Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Aggregated metrics across all projects</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {kpis.map(({ label, value, icon: Icon, gradient, bg }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 bg-gradient-to-br ${gradient} bg-clip-text`} style={{ color: 'transparent', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Test Run Status Pie */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Test Run Status</h3>
                {runStatusData.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No test runs yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={runStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {runStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Priority Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
                {priorityData.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No test cases yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Automation Coverage */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Automation Coverage</h3>
                {automationData.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No test cases yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={automationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                          {automationData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-indigo-600">{data.automatedCases}</p>
                        <p className="text-xs text-gray-500">Automated</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-500">{data.manualCases}</p>
                        <p className="text-xs text-gray-500">Manual</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Per-Project Bar Chart */}
            {projectBarData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Per-Project Comparison</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={projectBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip formatter={(val, name, props) => [val, name]} labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label} />
                    <Legend />
                    <Bar dataKey="Test Cases" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Test Runs"  fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Per-Project Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Project Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['Project', 'Status', 'Test Cases', 'Test Runs', 'Passed', 'Failed', 'In Progress', 'Pass Rate'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {data.projects.map(p => (
                      <tr key={p.projectId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.projectName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.projectStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {p.projectStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.testCaseCount}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.testRunCount}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{p.passedRuns}</td>
                        <td className="px-4 py-3 text-red-500 font-medium">{p.failedRuns}</td>
                        <td className="px-4 py-3 text-amber-500 font-medium">{p.inProgressRuns}</td>
                        <td className="px-4 py-3">
                          {p.testRunCount > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 w-16">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${p.passRate}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p.passRate}%</span>
                            </div>
                          ) : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Test Runs */}
            {data.recentRuns.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Test Runs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        {['Run Name', 'Project', 'Status', 'Assigned To', 'Created'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {data.recentRuns.map(r => (
                        <tr key={r.runId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/test-runs/${r.runId}`)}>
                          <td className="px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400 hover:underline">{r.runName}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.projectName}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {statusIcon(r.status)}
                              <span className={statusBadge(r.status)}>{statusLabel(r.status)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.assignedTo || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
