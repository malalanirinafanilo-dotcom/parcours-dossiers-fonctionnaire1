// src/components/Layout/Sidebar.tsx
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
  Activity // Remplacer BarChart3 par Activity
} from 'lucide-react';
import { RootState } from '../../store';

interface SidebarProps {
  sidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';
  const canCreateDossier = userEmail === 'interesse@example.com' || userRole === 'UTILISATEUR';

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <LayoutDashboard size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </NavLink>
          </li>

          {/* Mes Dossiers */}
          <li>
            <NavLink
              to="/dossiers"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FolderOpen size={20} />
              {sidebarOpen && <span>Mes Dossiers</span>}
            </NavLink>
          </li>

          {/* Nouveau Dossier */}
          {canCreateDossier && (
            <li>
              <NavLink
                to="/dossiers/creer"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Plus size={20} />
                {sidebarOpen && <span>Nouveau Dossier</span>}
              </NavLink>
            </li>
          )}

          {/* Admin items */}
          {userRole === 'ADMIN' && (
            <>
              <li>
                <NavLink
                  to="/utilisateurs"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Users size={20} />
                  {sidebarOpen && <span>Utilisateurs</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/statistiques"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Activity size={20} />
                  {sidebarOpen && <span>Statistiques</span>}
                </NavLink>
              </li>
            </>
          )}

          {/* IAAnalyses */}
          <li>
            <NavLink
              to="/ia-analyses"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Activity size={20} />
              {sidebarOpen && <span>Analyses IA</span>}
            </NavLink>
          </li>

          {/* Documents */}
          <li>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FileText size={20} />
              {sidebarOpen && <span>Documents</span>}
            </NavLink>
          </li>

          {/* Notifications */}
          <li>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Bell size={20} />
              {sidebarOpen && <span>Notifications</span>}
            </NavLink>
          </li>

          {/* Profil */}
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <UserCircle size={20} />
              {sidebarOpen && <span>Profil</span>}
            </NavLink>
          </li>

          {/* Paramètres */}
          <li>
            <NavLink
              to="/parametres"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
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