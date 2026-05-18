// src/services/dossierService.ts - VERSION CORRIGÉE (gestion matricule dupliqué)
import api from './api';
import { Dossier, DossierDetail, Document } from '../types';
import toast from 'react-hot-toast';

class DossierService {
  
  private readonly STATUTS = {
    BROUILLON: 'BROUILLON',
    EN_ATTENTE_DREN: 'EN_ATTENTE_DREN',
    EN_ATTENTE_MEN: 'EN_ATTENTE_MEN',
    EN_ATTENTE_FOP: 'EN_ATTENTE_FOP',
    EN_ATTENTE_FINANCE: 'EN_ATTENTE_FINANCE',
    EN_COURS: 'EN_COURS',
    BLOQUE: 'BLOQUE',
    TERMINE: 'TERMINE',
    REJETE: 'REJETE',
  } as const;

  private readonly ETAPES = {
    INTERESSE: 'INTERESSE',
    DREN: 'DREN',
    MEN: 'MEN',
    FOP: 'FOP',
    FINANCE: 'FINANCE',
    TERMINE: 'TERMINE',
    REJETE: 'REJETE',
  } as const;

  /**
   * Nettoie les chaînes avec des problèmes d'encodage
   */
  private nettoyerTexte(texte: string | null | undefined): string {
    if (!texte) return '';
    
    const corrections: [RegExp, string][] = [
      [/Ã©/g, 'é'],
      [/Ã¨/g, 'è'],
      [/Ãª/g, 'ê'],
      [/Ã«/g, 'ë'],
      [/Ã /g, 'à'],
      [/Ã¢/g, 'â'],
      [/Ã´/g, 'ô'],
      [/Ã¹/g, 'ù'],
      [/Ã»/g, 'û'],
      [/Ã§/g, 'ç'],
      [/Ã¯/g, 'ï'],
      [/Ã¼/g, 'ü'],
      [/Å“/g, 'œ'],
      [/Ã€/g, 'À'],
      [/Ã‰/g, 'É'],
      [/ÃŠ/g, 'Ê'],
      [/Ã‹/g, 'Ë'],
      [/Ã‡/g, 'Ç'],
    ];
    
    let textePropre = texte;
    for (const [pattern, remplacement] of corrections) {
      textePropre = textePropre.replace(pattern, remplacement);
    }
    
    return textePropre;
  }

  /**
   * Génère un matricule unique
   */
  private genererMatriculeUnique(): string {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `MAT-${timestamp}-${random}`;
  }

  /**
   * Transforme un dossier brut du backend en objet Dossier utilisable par le frontend
   */
  private transformDossier(dossier: any): Dossier {
    // Extraire les informations du fonctionnaire
    let fonctionnaire_nom = '';
    let fonctionnaire_prenom = '';
    let fonctionnaire_matricule = '';
    let fonctionnaire_complet = null;
    
    if (dossier.fonctionnaire) {
      fonctionnaire_complet = dossier.fonctionnaire;
      fonctionnaire_nom = this.nettoyerTexte(dossier.fonctionnaire.nom || '');
      fonctionnaire_prenom = this.nettoyerTexte(dossier.fonctionnaire.prenom || '');
      fonctionnaire_matricule = this.nettoyerTexte(dossier.fonctionnaire.matricule || '');
    }
    
    // Fallback si le fonctionnaire n'est pas chargé
    if (!fonctionnaire_nom) {
      fonctionnaire_nom = this.nettoyerTexte(dossier.fonctionnaire_nom || 'Non spécifié');
    }
    if (!fonctionnaire_prenom) {
      fonctionnaire_prenom = this.nettoyerTexte(dossier.fonctionnaire_prenom || '');
    }
    if (!fonctionnaire_matricule) {
      fonctionnaire_matricule = this.nettoyerTexte(dossier.fonctionnaire_matricule || '');
    }
    
    // Transformer les documents
    let documents = [];
    if (dossier.documents && Array.isArray(dossier.documents)) {
      documents = dossier.documents.map((doc: any) => ({
        id: doc.id,
        nom: doc.nom,
        type_document: doc.type_document,
        url: doc.url || (doc.fichier ? `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}${doc.fichier}` : null),
        fichier: doc.fichier,
        taille: doc.taille || 0,
        created_at: doc.created_at,
        upload_by: doc.upload_by,
        upload_by_nom: doc.upload_by_nom
      }));
    }
    
    // Créer l'objet Dossier
    const transformed = {
      id: dossier.id || '',
      numero_dossier: dossier.numero_dossier || 'N/A',
      titre: this.nettoyerTexte(dossier.titre) || 'Sans titre',
      type_dossier: dossier.type_dossier || 'Non spécifié',
      code_mouvement: dossier.code_mouvement || '',
      statut: dossier.statut || this.STATUTS.BROUILLON,
      etape_actuelle: dossier.etape_actuelle || this.ETAPES.INTERESSE,
      fonctionnaire_nom: fonctionnaire_nom,
      fonctionnaire_prenom: fonctionnaire_prenom,
      fonctionnaire_matricule: fonctionnaire_matricule,
      fonctionnaire: fonctionnaire_complet,
      fonctionnaire_email: dossier.fonctionnaire?.email || dossier.fonctionnaire_email || '',
      motif_rejet: dossier.motif_rejet ? this.nettoyerTexte(dossier.motif_rejet) : null,
      date_depot: dossier.date_depot || new Date().toISOString(),
      date_limite: dossier.date_limite || null,
      date_cloture: dossier.date_cloture || null,
      created_at: dossier.created_at || new Date().toISOString(),
      updated_at: dossier.updated_at || new Date().toISOString(),
      date_derniere_action: dossier.date_derniere_action || new Date().toISOString(),
      created_by: dossier.created_by || null,
      assigne_a: dossier.assigne_a || null,
      documents: documents,
      analyses_ia: dossier.analyses_ia || [],
      etapes_validation: dossier.etapes_validation || {},
      peut_valider: dossier.peut_valider || false,
      prochaine_etape: dossier.prochaine_etape || null,
      documents_count: documents.length
    };
    
    return transformed as Dossier;
  }

