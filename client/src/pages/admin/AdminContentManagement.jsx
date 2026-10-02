import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Check,
  X
} from 'lucide-react';

export default function AdminContentManagement() {
  const { token, user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('subjects'); // 'semesters', 'subjects', 'units'

  // Data lists
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals for CRUD
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    semester_id: '3',
    code: '',
    name: '',
    description: '',
    is_active: 1
  });

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    subject_id: '',
    unit_number: 1,
    title: '',
    description: '',
    is_active: 1
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [semRes, subRes, unitRes] = await Promise.all([
        fetch('/api/admin/semesters', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/subjects', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/units', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (semRes.ok) setSemesters((await semRes.json()).semesters || []);
      if (subRes.ok) setSubjects((await subRes.json()).subjects || []);
      if (unitRes.ok) setUnits((await unitRes.json()).units || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Subject CRUD
  const handleOpenSubjectModal = (sub = null) => {
    if (sub) {
      setEditingSubject(sub);
      setSubjectForm({
        semester_id: String(sub.semester_id),
        code: sub.code,
        name: sub.name,
        description: sub.description || '',
        is_active: sub.is_active
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        semester_id: semesters[0] ? String(semesters[0].id) : '3',
        code: '',
        name: '',
        description: '',
        is_active: 1
      });
    }
    setErrorMsg('');
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const url = editingSubject ? `/api/admin/subjects/${editingSubject.id}` : '/api/admin/subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subjectForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save subject');
      }

      setNotification(`Subject ${editingSubject ? 'updated' : 'created'} successfully!`);
      setSubjectModalOpen(false);
      loadData();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteSubject = async (sub) => {
    if (!window.confirm(`Are you sure you want to delete subject "${sub.code}: ${sub.name}"? This action requires no dependent notes to exist.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/subjects/${sub.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete subject');
      }

      setNotification(`Subject ${sub.code} deleted.`);
      loadData();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Unit CRUD
  const handleOpenUnitModal = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        subject_id: String(unit.subject_id),
        unit_number: unit.unit_number,
        title: unit.title,
        description: unit.description || '',
        is_active: unit.is_active
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        subject_id: subjects[0] ? String(subjects[0].id) : '',
        unit_number: 1,
        title: '',
        description: '',
        is_active: 1
      });
    }
    setErrorMsg('');
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const url = editingUnit ? `/api/admin/units/${editingUnit.id}` : '/api/admin/units';
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(unitForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save unit');
      }

      setNotification(`Unit ${editingUnit ? 'updated' : 'created'} successfully!`);
      setUnitModalOpen(false);
      loadData();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Are you sure you want to delete unit "${unit.title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/units/${unit.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete unit');
      }

      setNotification(`Unit deleted successfully.`);
      loadData();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Curriculum Authority</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Content Management
          </h1>
          <p className="text-xs text-slate-500">
            Control the academic hierarchy: Semesters (1-8), Subjects, and Syllabus Units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'subjects' && (
            <button
              onClick={() => handleOpenSubjectModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Subject</span>
            </button>
          )}

          {activeSubTab === 'units' && (
            <button
              onClick={() => handleOpenUnitModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Unit</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs w-fit text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeSubTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('units')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeSubTab === 'units'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Syllabus Units ({units.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('semesters')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeSubTab === 'semesters'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Semesters 1-8 ({semesters.length})</span>
        </button>
      </div>

      {/* View 1: Subjects Management */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Units Defined</th>
                  <th className="py-3 px-4">Notes Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {sub.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {sub.name}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">
                      Sem {sub.sem_number}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {sub.units_count} Units
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {sub.notes_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {sub.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenSubjectModal(sub)}
                        className="p-1 text-slate-500 hover:text-indigo-600 transition"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteSubject(sub)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Subject safely"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Units Management */}
      {activeSubTab === 'units' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Unit #</th>
                  <th className="py-3 px-4">Unit Title & Scope</th>
                  <th className="py-3 px-4">Notes Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {u.subject_code} (Sem {u.sem_number})
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      Unit {u.unit_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{u.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {u.notes_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenUnitModal(u)}
                        className="p-1 text-slate-500 hover:text-indigo-600 transition"
                        title="Edit Unit"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteUnit(u)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Unit safely"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Semesters Management */}
      {activeSubTab === 'semesters' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            Pre-defined Semesters 1 to 8. Students cannot modify semesters.
          </div>
          <div className="divide-y divide-slate-100">
            {semesters.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-slate-900 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                    S{s.sem_number}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-400">{s.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-medium text-slate-600">{s.subjects_count} Subjects</span>
                  <span className="font-medium text-slate-600">{s.notes_count} Notes</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Subject Add/Edit */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add New Curriculum Subject'}
              </h3>
              <button onClick={() => setSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Semester *</label>
                <select
                  value={subjectForm.semester_id}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semester_id: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600 bg-white"
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS301"
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono uppercase focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  rows={2}
                  placeholder="Brief curriculum description..."
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Unit Add/Edit */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingUnit ? `Edit Unit: ${editingUnit.title}` : 'Add Syllabus Unit'}
              </h3>
              <button onClick={() => setUnitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveUnit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Assign to Subject *</label>
                <select
                  value={unitForm.subject_id}
                  onChange={(e) => setUnitForm({ ...unitForm, subject_id: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600 bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code}: {sub.name} (Sem {sub.sem_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Unit Number (1 - 6) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={unitForm.unit_number}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_number: parseInt(e.target.value, 10) })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Unit Title *</label>
                <input
                  type="text"
                  required
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  placeholder="e.g. Unit 3: Binary Trees and BST Operations"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Topics & Syllabus Outline</label>
                <textarea
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  rows={3}
                  placeholder="Summary of topics, algorithms, or theories taught in this unit..."
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-blue-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUnitModalOpen(false)}
                  className="px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
