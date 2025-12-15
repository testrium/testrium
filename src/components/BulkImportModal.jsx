import React, { useState, useEffect } from 'react';
import { testCasesAPI, projectsAPI, applicationsAPI } from '../services/api';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Upload, Download, CheckCircle2, XCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onImportComplete }) {
  const [step, setStep] = useState(1); // 1: Select Project/App, 2: Upload File, 3: Results
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProjectId) {
      loadApplications(selectedProjectId);
    } else {
      setApplications([]);
      setSelectedApplicationId('');
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    }
  };

  const loadApplications = async (projectId) => {
    try {
      const response = await applicationsAPI.getByProject(projectId);
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(extension)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file');
        e.target.value = '';
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/test-cases/bulk/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TestCase_Import_Template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download template');
      }
    } catch (err) {
      setError('Failed to download template');
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedProjectId || !selectedApplicationId) {
      setError('Please select project, application, and file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', selectedProjectId);
    formData.append('applicationId', selectedApplicationId);

    try {
      const response = await testCasesAPI.bulkImport(formData);
      setResult(response.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import test cases');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedProjectId('');
    setSelectedApplicationId('');
    setFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  const handleFinish = () => {
    handleClose();
    if (onImportComplete) {
      onImportComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Import Test Cases</h2>
          <p className="text-sm text-gray-600 mt-1">Import test cases from Excel or CSV file</p>
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Target</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all ${step >= 2 ? 'bg-blue-600 w-full' : 'bg-blue-600 w-0'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Upload File</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all ${step >= 3 ? 'bg-blue-600 w-full' : 'bg-blue-600 w-0'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Results</span>
            </div>
          </div>

          {/* Step 1: Select Project and Application */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Project *
                </label>
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Application *
                </label>
                <Select
                  value={selectedApplicationId}
                  onChange={(e) => setSelectedApplicationId(e.target.value)}
                  disabled={!selectedProjectId}
                >
                  <option value="">Select Application</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </Select>
                {selectedProjectId && applications.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No applications found. Please create an application first.
                  </p>
                )}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Test cases will be imported into the selected project and application</li>
                        <li>Modules (sections) will be auto-created if they don't exist</li>
                        <li>Duplicate test cases (by title) will be skipped</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Upload File */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {file ? (
                    <>
                      <FileSpreadsheet className="h-12 w-12 text-green-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Excel (.xlsx, .xls) or CSV files
                      </p>
                    </>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expected File Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>Required Columns:</strong> Title, Steps, Expected Result</p>
                    <p><strong>Optional Columns:</strong> ID, Section, Automation Type, Created By, Description, Preconditions, Priority, Type, Is Automated, Is Regression</p>
                    <p className="text-gray-600 text-xs mt-3">
                      Download the template to see the exact format and sample data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Rows</p>
                      <p className="text-3xl font-bold text-gray-900">{result.totalRows}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-green-700">Success</p>
                      <p className="text-3xl font-bold text-green-900">{result.successCount}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                      <p className="text-sm text-amber-700">Skipped</p>
                      <p className="text-3xl font-bold text-amber-900">{result.skippedCount}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                      <p className="text-sm text-red-700">Failed</p>
                      <p className="text-3xl font-bold text-red-900">{result.failureCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900">{result.message}</p>
                  {result.createdModules && result.createdModules.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-blue-900">Created Modules:</p>
                      <p className="text-sm text-blue-800">{result.createdModules.join(', ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {result.errors && result.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-900">Errors ({result.errors.length})</CardTitle>
                    <CardDescription>Review these issues for failed/skipped rows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Row</th>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {result.errors.map((err, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{err.rowNumber}</td>
                              <td className="px-4 py-2">{err.testCaseTitle || '-'}</td>
                              <td className="px-4 py-2 text-red-600">{err.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            {step === 3 ? 'Close' : 'Cancel'}
          </Button>

          <div className="flex gap-2">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            {step === 1 && (
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedProjectId || !selectedApplicationId}
              >
                Next
              </Button>
            )}
            {step === 2 && (
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleFinish}>
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
