import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './styles/global.css';
import './styles/officer-dashboard.css';
import './styles/admin-dashboard.css';
import './styles/announcement.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/report-issue"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/officer"
            element={
              <ProtectedRoute allowedRoles={['officer']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Announcements routes */}
          <Route
            path="/announcements"
            element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Announcements</h2>
                <p>Coming soon...</p>
              </div>
            }
          />
          <Route
            path="/announcements/:id"
            element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Announcement Details</h2>
                <p>Coming soon...</p>
              </div>
            }
          />
          <Route
            path="/announcements/create"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>Create Announcement</h2>
                  <p>Coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Issues routes */}
          <Route
            path="/issues/:id"
            element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Issue Details</h2>
                <p>Coming soon...</p>
              </div>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
