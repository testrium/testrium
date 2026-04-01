import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Pencil, Check, X } from 'lucide-react';
import { usersAPI, projectMembersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import usePageTitle from '../hooks/usePageTitle';

export default function Profile() {
  usePageTitle('My Profile');
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayRole, setDisplayRole] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI.getMe().then(res => {
      setProfile(res.data);
      setNameInput(res.data.username);
      resolveDisplayRole(res.data);
    }).catch(() => {
      setProfile(user);
      setNameInput(user?.username || '');
      resolveDisplayRole(user);
    });
  }, []);

  const resolveDisplayRole = async (profileData) => {
    if (!profileData) return;
    if (profileData.role === 'ADMIN') { setDisplayRole('Administrator'); return; }
    try {
      const res = await projectMembersAPI.getUserProjects(profileData.id);
      const memberships = res.data;
      if (memberships.some(m => m.role === 'LEAD')) {
        setDisplayRole('Lead');
      } else {
        setDisplayRole('Member');
      }
    } catch {
      setDisplayRole('Member');
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === profile.username) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await usersAPI.updateMe({ username: nameInput.trim() });
      setProfile(res.data);
      updateUser({ username: res.data.username });
      setEditingName(false);
      setSuccessMsg('Username updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(profile.username);
    setEditingName(false);
    setError('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const roleColor = displayRole === 'Administrator'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    : displayRole === 'Lead'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <User className="h-8 w-8" />
            My Profile
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage your account details
          </p>
        </div>

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          {/* Avatar header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
              <span className="text-white font-bold text-3xl">
                {profile?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-bold text-xl">{profile?.username}</p>
              <p className="text-blue-100 text-sm">{profile?.email}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">

            {/* Username */}
            <div className="flex items-center justify-between px-8 py-5">
              <div className="flex items-center gap-3 min-w-0">
                <User className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Username</p>
                  {editingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                        className="h-8 text-sm w-48"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 text-green-600"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 text-gray-500"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.username}</p>
                  )}
                </div>
              </div>
              {!editingName && (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit username"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 px-8 py-5">
              <Mail className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{profile?.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 px-8 py-5">
              <Shield className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Role</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColor}`}>
                  {displayRole || '…'}
                </span>
              </div>
            </div>

            {/* Member since */}
            <div className="flex items-center gap-3 px-8 py-5">
              <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Member since</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(profile?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-8 py-5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/change-password'}
              className="text-sm"
            >
              Change Password
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
