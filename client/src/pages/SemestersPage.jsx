import React, { useState, useEffect } from 'react';
import {
  Layers,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  FileText,
  Search,
  CheckCircle2,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import NoteCard from '../components/NoteCard';

export default function SemestersPage({
  selectedSemester,
  setSelectedSemester,
  setCurrentRoute,
  onPreviewNote,
  onDownloadNote,
  onReportNote
}) {
  const [semesters, setSemesters] = useState([]);
  const [currentSemNumber, setCurrentSemNumber] = useState(selectedSemester || 3);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load all 8 semesters
  useEffect(() => {
    async function fetchSemesters() {
      try {
        const res = await fetch('/api/semesters');
        if (res.ok) {
          const data = await res.json();
          setSemesters(data.semesters || []);
        }
      } catch (e) {
        console.error('Error fetching semesters:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSemesters();
  }, []);

  // Update current sem if prop changes
  useEffect(() => {
    if (selectedSemester) {
      setCurrentSemNumber(selectedSemester);
      setSelectedSubject(null);
      setSelectedUnit(null);
    }
  }, [selectedSemester]);

  // Load subjects when current semester changes
  useEffect(() => {
    async function fetchSubjects() {
      const semObj = semesters.find(s => s.sem_number === currentSemNumber);
      if (!semObj) return;

      try {
        const res = await fetch(`/api/subjects?semester_id=${semObj.id}`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } catch (e) {
        console.error('Error fetching subjects:', e);
      }
    }

    if (semesters.length > 0) {
      fetchSubjects();
    }
  }, [currentSemNumber, semesters]);

  // Load units when subject is selected
  const handleSelectSubject = async (sub) => {
    setSelectedSubject(sub);
    setSelectedUnit(null);
    setNotes([]);

    try {
      const res = await fetch(`/api/units?subject_id=${sub.id}`);
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
        // Also fetch all notes for this subject
        loadSubjectNotes(sub.id);
      }
    } catch (e) {
      console.error('Error fetching units:', e);
    }
  };

  // Load notes for a specific unit or subject
  const loadSubjectNotes = async (subId, unitId = null) => {
    setLoadingNotes(true);
    try {
      let url = `/api/notes?subject_id=${subId}`;
      if (unitId) {
        url += `&unit_id=${unitId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    loadSubjectNotes(selectedSubject.id, unit.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Breadcrumbs */}
      <div>
        {/* Academic Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mb-3">
          <span className="bg-slate-900 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">
            CSE BRANCH
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => { setSelectedSubject(null); setSelectedUnit(null); }}
            className={`hover:text-blue-700 transition ${!selectedSubject ? 'text-blue-700 font-bold' : ''}`}
          >
            Semester {currentSemNumber}
          </button>
          {selectedSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setSelectedUnit(null)}
                className={`hover:text-blue-700 transition ${!selectedUnit ? 'text-blue-700 font-bold' : ''}`}
              >
                {selectedSubject.code}: {selectedSubject.name}
              </button>
            </>
          )}
          {selectedUnit && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">{selectedUnit.title.split(':')[0]}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Academic Hierarchy Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select Semester → Choose Subject → Inspect Unit Syllabus → Access Approved Notes
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 text-xs text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Academic Structure is pre-defined by College Administration.</span>
          </div>
        </div>
      </div>

      {/* 8 Predefined Semesters Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const isSelected = currentSemNumber === sem;
            return (
              <button
                key={sem}
                onClick={() => {
                  setCurrentSemNumber(sem);
                  setSelectedSubject(null);
                  setSelectedUnit(null);
                }}
                className={`py-2.5 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">Sem</span>
                <span className="text-base">{sem}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View: Subjects & Units Explorer */}
      {!selectedSubject ? (
        /* 1. Subjects Grid for Current Semester */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <span>Subjects in Semester {currentSemNumber}</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                {subjects.length} Subjects
              </span>
            </h2>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
              No subjects registered yet for Semester {currentSemNumber}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {sub.units_count} Units
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {sub.description || 'Core syllabus subject for Computer Science & Engineering students.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      {sub.notes_count} Approved Notes
                    </span>
                    <span className="font-semibold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Units & Notes <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. Selected Subject Drilldown: Units & Notes */
        <div className="space-y-6">
          {/* Back button & Subject banner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => { setSelectedSubject(null); setSelectedUnit(null); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Semester {currentSemNumber} Subjects</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-900 text-amber-300 font-mono text-xs font-bold px-2 py-0.5 rounded">
                    {selectedSubject.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Semester {currentSemNumber} • CSE Department
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedSubject.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  {selectedSubject.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCurrentRoute('upload');
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Upload Note for this Subject
                </button>
              </div>
            </div>
          </div>

          {/* Unit Filter Strip */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Filter by Unit
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedUnit(null);
                  loadSubjectNotes(selectedSubject.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !selectedUnit
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Units ({selectedSubject.notes_count})
              </button>

              {units.map((u) => {
                const isSelected = selectedUnit?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUnit(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{u.title.split(':')[0]}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {u.notes_count}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedUnit && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <strong className="text-slate-800">{selectedUnit.title}: </strong>
                {selectedUnit.description}
              </div>
            )}
          </div>

          {/* Notes List for Selected Unit / Subject */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {selectedUnit ? `Approved Notes for ${selectedUnit.title}` : `All Approved Notes for ${selectedSubject.name}`}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {notes.length} resource(s) found
              </span>
            </div>

            {loadingNotes ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Loading academic notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No approved notes yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first student to contribute high-quality handwritten notes, formulas, or question banks for this unit!
                </p>
                <button
                  onClick={() => setCurrentRoute('upload')}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Upload Study Note
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
        </div>
      )}
    </div>
  );
}
