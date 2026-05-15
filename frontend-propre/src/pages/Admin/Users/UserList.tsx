// src/pages/Admin/Users/UserList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Edit, Trash2, Lock, Unlock, Shield, X } from 'lucide-react';
import { userService } from '../../../services/userService';
import { User } from '../../../types';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data.results || data);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRole = selectedRole === 'tous' || 
      (user.role?.code === selectedRole) ||
      (selectedRole === 'superuser' && user.is_superuser);
    
    return matchSearch && matchRole;
  });

  const handleBlock = async (user: User) => {
    if (!confirm(`Bloquer l'utilisateur ${user.email} ?`)) return;
    try {
      await userService.blockUser(user.id);
      toast.success(`Utilisateur ${user.email} bloqué`);
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors du blocage');
    }
  };

  const handleUnblock = async (user: User) => {
    try {
      await userService.unblockUser(user.id);
      toast.success(`Utilisateur ${user.email} débloqué`);
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors du déblocage');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Supprimer définitivement l'utilisateur ${user.email} ?`)) return;
    try {
      await userService.deleteUser(user.id);
      toast.success(`Utilisateur ${user.email} supprimé`);
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleSuperuser = async (user: User) => {
    if (user.is_superuser && user.email === localStorage.getItem('userEmail')) {
      toast.error('Vous ne pouvez pas modifier votre propre statut');
      return;
    }
    const action = user.is_superuser ? 'retirer les droits superuser' : 'donner les droits superuser';
    if (!confirm(`${action} à ${user.email} ?`)) return;
    try {
      await userService.toggleSuperuser(user.id);
      toast.success(`${user.email} ${user.is_superuser ? 'n\'est plus' : 'est maintenant'} superutilisateur`);
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const getRoleBadgeColor = (user: User) => {
    if (user.is_superuser) return 'bg-purple-100 text-purple-700';
    if (user.role?.code === 'ADMIN') return 'bg-purple-100 text-purple-700';
    if (user.role?.code === 'DREN') return 'bg-blue-100 text-blue-700';
    if (user.role?.code === 'MEN') return 'bg-green-100 text-green-700';
    if (user.role?.code === 'FOP') return 'bg-yellow-100 text-yellow-700';
    if (user.role?.code === 'FINANCE') return 'bg-emerald-100 text-emerald-700';
    return 'bg-gray-100 text-gray-700';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={() => navigate('/admin/users/create')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par email, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Filter size={18} />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="tous">Tous les rôles</option>
              <option value="superuser">Superutilisateur</option>
              <option value="ADMIN">Administrateur</option>
              <option value="DREN">DREN</option>
              <option value="MEN">MEN</option>
              <option value="FOP">FOP</option>
              <option value="FINANCE">Finance</option>
              <option value="UTILISATEUR">Utilisateur</option>
            </select>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user)}`}>
                      {user.is_superuser ? 'SUPERUSER' : (user.role?.name || 'UTILISATEUR')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_blocked ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Bloqué</span>
                    ) : user.is_active ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Actif</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/users/${user.id}`)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button onClick={() => navigate(`/admin/users/${user.id}/edit`)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button onClick={() => handleToggleSuperuser(user)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Shield size={16} className={user.is_superuser ? 'text-purple-600' : 'text-gray-400'} />
                      </button>
                      {user.is_blocked ? (
                        <button onClick={() => handleUnblock(user)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Unlock size={16} className="text-green-600" />
                        </button>
                      ) : (
                        <button onClick={() => handleBlock(user)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Lock size={16} className="text-orange-600" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;