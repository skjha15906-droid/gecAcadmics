import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  ShieldAlert,
  UserX,
  UserCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  Trash2
} from 'lucide-react';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} user "${user.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      setNotification(`User ${user.name} is now ${newStatus}.`);
      loadUsers();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (!window.confirm(`Change role of ${user.name} to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setNotification(`Role updated to ${newRole}.`);
      loadUsers();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE:\nAre you sure you want to completely remove student "${user.name}" (${user.email})?\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete student');
      }

      setNotification(data.message || `Student ${user.name} removed successfully.`);
      loadUsers();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.roll_number && u.roll_number.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Identity & Access Control</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          User Management
        </h1>
        <p className="text-xs text-slate-500">
          Manage enrolled CSE scholars, moderators, and administration privileges.
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, reg number, email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-blue-600"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading user directory...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Reg No / ID</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Uploads (Appr / Rej)</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/80 transition ${isSuspended ? 'bg-rose-50/30' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.roll_number || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {u.semester ? (
                          <span className="font-semibold text-blue-700">Sem {u.semester}</span>
                        ) : (
                          <span className="text-slate-400">Faculty</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                          u.role === 'moderator' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800">
                          {u.total_uploads || 0} total
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          <span className="text-emerald-600 font-bold">{u.approved_uploads || 0}</span> / <span className="text-rose-600 font-bold">{u.rejected_uploads || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isCurrent && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border transition ${
                                isSuspended
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              }`}
                              title={isSuspended ? 'Activate account' : 'Suspend account'}
                            >
                              {isSuspended ? <UserCheck className="w-4 h-4 inline" /> : <UserX className="w-4 h-4 inline" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition"
                              title="Permanently remove student account"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>

                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u, e.target.value)}
                              className="text-[10px] rounded border border-slate-300 py-1 px-1 bg-white font-medium"
                            >
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
