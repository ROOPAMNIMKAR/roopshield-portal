/**
 * App.jsx — Root application component.
 *
 * Provider tree: ThemeProvider → ToastProvider → BrowserRouter → Routes
 * Calls initSeed() and restoreSession() on mount.
 * Shows full-page error if localStorage is unavailable.
 *
 * Requirements: 1.1, 2.4, 17.1, 19.3
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers & guards
import ThemeProvider from './components/ThemeProvider';
import { ToastProvider } from './components/ToastProvider';
import ProtectedLayout from './components/layout/ProtectedLayout';
import AdminLayout from './components/layout/AdminLayout';
import InternLayout from './components/layout/InternLayout';
import HRLayout from './components/layout/HRLayout';

// Services
import useAuthStore from './store/authStore';

// Pages — Auth
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Pages — Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import InternManager from './pages/admin/InternManager';
import AttendanceModule from './pages/admin/AttendanceModule';
import TaskModule from './pages/admin/TaskModule';
import ProgressModule from './pages/admin/ProgressModule';
import AnnouncementModule from './pages/admin/AnnouncementModule';
import ReportModule from './pages/admin/ReportModule';
import ResourcesModule from './pages/admin/ResourcesModule';
import DoubtsModule from './pages/admin/DoubtsModule';
import GuidesModule from './pages/admin/GuidesModule';
import CredentialsManager from './pages/admin/CredentialsManager';
import AdminProfile from './pages/admin/AdminProfile';
import HRModule from './pages/admin/HRModule';

// Pages — Intern
import InternDashboard from './pages/intern/InternDashboard';
import InternProfile from './pages/intern/InternProfile';
import InternAttendance from './pages/intern/InternAttendance';
import InternTasks from './pages/intern/InternTasks';
import InternResources from './pages/intern/InternResources';
import InternDoubts from './pages/intern/InternDoubts';
import InternLeave from './pages/intern/InternLeave';
import InternHRNotices from './pages/intern/InternHRNotices';

// ─── Storage unavailable error screen ────────────────────────────────────────
function StorageUnavailableScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <svg
          className="h-16 w-16 text-danger mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <h1 className="text-xl font-bold text-textPrimary mb-2">Storage Unavailable</h1>
        <p className="text-textSecondary text-sm">
          This application requires browser localStorage to function. Please enable
          cookies and site data, or try a different browser.
        </p>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin routes */}
      <Route element={<ProtectedLayout requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard"     element={<AdminDashboard />} />
          <Route path="/admin/interns"       element={<InternManager />} />
          <Route path="/admin/attendance"    element={<AttendanceModule />} />
          <Route path="/admin/tasks"         element={<TaskModule />} />
          <Route path="/admin/progress"      element={<ProgressModule />} />
          <Route path="/admin/announcements" element={<AnnouncementModule />} />
          <Route path="/admin/resources"     element={<ResourcesModule />} />
          <Route path="/admin/guides"        element={<GuidesModule />} />
          <Route path="/admin/credentials"   element={<CredentialsManager />} />
          <Route path="/admin/hr"            element={<HRModule />} />
          <Route path="/admin/doubts"        element={<DoubtsModule />} />
          <Route path="/admin/reports"       element={<ReportModule />} />
          <Route path="/admin/profile"       element={<AdminProfile />} />
          <Route path="/admin"               element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>

      {/* Intern routes */}
      <Route element={<ProtectedLayout requiredRole="intern" />}>
        <Route element={<InternLayout />}>
          <Route path="/intern/dashboard"  element={<InternDashboard />} />
          <Route path="/intern/profile"    element={<InternProfile />} />
          <Route path="/intern/attendance" element={<InternAttendance />} />
          <Route path="/intern/tasks"      element={<InternTasks />} />
          <Route path="/intern/resources"  element={<InternResources />} />
          <Route path="/intern/doubts"     element={<InternDoubts />} />
          <Route path="/intern/leave"      element={<InternLeave />} />
          <Route path="/intern/hr-notices" element={<InternHRNotices />} />
          <Route path="/intern"            element={<Navigate to="/intern/dashboard" replace />} />
        </Route>
      </Route>

      {/* HR routes — full access, same pages as admin */}
      <Route element={<ProtectedLayout requiredRole="hr" />}>
        <Route element={<HRLayout />}>
          <Route path="/hr/dashboard"     element={<AdminDashboard />} />
          <Route path="/hr/interns"       element={<InternManager />} />
          <Route path="/hr/attendance"    element={<AttendanceModule />} />
          <Route path="/hr/tasks"         element={<TaskModule />} />
          <Route path="/hr/progress"      element={<ProgressModule />} />
          <Route path="/hr/announcements" element={<AnnouncementModule />} />
          <Route path="/hr/resources"     element={<ResourcesModule />} />
          <Route path="/hr/guides"        element={<GuidesModule />} />
          <Route path="/hr/credentials"   element={<CredentialsManager />} />
          <Route path="/hr/hr-management" element={<HRModule />} />
          <Route path="/hr/doubts"        element={<DoubtsModule />} />
          <Route path="/hr/reports"       element={<ReportModule />} />
          <Route path="/hr/profile"       element={<AdminProfile />} />
          <Route path="/hr"               element={<Navigate to="/hr/dashboard" replace />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
