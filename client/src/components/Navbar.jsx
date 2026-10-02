import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Layers,
  UploadCloud,
  FileText,
  Search,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Mail
} from 'lucide-react';

export default function Navbar({ currentRoute, setCurrentRoute, onSelectSemester }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'semesters', label: 'Semesters', icon: Layers },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'upload', label: 'Upload Notes', icon: UploadCloud },
    ...(user ? [{ id: 'my-uploads', label: 'My Uploads', icon: FileText }] : []),
    { id: 'search', label: 'Search', icon: Search },
    { id: 'contact', label: 'Contact Us', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Academic Institution Notice Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-100">Government Engineering College, West Champaran (GECWC)</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-amber-400 font-semibold hidden sm:inline">Department of Computer Science & Engineering</span>
        </div>

        <div className="text-[11px] text-slate-400 hidden md:block">
          B.Tech CSE Academic Repository • BEU Patna Affiliated
        </div>
      </div>

      {/* Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Identity */}
          <div
            onClick={() => setCurrentRoute('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                  GECWC <span className="text-blue-700 font-sans">Academics</span>
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CSE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Govt. Engineering College, West Champaran
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentRoute(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Admin Panel button if Admin */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentRoute('admin')}
                className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition ${
                  currentRoute === 'admin'
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Admin Panel</span>
                <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-mono uppercase">
                  {user.role}
                </span>
              </button>
            )}
          </nav>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{user.role} {user.semester ? `• Sem ${user.semester}` : ''}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                      {user.roll_number && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Roll: {user.roll_number}</p>
                      )}
                    </div>
                    <button
                      onClick={() => { setCurrentRoute('my-uploads'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      My Uploaded Notes
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setCurrentRoute('admin'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-indigo-600" />
                        Admin Dashboard
                      </button>
                    )}
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentRoute('login')}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-xs transition"
              >
                <User className="w-4 h-4" />
                Student / Admin Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentRoute(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          {user?.role === 'admin' && (
            <button
              onClick={() => { setCurrentRoute('admin'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold bg-indigo-50 text-indigo-700"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              Admin Panel
            </button>
          )}

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setCurrentRoute('login'); setMobileMenuOpen(false); }}
                className="w-full text-center bg-blue-700 text-white py-2 rounded-md text-sm font-semibold mt-1"
              >
                Login to Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
