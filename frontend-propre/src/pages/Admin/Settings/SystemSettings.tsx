// src/pages/Admin/Settings/SystemSettings.tsx
import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, Globe, Shield, Bell, Database } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { SystemSetting } from '../../../types';
import toast from 'react-hot-toast';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        await adminService.updateSetting(setting.id, setting.value);
      }
      toast.success('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (id: string, value: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres système</h1>
          <p className="text-gray-600 mt-1">Configurez les paramètres généraux de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSettings} className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
            <RefreshCw size={18} />
            Actualiser
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              {setting.key.includes('SITE') && <Globe size={20} className="text-blue-500" />}
              {setting.key.includes('SECURITY') && <Shield size={20} className="text-red-500" />}
              {setting.key.includes('NOTIFICATION') && <Bell size={20} className="text-yellow-500" />}
              {!setting.key.includes('SITE') && !setting.key.includes('SECURITY') && !setting.key.includes('NOTIFICATION') && <Database size={20} className="text-green-500" />}
              <h2 className="text-lg font-semibold text-gray-900">{setting.key.replace(/_/g, ' ')}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">{setting.description}</p>
            
            {setting.key === 'MAINTENANCE_MODE' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSetting(setting.id, 'true')}
                  className={`px-4 py-2 rounded-lg ${setting.value === 'true' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                >
                  Activer
                </button>
                <button
                  onClick={() => updateSetting(setting.id, 'false')}
                  className={`px-4 py-2 rounded-lg ${setting.value === 'false' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                >
                  Désactiver
                </button>
              </div>
            ) : (
              <input
                type={setting.key.includes('EMAIL') ? 'email' : 'text'}
                value={setting.value}
                onChange={(e) => updateSetting(setting.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={`Valeur pour ${setting.key}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemSettings;