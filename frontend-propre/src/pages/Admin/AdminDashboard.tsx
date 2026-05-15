// src/pages/Admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Activity, Clock, Shield } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

interface DashboardStats {
  total_users: number;
  superusers: number;
  blocked_users: number;
  active_users: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userStats, dashboardStats, activity] = await Promise.all([
        userService.getUserStats(),
        adminService.getDashboardStats(),
        adminService.getRecentActivity()
      ]);
      setStats(userStats);
      setAdminStats(dashboardStats);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Gestion complète de la plateforme</p>
      </div>

      {/* Statistiques utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Super utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.superusers || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.active_users || 0}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs bloqués</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.blocked_users || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Statistiques système */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 border border-green-100">
          <p className="text-sm text-gray-500">Nouveaux aujourd'hui</p>
          <p className="text-2xl font-bold text-green-600">{adminStats?.new_users_today || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-500">Sessions actives (24h)</p>
          <p className="text-2xl font-bold text-blue-600">{adminStats?.active_sessions || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 border border-orange-100">
          <p className="text-sm text-gray-500">Actions admin aujourd'hui</p>
          <p className="text-2xl font-bold text-orange-600">{adminStats?.admin_actions_today || 0}</p>
        </div>
      </div>

      {/* Dernière activité */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernière activité</h2>
        <div className="space-y-3">
          {recentActivity?.recent_logs?.slice(0, 10).map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;