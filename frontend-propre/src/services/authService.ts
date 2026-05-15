// src/services/authService.ts
import api from './api';
import { LoginCredentials, AuthResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login/', credentials);
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    
    // Si l'utilisateur n'est pas dans la réponse, le récupérer
    if (!response.data.user && response.data.access) {
      try {
        const userResponse = await api.get('/users/me/');
        response.data.user = userResponse.data;
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
      }
    } else if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  isSuperUser(): boolean {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.is_superuser === true;
      } catch {
        return false;
      }
    }
    return false;
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};