import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import LawyersPage from './pages/LawyersPage';
import NotificationsPage from './pages/NotificationsPage';
import VaultPage from './pages/VaultPage';
import Layout from './components/Common/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#FAFAF9',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid #FDDBC0',
        borderTopColor: '#F07B2B',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#7A736C', fontSize: 14 }}>Loading…</span>
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="cases"         element={<CasesPage />} />
        <Route path="cases/:id"     element={<CasesPage />} />
        <Route path="lawyers"       element={<LawyersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="vault"         element={<VaultPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}