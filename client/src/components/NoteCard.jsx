import React from 'react';
import {
  FileText,
  Download,
  Eye,
  Flag,
  Calendar,
  User,
  ExternalLink,
  BookOpen,
  FileCheck
} from 'lucide-react';

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function NoteCard({
  note,
  onPreview,
  onDownload,
  onReport
}) {
  const getFileTypeBadge = (type) => {
    const t = (type || 'PDF').toUpperCase();
    if (t === 'PDF') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (t.includes('PPT')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (t.includes('DOC')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner / Academic Hierarchy Badges */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="bg-slate-900 text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded font-mono">
            Sem {note.sem_number || note.semester_id}
          </span>
          <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[11px] font-semibold px-2 py-0.5 rounded">
            {note.subject_code ? `${note.subject_code}: ` : ''}{note.subject_name || 'Subject'}
          </span>
          {note.unit_title && (
            <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded truncate max-w-[190px]">
              {note.unit_title.split(':')[0]}
            </span>
          )}
        </div>

        {/* Note Title */}
        <h3
          onClick={() => onPreview && onPreview(note)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition cursor-pointer line-clamp-2 mb-1.5"
          title={note.title}
        >
          {note.title}
        </h3>

        {/* Topic info */}
        {note.topic && (
          <div className="text-xs font-medium text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-md mb-2 flex items-center gap-1.5 w-fit border border-amber-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="truncate max-w-[280px]">Topic: {note.topic}</span>
          </div>
        )}

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
          {note.description || 'Verified academic study material and handwritten notes for CSE students.'}
        </p>

        {/* Metadata info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[160px]">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{note.uploader_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Views">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {note.views_count || 0}
            </span>
            <span className="flex items-center gap-1" title="Downloads">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              {note.downloads_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer / File Type & Action Bar */}
      <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getFileTypeBadge(note.file_type)}`}>
            {note.file_type || 'PDF'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {formatBytes(note.file_size)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPreview && onPreview(note)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-white rounded border border-slate-200 transition"
            title="Preview Study Note"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={() => onDownload && onDownload(note)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition shadow-2xs"
            title="Download Document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => onReport && onReport(note)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
            title="Report this note"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
