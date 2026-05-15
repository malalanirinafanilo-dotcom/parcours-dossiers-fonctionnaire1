// src/store/authSlice.ts - VERSION UNIFIÉE COMPLÈTE
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { User, LoginCredentials } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isSuperUser: boolean;
  loading: boolean;
  error: string | null;
}

// Fonction pour charger l'utilisateur depuis le localStorage
const loadUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Utilisateur chargé du localStorage:', user.email);
      return user;
    } catch (e) {
      console.error('Erreur lors du chargement de l\'utilisateur:', e);
      localStorage.removeItem('user');
    }
  }
  return null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isAuthenticated: authService.isAuthenticated(),
  isSuperUser: authService.isAuthenticated() ? (loadUserFromStorage()?.is_superuser || false) : false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('🔑 Tentative de connexion pour:', credentials.email);
      const response = await authService.login(credentials);
      
      console.log('✅ Connexion réussie - Utilisateur:', response.user?.email);
      
      // Sauvegarder l'utilisateur dans localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response.user;
    } catch (error: any) {
      console.error('❌ Erreur login:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Email ou mot de passe incorrect';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      localStorage.removeItem('user');
      state.user = null;
      state.isAuthenticated = false;
      state.isSuperUser = false;
      console.log('🚪 Utilisateur déconnecté');
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      state.isSuperUser = action.payload?.is_superuser || false;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('⏳ Connexion en cours...');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload || null;
        state.isSuperUser = action.payload?.is_superuser || false;
        console.log('✅ Utilisateur connecté:', action.payload?.email);
        console.log('👑 SuperUser:', state.isSuperUser);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('❌ Connexion échouée:', action.payload);
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;