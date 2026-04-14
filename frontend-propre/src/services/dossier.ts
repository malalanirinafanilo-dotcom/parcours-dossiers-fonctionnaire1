import api from './api';
import { Dossier, DossierDetail, Document } from '../types';

export const dossierService = {
  // Récupérer tous les dossiers
  async getDossiers(params?: any): Promise<{ results: Dossier[]; count: number }> {
    const response = await api.get('/dossiers/', { params });
    return response.data;
  },

  // Récupérer un dossier par son ID
  async getDossier(id: string): Promise<DossierDetail> {
    const response = await api.get(`/dossiers/${id}/`);
    return response.data;
  },

  // Créer un nouveau dossier
  async createDossier(data: any): Promise<Dossier> {
    const response = await api.post('/dossiers/', data);
    return response.data;
  },

  // Mettre à jour un dossier
  async updateDossier(id: string, data: any): Promise<Dossier> {
    const response = await api.put(`/dossiers/${id}/`, data);
    return response.data;
  },

  // Valider une étape
  async validerEtape(id: string, commentaire?: string): Promise<any> {
    const response = await api.post(`/dossiers/${id}/valider/`, { commentaire });
    return response.data;
  },

  // Rejeter un dossier
  async rejeterDossier(id: string, motif: string): Promise<any> {
    const response = await api.post(`/dossiers/${id}/rejeter/`, { motif });
    return response.data;
  },

  // Obtenir l'état du workflow
  async getWorkflow(id: string): Promise<any> {
    const response = await api.get(`/dossiers/${id}/workflow/`);
    return response.data;
  },

  // Récupérer les documents d'un dossier
  async getDocuments(dossierId: string): Promise<Document[]> {
    const response = await api.get(`/documents/?dossier=${dossierId}`);
    return response.data.results || response.data;
  },

  // Uploader un document
  async uploadDocument(dossierId: string, file: File, type: string): Promise<Document> {
    const formData = new FormData();
    formData.append('dossier', dossierId);
    formData.append('fichier', file);
    formData.append('nom', file.name);
    formData.append('type_document', type);

    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir les prédictions IA
  async getPredictions(dossierId: string): Promise<any> {
    try {
      const response = await api.get(`/ia-analyses/predic_statut/?dossier=${dossierId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur prédiction statut:', error);
      return null;
    }
  },

  // Obtenir la prédiction de délai
  async getPredictionDelai(dossierId: string): Promise<any> {
    try {
      const response = await api.get(`/ia-analyses/predic_delai/?dossier=${dossierId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur prédiction délai:', error);
      return null;
    }
  },

  // Obtenir les statistiques pour le dashboard
  async getStats(): Promise<any> {
    try {
      const response = await api.get('/dossiers/');
      const dossiers = response.data.results;
      
      const stats = {
        enCours: dossiers.filter((d: Dossier) => d.statut === 'EN_COURS').length,
        termines: dossiers.filter((d: Dossier) => d.statut === 'TERMINE').length,
        bloques: dossiers.filter((d: Dossier) => d.statut === 'BLOQUE').length,
        total: response.data.count,
        enRetard: dossiers.filter((d: Dossier) => {
          if (d.date_limite && d.statut !== 'TERMINE') {
            return new Date(d.date_limite) < new Date();
          }
          return false;
        }).length,
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur stats:', error);
      return null;
    }
  },
};