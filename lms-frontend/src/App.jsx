import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PageLoader from './components/common/PageLoader';

// Core Pages (Loaded directly for instant initial render)
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';

// Lazy Loaded Pages (Code-split into separate async chunks)
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const AssessmentLobby = lazy(() => import('./pages/AssessmentLobby'));
const ActiveAssessment = lazy(() => import('./pages/ActiveAssessment'));
const QuestionGeneration = lazy(() => import('./pages/QuestionGeneration'));
const AssessmentCalendarPage = lazy(() => import('./pages/AssessmentCalendarPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const StudentsInstructorsPage = lazy(() => import('./pages/StudentsInstructorsPage'));
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'));
const BatchesPage = lazy(() => import('./pages/BatchesPage'));
const AdminAssessmentsPage = lazy(() => import('./pages/AdminAssessmentsPage'));
const ReportsAnalyticsPage = lazy(() => import('./pages/ReportsAnalyticsPage'));
const ActivityLogsPage = lazy(() => import('./pages/ActivityLogsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const FuturePage = lazy(() => import('./pages/FuturePage'));

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Redirect to login if session does not exist
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role restrictions if defined
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Inject a key to force unmount on user change, ensuring state doesn't persist across different accounts
  return React.cloneElement(children, { key: user._id });
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
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
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentsInstructorsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/batches"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assessments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAssessmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ReportsAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ActivityLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SupportPage />
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
              <Route
                path="/instructor/ai-generation"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <QuestionGeneration />
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
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
