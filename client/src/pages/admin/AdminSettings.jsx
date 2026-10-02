import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, CheckCircle, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';

export default function AdminSettings() {
  const { token, user } = useAuth();
  const [settings, setSettings] = useState({
    college_name: 'Government Engineering College, West Champaran',
    branch_name: 'Computer Science & Engineering',
    portal_name: 'GECWC Academics',
    tagline: 'One Place for All CSE Academic Notes',
    max_upload_size_mb: '25',
    allowed_file_types: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.png',
    enable_rate_limiting: 'true',
    notice_banner: 'Welcome to GECWC Academics. Semester 1 to 8 CSE study material & question banks are updated for 2026-27.'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(prev => ({ ...prev, ...data.settings }));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchSettings();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      setError('Only platform administrators can change global system settings.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setNotification('Platform settings successfully updated!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Portal & Security Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure institutional metadata, file upload constraints, and academic moderation enforcement.
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Website Institutional Metadata */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Institutional Identity Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">College Name</label>
              <input
                type="text"
                value={settings.college_name}
                onChange={(e) => setSettings({ ...settings, college_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={settings.branch_name}
                onChange={(e) => setSettings({ ...settings, branch_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Portal Name</label>
              <input
                type="text"
                value={settings.portal_name}
                onChange={(e) => setSettings({ ...settings, portal_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Portal Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Announcement Banner Message</label>
              <input
                type="text"
                value={settings.notice_banner}
                onChange={(e) => setSettings({ ...settings, notice_banner: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 2. Upload Rules & Anti-Spam Constraints */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Upload Policy & Anti-Spam Constraints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Upload File Size (MB)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.max_upload_size_mb}
                onChange={(e) => setSettings({ ...settings, max_upload_size_mb: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 25 MB per academic file</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Allowed File Extensions</label>
              <input
                type="text"
                value={settings.allowed_file_types}
                onChange={(e) => setSettings({ ...settings, allowed_file_types: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono focus:outline-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Comma-separated (e.g. .pdf,.doc,.docx,.ppt,.pptx)</span>
            </div>
          </div>
        </div>

        {/* 3. Academic Integrity & Moderation Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Core Academic Policy Rule
          </h3>

          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">Mandatory Peer Review Enforced:</strong>
              <span>
                All uploaded materials are held in Pending Moderation. Direct publishing by students is strictly blocked by the backend API.
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {user?.role === 'admin' ? (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-right">
            Note: Only full administrators can commit changes to platform settings.
          </p>
        )}
      </form>
    </div>
  );
}
