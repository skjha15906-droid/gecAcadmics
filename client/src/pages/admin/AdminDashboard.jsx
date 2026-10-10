import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
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
  MessageSquare,
  Mail,
  ExternalLink,
  Inbox,
  Send,
  MessageCircle
} from 'lucide-react';
import { formatBytes } from '../../components/NoteCard';

export function getDefaultReplyTemplate(msg, type = 'general') {
  if (!msg) return '';
  const studentName = msg.name || 'Student';
  const topic = msg.subject || 'Academic Query';

  switch (type) {
    case 'resolved':
      return `Dear ${studentName},\n\nThank you for reaching out to the GECWC Academics Portal administration.\n\nYour reported issue/request regarding "${topic}" has been reviewed and resolved by the portal administration. Please check the portal and verify.\n\nIf you have any further questions or require additional study materials, feel free to contact us anytime.\n\nBest regards,\nShubh Kumar Jha\nLead Developer & Portal Administrator\nDepartment of Computer Science & Engineering\nGovernment Engineering College, West Champaran`;

    case 'notes_added':
      return `Dear ${studentName},\n\nThank you for your note contribution/request regarding "${topic}".\n\nThe requested study materials have been verified against the BEU curriculum and published live on the portal. You can now access and download them from the Subjects section.\n\nKeep contributing and all the best with your semester preparations!\n\nBest regards,\nShubh Kumar Jha\nLead Developer & Portal Administrator\nGovernment Engineering College, West Champaran`;

    case 'general':
    default:
      return `Dear ${studentName},\n\nThank you for reaching out to the GECWC Academics Portal administration regarding "${topic}".\n\n\n\nBest regards,\nShubh Kumar Jha\nLead Developer & Portal Administrator\nDepartment of Computer Science & Engineering\nGovernment Engineering College, West Champaran`;
  }
}

