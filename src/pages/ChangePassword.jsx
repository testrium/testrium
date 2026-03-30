import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { KeyRound, CheckCircle } from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.currentPassword) errs.currentPassword = 'Current password is required';
    if (!formData.newPassword) errs.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your new password';
    else if (formData.newPassword !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 mx-auto shadow-lg shadow-blue-500/30">
                <KeyRound className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="text-green-600 dark:text-green-400 font-semibold">Password changed successfully!</p>
                  <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.general && (
                    <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800">
                      {errors.general}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
                    <Input
                      name="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-11"
                    />
                    {errors.currentPassword && <p className="text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-11"
                    />
                    {errors.newPassword && <p className="text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-11"
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={loading}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
