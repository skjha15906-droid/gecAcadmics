import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function SubjectsPage({
  setCurrentRoute,
  onSelectSemester,
  setGlobalSearchQuery
}) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSemFilter, setSelectedSemFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [subjectUnits, setSubjectUnits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        let url = '/api/subjects';
        if (selectedSemFilter) {
          url += `?semester_id=${selectedSemFilter}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [selectedSemFilter]);

  const toggleExpand = async (subId) => {
    if (expandedSubjectId === subId) {
      setExpandedSubjectId(null);
      return;
    }

    setExpandedSubjectId(subId);

    // Fetch units if not cached
    if (!subjectUnits[subId]) {
      try {
        const res = await fetch(`/api/units?subject_id=${subId}`);
        if (res.ok) {
          const data = await res.json();
          setSubjectUnits(prev => ({ ...prev, [subId]: data.units || [] }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>CSE Curriculum Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Subjects & Syllabus Units
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official B.Tech Computer Science & Engineering syllabus structure under Bihar Engineering University (BEU).
          </p>
        </div>

        <div className="bg-slate-100 px-3 py-2 rounded-lg text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Curriculum managed by Department of CSE</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter subject by code or name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Semester:</span>
          <select
            value={selectedSemFilter}
            onChange={(e) => setSelectedSemFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-blue-600 w-full sm:w-auto"
          >
            <option value="">All Semesters (1 - 8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading subjects catalog...
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          No matching subjects found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map((sub) => {
            const isExpanded = expandedSubjectId === sub.id;
            const units = subjectUnits[sub.id] || [];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition"
              >
                {/* Subject Summary Header */}
                <div
                  onClick={() => toggleExpand(sub.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-12 h-10 rounded-lg bg-slate-900 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {sub.code}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded font-sans">
                          Semester {sub.sem_number}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {sub.units_count} Units Defined
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {sub.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {sub.notes_count || 0} Approved Notes
                    </span>
                    <button
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Units Details */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-200 p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Syllabus Units Breakdown ({units.length} Units)
                      </h4>
                      <button
                        onClick={() => {
                          setGlobalSearchQuery(sub.name);
                          setCurrentRoute('search');
                        }}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Search all {sub.name} notes</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {units.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">Loading syllabus units...</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {units.map((u) => (
                          <div
                            key={u.id}
                            className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                {u.title}
                              </span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                {u.notes_count} Notes
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {u.description || 'Coverage of key algorithmic and structural principles.'}
                            </p>
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  setGlobalSearchQuery(u.title.split(':')[0]);
                                  setCurrentRoute('search');
                                }}
                                className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
                              >
                                Find notes for this unit <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
