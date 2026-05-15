// src/App.tsx - VERSION CORRIGÉE AVEC PROTECTION NOUVEAU DOSSIER
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store, RootState } from './store';
import { initializeSettings } from './store/settingsSlice';

// Layout
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import SuperUserRoute from './components/Common/SuperUserRoute';

// Pages communes
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

// Pages Admin (SuperUser)
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import UserList from './pages/Admin/Users/UserList';
import AdminLogs from './pages/Admin/Logs/AdminLogs';
import SystemSettings from './pages/Admin/Settings/SystemSettings';

// Composant de redirection basé sur le rôle
const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.is_superuser) return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

// ⭐ NOUVEAU : Protection pour la route Nouveau Dossier (seul l'intéressé peut accéder)
const NouveauDossierRoute: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isInteresse = user?.email === 'interesse@example.com';
  
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
      
      {/* Routes protégées pour tous les utilisateurs authentifiés */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dossiers" element={<MesDossiers />} />
          {/* ⭐ Route protégée : seul interesse@example.com peut accéder */}
          <Route path="/dossiers/creer" element={<NouveauDossierRoute />} />
          <Route path="/dossiers/:id" element={<DossierDetail />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/ia-analyses" element={<IAAnalyses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/parametres" element={<Settings />} />
        </Route>
      </Route>
      
      {/* Routes superuser (admin) - uniquement pour is_superuser=true */}
      <Route element={<SuperUserRoute />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Route>
      
      {/* 404 - Redirection vers la page d'accueil */}
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