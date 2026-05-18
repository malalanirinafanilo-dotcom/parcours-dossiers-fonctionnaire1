// src/pages/Settings/Settings.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
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
  Palette,
  Type,
  Shield,
  ChevronRight,
  Globe,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'apparence' | 'notifications' | 'securite' | 'compte'>('apparence');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    ancien: '',
    nouveau: '',
    confirmation: '',
  });

  const tabs = [
    { id: 'apparence', label: 'Apparence', icon: Palette, description: 'Thème, couleurs, police' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alertes et rappels' },
    { id: 'securite', label: 'Sécurité', icon: Lock, description: 'Mot de passe, sessions' },
    { id: 'compte', label: 'Mon compte', icon: User, description: 'Informations personnelles' },
  ];

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

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: any) => {
    dispatch(updateNotifications({ [key]: value }));
    toast.success('Préférence enregistrée');
  };

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

  const handleResetAll = () => {
    if (confirm('⚠️ Réinitialiser tous les paramètres ? Cette action est irréversible.')) {
      dispatch(resetSettings());
      toast.success('Tous les paramètres ont été réinitialisés');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 flex items-center gap-2">
          <SettingsIcon size={24} className="text-accent-500" />
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
          Personnalisez votre expérience
        </p>
      </div>

      {/* Bandeau aperçu */}
      <div className="rounded-xl bg-accent-50 p-4 dark:bg-accent-950/30">
        <p className="text-sm text-accent-700 dark:text-accent-400">
          ✨ Aperçu en direct : Les changements s'appliquent immédiatement
        </p>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-dark-200 bg-white p-1 dark:border-dark-800 dark:bg-dark-900">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
                isActive
                  ? 'bg-accent-50 text-accent-600 shadow-sm dark:bg-accent-950/50 dark:text-accent-400'
                  : 'text-dark-600 hover:bg-dark-50 dark:text-dark-400 dark:hover:bg-dark-800'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        {/* Apparence */}
        {activeTab === 'apparence' && (
          <motion.div
            key="apparence"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Thème */}
            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Thème</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'clair', label: 'Clair', icon: Sun },
                  { id: 'sombre', label: 'Sombre', icon: Moon },
                  { id: 'systeme', label: 'Système', icon: Laptop },
                ].map((theme) => {
                  const Icon = theme.icon;
                  const isActive = settings.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id as any)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        isActive
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30'
                          : 'border-dark-200 hover:border-accent-300 dark:border-dark-800'
                      }`}
                    >
                      <Icon size={24} className={isActive ? 'text-accent-600' : 'text-dark-500'} />
                      <span className={`text-sm ${isActive ? 'font-medium text-accent-600' : 'text-dark-600'}`}>
                        {theme.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Couleur principale */}
            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Couleur principale</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'vert', color: 'bg-emerald-500', label: 'Vert' },
                  { id: 'bleu', color: 'bg-accent-500', label: 'Bleu' },
                  { id: 'violet', color: 'bg-purple-500', label: 'Violet' },
                  { id: 'orange', color: 'bg-orange-500', label: 'Orange' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleThemeCouleurChange(c.id as any)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                      settings.themeCouleur === c.id ? 'ring-2 ring-accent-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-full ${c.color} shadow-md`} />
                    <span className="text-xs text-dark-600">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Police */}
            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Police</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { id: 'inter', label: 'Inter', font: 'Inter' },
                  { id: 'system', label: 'Système', font: 'system-ui' },
                  { id: 'arial', label: 'Arial', font: 'Arial' },
                  { id: 'roboto', label: 'Roboto', font: 'Roboto' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePoliceChange(p.id as any)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      settings.police === p.id
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30'
                        : 'border-dark-200 hover:border-accent-300 dark:border-dark-800'
                    }`}
                    style={{ fontFamily: p.font }}
                  >
                    <p className="font-medium">{p.label}</p>
                    <p className="mt-1 text-xs text-dark-500">Exemple de texte</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Taille police et densité */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
                <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Taille du texte</h3>
                <div className="flex gap-2">
                  {['petit', 'medium', 'grand'].map((taille) => (
                    <button
                      key={taille}
                      onClick={() => handleTaillePoliceChange(taille as any)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                        settings.taillePolice === taille
                          ? 'bg-accent-600 text-white'
                          : 'border border-dark-200 text-dark-600 hover:bg-dark-50 dark:border-dark-800'
                      }`}
                    >
                      {taille === 'petit' ? 'Petit' : taille === 'medium' ? 'Moyen' : 'Grand'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
                <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Densité</h3>
                <div className="flex gap-2">
                  {['compact', 'confortable', 'large'].map((densite) => (
                    <button
                      key={densite}
                      onClick={() => handleDensiteChange(densite as any)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                        settings.densite === densite
                          ? 'bg-accent-600 text-white'
                          : 'border border-dark-200 text-dark-600 hover:bg-dark-50 dark:border-dark-800'
                      }`}
                    >
                      {densite === 'compact' ? 'Compact' : densite === 'confortable' ? 'Confortable' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Animations */}
            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-dark-900 dark:text-dark-100">Animations</h3>
                  <p className="text-sm text-dark-500">Activer les transitions et animations</p>
                </div>
                <button
                  onClick={handleAnimationsToggle}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.animations ? 'bg-accent-600' : 'bg-dark-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.animations ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Canaux de notification</h3>
              <div className="space-y-3">
                {[
                  { key: 'email', icon: Mail, label: 'Email', desc: 'Notifications par email' },
                  { key: 'sms', icon: Smartphone, label: 'SMS', desc: 'Notifications par SMS' },
                  { key: 'inApp', icon: Bell, label: 'In-App', desc: "Notifications dans l'application" },
                  { key: 'desktop', icon: Monitor, label: 'Bureau', desc: 'Notifications push sur ordinateur' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl bg-dark-50 p-3 dark:bg-dark-800">
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-accent-500" />
                      <div>
                        <p className="font-medium text-dark-900 dark:text-dark-100">{item.label}</p>
                        <p className="text-xs text-dark-500">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(item.key as any, !settings.notifications[item.key as keyof typeof settings.notifications])}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-accent-600' : 'bg-dark-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.notifications[item.key as keyof typeof settings.notifications] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Événements</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'dossierCree', label: 'Création de dossier', icon: FileText },
                  { key: 'dossierValide', label: 'Validation de dossier', icon: CheckCircle },
                  { key: 'dossierRejete', label: 'Rejet de dossier', icon: AlertCircle },
                  { key: 'dossierTransfere', label: 'Transfert de dossier', icon: RefreshCw },
                  { key: 'rappelDelai', label: 'Rappel de délai', icon: Clock },
                ].map(item => (
                  <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-xl bg-dark-50 p-3 dark:bg-dark-800">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                      onChange={() => handleNotificationChange(item.key as any, !settings.notifications[item.key as keyof typeof settings.notifications])}
                      className="h-4 w-4 rounded border-dark-300 text-accent-600 focus:ring-accent-500"
                    />
                    <item.icon size={16} className="text-dark-500" />
                    <span className="text-sm text-dark-700 dark:text-dark-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sécurité */}
        {activeTab === 'securite' && (
          <motion.div
            key="securite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Changer le mot de passe</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.ancien}
                    onChange={(e) => setPasswordForm({ ...passwordForm, ancien: e.target.value })}
                    placeholder="Mot de passe actuel"
                    className="w-full rounded-xl border border-dark-200 px-4 py-2.5 pr-10 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input
                  type="password"
                  value={passwordForm.nouveau}
                  onChange={(e) => setPasswordForm({ ...passwordForm, nouveau: e.target.value })}
                  placeholder="Nouveau mot de passe (min. 8 caractères)"
                  className="w-full rounded-xl border border-dark-200 px-4 py-2.5 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900"
                />
                <input
                  type="password"
                  value={passwordForm.confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmation: e.target.value })}
                  placeholder="Confirmer le mot de passe"
                  className="w-full rounded-xl border border-dark-200 px-4 py-2.5 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-700"
                >
                  {saving ? <RefreshCw size={18} className="animate-spin" /> : <Lock size={18} />}
                  Modifier le mot de passe
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-dark-900 dark:text-dark-100">Verrouillage automatique</h3>
                  <p className="text-sm text-dark-500">Verrouille la session après inactivité</p>
                </div>
                <button
                  onClick={handleAutoLockChange}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.autoLock ? 'bg-accent-600' : 'bg-dark-300'
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.autoLock ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {settings.autoLock && (
                <div className="mt-4">
                  <label className="text-sm text-dark-600">Délai (minutes)</label>
                  <select
                    value={settings.autoLockDelay}
                    onChange={(e) => dispatch(updateSecurity({ autoLockDelay: parseInt(e.target.value) }))}
                    className="ml-3 rounded-xl border border-dark-200 px-3 py-1.5 text-sm dark:border-dark-800 dark:bg-dark-900"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Compte */}
        {activeTab === 'compte' && (
          <motion.div
            key="compte"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900"
          >
            <h3 className="mb-4 font-semibold text-dark-900 dark:text-dark-100">Informations personnelles</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Nom</label>
                <input
                  type="text"
                  value={user?.last_name || ''}
                  className="w-full rounded-xl border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-dark-900 dark:border-dark-800 dark:bg-dark-800 dark:text-dark-100"
                  disabled
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Prénom</label>
                <input
                  type="text"
                  value={user?.first_name || ''}
                  className="w-full rounded-xl border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-dark-900 dark:border-dark-800 dark:bg-dark-800 dark:text-dark-100"
                  disabled
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-dark-900 dark:border-dark-800 dark:bg-dark-800 dark:text-dark-100"
                  disabled
                />
                <p className="mt-1 text-xs text-dark-500">L'email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Rôle</label>
                <input
                  type="text"
                  value={user?.role?.name || user?.role?.code || 'Utilisateur'}
                  className="w-full rounded-xl border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-dark-900 dark:border-dark-800 dark:bg-dark-800 dark:text-dark-100"
                  disabled
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton reset */}
      <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
        <button
          onClick={handleResetAll}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-rose-600"
        >
          <RefreshCw size={18} />
          Réinitialiser tous les paramètres
        </button>
      </div>

      {/* Version */}
      <div className="py-4 text-center text-sm text-dark-500">
        Application version 1.0.0
      </div>
    </div>
  );
};

export default Settings;