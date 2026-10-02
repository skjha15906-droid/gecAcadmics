import React from 'react';
import {
  X,
  Download,
  Flag,
  FileText,
  Calendar,
  User,
  CheckCircle,
  BookOpen,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';
import { formatBytes } from './NoteCard';

export default function NotePreviewModal({
  note,
  onClose,
  onDownload,
  onReport
}) {
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                  Sem {note.sem_number || note.semester_id}
                </span>
                <span className="text-xs text-slate-300 font-semibold truncate max-w-[320px]">
                  {note.subject_code ? `${note.subject_code} • ` : ''}{note.subject_name}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Unit & Metadata Strip */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Curriculum Unit
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {note.unit_title || `Unit ${note.unit_number || 'N/A'}`}
                </span>
              </div>

              {note.topic && (
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Specific Topic
                  </span>
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {note.topic}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Uploaded By</span>
                <span className="font-semibold text-slate-700">{note.uploader_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Resource Type</span>
                <span className="font-semibold text-slate-700">{note.resource_type || 'Study Notes'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">File Specs</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {note.file_type || 'PDF'} • {formatBytes(note.file_size)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[11px]">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Note Summary & Syllabus Scope
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {note.description || 'Comprehensive handwritten and verified academic resource for CSE examination preparation.'}
            </p>
          </div>

          {/* Document Preview Viewer Box */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-inner overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-blue-600" />
                Document Content Preview ({note.file_name})
              </span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                Verified Document
              </span>
            </div>

            {/* Embedded Academic Content Simulator */}
            <div className="p-6 bg-slate-50 font-serif text-slate-800 space-y-4 max-h-72 overflow-y-auto border-dashed border-2 border-slate-200 m-3 rounded-lg">
              <div className="text-center pb-3 border-b border-slate-300">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-sans font-bold">
                  Government Engineering College, West Champaran
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  Department of Computer Science & Engineering • Semester {note.sem_number || note.semester_id}
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-sans text-slate-700 leading-relaxed">
                <div>
                  <strong className="text-slate-900">1. Syllabus & Subject Reference:</strong>
                  <p className="mt-1 text-slate-600">
                    Subject: {note.subject_code} - {note.subject_name} | Unit: {note.unit_title}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-900">2. Key Concepts & Formulas:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                    <li>Core architectural definitions and algorithmic time complexities.</li>
                    <li>Step-by-step mathematical deductions, proofs, and circuit/pointer diagrams.</li>
                    <li>AKU / BEU previous year question patterns and solutions.</li>
                  </ul>
                </div>

                <div className="bg-amber-50/70 p-3 rounded border border-amber-200/60 text-amber-900 text-xs">
                  <strong>Academic Verification Stamp:</strong> This material has been reviewed for academic accuracy and syllabus alignment by the GECWC CSE academic moderation committee.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-white px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onReport && onReport(note)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition px-2.5 py-1.5 rounded hover:bg-rose-50"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Resource</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={() => onDownload && onDownload(note)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Resource</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
