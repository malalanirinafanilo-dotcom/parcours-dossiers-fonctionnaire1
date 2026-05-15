// src/pages/Profile/Profile.tsx - VERSION RAPIDE ET OPTIMISÉE
import React from 'react';
import { useSelector } from 'react-redux';
import { User as UserIcon, Mail, Phone, Shield, MapPin, Calendar, Briefcase } from 'lucide-react';
import { RootState } from '../../store';

const Profile: React.FC = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    DREN: 'bg-blue-100 text-blue-700',
    MEN: 'bg-green-100 text-green-700',
    FOP: 'bg-yellow-100 text-yellow-700',
    FINANCE: 'bg-emerald-100 text-emerald-700',
    UTILISATEUR: 'bg-gray-100 text-gray-700',
  };

  const roleName = user.role?.name || (user.is_superuser ? 'Superutilisateur' : 'Utilisateur');
  const roleCode = user.role?.code || (user.is_superuser ? 'ADMIN' : 'UTILISATEUR');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">Consultez et gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de profil - colonne gauche */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${roleColors[roleCode]}`}>
                {roleName}
              </p>
              
              <div className="w-full mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations détaillées - colonne droite */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations détaillées</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nom d'utilisateur</p>
                  <p className="font-medium text-gray-900">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prénom</p>
                  <p className="font-medium text-gray-900">{user.first_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nom</p>
                  <p className="font-medium text-gray-900">{user.last_name || '-'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Code rôle</p>
                  <p className="font-medium text-gray-900">{roleCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Statut</p>
                  <p className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </p>
                </div>
                {user.is_superuser && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Privilèges</p>
                    <p className="font-medium text-purple-600">Superutilisateur</p>
                  </div>
                )}
              </div>
            </div>

            {/* Madagascar info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-green-500" />
                <span>Ministère de l'Éducation Nationale - Madagascar</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-xs text-gray-500">Fitiavana</span>
                <span className="w-3 h-3 rounded-full bg-white border border-gray-300"></span>
                <span className="text-xs text-gray-500">Fahamarinana</span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-500">Fandrosoana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;