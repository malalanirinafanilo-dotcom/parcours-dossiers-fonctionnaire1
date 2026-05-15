// src/pages/Admin/Dashboard/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Activity, Clock, Shield, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { userService } from '../../../services/userService';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
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
      setStats({ ...userStats, ...dashboardStats });
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
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

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
              <p className="text-sm text-gray-500">Actions admin (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.admin_actions_today || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
          <div className="space-y-3">
            {recentActivity?.recent_logs?.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.created_at).toLocaleString('fr-FR')} par {log.admin_email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux utilisateurs</h2>
          <div className="space-y-3">
            {recentActivity?.recent_users?.slice(0, 10).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_superuser ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.is_superuser ? 'Superuser' : (user.role?.name || 'User')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;