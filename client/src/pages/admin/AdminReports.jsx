import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Flag,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  AlertTriangle,
  Check,
  X,
  FileText
} from 'lucide-react';

export default function AdminReports({ onPreviewNote }) {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadReports();
    }
  }, [token]);

  const handleResolve = async (reportId, action) => {
    const notes = prompt(`Enter resolution note (e.g. "Reviewed: verified accurate formula"):`);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          resolution_notes: notes || 'Reviewed by moderator'
        })
      });

      if (res.ok) {
        setNotification(`Report #${reportId} updated to ${action}.`);
        loadReports();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      alert('Error updating report: ' + e.message);
    }
  };

  const handleRemoveNote = async (reportId, noteTitle) => {
    if (!window.confirm(`Are you sure you want to permanently remove reported note "${noteTitle}" and resolve this report?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/reports/${reportId}/remove-note`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotification(`Content removed and report marked as resolved.`);
        loadReports();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <Flag className="w-4 h-4" />
          <span>Academic Integrity</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Reported Study Materials
        </h1>
        <p className="text-xs text-slate-500">
          User reports regarding incorrect information, syllabus mismatch, duplicate files, or inappropriate content.
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 space-y-2">
          <Flag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No active reports</h3>
          <p className="text-xs text-slate-400">All student reports have been addressed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {reports.map((rep) => {
              const isPending = rep.status === 'pending';

              return (
                <div key={rep.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isPending ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rep.status}
                      </span>
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Reason: {rep.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(rep.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Target Note: <span className="text-blue-700">{rep.note_title}</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        {rep.semester_name} • {rep.subject_name}
                      </p>
                    </div>

                    {rep.details && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">Reporter's Feedback: </strong>
                        {rep.details}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Reported by: <span className="font-semibold text-slate-700">{rep.reporter_name}</span> ({rep.reporter_email})
                      {rep.resolver_name && (
                        <span> • Handled by: {rep.resolver_name} ({rep.resolution_notes || 'Resolved'})</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 self-start shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleResolve(rep.id, 'resolved')}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                          title="Keep content and mark report resolved"
                        >
                          Keep Content
                        </button>
                        <button
                          onClick={() => handleResolve(rep.id, 'dismissed')}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                          title="Dismiss report as invalid"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleRemoveNote(rep.id, rep.note_title)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-2xs flex items-center gap-1"
                          title="Remove reported note permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Note</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
