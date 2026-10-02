import React, { useState } from 'react';
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
  SendHorizontal
} from 'lucide-react';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Study Notes Contribution / Query');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

      setSuccessMsg(`Thank you, ${name}! Your message has been delivered directly to Portal Administrator Shubh Kumar Jha. We have received your query and will reply to your email (${email}) shortly.`);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-blue-700" />
          <span>Student & Faculty Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Contact <span className="text-blue-700 font-sans">Administration</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Have a question regarding study notes, syllabus units, or want to contribute academic materials? Send a direct message to portal developer & lead administrator <strong>Shubh Kumar Jha</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                    All inquiries are securely delivered straight to Administrator Shubh Kumar Jha.
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
                  <span className="text-slate-200">Bakwa, Bettiah, West Champaran, Bihar - 845438</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Response Window</span>
                  <span className="text-slate-200">Typically replies within 24 hours via email</span>
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
                Send a Message
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the details below. Your submission is directly routed to <strong>Shubh Kumar Jha</strong>.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">{successMsg}</div>
                  <div className="text-emerald-700 text-[11px]">
                    We will get back to you via your submitted email address.
                  </div>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  We will use this email address to reply to your inquiry.
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
    </div>
  );
}
