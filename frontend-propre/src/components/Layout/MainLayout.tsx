// src/components/Layout/MainLayout.tsx - VERSION COMPLÈTE
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, FolderOpen, FileText, Bell, User, Settings, LogOut,
  Menu, X, ChevronDown, Shield, Activity, Brain, Plus
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';
import { notificationService } from '../../services/notificationService';

interface MenuItem {
  path: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  roles?: string[];
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

  const userRole = user?.role?.code || 'UTILISATEUR';
  const userEmail = user?.email || '';
  const isSuperUser = user?.is_superuser || false;
  const isInteresse = userEmail === 'interesse@example.com';

  const getMenuItems = (): MenuItem[] => {
    // Items communs à tous
    const commonItems: MenuItem[] = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dossiers', label: 'Mes dossiers', icon: FolderOpen },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/notifications', label: 'Notifications', icon: Bell },
      { path: '/profile', label: 'Mon profil', icon: User },
      { path: '/parametres', label: 'Paramètres', icon: Settings },
    ];

    let items = [...commonItems];
    
    // ⭐ Seul l'intéressé peut créer un nouveau dossier
    if (isInteresse) {
      items.splice(2, 0, { path: '/dossiers/creer', label: 'Nouveau dossier', icon: Plus });
    }

    if (isSuperUser) {
      items.push({ path: '/admin', label: 'Administration', icon: Shield });
      items.push({ path: '/ia-analyses', label: 'Analyses IA', icon: Brain });
    } else {
      items.push({ path: '/ia-analyses', label: 'Analyses IA', icon: Activity });
    }

    return items;
  };

  const menuItems = getMenuItems();

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les notifications non lues
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
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadge = () => {
    const roleColors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      DREN: 'bg-blue-100 text-blue-700',
      MEN: 'bg-green-100 text-green-700',
      FOP: 'bg-yellow-100 text-yellow-700',
      FINANCE: 'bg-emerald-100 text-emerald-700',
      UTILISATEUR: 'bg-gray-100 text-gray-700',
    };
    return roleColors[userRole] || 'bg-gray-100 text-gray-700';
  };

  const getRoleName = () => {
    const roleNames: Record<string, string> = {
      ADMIN: 'Administrateur',
      DREN: 'Direction Régionale',
      MEN: 'Ministère Éducation',
      FOP: 'Formation Professionnelle',
      FINANCE: 'Direction Finances',
      UTILISATEUR: 'Utilisateur',
    };
    return roleNames[userRole] || 'Utilisateur';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Gestion Dossiers</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge()}`}>
              {getRoleName()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/notifications')} className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getRoleName()}</p>
                  </div>
                  <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <User size={16} /> Mon profil
                  </button>
                  <button onClick={() => { navigate('/parametres'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings size={16} /> Paramètres
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-20
        ${sidebarOpen ? 'w-64' : 'w-0 md:w-20 overflow-hidden'}
        ${isMobile && !sidebarOpen ? 'hidden' : ''}`}>
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <NavLink to={item.path} onClick={() => isMobile && setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-green-50 text-green-600 shadow-sm' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                    <Icon size={20} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    {item.label === 'Notifications' && unreadCount > 0 && sidebarOpen && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200">
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
            </button>
          </div>
        </nav>
      </aside>

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setSidebarOpen(false)} />
      )}

      <main className={`pt-16 transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0 md:ml-20'}`}>
        <div className="p-4 md:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;