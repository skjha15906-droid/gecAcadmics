import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Layers,
  FileText,
  TrendingUp,
  DownloadCloud,
  Clock
} from 'lucide-react';
import NoteCard from '../components/NoteCard';

export default function NotesSearchPage({
  globalSearchQuery,
  setGlobalSearchQuery,
  onPreviewNote,
  onDownloadNote,
  onReportNote
}) {
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  // Selected filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [sortOption, setSortOption] = useState('latest'); // 'latest', 'views', 'downloads'

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Sync global query if changed from parent
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchTerm(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // 1. Load Semesters on mount
  useEffect(() => {
    async function loadSemesters() {
      try {
        const res = await fetch('/api/semesters');
        if (res.ok) {
          const data = await res.json();
          setSemesters(data.semesters || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSemesters();
  }, []);

  // 2. Load Subjects when Semester changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedSemester) {
        // Load all subjects
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } else {
        const res = await fetch(`/api/subjects?semester_id=${selectedSemester}`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      }
      setSelectedSubject('');
      setSelectedUnit('');
      setUnits([]);
    }
    loadSubjects();
  }, [selectedSemester]);

  // 3. Load Units when Subject changes
  useEffect(() => {
    async function loadUnits() {
      if (selectedSubject) {
        const res = await fetch(`/api/units?subject_id=${selectedSubject}`);
        if (res.ok) {
          const data = await res.json();
          setUnits(data.units || []);
        }
      } else {
        setUnits([]);
      }
      setSelectedUnit('');
    }
    loadUnits();
  }, [selectedSubject]);

  // 4. Fetch Notes based on all filters
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester_id', selectedSemester);
      if (selectedSubject) params.append('subject_id', selectedSubject);
      if (selectedUnit) params.append('unit_id', selectedUnit);
      if (selectedResourceType) params.append('resource_type', selectedResourceType);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (sortOption) params.append('sort', sortOption);

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSemester, selectedSubject, selectedUnit, selectedResourceType, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    if (setGlobalSearchQuery) setGlobalSearchQuery('');
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedUnit('');
    setSelectedResourceType('');
    setSortOption('latest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>CSE Repository Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Search Academic Materials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Filter by semester, subject, unit, and resource type. Try searching for specific algorithms, theorems, or topics.
        </p>
      </div>

      {/* Main Search Bar & Quick Submit */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center shadow-xs rounded-xl overflow-hidden border border-slate-300 focus-within:border-blue-600 bg-white">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5 text-blue-700" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search note title, subject, unit, topic or description (e.g. 'Stack', 'Paging', 'Dijkstra')..."
            className="w-full py-3.5 px-3 text-sm font-medium text-slate-900 focus:outline-hidden"
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3.5 font-semibold text-xs sm:text-sm transition shrink-0"
          >
            Find Notes
          </button>
        </div>
      </form>

      {/* Structured Multi-Filter Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Academic Filters</span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
            >
              <option value="">All Semesters (1 - 8)</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject (dependent on semester) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Unit (dependent on subject) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Unit
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedSubject || units.length === 0}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">All Units</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Resource Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Resource Type
            </label>
            <select
              value={selectedResourceType}
              onChange={(e) => setSelectedResourceType(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
            >
              <option value="">All Types</option>
              <option value="Handwritten Notes">Handwritten Notes</option>
              <option value="Lecture Slides / PPT">Lecture Slides / PPT</option>
              <option value="Question Bank / PYQ">Question Bank / PYQ</option>
              <option value="Lab Manual">Lab Manual</option>
              <option value="Formula Sheet / Cheatsheet">Formula Sheet / Cheatsheet</option>
              <option value="Reference Textbook Summary">Reference Textbook Summary</option>
            </select>
          </div>
        </div>

        {/* Sorting Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{notes.length}</strong> approved note(s) {totalCount > 0 ? `(out of ${totalCount})` : ''}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Sort By:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setSortOption('latest')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                  sortOption === 'latest' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Latest</span>
              </button>
              <button
                onClick={() => setSortOption('views')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                  sortOption === 'views' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Most Viewed</span>
              </button>
              <button
                onClick={() => setSortOption('downloads')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                  sortOption === 'downloads' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                <DownloadCloud className="w-3 h-3" />
                <span>Most Downloaded</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          Loading matching notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching notes found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No approved notes match the selected filters or search keyword. Try clearing some filters or searching with a different academic term.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPreview={onPreviewNote}
              onDownload={onDownloadNote}
              onReport={onReportNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
