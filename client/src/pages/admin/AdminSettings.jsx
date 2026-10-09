import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, CheckCircle, AlertTriangle, ShieldCheck, FileCheck, Database, Download, Upload, Cloud, RefreshCw } from 'lucide-react';

export default function AdminSettings() {
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);
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

  // Database Backup & Cloud Sync state
  const [dbStatus, setDbStatus] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/admin/database/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error('Failed to load database status:', e);
    }
  };

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
    if (token) {
      fetchSettings();
      fetchDbStatus();
    }
  }, [token]);

  const handleDownloadBackup = async () => {
    try {
      setDbLoading(true);
      const res = await fetch('/api/admin/database/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate backup');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gecwc-academics-backup-${new Date().toISOString().slice(0, 10)}.sqlite`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setNotification('✅ Database backup (.sqlite) downloaded successfully!');
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`⚠️ RESTORE DATABASE WARNING:\n\nAre you sure you want to restore "${file.name}"?\nThis will overwrite current users and notes with the backup data.\n\nDo you want to proceed?`)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setRestoring(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('database_file', file);

      const res = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Restore failed');

      setNotification(`🎉 ${data.message}`);
      fetchDbStatus();
      setTimeout(() => setNotification(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/database/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setNotification('✅ ' + data.message);
      fetchDbStatus();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

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

        {/* 4. Zero Data Loss - Database Backup & Cloud Sync */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Database Safety & Cloud Backup (Zero Data Loss)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Protect all student registrations, approved notes, and academic syllabi from accidental loss across deployments.
              </p>
            </div>

            {dbStatus && (
              <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg shrink-0">
                Live Data: {dbStatus.userCount || 0} Users • {dbStatus.noteCount || 0} Notes
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  1-Click Database Download
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Download a snapshot of the live SQLite database (.sqlite) containing all active user accounts, syllabi, and note records.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={dbLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{dbLoading ? 'Generating Snapshot...' : 'Download Database (.sqlite)'}</span>
              </button>
            </div>

            {/* Restore Database */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-600" />
                  Restore / Upload Database
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Upload a previously saved .sqlite file to instantly restore all student accounts, notes, and records without server restarts.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".sqlite,.db"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={restoring}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{restoring ? 'Restoring Database...' : 'Upload & Restore (.sqlite)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cloud Sync Telemetry Banner */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Cloud className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-blue-950 font-bold text-xs">
                  Automated 24/7 Cloud Sync:
                </strong>
                <span className="text-blue-800 text-[11px] leading-relaxed">
                  {dbStatus?.syncInfo?.configured
                    ? `Active! Last synced: ${dbStatus.syncInfo.lastSyncTime ? new Date(dbStatus.syncInfo.lastSyncTime).toLocaleTimeString() : 'Ready'}`
                    : 'To enable automatic zero-touch cloud backups on Render, add GITHUB_BACKUP_TOKEN in your Render Environment Variables.'}
                </span>
              </div>
            </div>

            {dbStatus?.syncInfo?.configured && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
              </button>
            )}
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
