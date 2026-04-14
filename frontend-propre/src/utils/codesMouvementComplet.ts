// src/utils/codesMouvementComplet.ts
export interface CodeMouvementInfo {
  code: string;
  libelle: string;
  categorie: string;
  description: string;
  champs: Array<{
    nom: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
    options?: string[];
    obligatoire?: boolean;
    readOnly?: boolean;
  }>;
  documentsRequis: string[];
  rolesApprobateurs: string[];
  delaiTraitement: number;
  indemnites?: string[];
}

export const CODES_MOUVEMENT_COMPLET: Record<string, CodeMouvementInfo> = {
  // I - CAS DE CREATION (01-09)
  '01': {
    code: '01',
    libelle: 'Nomination Haut Emploi de l\'Etat (HEE) non fonctionnaire permanent',
    categorie: 'CREATION',
    description: 'Nomination à un poste de haut niveau pour un non-fonctionnaire permanent',
    champs: [
      { nom: 'poste_hee', label: 'Poste HEE', type: 'text', obligatoire: true },
      { nom: 'type_hee', label: 'Type HEE', type: 'select', options: ['FONC', 'NON_FONC', 'FONC_NON_PERM', 'NON_FONC_NON_PERM'], obligatoire: true },
      { nom: 'date_nomination', label: 'Date de nomination', type: 'date', obligatoire: true },
      { nom: 'duree_contrat', label: 'Durée du contrat (mois)', type: 'number', obligatoire: true },
      { nom: 'salaire_base', label: 'Salaire de base', type: 'number', obligatoire: true },
      { nom: 'indemnites', label: 'Indemnités', type: 'multiselect', options: ['542', '543'] }
    ],
    documentsRequis: ['arrete_nomination.pdf', 'cv.pdf', 'diplomes.pdf', 'casier_judiciaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '02': {
    code: '02',
    libelle: 'Nomination d\'un Fonctionnaire',
    categorie: 'CREATION',
    description: 'Nomination d\'un agent au statut de fonctionnaire',
    champs: [
      { nom: 'poste_demande', label: 'Poste demandé', type: 'text', obligatoire: true },
      { nom: 'grade_actuel', label: 'Grade actuel', type: 'text', obligatoire: true },
      { nom: 'grade_demande', label: 'Grade demandé', type: 'text', obligatoire: true },
      { nom: 'date_prise_fonction', label: 'Date de prise de fonction', type: 'date', obligatoire: true },
      { nom: 'direction', label: 'Direction', type: 'text', obligatoire: true },
      { nom: 'etablissement', label: 'Établissement', type: 'text' },
      { nom: 'salaire_base', label: 'Salaire de base', type: 'number', obligatoire: true },
      { nom: 'indice', label: 'Indice', type: 'text' }
    ],
    documentsRequis: ['demande_nomination.pdf', 'diplomes.pdf', 'casier_judiciaire.pdf', 'certificat_medical.pdf', 'photo_identite.jpg'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 45
  },
  '03': {
    code: '03',
    libelle: 'Recrutement d\'un EFA',
    categorie: 'CREATION',
    description: 'Recrutement d\'un Elève Fonctionnaire Administratif',
    champs: [
      { nom: 'numero_concours', label: 'N° concours', type: 'text', obligatoire: true },
      { nom: 'date_concours', label: 'Date du concours', type: 'date', obligatoire: true },
      { nom: 'classement', label: 'Classement', type: 'number', obligatoire: true },
      { nom: 'option', label: 'Option choisie', type: 'text', obligatoire: true },
      { nom: 'etablissement', label: 'Établissement', type: 'text', obligatoire: true },
      { nom: 'date_debut_formation', label: 'Date début formation', type: 'date', obligatoire: true },
      { nom: 'duree_formation', label: 'Durée formation (mois)', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['demande_recrutement.pdf', 'diplomes.pdf', 'casier_judiciaire.pdf', 'certificat_medical.pdf', 'photo_identite.jpg', 'attestation_concours.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FOP'],
    delaiTraitement: 30
  },
  '04': {
    code: '04',
    libelle: 'Recrutement d\'un ELD',
    categorie: 'CREATION',
    description: 'Recrutement d\'un Elève de l\'Administration',
    champs: [
      { nom: 'numero_concours', label: 'N° concours', type: 'text', obligatoire: true },
      { nom: 'date_concours', label: 'Date du concours', type: 'date', obligatoire: true },
      { nom: 'classement', label: 'Classement', type: 'number', obligatoire: true },
      { nom: 'option', label: 'Option choisie', type: 'text', obligatoire: true },
      { nom: 'etablissement', label: 'Établissement', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_recrutement.pdf', 'diplomes.pdf', 'casier_judiciaire.pdf', 'certificat_medical.pdf', 'photo_identite.jpg'],
    rolesApprobateurs: ['DREN', 'MEN', 'FOP'],
    delaiTraitement: 30
  },
  '05': {
    code: '05',
    libelle: 'Nomination HEE fonctionnaire permanent',
    categorie: 'CREATION',
    description: 'Nomination HEE pour un fonctionnaire permanent',
    champs: [
      { nom: 'poste_hee', label: 'Poste HEE', type: 'text', obligatoire: true },
      { nom: 'type_hee', label: 'Type HEE', type: 'select', options: ['FONC'], obligatoire: true },
      { nom: 'date_nomination', label: 'Date de nomination', type: 'date', obligatoire: true },
      { nom: 'grade_actuel', label: 'Grade actuel', type: 'text', obligatoire: true },
      { nom: 'grade_apres', label: 'Grade après nomination', type: 'text', obligatoire: true },
      { nom: 'indemnites', label: 'Indemnités', type: 'multiselect', options: ['542'] }
    ],
    documentsRequis: ['arrete_nomination.pdf', 'cv.pdf', 'diplomes.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 20
  },
  '06': {
    code: '06',
    libelle: 'Nomination HEE fonctionnaire non permanent',
    categorie: 'CREATION',
    description: 'Nomination HEE pour un fonctionnaire non permanent',
    champs: [
      { nom: 'poste_hee', label: 'Poste HEE', type: 'text', obligatoire: true },
      { nom: 'type_hee', label: 'Type HEE', type: 'select', options: ['FONC_NON_PERM'], obligatoire: true },
      { nom: 'date_nomination', label: 'Date de nomination', type: 'date', obligatoire: true },
      { nom: 'duree_mission', label: 'Durée de la mission (mois)', type: 'number', obligatoire: true },
      { nom: 'indemnites', label: 'Indemnités', type: 'multiselect', options: ['542', '543'] }
    ],
    documentsRequis: ['arrete_nomination.pdf', 'cv.pdf', 'diplomes.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 20
  },
  '07': {
    code: '07',
    libelle: 'Nomination HEE non fonctionnaire non permanent',
    categorie: 'CREATION',
    description: 'Nomination HEE pour un non-fonctionnaire non permanent',
    champs: [
      { nom: 'poste_hee', label: 'Poste HEE', type: 'text', obligatoire: true },
      { nom: 'type_hee', label: 'Type HEE', type: 'select', options: ['NON_FONC_NON_PERM'], obligatoire: true },
      { nom: 'date_nomination', label: 'Date de nomination', type: 'date', obligatoire: true },
      { nom: 'duree_contrat', label: 'Durée du contrat (mois)', type: 'number', obligatoire: true },
      { nom: 'salaire_base', label: 'Salaire de base', type: 'number', obligatoire: true },
      { nom: 'indemnites', label: 'Indemnités', type: 'multiselect', options: ['542', '543'] }
    ],
    documentsRequis: ['arrete_nomination.pdf', 'cv.pdf', 'diplomes.pdf', 'contrat.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 20
  },
  '08': {
    code: '08',
    libelle: 'Rapatriement du personnel extérieur',
    categorie: 'CREATION',
    description: 'Retour et réintégration du personnel en poste à l\'étranger',
    champs: [
      { nom: 'pays_provenance', label: 'Pays de provenance', type: 'text', obligatoire: true },
      { nom: 'date_retour', label: 'Date de retour', type: 'date', obligatoire: true },
      { nom: 'poste_occupe', label: 'Poste occupé à l\'étranger', type: 'text', obligatoire: true },
      { nom: 'poste_demande', label: 'Poste demandé', type: 'text', obligatoire: true },
      { nom: 'duree_sejour', label: 'Durée du séjour (mois)', type: 'number', obligatoire: true },
      { nom: 'motif_retour', label: 'Motif du retour', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_rapatriement.pdf', 'attestation_service_exterieur.pdf', 'rapport_activite.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 60
  },
  '09': {
    code: '09',
    libelle: 'Autres nominations',
    categorie: 'CREATION',
    description: 'Autres cas de nomination non spécifiés',
    champs: [
      { nom: 'type_nomination', label: 'Type de nomination', type: 'text', obligatoire: true },
      { nom: 'poste_demande', label: 'Poste demandé', type: 'text', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_nomination.pdf', 'pieces_justificatives.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 30
  },

  // II - CAS DE MODIFICATION DE SITUATION (10-19)
  '10': {
    code: '10',
    libelle: 'Intégration',
    categorie: 'MODIFICATION',
    description: 'Intégration d\'un agent dans un corps ou cadre spécifique',
    champs: [
      { nom: 'corps_integration', label: "Corps d'intégration", type: 'text', obligatoire: true },
      { nom: 'grade_integration', label: "Grade d'intégration", type: 'text', obligatoire: true },
      { nom: 'echelon', label: 'Échelon', type: 'number', obligatoire: true },
      { nom: 'indice', label: 'Indice', type: 'number', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'anciennete', label: 'Ancienneté dans le grade (ans)', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['demande_integration.pdf', 'diplomes.pdf', 'attestation_service.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 30
  },
  '11': {
    code: '11',
    libelle: 'Titularisation',
    categorie: 'MODIFICATION',
    description: 'Passage d\'un agent stagiaire à titulaire',
    champs: [
      { nom: 'date_debut_stage', label: 'Date début stage', type: 'date', obligatoire: true },
      { nom: 'date_fin_stage', label: 'Date fin stage', type: 'date', obligatoire: true },
      { nom: 'duree_stage', label: 'Durée du stage (mois)', type: 'number', obligatoire: true },
      { nom: 'avis_commission', label: "Avis de la commission", type: 'select', options: ['Favorable', 'Défavorable'], obligatoire: true },
      { nom: 'date_titularisation', label: 'Date de titularisation', type: 'date', obligatoire: true },
      { nom: 'grade', label: 'Grade', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['rapport_stage.pdf', 'evaluation.pdf', 'demande_titularisation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '12': {
    code: '12',
    libelle: 'Avancement de Classe',
    categorie: 'MODIFICATION',
    description: 'Promotion à une classe supérieure (Avenant)',
    champs: [
      { nom: 'classe_actuelle', label: 'Classe actuelle', type: 'text', obligatoire: true },
      { nom: 'classe_demandee', label: 'Classe demandée', type: 'text', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'note', label: 'Note /20', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['avenant.pdf', 'evaluation.pdf', 'ancien_arrete.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 15
  },
  '13': {
    code: '13',
    libelle: 'Avancement d\'Echelon',
    categorie: 'MODIFICATION',
    description: 'Progression à l\'échelon supérieur',
    champs: [
      { nom: 'echelon_actuel', label: 'Échelon actuel', type: 'number', obligatoire: true },
      { nom: 'echelon_demande', label: 'Échelon demandé', type: 'number', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'anciennete', label: 'Ancienneté dans l\'échelon (ans)', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['arrete_avancement.pdf', 'evaluation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 10
  },
  '14': {
    code: '14',
    libelle: 'Reclassement d\'un Fonctionnaire',
    categorie: 'MODIFICATION',
    description: 'Reclassement suite à concours ou diplôme (Arrêté)',
    champs: [
      { nom: 'motif_reclassement', label: 'Motif du reclassement', type: 'select', options: ['Concours', 'Diplôme', 'Autre'], obligatoire: true },
      { nom: 'diplome_obtenu', label: 'Diplôme obtenu', type: 'text' },
      { nom: 'concours_reussi', label: 'Concours réussi', type: 'text' },
      { nom: 'nouveau_grade', label: 'Nouveau grade', type: 'text', obligatoire: true },
      { nom: 'nouvel_indice', label: 'Nouvel indice', type: 'number', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['arrete_reclassement.pdf', 'diplomes.pdf', 'ancien_arrete.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 25
  },
  '15': {
    code: '15',
    libelle: 'Reclassement d\'un EFA ou d\'un ELD',
    categorie: 'MODIFICATION',
    description: 'Reclassement d\'élève fonctionnaire (Avenant)',
    champs: [
      { nom: 'type_eleve', label: "Type d'élève", type: 'select', options: ['EFA', 'ELD'], obligatoire: true },
      { nom: 'motif_reclassement', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'nouvelle_option', label: 'Nouvelle option', type: 'text', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['avenant.pdf', 'diplomes.pdf', 'certificat_scolarite.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FOP'],
    delaiTraitement: 20
  },
  '16': {
    code: '16',
    libelle: 'Majoration de Salaire d\'un ELD',
    categorie: 'MODIFICATION',
    description: 'Augmentation de salaire pour un ELD',
    champs: [
      { nom: 'salaire_actuel', label: 'Salaire actuel', type: 'number', obligatoire: true },
      { nom: 'salaire_nouveau', label: 'Nouveau salaire', type: 'number', obligatoire: true },
      { nom: 'motif_majoration', label: 'Motif de la majoration', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'indice', label: 'Indice', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['demande_majoration.pdf', 'justificatif_anciennete.pdf'],
    rolesApprobateurs: ['DREN', 'FINANCE'],
    delaiTraitement: 15
  },
  '17': {
    code: '17',
    libelle: 'Renouvellement de Contrat ou de Décision d\'engagement',
    categorie: 'MODIFICATION',
    description: 'Prolongation de contrat d\'engagement',
    champs: [
      { nom: 'date_fin_contrat', label: 'Date fin contrat actuel', type: 'date', obligatoire: true },
      { nom: 'duree_renouvellement', label: 'Durée du renouvellement (mois)', type: 'number', obligatoire: true },
      { nom: 'nouvelle_date_fin', label: 'Nouvelle date de fin', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'evaluation', label: 'Évaluation', type: 'select', options: ['Positive', 'Moyenne', 'Négative'], obligatoire: true }
    ],
    documentsRequis: ['contrat_actuel.pdf', 'demande_renouvellement.pdf', 'evaluation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '18': {
    code: '18',
    libelle: 'Bonification d\'Ancienneté',
    categorie: 'MODIFICATION',
    description: 'Ajout d\'années d\'ancienneté',
    champs: [
      { nom: 'anciennete_actuelle', label: 'Ancienneté actuelle (ans)', type: 'number', obligatoire: true },
      { nom: 'bonification', label: 'Bonification (ans)', type: 'number', obligatoire: true },
      { nom: 'nouvelle_anciennete', label: 'Nouvelle ancienneté', type: 'number', readOnly: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['demande_bonification.pdf', 'justificatifs_services.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 20
  },
  '19': {
    code: '19',
    libelle: 'Indemnité Compensatrice de congé non pris',
    categorie: 'MODIFICATION',
    description: 'Indemnisation des congés non utilisés',
    champs: [
      { nom: 'jours_conge_non_pris', label: 'Jours de congé non pris', type: 'number', obligatoire: true },
      { nom: 'salaire_journalier', label: 'Salaire journalier', type: 'number', obligatoire: true },
      { nom: 'montant_indemnite', label: "Montant de l'indemnité", type: 'number', readOnly: true },
      { nom: 'periode', label: 'Période concernée', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea' }
    ],
    documentsRequis: ['demande_indemnite.pdf', 'releve_conges.pdf'],
    rolesApprobateurs: ['DREN', 'FINANCE'],
    delaiTraitement: 15,
    indemnites: ['542']
  },

  // III - POSITIONS DIVERSES (20-29)
  '20': {
    code: '20',
    libelle: 'Affectation',
    categorie: 'POSITION',
    description: 'Changement de localité d\'un fonctionnaire',
    champs: [
      { nom: 'etablissement_actuel', label: 'Établissement actuel', type: 'text', obligatoire: true },
      { nom: 'etablissement_demande', label: 'Établissement demandé', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_souhaitee', label: 'Date souhaitée', type: 'date', obligatoire: true },
      { nom: 'poste', label: 'Poste', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_affectation.pdf', 'accord_etablissement.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '21': {
    code: '21',
    libelle: 'En Détachement',
    categorie: 'POSITION',
    description: 'Position de détachement auprès d\'une autre administration',
    champs: [
      { nom: 'administration_accueil', label: "Administration d'accueil", type: 'text', obligatoire: true },
      { nom: 'poste_detachement', label: 'Poste en détachement', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_detachement.pdf', 'accord_administration.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '22': {
    code: '22',
    libelle: 'En Disponibilité',
    categorie: 'POSITION',
    description: 'Position de disponibilité (congé sans solde)',
    champs: [
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'type_disponibilite', label: 'Type', type: 'select', options: ['Personnelle', 'Familiale', 'Études', 'Autre'], obligatoire: true }
    ],
    documentsRequis: ['demande_disponibilite.pdf', 'motif.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '23': {
    code: '23',
    libelle: 'Position sous les Drapeaux',
    categorie: 'POSITION',
    description: 'Service militaire ou réserve',
    champs: [
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'unite', label: 'Unité militaire', type: 'text', obligatoire: true },
      { nom: 'grade_militaire', label: 'Grade militaire', type: 'text' }
    ],
    documentsRequis: ['ordre_appel.pdf', 'certificat_militaire.pdf'],
    rolesApprobateurs: ['DREN'],
    delaiTraitement: 10
  },
  '24': {
    code: '24',
    libelle: 'Mis à la Disposition de la FOP',
    categorie: 'POSITION',
    description: 'Mise à disposition de la Formation Professionnelle',
    champs: [
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'poste_fop', label: 'Poste à la FOP', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_mise_disposition.pdf', 'accord_fop.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FOP'],
    delaiTraitement: 20
  },
  '25': {
    code: '25',
    libelle: 'Régularisation d\'une Situation non statuée après 6 mois',
    categorie: 'POSITION',
    description: 'Régularisation après 6 mois sans statut',
    champs: [
      { nom: 'date_debut_situation', label: 'Date début situation', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'solution_proposee', label: 'Solution proposée', type: 'textarea', obligatoire: true },
      { nom: 'statut_demande', label: 'Statut demandé', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['rapport_situation.pdf', 'justificatifs.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '26': {
    code: '26',
    libelle: 'Réintégration après Service Militaire',
    categorie: 'POSITION',
    description: 'Retour après service militaire',
    champs: [
      { nom: 'date_depart', label: 'Date de départ', type: 'date', obligatoire: true },
      { nom: 'date_retour', label: 'Date de retour', type: 'date', obligatoire: true },
      { nom: 'duree_service', label: 'Durée du service (mois)', type: 'number', obligatoire: true },
      { nom: 'poste_origine', label: 'Poste d\'origine', type: 'text', obligatoire: true },
      { nom: 'poste_reintegration', label: 'Poste de réintégration', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_reintegration.pdf', 'certificat_fin_service.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '27': {
    code: '27',
    libelle: 'Réintégration après Disponibilité',
    categorie: 'POSITION',
    description: 'Retour après disponibilité',
    champs: [
      { nom: 'date_debut_dispo', label: 'Date début disponibilité', type: 'date', obligatoire: true },
      { nom: 'date_fin_dispo', label: 'Date fin disponibilité', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'poste_origine', label: 'Poste d\'origine', type: 'text', obligatoire: true },
      { nom: 'poste_reintegration', label: 'Poste de réintégration', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_reintegration.pdf', 'fin_disponibilite.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '28': {
    code: '28',
    libelle: 'Réintégration après Suspension',
    categorie: 'POSITION',
    description: 'Retour après suspension de solde ou de fonction',
    champs: [
      { nom: 'date_debut_suspension', label: 'Date début suspension', type: 'date', obligatoire: true },
      { nom: 'date_fin_suspension', label: 'Date fin suspension', type: 'date', obligatoire: true },
      { nom: 'type_suspension', label: 'Type de suspension', type: 'select', options: ['Solde', 'Fonction', 'Les deux'], obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'poste_reintegration', label: 'Poste de réintégration', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_reintegration.pdf', 'rapport_enquete.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 20
  },
  '29': {
    code: '29',
    libelle: 'Maintien en activité',
    categorie: 'POSITION',
    description: 'Prolongation d\'activité au-delà de la limite d\'âge',
    champs: [
      { nom: 'date_limite_age', label: 'Date limite d\'âge', type: 'date', obligatoire: true },
      { nom: 'duree_maintien', label: 'Durée du maintien (mois)', type: 'number', obligatoire: true },
      { nom: 'nouvelle_date_limite', label: 'Nouvelle date limite', type: 'date', readOnly: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'avis_medical', label: 'Avis médical', type: 'select', options: ['Favorable', 'Défavorable'], obligatoire: true }
    ],
    documentsRequis: ['demande_maintien.pdf', 'avis_medical.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 25
  },

  // IV - SANCTIONS (30-39)
  '30': {
    code: '30',
    libelle: 'Suspension de Solde',
    categorie: 'SANCTION',
    description: 'Suspension temporaire du salaire',
    champs: [
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (jours)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_suspension.pdf', 'rapport_disciplinaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 10
  },
  '31': {
    code: '31',
    libelle: 'Suspension de Fonction',
    categorie: 'SANCTION',
    description: 'Suspension temporaire des fonctions',
    champs: [
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (jours)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_suspension.pdf', 'rapport_disciplinaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 10
  },
  '32': {
    code: '32',
    libelle: 'Révocation avec Droits à pensions',
    categorie: 'SANCTION',
    description: 'Révocation avec conservation des droits à pension',
    champs: [
      { nom: 'date_revocation', label: 'Date de révocation', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true },
      { nom: 'duree_service', label: 'Durée de service (ans)', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['arrete_revocation.pdf', 'rapport_final.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '33': {
    code: '33',
    libelle: 'Révocation sans Droits à pensions',
    categorie: 'SANCTION',
    description: 'Révocation sans conservation des droits à pension',
    champs: [
      { nom: 'date_revocation', label: 'Date de révocation', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['arrete_revocation.pdf', 'rapport_final.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '34': {
    code: '34',
    libelle: 'Résiliation de Contrat/Décision d\'engagement',
    categorie: 'SANCTION',
    description: 'Rupture de contrat d\'engagement',
    champs: [
      { nom: 'date_resiliation', label: 'Date de résiliation', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_contrat', label: 'Référence contrat', type: 'text', obligatoire: true },
      { nom: 'preavis', label: 'Préavis (jours)', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['decision_resiliation.pdf', 'motif_resiliation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '35': {
    code: '35',
    libelle: 'Réduction d\'Ancienneté',
    categorie: 'SANCTION',
    description: 'Diminution de l\'ancienneté',
    champs: [
      { nom: 'anciennete_actuelle', label: 'Ancienneté actuelle (ans)', type: 'number', obligatoire: true },
      { nom: 'reduction', label: 'Réduction (ans)', type: 'number', obligatoire: true },
      { nom: 'nouvelle_anciennete', label: 'Nouvelle ancienneté', type: 'number', readOnly: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['decision_reduction.pdf', 'rapport_disciplinaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '36': {
    code: '36',
    libelle: 'Abaissement d\'Echelon',
    categorie: 'SANCTION',
    description: 'Descente à un échelon inférieur',
    champs: [
      { nom: 'echelon_actuel', label: 'Échelon actuel', type: 'number', obligatoire: true },
      { nom: 'nouvel_echelon', label: 'Nouvel échelon', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['decision_abaissement.pdf', 'rapport_disciplinaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '37': {
    code: '37',
    libelle: 'Rétrogradation',
    categorie: 'SANCTION',
    description: 'Descente à un grade inférieur',
    champs: [
      { nom: 'grade_actuel', label: 'Grade actuel', type: 'text', obligatoire: true },
      { nom: 'nouveau_grade', label: 'Nouveau grade', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['decision_retrogradation.pdf', 'rapport_disciplinaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '38': {
    code: '38',
    libelle: 'Redoublement de Stage',
    categorie: 'SANCTION',
    description: 'Répétition d\'une période de stage',
    champs: [
      { nom: 'stage_original', label: 'Stage concerné', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date début redoublement', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date fin redoublement', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['decision_redoublement.pdf', 'rapport_stage.pdf'],
    rolesApprobateurs: ['DREN', 'FOP'],
    delaiTraitement: 10
  },
  '39': {
    code: '39',
    libelle: 'Redoublement d\'Echelon ou de Classe',
    categorie: 'SANCTION',
    description: 'Répétition d\'un échelon ou d\'une classe',
    champs: [
      { nom: 'type_redoublement', label: 'Type', type: 'select', options: ['Échelon', 'Classe'], obligatoire: true },
      { nom: 'niveau_actuel', label: 'Niveau actuel', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date fin', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['decision_redoublement.pdf', 'rapport_evaluation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 10
  },

  // V - ANNULATION (40-49)
  '40': {
    code: '40',
    libelle: 'Décès',
    categorie: 'ANNULATION',
    description: 'Annulation suite au décès de l\'agent',
    champs: [
      { nom: 'date_deces', label: 'Date du décès', type: 'date', obligatoire: true },
      { nom: 'lieu_deces', label: 'Lieu du décès', type: 'text', obligatoire: true },
      { nom: 'numero_acte', label: 'N° acte de décès', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['acte_deces.pdf', 'certificat_deces.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 5
  },
  '41': {
    code: '41',
    libelle: 'Démission',
    categorie: 'ANNULATION',
    description: 'Annulation suite à démission',
    champs: [
      { nom: 'date_demission', label: 'Date de démission', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'preavis', label: 'Préavis effectué (jours)', type: 'number', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['lettre_demission.pdf', 'accusé_reception.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '42': {
    code: '42',
    libelle: 'En Retraite pour Limite d\'âge',
    categorie: 'ANNULATION',
    description: 'Départ à la retraite par limite d\'âge',
    champs: [
      { nom: 'date_naissance', label: 'Date de naissance', type: 'date', obligatoire: true },
      { nom: 'date_limite', label: 'Date limite d\'âge', type: 'date', obligatoire: true },
      { nom: 'date_depart', label: 'Date de départ', type: 'date', obligatoire: true },
      { nom: 'duree_service', label: 'Durée de service (ans)', type: 'number', obligatoire: true },
      { nom: 'dernier_grade', label: 'Dernier grade', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_retraite.pdf', 'acte_naissance.pdf', 'releve_carriere.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '43': {
    code: '43',
    libelle: 'En Retraite proportionnelle',
    categorie: 'ANNULATION',
    description: 'Départ à la retraite proportionnelle',
    champs: [
      { nom: 'date_naissance', label: 'Date de naissance', type: 'date', obligatoire: true },
      { nom: 'date_entree', label: "Date d'entrée en fonction", type: 'date', obligatoire: true },
      { nom: 'duree_service', label: 'Durée de service (ans)', type: 'number', obligatoire: true },
      { nom: 'date_depart', label: 'Date de départ', type: 'date', obligatoire: true },
      { nom: 'dernier_salaire', label: 'Dernier salaire', type: 'number', obligatoire: true }
    ],
    documentsRequis: ['demande_retraite.pdf', 'releve_carriere.pdf'],
    rolesApprobateurs: ['DREN', 'MEN', 'FINANCE'],
    delaiTraitement: 30
  },
  '44': {
    code: '44',
    libelle: 'En Retraite d\'office',
    categorie: 'ANNULATION',
    description: 'Mise à la retraite d\'office',
    champs: [
      { nom: 'date_decision', label: 'Date de la décision', type: 'date', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_arrete', label: 'Référence arrêté', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['arrete_retraite.pdf', 'notification.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 15
  },
  '45': {
    code: '45',
    libelle: 'En Position Hors Cadre',
    categorie: 'ANNULATION',
    description: 'Passage en position hors cadre',
    champs: [
      { nom: 'administration_accueil', label: "Administration d'accueil", type: 'text', obligatoire: true },
      { nom: 'poste_occupe', label: 'Poste occupé', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_hors_cadre.pdf', 'accord_administration.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '46': {
    code: '46',
    libelle: 'Abrogation des Hauts Emplois pour non Fonctionnaires',
    categorie: 'ANNULATION',
    description: 'Suppression d\'un poste HEE pour non-fonctionnaire',
    champs: [
      { nom: 'poste_abroge', label: 'Poste abrogé', type: 'text', obligatoire: true },
      { nom: 'date_abrogation', label: "Date d'abrogation", type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_abrogation.pdf', 'notification.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 15
  },
  '47': {
    code: '47',
    libelle: 'Opposition crédit',
    categorie: 'ANNULATION',
    description: 'Opposition sur le crédit (saisie, etc.)',
    champs: [
      { nom: 'montant_opposition', label: "Montant de l'opposition", type: 'number', obligatoire: true },
      { nom: 'date_opposition', label: "Date de l'opposition", type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_juridique', label: 'Référence juridique', type: 'text', obligatoire: true },
      { nom: 'beneficiaire', label: 'Bénéficiaire', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_opposition.pdf', 'document_juridique.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 5
  },
  '48': {
    code: '48',
    libelle: 'Annulation code rubrique',
    categorie: 'ANNULATION',
    description: 'Annulation de code rubrique (permanentes - doublons)',
    champs: [
      { nom: 'code_rubrique', label: 'Code rubrique', type: 'text', obligatoire: true },
      { nom: 'libelle_rubrique', label: 'Libellé rubrique', type: 'text', obligatoire: true },
      { nom: 'motif_annulation', label: "Motif d'annulation", type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['demande_annulation.pdf', 'justificatif.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 10
  },
  '49': {
    code: '49',
    libelle: 'Abrogation des HEE Fonctionnaires',
    categorie: 'ANNULATION',
    description: 'Suppression d\'un poste HEE pour fonctionnaire',
    champs: [
      { nom: 'poste_abroge', label: 'Poste abrogé', type: 'text', obligatoire: true },
      { nom: 'nom_fonctionnaire', label: 'Nom du fonctionnaire', type: 'text', obligatoire: true },
      { nom: 'date_abrogation', label: "Date d'abrogation", type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reaffectation', label: 'Réaffectation', type: 'text' }
    ],
    documentsRequis: ['decision_abrogation.pdf', 'notification.pdf'],
    rolesApprobateurs: ['MEN', 'FINANCE'],
    delaiTraitement: 15
  },

  // VI - REGULARISATION MODIFICATION DE SITUATION (60-76)
  '60': {
    code: '60',
    libelle: 'Allocations familiales',
    categorie: 'REGULARISATION',
    description: 'Attribution ou modification d\'allocations familiales',
    champs: [
      { nom: 'nombre_enfants', label: "Nombre d'enfants", type: 'number', obligatoire: true },
      { nom: 'montant_allocation', label: "Montant de l'allocation", type: 'number', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'conjoint_travaille', label: 'Conjoint travaille', type: 'checkbox' }
    ],
    documentsRequis: ['demande_allocations.pdf', 'actes_naissance_enfants.pdf'],
    rolesApprobateurs: ['DREN', 'FINANCE'],
    delaiTraitement: 15
  },
  '61': {
    code: '61',
    libelle: 'Diverses Indemnités',
    categorie: 'REGULARISATION',
    description: 'Indemnités annuelles ou non permanentes',
    champs: [
      { nom: 'type_indemnite', label: "Type d'indemnité", type: 'select', options: ['542', '543', 'Autre'], obligatoire: true },
      { nom: 'montant', label: 'Montant', type: 'number', obligatoire: true },
      { nom: 'periode', label: 'Période', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_indemnites.pdf', 'justificatifs.pdf'],
    rolesApprobateurs: ['DREN', 'FINANCE'],
    delaiTraitement: 15,
    indemnites: ['542', '543']
  },
  '62': {
    code: '62',
    libelle: 'Diverses Retenues',
    categorie: 'REGULARISATION',
    description: 'Retenues non permanentes',
    champs: [
      { nom: 'type_retenue', label: 'Type de retenue', type: 'text', obligatoire: true },
      { nom: 'montant', label: 'Montant', type: 'number', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date' },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['decision_retenue.pdf', 'justificatif.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 10
  },
  '63': {
    code: '63',
    libelle: 'Avance sur solde et Rappel de solde',
    categorie: 'REGULARISATION',
    description: 'Avance ou rappel de salaire',
    champs: [
      { nom: 'type_operation', label: "Type d'opération", type: 'select', options: ['Avance', 'Rappel'], obligatoire: true },
      { nom: 'montant', label: 'Montant', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_operation', label: "Date de l'opération", type: 'date', obligatoire: true },
      { nom: 'echeancier', label: "Échéancier de remboursement", type: 'text' }
    ],
    documentsRequis: ['demande_avance.pdf', 'justificatif_besoin.pdf'],
    rolesApprobateurs: ['DREN', 'FINANCE'],
    delaiTraitement: 10
  },
  '64': {
    code: '64',
    libelle: 'Rappel différentiel trop perçu (indice)',
    categorie: 'REGULARISATION',
    description: 'Régularisation d\'un trop-perçu sur indice',
    champs: [
      { nom: 'indice_actuel', label: 'Indice actuel', type: 'number', obligatoire: true },
      { nom: 'indice_utilise', label: 'Indice utilisé', type: 'number', obligatoire: true },
      { nom: 'difference', label: 'Différence', type: 'number', readOnly: true },
      { nom: 'montant_trop_percu', label: 'Montant trop-perçu', type: 'number', obligatoire: true },
      { nom: 'periode', label: 'Période concernée', type: 'text', obligatoire: true },
      { nom: 'modalite_remboursement', label: 'Modalité de remboursement', type: 'textarea' }
    ],
    documentsRequis: ['calcul_trop_percu.pdf', 'decision_regularisation.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 15
  },
  '65': {
    code: '65',
    libelle: 'Opposition Pension alimentaire',
    categorie: 'REGULARISATION',
    description: 'Opposition sur pension alimentaire',
    champs: [
      { nom: 'montant_opposition', label: "Montant de l'opposition", type: 'number', obligatoire: true },
      { nom: 'date_opposition', label: "Date de l'opposition", type: 'date', obligatoire: true },
      { nom: 'beneficiaire', label: 'Bénéficiaire', type: 'text', obligatoire: true },
      { nom: 'reference_jugement', label: 'Référence du jugement', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_justice.pdf', 'notification.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 5
  },
  '66': {
    code: '66',
    libelle: 'Reversement trop perçu',
    categorie: 'REGULARISATION',
    description: 'Remboursement de solde indûment perçu',
    champs: [
      { nom: 'montant', label: 'Montant à reverser', type: 'number', obligatoire: true },
      { nom: 'periode', label: 'Période concernée', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'modalite', label: 'Modalité de reversement', type: 'select', options: ['Une fois', 'Mensuel'], obligatoire: true },
      { nom: 'nombre_mensualites', label: 'Nombre de mensualités', type: 'number' }
    ],
    documentsRequis: ['calcul_reversement.pdf', 'accord_reversement.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 15
  },
  '67': {
    code: '67',
    libelle: 'Régularisation Indemnités moins perçues',
    categorie: 'REGULARISATION',
    description: 'Remboursement d\'indemnités non perçues',
    champs: [
      { nom: 'type_indemnite', label: "Type d'indemnité", type: 'text', obligatoire: true },
      { nom: 'montant_du', label: 'Montant dû', type: 'number', obligatoire: true },
      { nom: 'montant_percu', label: 'Montant perçu', type: 'number', obligatoire: true },
      { nom: 'difference', label: 'Différence', type: 'number', readOnly: true },
      { nom: 'periode', label: 'Période', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['calcul_indemnites.pdf', 'decision_regularisation.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 15
  },
  '68': {
    code: '68',
    libelle: 'Rappel différentiel moins perçu (indice)',
    categorie: 'REGULARISATION',
    description: 'Régularisation d\'un moins-perçu sur indice',
    champs: [
      { nom: 'indice_actuel', label: 'Indice actuel', type: 'number', obligatoire: true },
      { nom: 'indice_applique', label: 'Indice appliqué', type: 'number', obligatoire: true },
      { nom: 'difference', label: 'Différence', type: 'number', readOnly: true },
      { nom: 'montant_moins_percu', label: 'Montant moins-perçu', type: 'number', obligatoire: true },
      { nom: 'periode', label: 'Période concernée', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['calcul_moins_percu.pdf', 'decision_regularisation.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 15
  },
  '69': {
    code: '69',
    libelle: 'Changement mode de paiement',
    categorie: 'REGULARISATION',
    description: 'Modification du mode de paiement',
    champs: [
      { nom: 'mode_paiement_actuel', label: 'Mode de paiement actuel', type: 'text', obligatoire: true },
      { nom: 'nouveau_mode', label: 'Nouveau mode', type: 'select', options: ['Virement', 'Chèque', 'Espèces'], obligatoire: true },
      { nom: 'rib', label: 'RIB (si virement)', type: 'text' },
      { nom: 'banque', label: 'Banque', type: 'text' },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['demande_changement.pdf', 'rib.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 5
  },
  '70': {
    code: '70',
    libelle: 'Création code rubrique',
    categorie: 'REGULARISATION',
    description: 'Création d\'un code rubrique permanent jamais perçu',
    champs: [
      { nom: 'code', label: 'Code rubrique', type: 'text', obligatoire: true },
      { nom: 'libelle', label: 'Libellé', type: 'text', obligatoire: true },
      { nom: 'description', label: 'Description', type: 'textarea', obligatoire: true },
      { nom: 'type', label: 'Type', type: 'select', options: ['Indemnité', 'Prime', 'Allocation'], obligatoire: true },
      { nom: 'montant', label: 'Montant', type: 'number' },
      { nom: 'periodicite', label: 'Périodicité', type: 'select', options: ['Mensuel', 'Trimestriel', 'Annuel'] }
    ],
    documentsRequis: ['demande_creation.pdf', 'justificatif.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 10
  },
  '71': {
    code: '71',
    libelle: 'Modification code rubrique',
    categorie: 'REGULARISATION',
    description: 'Modification d\'un code rubrique permanent',
    champs: [
      { nom: 'code', label: 'Code rubrique', type: 'text', obligatoire: true },
      { nom: 'nouveau_libelle', label: 'Nouveau libellé', type: 'text' },
      { nom: 'nouveau_montant', label: 'Nouveau montant', type: 'number' },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['demande_modification.pdf', 'justificatif.pdf'],
    rolesApprobateurs: ['FINANCE'],
    delaiTraitement: 10
  },
  '72': {
    code: '72',
    libelle: 'Attribution numéro matricule d\'un élève fonctionnaire',
    categorie: 'REGULARISATION',
    description: 'Attribution d\'un numéro matricule',
    champs: [
      { nom: 'nom', label: 'Nom', type: 'text', obligatoire: true },
      { nom: 'prenom', label: 'Prénom', type: 'text', obligatoire: true },
      { nom: 'date_naissance', label: 'Date de naissance', type: 'date', obligatoire: true },
      { nom: 'lieu_naissance', label: 'Lieu de naissance', type: 'text', obligatoire: true },
      { nom: 'etablissement', label: 'Établissement', type: 'text', obligatoire: true },
      { nom: 'promotion', label: 'Promotion', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_matricule.pdf', 'acte_naissance.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 10
  },
  '73': {
    code: '73',
    libelle: 'Affectation à l\'extérieur',
    categorie: 'REGULARISATION',
    description: 'Affectation hors de la fonction publique',
    champs: [
      { nom: 'organisme_accueil', label: "Organisme d'accueil", type: 'text', obligatoire: true },
      { nom: 'poste', label: 'Poste', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['demande_affectation.pdf', 'accord_exterieur.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '74': {
    code: '74',
    libelle: 'Diverses modifications',
    categorie: 'REGULARISATION',
    description: 'Modifications diverses (Matricule, Nom, etc.)',
    champs: [
      { nom: 'type_modification', label: 'Type de modification', type: 'select', 
        options: ['Nom', 'Prénom', 'Matricule', 'Adresse', 'Situation familiale'], obligatoire: true },
      { nom: 'ancienne_valeur', label: 'Ancienne valeur', type: 'text', obligatoire: true },
      { nom: 'nouvelle_valeur', label: 'Nouvelle valeur', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true }
    ],
    documentsRequis: ['demande_modification.pdf', 'justificatif_changement.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '75': {
    code: '75',
    libelle: 'Déclassement',
    categorie: 'REGULARISATION',
    description: 'Descente de catégorie ou de classe',
    champs: [
      { nom: 'categorie_actuelle', label: 'Catégorie actuelle', type: 'text', obligatoire: true },
      { nom: 'nouvelle_categorie', label: 'Nouvelle catégorie', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'date_effet', label: "Date d'effet", type: 'date', obligatoire: true },
      { nom: 'consequences', label: 'Conséquences', type: 'textarea' }
    ],
    documentsRequis: ['decision_declassement.pdf', 'rapport.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '76': {
    code: '76',
    libelle: 'Validation de service',
    categorie: 'REGULARISATION',
    description: 'Validation de services antérieurs',
    champs: [
      { nom: 'type_service', label: 'Type de service', type: 'text', obligatoire: true },
      { nom: 'organisme', label: 'Organisme', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (ans)', type: 'number', obligatoire: true },
      { nom: 'poste_occupe', label: 'Poste occupé', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['demande_validation.pdf', 'justificatifs_services.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },

  // VII - CAS D'EXCLUSION (80-85)
  '80': {
    code: '80',
    libelle: 'Exclusion temporaire',
    categorie: 'EXCLUSION',
    description: 'Exclusion temporaire de la fonction publique',
    champs: [
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date', obligatoire: true },
      { nom: 'duree', label: 'Durée (mois)', type: 'number', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_exclusion.pdf', 'rapport_disciplinaire.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 10
  },
  '81': {
    code: '81',
    libelle: 'Perte de la Nationalité Malagasy',
    categorie: 'EXCLUSION',
    description: 'Perte de la nationalité entraînant l\'exclusion',
    champs: [
      { nom: 'date_perte', label: 'Date de perte', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'nouvelle_nationalite', label: 'Nouvelle nationalité', type: 'text', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true }
    ],
    documentsRequis: ['decision_perte_nationalite.pdf', 'document_officiel.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '82': {
    code: '82',
    libelle: 'Incarcération',
    categorie: 'EXCLUSION',
    description: 'Incarcération de l\'agent',
    champs: [
      { nom: 'date_incarceration', label: "Date d'incarcération", type: 'date', obligatoire: true },
      { nom: 'lieu', label: 'Lieu', type: 'text', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'duree_prevue', label: 'Durée prévue', type: 'text' }
    ],
    documentsRequis: ['decision_incarceration.pdf', 'notification_justice.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 5
  },
  '83': {
    code: '83',
    libelle: 'Inaptitude définitive',
    categorie: 'EXCLUSION',
    description: 'Inaptitude définitive constatée médicalement',
    champs: [
      { nom: 'date_constat', label: 'Date du constat', type: 'date', obligatoire: true },
      { nom: 'nature_inaptitude', label: "Nature de l'inaptitude", type: 'textarea', obligatoire: true },
      { nom: 'avis_medical', label: 'Avis médical', type: 'text', obligatoire: true },
      { nom: 'reclassement_possible', label: 'Reclassement possible', type: 'checkbox' }
    ],
    documentsRequis: ['certificat_medical_definitif.pdf', 'avis_commission.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  },
  '84': {
    code: '84',
    libelle: 'Radiation',
    categorie: 'EXCLUSION',
    description: 'Radiation des effectifs',
    champs: [
      { nom: 'date_radiation', label: 'Date de radiation', type: 'date', obligatoire: true },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true },
      { nom: 'reference_decision', label: 'Référence décision', type: 'text', obligatoire: true },
      { nom: 'droit_pension', label: 'Droit à pension', type: 'checkbox' }
    ],
    documentsRequis: ['decision_radiation.pdf', 'motif_radiation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 15
  },
  '85': {
    code: '85',
    libelle: 'Double Emploi',
    categorie: 'EXCLUSION',
    description: 'Cumul d\'emplois non autorisé',
    champs: [
      { nom: 'autre_employeur', label: 'Autre employeur', type: 'text', obligatoire: true },
      { nom: 'poste_concerne', label: 'Poste concerné', type: 'text', obligatoire: true },
      { nom: 'date_debut', label: 'Date de début', type: 'date', obligatoire: true },
      { nom: 'date_fin', label: 'Date de fin', type: 'date' },
      { nom: 'motif', label: 'Motif', type: 'textarea', obligatoire: true }
    ],
    documentsRequis: ['rapport_enquete.pdf', 'decision_regularisation.pdf'],
    rolesApprobateurs: ['DREN', 'MEN'],
    delaiTraitement: 20
  }
};

export const CATEGORIES = [
  { id: 'CREATION', label: 'I - CAS DE CREATION', codes: ['01','02','03','04','05','06','07','08','09'] },
  { id: 'MODIFICATION', label: 'II - CAS DE MODIFICATION DE SITUATION', codes: ['10','11','12','13','14','15','16','17','18','19'] },
  { id: 'POSITION', label: 'III - POSITIONS DIVERSES', codes: ['20','21','22','23','24','25','26','27','28','29'] },
  { id: 'SANCTION', label: 'IV - SANCTIONS', codes: ['30','31','32','33','34','35','36','37','38','39'] },
  { id: 'ANNULATION', label: 'V - ANNULATION', codes: ['40','41','42','43','44','45','46','47','48','49'] },
  { id: 'REGULARISATION', label: 'VI - REGULARISATION', codes: ['60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76'] },
  { id: 'EXCLUSION', label: 'VII - CAS D\'EXCLUSION', codes: ['80','81','82','83','84','85'] }
];

export const getCodesByCategorie = (categorie: string) => {
  const cat = CATEGORIES.find(c => c.id === categorie);
  if (!cat) return [];
  return cat.codes.map(code => CODES_MOUVEMENT_COMPLET[code]).filter(Boolean);
};

export const getCodeInfo = (code: string) => {
  return CODES_MOUVEMENT_COMPLET[code];
};

export const NOTES_MANUSCRITES = {
  HAUT_EMPLOI_ETAT: {
    FONC: 0,
    NON_FONC: 1,
    FONC_NON_PERMANENT: 'A à J',
    NON_FONC_NON_PERMANENT: 'K à T'
  },
  INDEMNITES: {
    '542': 'Indemnité de Fonction d\'encadrement',
    '543': 'Indemnité de Fonction Spéciale'
  }
};