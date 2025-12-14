import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import TestCases from './pages/TestCases';
import Applications from './pages/Applications';
import TestModules from './pages/TestModules';
import TestCaseDetails from './pages/TestCaseDetails';
import TestRuns from './pages/TestRuns';
import TestRunExecution from './pages/TestRunExecution';
import TestData from './pages/TestData';
import Reports from './pages/Reports';
import Metrics from './pages/Metrics';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-cases"
            element={
              <ProtectedRoute>
                <TestCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-modules"
            element={
              <ProtectedRoute>
                <TestModules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-cases/:id"
            element={
              <ProtectedRoute>
                <TestCaseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-runs"
            element={
              <ProtectedRoute>
                <TestRuns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-runs/:id"
            element={
              <ProtectedRoute>
                <TestRunExecution />
              </ProtectedRoute>
            }
          />
          <Route path="/test-data" element={<ProtectedRoute><TestData /></ProtectedRoute>} />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metrics"
            element={
              <ProtectedRoute>
                <Metrics />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;