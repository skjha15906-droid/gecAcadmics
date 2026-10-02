import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  GraduationCap,
  ShieldCheck,
  Award,
  DownloadCloud,
  FileCheck
} from 'lucide-react';
import NoteCard from '../components/NoteCard';

export default function HomePage({
  setCurrentRoute,
  onSelectSemester,
  onSelectSubject,
  setGlobalSearchQuery,
  onPreviewNote,
  onDownloadNote,
  onReportNote
}) {
  const [searchInput, setSearchInput] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [featuredData, setFeaturedData] = useState({
    recentNotes: [],
    mostViewedNotes: [],
    mostDownloadedNotes: [],
    quickSubjects: []
  });
  const [activeTab, setActiveTab] = useState('downloaded'); // 'downloaded' or 'recent' or 'viewed'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [semRes, featRes] = await Promise.all([
          fetch('/api/semesters'),
          fetch('/api/notes/featured')
        ]);

        if (semRes.ok) {
          const semJson = await semRes.json();
          setSemesters(semJson.semesters || []);
        }

        if (featRes.ok) {
          const featJson = await featRes.json();
          setFeaturedData(featJson);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setGlobalSearchQuery(searchInput.trim());
      setCurrentRoute('search');
    }
  };

  const getDisplayedNotes = () => {
    if (activeTab === 'recent') return featuredData.recentNotes;
    if (activeTab === 'viewed') return featuredData.mostViewedNotes;
    return featuredData.mostDownloadedNotes;
  };

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO ACADEMIC BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60 shadow-inner">
        {/* Subtle background academic grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-amber-300 px-3.5 py-1 rounded-full text-xs font-medium tracking-wide shadow-xs">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Government Engineering College, West Champaran • Dept. of CSE</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif text-white">
              GECWC <span className="text-amber-400 font-sans">Academics</span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-slate-200 tracking-tight">
              “One Place for All CSE Academic Notes”
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized peer-reviewed syllabus notes, unit summaries, and previous years' question banks strictly curated for Computer Science & Engineering students from Semester 1 to 8.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto pt-2"
          >
            <div className="relative flex items-center shadow-xl rounded-xl overflow-hidden border-2 border-amber-400/40 focus-within:border-amber-400 transition bg-white text-slate-800">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5 text-blue-700" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search subject, unit or topic (e.g. Stack, DBMS, Compiler, DAA)..."
                className="w-full py-4 px-3 text-sm sm:text-base font-medium text-slate-900 focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 sm:px-8 py-4 font-semibold text-sm transition flex items-center gap-1.5 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2 mt-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Quick Searches:</span>
              {['Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks', 'Automata FLAT'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setGlobalSearchQuery(term);
                    setCurrentRoute('search');
                  }}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 hover:text-white transition"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Developer Credit Tag */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Architected & Developed by <strong className="text-amber-400 font-bold">Shubh Kumar Jha</strong> (B.Tech 2025–2029, CSE)</span>
            </div>
          </form>
        </div>
      </section>

      {/* 2. SEMESTERS 1 TO 8 SYSTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Academic Curriculum</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Select Semester
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore subject-wise syllabus, unit breakdowns, and verified resources for your current semester.
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('semesters')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <span>View All Semester Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Semester Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {semesters.map((sem) => (
            <div
              key={sem.id}
              onClick={() => {
                if (onSelectSemester) onSelectSemester(sem.sem_number);
                setCurrentRoute('semesters');
              }}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-bold font-mono text-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    S{sem.sem_number}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    CSE B.Tech
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {sem.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {sem.sem_number <= 2 ? 'First Year Common & Core' :
                   sem.sem_number <= 4 ? 'Second Year Core CSE' :
                   sem.sem_number <= 6 ? 'Third Year Advanced CSE' : 'Final Year Electives & Specialization'}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{sem.subjects_count} Subjects</span>
                <span className="font-semibold text-blue-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HIGHLIGHTED & APPROVED NOTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/70 p-6 sm:p-8 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>Peer-Reviewed Study Materials</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Approved CSE Notes & Resources
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('downloaded')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  activeTab === 'downloaded'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Most Downloaded</span>
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  activeTab === 'recent'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Recently Approved</span>
              </button>

              <button
                onClick={() => setActiveTab('viewed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  activeTab === 'viewed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Most Viewed</span>
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {getDisplayedNotes().map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPreview={onPreviewNote}
                onDownload={onDownloadNote}
                onReport={onReportNote}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentRoute('search')}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-blue-700 border border-slate-300 font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition"
            >
              <Search className="w-4 h-4" />
              <span>Browse All Approved Resources in Repository</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. QUICK SUBJECT ACCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Fast Navigation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Quick Subject Access
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Direct shortcuts to the most frequently consulted CSE subjects and syllabus units.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featuredData.quickSubjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => {
                if (onSelectSubject) onSelectSubject(sub);
                setCurrentRoute('subjects');
              }}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>{sub.code}</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans">
                  Sem {sub.sem_number}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition line-clamp-2">
                {sub.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>{sub.notes_count || 0} Notes Available</span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACADEMIC INTEGRITY & UPLOAD CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Contribute Academic Notes</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Have handwritten notes or question banks?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload your notes to support your peers across CSE Semesters 1 to 8. Every submission is thoroughly reviewed by college faculty and student moderators before going live.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setCurrentRoute('upload')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Upload Notes for Review</span>
            </button>
            <button
              onClick={() => setCurrentRoute('search')}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2"
            >
              <span>Explore Materials</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
