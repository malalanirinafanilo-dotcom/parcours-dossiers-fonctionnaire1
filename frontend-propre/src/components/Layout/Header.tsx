import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Bell, User, LogOut, Search, X, 
  CheckCheck, Settings, Sun, Moon, Sparkles,
  LayoutDashboard, FolderOpen, FileText, Brain
} from 'lucide-react';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role?.code || '';
  const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Utilisateur';

  // Charger les notifications
  const loadNotifications = async () => {
    if (!user?.email) return;
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
      const count = await notificationService.getCompteNonLues();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Gérer les clicks extérieurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche
  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simulation de recherche - à remplacer par API réelle
      const mockResults = [
        { id: '1', numero: 'DOS-2025-001', titre: 'Demande de promotion', statut: 'EN_COURS' },
        { id: '2', numero: 'DOS-2025-002', titre: 'Mutation DREN', statut: 'TERMINE' },
      ];
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Déconnexion réussie');
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.marquerLue(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      SUCCESS: '🎉',
      WARNING: '⚠️',
      ERROR: '❌',
      INFO: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || '📬';
  };

  const getNotificationColor = (type: string, lu: boolean) => {
    if (lu) return 'bg-white/50';
    switch (type) {
      case 'SUCCESS': return 'bg-success-50/80';
      case 'WARNING': return 'bg-warning-50/80';
      case 'ERROR': return 'bg-error-50/80';
      default: return 'bg-primary-50/80';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffMin < 1440) return `Il y a ${Math.floor(diffMin / 60)} h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <header className="fixed top-0 w-full z-50 glass shadow-glass">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo et menu */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 text-gray-600"
          >
            <Menu size={20} />
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-glow flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gradient hidden md:block">
              Gestion Dossiers MEN
            </span>
          </motion.div>
        </div>

        {/* Barre de recherche */}
        <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
          <motion.div 
            initial={false}
            animate={{ scale: showSearch ? 1.05 : 1 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-2 border border-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-elevated overflow-hidden z-50"
                >
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => {
                        navigate(`/dossiers/${result.id}`);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-primary-50/50 cursor-pointer border-b border-white/30 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-primary-600">{result.numero}</span>
                        <span className="badge-primary text-xs">{result.statut}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{result.titre}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mode sombre toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 text-gray-600"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-white/50 rounded-xl relative transition-all duration-200 text-gray-600"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-error-500 to-error-400 text-white text-[10px] rounded-full flex items-center justify-center px-1"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-96 glass rounded-xl shadow-elevated overflow-hidden z-50"
                >
                  {/* En-tête */}
                  <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-xs text-primary-100 mt-0.5">
                          {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Tout est lu'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            notificationService.marquerToutesLues?.();
                            setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
                            setUnreadCount(0);
                            toast.success('Toutes les notifications marquées comme lues');
                          }}
                          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                          <CheckCheck size={12} />
                          Tout marquer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Liste */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.dossier) navigate(`/dossiers/${notif.dossier}`);
                            setShowNotifications(false);
                          }}
                          className={`p-4 border-b border-white/30 cursor-pointer transition-all hover:bg-primary-50/30 ${getNotificationColor(notif.type, notif.lu)}`}
                        >
                          <div className="flex gap-3">
                            <div className="text-xl">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-1">
                              <p className={`text-sm ${!notif.lu ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                                {notif.titre}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-400">{formatTime(notif.created_at)}</span>
                                {!notif.lu && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    className="text-xs text-primary-600 hover:text-primary-700"
                                  >
                                    Marquer comme lu
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pied */}
                  <div className="p-3 border-t border-white/30 bg-white/30">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu utilisateur */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-glow flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {userName}
                </p>
                <p className="text-xs text-primary-600 leading-tight">
                  {userRole}
                </p>
              </div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-elevated py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-white/30">
                    <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.role?.name}</p>
                  </div>
                  
                  <button
                    onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-primary-500" />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => { navigate('/dossiers'); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                  >
                    <FolderOpen size={16} className="text-primary-500" />
                    Mes dossiers
                  </button>
                  
                  <button
                    onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} className="text-primary-500" />
                    Mon profil
                  </button>
                  
                  <button
                    onClick={() => { navigate('/parametres'); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                  >
                    <Settings size={16} className="text-primary-500" />
                    Paramètres
                  </button>
                  
                  <div className="border-t border-white/30 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;