import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  Layers,
  Users,
  Flag,
  BarChart3,
  History,
  Settings,
  ArrowLeft,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  AlertOctagon,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function AdminLayout({
  activeAdminTab,
  setActiveAdminTab,
  setCurrentRoute,
  onPreviewNote,
  onDownloadNote,
  children
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security Gate: Verify user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-xl max-w-md w-full text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The <strong>GECWC Academic Administration Panel</strong> is strictly restricted to the College Administrator (<strong>Shubh Kumar Jha</strong>).
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setCurrentRoute('login')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition shadow-xs"
            >
              Sign In with Administrator Credentials
            </button>
            <button
              onClick={() => setCurrentRoute('home')}
              className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              Return to Student Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submissions', label: 'Submission Review', icon: FileCheck },
    { id: 'content', label: 'Content Management', icon: Layers },
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
    { id: 'messages', label: 'Student Inquiries', icon: MessageSquare, adminOnly: true },
    { id: 'reports', label: 'Academic Reports', icon: Flag },
    { id: 'analytics', label: 'Portal Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Activity Audit Log', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-serif tracking-tight">
                  GECWC Admin Panel
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                  user.role === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Government Engineering College, West Champaran (CSE)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Student Portal Button */}
          <button
            onClick={() => setCurrentRoute('home')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Student View</span>
          </button>

          {/* Admin Identity */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[10px] text-slate-400">{user.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content) */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-14.5 left-0 z-20 h-[calc(100vh-58px)] w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-3 space-y-6 overflow-y-auto">
            {/* Sidebar Section: Moderation & Control */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Academic Operations
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  if (item.adminOnly && user.role !== 'admin') return null;
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveAdminTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'translate-x-0.5' : ''}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Institutional Metadata Card */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Academic Policy
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All submissions require strict syllabus verification against the AKU/BEU CSE curriculum before approval.
              </p>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>GECWC v1.0 • CSE</span>
            <span className="text-emerald-400 font-mono">System Live</span>
          </div>
        </aside>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
