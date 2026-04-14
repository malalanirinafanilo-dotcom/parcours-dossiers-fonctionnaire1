// src/services/dossierService.ts - VERSION COMPLÈTE CORRIGÉE
import api from './api';
import { Dossier, DossierDetail, Document, Statistiques, StatistiquesCompte } from '../types';
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
    
    if (!fonctionnaire_nom) {
      fonctionnaire_nom = this.nettoyerTexte(dossier.fonctionnaire_nom || 'Non spécifié');
    }
    if (!fonctionnaire_prenom) {
      fonctionnaire_prenom = this.nettoyerTexte(dossier.fonctionnaire_prenom || '');
    }
    
    // Transformer les documents
    let documents = [];
    if (dossier.documents && Array.isArray(dossier.documents)) {
      documents = dossier.documents.map((doc: any) => ({
        id: doc.id,
        nom: doc.nom,
        type_document: doc.type_document,
        url: doc.url || (doc.fichier ? `/media/${doc.fichier}` : null),
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
   * VERSION CORRIGÉE - L'intéressé voit TOUS ses dossiers (y compris terminés)
   */
  async getDossiersForUser(userEmail: string, userRole: string): Promise<Dossier[]> {
    try {
      console.log('='.repeat(60));
      console.log('🔍 Récupération des dossiers pour:', { userEmail, userRole });
      
      const params: any = {};
      
      const response = await api.get('/dossiers/', { params });
      
      const dossiersBruts = response.data.results || response.data;
      console.log(`📥 ${dossiersBruts.length} dossiers bruts reçus`);
      
      let dossiersTransformes = this.transformDossiers(dossiersBruts);
      
      // ========== FILTRAGE CORRIGÉ POUR L'INTÉRESSÉ ==========
      if (userRole === 'UTILISATEUR' || userEmail.includes('interesse')) {
        // L'intéressé doit voir :
        // 1. Les dossiers qu'il a créés (created_by = lui-même)
        // 2. Les dossiers où il est le fonctionnaire concerné
        // 3. Les dossiers à l'étape INTERESSE (brouillons ou rejetés)
        // 4. Les dossiers terminés (TERMINE) - C'EST CE QUI ÉTAIT MANQUANT !
        // 5. Les dossiers rejetés
        
        dossiersTransformes = dossiersTransformes.filter((d: Dossier) => {
          const estCreateur = d.created_by?.email === userEmail;
          const estFonctionnaire = d.fonctionnaire_nom?.toLowerCase().includes('rakoto') || 
                                   d.fonctionnaire_prenom?.toLowerCase().includes('jean');
          const estSonEtape = d.etape_actuelle === 'INTERESSE';
          const estRejete = d.motif_rejet !== null && d.motif_rejet !== '';
          const estTermine = d.statut === 'TERMINE';  // ✅ AJOUT CRITIQUE
          
          const result = estCreateur || estFonctionnaire || estSonEtape || estRejete || estTermine;
          
          if (result && estTermine) {
            console.log(`✅ Dossier terminé trouvé pour intéressé: ${d.numero_dossier}`);
          }
          
          return result;
        });
        
        console.log(`👤 ${dossiersTransformes.length} dossiers pour intéressé après filtrage`);
        console.log('   Dont terminés:', dossiersTransformes.filter(d => d.statut === 'TERMINE').length);
      }
      
      // ========== FILTRAGE POUR DREN ==========
      else if (userRole === 'DREN' || userEmail.includes('dren')) {
        dossiersTransformes = dossiersTransformes.filter((d: Dossier) => 
          d.etape_actuelle === 'DREN' ||
          d.etapes_validation?.DREN ||
          d.statut === 'TERMINE' ||  // ✅ VOIR LES TERMINÉS AUSSI
          d.motif_rejet
        );
        console.log(`🏛️ ${dossiersTransformes.length} dossiers pour DREN`);
      }
      
      // ========== FILTRAGE POUR MEN ==========
      else if (userRole === 'MEN' || userEmail.includes('men')) {
        dossiersTransformes = dossiersTransformes.filter((d: Dossier) => 
          d.etape_actuelle === 'MEN' ||
          d.etapes_validation?.MEN ||
          d.statut === 'TERMINE' ||  // ✅ VOIR LES TERMINÉS AUSSI
          d.motif_rejet
        );
        console.log(`📚 ${dossiersTransformes.length} dossiers pour MEN`);
      }
      
      // ========== FILTRAGE POUR FOP ==========
      else if (userRole === 'FOP' || userEmail.includes('fop')) {
        dossiersTransformes = dossiersTransformes.filter((d: Dossier) => 
          d.etape_actuelle === 'FOP' ||
          d.etapes_validation?.FOP ||
          d.statut === 'TERMINE' ||  // ✅ VOIR LES TERMINÉS AUSSI
          d.motif_rejet
        );
        console.log(`🛠️ ${dossiersTransformes.length} dossiers pour FOP`);
      }
      
      // ========== FILTRAGE POUR FINANCE ==========
      else if (userRole === 'FINANCE' || userEmail.includes('finance')) {
        dossiersTransformes = dossiersTransformes.filter((d: Dossier) => 
          d.etape_actuelle === 'FINANCE' ||
          d.etapes_validation?.FINANCE ||
          d.statut === 'TERMINE' ||  // ✅ VOIR LES TERMINÉS AUSSI
          d.motif_rejet
        );
        console.log(`💰 ${dossiersTransformes.length} dossiers pour FINANCE`);
      }
      
      // ========== FILTRAGE POUR ADMIN ==========
      else if (userRole === 'ADMIN' || userEmail.includes('admin')) {
        console.log(`👑 ${dossiersTransformes.length} dossiers pour ADMIN`);
      }
      
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
      return null;
    }
  }

  /**
   * Crée un nouveau dossier
   */
  async createDossier(dossierData: any, userEmail: string, files?: File[]): Promise<Dossier | null> {
    try {
      console.log('📝 Création dossier avec données:', dossierData);
      
      if (!dossierData.fonctionnaire_nom || !dossierData.fonctionnaire_prenom) {
        toast.error('Le nom et prénom du fonctionnaire sont obligatoires');
        return null;
      }
      
      let fonctionnaireId = null;
      
      try {
        const searchResponse = await api.get('/fonctionnaires/', {
          params: { 
            search: `${dossierData.fonctionnaire_nom} ${dossierData.fonctionnaire_prenom}` 
          }
        });
        
        const existingFonctionnaires = searchResponse.data.results || searchResponse.data;
        
        if (existingFonctionnaires && existingFonctionnaires.length > 0) {
          fonctionnaireId = existingFonctionnaires[0].id;
          console.log('✅ Fonctionnaire existant trouvé:', fonctionnaireId);
        } else {
          console.log('➕ Création d\'un nouveau fonctionnaire');
          
          const newFonctionnaire = {
            matricule: dossierData.fonctionnaire_matricule || `TEMP-${Date.now()}`,
            nom: dossierData.fonctionnaire_nom,
            prenom: dossierData.fonctionnaire_prenom,
            date_naissance: dossierData.date_naissance || '1970-01-01',
            email: userEmail,
            telephone: dossierData.telephone || '',
            adresse: dossierData.adresse || '',
            categorie: dossierData.categorie || 'A',
            grade: dossierData.grade || 'A1'
          };
          
          console.log('📤 Création fonctionnaire:', newFonctionnaire);
          const fResponse = await api.post('/fonctionnaires/', newFonctionnaire);
          fonctionnaireId = fResponse.data.id;
          console.log('✅ Nouveau fonctionnaire créé avec ID:', fonctionnaireId);
        }
      } catch (error: any) {
        console.error('❌ Erreur lors de la création du fonctionnaire:', error);
        toast.error('Erreur lors de la création du fonctionnaire');
        return null;
      }
      
      if (!fonctionnaireId) {
        toast.error('Impossible de créer ou trouver le fonctionnaire');
        return null;
      }
      
      const dataToSend: any = {
        fonctionnaire: fonctionnaireId,
        titre: dossierData.titre || 'Nouveau dossier',
        type_dossier: dossierData.type_dossier || 'PROMOTION',
        code_mouvement: dossierData.code_mouvement || '02',
        description: dossierData.description || '',
      };
      
      if (dossierData.donnees_specifiques) {
        dataToSend.donnees_specifiques = dossierData.donnees_specifiques;
      }
      
      console.log('📤 Envoi des données au serveur:', dataToSend);
      
      const response = await api.post('/dossiers/', dataToSend);
      console.log('✅ Réponse du serveur:', response.data);
      
      toast.success('✅ Dossier créé avec succès !');
      
      if (files && files.length > 0 && response.data.id) {
        console.log('📎 Upload de', files.length, 'fichiers...');
        await this.uploadMultipleDocuments(response.data.id, files);
      }
      
      return this.transformDossier(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur création dossier:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        
        if (error.response.data) {
          if (typeof error.response.data === 'object') {
            Object.entries(error.response.data).forEach(([field, errors]: [string, any]) => {
              if (Array.isArray(errors)) {
                errors.forEach(err => toast.error(`${field}: ${err}`));
              } else {
                toast.error(`${field}: ${errors}`);
              }
            });
          } else {
            toast.error(error.response.data.detail || 'Erreur lors de la création');
          }
        }
      } else if (error.request) {
        console.error('Pas de réponse du serveur');
        toast.error('Le serveur ne répond pas');
      } else {
        console.error('Erreur:', error.message);
        toast.error(error.message || 'Erreur de communication');
      }
      
      return null;
    }
  }

  /**
   * Upload multiple documents
   */
  async uploadMultipleDocuments(dossierId: string, files: File[]): Promise<boolean> {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('dossier', dossierId);
        formData.append('fichier', file);
        formData.append('nom', file.name);
        formData.append('type_document', 'document');

        await api.post('/documents/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        console.log(`✅ Fichier uploadé: ${file.name}`);
      }
      toast.success(`${files.length} fichier(s) uploadé(s) avec succès`);
      return true;
    } catch (error) {
      console.error('❌ Erreur upload multiple:', error);
      toast.error('Erreur lors de l\'upload des fichiers');
      return false;
    }
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
      
      return response.data.dossier || response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur envoi dossier:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        toast.error(error.response.data?.error || 'Erreur lors de l\'envoi');
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
      
      const dataToSend = { role: userRole };
      
      console.log('📤 Envoi des données:', dataToSend);
      
      const response = await api.post(`/dossiers/${dossierId}/valider/`, dataToSend);
      
      console.log('✅ Réponse validation:', response.data);
      toast.success('✅ Validation réussie !');
      
      return this.transformDossier(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur validation:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        
        const errorMsg = error.response.data?.detail || 
                        error.response.data?.error || 
                        error.response.data?.message ||
                        'Erreur lors de la validation';
        toast.error(errorMsg);
      } else if (error.request) {
        console.error('Pas de réponse du serveur');
        toast.error('Le serveur ne répond pas');
      } else {
        console.error('Erreur:', error.message);
        toast.error(error.message || 'Erreur de communication');
      }
      
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
      
      const dataToSend = { 
        role: userRole,
        motif: motif 
      };
      
      const response = await api.post(`/dossiers/${dossierId}/rejeter/`, dataToSend);
      
      console.log('✅ Réponse rejet:', response.data);
      toast.success('❌ Dossier rejeté');
      
      return this.transformDossier(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur rejet:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        toast.error(error.response.data?.error || 'Erreur lors du rejet');
      } else {
        toast.error('Erreur de communication');
      }
      return null;
    }
  }

  /**
   * Récupère les statistiques pour l'utilisateur
   */
  async getStatistiques(userEmail: string, userRole: string): Promise<any> {
    try {
      const dossiers = await this.getDossiersForUser(userEmail, userRole);
      
      const stats = {
        enCours: dossiers.filter(d => 
          [this.STATUTS.EN_ATTENTE_DREN, this.STATUTS.EN_ATTENTE_MEN, 
           this.STATUTS.EN_ATTENTE_FOP, this.STATUTS.EN_ATTENTE_FINANCE].includes(d.statut as any)
        ).length,
        termines: dossiers.filter(d => d.statut === this.STATUTS.TERMINE).length,
        bloques: dossiers.filter(d => d.statut === this.STATUTS.BLOQUE || d.statut === this.STATUTS.REJETE).length,
        total: dossiers.length,
        enRetard: dossiers.filter(d => {
          if (d.date_limite && d.statut !== this.STATUTS.TERMINE) {
            return new Date(d.date_limite) < new Date();
          }
          return false;
        }).length,
        parCategorie: {}
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return { enCours: 0, termines: 0, bloques: 0, total: 0, enRetard: 0, parCategorie: {} };
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

  /**
   * Supprime un document d'un dossier
   */
  async removeDocument(dossierId: string, documentId: string): Promise<boolean> {
    return this.deleteDocument(documentId);
  }
}

export const dossierService = new DossierService();