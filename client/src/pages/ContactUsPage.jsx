import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Clock,
  SendHorizontal,
  Search,
  Check,
  Copy,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  FileQuestion,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function ContactUsPage() {
  const { user } = useAuth();

  // Mode: 'submit' or 'track'
  const [activeTab, setActiveTab] = useState('submit');

  // Submit form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('Study Notes Contribution / Query');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastSubmittedId, setLastSubmittedId] = useState(null);

  // Inquiry tracking state
  const [trackQuery, setTrackQuery] = useState(user?.email || '');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [inquiries, setInquiries] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // If user logs in or changes, sync email
  useEffect(() => {
    if (user?.email) {
      if (!email) setEmail(user.email);
      if (!name) setName(user.name);
      if (!trackQuery) setTrackQuery(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setLastSubmittedId(data.id);
      setSuccessMsg(`Thank you, ${name}! Your inquiry (Ticket #${data.id}) has been delivered directly to Lead Administrator Shubh Kumar Jha.`);
      setTrackQuery(email);
      setMessage('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackInquiry = async (overrideQuery) => {
    const query = (overrideQuery || trackQuery || '').trim();
    if (!query) {
      setTrackError('Please enter your email address or inquiry ticket number.');
      return;
    }

    setTrackLoading(true);
    setTrackError('');
    try {
      const isTicket = /^\d+$/.test(query);
      const param = isTicket ? `ticketId=${query}` : `email=${encodeURIComponent(query)}`;
      const res = await fetch(`/api/inquiries/check?${param}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to lookup inquiries.');
      }

      setInquiries(data.inquiries || []);
      if (!data.inquiries || data.inquiries.length === 0) {
        setTrackError(`No inquiries found matching "${query}". Please check your email or ticket ID.`);
      }
    } catch (err) {
      setTrackError(err.message);
      setInquiries([]);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleCopyReply = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-blue-700" />
          <span>Student & Faculty Support Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Contact <span className="text-blue-700 font-sans">Administration</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Submit questions, request missing notes, or track your submitted inquiries and read replies from portal developer & administrator <strong>Shubh Kumar Jha</strong>.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 mt-4 shadow-2xs">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'submit'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send New Inquiry</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('track');
              if (trackQuery && !inquiries) {
                handleTrackInquiry(trackQuery);
              }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'track'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Inquiry Status & View Reply</span>
            {lastSubmittedId && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'submit' ? (
        /* SUBMIT INQUIRY TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Column: Developer & Institution Info Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Developer Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-7 rounded-2xl shadow-xl space-y-5 border border-slate-700/80">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-amber-400 text-white flex items-center justify-center font-mono font-black text-xl shadow-lg shrink-0">
                  &lt;/&gt;
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Lead Developer & Admin
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    Shubh Kumar Jha
                  </h3>
                  <p className="text-xs text-slate-300">
                    B.Tech (2025–2029) • Computer Science & Engineering
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-700/80 pt-4 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Direct Portal Routing</span>
                    <span className="text-slate-200 font-medium">
                      All submissions are securely logged and directly routed to Administrator Shubh Kumar Jha.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Institution</span>
                    <span className="text-slate-200">Govt. Engineering College, West Champaran (GECWC)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Campus Location</span>
                    <span className="text-slate-200">Kumarbagh, Bettiah, West Champaran, Bihar - 845450</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">In-Portal Tracking</span>
                    <span className="text-slate-200">Replies are sent to your email & viewable online anytime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ / Topics Pill Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>What can we help you with?</span>
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-xs">
                <li>Request missing notes or unit study materials</li>
                <li>Report wrong syllabus topics or outdated codes</li>
                <li>Technical bugs, login issues, or site suggestions</li>
                <li>Collaborating on B.Tech CSE academic projects</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Send Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Send an Inquiry
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out the details below. Your submission is directly routed to <strong>Shubh Kumar Jha</strong>.
                </p>
              </div>

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-emerald-900">{successMsg}</div>
                      <div className="text-emerald-700 text-xs leading-relaxed">
                        Your inquiry is saved under Ticket <strong>#{lastSubmittedId}</strong>. You can check the reply right here or via your email.
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('track');
                        handleTrackInquiry(trackQuery || email);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Track Inquiry #{lastSubmittedId} Now</span>
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aman Kumar"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setTrackQuery(e.target.value);
                      }}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Administrator Shubh Kumar Jha will reply to this email, and you can track answers using it.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Inquiry Category / Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                  >
                    <option value="Study Notes Contribution / Query">Study Notes Contribution / Query</option>
                    <option value="Syllabus or Unit Correction">Syllabus or Unit Correction</option>
                    <option value="Bug / Technical Issue Report">Bug / Technical Issue Report</option>
                    <option value="Academic Feedback & Suggestion">Academic Feedback & Suggestion</option>
                    <option value="General College Inquiry">General College Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your query, suggestion, or request here in detail..."
                      className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-7 rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <SendHorizontal className="w-4 h-4" />
                    <span>{loading ? 'Delivering Message...' : 'Send Message to Administrator'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* TRACK INQUIRY STATUS & REPLIES TAB */
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Tracking Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <span>Track Your Inquiries & View Admin Response</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the email address you used when submitting your inquiry (or enter your specific Ticket ID) to see real-time updates and read official replies from Administrator Shubh Kumar Jha.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrackInquiry();
              }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter your email (e.g. nkjha977@gmail.com) or Ticket ID"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={trackLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {trackLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{trackLoading ? 'Searching...' : 'Check Status'}</span>
              </button>
            </form>

            {trackError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}
          </div>

          {/* Inquiry Results List */}
          {inquiries !== null && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Inquiries Found ({inquiries.length})
                </h3>
                <span className="text-xs text-slate-400">
                  Showing all submissions for <strong className="text-slate-700">{trackQuery}</strong>
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Inquiries Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    We could not find any messages for this query. If you haven't sent a message yet, you can submit one using the "Send New Inquiry" tab above.
                  </p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry Now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {inquiries.map((inq) => {
                    const isReplied = inq.status === 'replied' && inq.admin_reply;
                    const formattedDate = new Date(inq.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    });

                    return (
                      <div
                        key={inq.id}
                        className={`bg-white rounded-2xl border p-6 space-y-4 shadow-sm transition ${
                          isReplied
                            ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Header Badge & Topic */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Ticket #{inq.id}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {inq.subject}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isReplied ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Replied by Administrator</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Under Admin Review</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Student's Original Inquiry */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Your Message:
                          </span>
                          <p className="whitespace-pre-wrap leading-relaxed">{inq.message}</p>
                        </div>

                        {/* Admin's Official Response Card */}
                        {isReplied ? (
                          <div className="bg-gradient-to-tr from-emerald-50/90 to-teal-50/50 border-2 border-emerald-300 rounded-xl p-5 space-y-3 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                  ✓
                                </div>
                                <div>
                                  <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                                    <span>Official Administrator Response</span>
                                    <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-mono px-1.5 py-0.2 rounded">
                                      VERIFIED
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-emerald-700">
                                    Replied by <strong>{inq.replied_by || 'Shubh Kumar Jha'}</strong> • Lead Developer & Portal Administrator
                                    {inq.replied_at && (
                                      <span> ({new Date(inq.replied_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })})</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleCopyReply(inq.id, inq.admin_reply)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition self-start sm:self-auto"
                              >
                                {copiedId === inq.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copy Reply</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Reply Message Body */}
                            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-white/70 p-4 rounded-lg border border-emerald-100">
                              {inq.admin_reply}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Awaiting Admin Review</strong>
                              <span className="text-[11px] text-amber-800 leading-relaxed">
                                Lead Administrator Shubh Kumar Jha has received this inquiry. When a reply is drafted, it will appear right here and will be dispatched to your email address ({inq.email}). Please check back soon.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
