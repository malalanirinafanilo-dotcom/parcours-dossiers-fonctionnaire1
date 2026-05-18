// src/pages/Profile/Profile.tsx - Version corrigée (suppression du cadre Ministère)
import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Briefcase,
  Award,
  Clock,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { RootState } from '../../store';

const Profile: React.FC = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    DREN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    MEN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    FOP: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    FINANCE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    UTILISATEUR: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  const roleName = user.role?.name || (user.is_superuser ? 'Superutilisateur' : 'Utilisateur');
  const roleCode = user.role?.code || (user.is_superuser ? 'ADMIN' : 'UTILISATEUR');

  const stats = [
    { label: 'Dossiers', value: '12', icon: Briefcase, color: 'accent' },
    { label: 'Documents', value: '34', icon: UserIcon, color: 'emerald' },
    { label: 'Taux complétion', value: '92%', icon: Award, color: 'amber' },
    { label: 'Membre depuis', value: new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }), icon: Clock, color: 'purple' },
  ];

  const getStatsColor = (color: string) => {
    const colors = {
      accent: 'bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
      purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Mon profil</h1>
        <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
          Consultez et gérez vos informations personnelles
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carte de profil - colonne gauche */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="rounded-2xl border border-dark-200 bg-white p-6 text-center dark:border-dark-800 dark:bg-dark-900">
            <div className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-dark-900 dark:text-dark-100">
                {user.first_name} {user.last_name}
              </h2>
              <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${roleColors[roleCode]}`}>
                {roleName}
              </p>
              
              <div className="mt-6 w-full border-t border-dark-200 pt-6 dark:border-dark-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-dark-600 dark:text-dark-400">
                    <Mail className="h-4 w-4 text-dark-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone_number && (
                    <div className="flex items-center gap-3 text-sm text-dark-600 dark:text-dark-400">
                      <Phone className="h-4 w-4 text-dark-400" />
                      <span>{user.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-dark-600 dark:text-dark-400">
                    <Calendar className="h-4 w-4 text-dark-400" />
                    <span>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Badge de vérification */}
              {user.is_active && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  Compte vérifié
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Informations détaillées - colonne droite */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Cartes statistiques */}
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dark-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-2 ${getStatsColor(stat.color)}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informations personnelles */}
          <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
            <h3 className="mb-4 text-lg font-semibold text-dark-900 dark:text-dark-100">
              Informations détaillées
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-dark-500">Nom d'utilisateur</p>
                  <p className="font-medium text-dark-900 dark:text-dark-100">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500">Prénom</p>
                  <p className="font-medium text-dark-900 dark:text-dark-100">{user.first_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500">Nom</p>
                  <p className="font-medium text-dark-900 dark:text-dark-100">{user.last_name || '-'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-dark-500">Code rôle</p>
                  <p className="font-medium text-dark-900 dark:text-dark-100">{roleCode}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500">Statut</p>
                  <p className={`font-medium ${user.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </p>
                </div>
                {user.is_superuser && (
                  <div>
                    <p className="text-sm text-dark-500">Privilèges</p>
                    <p className="font-medium text-purple-600 dark:text-purple-400">Superutilisateur</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;