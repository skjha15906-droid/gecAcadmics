import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flag, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ReportModal({ note, onClose }) {
  const { user, token } = useAuth();
  const [reason, setReason] = useState('Incorrect information');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!note) return null;

  const reasons = [
    'Wrong subject/unit',
    'Duplicate',
    'Incorrect information',
    'Unrelated content',
    'Inappropriate content',
    'Copyright concern',
    'Spam',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in with your student or faculty account to submit a report.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/notes/${note.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason, details })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <Flag className="w-4 h-4 text-rose-600" />
            <span>Report Academic Note</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Report Submitted</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thank you for keeping GECWC Academics clean and academically accurate. Our moderation team has received your report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500">Reporting resource:</p>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{note.title}</p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the issue (e.g. error on page 3, incorrect formula, wrong subject mapping)..."
                rows={3}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
