import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import {
  BookOpen, Package, Layers, FileText, Play, BarChart3,
  Database, KeyRound, ChevronDown, ChevronRight, ArrowRight,
  Users, Settings, Zap, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

const sections = [
  {
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    title: 'Getting Started',
    description: 'How to set up your first project and start testing',
    steps: [
      { title: 'Create an Application', desc: 'Go to Applications and create your app (e.g. "My Web App"). Applications group all projects under one product.' },
      { title: 'Create a Project', desc: 'From the Dashboard, click "New Project". Select your application, give it a name and description.' },
      { title: 'Add Team Members', desc: 'Open your project → Members tab → invite users by email with LEAD or MEMBER role.' },
      { title: 'Create Test Modules', desc: 'Go to Modules and create logical groups (e.g. "Login", "Checkout"). Modules help organize test cases by feature area.' },
      { title: 'Add Test Cases', desc: 'Go to Test Cases → New Test Case. Fill in title, steps, expected results, priority and type. Assign to a module.' },
      { title: 'Create a Test Run', desc: 'Go to Test Runs → New Test Run. Select a project and choose which test cases to include.' },
      { title: 'Execute & Record Results', desc: 'Open a test run and mark each test as Pass, Fail, Blocked or Skipped. Add comments for failures.' },
      { title: 'Generate Reports', desc: 'Go to Reports → select a project and date range → export as PDF or Excel.' },
    ]
  },
  {
    icon: Package,
    color: 'from-purple-500 to-pink-500',
    title: 'Applications',
    description: 'Top-level container for your products',
    items: [
      { label: 'What is an Application?', text: 'An Application represents a product or system you are testing (e.g. "Mobile App", "API Gateway"). Projects are created inside applications.' },
      { label: 'Creating an Application', text: 'Go to Applications → click "New Application". Enter a name and optional description. Only Admins can create applications.' },
      { label: 'Managing Applications', text: 'You can edit or delete applications from the Applications page. Deleting an application removes all associated projects and data.' },
    ]
  },
  {
    icon: Layers,
    color: 'from-indigo-500 to-purple-500',
    title: 'Test Modules',
    description: 'Organize test cases by feature or area',
    items: [
      { label: 'What is a Module?', text: 'A Module is a logical grouping of test cases (e.g. "Authentication", "Payment Flow", "Admin Panel"). Every test case belongs to a module.' },
      { label: 'Creating Modules', text: 'Go to Modules → New Module. Select the project, enter a name and description. You can also filter modules by project.' },
      { label: 'Best Practice', text: 'Create one module per major feature area. Avoid making modules too broad (e.g. "All Tests") or too narrow (e.g. one module per test case).' },
    ]
  },
  {
    icon: FileText,
    color: 'from-blue-500 to-indigo-500',
    title: 'Test Cases',
    description: 'Create, organize and bulk import test cases',
    items: [
      { label: 'Creating a Test Case', text: 'Test Cases → New Test Case. Fill in: Title, Module, Priority (Low/Medium/High/Critical), Type (Manual/Automated), Steps, and Expected Result.' },
      { label: 'Test Case Fields', text: 'Title: short descriptive name. Steps: numbered instructions for the tester. Expected Result: what should happen. Status reflects the latest execution result.' },
      { label: 'Bulk Import via Excel/CSV', text: 'Test Cases → Import. Download the template, fill it in, then upload. Columns: title, module, priority, type, steps, expected_result.' },
      { label: 'Filtering & Search', text: 'Filter test cases by project, module, priority or type using the filter bar at the top of the Test Cases page.' },
      { label: 'Test Data', text: 'Each test case can have associated test data (parameters, values). Go to Test Case Details → Test Data tab to add key-value data for different environments.' },
    ]
  },
  {
    icon: Play,
    color: 'from-green-500 to-teal-500',
    title: 'Test Runs',
    description: 'Execute tests and track results',
    items: [
      { label: 'Creating a Test Run', text: 'Test Runs → New Test Run. Enter a name, select the project, then choose which test cases to include. You can select all or filter by module.' },
      { label: 'Executing Tests', text: 'Open a test run → click Execute. For each test case, mark the result: Pass ✅, Fail ❌, Blocked 🚫, or Skipped ⏭. Add a comment explaining failures.' },
      { label: 'Bulk Status Update', text: 'Select multiple test executions using checkboxes, then click "Update Status" to set the same result for all selected tests at once.' },
      { label: 'JIRA Integration', text: 'On a failed test execution, click "File Bug in JIRA" to create a JIRA issue directly. Requires JIRA to be configured in Project Settings.' },
      { label: 'Test Run Status', text: 'A test run is considered complete when all test cases have a result. Progress is shown as a percentage bar on the Test Runs list.' },
    ]
  },
  {
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
    title: 'Reports & Metrics',
    description: 'Analyze results and track quality trends',
    items: [
      { label: 'Generating Reports', text: 'Reports → select a project → choose a test run or date range → Export as PDF (with charts) or Excel (raw data).' },
      { label: 'Metrics Dashboard', text: 'The Metrics page shows pass rate trends, test case counts by module, and execution history across all projects you have access to.' },
      { label: 'Dashboard Overview', text: 'The Dashboard shows a summary of all your projects: total test cases, last run results, and recent activity.' },
    ]
  },
  {
    icon: Database,
    color: 'from-teal-500 to-cyan-500',
    title: 'Test Data Management',
    description: 'Store and reuse test parameters per environment',
    items: [
      { label: 'What is Test Data?', text: 'Test Data stores environment-specific parameters for your test cases (e.g. base URLs, usernames, API keys) in DEV, QA, STAGING, or PROD environments.' },
      { label: 'Data Formats', text: 'Data can be stored as KEY_VALUE pairs, JSON, CSV, or XML. Choose the format that best matches how your automation framework will consume it.' },
      { label: 'Automation API', text: 'Your automation scripts can fetch test data via the REST API: GET /api/test-data/{id}. Use the API token from your profile for authentication.' },
    ]
  },
  {
    icon: Users,
    color: 'from-rose-500 to-pink-500',
    title: 'Users & Roles',
    description: 'Manage team access and permissions',
    items: [
      { label: 'Roles Overview', text: 'ADMIN: full access to all projects, users, and settings. LEAD: can manage test cases and runs within assigned projects. MEMBER: can execute tests and view results.' },
      { label: 'Inviting Users', text: 'Admins can invite users from the Admin panel. Users receive a registration link. Project leads can assign members to their specific projects.' },
      { label: 'Changing Password', text: 'Click your username in the top-right corner → Change Password. Enter your current password and set a new one (minimum 6 characters).' },
    ]
  },
  {
    icon: Settings,
    color: 'from-gray-500 to-slate-600',
    title: 'JIRA Integration',
    description: 'File bugs directly from failed test executions',
    items: [
      { label: 'Setting Up JIRA', text: 'Go to Project Settings → JIRA Configuration. Enter your JIRA base URL, project key, your email, and an API token generated from your Atlassian account.' },
      { label: 'API Token', text: 'Generate a JIRA API token at id.atlassian.com → Security → API tokens. The token is stored encrypted in Testrium.' },
      { label: 'Filing a Bug', text: 'On any failed test execution, click "Create JIRA Issue". A JIRA bug is created with the test case name, steps, and expected result pre-filled.' },
    ]
  },
];

function Section({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">{section.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
        </div>
        {open ? <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" /> : <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-4">
          {section.steps && (
            <ol className="space-y-3">
              {section.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${section.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{step.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {section.items && (
            <dl className="space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <dt className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.label}</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.text}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

import usePageTitle from '../hooks/usePageTitle';

export default function Help() {
  usePageTitle('Help');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & User Guide</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-13">
            Everything you need to know about using Testrium. Click any section to expand.
          </p>
        </div>

        {/* Quick tip */}
        <div className="flex gap-3 p-4 mb-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">New here?</span> Start with the <strong>Getting Started</strong> section below — it walks you through the full setup in 8 steps.
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 p-5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Still need help?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Check the full documentation or open an issue on GitHub.</p>
            </div>
          </div>
          <a
            href="https://github.com/testrium/testrium/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            Open an Issue <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
