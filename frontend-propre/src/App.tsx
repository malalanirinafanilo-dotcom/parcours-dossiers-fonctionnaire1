// src/App.tsx - Version modernisée
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store, RootState } from './store';
import { initializeSettings } from './store/settingsSlice';

// Layout
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Pages communes (TOUS LES COMPTES)
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import MesDossiers from './pages/Dossiers/MesDossiers';
import NouveauDossier from './pages/Dossiers/NouveauDossier';
import DossierDetail from './pages/Dossiers/DossierDetail';
import IAAnalyses from './pages/IAAnalyses/IAAnalyses';
import DocumentsPage from './pages/Documents/DocumentsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

// Admin Pages (UNIQUEMENT SUPERUSER)
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import UserList from './pages/Admin/Users/UserList';
import AdminLogs from './pages/Admin/Logs/AdminLogs';
import SystemSettings from './pages/Admin/Settings/SystemSettings';

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.is_superuser) return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const NouveauDossierRoute: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role?.code || '';
  const userEmail = user?.email || '';
  const isInteresse = userRole === 'UTILISATEUR' || userEmail.includes('interesse');
  
  if (!isInteresse) {
    return <Navigate to="/dossiers" replace />;
  }
  
  return <NouveauDossier />;
};

function AppContent() {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleBasedRedirect />} />
      
      {/* Routes protégées - TOUS LES COMPTES AUTHENTIFIÉS */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dossiers" element={<MesDossiers />} />
          <Route path="/dossiers/creer" element={<NouveauDossierRoute />} />
          <Route path="/dossiers/:id" element={<DossierDetail />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/ia-analyses" element={<IAAnalyses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/parametres" element={<Settings />} />
        </Route>
      </Route>
      
      {/* Routes superuser - UNIQUEMENT SUPERUSER */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    initializeSettings();
  }, []);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;