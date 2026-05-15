// src/pages/Settings/Settings.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  updateTheme,
  updateThemeCouleur,
  updatePolice,
  updateTaillePolice,
  updateDensite,
  toggleAnimations,
  updateNotifications,
  updateSecurity,
  resetSettings,
} from '../../store/settingsSlice';
import {
  Settings as SettingsIcon,
  Save,
  Bell,
  Lock,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Mail,
  Smartphone,
  Monitor,
  FileText,
  Clock,
  Volume2,
  VolumeX,
  Palette,
  Type,
  ZoomIn,
  ZoomOut,
  Shield,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'compte' | 'apparence' | 'notifications' | 'securite'>('apparence');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // État local pour le formulaire de changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    ancien: '',
    nouveau: '',
    confirmation: '',
  });

  // ==================== HANDLERS APPARENCE ====================
  const handleThemeChange = (theme: 'clair' | 'sombre' | 'systeme') => {
    dispatch(updateTheme(theme));
    toast.success(`Thème ${theme === 'clair' ? 'clair' : theme === 'sombre' ? 'sombre' : 'système'} activé`);
  };

  const handleThemeCouleurChange = (color: 'vert' | 'bleu' | 'violet' | 'orange') => {
    dispatch(updateThemeCouleur(color));
    toast.success(`Couleur ${color} appliquée`);
  };

  const handlePoliceChange = (police: 'inter' | 'system' | 'arial' | 'roboto') => {
    dispatch(updatePolice(police));
    toast.success('Police modifiée');
  };

  const handleTaillePoliceChange = (taille: 'petit' | 'medium' | 'grand') => {
    dispatch(updateTaillePolice(taille));
    toast.success(`Taille ${taille} appliquée`);
  };

  const handleDensiteChange = (densite: 'compact' | 'confortable' | 'large') => {
    dispatch(updateDensite(densite));
    toast.success(`Densité ${densite} appliquée`);
  };

  const handleAnimationsToggle = () => {
    dispatch(toggleAnimations(!settings.animations));
    toast.success(settings.animations ? 'Animations désactivées' : 'Animations activées');
  };

  // ==================== HANDLERS NOTIFICATIONS ====================
  const handleNotificationChange = (key: keyof typeof settings.notifications, value: any) => {
    dispatch(updateNotifications({ [key]: value }));
    toast.success('Préférence enregistrée');
  };

  // ==================== HANDLER SECURITE ====================
  const handleChangePassword = () => {
    if (passwordForm.nouveau !== passwordForm.confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.nouveau.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      toast.success('Mot de passe modifié avec succès');
      setPasswordForm({ ancien: '', nouveau: '', confirmation: '' });
      setSaving(false);
    }, 1000);
  };

  const handleAutoLockChange = () => {
    dispatch(updateSecurity({ autoLock: !settings.autoLock }));
    toast.success(settings.autoLock ? 'Verrouillage automatique désactivé' : 'Verrouillage automatique activé');
  };

  const handleAutoLockDelayChange = (delay: number) => {
    dispatch(updateSecurity({ autoLockDelay: delay }));
    toast.success(`Délai modifié: ${delay} minutes`);
  };

  // ==================== RESET ====================
  const handleResetAll = () => {
    if (confirm('⚠️ Réinitialiser tous les paramètres ? Cette action est irréversible.')) {
      dispatch(resetSettings());
      toast.success('Tous les paramètres ont été réinitialisés');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // ==================== TABS ====================
  const tabs = [
    { id: 'apparence', label: 'Apparence', icon: Palette, description: 'Thème, couleurs, police' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alertes et rappels' },
    { id: 'securite', label: 'Sécurité', icon: Lock, description: 'Mot de passe, sessions' },
    { id: 'compte', label: 'Mon compte', icon: User, description: 'Informations personnelles' },
  ];

  // ==================== RENDU ====================
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" style={{ color: 'var(--color-primary-500)' }} />
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Personnalisez votre expérience
        </p>
      </div>

      {/* Bandeau aperçu en direct */}
      <div className="rounded-xl p-4" style={{ background: 'var(--color-primary-50)', backgroundColor: 'rgba(var(--color-primary-500), 0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--color-primary-700)' }}>
          ✨ Aperçu en direct : Les changements s'appliquent immédiatement
        </p>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-soft">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs opacity-70">{tab.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ==================== ONGLET APPARENCE ==================== */}
      {activeTab === 'apparence' && (
        <div className="space-y-6">
          {/* Thème */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Thème</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('clair')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  settings.theme === 'clair'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Sun size={24} className={settings.theme === 'clair' ? 'text-green-500' : 'text-gray-500'} />
                <span className="text-sm">Clair</span>
              </button>
              <button
                onClick={() => handleThemeChange('sombre')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  settings.theme === 'sombre'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Moon size={24} className={settings.theme === 'sombre' ? 'text-green-500' : 'text-gray-500'} />
                <span className="text-sm">Sombre</span>
              </button>
              <button
                onClick={() => handleThemeChange('systeme')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  settings.theme === 'systeme'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Laptop size={24} className={settings.theme === 'systeme' ? 'text-green-500' : 'text-gray-500'} />
                <span className="text-sm">Système</span>
              </button>
            </div>
          </div>

          {/* Couleur principale */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Couleur principale</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'vert', color: 'bg-green-500', label: 'Vert' },
                { id: 'bleu', color: 'bg-blue-500', label: 'Bleu' },
                { id: 'violet', color: 'bg-purple-500', label: 'Violet' },
                { id: 'orange', color: 'bg-orange-500', label: 'Orange' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => handleThemeCouleurChange(c.id as any)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    settings.themeCouleur === c.id
                      ? 'border-gray-900 dark:border-white'
                      : 'border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${c.color} shadow-md`} />
                  <span className="text-sm">{c.label}</span>
                </button>
              ))}
            </div>
            {/* Aperçu des boutons */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Aperçu :</p>
              <div className="flex gap-2">
                <button className="btn-primary px-4 py-2 rounded-lg text-white text-sm">Bouton principal</button>
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary-500)' }} />
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary-600)' }} />
              </div>
            </div>
          </div>

          {/* Police */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Police</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePoliceChange('inter')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  settings.police === 'inter'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Inter</p>
                <p className="text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Exemple de texte</p>
              </button>
              <button
                onClick={() => handlePoliceChange('system')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  settings.police === 'system'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-medium" style={{ fontFamily: 'system-ui' }}>Système</p>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'system-ui' }}>Exemple de texte</p>
              </button>
              <button
                onClick={() => handlePoliceChange('arial')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  settings.police === 'arial'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-medium" style={{ fontFamily: 'Arial' }}>Arial</p>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Arial' }}>Exemple de texte</p>
              </button>
              <button
                onClick={() => handlePoliceChange('roboto')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  settings.police === 'roboto'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>Roboto</p>
                <p className="text-sm text-gray-500" style={{ fontFamily: "'Roboto', sans-serif" }}>Exemple de texte</p>
              </button>
            </div>
          </div>

          {/* Taille police */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Taille du texte</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleTaillePoliceChange('petit')}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  settings.taillePolice === 'petit'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Petit
              </button>
              <button
                onClick={() => handleTaillePoliceChange('medium')}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  settings.taillePolice === 'medium'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Moyen
              </button>
              <button
                onClick={() => handleTaillePoliceChange('grand')}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  settings.taillePolice === 'grand'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Grand
              </button>
            </div>
            <p className="mt-3 text-center text-gray-600 dark:text-gray-400" style={{ fontSize: 'var(--font-size-base)' }}>
              Texte de démonstration à cette taille
            </p>
          </div>

          {/* Densité */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Densité d'affichage</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleDensiteChange('compact')}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  settings.densite === 'compact'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => handleDensiteChange('confortable')}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  settings.densite === 'confortable'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Confortable
              </button>
              <button
                onClick={() => handleDensiteChange('large')}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  settings.densite === 'large'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                Large
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">Élément 1</div>
              <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">Élément 2</div>
            </div>
          </div>

          {/* Animations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Animations</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Activer les transitions et animations</p>
              </div>
              <button
                onClick={handleAnimationsToggle}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.animations ? 'bg-green-600' : 'bg-gray-400'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.animations ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ONGLET NOTIFICATIONS ==================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Canaux de notification</h3>
            <div className="space-y-3">
              {[
                { key: 'email', icon: Mail, label: 'Email', desc: 'Notifications par email' },
                { key: 'sms', icon: Smartphone, label: 'SMS', desc: 'Notifications par SMS' },
                { key: 'inApp', icon: Bell, label: 'In-App', desc: 'Notifications dans l\'application' },
                { key: 'desktop', icon: Monitor, label: 'Bureau', desc: 'Notifications push sur ordinateur' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key as any, !settings.notifications[item.key as keyof typeof settings.notifications])}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-green-600' : 'bg-gray-400'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings.notifications[item.key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Événements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'dossierCree', label: 'Création de dossier', icon: FileText },
                { key: 'dossierValide', label: 'Validation de dossier', icon: CheckCircle },
                { key: 'dossierRejete', label: 'Rejet de dossier', icon: AlertCircle },
                { key: 'dossierTransfere', label: 'Transfert de dossier', icon: RefreshCw },
                { key: 'rappelDelai', label: 'Rappel de délai', icon: Clock },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                    onChange={() => handleNotificationChange(item.key as any, !settings.notifications[item.key as keyof typeof settings.notifications])}
                    className="w-4 h-4 rounded text-green-600"
                  />
                  <item.icon size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Fréquence</h3>
            <select
              value={settings.notifications.frequence}
              onChange={(e) => handleNotificationChange('frequence', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="immediate">Immédiate</option>
              <option value="quotidienne">Résumé quotidien</option>
              <option value="hebdomadaire">Résumé hebdomadaire</option>
            </select>
          </div>
        </div>
      )}

      {/* ==================== ONGLET SÉCURITÉ ==================== */}
      {activeTab === 'securite' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Changer le mot de passe</h3>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.ancien}
                  onChange={(e) => setPasswordForm({ ...passwordForm, ancien: e.target.value })}
                  placeholder="Mot de passe actuel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type="password"
                value={passwordForm.nouveau}
                onChange={(e) => setPasswordForm({ ...passwordForm, nouveau: e.target.value })}
                placeholder="Nouveau mot de passe (min. 8 caractères)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="password"
                value={passwordForm.confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmation: e.target.value })}
                placeholder="Confirmer le mot de passe"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Lock size={18} />}
                Modifier le mot de passe
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Verrouillage automatique</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verrouille la session après inactivité</p>
              </div>
              <button
                onClick={handleAutoLockChange}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoLock ? 'bg-green-600' : 'bg-gray-400'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.autoLock ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {settings.autoLock && (
              <div className="mt-4">
                <label className="text-sm text-gray-600 dark:text-gray-400">Délai (minutes)</label>
                <select
                  value={settings.autoLockDelay}
                  onChange={(e) => handleAutoLockDelayChange(parseInt(e.target.value))}
                  className="ml-3 px-2 py-1 border rounded-lg"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== ONGLET COMPTE ==================== */}
      {activeTab === 'compte' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Informations personnelles</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input
                type="text"
                value={user?.last_name || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
              <input
                type="text"
                value={user?.first_name || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">L'email ne peut pas être modifié</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
              <input
                type="text"
                value={user?.role?.name || user?.role?.code || 'Utilisateur'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled
              />
            </div>
          </div>
        </div>
      )}

      {/* Bouton reset */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <button
          onClick={handleResetAll}
          className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Réinitialiser tous les paramètres
        </button>
      </div>

      {/* Version */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
        Application version 1.0.0 © 2024 - Ministère de l'Éducation Nationale - Madagascar
      </div>
    </div>
  );
};

export default Settings;