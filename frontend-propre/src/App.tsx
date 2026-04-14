import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Store Redux
import { store } from './store';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ChartsDemo from './pages/Charts/ChartsDemo';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import MesDossiers from './pages/Dossiers/MesDossiers';
import NouveauDossier from './pages/Dossiers/NouveauDossier';
import DossierDetail from './pages/Dossiers/DossierDetail';
import IAAnalyses from './pages/IAAnalyses/IAAnalyses';
import DocumentsPage from './pages/Documents/DocumentsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import UploadDocuments from './pages/Dossiers/UploadDocuments';

function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '0.75rem',
              padding: '1rem',
            },
            success: {
              icon: '🎉',
              style: {
                background: '#22c55e',
                color: '#fff',
              },
            },
            error: {
              icon: '❌',
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Redirection par défaut */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Pages principales */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="parametres" element={<Settings />} />
              
              {/* Gestion des dossiers */}
              <Route path="dossiers" element={<MesDossiers />} />
              <Route path="dossiers/creer" element={<NouveauDossier />} />
              <Route path="dossiers/:id" element={<DossierDetail />} />
              <Route path="dossiers/upload" element={<UploadDocuments />} />
              
              {/* Autres pages */}
              <Route path="ia-analyses" element={<IAAnalyses />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="charts" element={<ChartsDemo />} />
            </Route>
          </Route>
          
          {/* Route 404 - Redirection vers dashboard si aucune route trouvée */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;