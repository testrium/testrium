import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testCasesAPI } from '../services/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Edit, Trash2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function TestCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTestCase();
  }, [id]);

  const loadTestCase = async () => {
    try {
      setLoading(true);
      const response = await testCasesAPI.getById(id);
      setTestCase(response.data);
    } catch (err) {
      setError('Failed to load test case details');
      console.error('Load test case error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;

    try {
      await testCasesAPI.delete(id);
      navigate('/test-cases');
    } catch (err) {
      setError('Failed to delete test case');
      console.error('Delete error:', err);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
      CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusIcon = (status) => {
    const icons = {
      ACTIVE: <CheckCircle2 className="h-5 w-5" />,
      DEPRECATED: <XCircle className="h-5 w-5" />,
      DRAFT: <Clock className="h-5 w-5" />
    };
    return icons[status] || icons.DRAFT;
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      DEPRECATED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      DRAFT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
    };
    return colors[status] || colors.DRAFT;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
        <Navigation />
        <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !testCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
        <Navigation />
        <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-md border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error || 'Test case not found'}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/test-cases')}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Test Cases
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/test-cases?edit=${id}`)}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Title and Status */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-3">{testCase.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(testCase.priority)}`}>
                      {testCase.priority}
                    </span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-2 ${getStatusColor(testCase.status)}`}>
                      {getStatusIcon(testCase.status)}
                      {testCase.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</p>
                  <p className="text-base text-gray-900 dark:text-white">{testCase.projectName}</p>
                </div>
                {testCase.moduleName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Test Module</p>
                    <p className="text-base text-gray-900 dark:text-white">{testCase.moduleName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-base text-gray-900 dark:text-white">{testCase.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
                  <p className="text-base text-gray-900 dark:text-white">{testCase.createdByUsername}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {testCase.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Steps */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Test Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {testCase.steps || 'No test steps provided'}
              </p>
            </CardContent>
          </Card>

          {/* Expected Result */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Expected Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {testCase.expectedResult || 'No expected result provided'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
