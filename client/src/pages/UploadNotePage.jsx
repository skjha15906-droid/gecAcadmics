import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  User,
  Info
} from 'lucide-react';

export default function UploadNotePage({ setCurrentRoute }) {
  const { user, token, login } = useAuth();

  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  // Form State
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('Handwritten Notes');
  const [selectedFile, setSelectedFile] = useState(null);

  // Duplicate Check & Validation State
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch semesters on mount
  useEffect(() => {
    async function loadSemesters() {
      try {
        const res = await fetch('/api/semesters');
        if (res.ok) {
          const data = await res.json();
          setSemesters(data.semesters || []);
          // If logged-in student has a semester, pre-select it
          if (user?.semester) {
            const match = data.semesters.find(s => s.sem_number === user.semester);
            if (match) setSemesterId(String(match.id));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSemesters();
  }, [user]);

  // 2. Fetch subjects when semester changes
  useEffect(() => {
    async function loadSubjects() {
      if (!semesterId) {
        setSubjects([]);
        setSubjectId('');
        setUnits([]);
        setUnitId('');
        return;
      }

      try {
        const res = await fetch(`/api/subjects?semester_id=${semesterId}`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } catch (e) {
        console.error(e);
      }
      setSubjectId('');
      setUnits([]);
      setUnitId('');
    }
    loadSubjects();
  }, [semesterId]);

  // 3. Fetch units when subject changes
  useEffect(() => {
    async function loadUnits() {
      if (!subjectId) {
        setUnits([]);
        setUnitId('');
        return;
      }

      try {
        const res = await fetch(`/api/units?subject_id=${subjectId}`);
        if (res.ok) {
          const data = await res.json();
          setUnits(data.units || []);
        }
      } catch (e) {
        console.error(e);
      }
      setUnitId('');
    }
    loadUnits();
  }, [subjectId]);

  // Duplicate check on title change/blur
  const handleTitleBlur = async () => {
    if (!title.trim() || title.trim().length < 5) return;
    setCheckingDuplicate(true);
    try {
      const res = await fetch('/api/uploads/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          subject_id: subjectId,
          unit_id: unitId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hasSimilar) {
          setDuplicateWarning(data);
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB maximum limit.');
      setSelectedFile(null);
      return;
    }

    // Check allowed extensions
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Unsupported file extension. Allowed formats: ${allowed.join(', ')}`);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in to contribute notes.');
      return;
    }

    if (!semesterId || !subjectId || !unitId || !title.trim() || !selectedFile) {
      setError('Please fill in all mandatory fields and attach a study document.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('semester_id', semesterId);
    formData.append('subject_id', subjectId);
    formData.append('unit_id', unitId);
    formData.append('title', title.trim());
    formData.append('topic', topic.trim());
    formData.append('description', description.trim());
    formData.append('resource_type', resourceType);
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/uploads/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit academic note.');
      }

      setSubmittedSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // If not logged in, prompt user to log in or use demo student login
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Student Authentication Required
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            To maintain academic integrity and accountability, only authenticated students and faculty of GEC West Champaran can upload study resources.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto">
          <button
            onClick={() => setCurrentRoute('login')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition"
          >
            Login or Register Account
          </button>
        </div>
      </div>
    );
  }

  // After successful submission
  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Submitted for Academic Moderation
            </h2>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
              “Your note has been submitted successfully and is waiting for academic moderation.”
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Our faculty and moderator team will verify the syllabus mapping, file readability, and academic quality before making it publicly visible in the GECWC CSE repository.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setCurrentRoute('my-uploads')}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>Track in My Uploads</span>
            </button>

            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setTitle('');
                setTopic('');
                setDescription('');
                setSelectedFile(null);
                setDuplicateWarning(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition"
            >
              Upload Another Resource
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <UploadCloud className="w-4 h-4" />
          <span>Student Contribution System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Upload Academic Notes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Share peer-reviewed study materials, lecture summaries, formula sheets, or solved question banks for CSE students.
        </p>
      </div>

      {/* Strict Academic Moderation Notice Banner (Requirement 8) */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-2xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-950 block">
            Academic Moderation Workflow Policy:
          </strong>
          <span>
            Student Upload → Pending Review → Admin/Moderator Review → Approve/Reject → Publish.
            Uploaded content will <strong>NEVER become publicly visible immediately</strong>. It will be reviewed by college moderators to ensure it strictly belongs to the CSE curriculum.
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Academic Hierarchy (Semester -> Subject -> Unit) */}
        <div className="space-y-4 pt-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Academic Syllabus Mapping (Predefined Hierarchy)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester *
              </label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                required
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!semesterId || subjects.length === 0}
                required
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {semesterId ? (subjects.length > 0 ? 'Select Subject' : 'No subjects found') : 'Select Semester first'}
                </option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit *
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                disabled={!subjectId || units.length === 0}
                required
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {subjectId ? (units.length > 0 ? 'Select Unit' : 'No units defined') : 'Select Subject first'}
                </option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Note: Students can only map notes to predefined academic semesters, subjects, and units.
          </p>
        </div>

        {/* 2. Note Details */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Study Resource Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              required
              placeholder="e.g. Complete Binary Search Trees & AVL Rotations Handwritten Notes"
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
            />
          </div>

          {/* Duplicate Detection Warning Banner (Requirement 13) */}
          {duplicateWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>“A similar resource may already exist. Please check before submitting.”</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Found {duplicateWarning.matches?.length} existing approved resource(s) with a similar title in this subject:
              </p>
              <ul className="text-xs text-amber-950 list-disc list-inside space-y-0.5">
                {duplicateWarning.matches?.map((m) => (
                  <li key={m.id} className="truncate">
                    <strong>{m.title}</strong> by {m.uploader_name}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700">
                You may still submit if your notes cover distinct aspects or provide additional handwritten solutions.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Topic / Sub-Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AVL Tree Rotations & Balanced Insertion"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resource Category *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-blue-600"
              >
                <option value="Handwritten Notes">Handwritten Notes</option>
                <option value="Lecture Slides / PPT">Lecture Slides / PPT</option>
                <option value="Question Bank / PYQ">Question Bank / PYQ</option>
                <option value="Lab Manual">Lab Manual</option>
                <option value="Formula Sheet / Cheatsheet">Formula Sheet / Cheatsheet</option>
                <option value="Reference Textbook Summary">Reference Textbook Summary</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description / Overview
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Highlight key points covered, whether diagrams or solved numericals are included, and relevant textbook references..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-blue-600"
            ></textarea>
          </div>
        </div>

        {/* 3. Document Attachment */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Attach Academic Document
          </h3>

          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition bg-slate-50/50">
            <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-slate-700 font-semibold mb-1">
              {selectedFile ? selectedFile.name : 'Choose a study file or drag & drop'}
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Supported formats: <strong>PDF, DOC, DOCX, PPT, PPTX, JPG, PNG</strong> (Max file size: <strong>25MB</strong>)
            </p>

            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              required
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
            >
              {selectedFile ? 'Change Selected File' : 'Browse File from Device'}
            </label>
          </div>
        </div>

        {/* 4. Submitter Identity Verification */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Submitting as: <strong className="text-slate-800">{user.name}</strong> ({user.email})</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting & Validating...' : 'Submit Note for Review'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
