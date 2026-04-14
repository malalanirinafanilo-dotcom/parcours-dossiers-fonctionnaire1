import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Search, 
  X, 
  CheckCheck, 
  Info, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  Settings 
} from 'lucide-react';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { dossierService } from '../../services/dossierService';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
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

  const loadNotifications = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
      const count = await notificationService.getCompteNonLues();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simuler une recherche
      const results = dossierService.searchDossiers?.(searchQuery, userEmail, userRole) || [];
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, userEmail, userRole]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-green-500" />;
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

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await notificationService.marquerLue(id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notif = notifications.find(n => n.id === id);
    const success = await notificationService.supprimerNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.lu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification supprimée');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 shadow-soft">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Logo et menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-green-50 rounded-xl transition-all duration-200 text-neutral-600 hover:text-green-600 group"
            aria-label="Menu"
          >
            <Menu size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center transform hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent hidden md:block">
              Gestion Dossiers
            </span>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex-1 max-w-xl mx-4 relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-green-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 2 && setShowResults(true)}
              className="w-full bg-neutral-50 text-neutral-900 placeholder-neutral-400 rounded-xl pl-10 pr-4 py-2 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-green-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Résultats de recherche */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-elevated border border-neutral-100 max-h-96 overflow-y-auto z-50 animate-slide-down">
              {searchResults.map((dossier) => (
                <div
                  key={dossier.id}
                  onClick={() => {
                    setShowResults(false);
                    setSearchQuery('');
                    navigate(`/dossiers/${dossier.id}`);
                  }}
                  className="p-3 hover:bg-green-50 cursor-pointer border-b border-neutral-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-600">{dossier.numero_dossier}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Code {dossier.code_mouvement}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-900 font-medium mt-1">{dossier.titre}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      dossier.statut === 'TERMINE' ? 'bg-green-100 text-green-700' :
                      dossier.statut === 'EN_ATTENTE_DREN' ? 'bg-green-100 text-green-700' :
                      dossier.statut === 'REJETE' ? 'bg-error-100 text-error-700' :
                      dossier.statut === 'BROUILLON' ? 'bg-warning-100 text-warning-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {dossier.statut}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Étape: {dossier.etape_actuelle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-1">
          
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-green-50 rounded-xl relative transition-all duration-200 text-neutral-600 hover:text-green-600 group"
              aria-label="Notifications"
            >
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-error-500 to-error-400 text-white text-xs rounded-full flex items-center justify-center px-1 shadow-lg shadow-error-200 animate-pulse-soft">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Panneau des notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-elevated border border-neutral-100 overflow-hidden z-50 animate-scale-in">
                {/* En-tête */}
                <div className="p-4 bg-gradient-to-r from-green-600 to-green-500 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Notifications</h3>
                      <p className="text-xs text-green-100 mt-1">
                        {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Tout est lu'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          notificationService.marquerToutesLues?.();
                          setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
                          setUnreadCount(0);
                        }}
                        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 backdrop-blur-sm"
                      >
                        <CheckCheck size={14} />
                        Tout marquer
                      </button>
                    )}
                  </div>
                </div>

                {/* Liste des notifications */}
                <div className="max-h-[480px] overflow-y-auto">
                  {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-neutral-500">Chargement...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.dossier) navigate(`/dossiers/${notif.dossier}`);
                          setShowNotifications(false);
                        }}
                        className={`p-4 border-b border-neutral-100 hover:bg-green-50 cursor-pointer transition-all group ${
                          !notif.lu ? 'bg-green-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm ${!notif.lu ? 'font-semibold' : 'font-medium'} text-neutral-900 truncate`}>
                                {notif.titre}
                              </p>
                              {!notif.lu && (
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse-soft"></span>
                              )}
                            </div>
                            
                            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="text-neutral-400">
                                {notif.time_ago || formatTime(notif.created_at)}
                              </span>
                              
                              {notif.dossier_numero && (
                                <span className="text-green-600 font-medium truncate max-w-[150px]">
                                  #{notif.dossier_numero}
                                </span>
                              )}
                              
                              {notif.action_requise && !notif.lu && (
                                <span className="bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  Action requise
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.lu && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="p-1 hover:bg-white rounded-lg transition-colors"
                                title="Marquer comme lu"
                              >
                                <CheckCheck size={16} className="text-neutral-400 hover:text-green-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notif.id, e)}
                              className="p-1 hover:bg-white rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <X size={16} className="text-neutral-400 hover:text-error-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Bell size={24} className="text-green-400" />
                      </div>
                      <p className="text-neutral-700 font-medium">Aucune notification</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Les notifications apparaîtront ici
                      </p>
                    </div>
                  )}
                </div>

                {/* Pied de page */}
                <div className="p-3 border-t border-neutral-100 bg-neutral-50">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                    className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium py-1 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Menu utilisateur */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-green-50 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <User size={18} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-neutral-900 leading-tight">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-green-600 leading-tight">
                  {userRole}
                </p>
              </div>
              <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Menu déroulant */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-neutral-100 py-2 z-50 animate-scale-in">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900">{user?.email}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{user?.role?.name}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-green-50 flex items-center gap-2 transition-colors"
                >
                  <User size={16} className="text-green-500" />
                  <span>Mon Profil</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-green-50 flex items-center gap-2 transition-colors relative"
                >
                  <Bell size={16} className="text-green-500" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-error-500 to-error-400 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    navigate('/parametres');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-green-50 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} className="text-green-500" />
                  <span>Paramètres</span>
                </button>
                
                <div className="border-t border-neutral-100 my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;