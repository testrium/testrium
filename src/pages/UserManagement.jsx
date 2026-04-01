import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { usersAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, Plus, Trash2, KeyRound, ShieldCheck, User, X, Check, Pencil } from 'lucide-react';
import api from '../services/api';
import usePageTitle from '../hooks/usePageTitle';

export default function UserManagement() {
  usePageTitle('User Management');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add user modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', email: '', password: '', role: 'USER' });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Inline role edit
  const [editingRoleId, setEditingRoleId] = useState(null);

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') { navigate('/dashboard'); return; }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  // ── Add user ──────────────────────────────────────────────────
  function validateAdd() {
    const errs = {};
    if (!addForm.email || !/\S+@\S+\.\S+/.test(addForm.email)) errs.email = 'Valid email required';
    if (!addForm.password || addForm.password.length < 6) errs.password = 'Min 6 characters';
    return errs;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const errs = validateAdd();
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    setAddLoading(true);
    try {
      await api.post('/users', addForm);
      setShowAdd(false);
      setAddForm({ username: '', email: '', password: '', role: 'USER' });
      setAddErrors({});
      await fetchUsers();
    } catch (err) {
      setAddErrors({ general: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setAddLoading(false);
    }
  }

  // ── Role update ───────────────────────────────────────────────
  async function handleRoleChange(userId, newRole) {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setEditingRoleId(null);
    }
  }

  // ── Reset password ────────────────────────────────────────────
  async function handleReset(e) {
    e.preventDefault();
    if (!resetPassword || resetPassword.length < 6) { setResetError('Min 6 characters'); return; }
    setResetLoading(true);
    try {
      await api.put(`/users/${resetTarget.id}/reset-password`, { password: resetPassword });
      setResetTarget(null);
      setResetPassword('');
      setResetError('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  const roleBadge = (role) => role === 'ADMIN'
    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
          >
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800/50 flex-shrink-0">
                              <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">
                                {u.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{u.username}</p>
                              {u.id === currentUser.id && (
                                <span className="text-[10px] text-blue-500 font-medium">You</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          {editingRoleId === u.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                              <button onClick={() => setEditingRoleId(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}>
                                {u.role === 'ADMIN' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                {u.role}
                              </span>
                              {u.id !== currentUser.id && (
                                <button
                                  onClick={() => setEditingRoleId(u.id)}
                                  className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                  title="Edit role"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setResetTarget(u); setResetPassword(''); setResetError(''); }}
                              className="gap-1.5 text-xs h-8"
                              title="Reset password"
                            >
                              <KeyRound className="h-3.5 w-3.5" /> Reset Password
                            </Button>
                            {u.id !== currentUser.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteTarget(u)}
                                className="gap-1.5 text-xs h-8 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Add User Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Add New User</CardTitle>
              <button onClick={() => { setShowAdd(false); setAddErrors({}); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                {addErrors.general && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                    {addErrors.general}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Username <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <Input placeholder="e.g. john" value={addForm.username}
                    onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                  <Input type="email" placeholder="user@company.com" value={addForm.email}
                    onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="h-10" />
                  {addErrors.email && <p className="text-xs text-red-500">{addErrors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <Input type="password" placeholder="Min 6 characters" value={addForm.password}
                    onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className="h-10" />
                  {addErrors.password && <p className="text-xs text-red-500">{addErrors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowAdd(false); setAddErrors({}); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    {addLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-2xl border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Reset Password</CardTitle>
              <button onClick={() => setResetTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Set a new password for <span className="font-semibold text-gray-800 dark:text-gray-200">{resetTarget.username}</span>
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                <Input type="password" placeholder="New password (min 6 chars)" value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)} className="h-10" autoFocus />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setResetTarget(null)}>Cancel</Button>
                  <Button type="submit" disabled={resetLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    {resetLoading ? 'Saving...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-2xl border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Delete User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget.username}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                <Button disabled={deleteLoading} onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
