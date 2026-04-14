import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FolderOpen,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  X,
  Send,
  Check,
  XCircle,
  RefreshCw,
  User,
  Calendar,
  RotateCcw,
  Sparkles,
  Inbox,
  Archive,
  Loader,
  ChevronRight,
  Activity
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import { getCodeInfo } from '../../utils/codesMouvementComplet';
import StatusChip from '../../components/Common/StatusChip';
import toast from 'react-hot-toast';

// ==================== TYPES ====================
interface SectionDossiers {
  id: string;
  titre: string;
  compteur: number;
  dossiers: Dossier[];
  couleur: 'vert-clair' | 'vert-fonce' | 'vert-moyen';
  icone: React.ReactNode;
  description: string;
}

interface StatistiquesCompte {
  total: number;
  aTraiter: number;
  enCours: number;
  termines: number;
  rejetes: number;
  parStatut: {
    brouillon: number;
    enAttenteDREN: number;
    enAttenteMEN: number;
    enAttenteFOP: number;
    enAttenteFinance: number;
    enCours: number;
    termine: number;
    rejete: number;
  };
}

// ==================== COMPOSANT PRINCIPAL ====================
const MesDossiers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // États principaux
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [vueActuelle, setVueActuelle] = useState<'sections' | 'liste'>('sections');
  const [sectionActive, setSectionActive] = useState<string | null>(null);
  const [stats, setStats] = useState<StatistiquesCompte>({
    total: 0,
    aTraiter: 0,
    enCours: 0,
    termines: 0,
    rejetes: 0,
    parStatut: {
      brouillon: 0,
      enAttenteDREN: 0,
      enAttenteMEN: 0,
      enAttenteFOP: 0,
      enAttenteFinance: 0,
      enCours: 0,
      termine: 0,
      rejete: 0
    }
  });

  // Informations utilisateur
  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  const isInteresse = userRole === 'UTILISATEUR' || userEmail?.includes('interesse');
  const isDREN = userRole === 'DREN' || userEmail?.includes('dren');
  const isMEN = userRole === 'MEN' || userEmail?.includes('men');
  const isFOP = userRole === 'FOP' || userEmail?.includes('fop');
  const isFINANCE = userRole === 'FINANCE' || userEmail?.includes('finance');
  const isAdmin = userRole === 'ADMIN' || userEmail?.includes('admin');

  // ==================== FONCTIONS UTILITAIRES ====================
  const aEteRejete = (dossier: Dossier): boolean => {
    return dossier.motif_rejet !== null && 
           dossier.motif_rejet !== undefined && 
           dossier.motif_rejet !== '';
  };

  const peutEnvoyer = (dossier: Dossier): boolean => {
    if (!isInteresse) return false;
    const estRejete = aEteRejete(dossier);
    const estBonEtape = dossier.etape_actuelle === 'INTERESSE';
    const estBonStatut = dossier.statut === 'BROUILLON';
    return estBonEtape && (estBonStatut || estRejete);
  };

  const peutCorriger = (dossier: Dossier): boolean => {
    if (!isInteresse) return false;
    return aEteRejete(dossier) && dossier.etape_actuelle === 'INTERESSE';
  };

  const peutValider = (dossier: Dossier): boolean => {
    if (dossier.statut === 'TERMINE') return false;
    
    if (isDREN && dossier.etape_actuelle === 'DREN') return true;
    if (isMEN && dossier.etape_actuelle === 'MEN') return true;
    if (isFOP && dossier.etape_actuelle === 'FOP') return true;
    if (isFINANCE && dossier.etape_actuelle === 'FINANCE') return true;
    
    return false;
  };

  const peutRejeter = (dossier: Dossier): boolean => {
    return peutValider(dossier);
  };

  const getValidationButtonLabel = (): string => {
    if (isDREN) return 'Valider → MEN';
    if (isMEN) return 'Valider → FOP';
    if (isFOP) return 'Valider → Finance';
    if (isFINANCE) return 'Terminer';
    return 'Valider';
  };

  // ==================== CHARGEMENT DES DONNÉES ====================
  const loadDossiers = async () => {
    setLoading(true);
    try {
      const userDossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      console.log(`📥 ${userDossiers.length} dossiers chargés pour ${userRole}`);
      setDossiers(userDossiers);
      calculerStatistiques(userDossiers);
    } catch (error) {
      console.error('Erreur chargement dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CALCUL DES STATISTIQUES ====================
  const calculerStatistiques = (dossiersList: Dossier[]) => {
    const newStats: StatistiquesCompte = {
      total: dossiersList.length,
      aTraiter: 0,
      enCours: 0,
      termines: 0,
      rejetes: 0,
      parStatut: {
        brouillon: 0,
        enAttenteDREN: 0,
        enAttenteMEN: 0,
        enAttenteFOP: 0,
        enAttenteFinance: 0,
        enCours: 0,
        termine: 0,
        rejete: 0
      }
    };

    dossiersList.forEach(dossier => {
      // Compter par statut
      switch(dossier.statut) {
        case 'BROUILLON':
          newStats.parStatut.brouillon++;
          break;
        case 'EN_ATTENTE_DREN':
          newStats.parStatut.enAttenteDREN++;
          break;
        case 'EN_ATTENTE_MEN':
          newStats.parStatut.enAttenteMEN++;
          break;
        case 'EN_ATTENTE_FOP':
          newStats.parStatut.enAttenteFOP++;
          break;
        case 'EN_ATTENTE_FINANCE':
          newStats.parStatut.enAttenteFinance++;
          break;
        case 'EN_COURS':
          newStats.parStatut.enCours++;
          break;
        case 'TERMINE':
          newStats.parStatut.termine++;
          newStats.termines++;
          break;
      }

      // Compter les rejetés
      if (dossier.motif_rejet) {
        newStats.parStatut.rejete++;
        newStats.rejetes++;
      }
    });

    // Calculer "À traiter" selon le rôle
    if (isInteresse) {
      newStats.aTraiter = newStats.parStatut.brouillon;
      newStats.enCours = dossiersList.filter(d => 
        !d.motif_rejet && 
        d.statut !== 'TERMINE' && 
        d.statut !== 'BROUILLON'
      ).length;
    } else {
      // Pour les validateurs
      newStats.aTraiter = dossiersList.filter(d => {
        if (d.motif_rejet || d.statut === 'TERMINE') return false;
        if (isDREN && d.etape_actuelle === 'DREN') return true;
        if (isMEN && d.etape_actuelle === 'MEN') return true;
        if (isFOP && d.etape_actuelle === 'FOP') return true;
        if (isFINANCE && d.etape_actuelle === 'FINANCE') return true;
        return false;
      }).length;

      newStats.enCours = dossiersList.filter(d => 
        !d.motif_rejet && 
        d.statut !== 'TERMINE' && 
        ((isDREN && d.etape_actuelle !== 'DREN' && d.etapes_validation?.DREN) ||
         (isMEN && d.etape_actuelle !== 'MEN' && d.etapes_validation?.MEN) ||
         (isFOP && d.etape_actuelle !== 'FOP' && d.etapes_validation?.FOP) ||
         (isFINANCE && d.etape_actuelle !== 'FINANCE' && d.etapes_validation?.FINANCE))
      ).length;
    }

    setStats(newStats);
  };

  // ==================== FILTRAGE DES DOSSIERS ====================
  const getDossiersFiltres = (): Dossier[] => {
    let filtered = [...dossiers];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.numero_dossier?.toLowerCase().includes(term) ||
        d.titre?.toLowerCase().includes(term) ||
        d.fonctionnaire_nom?.toLowerCase().includes(term) ||
        d.fonctionnaire_prenom?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (selectedStatut !== 'tous') {
      if (selectedStatut === 'REJETES') {
        filtered = filtered.filter(d => aEteRejete(d));
      } else {
        filtered = filtered.filter(d => d.statut === selectedStatut);
      }
    }

    return filtered;
  };

  // ==================== OBTENIR LES DOSSIERS PAR SECTION ====================
  const getDossiersParSection = (sectionId: string): Dossier[] => {
    const dossiersFiltres = getDossiersFiltres();

    switch(sectionId) {
      case 'total':
        return dossiersFiltres;
      
      case 'aTraiter':
        if (isInteresse) {
          return dossiersFiltres.filter(d => d.statut === 'BROUILLON');
        } else {
          return dossiersFiltres.filter(d => {
            if (d.motif_rejet || d.statut === 'TERMINE') return false;
            if (isDREN && d.etape_actuelle === 'DREN') return true;
            if (isMEN && d.etape_actuelle === 'MEN') return true;
            if (isFOP && d.etape_actuelle === 'FOP') return true;
            if (isFINANCE && d.etape_actuelle === 'FINANCE') return true;
            return false;
          });
        }
      
      case 'enCours':
        if (isInteresse) {
          return dossiersFiltres.filter(d => 
            !d.motif_rejet && 
            d.statut !== 'TERMINE' && 
            d.statut !== 'BROUILLON'
          );
        } else {
          return dossiersFiltres.filter(d => 
            !d.motif_rejet && 
            d.statut !== 'TERMINE' && 
            ((isDREN && d.etape_actuelle !== 'DREN' && d.etapes_validation?.DREN) ||
             (isMEN && d.etape_actuelle !== 'MEN' && d.etapes_validation?.MEN) ||
             (isFOP && d.etape_actuelle !== 'FOP' && d.etapes_validation?.FOP) ||
             (isFINANCE && d.etape_actuelle !== 'FINANCE' && d.etapes_validation?.FINANCE))
          );
        }
      
      case 'termines':
        return dossiersFiltres.filter(d => d.statut === 'TERMINE');
      
      case 'rejetes':
        return dossiersFiltres.filter(d => aEteRejete(d));
      
      default:
        return [];
    }
  };

  // ==================== CONFIGURATION DES SECTIONS ====================
  const getSections = (): SectionDossiers[] => {
    const sectionsCommunes: SectionDossiers[] = [
      {
        id: 'total',
        titre: '📊 Total dossiers',
        compteur: stats.total,
        dossiers: getDossiersParSection('total'),
        couleur: 'vert-fonce',
        icone: <FolderOpen size={24} />,
        description: 'Tous vos dossiers, archives incluses'
      },
      {
        id: 'termines',
        titre: '✅ Terminés',
        compteur: stats.termines,
        dossiers: getDossiersParSection('termines'),
        couleur: 'vert-moyen',
        icone: <CheckCircle size={24} />,
        description: 'Dossiers finalisés par la Finance'
      },
      {
        id: 'rejetes',
        titre: '↩️ Rejetés',
        compteur: stats.rejetes,
        dossiers: getDossiersParSection('rejetes'),
        couleur: 'vert-clair',
        icone: <RotateCcw size={24} />,
        description: 'Dossiers retournés pour correction'
      }
    ];

    if (isInteresse) {
      return [
        ...sectionsCommunes,
        {
          id: 'enCours',
          titre: '⏳ En cours',
          compteur: stats.enCours,
          dossiers: getDossiersParSection('enCours'),
          couleur: 'vert-moyen',
          icone: <Loader size={24} />,
          description: 'Dossiers envoyés en validation'
        }
      ];
    } else {
      return [
        ...sectionsCommunes,
        {
          id: 'aTraiter',
          titre: '📋 À traiter',
          compteur: stats.aTraiter,
          dossiers: getDossiersParSection('aTraiter'),
          couleur: 'vert-moyen',
          icone: <Inbox size={24} />,
          description: 'Dossiers en attente de votre validation'
        },
        {
          id: 'enCours',
          titre: '🔄 En cours',
          compteur: stats.enCours,
          dossiers: getDossiersParSection('enCours'),
          couleur: 'vert-clair',
          icone: <Activity size={24} />,
          description: 'Dossiers que vous avez déjà traités'
        }
      ];
    }
  };

  // ==================== ACTIONS SUR LES DOSSIERS ====================
  const handleCorriger = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dossiers/${dossierId}?mode=correction`);
  };

  const handleEnvoyer = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dossier = dossiers.find(d => d.id === dossierId);
    const message = dossier?.motif_rejet 
      ? 'Confirmer le renvoi du dossier corrigé ?'
      : 'Confirmer l\'envoi du dossier à la DREN ?';
    
    if (!window.confirm(message)) return;
    
    setActionInProgress(dossierId);
    try {
      const dossier = await dossierService.envoyerDossier(dossierId, userEmail);
      if (dossier) {
        toast.success('✅ Dossier envoyé avec succès !');
        await loadDossiers();
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleValider = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const message = isFINANCE 
      ? 'Confirmer la finalisation du dossier ?' 
      : 'Confirmer la validation ?';
    
    if (!window.confirm(message)) return;
    
    setActionInProgress(dossierId);
    try {
      const dossier = await dossierService.validerEtape(dossierId, userRole);
      if (dossier) {
        toast.success('✅ Validation réussie !');
        await loadDossiers();
      }
    } catch (error) {
      console.error('Erreur validation:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejeter = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const motif = window.prompt('Motif du rejet :');
    if (!motif) return;
    
    setActionInProgress(dossierId);
    try {
      const dossier = await dossierService.rejeterDossier(dossierId, userRole, motif);
      if (dossier) {
        toast.success('❌ Dossier rejeté');
        await loadDossiers();
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  // ==================== RENDU D'UN DOSSIER ====================
  const renderDossier = (dossier: Dossier) => {
    const codeInfo = getCodeInfo(dossier.code_mouvement || '');
    const estRejete = aEteRejete(dossier);
    
    return (
      <div
        key={dossier.id}
        className={`bg-white rounded-xl shadow-soft p-4 hover:shadow-elevated transition-all cursor-pointer border ${
          estRejete ? 'border-l-4 border-l-green-500' : 'border-neutral-100'
        }`}
        onClick={() => navigate(`/dossiers/${dossier.id}`)}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                {dossier.numero_dossier}
              </span>
              <StatusChip status={dossier.statut} size="sm" />
              {estRejete && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                  <RotateCcw size={12} />
                  Rejeté
                </span>
              )}
              {codeInfo && (
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-lg">
                  {codeInfo.code}
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-neutral-900 text-base mb-1">{dossier.titre}</h3>
            
            <div className="flex items-center gap-3 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <User size={12} className="text-green-500" />
                {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-green-500" />
                {new Date(dossier.date_depot).toLocaleDateString('fr-FR')}
              </span>
            </div>

            {estRejete && dossier.motif_rejet && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                <span className="font-medium">Motif :</span> {dossier.motif_rejet}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {peutCorriger(dossier) && (
              <button
                onClick={(e) => handleCorriger(dossier.id, e)}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:scale-105 transition-transform"
              >
                <FileText size={14} />
                <span>Corriger</span>
              </button>
            )}

            {peutEnvoyer(dossier) && (
              <button
                onClick={(e) => handleEnvoyer(dossier.id, e)}
                disabled={actionInProgress === dossier.id}
                className={`bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:scale-105 transition-transform ${
                  actionInProgress === dossier.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {actionInProgress === dossier.id ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{estRejete ? 'Renvoyer' : 'Envoyer'}</span>
                  </>
                )}
              </button>
            )}

            {peutValider(dossier) && (
              <>
                <button
                  onClick={(e) => handleValider(dossier.id, e)}
                  disabled={actionInProgress === dossier.id}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  {actionInProgress === dossier.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{getValidationButtonLabel()}</span>
                    </>
                  )}
                </button>

                {peutRejeter(dossier) && (
                  <button
                    onClick={(e) => handleRejeter(dossier.id, e)}
                    disabled={actionInProgress === dossier.id}
                    className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:scale-105 transition-transform"
                  >
                    <XCircle size={14} />
                    <span>Rejeter</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => navigate(`/dossiers/${dossier.id}`)}
              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
              title="Voir les détails"
            >
              <Eye size={16} className="text-neutral-400 hover:text-green-600" />
            </button>
          </div>
        </div>

        {dossier.documents && dossier.documents.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-green-500" />
              <span className="text-xs text-neutral-600">
                {dossier.documents.length} document(s) joint(s)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== RENDU D'UNE SECTION ====================
  const renderSection = (section: SectionDossiers) => {
    const gradientColors = {
      'vert-fonce': 'from-green-700 to-green-600',
      'vert-moyen': 'from-green-600 to-green-500',
      'vert-clair': 'from-green-500 to-green-400'
    };

    const bgColors = {
      'vert-fonce': 'bg-green-100',
      'vert-moyen': 'bg-green-50',
      'vert-clair': 'bg-green-25'
    };

    const dossiersSection = section.dossiers.slice(0, 5);

    return (
      <div key={section.id} className="bg-white rounded-xl shadow-soft border border-neutral-100 overflow-hidden hover:shadow-elevated transition-all">
        {/* En-tête de section */}
        <div className={`p-4 ${bgColors[section.couleur]} border-b border-neutral-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradientColors[section.couleur]} flex items-center justify-center text-white shadow-md`}>
                {section.icone}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{section.titre}</h3>
                <p className="text-xs text-neutral-600 mt-0.5">{section.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-neutral-900">{section.compteur}</span>
              <p className="text-xs text-neutral-500">dossiers</p>
            </div>
          </div>
        </div>

        {/* Liste des dossiers */}
        <div className="divide-y divide-neutral-100">
          {dossiersSection.length > 0 ? (
            dossiersSection.map(dossier => renderDossier(dossier))
          ) : (
            <div className="p-6 text-center text-neutral-500">
              <FileText size={32} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">Aucun dossier dans cette section</p>
            </div>
          )}
        </div>

        {/* Pied de section */}
        {section.dossiers.length > 5 && (
          <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-center">
            <button
              onClick={() => {
                setVueActuelle('liste');
                setSectionActive(section.id);
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-1"
            >
              Voir tous les {section.compteur} dossiers
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ==================== RENDU DE LA LISTE COMPLÈTE ====================
  const renderListeComplete = () => {
    const sections = getSections();
    const sectionCourante = sections.find(s => s.id === sectionActive);
    const dossiersAffiches = sectionCourante ? sectionCourante.dossiers : getDossiersFiltres();

    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setVueActuelle('sections');
            setSectionActive(null);
          }}
          className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium mb-2"
        >
          ← Retour aux sections
        </button>

        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <h2 className="font-semibold text-lg text-neutral-900 mb-4">
            {sectionCourante ? sectionCourante.titre : 'Tous les dossiers'}
            <span className="ml-2 text-sm font-normal text-neutral-500">
              ({dossiersAffiches.length} dossier{dossiersAffiches.length > 1 ? 's' : ''})
            </span>
          </h2>

          <div className="space-y-3">
            {dossiersAffiches.length > 0 ? (
              dossiersAffiches.map(dossier => renderDossier(dossier))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <FileText size={48} className="mx-auto mb-2 text-neutral-300" />
                <p>Aucun dossier dans cette section</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==================== CHARGEMENT INITIAL ====================
  useEffect(() => {
    loadDossiers();
  }, [userEmail, userRole]);

  // ==================== RENDU PRINCIPAL ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Mes dossiers
          </h1>
          <p className="text-neutral-600 mt-1 flex items-center gap-2">
            <Sparkles size={16} className="text-green-500" />
            {isInteresse && 'Gérez et suivez toutes vos demandes'}
            {isDREN && 'Direction Régionale - Archive complète des dossiers'}
            {isMEN && 'Ministère - Archive complète des dossiers'}
            {isFOP && 'Formation Professionnelle - Archive complète des dossiers'}
            {isFINANCE && 'Direction des Finances - Archive complète des dossiers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isInteresse && (
            <button
              onClick={() => navigate('/dossiers/creer')}
              className="btn-primary flex items-center gap-2 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              Nouveau dossier
            </button>
          )}
          <button
            onClick={loadDossiers}
            className="btn-secondary p-2.5"
            title="Actualiser"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par n°, titre, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-green-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 px-4 py-2"
          >
            <Filter size={18} />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 animate-slide-down">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="tous">Tous les statuts</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="EN_ATTENTE_DREN">En attente DREN</option>
                <option value="EN_ATTENTE_MEN">En attente MEN</option>
                <option value="EN_ATTENTE_FOP">En attente FOP</option>
                <option value="EN_ATTENTE_FINANCE">En attente Finance</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="REJETES">Rejetés</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      {vueActuelle === 'sections' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getSections().map(section => renderSection(section))}
        </div>
      ) : (
        renderListeComplete()
      )}
    </div>
  );
};

export default MesDossiers;