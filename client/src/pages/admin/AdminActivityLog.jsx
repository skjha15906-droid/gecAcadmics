import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { History, Shield, Calendar, User, Filter, Search } from 'lucide-react';

export default function AdminActivityLog() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/admin/activity-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      l.details.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.user_name.toLowerCase().includes(term)
    );
  });

  const getActionBadge = (action) => {
    if (action.includes('APPROVE')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('REJECT')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('CREATE')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('SUSPEND')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <History className="w-4 h-4" />
          <span>Accountability Audit</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Admin Activity Audit Log
        </h1>
        <p className="text-xs text-slate-500">
          Immutable chronological record of moderation and administrative decisions made on the platform.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by admin or action..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {filteredLogs.length} logged events
        </span>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading audit history...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
          No activity logs recorded matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator / Moderator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.user_name}</div>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">{log.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
