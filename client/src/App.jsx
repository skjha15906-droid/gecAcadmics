import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotePreviewModal from './components/NotePreviewModal';
import ReportModal from './components/ReportModal';

// Student Pages
import HomePage from './pages/HomePage';
import SemestersPage from './pages/SemestersPage';
import SubjectsPage from './pages/SubjectsPage';
import NotesSearchPage from './pages/NotesSearchPage';
import UploadNotePage from './pages/UploadNotePage';
import MyUploadsPage from './pages/MyUploadsPage';
import LoginPage from './pages/LoginPage';
import ContactUsPage from './pages/ContactUsPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminContentManagement from './pages/admin/AdminContentManagement';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Active admin tab
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [highlightSubmissionId, setHighlightSubmissionId] = useState(null);

  // Global modals
  const [previewNote, setPreviewNote] = useState(null);
  const [reportingNote, setReportingNote] = useState(null);

  // Handle URL hash changes or back/forward
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (['home', 'semesters', 'subjects', 'search', 'upload', 'my-uploads', 'login', 'admin', 'contact'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = (note) => {
    // Open download endpoint
    const downloadUrl = `/api/notes/${note.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', note.file_name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Locally increment download count in preview if open
    if (previewNote && previewNote.id === note.id) {
      setPreviewNote(prev => ({ ...prev, downloads_count: (prev.downloads_count || 0) + 1 }));
    }
  };

  const handlePreview = async (note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewNote(data.note);
      } else {
        // Fallback to passed note
        setPreviewNote(note);
      }
    } catch (e) {
      setPreviewNote(note);
    }
  };

  const handleReport = (note) => {
    setReportingNote(note);
  };

  const renderAdminView = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            setActiveAdminTab={setActiveAdminTab}
            onOpenSubmissionReview={(id) => {
              setHighlightSubmissionId(id);
              setActiveAdminTab('submissions');
            }}
          />
        );
      case 'submissions':
        return (
          <AdminSubmissions
            onPreviewNote={handlePreview}
            initialHighlightId={highlightSubmissionId}
          />
        );
      case 'content':
        return <AdminContentManagement />;
      case 'users':
        return <AdminUsers />;
      case 'messages':
        return <AdminMessages />;
      case 'reports':
        return <AdminReports onPreviewNote={handlePreview} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'logs':
        return <AdminActivityLog />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard setActiveAdminTab={setActiveAdminTab} />;
    }
  };

  // Render Admin View if on 'admin' route
  if (currentRoute === 'admin') {
    return (
      <>
        <AdminLayout
          activeAdminTab={activeAdminTab}
          setActiveAdminTab={setActiveAdminTab}
          setCurrentRoute={navigateTo}
          onPreviewNote={handlePreview}
          onDownloadNote={handleDownload}
        >
          {renderAdminView()}
        </AdminLayout>

        {previewNote && (
          <NotePreviewModal
            note={previewNote}
            onClose={() => setPreviewNote(null)}
            onDownload={handleDownload}
            onReport={handleReport}
          />
        )}
      </>
    );
  }

  // Render Student / Public Portal Views
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        currentRoute={currentRoute}
        setCurrentRoute={navigateTo}
        onSelectSemester={(sem) => {
          setSelectedSemester(sem);
          navigateTo('semesters');
        }}
      />

      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage
            setCurrentRoute={navigateTo}
            onSelectSemester={(sem) => {
              setSelectedSemester(sem);
              navigateTo('semesters');
            }}
            onSelectSubject={(sub) => {
              setSelectedSubject(sub);
              navigateTo('subjects');
            }}
            setGlobalSearchQuery={setGlobalSearchQuery}
            onPreviewNote={handlePreview}
            onDownloadNote={handleDownload}
            onReportNote={handleReport}
          />
        )}

        {currentRoute === 'semesters' && (
          <SemestersPage
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            setCurrentRoute={navigateTo}
            onPreviewNote={handlePreview}
            onDownloadNote={handleDownload}
            onReportNote={handleReport}
          />
        )}

        {currentRoute === 'subjects' && (
          <SubjectsPage
            setCurrentRoute={navigateTo}
            onSelectSemester={(sem) => {
              setSelectedSemester(sem);
              navigateTo('semesters');
            }}
            setGlobalSearchQuery={setGlobalSearchQuery}
          />
        )}

        {currentRoute === 'search' && (
          <NotesSearchPage
            globalSearchQuery={globalSearchQuery}
            setGlobalSearchQuery={setGlobalSearchQuery}
            onPreviewNote={handlePreview}
            onDownloadNote={handleDownload}
            onReportNote={handleReport}
          />
        )}

        {currentRoute === 'upload' && (
          <UploadNotePage setCurrentRoute={navigateTo} />
        )}

        {currentRoute === 'my-uploads' && (
          <MyUploadsPage
            setCurrentRoute={navigateTo}
            onPreviewNote={handlePreview}
            onDownloadNote={handleDownload}
          />
        )}

        {currentRoute === 'login' && (
          <LoginPage setCurrentRoute={navigateTo} />
        )}

        {currentRoute === 'contact' && (
          <ContactUsPage />
        )}
      </main>

      <Footer
        setCurrentRoute={navigateTo}
        onSelectSemester={(sem) => {
          setSelectedSemester(sem);
          navigateTo('semesters');
        }}
      />

      {/* Global Modals */}
      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          onDownload={handleDownload}
          onReport={handleReport}
        />
      )}

      {reportingNote && (
        <ReportModal
          note={reportingNote}
          onClose={() => setReportingNote(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
