// src/store/settingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ==================== TYPES ====================
interface NotificationsState {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  desktop: boolean;
  dossierCree: boolean;
  dossierValide: boolean;
  dossierRejete: boolean;
  dossierTransfere: boolean;
  rappelDelai: boolean;
  frequence: 'immediate' | 'quotidienne' | 'hebdomadaire';
  son: boolean;
}

interface SettingsState {
  // Apparence
  theme: 'clair' | 'sombre' | 'systeme';
  themeCouleur: 'vert' | 'bleu' | 'violet' | 'orange';
  police: 'inter' | 'system' | 'arial' | 'roboto';
  taillePolice: 'petit' | 'medium' | 'grand';
  densite: 'compact' | 'confortable' | 'large';
  animations: boolean;
  formatDate: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  formatHeure: '24h' | '12h';
  
  // Notifications
  notifications: NotificationsState;
  
  // Sécurité
  autoLock: boolean;
  autoLockDelay: number;
}

// ==================== CHARGEMENT DEPUIS localStorage ====================
const loadSettings = (): SettingsState => {
  const saved = localStorage.getItem('app_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultSettings();
    }
  }
  return getDefaultSettings();
};

const getDefaultSettings = (): SettingsState => ({
  theme: 'clair',
  themeCouleur: 'vert',
  police: 'inter',
  taillePolice: 'medium',
  densite: 'confortable',
  animations: true,
  formatDate: 'dd/mm/yyyy',
  formatHeure: '24h',
  notifications: {
    email: true,
    sms: false,
    inApp: true,
    desktop: true,
    dossierCree: true,
    dossierValide: true,
    dossierRejete: true,
    dossierTransfere: true,
    rappelDelai: true,
    frequence: 'immediate',
    son: true,
  },
  autoLock: false,
  autoLockDelay: 15,
});

// ==================== FONCTIONS D'APPLICATION ====================
export function applyTheme(theme: 'clair' | 'sombre' | 'systeme') {
  const isDark = theme === 'sombre' || (theme === 'systeme' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
}

export function applyThemeColor(color: string) {
  const colors: Record<string, { 500: string; 600: string; 700: string }> = {
    vert: { 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
    bleu: { 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
    violet: { 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
    orange: { 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
  };
  
  const vars = colors[color];
  if (vars) {
    document.documentElement.style.setProperty('--color-primary-500', vars[500]);
    document.documentElement.style.setProperty('--color-primary-600', vars[600]);
    document.documentElement.style.setProperty('--color-primary-700', vars[700]);
    
    // Mettre à jour les classes btn-primary
    const style = document.createElement('style');
    style.textContent = `
      .btn-primary {
        background: linear-gradient(135deg, ${vars[500]}, ${vars[600]}) !important;
      }
      .btn-primary:hover {
        background: linear-gradient(135deg, ${vars[600]}, ${vars[700]}) !important;
      }
      .bg-primary-500 { background-color: ${vars[500]} !important; }
      .bg-primary-600 { background-color: ${vars[600]} !important; }
      .text-primary-600 { color: ${vars[600]} !important; }
      .border-primary-500 { border-color: ${vars[500]} !important; }
    `;
    const oldStyle = document.getElementById('theme-color-style');
    if (oldStyle) oldStyle.remove();
    style.id = 'theme-color-style';
    document.head.appendChild(style);
  }
}

export function applyPolice(police: string) {
  const fonts: Record<string, string> = {
    inter: "'Inter', sans-serif",
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    arial: 'Arial, Helvetica, sans-serif',
    roboto: "'Roboto', sans-serif",
  };
  document.documentElement.style.setProperty('--font-family', fonts[police] || fonts.inter);
  document.body.style.fontFamily = `var(--font-family)`;
}

export function applyTaillePolice(taille: string) {
  const sizes = { petit: '14px', medium: '16px', grand: '18px' };
  document.documentElement.style.setProperty('--font-size-base', sizes[taille as keyof typeof sizes] || '16px');
  document.body.style.fontSize = `var(--font-size-base)`;
}

export function applyDensite(densite: string) {
  const spacings = { compact: '0.75', confortable: '1', large: '1.25' };
  const scale = spacings[densite as keyof typeof spacings] || '1';
  document.documentElement.style.setProperty('--spacing-scale', scale);
}

export function applyAnimations(enable: boolean) {
  if (!enable) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `;
    style.id = 'disable-animations';
    document.head.appendChild(style);
  } else {
    const style = document.getElementById('disable-animations');
    if (style) style.remove();
  }
}

// Initialiser tous les paramètres
export function initializeSettings() {
  const settings = loadSettings();
  applyTheme(settings.theme);
  applyThemeColor(settings.themeCouleur);
  applyPolice(settings.police);
  applyTaillePolice(settings.taillePolice);
  applyDensite(settings.densite);
  applyAnimations(settings.animations);
  
  // Écouter les changements de thème système
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentSettings = loadSettings();
    if (currentSettings.theme === 'systeme') {
      applyTheme('systeme');
    }
  });
}

// ==================== SLICE REDUX ====================
const initialState: SettingsState = loadSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<'clair' | 'sombre' | 'systeme'>) => {
      state.theme = action.payload;
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyTheme(action.payload);
    },
    updateThemeCouleur: (state, action: PayloadAction<'vert' | 'bleu' | 'violet' | 'orange'>) => {
      state.themeCouleur = action.payload;
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyThemeColor(action.payload);
    },
    updatePolice: (state, action: PayloadAction<'inter' | 'system' | 'arial' | 'roboto'>) => {
      state.police = action.payload;
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyPolice(action.payload);
    },
    updateTaillePolice: (state, action: PayloadAction<'petit' | 'medium' | 'grand'>) => {
      state.taillePolice = action.payload;
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyTaillePolice(action.payload);
    },
    updateDensite: (state, action: PayloadAction<'compact' | 'confortable' | 'large'>) => {
      state.densite = action.payload;
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyDensite(action.payload);
    },
    toggleAnimations: (state, action: PayloadAction<boolean>) => {
      state.animations = action.payload;
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyAnimations(action.payload);
    },
    updateNotifications: (state, action: PayloadAction<Partial<NotificationsState>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
      localStorage.setItem('app_settings', JSON.stringify(state));
    },
    updateSecurity: (state, action: PayloadAction<Partial<{ autoLock: boolean; autoLockDelay: number }>>) => {
      Object.assign(state, action.payload);
      localStorage.setItem('app_settings', JSON.stringify(state));
    },
    resetSettings: (state) => {
      const defaults = getDefaultSettings();
      Object.assign(state, defaults);
      localStorage.setItem('app_settings', JSON.stringify(state));
      applyTheme(defaults.theme);
      applyThemeColor(defaults.themeCouleur);
      applyPolice(defaults.police);
      applyTaillePolice(defaults.taillePolice);
      applyDensite(defaults.densite);
      applyAnimations(defaults.animations);
    },
  },
});

export const {
  updateTheme,
  updateThemeCouleur,
  updatePolice,
  updateTaillePolice,
  updateDensite,
  toggleAnimations,
  updateNotifications,
  updateSecurity,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;