import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Layers,
  Award,
  DownloadCloud,
  Eye,
  BookOpen
} from 'lucide-react';

export default function AdminAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchAnalytics();
  }, [token]);

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-500">Loading analytics...</div>;
  }

  const { notesBySemester = [], notesBySubject = [], topContributors = [], topViewed = [] } = data || {};
  const maxSemesterCount = Math.max(...notesBySemester.map(s => s.count), 1);
  const maxSubjectCount = Math.max(...notesBySubject.map(s => s.count), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Curriculum Telemetry</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Portal Analytics & Repository Insights
        </h1>
        <p className="text-xs text-slate-500">
          Distribution of approved academic study materials, engagement metrics, and top student contributors.
        </p>
      </div>

      {/* Grid: Charts & Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Notes By Semester */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Notes by Semester</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Sem 1 - 8</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {notesBySemester.map((sem) => {
              const pct = Math.round((sem.count / maxSemesterCount) * 100);
              return (
                <div key={sem.sem_number} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{sem.name}</span>
                    <span className="font-mono text-slate-500">{sem.count} notes</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top Subjects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Top Subjects by Volume</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Approved Materials</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {notesBySubject.slice(0, 6).map((sub) => {
              const pct = Math.round((sub.count / maxSubjectCount) * 100);
              return (
                <div key={sub.code} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                      {sub.code}: {sub.name}
                    </span>
                    <span className="font-mono text-slate-500">{sub.count} notes</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Top Contributors & Most Popular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Student Contributors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Student Contributors</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topContributors.map((c, i) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-800">{c.approved_notes} Approved</div>
                  <div className="text-[10px] text-slate-400">{c.total_downloads || 0} Downloads</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Consulted Notes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Most Viewed Academic Notes</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topViewed.map((note) => (
              <div key={note.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="truncate max-w-[240px]">
                  <div className="font-bold text-slate-800 truncate">{note.title}</div>
                  <div className="text-[11px] text-slate-400">By {note.uploader_name}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 text-slate-600 font-mono">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> {note.views_count}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-mono">
                    <DownloadCloud className="w-3.5 h-3.5 text-slate-400" /> {note.downloads_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
