import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Flag,
  FileText,
  Calendar,
  User,
  CheckCircle,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  ExternalLink,
  Star,
  MessageSquare,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatBytes } from './NoteCard';

export default function NotePreviewModal({
  note,
  onClose,
  onDownload,
  onReport,
  initialTab = 'viewer'
}) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'viewer' or 'reviews'

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 5.0, totalReviews: 0, problemCount: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);

  // New review form state
  const [rating, setRating] = useState(5);
  const [reviewType, setReviewType] = useState('feedback'); // 'feedback' or 'problem'
  const [issueCategory, setIssueCategory] = useState('Blurry / Poor Quality Pages');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'problems', 'feedback'

  const issueCategories = [
    'Blurry / Poor Quality Pages',
    'Missing Pages or Incomplete Topics',
    'Formula / Theoretical Error',
    'Wrong Subject or Unit Mapped',
    'Handwriting Hard to Read',
    'Out of BEU Syllabus',
    'Other Problem'
  ];

  // Fetch reviews whenever note changes
  useEffect(() => {
    if (note && note.id) {
      loadReviews();
    }
  }, [note]);

  const loadReviews = async () => {
    if (!note || !note.id) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setSummary(data.summary || { averageRating: 5.0, totalReviews: 0, problemCount: 0 });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError('Please login to your student or faculty account to submit a review or report a problem.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 3) {
      setReviewError('Please write at least a few words (minimum 3 characters) describing your feedback or problem.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`/api/notes/${note.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          review_type: reviewType,
          issue_category: reviewType === 'problem' ? issueCategory : null,
          comment: comment.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post review.');
      }

      setReviewSuccess(data.message || 'Review submitted successfully!');
      setComment('');
      setRating(5);
      setReviewType('feedback');

      // Reload reviews
      await loadReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!note) return null;

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'problems') return r.review_type === 'problem';
    if (reviewFilter === 'feedback') return r.review_type === 'feedback';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                  Sem {note.sem_number || note.semester_id}
                </span>
                <span className="text-xs text-slate-300 font-semibold truncate max-w-[280px]">
                  {note.subject_code ? `${note.subject_code} • ` : ''}{note.subject_name}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Open in Browser Tab */}
            <a
              href={`/api/notes/${note.id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition border border-slate-700"
              title="Open full document in separate browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Screen ↗</span>
            </a>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="bg-slate-100 px-5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('viewer')}
              className={`flex items-center gap-2 py-2.5 px-3 font-semibold border-b-2 transition ${
                activeTab === 'viewer'
                  ? 'border-blue-700 text-blue-700 bg-white/70'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Direct Document View</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 py-2.5 px-3 font-semibold border-b-2 transition ${
                activeTab === 'reviews'
                  ? 'border-blue-700 text-blue-700 bg-white/70'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Reviews & Problem Reports</span>
              {reviews.length > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                  {reviews.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>{note.file_type || 'PDF'}</span>
            <span>•</span>
            <span>{formatBytes(note.file_size)}</span>
          </div>
        </div>

        {/* TAB 1: DIRECT INTERACTIVE DOCUMENT VIEWER */}
        {activeTab === 'viewer' && (
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50 flex flex-col space-y-3">
            {/* Direct Document Preview Frame */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden flex-1 min-h-[55vh] flex flex-col">
              <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="truncate max-w-[320px]">{note.file_name}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Report Problem / Review</span>
                  </button>

                  <a
                    href={`/api/notes/${note.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Live Iframe Document Render */}
              <div className="relative flex-1 w-full bg-slate-900/5 min-h-[50vh] sm:min-h-[58vh]">
                <iframe
                  src={`/api/notes/${note.id}/view`}
                  title={note.title}
                  className="w-full h-full min-h-[50vh] sm:min-h-[58vh] border-0 bg-white"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Quick Details Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Uploaded By</span>
                  <span className="font-semibold text-slate-800">{note.uploader_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit</span>
                  <span className="font-semibold text-slate-800">{note.unit_title || 'Unit ' + (note.unit_number || '1')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Downloads</span>
                  <span className="font-semibold text-slate-800">{note.downloads_count || 0} times</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Direct online viewing active</span>
                <button
                  onClick={() => onDownload && onDownload(note)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVIEWS & PROBLEM REPORTS */}
        {activeTab === 'reviews' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/70 space-y-5">
            {/* Rating Summary Header Card */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">
                  <div className="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
                    <span>{summary.averageRating}</span>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">Average Rating</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Reviews & Notes Feedback</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {summary.totalReviews} total reviews • {summary.problemCount} problem reports logged
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Notice any issue in this note?</span>
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Report below
                </span>
              </div>
            </div>

            {/* Submission Form Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Write a Review or Report an Issue</span>
              </h4>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              {reviewError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Review Type Selector (General feedback vs Problem report) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setReviewType('feedback')}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                      reviewType === 'feedback'
                        ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewType"
                      checked={reviewType === 'feedback'}
                      onChange={() => setReviewType('feedback')}
                      className="sr-only"
                    />
                    <ThumbsUp className={`w-4 h-4 ${reviewType === 'feedback' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-xs">
                      <div className="font-bold">General Review / Helpful</div>
                      <div className="text-[11px] text-slate-500 font-normal">Praise good notes or share tips</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setReviewType('problem')}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                      reviewType === 'problem'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold ring-1 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewType"
                      checked={reviewType === 'problem'}
                      onChange={() => setReviewType('problem')}
                      className="sr-only"
                    />
                    <AlertTriangle className={`w-4 h-4 ${reviewType === 'problem' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <div className="text-xs">
                      <div className="font-bold">Report a Problem in Note</div>
                      <div className="text-[11px] text-slate-500 font-normal">Blurry, missing page, formula error</div>
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Star Rating Picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-700">{rating} / 5 Stars</span>
                  </div>

                  {/* Issue Category if Problem selected */}
                  {reviewType === 'problem' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Issue Type:</span>
                      <select
                        value={issueCategory}
                        onChange={(e) => setIssueCategory(e.target.value)}
                        className="text-xs rounded-lg border border-slate-300 p-1.5 bg-white focus:outline-blue-600 font-medium text-slate-700"
                      >
                        {issueCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Comment Textarea */}
                <div>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      reviewType === 'problem'
                        ? 'Describe the issue clearly (e.g. Page 4 is blurred, missing derivation of theorem in Unit 2, wrong semester)...'
                        : 'Share your thoughts about this note (e.g. Very clear explanation, diagrams are neat, helpful for BEU exams)...'
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-blue-600 placeholder:text-slate-400"
                  />
                </div>

                {/* Submit action */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {token ? `Posting as: ${user?.name || 'Student'}` : 'You must be logged in to post'}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-lg transition shadow-2xs ${
                      reviewType === 'problem'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-blue-700 hover:bg-blue-800'
                    } disabled:opacity-50`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : reviewType === 'problem' ? 'Submit Problem Report' : 'Post Review'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Previous Reviews & Reports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Community Feedback & Problem Logs ({reviews.length})
                </h4>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      reviewFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    All ({reviews.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('problems')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      reviewFilter === 'problems' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Problems Only ({reviews.filter(r => r.review_type === 'problem').length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('feedback')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      reviewFilter === 'feedback' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Reviews Only ({reviews.filter(r => r.review_type === 'feedback').length})
                  </button>
                </div>
              </div>

              {loadingReviews ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading reviews...</div>
              ) : filteredReviews.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No reviews in this category yet</p>
                  <p className="text-[11px] text-slate-400">
                    If you found any issue (blur pages, missing syllabus) or found this note helpful, be the first to share!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`p-4 rounded-xl border bg-white shadow-2xs space-y-2 ${
                        rev.review_type === 'problem' ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {rev.user_name ? rev.user_name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{rev.user_name}</span>
                            <span className="text-[10px] text-slate-400">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {rev.review_type === 'problem' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {rev.issue_category || 'Reported Issue'}
                            </span>
                          ) : (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-sans pl-9">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Bottom Action Footer */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => setActiveTab(activeTab === 'viewer' ? 'reviews' : 'viewer')}
              className="text-blue-700 hover:underline font-semibold flex items-center gap-1"
            >
              {activeTab === 'viewer' ? (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Check Reviews & Issues ({reviews.length})</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Back to Document Viewer</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Close
            </button>

            <button
              onClick={() => onDownload && onDownload(note)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
