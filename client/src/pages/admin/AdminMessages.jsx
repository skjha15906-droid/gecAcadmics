import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Inbox
} from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, unread, read
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/contact-messages?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load inquiries.');
      }

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'read' ? 'unread' : 'read';
      const res = await fetch(`/api/admin/contact-messages/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student inquiry? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete message.');
      }
    } catch (err) {
      alert('Failed to delete message: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const readCount = messages.filter((m) => m.status === 'read').length;

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-amber-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">
                Student & Faculty Inquiries
              </h1>
              {unreadCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Secure in-portal messages submitted through the Contact Us page. Your personal email is completely hidden from public view.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'unread'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'read'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, email, query..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-indigo-600"
          />
        </form>
      </div>

      {/* Messages Listing */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading student messages...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No messages matched your search query. Try clearing the filter.'
              : statusFilter === 'unread'
              ? 'All caught up! There are no unread inquiries at the moment.'
              : 'No student or faculty inquiries have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
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
                className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                  isUnread
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Message Header Strip */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{msg.name}</span>
                        {isUnread ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            New Unread
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Read
                          </span>
                        )}
                        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md border border-blue-100">
                          {msg.subject}
                        </span>
                      </div>

                      {/* Email and Copy Button */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700">{msg.email}</span>
                        <button
                          onClick={() => handleCopyEmail(msg.email, msg.id)}
                          className="text-slate-400 hover:text-indigo-600 p-0.5"
                          title="Copy Email"
                        >
                          {copiedEmail === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp & Actions */}
                  <div className="flex items-center gap-2 text-xs self-end md:self-center">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-2">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(msg.id, msg.status)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                        isUnread
                          ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                          : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                    >
                      {isUnread ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      disabled={deletingId === msg.id}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.message}
                  </div>

                  {/* Quick Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inquiry stored securely in SQLite database</span>
                    </div>

                    <a
                      href={replyMailto}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-xs transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply to {msg.name} ({msg.email})</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
