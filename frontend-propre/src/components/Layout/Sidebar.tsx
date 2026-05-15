import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Settings,
  FileText,
  UserCircle,
  Plus,
  Bell,
  LogOut,
  Activity
} from 'lucide-react';
import { RootState } from '../../store';

interface SidebarProps {
  sidebarOpen: boolean;
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, isMobile, setSidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const userRole = user?.role?.code || '';
  const isSuperUser = user?.is_superuser || false;
  const canCreateDossier = userRole === 'UTILISATEUR' || user?.email === 'interesse@example.com';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
    }`;

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-20
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${isMobile && !sidebarOpen ? 'hidden' : ''}
      `}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <NavLink to="/dashboard" className={navLinkClass} onClick={handleLinkClick}>
              <LayoutDashboard size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </NavLink>
          </li>

          {/* Mes Dossiers */}
          <li>
            <NavLink to="/dossiers" className={navLinkClass} onClick={handleLinkClick}>
              <FolderOpen size={20} />
              {sidebarOpen && <span>Mes Dossiers</span>}
            </NavLink>
          </li>

          {/* Nouveau Dossier */}
          {canCreateDossier && (
            <li>
              <NavLink to="/dossiers/creer" className={navLinkClass} onClick={handleLinkClick}>
                <Plus size={20} />
                {sidebarOpen && <span>Nouveau Dossier</span>}
              </NavLink>
            </li>
          )}

          {/* Documents */}
          <li>
            <NavLink to="/documents" className={navLinkClass} onClick={handleLinkClick}>
              <FileText size={20} />
              {sidebarOpen && <span>Documents</span>}
            </NavLink>
          </li>

          {/* Analyses IA */}
          <li>
            <NavLink to="/ia-analyses" className={navLinkClass} onClick={handleLinkClick}>
              <Activity size={20} />
              {sidebarOpen && <span>Analyses IA</span>}
            </NavLink>
          </li>

          {/* Notifications */}
          <li>
            <NavLink to="/notifications" className={navLinkClass} onClick={handleLinkClick}>
              <Bell size={20} />
              {sidebarOpen && <span>Notifications</span>}
            </NavLink>
          </li>

          {/* Profil */}
          <li>
            <NavLink to="/profile" className={navLinkClass} onClick={handleLinkClick}>
              <UserCircle size={20} />
              {sidebarOpen && <span>Profil</span>}
            </NavLink>
          </li>

          {/* Admin - Uniquement pour superuser */}
          {(isSuperUser || userRole === 'ADMIN') && (
            <>
              <li className="pt-4 mt-2 border-t border-gray-200">
                <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider ${!sidebarOpen && 'text-center'}`}>
                  {sidebarOpen ? 'Administration' : '⚙️'}
                </p>
              </li>
              <li>
                <NavLink to="/admin/utilisateurs" className={navLinkClass} onClick={handleLinkClick}>
                  <Users size={20} />
                  {sidebarOpen && <span>Utilisateurs</span>}
                </NavLink>
              </li>
            </>
          )}

          {/* Paramètres - Pour tout le monde */}
          <li>
            <NavLink to="/parametres" className={navLinkClass} onClick={handleLinkClick}>
              <Settings size={20} />
              {sidebarOpen && <span>Paramètres</span>}
            </NavLink>
          </li>

          {/* Déconnexion */}
          <li className="mt-4">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Déconnexion</span>}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;