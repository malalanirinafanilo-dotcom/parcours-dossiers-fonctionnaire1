// src/services/api.ts - VERSION UNIFIÉE COMPLÈTE
import axios from 'axios';
import toast from 'react-hot-toast';

// L'URL est injectée par Vite via define dans vite.config.js
// En développement, elle utilise le proxy ou localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes timeout
});

// ==================== INTERCEPTEUR REQUÊTE ====================
// Ajoute le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de la requête en développement
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// ==================== INTERCEPTEUR RÉPONSE ====================
// Gère les erreurs et le rafraîchissement du token
api.interceptors.response.use(
  (response) => {
    // Log de la réponse en développement
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Éviter les boucles infinies
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // ==================== ERREUR 401 - Non authentifié ====================
    if (error.response?.status === 401) {
      originalRequest._retry = true;
      
      // Vérifier si c'est une requête de login (ne pas rafraîchir)
      const isLoginRequest = originalRequest.url?.includes('/auth/login/');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh/');
      
      if (!isLoginRequest && !isRefreshRequest) {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (!refreshToken) {
            throw new Error('No refresh token');
          }
          
          // Tentative de rafraîchissement du token
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Rafraîchissement échoué - déconnexion
          console.error('❌ Rafraîchissement token échoué:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          toast.error('Session expirée, veuillez vous reconnecter');
          return Promise.reject(refreshError);
        }
      }
    }
    
    // ==================== ERREUR 403 - Accès interdit ====================
    if (error.response?.status === 403) {
      console.error('❌ Accès non autorisé:', error.response.data);
      toast.error('Vous n\'avez pas les droits nécessaires');
    }
    
    // ==================== ERREUR 404 - Ressource non trouvée ====================
    else if (error.response?.status === 404) {
      console.error('❌ Ressource non trouvée:', error.config.url);
      toast.error('Ressource non trouvée');
    }
    
    // ==================== ERREUR 429 - Trop de requêtes ====================
    else if (error.response?.status === 429) {
      toast.error('Trop de requêtes. Veuillez patienter.');
    }
    
    // ==================== ERREUR 500+ - Erreur serveur ====================
    else if (error.response?.status >= 500) {
      console.error('❌ Erreur serveur:', error.response.data);
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    }
    
    // ==================== ERREUR RÉSEAU ====================
    else if (error.code === 'ECONNABORTED') {
      toast.error('La requête a expiré. Vérifiez votre connexion.');
    }
    
    else if (error.message === 'Network Error') {
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    }
    
    // Log complet en développement
    if (import.meta.env.DEV) {
      console.error('❌ Erreur API détaillée:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;