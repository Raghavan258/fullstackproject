import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AboutConstitution from './pages/AboutConstitution.jsx';
import Articles from './pages/Articles.jsx';
import VideoLibrary from './pages/VideoLibrary.jsx';
import StudyNotes from './pages/StudyNotes.jsx';
import Quizzes from './pages/Quizzes.jsx';
import Forums from './pages/Forums.jsx';
import ConstitutionExplorer from './pages/ConstitutionExplorer.jsx';

import './index.css';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="page-wrapper">{children}</div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AppLayout><AboutConstitution /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <AppLayout><Articles /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/video-library"
            element={
              <ProtectedRoute>
                <AppLayout><VideoLibrary /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-notes"
            element={
              <ProtectedRoute>
                <AppLayout><StudyNotes /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <AppLayout><Quizzes /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forums"
            element={
              <ProtectedRoute>
                <AppLayout><Forums /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/constitution-explorer"
            element={
              <ProtectedRoute>
                <AppLayout><ConstitutionExplorer /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
