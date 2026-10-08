import React from 'react';
import { GraduationCap, ShieldCheck, BookOpen, ExternalLink, MapPin } from 'lucide-react';

export default function Footer({ setCurrentRoute, onSelectSemester }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-700 text-amber-400 flex items-center justify-center shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-serif">
                  GECWC <span className="text-blue-400 font-sans">Academics</span>
                </span>
                <p className="text-xs text-slate-400">Department of Computer Science & Engineering</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Centralized, peer-reviewed academic resource portal for students of Government Engineering College, West Champaran (GECWC).
              Structured for B.Tech CSE Semester 1 to Semester 8 as per the curriculum of Bihar Engineering University (BEU), Patna.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-md border border-slate-700 w-fit">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>GEC West Champaran, Kumarbagh, Bettiah, Bihar - 845450</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Strictly Academic Platform • All Uploads Moderated Before Publication</span>
            </div>
          </div>

          {/* Col 2: Semester Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              CSE Semesters
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <button
                  key={sem}
                  onClick={() => {
                    if (onSelectSemester) onSelectSemester(sem);
                    setCurrentRoute('semesters');
                  }}
                  className="text-left py-1 text-slate-400 hover:text-amber-400 transition"
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Portal Navigation & Policies */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Academic Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentRoute('home')} className="text-slate-400 hover:text-white transition">
                  Academic Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('subjects')} className="text-slate-400 hover:text-white transition">
                  Subjects & Unit Syllabus
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('search')} className="text-slate-400 hover:text-white transition">
                  Search Study Materials
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('upload')} className="text-slate-400 hover:text-white transition">
                  Student Notes Upload
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('contact')} className="text-amber-400 font-semibold hover:text-amber-300 transition flex items-center gap-1.5">
                  <span>Contact Developer & Support</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('login')} className="text-slate-400 hover:text-white transition">
                  Faculty & Admin Login
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Lead Developer Credit Banner */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-900/60 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-400 text-white flex items-center justify-center shadow-lg font-mono font-black text-xl shrink-0">
                &lt;/&gt;
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Portal Developer & System Architect
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Creator
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight font-serif">
                  Shubh Kumar Jha
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  B.Tech (2025–2029) • Computer Science & Engineering (CSE)
                </p>
                <p className="text-[11px] text-slate-400">
                  Government Engineering College, West Champaran (GECWC)
                </p>
              </div>
            </div>

            <div className="text-center md:text-right border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 w-full md:w-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                <span>Designed & Engineered with ❤️ for GECWC</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                BEU Patna Affiliated • B.Tech CSE Academic Repository
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Government Engineering College, West Champaran (GECWC). All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Developed by <strong className="text-amber-400 font-semibold">Shubh Kumar Jha</strong> (B.Tech 2025–2029 CSE)</span>
            <span>•</span>
            <span>BEU Patna</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