export default function AdminDashboard({
  setActiveAdminTab,
  onOpenSubmissionReview
}) {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // In-portal reply state
  const [replyingMsg, setReplyingMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [openGmailOnSend, setOpenGmailOnSend] = useState(false);

  const handleSendReply = async (e, shouldOpenGmail = openGmailOnSend) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyText.trim() || !replyingMsg) return;
    setReplyLoading(true);
    setReplyError('');
    try {
      const authToken = token || localStorage.getItem('gecwc_token');
      const res = await fetch(`/api/admin/contact-messages/${replyingMsg.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ replyMessage: replyText })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to send reply');

      setActionMsg(`In-portal reply delivered to ${replyingMsg.name} (Ticket #${replyingMsg.id})! Student can now view it on the portal.`);

      // Only open Gmail if explicitly requested
      if (shouldOpenGmail) {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(replyingMsg.email)}&su=${encodeURIComponent('Re: ' + replyingMsg.subject + ' - GECWC Academics')}&body=${encodeURIComponent(replyText.trim())}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      }

      setReplyingMsg(null);
      setReplyText('');
      loadDashboard();
      setTimeout(() => setActionMsg(''), 6000);
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

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
  const recentMessages = data?.recentMessages || [];

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

      {/* Student & Faculty Inquiries Section (Direct on Dashboard) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Student & Faculty Inquiries Inbox
                </h2>
                {metrics.unreadMessages > 0 ? (
                  <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-xs font-mono animate-pulse">
                    {metrics.unreadMessages} New
                  </span>
                ) : (
                  <span className="bg-emerald-500/30 text-emerald-300 font-semibold px-2 py-0.5 rounded-full text-xs">
                    All Caught Up
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Direct messages submitted via the Contact Us form. Delivered straight to your administrator desk.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveAdminTab('messages')}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 self-start sm:self-auto bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 transition"
          >
            <span>Open Dedicated Inquiries Tab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMessages.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No inquiries received yet. When students submit the Contact Us form, their messages will appear right here!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMessages.map((msg) => {
              const isUnread = msg.status === 'unread';
              const formattedDate = new Date(msg.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });
              const replyMailto = `mailto:${msg.email}?subject=${encodeURIComponent(
                `Re: [GECWC Academics] ${msg.subject}`
              )}&body=${encodeURIComponent(
                `Dear ${msg.name},\n\nThank you for reaching out through the GECWC Academics Portal.\n\n---\nRegarding your message:\n"${msg.message}"\n\n\n\nBest regards,\nShubh Kumar Jha\nLead Developer & Administrator\nGovernment Engineering College, West Champaran`
              )}`;

              return (
                <div
                  key={msg.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition ${
                    isUnread ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{msg.name}</span>
                      {isUnread && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.2 rounded-full text-[10px] uppercase tracking-wider">
                          Unread
                        </span>
                      )}
                      <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md border border-blue-100">
                        {msg.subject}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({msg.email})
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans shadow-2xs whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    {/* Display existing in-portal reply if sent */}
                    {msg.admin_reply && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1 text-xs text-emerald-950">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admin Response by {msg.replied_by || 'Shubh Kumar Jha'}</span>
                          {msg.replied_at && (
                            <span className="text-[10px] text-emerald-600 font-normal">
                              • {new Date(msg.replied_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.admin_reply}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                    {msg.admin_reply ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Replied in Portal</span>
                        </span>
                        <button
                          onClick={() => {
                            setReplyingMsg(msg);
                            setReplyText(msg.admin_reply || getDefaultReplyTemplate(msg, 'general'));
                            setReplyError('');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Edit Reply</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingMsg(msg);
                          setReplyText(getDefaultReplyTemplate(msg, 'general'));
                          setReplyError('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply Directly (In-Portal)</span>
                      </button>
                    )}

                    {/* Optional Gmail icon button as secondary alternative */}
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${encodeURIComponent('Re: ' + msg.subject + ' - GECWC Academics')}&body=${encodeURIComponent(msg.admin_reply || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-xs transition border border-transparent hover:border-amber-200"
                      title="Optional: Open in Gmail Compose"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {/* In-Portal Reply Modal */}
      {replyingMsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  In-Portal Direct Response
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Reply to {replyingMsg.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Topic: <strong className="text-slate-700">{replyingMsg.subject}</strong> ({replyingMsg.email})
                </p>
              </div>
              <button
                onClick={() => setReplyingMsg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Message Quote */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-32 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Student's Inquiry:</span>
              <p className="whitespace-pre-wrap italic">"{replyingMsg.message}"</p>
            </div>

            {/* In-Portal Delivery Note */}
            <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-[11px] uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant In-Portal Delivery (No Gmail Required)</span>
              </div>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Clicking <strong>"Send In-Portal Reply"</strong> publishes your response directly to the student portal under <strong>Ticket #{replyingMsg.id}</strong>. The student can view it in real-time without you needing to open external Gmail!
              </p>
            </div>

            {replyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{replyError}</span>
              </div>
            )}

            <form onSubmit={(e) => handleSendReply(e, openGmailOnSend)} className="space-y-4">
              {/* Quick Template Selector Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quick Reply Templates:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setReplyText(getDefaultReplyTemplate(replyingMsg, 'general'))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    📝 Default Format
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText(getDefaultReplyTemplate(replyingMsg, 'notes_added'))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                  >
                    📚 Notes Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText(getDefaultReplyTemplate(replyingMsg, 'resolved'))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                  >
                    ✅ Issue Resolved
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your In-Portal Reply Message *
                </label>
                <textarea
                  required
                  rows={8}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your answer, guidance, or resolution for ${replyingMsg.name}...`}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 leading-relaxed font-sans"
                />
              </div>

              {/* Delivery Options & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={openGmailOnSend}
                    onChange={(e) => setOpenGmailOnSend(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-[11px] font-medium text-slate-500">
                    Also open Gmail compose (Optional)
                  </span>
                </label>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setReplyingMsg(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{replyLoading ? 'Sending In-Portal Reply...' : 'Send In-Portal Reply'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
