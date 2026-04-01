import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, Send, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { settingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import usePageTitle from '../hooks/usePageTitle';

export default function Settings() {
  usePageTitle('Settings');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    host: '', port: '587', username: '', password: '', from: '', tls: 'true'
  });
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type: 'success'|'error', text }
  const [testMsg, setTestMsg] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/dashboard'); return; }
    settingsAPI.getEmail().then(res => {
      const d = res.data;
      setForm(f => ({
        ...f,
        host: d.host || '',
        port: d.port || '587',
        username: d.username || '',
        from: d.from || '',
        tls: d.tls || 'true',
        password: ''
      }));
      setPasswordSaved(d.passwordSaved === 'true');
      setTestEmail(d.username || '');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await settingsAPI.saveEmail(form);
      setSaveMsg({ type: 'success', text: 'Settings saved successfully' });
      setPasswordSaved(true);
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await settingsAPI.testEmail(testEmail.trim());
      setTestMsg({ type: 'success', text: res.data.message });
    } catch (err) {
      setTestMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send test email' });
    } finally {
      setTesting(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <Input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">System configuration — Admin only</p>
        </div>

        {/* Email / SMTP */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Email (SMTP)</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure outgoing email for test run notifications. Leave blank to disable email.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {field('SMTP Host', 'host', 'text', 'smtp.gmail.com')}
              {field('Port', 'port', 'number', '587')}
            </div>

            {field('Username / Email', 'username', 'email', 'you@example.com')}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password {passwordSaved && <span className="text-green-600 text-xs ml-1">(saved)</span>}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={passwordSaved ? 'Leave blank to keep existing password' : 'App password'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {field('From Address', 'from', 'email', 'noreply@example.com')}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TLS</label>
              <select
                value={form.tls}
                onChange={e => setForm(f => ({ ...f, tls: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Enabled (STARTTLS)</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            {saveMsg && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                saveMsg.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {saveMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {saveMsg.text}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>

          {/* Test email */}
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Send Test Email</p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1"
              />
              <Button
                onClick={handleTest}
                disabled={testing || !testEmail.trim()}
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                {testing ? 'Sending…' : 'Send'}
              </Button>
            </div>
            {testMsg && (
              <div className={`flex items-center gap-2 text-sm mt-2 ${
                testMsg.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {testMsg.text}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
