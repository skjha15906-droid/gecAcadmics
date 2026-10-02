import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  Download,
  Eye,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Check,
  X,
  History,
  MessageSquare
} from 'lucide-react';
import { formatBytes } from '../../components/NoteCard';

export default function AdminDashboard({
  setActiveAdminTab,
  onOpenSubmissionReview
}) {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  const handleQuickApprove = async (noteId, noteTitle) => {
    try {
      const res = await fetch(`/api/admin/submissions/${noteId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMsg(`Approved note: "${noteTitle}"`);
        loadDashboard();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (e) {
      alert('Error approving note: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading administrator dashboard...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const pendingQueue = data?.pendingQueue || [];
  const recentLogs = data?.recentLogs || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            OPERATIONS HUB
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Academic Moderation & College Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome, <strong className="text-indigo-900 font-bold">{user.name}</strong> • Lead Developer & Administrator (B.Tech 2025–2029 CSE) • Government Engineering College, West Champaran
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {metrics.unreadMessages > 0 && (
            <button
              onClick={() => setActiveAdminTab('messages')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>{metrics.unreadMessages} New Inquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {metrics.pendingNotes > 0 && (
            <button
              onClick={() => setActiveAdminTab('submissions')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-2 animate-bounce-subtle"
            >
              <Clock className="w-4 h-4 text-slate-950" />
              <span>Review {metrics.pendingNotes} Pending Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* 8 Statistics Cards Grid (Requirement 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.totalStudents || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered CSE Scholars</span>
        </div>

        {/* Total Notes */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Notes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.totalNotes || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Repository Submissions</span>
        </div>

        {/* Pending Submissions */}
        <div className="bg-amber-50/80 p-4 sm:p-5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
            {metrics.pendingNotes || 0}
          </div>
          <span className="text-[11px] text-amber-800 mt-1 block">Awaiting Moderation</span>
        </div>

        {/* Approved Notes */}
        <div className="bg-emerald-50/80 p-4 sm:p-5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved Notes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-200/80 text-emerald-900 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
            {metrics.approvedNotes || 0}
          </div>
          <span className="text-[11px] text-emerald-800 mt-1 block">Live in Student Portal</span>
        </div>

        {/* Rejected Notes */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected Notes</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.rejectedNotes || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Non-Compliant / Blurry</span>
        </div>

        {/* Reported Notes */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reported Notes</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.reportedNotes || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">User Flags Pending</span>
        </div>

        {/* Total Views */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Views</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.totalViews || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Student Consultations</span>
        </div>

        {/* Total Downloads */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Downloads</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.totalDownloads || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Resource Downloads</span>
        </div>
      </div>

      {/* Student Inquiries & Contact Messages Quick Banner */}
      <div
        onClick={() => setActiveAdminTab('messages')}
        className="cursor-pointer bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-600 transition"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Student & Faculty Inquiries Inbox</span>
              {metrics.unreadMessages > 0 ? (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {metrics.unreadMessages} New
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  All Read
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Review and reply to private messages sent by students through the Contact Us form.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 self-end sm:self-center">
          <span>Open Inbox</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Direct Pending Approval Section (Requirement 9) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Pending Approval Queue
              </h2>
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-xs font-mono">
                {pendingQueue.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submissions waiting for syllabus verification before becoming publicly available.
            </p>
          </div>

          <button
            onClick={() => setActiveAdminTab('submissions')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Dedicated Submission Review Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending submissions waiting for review. The moderation queue is completely up to date!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.2 rounded">
                      Sem {item.sem_number || item.semester_name}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded">
                      {item.subject_code}: {item.subject_name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.unit_title}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Uploaded by: <strong className="text-slate-700">{item.uploader_name}</strong></span>
                    <span>•</span>
                    <span>Format: {item.file_type} ({formatBytes(item.file_size)})</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onOpenSubmissionReview) onOpenSubmissionReview(item.id);
                      setActiveAdminTab('submissions');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                  >
                    Inspect & Review
                  </button>

                  <button
                    onClick={() => handleQuickApprove(item.id, item.title)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Admin Audit Logs Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Admin Activity Audit</h3>
          </div>
          <button
            onClick={() => setActiveAdminTab('logs')}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="text-xs flex items-start justify-between py-1 border-b border-slate-50 last:border-0 gap-4">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800">{log.details}</span>
                <div className="text-[10px] text-slate-400">
                  By {log.user_name} ({log.role}) • Target: {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
