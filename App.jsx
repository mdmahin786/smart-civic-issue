import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ReportIssuePage from './pages/ReportIssue/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetail/IssueDetailPage';
import MyIssuesPage from './pages/MyIssues/MyIssuesPage';
import AdminDashboardPage from './pages/Admin/AdminDashboard';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import OfficerDashboardPage from './pages/Officer/OfficerDashboard';

// Components
import Navbar from './components/layout/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

// Officer Route Component
const OfficerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'department_official') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />

          {/* Protected Routes */}
          <Route path="/report" element={
            <ProtectedRoute>
              <ReportIssuePage />
            </ProtectedRoute>
          } />
          <Route path="/my-issues" element={
            <ProtectedRoute>
              <MyIssuesPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />

          {/* Officer Routes */}
          <Route path="/officer" element={
            <OfficerRoute>
              <OfficerDashboardPage />
            </OfficerRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
