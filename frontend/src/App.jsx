import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage   from './pages/ProjectPage';
import ProfilePage   from './pages/ProfilePage';
import TeamPage      from './pages/TeamPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected */}
          <Route path="/dashboard"    element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/project/:id"  element={<PrivateRoute><ProjectPage /></PrivateRoute>} />
          <Route path="/profile"      element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/team"         element={<PrivateRoute><TeamPage /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}