  /**
   * Transforme une liste de dossiers
   */
  private transformDossiers(dossiers: any[]): Dossier[] {
    if (!dossiers || !Array.isArray(dossiers)) {
      return [];
    }
    return dossiers.map(d => this.transformDossier(d));
  }

  /**
   * Récupère tous les dossiers pour un utilisateur
   */
  async getDossiersForUser(userEmail: string, userRole: string): Promise<Dossier[]> {
    try {
      console.log('='.repeat(60));
      console.log('🔍 Récupération des dossiers pour:', { userEmail, userRole });
      
      const response = await api.get('/dossiers/');
      const dossiersBruts = response.data.results || response.data;
      console.log(`📥 ${dossiersBruts.length} dossiers bruts reçus`);
      
      // Le backend filtre déjà selon le rôle, pas besoin de refiltrer ici
      let dossiersTransformes = this.transformDossiers(dossiersBruts);
      
      console.log(`📊 ${dossiersTransformes.length} dossiers après transformation`);
      console.log('   Dont terminés:', dossiersTransformes.filter(d => d.statut === 'TERMINE').length);
      
      return dossiersTransformes;
      
    } catch (error: any) {
      console.error('❌ Erreur chargement dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
      return [];
    }
  }

  /**
   * Récupère un dossier par son ID
   */
  async getDossierById(id: string): Promise<DossierDetail | null> {
    try {
      const response = await api.get(`/dossiers/${id}/`);
      return this.transformDossier(response.data) as DossierDetail;
    } catch (error: any) {
      console.error('❌ Erreur chargement dossier:', error);
      if (error.response?.status === 404) {
        toast.error('Dossier non trouvé');
      }
      return null;
    }
  }

  /**
   * Crée un nouveau dossier - VERSION CORRIGÉE (gestion matricule dupliqué)
   */
  async createDossier(dossierData: any, userEmail: string, files?: File[]): Promise<Dossier | null> {
    try {
      console.log('📝 Création dossier avec données:', dossierData);
      
      // Validation des champs obligatoires
      if (!dossierData.fonctionnaire_nom || !dossierData.fonctionnaire_prenom) {
        toast.error('Le nom et prénom du fonctionnaire sont obligatoires');
        return null;
      }
      
      let fonctionnaireId = null;
      
      // ========== 1. RECHERCHER UN FONCTIONNAIRE EXISTANT ==========
      try {
        // Rechercher par nom et prénom d'abord
        const searchResponse = await api.get('/fonctionnaires/', {
          params: { 
            search: `${dossierData.fonctionnaire_nom} ${dossierData.fonctionnaire_prenom}`
          }
        });
        
        const existingFonctionnaires = searchResponse.data.results || searchResponse.data;
        
        if (existingFonctionnaires && existingFonctionnaires.length > 0) {
          // Vérifier si le fonctionnaire correspond exactement
          const matchingFonctionnaire = existingFonctionnaires.find((f: any) => 
            f.nom?.toLowerCase() === dossierData.fonctionnaire_nom?.toLowerCase() &&
            f.prenom?.toLowerCase() === dossierData.fonctionnaire_prenom?.toLowerCase()
          );
          
          if (matchingFonctionnaire) {
            fonctionnaireId = matchingFonctionnaire.id;
            console.log('✅ Fonctionnaire existant trouvé:', fonctionnaireId);
            console.log('   Matricule existant:', matchingFonctionnaire.matricule);
          }
        }
      } catch (error) {
        console.log('Recherche fonctionnaire existant:', error);
      }
      
      // ========== 2. CRÉER UN NOUVEAU FONCTIONNAIRE SI NON TROUVÉ ==========
      if (!fonctionnaireId) {
        console.log('➕ Création d\'un nouveau fonctionnaire');
        
        let fonctionnaireCree = false;
        let tentatives = 0;
        const maxTentatives = 5;
        
        while (!fonctionnaireCree && tentatives < maxTentatives) {
          try {
            const matricule = this.genererMatriculeUnique();
            
            const newFonctionnaire = {
              matricule: matricule,
              nom: dossierData.fonctionnaire_nom,
              prenom: dossierData.fonctionnaire_prenom,
              date_naissance: dossierData.date_naissance || '1970-01-01',
              email: dossierData.fonctionnaire_email || userEmail,
              telephone: dossierData.telephone || '',
              adresse: dossierData.adresse || '',
              categorie: dossierData.categorie || 'A',
              grade: dossierData.grade || 'A1'
            };
            
            console.log(`📤 Tentative ${tentatives + 1}: Création fonctionnaire avec matricule: ${matricule}`);
            const fResponse = await api.post('/fonctionnaires/', newFonctionnaire);
            fonctionnaireId = fResponse.data.id;
            fonctionnaireCree = true;
            console.log('✅ Nouveau fonctionnaire créé avec ID:', fonctionnaireId);
            
          } catch (error: any) {
            tentatives++;
            console.error(`❌ Tentative ${tentatives} échouée:`, error.response?.data || error.message);
            
            // Vérifier si l'erreur est due à un matricule dupliqué
            const isDuplicateError = 
              error.response?.data?.matricule ||
              (error.response?.data && JSON.stringify(error.response.data).toLowerCase().includes('matricule')) ||
              (error.response?.data && JSON.stringify(error.response.data).toLowerCase().includes('unique'));
            
            if (isDuplicateError && tentatives < maxTentatives) {
              console.log(`⚠️ Matricule dupliqué, nouvelle tentative ${tentatives + 1}/${maxTentatives}`);
              continue;
            } else if (tentatives >= maxTentatives) {
              throw new Error('Impossible de créer un matricule unique après plusieurs tentatives');
            } else {
              throw error;
            }
          }
        }
      }
      
      if (!fonctionnaireId) {
        toast.error('Impossible de créer ou trouver le fonctionnaire');
        return null;
      }
      
      // ========== 3. CRÉER LE DOSSIER ==========
      const dataToSend: any = {
        fonctionnaire: fonctionnaireId,
        titre: dossierData.titre || 'Nouveau dossier',
        type_dossier: dossierData.type_dossier || 'PROMOTION',
        code_mouvement: dossierData.code_mouvement || '02',
      };
      
      if (dossierData.description) {
        dataToSend.description = dossierData.description;
      }
      
      if (dossierData.donnees_specifiques) {
        dataToSend.donnees_specifiques = dossierData.donnees_specifiques;
      }
      
      console.log('📤 Envoi des données au serveur:', dataToSend);
      
      let response;
      try {
        response = await api.post('/dossiers/', dataToSend);
        console.log('✅ Réponse du serveur:', response.data);
      } catch (error: any) {
        console.error('❌ Erreur création dossier:', error);
        
        if (error.response?.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'object') {
            Object.entries(errorData).forEach(([field, errors]) => {
              const errorMsg = Array.isArray(errors) ? errors.join(', ') : errors;
              toast.error(`${field}: ${errorMsg}`);
            });
          } else {
            toast.error(errorData.detail || 'Erreur lors de la création du dossier');
          }
        } else if (error.request) {
          toast.error('Le serveur ne répond pas. Vérifiez que le backend est démarré.');
        } else {
          toast.error(error.message || 'Erreur de communication');
        }
        return null;
      }
      
      toast.success('✅ Dossier créé avec succès !');
      
      // ========== 4. UPLOADER LES DOCUMENTS ==========
      if (files && files.length > 0 && response.data.id) {
        console.log(`📎 Upload de ${files.length} fichier(s)...`);
        const uploadSuccess = await this.uploadMultipleDocuments(response.data.id, files);
        if (uploadSuccess) {
          toast.success(`${files.length} fichier(s) uploadé(s) avec succès`);
        } else {
          toast.warning('Dossier créé mais certains fichiers n\'ont pas pu être uploadés');
        }
      }
      
      return this.transformDossier(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur générale création dossier:', error);
      toast.error(error.message || 'Erreur lors de la création du dossier');
      return null;
    }
  }

  /**
   * Upload multiple documents
   */
  async uploadMultipleDocuments(dossierId: string, files: File[]): Promise<boolean> {
    let allSuccess = true;
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('dossier', dossierId);
        formData.append('fichier', file);
        formData.append('nom', file.name);
        formData.append('type_document', 'document');

        await api.post('/documents/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        console.log(`✅ Fichier uploadé: ${file.name}`);
      } catch (error) {
        console.error(`❌ Erreur upload ${file.name}:`, error);
        allSuccess = false;
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }
    
    return allSuccess;
  }

  /**
   * ENVOYER - Intéressé → DREN
   */
  async envoyerDossier(dossierId: string, userEmail: string): Promise<Dossier | null> {
    try {
      console.log('='.repeat(60));
      console.log('📤 ENVOI DOSSIER');
      console.log('📤 ID Dossier:', dossierId);
      console.log('📤 Par:', userEmail);
      
      const response = await api.post(`/dossiers/${dossierId}/envoyer/`, {
        user_email: userEmail
      });
      
      console.log('✅ Réponse envoi:', response.data);
      toast.success('✅ Dossier envoyé avec succès !');
      
      return this.transformDossier(response.data.dossier || response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur envoi dossier:');
      
      if (error.response?.data) {
        toast.error(error.response.data.error || 'Erreur lors de l\'envoi');
      } else {
        toast.error('Erreur de communication');
      }
      return null;
    }
  }

  /**
   * VALIDER - Valide l'étape actuelle
   */
  async validerEtape(dossierId: string, userRole: string): Promise<Dossier | null> {
    try {
      console.log('='.repeat(60));
      console.log('✅ VALIDATION DOSSIER');
      console.log('✅ ID Dossier:', dossierId);
      console.log('✅ Par rôle:', userRole);
      
      const response = await api.post(`/dossiers/${dossierId}/valider/`, {
        role: userRole
      });
      
      console.log('✅ Réponse validation:', response.data);
      toast.success('✅ Validation réussie !');
      
      return this.transformDossier(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur validation:', error);
      
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.error || 
                      'Erreur lors de la validation';
      toast.error(errorMsg);
      return null;
    }
  }

  /**
   * REJETER - Rejette le dossier
   */
  async rejeterDossier(dossierId: string, userRole: string, motif: string): Promise<Dossier | null> {
    try {
      console.log('='.repeat(60));
      console.log('❌ REJET DOSSIER');
      console.log('❌ ID Dossier:', dossierId);
      console.log('❌ Par rôle:', userRole);
      console.log('❌ Motif:', motif);
      
      const response = await api.post(`/dossiers/${dossierId}/rejeter/`, {
        role: userRole,
        motif: motif
      });
      
      console.log('✅ Réponse rejet:', response.data);
      toast.success('❌ Dossier rejeté');
      
      return this.transformDossier(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur rejet:', error);
      toast.error(error.response?.data?.error || 'Erreur lors du rejet');
      return null;
    }
  }

  /**
   * Supprime un document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await api.delete(`/documents/${documentId}/`);
      toast.success('Document supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression document:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }
}

export const dossierService = new DossierService();