// src/components/Common/ProtectedAdminRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ProtectedAdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.is_superuser === true || user?.role?.code === 'ADMIN';
  
  // Non authentifié → rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Authentifié mais pas admin → rediriger vers dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Admin → afficher la page
  return <Outlet />;
};

export default ProtectedAdminRoute;