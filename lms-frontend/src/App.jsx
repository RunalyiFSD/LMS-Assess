import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const AssessmentLobby = lazy(() => import('./pages/AssessmentLobby'));
const ActiveAssessment = lazy(() => import('./pages/ActiveAssessment'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AIChatWindow = lazy(() => import('./features/ai/AIChatWindow'));

// Course Features
const CourseList = lazy(() => import('./features/courses/CourseList'));
const CourseDetail = lazy(() => import('./features/courses/CourseDetail'));

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  // Redirect to login if session does not exist
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role restrictions if defined
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
            <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        }>
          <Routes>
          {/* Public Routing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* General Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          
          {/* Courses Routes */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />

          {/* Student Exam Attempting Routes */}
          <Route
            path="/lobby/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AssessmentLobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ActiveAssessment />
              </ProtectedRoute>
            }
          />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <AIChatWindow />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
