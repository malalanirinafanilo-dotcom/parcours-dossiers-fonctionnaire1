import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/auth';
import { User, LoginCredentials } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Fonction pour charger l'utilisateur depuis le localStorage
const loadUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Utilisateur chargé du localStorage:', user);
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
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      console.log('🔑 Réponse login:', response);
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('💾 Utilisateur sauvegardé dans localStorage:', response.user);
      }
      return response.user;
    } catch (error: any) {
      console.error('❌ Erreur login:', error);
      return rejectWithValue(error.response?.data?.detail || 'Erreur de connexion');
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
      console.log('🚪 Utilisateur déconnecté');
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
        console.log('✅ Connexion réussie - Utilisateur:', action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('❌ Connexion échouée:', action.payload);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;