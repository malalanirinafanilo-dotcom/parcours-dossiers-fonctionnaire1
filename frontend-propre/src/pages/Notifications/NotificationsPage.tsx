// src/pages/Notifications/NotificationsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bell,
  Check,
  Eye,
  X,
  ChevronRight,
  Calendar,
  FileText,
  Filter,
  RefreshCw,
  CheckCheck,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Inbox,
  Mail,
  MailOpen
} from 'lucide-react';
import { RootState } from '../../store';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  // Charger les notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
      applyFilters(notifs, filter, typeFilter);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les notifications
  const refreshNotifications = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
    toast.success('Notifications actualisées');
  };

  // Appliquer les filtres
  const applyFilters = (
    notifs: Notification[],
    statusFilter: string,
    typeFilterValue: string
  ) => {
    let filtered = [...notifs];

    // Filtre par statut (lu/non lu)
    if (statusFilter === 'unread') {
      filtered = filtered.filter(n => !n.lu);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(n => n.lu);
    }

    // Filtre par type
    if (typeFilterValue !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilterValue);
    }

    setFilteredNotifications(filtered);
  };

  // Gérer les changements de filtre
  useEffect(() => {
    applyFilters(notifications, filter, typeFilter);
  }, [notifications, filter, typeFilter]);

  // Charger au démarrage
  useEffect(() => {
    loadNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Marquer comme lu
  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const success = await notificationService.marquerLue(id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    if (notifications.filter(n => !n.lu).length === 0) {
      toast.success('Aucune notification non lue');
      return;
    }
    
    const success = await notificationService.marquerToutesLues();
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, lu: true }))
      );
      toast.success('Toutes les notifications marquées comme lues');
    }
  };

  // Naviguer vers le dossier
  const handleNotificationClick = (notif: Notification) => {
    if (notif.dossier) {
      navigate(`/dossiers/${notif.dossier}`);
    }
  };

  // Obtenir l'icône selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Obtenir la couleur de fond
  const getBgColor = (type: string, lu: boolean) => {
    if (lu) return 'bg-white';
    
    switch (type) {
      case 'SUCCESS': return 'bg-green-50';
      case 'WARNING': return 'bg-yellow-50';
      case 'ERROR': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  // Compter les non lues
  const unreadCount = notifications.filter(n => !n.lu).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-marine-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? (
              <>Vous avez <span className="font-bold text-marine-600">{unreadCount}</span> notification(s) non lue(s)</>
            ) : (
              'Aucune nouvelle notification'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckCheck size={18} />
              <span className="hidden sm:inline">Tout marquer comme lu</span>
            </button>
          )}
          <button
            onClick={refreshNotifications}
            className="btn-secondary p-2.5"
            disabled={refreshing}
            title="Actualiser"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input"
              >
                <option value="all">Toutes les notifications</option>
                <option value="unread">Non lues seulement</option>
                <option value="read">Lues seulement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tous les types</option>
                <option value="SUCCESS">Succès</option>
                <option value="WARNING">Avertissement</option>
                <option value="ERROR">Erreur</option>
                <option value="INFO">Information</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 hover:shadow-md transition-all cursor-pointer ${
                  !notif.lu ? 'hover:bg-opacity-80' : 'hover:bg-gray-50'
                } ${getBgColor(notif.type, notif.lu)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div className="flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`text-base ${!notif.lu ? 'font-semibold' : 'font-medium'}`}>
                        {notif.titre}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        notificationService.getBadgeColor(notif.type)
                      }`}>
                        {notif.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {notif.time_ago || notificationService.formatTimeAgo(notif.created_at)}
                      </span>
                      
                      {notif.dossier_numero && (
                        <span className="flex items-center gap-1 text-marine-600">
                          <FileText size={12} />
                          {notif.dossier_numero}
                        </span>
                      )}
                      
                      {notif.action_requise && (
                        <span className="flex items-center gap-1 text-warning-600">
                          <AlertCircle size={12} />
                          Action requise
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notif.lu && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors group"
                        title="Marquer comme lu"
                      >
                        <MailOpen size={16} className="text-gray-400 group-hover:text-marine-500" />
                      </button>
                    )}
                    
                    {notif.dossier && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dossiers/${notif.dossier}`);
                        }}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                        title="Voir le dossier"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Barre de statut pour non lues */}
                {!notif.lu && (
                  <div className="mt-2 w-full h-0.5 bg-gradient-to-r from-marine-500 to-transparent rounded-full" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filter === 'all' && notifications.length === 0 && 'Aucune notification'}
              {filter === 'unread' && unreadCount === 0 && 'Aucune notification non lue'}
              {filter === 'read' && notifications.filter(n => n.lu).length === 0 && 'Aucune notification lue'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {filter === 'all' && 'Les notifications apparaîtront ici lorsqu\'il y aura des mises à jour.'}
              {filter === 'unread' && 'Vous avez lu toutes vos notifications. Bon travail !'}
              {filter === 'read' && 'Aucune notification lue pour le moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Non lues</p>
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Lues</p>
            <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Action requise</p>
            <p className="text-2xl font-bold text-warning-600">
              {notifications.filter(n => n.action_requise && !n.lu).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;