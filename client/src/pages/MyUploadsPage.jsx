import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  Eye,
  Download,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { formatBytes } from '../components/NoteCard';

export default function MyUploadsPage({ setCurrentRoute, onPreviewNote, onDownloadNote }) {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyUploads() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        let url = '/api/uploads/my/submissions';
        if (filterStatus !== 'all') {
          url += `?status=${filterStatus}`;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMyUploads();
  }, [token, filterStatus]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Login to View Submissions</h2>
        <p className="text-xs text-slate-500">
          Sign in to track the moderation status of your uploaded study materials.
        </p>
        <button
          onClick={() => setCurrentRoute('login')}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg text-xs transition"
        >
          Login
        </button>
      </div>
    );
  }

  const counts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Uploaded Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor the status of your study resource contributions through the academic moderation pipeline.
          </p>
        </div>

        <button
          onClick={() => setCurrentRoute('upload')}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Submit New Note</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStatus === 'all'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Submissions</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{submissions.length}</div>
        </div>

        <div
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStatus === 'pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {submissions.filter(s => s.status === 'pending').length}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('approved')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStatus === 'approved'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved & Live
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {submissions.filter(s => s.status === 'approved').length}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('rejected')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStatus === 'rejected'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
          <div className="text-2xl font-black text-rose-900 mt-1">
            {submissions.filter(s => s.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading your submission history...
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No submissions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't uploaded any academic notes in this category yet.
          </p>
          <button
            onClick={() => setCurrentRoute('upload')}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
          >
            Submit a Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isApproved = sub.status === 'approved';
            const isPending = sub.status === 'pending';
            const isRejected = sub.status === 'rejected';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved & Published
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          Waiting for Academic Moderation
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      )}

                      <span className="text-xs font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                        Sem {sub.sem_number || sub.semester_id}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {sub.subject_code}: {sub.subject_name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {sub.unit_title}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {sub.title}
                    </h3>

                    {sub.topic && (
                      <p className="text-xs text-slate-600">
                        <strong>Topic:</strong> {sub.topic}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Submitted: {new Date(sub.created_at).toLocaleDateString()}</span>
                      <span>Format: {sub.file_type} ({formatBytes(sub.file_size)})</span>
                      {isApproved && (
                        <>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Eye className="w-3.5 h-3.5" /> {sub.views_count} Views
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Download className="w-3.5 h-3.5" /> {sub.downloads_count} Downloads
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {isApproved && (
                      <>
                        <button
                          onClick={() => onPreviewNote && onPreviewNote(sub)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 transition"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => onDownloadNote && onDownloadNote(sub)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition"
                        >
                          Download
                        </button>
                      </>
                    )}

                    {isPending && (
                      <span className="text-xs text-amber-700 italic bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60">
                        In Review Queue
                      </span>
                    )}
                  </div>
                </div>

                {/* Rejection Details Box (Requirement 8) */}
                {isRejected && (
                  <div className="bg-rose-50/80 border-t border-rose-200 p-4 space-y-1 text-xs text-rose-900 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-rose-950">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Moderation Feedback / Reason: {sub.rejection_reason || 'Inappropriate or invalid content'}</span>
                    </div>
                    {sub.rejection_details && (
                      <p className="text-rose-800 pl-5 leading-relaxed">
                        {sub.rejection_details}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 pl-5 pt-1">
                      Tip: Please address the feedback above and re-submit a revised copy from the Upload Notes page.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
