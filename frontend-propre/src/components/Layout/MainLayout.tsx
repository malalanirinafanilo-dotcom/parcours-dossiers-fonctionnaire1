// src/components/Layout/MainLayout.tsx - Version corrigée avec couleurs bleues
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FolderOpen, FileText, Bell, User, Settings, LogOut,
  Menu, ChevronDown, Shield, Activity, Brain, Plus,
  ChevronLeft, ChevronRight, Moon, Sun, Search, Sparkles
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';
import { notificationService } from '../../services/notificationService';

interface MenuItem {
  path: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge?: number;
}

const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userRole = user?.role?.code || 'UTILISATEUR';
  const userEmail = user?.email || '';
  const isSuperUser = user?.is_superuser || false;
  const isAdmin = isSuperUser || userRole === 'ADMIN';
  const isInteresse = userRole === 'UTILISATEUR' || userEmail.includes('interesse');

  // Gestion du thème
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les notifications
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getCompteNonLues();
        setUnreadCount(count);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Recherche simulée
  useEffect(() => {
    if (searchQuery.length > 2) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  }, [searchQuery]);

  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [
      { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { path: '/dossiers', label: 'Mes dossiers', icon: FolderOpen },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
      { path: '/ia-analyses', label: 'Analyses IA', icon: Activity },
    ];

    if (isInteresse) {
      items.splice(2, 0, { path: '/dossiers/creer', label: 'Nouveau dossier', icon: Plus });
    }

    items.push({ path: '/parametres', label: 'Paramètres', icon: Settings });
    items.push({ path: '/profile', label: 'Mon profil', icon: User });

    if (isSuperUser) {
      items.push({ path: '/admin', label: 'Administration', icon: Shield });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Header modernisé */}
      <header className="fixed top-0 z-30 w-full glass">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="rounded-xl p-2 text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-all duration-200"
            >
              {isMobile && !sidebarOpen ? <Menu size={20} /> : isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="hidden text-lg font-semibold text-dark-800 dark:text-dark-100 sm:block">
                Gestion Dossiers
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 ml-4">
              <span className="rounded-lg bg-dark-100 px-2 py-1 text-xs font-medium text-dark-600 dark:bg-dark-800 dark:text-dark-400">
                {userRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Barre de recherche */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="w-80 rounded-xl border border-dark-200 bg-white py-2 pl-10 pr-4 text-sm text-dark-900 placeholder:text-dark-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
              />
            </div>

            {/* Mode sombre */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-xl p-2 text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-all duration-200"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative rounded-xl p-2 text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-all duration-200"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl p-1.5 text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-all duration-200"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <span className="hidden text-sm font-medium text-dark-700 dark:text-dark-300 md:block">
                  {user?.first_name || user?.email?.split('@')[0]}
                </span>
                <ChevronDown size={16} className="hidden md:block" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-dark-200 bg-white shadow-lg dark:border-dark-800 dark:bg-dark-900 z-50"
                  >
                    <div className="border-b border-dark-200 px-4 py-3 dark:border-dark-800">
                      <p className="text-sm font-medium text-dark-900 dark:text-dark-100">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-dark-500 dark:text-dark-400">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-dark-700 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-800"
                      >
                        <User size={16} /> Mon profil
                      </button>
                      <button
                        onClick={() => { navigate('/parametres'); setShowUserMenu(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-dark-700 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-800"
                      >
                        <Settings size={16} /> Paramètres
                      </button>
                      <hr className="my-2 border-dark-200 dark:border-dark-800" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar modernisée */}
      <aside
        className={`fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] bg-white transition-all duration-300 ease-in-out dark:bg-dark-900 ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        } ${sidebarWidth}`}
      >
        <nav className="flex h-full flex-col p-4">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive: active }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400'
                        : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800'
                    }`
                  }
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="border-t border-dark-200 pt-4 dark:border-dark-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay mobile */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          !isMobile && !isCollapsed ? 'ml-64' : !isMobile && isCollapsed ? 'ml-20' : 'ml-0'
        }`}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;