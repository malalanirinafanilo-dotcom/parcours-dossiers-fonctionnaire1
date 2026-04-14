// src/services/iaService.ts
import api from './api';

export const iaService = {
  async predictDossier(dossierId: string) {
    const response = await api.get(`/ia/predict/${dossierId}/`);
    return response.data;
  },
  
  async getStats() {
    const response = await api.get('/ia/stats/');
    return response.data;
  }
};