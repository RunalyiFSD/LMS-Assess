import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import PublicProfile from './pages/PublicProfile';
import AssessmentLobby from './pages/AssessmentLobby';
import ActiveAssessment from './pages/ActiveAssessment';
import FuturePage from './pages/FuturePage';
import AssessmentCalendarPage from './pages/AssessmentCalendarPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

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
            path="/schedule"
            element={
              <ProtectedRoute>
                <AssessmentCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/questions"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/grade"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:id" element={<PublicProfile />} />


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

          {/* Catch-all Fallback and Future Feature Routes */}
          <Route path="/company-mock" element={<ProtectedRoute><FuturePage routeKey="company-mock" /></ProtectedRoute>} />
          <Route path="/language-mock" element={<ProtectedRoute><FuturePage routeKey="language-mock" /></ProtectedRoute>} />
          <Route path="/future/:routeKey" element={<ProtectedRoute><FuturePage /></ProtectedRoute>} />
          <Route path="/404" element={<FuturePage />} />
          <Route path="*" element={<FuturePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
