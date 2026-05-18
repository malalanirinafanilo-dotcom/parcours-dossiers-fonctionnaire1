// src/pages/Notifications/NotificationsPage.tsx - Version modernisée
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Eye,
  X,
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
  ChevronDown,
  ChevronUp
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

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
      applyFilters(notifs, filter, typeFilter);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
    toast.success('Notifications actualisées');
  };

  const applyFilters = (
    notifs: Notification[],
    statusFilter: string,
    typeFilterValue: string
  ) => {
    let filtered = [...notifs];
    if (statusFilter === 'unread') filtered = filtered.filter(n => !n.lu);
    else if (statusFilter === 'read') filtered = filtered.filter(n => n.lu);
    if (typeFilterValue !== 'all') filtered = filtered.filter(n => n.type === typeFilterValue);
    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    applyFilters(notifications, filter, typeFilter);
  }, [notifications, filter, typeFilter]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const success = await notificationService.marquerLue(id);
    if (success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.filter(n => !n.lu).length === 0) {
      toast.success('Aucune notification non lue');
      return;
    }
    const success = await notificationService.marquerToutesLues();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      toast.success('Toutes les notifications marquées comme lues');
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (notif.dossier) navigate(`/dossiers/${notif.dossier}`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'ERROR': return <XCircle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-accent-500" />;
    }
  };

  const getBgColor = (type: string, lu: boolean) => {
    if (lu) return 'bg-white dark:bg-dark-900';
    switch (type) {
      case 'SUCCESS': return 'bg-emerald-50 dark:bg-emerald-950/30';
      case 'WARNING': return 'bg-amber-50 dark:bg-amber-950/30';
      case 'ERROR': return 'bg-rose-50 dark:bg-rose-950/30';
      default: return 'bg-accent-50 dark:bg-accent-950/30';
    }
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Notifications</h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            {unreadCount > 0 ? (
              <>Vous avez <span className="font-semibold text-accent-600">{unreadCount}</span> notification(s) non lue(s)</>
            ) : (
              'Aucune nouvelle notification'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Tout marquer lu</span>
            </button>
          )}
          <button
            onClick={refreshNotifications}
            className="rounded-xl border border-dark-200 bg-white p-2.5 text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filtres</span>
            {(filter !== 'all' || typeFilter !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-accent-500" />
            )}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Statut</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                  >
                    <option value="all">Toutes les notifications</option>
                    <option value="unread">Non lues seulement</option>
                    <option value="read">Lues seulement</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques */}
      {notifications.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
            <p className="text-sm text-dark-500">Total</p>
            <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{notifications.length}</p>
          </div>
          <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
            <p className="text-sm text-dark-500">Non lues</p>
            <p className="text-2xl font-bold text-accent-600">{unreadCount}</p>
          </div>
          <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
            <p className="text-sm text-dark-500">Lues</p>
            <p className="text-2xl font-bold text-emerald-600">{notifications.length - unreadCount}</p>
          </div>
          <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
            <p className="text-sm text-dark-500">Action requise</p>
            <p className="text-2xl font-bold text-amber-600">
              {notifications.filter(n => n.action_requise && !n.lu).length}
            </p>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="rounded-2xl border border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-900">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-800">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`cursor-pointer p-4 transition-all hover:shadow-sm sm:p-5 ${getBgColor(notif.type, notif.lu)}`}
              >
                <div className="flex gap-4">
                  {/* Icône */}
                  <div className="flex-shrink-0">{getIcon(notif.type)}</div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={`text-base ${!notif.lu ? 'font-semibold' : 'font-medium'} text-dark-900 dark:text-dark-100`}>
                        {notif.titre}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        notif.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        notif.type === 'WARNING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        notif.type === 'ERROR' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400'
                      }`}>
                        {notif.type}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-dark-600 dark:text-dark-400 line-clamp-2">
                      {notif.message}
                    </p>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {notificationService.formatTimeAgo(notif.created_at)}
                      </span>
                      {notif.dossier_numero && (
                        <span className="flex items-center gap-1 text-accent-600">
                          <FileText size={12} />
                          {notif.dossier_numero}
                        </span>
                      )}
                      {notif.action_requise && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertCircle size={12} />
                          Action requise
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!notif.lu && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="rounded-lg p-1.5 text-dark-400 transition-colors hover:bg-white/50 dark:hover:bg-dark-800"
                        title="Marquer comme lu"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {notif.dossier && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dossiers/${notif.dossier}`);
                        }}
                        className="rounded-lg p-1.5 text-dark-400 transition-colors hover:bg-white/50 dark:hover:bg-dark-800"
                        title="Voir le dossier"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Indicateur pour non lue */}
                {!notif.lu && (
                  <div className="mt-2 h-0.5 w-full rounded-full bg-gradient-to-r from-accent-500 to-transparent" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-dark-100 dark:bg-dark-800">
              <Inbox size={32} className="text-dark-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-dark-900 dark:text-dark-100">
              {filter === 'all' && notifications.length === 0 && 'Aucune notification'}
              {filter === 'unread' && unreadCount === 0 && 'Aucune notification non lue'}
              {filter === 'read' && notifications.filter(n => n.lu).length === 0 && 'Aucune notification lue'}
            </h3>
            <p className="mt-1 text-sm text-dark-500">
              {filter === 'all' && 'Les notifications apparaîtront ici'}
              {filter === 'unread' && 'Vous avez lu toutes vos notifications'}
              {filter === 'read' && 'Aucune notification lue pour le moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;