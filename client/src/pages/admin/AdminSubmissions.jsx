import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Flag,
  Search,
  BookOpen,
  User,
  Calendar,
  AlertTriangle,
  Download,
  Eye,
  Check,
  X,
  FileText
} from 'lucide-react';
import { formatBytes } from '../../components/NoteCard';

export default function AdminSubmissions({ onPreviewNote, initialHighlightId }) {
  const { token, user } = useAuth();

  const [statusTab, setStatusTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Rejection modal state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [noteToReject, setNoteToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Wrong subject');
  const [rejectionDetails, setRejectionDetails] = useState('');

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const [notification, setNotification] = useState('');

  const rejectionOptions = [
    'Wrong subject',
    'Wrong unit',
    'Duplicate',
    'Unrelated content',
    'Poor/invalid file',
    'Inappropriate content',
    'Spam',
    'Other'
  ];

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/submissions?status=${statusTab}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);

        if (initialHighlightId) {
          const match = data.submissions.find(s => s.id === Number(initialHighlightId));
          if (match) setSelectedSubmission(match);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token, statusTab]);

  const handleApprove = async (sub) => {
    try {
      const res = await fetch(`/api/admin/submissions/${sub.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification(`Note "${sub.title}" successfully approved and published!`);
        fetchSubmissions();
        if (selectedSubmission?.id === sub.id) {
          setSelectedSubmission(prev => ({ ...prev, status: 'approved' }));
        }
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      alert('Error approving submission: ' + e.message);
    }
  };

  const handleOpenRejectModal = (sub) => {
    setNoteToReject(sub);
    setRejectionReason('Wrong subject');
    setRejectionDetails('');
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!noteToReject) return;
    try {
      const res = await fetch(`/api/admin/submissions/${noteToReject.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: rejectionReason,
          details: rejectionDetails
        })
      });

      if (res.ok) {
        setNotification(`Note marked as rejected (${rejectionReason}).`);
        setRejectionModalOpen(false);
        fetchSubmissions();
        if (selectedSubmission?.id === noteToReject.id) {
          setSelectedSubmission(null);
        }
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      alert('Error rejecting submission: ' + e.message);
    }
  };

  const handleOpenDeleteModal = (sub) => {
    setNoteToDelete(sub);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      const res = await fetch(`/api/admin/submissions/${noteToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification(`Submission permanently deleted.`);
        setDeleteConfirmOpen(false);
        fetchSubmissions();
        if (selectedSubmission?.id === noteToDelete.id) {
          setSelectedSubmission(null);
        }
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      alert('Error deleting submission: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Academic Moderation System</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Submission Review Page
          </h1>
          <p className="text-xs text-slate-500">
            Verify syllabus conformance, author credentials, and document quality before publishing to CSE scholars.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => { setStatusTab('pending'); setSelectedSubmission(null); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition ${
              statusTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </button>

          <button
            onClick={() => { setStatusTab('approved'); setSelectedSubmission(null); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition ${
              statusTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </button>

          <button
            onClick={() => { setStatusTab('rejected'); setSelectedSubmission(null); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition ${
              statusTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()}
            placeholder="Search by title, student name, roll..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Main Layout: Submissions Table & Side Review Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submissions Table */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="p-16 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-16 bg-white rounded-xl border border-slate-200 text-center space-y-2">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No submissions in this category</h3>
              <p className="text-xs text-slate-400">
                {statusTab === 'pending'
                  ? 'Great job! All pending student submissions have been reviewed.'
                  : `No ${statusTab} submissions found.`}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${
                        isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-300 px-1.5 py-0.2 rounded">
                            Sem {sub.sem_number}
                          </span>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded">
                            {sub.subject_code}
                          </span>
                          <span className="text-xs text-slate-500">
                            {sub.unit_title?.split(':')[0]}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {sub.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>
                            Student: <strong className="text-slate-800">{sub.uploader_name}</strong> {sub.uploader_roll ? `(${sub.uploader_roll})` : ''}
                          </span>
                          <span>•</span>
                          <span>{sub.file_type} ({formatBytes(sub.file_size)})</span>
                          <span>•</span>
                          <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {statusTab === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(sub); }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition shadow-2xs flex items-center gap-1"
                              title="Approve immediately"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenRejectModal(sub); }}
                              className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition flex items-center gap-1"
                              title="Reject with reason"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(sub); }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Detailed Submission Inspection Drawer */}
        <div className="lg:col-span-1">
          {selectedSubmission ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-20">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Submission Inspector
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedSubmission.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  selectedSubmission.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedSubmission.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedSubmission.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedSubmission.description || 'No description provided by student.'}
                </p>
              </div>

              {/* Academic Hierarchy Info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Scope</span>
                  <span className="font-semibold text-slate-800">
                    Semester {selectedSubmission.sem_number} • {selectedSubmission.subject_name} ({selectedSubmission.subject_code})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit / Topic</span>
                  <span className="font-medium text-slate-700">{selectedSubmission.unit_title}</span>
                  {selectedSubmission.topic && (
                    <div className="text-blue-700 font-medium">Topic: {selectedSubmission.topic}</div>
                  )}
                </div>
              </div>

              {/* Student Metadata */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contributor Details</span>
                <div className="font-bold text-slate-800">{selectedSubmission.uploader_name}</div>
                <div className="text-slate-500 text-[11px]">{selectedSubmission.uploader_email}</div>
                {selectedSubmission.uploader_roll && (
                  <div className="text-slate-500 font-mono text-[10px]">Roll: {selectedSubmission.uploader_roll}</div>
                )}
              </div>

              {/* File Specs & Preview Button */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">File Specs</span>
                  <span className="font-mono text-slate-700">
                    {selectedSubmission.file_type} • {formatBytes(selectedSubmission.file_size)}
                  </span>
                </div>
                <button
                  onClick={() => onPreviewNote && onPreviewNote(selectedSubmission)}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Document</span>
                </button>
              </div>

              {/* Rejection Details if rejected */}
              {selectedSubmission.status === 'rejected' && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-900 space-y-1">
                  <strong>Rejection Reason:</strong> {selectedSubmission.rejection_reason}
                  {selectedSubmission.rejection_details && (
                    <p className="text-rose-800 text-[11px]">{selectedSubmission.rejection_details}</p>
                  )}
                </div>
              )}

              {/* Moderator Decision Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {selectedSubmission.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(selectedSubmission)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Publish to Platform</span>
                  </button>
                )}

                {selectedSubmission.status !== 'rejected' && (
                  <button
                    onClick={() => handleOpenRejectModal(selectedSubmission)}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Submission</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenDeleteModal(selectedSubmission)}
                  className="w-full text-slate-500 hover:text-rose-600 text-xs py-1.5 transition text-center"
                >
                  Permanently Delete from Database
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
              Select any submission from the list to inspect full academic metadata, student credentials, and review actions.
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal (Requirement 12) */}
      {rejectionModalOpen && noteToReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Academic Submission</span>
              </div>
              <button onClick={() => setRejectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">Resource being rejected:</p>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{noteToReject.title}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Rejection Reason *
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
              >
                {rejectionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Guidance Note for Student (Optional)
              </label>
              <textarea
                value={rejectionDetails}
                onChange={(e) => setRejectionDetails(e.target.value)}
                rows={3}
                placeholder="Explain what needs fixing (e.g. upload pages 10-15 again in portrait orientation with clear handwriting)..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && noteToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Permanently?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will delete the note <strong>"{noteToDelete.title}"</strong> and its uploaded file completely from the server.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
