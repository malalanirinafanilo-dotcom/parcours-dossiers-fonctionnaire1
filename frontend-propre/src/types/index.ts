// src/types/index.ts

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone_number?: string;
  is_active: boolean;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface Fonctionnaire {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  categorie: string;
  grade: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  code: string;
  description: string;
  steps: string[];
  roles_autorises: string[];
  delai_maximum: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== DOSSIER (Version complète et unique) ====================
export interface Dossier {
  id: string;
  numero_dossier: string;
  titre: string;
  type_dossier: string;
  code_mouvement?: string;
  fonctionnaire: string | Fonctionnaire;
  fonctionnaire_nom?: string;
  fonctionnaire_prenom?: string;
  fonctionnaire_matricule?: string;
  workflow?: string | Workflow;
  workflow_nom?: string;
  statut: 'BROUILLON' | 'EN_ATTENTE_DREN' | 'EN_ATTENTE_MEN' | 'EN_ATTENTE_FOP' | 'EN_ATTENTE_FINANCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE' | 'REJETE';
  etape_actuelle: 'INTERESSE' | 'DREN' | 'MEN' | 'FOP' | 'FINANCE' | 'TERMINE' | 'REJETE';
  assigne_a?: string | User;
  date_depot: string;
  date_limite?: string;
  date_cloture?: string;
  created_by?: string | User;
  created_at: string;
  updated_at: string;
  etapes_validation: Record<string, any>;
  motif_rejet?: string;
  date_derniere_action: string;
  peut_valider?: boolean;
  prochaine_etape?: string;
  documents?: Document[];
  analyses_ia?: IAAnalyse[];
}

export interface DossierDetail extends Dossier {
  fonctionnaire: Fonctionnaire;
  workflow: Workflow;
  assigne_a: User;
  created_by: User;
  historique: HistoriqueAction[];
  documents: Document[];
  analyses_ia: IAAnalyse[];
  etapes_validation_detail: Record<string, any>;
  derniere_analyse_ia?: IAAnalyse;
}

export interface Document {
  id: string;
  dossier: string;
  nom: string;
  fichier: string;
  url?: string;
  type_document: string;
  taille?: number;
  upload_by: string;
  upload_by_nom?: string;
  created_at: string;
}

export interface HistoriqueAction {
  id: string;
  dossier: string;
  user: string;
  user_nom?: string;
  user_email?: string;
  action: 'CREATION' | 'VALIDATION' | 'REJET' | 'TRANSFERT' | 'MODIFICATION' | 'BLOQUAGE';
  etape: string;
  commentaire?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface IAAnalyse {
  id: string;
  dossier: string;
  type_analyse: 'RULE_BASED' | 'ML';
  resultats: Record<string, any>;
  score_risque?: number;
  classification?: string;
  created_at: string;
}

export interface Statistiques {
  enCours: number;
  termines: number;
  enRetard: number;
  bloques: number;
  total: number;
  parCategorie: Record<string, number>;
  parStatut?: {
    brouillon: number;
    enAttenteDREN: number;
    enAttenteMEN: number;
    enAttenteFOP: number;
    enAttenteFinance: number;
    enCours: number;
    termine: number;
    rejete: number;
  };
  parEtape?: {
    aValider: number;
    valides: number;
    transmis: number;
  };
}

export interface Notification {
  id: string;
  user: string;
  user_email: string;
  user_name: string;
  dossier?: string;
  dossier_numero?: string;
  dossier_titre?: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  titre: string;
  message: string;
  action_requise: boolean;
  lu: boolean;
  created_at: string;
  time_ago?: string;
}

// ==================== TYPES POUR LES CODES MOUVEMENT ====================
export type CodeMouvement = string;

export interface CodeMouvementInfo {
  code: string;
  libelle: string;
  categorie: string;
  description: string;
  documentsRequis: string[];
  rolesApprobateurs: string[];
  delaiTraitement: number;
  indemnites?: string[];
}