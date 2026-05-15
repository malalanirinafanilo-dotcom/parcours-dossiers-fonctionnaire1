// src/services/userService.ts
import api from './api';
import { User } from '../types';

export const userService = {
  // ⚠️ Ne pas utiliser getProfile - utiliser directement l'utilisateur du store
  // Cette méthode est conservée pour compatibilité mais évitez de l'appeler
  
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/users/me/', data);
    return response.data;
  },

  // Récupérer tous les utilisateurs (admin uniquement)
  async getUsers(params?: any): Promise<{ results: User[]; count: number }> {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  // ... autres méthodes
};