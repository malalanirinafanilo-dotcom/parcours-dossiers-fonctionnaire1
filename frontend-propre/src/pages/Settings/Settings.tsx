import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  // Icônes générales
  Settings as SettingsIcon,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  Filter,
  Search,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  
  // Icônes spécifiques
  Globe,
  Clock,
  Calendar,
  FileText,
  Users,
  Shield,
  Bell,
  Brain,
  Paperclip,
  Database,
  LogOut,
  HardDrive,
  Key,
  Mail,
  MessageSquare,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Move,
  RefreshCw,
  DownloadCloud,
  UploadCloud,
  Archive,
  Lock,
  Unlock,
  Fingerprint,
  Sliders,
  BarChart3,
  Activity,
  Server,
  Code,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { RootState } from '../../store';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les toggles
  const [settings, setSettings] = useState({
    // Général
    appName: 'Gestion des Dossiers MEN',
    logo: '/logo.png',
    language: 'fr',
    timezone: 'Indian/Antananarivo',
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24h',

    // Notifications
    notifications: {
      enabled: true,
      email: true,
      sms: false,
      inApp: true,
      frequency: 'immediate',
      recipients: ['admin@example.com', 'dren@example.com'],
    },

    // IA
    iaPredictive: {
      enabled: true,
      riskThreshold: 75,
      analyzedTypes: ['PROMOTION', 'MUTATION'],
    },

    // Pièces jointes
    attachments: {
      allowedTypes: ['PDF', 'JPG', 'PNG', 'DOC'],
      maxSize: 10,
      storagePath: '/media/documents/',
    },

    // Sécurité
    security: {
      backupFrequency: 'daily',
      encryptionEnabled: true,
      jwtRequired: true,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecial: true,
    },
  });

  // Données mockées
  const [dossierTypes, setDossierTypes] = useState([
    { id: 1, name: 'Promotion', description: 'Demande de promotion', required: true, iaEnabled: true, fields: ['nom', 'prenom', 'grade_actuel', 'grade_demande'] },
    { id: 2, name: 'Mutation', description: 'Demande de mutation', required: true, iaEnabled: true, fields: ['nom', 'prenom', 'etablissement_actuel', 'etablissement_demande'] },
    { id: 3, name: 'Congé', description: 'Demande de congé', required: true, iaEnabled: false, fields: ['nom', 'prenom', 'date_debut', 'date_fin'] },
    { id: 4, name: 'Retraite', description: 'Demande de retraite', required: true, iaEnabled: true, fields: ['nom', 'prenom', 'date_naissance', 'date_entree'] },
  ]);

  const [services, setServices] = useState([
    { id: 1, name: 'DREN Analamanga', responsable: 'Rakoto Jean', email: 'dren.analamanga@education.mg' },
    { id: 2, name: 'MEN Cabinet', responsable: 'Rasoa Marie', email: 'men.cabinet@education.mg' },
    { id: 3, name: 'FOP Antananarivo', responsable: 'Rabe Paul', email: 'fop.tana@education.mg' },
    { id: 4, name: 'Finance MEN', responsable: 'Randria Faly', email: 'finance@education.mg' },
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: 'ADMIN', description: 'Administrateur système', permissions: ['all'] },
    { id: 2, name: 'DREN', description: 'Direction Régionale', permissions: ['view_dossiers', 'validate_dren'] },
    { id: 3, name: 'MEN', description: 'Ministère', permissions: ['view_dossiers', 'validate_men'] },
    { id: 4, name: 'FOP', description: 'Formation Pro', permissions: ['view_dossiers', 'validate_fop'] },
    { id: 5, name: 'FINANCE', description: 'Finance', permissions: ['view_dossiers', 'validate_finance'] },
    { id: 6, name: 'UTILISATEUR', description: 'Utilisateur standard', permissions: ['create_dossiers', 'view_own_dossiers'] },
  ]);

  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 1, step: 'Intéressé', role: 'UTILISATEUR', maxDays: 5, active: true, order: 1 },
    { id: 2, step: 'DREN', role: 'DREN', maxDays: 7, active: true, order: 2 },
    { id: 3, step: 'MEN', role: 'MEN', maxDays: 5, active: true, order: 3 },
    { id: 4, step: 'FOP', role: 'FOP', maxDays: 7, active: true, order: 4 },
    { id: 5, step: 'Finance', role: 'FINANCE', maxDays: 5, active: true, order: 5 },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, date: '2024-03-05 09:30:45', user: 'admin@example.com', action: 'Connexion', section: 'Auth', status: 'success' },
    { id: 2, date: '2024-03-05 09:15:22', user: 'dren@example.com', action: 'Validation', dossier: 'DOS-2024-001', status: 'success' },
    { id: 3, date: '2024-03-05 08:45:10', user: 'user@example.com', action: 'Tentative connexion', section: 'Auth', status: 'error' },
    { id: 4, date: '2024-03-04 16:30:00', user: 'men@example.com', action: 'Modification', dossier: 'DOS-2024-002', status: 'warning' },
    { id: 5, date: '2024-03-04 14:15:33', user: 'fop@example.com', action: 'Création', dossier: 'DOS-2024-005', status: 'success' },
  ]);

  const tabs = [
    { id: 'general', label: 'Général', icon: SettingsIcon },
    { id: 'types', label: 'Types de Dossiers', icon: FileText },
    { id: 'services', label: 'Services', icon: Users },
    { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
    { id: 'workflow', label: 'Workflow', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ia', label: 'IA Prédictive', icon: Brain },
    { id: 'attachments', label: 'Pièces Jointes', icon: Paperclip },
    { id: 'security', label: 'Sauvegarde & Sécurité', icon: Database },
    { id: 'logs', label: 'Logs', icon: Terminal },
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'types', label: 'Types de Dossiers', icon: FileText },
    { id: 'services', label: 'Services', icon: Users },
    { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
    { id: 'workflow', label: 'Workflow', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ia', label: 'IA Prédictive', icon: Brain },
    { id: 'attachments', label: 'Pièces Jointes', icon: Paperclip },
    { id: 'security', label: 'Sauvegarde & Sécurité', icon: Database },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'logout', label: 'Déconnexion', icon: LogOut, isLogout: true },
  ];

  const handleSave = (section: string) => {
    toast.success(`Paramètres ${section} enregistrés avec succès`);
  };

  const handleSaveAll = () => {
    toast.success('Tous les paramètres ont été enregistrés avec succès');
  };

  const handleAdd = (type: string) => {
    setShowPopup(type);
    setEditItem(null);
  };

  const handleEdit = (type: string, item: any) => {
    setShowPopup(type);
    setEditItem(item);
  };

  const handleDelete = (type: string, id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      toast.success('Élément supprimé avec succès');
    }
  };

  const handleToggle = (setting: string) => {
    toast.success('Paramètre mis à jour');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-marine-600">Paramètres</h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.isLogout) {
                      // Logout logic
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id && !item.isLogout
                      ? 'bg-marine-50 text-marine-600'
                      : item.isLogout
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

          {/* A. Paramètres Généraux */}
          {activeTab === 'general' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SettingsIcon size={20} className="text-marine-500" />
                Paramètres Généraux
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nom de l'application</label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Logo</label>
                    <div className="flex items-center gap-2">
                      <input type="text" value={settings.logo} className="input" />
                      <button className="btn-secondary">
                        <Upload size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Langue</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="input"
                    >
                      <option value="fr">Français</option>
                      <option value="mg">Malagasy</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuseau horaire</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="input"
                    >
                      <option value="Indian/Antananarivo">Indian/Antananarivo (UTC+3)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Format date</label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                      className="input"
                    >
                      <option value="dd/mm/yyyy">31/12/2024</option>
                      <option value="mm/dd/yyyy">12/31/2024</option>
                      <option value="yyyy-mm-dd">2024-12-31</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Format heure</label>
                    <select
                      value={settings.timeFormat}
                      onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                      className="input"
                    >
                      <option value="24h">24h</option>
                      <option value="12h">12h (AM/PM)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleSave('généraux')} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Enregistrer
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* B. Gestion des Types de Dossiers */}
          {activeTab === 'types' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-marine-500" />
                  Gestion des Types de Dossiers
                </h2>
                <button onClick={() => handleAdd('type')} className="btn-primary flex items-center gap-2">
                  <Plus size={18} />
                  Ajouter un type
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Obligatoire</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">IA Prédictive</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dossierTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{type.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{type.description}</td>
                        <td className="px-4 py-3">
                          {type.required ? (
                            <span className="badge-success">Oui</span>
                          ) : (
                            <span className="badge-warning">Non</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {type.iaEnabled ? (
                            <span className="badge-info">Activée</span>
                          ) : (
                            <span className="badge-default">Désactivée</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit('type', type)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete('type', type.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* C. Gestion des Services */}
          {activeTab === 'services' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-marine-500" />
                  Gestion des Services
                </h2>
                <button onClick={() => handleAdd('service')} className="btn-primary flex items-center gap-2">
                  <Plus size={18} />
                  Ajouter un service
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nom du Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Responsable</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{service.responsable}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{service.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* D. Gestion des Rôles & Permissions */}
          {activeTab === 'roles' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-marine-500" />
                  Gestion des Rôles & Permissions
                </h2>
                <button onClick={() => handleAdd('role')} className="btn-primary flex items-center gap-2">
                  <Plus size={18} />
                  Ajouter un rôle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nom du rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Permissions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {roles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{role.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{role.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {role.permissions.length > 1 ? `${role.permissions.length} permissions` : role.permissions[0]}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* E. Configuration du Workflow */}
          {activeTab === 'workflow' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-marine-500" />
                Configuration du Workflow
              </h2>

              <div className="space-y-4">
                {workflowSteps.sort((a, b) => a.order - b.order).map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Move className="w-5 h-5 text-gray-400 cursor-move" />
                    <span className="w-8 h-8 bg-marine-100 text-marine-600 rounded-full flex items-center justify-center">
                      {step.order}
                    </span>
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <input value={step.step} className="input" />
                      <select value={step.role} className="input">
                        <option value="UTILISATEUR">UTILISATEUR</option>
                        <option value="DREN">DREN</option>
                        <option value="MEN">MEN</option>
                        <option value="FOP">FOP</option>
                        <option value="FINANCE">FINANCE</option>
                      </select>
                      <input type="number" value={step.maxDays} className="input" />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(`workflow-${step.id}`)}
                          className={`w-12 h-6 rounded-full transition-colors ${step.active ? 'bg-marine-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${step.active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-4">
                  <button onClick={() => handleAdd('workflow')} className="btn-secondary flex items-center gap-2">
                    <Plus size={18} />
                    Ajouter une étape
                  </button>
                  <button onClick={() => handleSave('workflow')} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Enregistrer workflow
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* F. Paramètres des Notifications */}
          {activeTab === 'notifications' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-marine-500" />
                Paramètres des Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Activer les notifications</p>
                    <p className="text-sm text-gray-500">Recevoir des notifications système</p>
                  </div>
                  <button
                    onClick={() => handleToggle('notifications')}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.enabled ? 'bg-marine-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={() => handleToggle('notifications-email')}
                      className="w-4 h-4 text-marine-500 rounded"
                    />
                    <Mail size={18} className="text-gray-500" />
                    <span>Email</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={() => handleToggle('notifications-sms')}
                      className="w-4 h-4 text-marine-500 rounded"
                    />
                    <Smartphone size={18} className="text-gray-500" />
                    <span>SMS</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={settings.notifications.inApp}
                      onChange={() => handleToggle('notifications-inapp')}
                      className="w-4 h-4 text-marine-500 rounded"
                    />
                    <MessageSquare size={18} className="text-gray-500" />
                    <span>In-App</span>
                  </label>
                </div>

                <div>
                  <label className="label">Fréquence</label>
                  <select
                    value={settings.notifications.frequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, frequency: e.target.value }
                    })}
                    className="input"
                  >
                    <option value="immediate">Immédiate</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>

                <div>
                  <label className="label">Destinataires par type</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-sm">DREN</span>
                      <select className="input flex-1" multiple size={2}>
                        <option>dren.analamanga@education.mg</option>
                        <option>dren.atsimo@education.mg</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-sm">MEN</span>
                      <select className="input flex-1" multiple size={2}>
                        <option>men.cabinet@education.mg</option>
                        <option>men.drh@education.mg</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleSave('notifications')} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Enregistrer notifications
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* G. Paramètres IA Prédictive */}
          {activeTab === 'ia' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain size={20} className="text-marine-500" />
                Paramètres IA Prédictive
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Activer IA prédictive</p>
                    <p className="text-sm text-gray-500">Utiliser l'IA pour prédire les délais et risques</p>
                  </div>
                  <button
                    onClick={() => handleToggle('ia')}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.iaPredictive.enabled ? 'bg-marine-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.iaPredictive.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div>
                  <label className="label">Seuil score risque pour alertes (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.iaPredictive.riskThreshold}
                    onChange={(e) => setSettings({
                      ...settings,
                      iaPredictive: { ...settings.iaPredictive, riskThreshold: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0</span>
                    <span className="font-medium text-marine-600">{settings.iaPredictive.riskThreshold}%</span>
                    <span>100</span>
                  </div>
                </div>

                <div>
                  <label className="label">Types de dossiers analysés par IA</label>
                  <select className="input" multiple size={3}>
                    <option selected>Promotion</option>
                    <option selected>Mutation</option>
                    <option>Congé</option>
                    <option>Retraite</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <button className="btn-secondary flex items-center gap-2">
                    <FileText size={18} />
                    Voir logs IA
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <RefreshCw size={18} />
                    Exécuter analyse test
                  </button>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleSave('IA')} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Enregistrer paramètres IA
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* H. Gestion des Pièces Jointes */}
          {activeTab === 'attachments' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Paperclip size={20} className="text-marine-500" />
                Gestion des Pièces Jointes
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">Types de fichiers autorisés</label>
                  <div className="flex flex-wrap gap-2">
                    {['PDF', 'JPG', 'PNG', 'DOC', 'XLS'].map((type) => (
                      <label key={type} className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg">
                        <input type="checkbox" checked={settings.attachments.allowedTypes.includes(type)} className="w-4 h-4 text-marine-500 rounded" />
                        <span>.{type.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Taille maximale par fichier (MB)</label>
                  <input
                    type="number"
                    value={settings.attachments.maxSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      attachments: { ...settings.attachments, maxSize: parseInt(e.target.value) }
                    })}
                    className="input w-48"
                  />
                </div>

                <div>
                  <label className="label">Chemin de stockage</label>
                  <input
                    type="text"
                    value={settings.attachments.storagePath}
                    onChange={(e) => setSettings({
                      ...settings,
                      attachments: { ...settings.attachments, storagePath: e.target.value }
                    })}
                    className="input"
                  />
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleSave('pièces jointes')} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Enregistrer paramètres
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* I. Sauvegarde & Sécurité */}
          {activeTab === 'security' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={20} className="text-marine-500" />
                Sauvegarde & Sécurité
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">Fréquence sauvegarde automatique</label>
                  <select
                    value={settings.security.backupFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, backupFrequency: e.target.value }
                    })}
                    className="input"
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Activer cryptage fichiers sensibles</p>
                    <p className="text-sm text-gray-500">Les fichiers seront chiffrés au repos</p>
                  </div>
                  <button
                    onClick={() => handleToggle('encryption')}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.security.encryptionEnabled ? 'bg-marine-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.security.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Authentification JWT obligatoire</p>
                    <p className="text-sm text-gray-500">Toutes les API requièrent un token JWT</p>
                  </div>
                  <button
                    onClick={() => handleToggle('jwt')}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.security.jwtRequired ? 'bg-marine-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.security.jwtRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div>
                  <label className="label">Politique de mots de passe</label>
                  <div className="space-y-2">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="number"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                          })}
                          className="input w-24"
                        />
                        <span>Longueur minimale</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireUppercase}
                          onChange={() => handleToggle('password-uppercase')}
                          className="w-4 h-4 text-marine-500 rounded"
                        />
                        <span>Au moins une majuscule</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireNumbers}
                          onChange={() => handleToggle('password-numbers')}
                          className="w-4 h-4 text-marine-500 rounded"
                        />
                        <span>Au moins un chiffre</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireSpecial}
                          onChange={() => handleToggle('password-special')}
                          className="w-4 h-4 text-marine-500 rounded"
                        />
                        <span>Au moins un caractère spécial</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleSave('sécurité')} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Sauvegarder et sécuriser
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* J. Logs */}
          {activeTab === 'logs' && (
            <section className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Terminal size={20} className="text-marine-500" />
                  Logs système
                </h2>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary flex items-center gap-2">
                    <Download size={18} />
                    CSV
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <Download size={18} />
                    PDF
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher dans les logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select className="input w-48">
                  <option value="">Tous les utilisateurs</option>
                  <option>admin@example.com</option>
                  <option>dren@example.com</option>
                  <option>men@example.com</option>
                </select>
                <select className="input w-40">
                  <option value="">Toutes les dates</option>
                  <option>Aujourd'hui</option>
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Dossier/Section</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{log.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.dossier || log.section}</td>
                        <td className="px-4 py-3">
                          {log.status === 'success' && <span className="badge-success">Succès</span>}
                          {log.status === 'error' && <span className="badge-error">Erreur</span>}
                          {log.status === 'warning' && <span className="badge-warning">Warning</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Bouton Enregistrer tous les paramètres */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button onClick={handleSaveAll} className="btn-primary flex items-center gap-2 px-8 py-3 text-lg">
              <Save size={20} />
              Enregistrer tous les paramètres
            </button>
          </div>
        </div>
      </main>

      {/* Popups */}
      {showPopup === 'type' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editItem ? 'Modifier' : 'Ajouter'} un type de dossier
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Nom du type</label>
                <input type="text" className="input" defaultValue={editItem?.name} />
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} defaultValue={editItem?.description} />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={editItem?.iaEnabled} className="w-4 h-4 text-marine-500 rounded" />
                  <span>Activer IA prédictive</span>
                </label>
              </div>

              <div>
                <label className="label">Champs obligatoires</label>
                <select className="input" multiple size={4}>
                  <option>Nom</option>
                  <option>Prénom</option>
                  <option>Matricule</option>
                  <option>Grade actuel</option>
                  <option>Grade demandé</option>
                  <option>Date prise de fonction</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowPopup(null)} className="btn-secondary">
                Annuler
              </button>
              <button onClick={() => {
                setShowPopup(null);
                toast.success(editItem ? 'Type modifié' : 'Type ajouté');
              }} className="btn-primary">
                {editItem ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup === 'service' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editItem ? 'Modifier' : 'Ajouter'} un service
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Nom du service</label>
                <input type="text" className="input" defaultValue={editItem?.name} />
              </div>
              
              <div>
                <label className="label">Responsable</label>
                <input type="text" className="input" defaultValue={editItem?.responsable} />
              </div>

              <div>
                <label className="label">Email</label>
                <input type="email" className="input" defaultValue={editItem?.email} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowPopup(null)} className="btn-secondary">
                Annuler
              </button>
              <button onClick={() => {
                setShowPopup(null);
                toast.success(editItem ? 'Service modifié' : 'Service ajouté');
              }} className="btn-primary">
                {editItem ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup === 'role' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editItem ? 'Modifier' : 'Ajouter'} un rôle
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Nom du rôle</label>
                <input type="text" className="input" defaultValue={editItem?.name} />
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} defaultValue={editItem?.description} />
              </div>

              <div>
                <label className="label">Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Voir tous les dossiers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Créer des dossiers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Valider étape DREN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Valider étape MEN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Valider étape FOP</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Valider étape Finance</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Gérer les utilisateurs</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-marine-500 rounded" />
                    <span>Accéder aux paramètres</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowPopup(null)} className="btn-secondary">
                Annuler
              </button>
              <button onClick={() => {
                setShowPopup(null);
                toast.success(editItem ? 'Rôle modifié' : 'Rôle ajouté');
              }} className="btn-primary">
                {editItem ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;