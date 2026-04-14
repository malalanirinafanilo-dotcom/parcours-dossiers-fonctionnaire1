// src/services/notificationService.ts
import api from './api';
import { Notification } from '../types';
import toast from 'react-hot-toast';

class NotificationService {
  
  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      console.log('🔍 Récupération des notifications...');
      const response = await api.get('/notifications/');
      const notifications = response.data.results || response.data;
      console.log(`📬 ${notifications.length} notifications reçues`);
      return notifications;
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
      return [];
    }
  }
  
  /**
   * Récupère uniquement les notifications non lues
   */
  async getNonLues(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications/non_lues/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('❌ Erreur chargement notifications non lues:', error);
      return [];
    }
  }
  
  /**
   * Récupère le nombre de notifications non lues
   */
  async getCompteNonLues(): Promise<number> {
    try {
      const response = await api.get('/notifications/compte_non_lues/');
      return response.data.count || 0;
    } catch (error) {
      console.error('❌ Erreur comptage notifications:', error);
      return 0;
    }
  }
  
  /**
   * Marque une notification comme lue
   */
  async marquerLue(id: string): Promise<boolean> {
    try {
      await api.post(`/notifications/${id}/marquer_lue/`);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      return false;
    }
  }
  
  /**
   * Marque toutes les notifications comme lues
   */
  async marquerToutesLues(): Promise<boolean> {
    try {
      await api.post('/notifications/marquer_toutes_lues/');
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
      return false;
    }
  }
  
  /**
   * Supprime une notification
   */
  async supprimerNotification(id: string): Promise<boolean> {
    try {
      await api.delete(`/notifications/${id}/`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
      return false;
    }
  }
  
  /**
   * Formate le temps écoulé
   */
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    if (diffHour < 24) return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
    if (diffDay < 7) return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  }
  
  /**
   * Obtient l'icône selon le type de notification
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      default: return 'ℹ️';
    }
  }
  
  /**
   * Obtient la couleur selon le type
   */
  getNotificationColor(type: string): string {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50 border-green-200 text-green-700';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'ERROR': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  }
  
  /**
   * Obtient la couleur du badge
   */
  getBadgeColor(type: string): string {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-700';
      case 'WARNING': return 'bg-yellow-100 text-yellow-700';
      case 'ERROR': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  }
}

export const notificationService = new NotificationService();