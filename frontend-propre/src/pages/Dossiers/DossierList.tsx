import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FolderOpen,
  CheckCircle,
  AlertTriangle,
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
  AlertOctagon,
  Loader
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import { getCodeInfo } from '../../utils/codesMouvementComplet';
import StatusChip from '../../components/Common/StatusChip';
import SectionDossiers from '../../components/Dossiers/SectionDossiers';
import toast from 'react-hot-toast';

const STATUTS = {
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

const ETAPES = {
  INTERESSE: 'INTERESSE',
  DREN: 'DREN',
  MEN: 'MEN',
  FOP: 'FOP',
  FINANCE: 'FINANCE',
  TERMINE: 'TERMINE',
  REJETE: 'REJETE',
} as const;

const DossiersList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionFilter = searchParams.get('section');
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [dossiersFiltres, setDossiersFiltres] = useState<{
    total: Dossier[];
    aTraiter: Dossier[];
    enCours: Dossier[];
    termines: Dossier[];
    rejetes: Dossier[];
  }>({
    total: [],
    aTraiter: [],
    enCours: [],
    termines: [],
    rejetes: []
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(sectionFilter || 'total');

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  const isInteresse = userRole === 'UTILISATEUR' || userEmail?.includes('interesse');
  const isDREN = userRole === 'DREN' || userEmail?.includes('dren');
  const isMEN = userRole === 'MEN' || userEmail?.includes('men');
  const isFOP = userRole === 'FOP' || userEmail?.includes('fop');
  const isFINANCE = userRole === 'FINANCE' || userEmail?.includes('finance');
  const isAdmin = userRole === 'ADMIN' || userEmail?.includes('admin');

  const aEteRejete = (dossier: Dossier): boolean => {
    return dossier.motif_rejet !== null && 
           dossier.motif_rejet !== undefined && 
           dossier.motif_rejet !== '';
  };

  const peutEnvoyer = (dossier: Dossier): boolean => {
    if (!isInteresse) return false;
    const estRejete = aEteRejete(dossier);
    const estBonEtape = dossier.etape_actuelle === ETAPES.INTERESSE;
    const estBonStatut = dossier.statut === STATUTS.BROUILLON;
    return estBonEtape && (estBonStatut || estRejete);
  };

  const peutCorriger = (dossier: Dossier): boolean => {
    if (!isInteresse) return false;
    return aEteRejete(dossier) && dossier.etape_actuelle === ETAPES.INTERESSE;
  };

  const peutValider = (dossier: Dossier): boolean => {
    if (dossier.statut === STATUTS.TERMINE) return false;
    
    if (isDREN && dossier.etape_actuelle === ETAPES.DREN) return true;
    if (isMEN && dossier.etape_actuelle === ETAPES.MEN) return true;
    if (isFOP && dossier.etape_actuelle === ETAPES.FOP) return true;
    if (isFINANCE && dossier.etape_actuelle === ETAPES.FINANCE) return true;
    
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

  const handleCorriger = async (dossierId: string) => {
    navigate(`/dossiers/${dossierId}?mode=correction`);
  };

  const handleEnvoyer = async (dossierId: string) => {
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

  const handleValider = async (dossierId: string) => {
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

  const handleRejeter = async (dossierId: string) => {
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

  const loadDossiers = async () => {
    setLoading(true);
    try {
      const userDossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      console.log(`📥 ${userDossiers.length} dossiers chargés pour ${userRole}`);
      
      setDossiers(userDossiers);
      
      // Filtrer selon le rôle
      if (isInteresse) {
        const filtres = dossierService.getDossiersPourInteresse(userDossiers, userEmail);
        setDossiersFiltres({
          total: filtres.total,
          aTraiter: filtres.enCours, // Pour intéressé, "à traiter" = brouillons
          enCours: filtres.enCours,
          termines: filtres.termines,
          rejetes: filtres.rejetes
        });
      } else {
        const filtres = dossierService.getDossiersPourValidateur(userDossiers, userRole, userEmail);
        setDossiersFiltres({
          total: filtres.total,
          aTraiter: filtres.aTraiter,
          enCours: filtres.enCours,
          termines: filtres.termines,
          rejetes: filtres.rejetes
        });
      }
      
    } catch (error) {
      console.error('Erreur chargement dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  const filterDossiersBySearch = (dossiersList: Dossier[]): Dossier[] => {
    if (!searchTerm) return dossiersList;
    
    const term = searchTerm.toLowerCase();
    return dossiersList.filter(d =>
      d.numero_dossier?.toLowerCase().includes(term) ||
      d.titre?.toLowerCase().includes(term) ||
      d.fonctionnaire_nom?.toLowerCase().includes(term) ||
      d.fonctionnaire_prenom?.toLowerCase().includes(term)
    );
  };

  const filterDossiersByStatut = (dossiersList: Dossier[]): Dossier[] => {
    if (selectedStatut === 'tous') return dossiersList;
    if (selectedStatut === 'REJETES') {
      return dossiersList.filter(d => aEteRejete(d));
    }
    return dossiersList.filter(d => d.statut === selectedStatut);
  };

  const getFilteredDossiersForSection = (section: string): Dossier[] => {
    let dossiersSection: Dossier[] = [];
    
    switch(section) {
      case 'total':
        dossiersSection = dossiersFiltres.total;
        break;
      case 'aTraiter':
        dossiersSection = dossiersFiltres.aTraiter;
        break;
      case 'enCours':
        dossiersSection = dossiersFiltres.enCours;
        break;
      case 'termines':
        dossiersSection = dossiersFiltres.termines;
        break;
      case 'rejetes':
        dossiersSection = dossiersFiltres.rejetes;
        break;
      default:
        dossiersSection = dossiersFiltres.total;
    }
    
    // Appliquer les filtres de recherche
    let filtered = filterDossiersBySearch(dossiersSection);
    filtered = filterDossiersByStatut(filtered);
    
    return filtered;
  };

  useEffect(() => {
    loadDossiers();
  }, [userEmail, userRole]);

  // Mettre à jour la section active quand l'URL change
  useEffect(() => {
    if (sectionFilter) {
      setActiveSection(sectionFilter);
    }
  }, [sectionFilter]);

  const getSectionsConfig = () => {
    if (isInteresse) {
      return [
        {
          id: 'total',
          titre: '📊 Total dossiers',
          compteur: dossiersFiltres.total.length,
          dossiers: getFilteredDossiersForSection('total'),
          couleur: 'vert',
          icone: <FolderOpen size={20} />
        },
        {
          id: 'enCours',
          titre: '⏳ En cours',
          compteur: dossiersFiltres.enCours.length,
          dossiers: getFilteredDossiersForSection('enCours'),
          couleur: 'bleu',
          icone: <Loader size={20} />
        },
        {
          id: 'termines',
          titre: '✅ Terminés',
          compteur: dossiersFiltres.termines.length,
          dossiers: getFilteredDossiersForSection('termines'),
          couleur: 'vert',
          icone: <CheckCircle size={20} />
        },
        {
          id: 'rejetes',
          titre: '❌ Rejetés',
          compteur: dossiersFiltres.rejetes.length,
          dossiers: getFilteredDossiersForSection('rejetes'),
          couleur: 'orange',
          icone: <AlertOctagon size={20} />
        }
      ];
    } else {
      return [
        {
          id: 'total',
          titre: '📊 Total dossiers',
          compteur: dossiersFiltres.total.length,
          dossiers: getFilteredDossiersForSection('total'),
          couleur: 'vert',
          icone: <FolderOpen size={20} />
        },
        {
          id: 'aTraiter',
          titre: '📋 À traiter',
          compteur: dossiersFiltres.aTraiter.length,
          dossiers: getFilteredDossiersForSection('aTraiter'),
          couleur: 'bleu',
          icone: <Inbox size={20} />
        },
        {
          id: 'termines',
          titre: '✅ Terminés',
          compteur: dossiersFiltres.termines.length,
          dossiers: getFilteredDossiersForSection('termines'),
          couleur: 'vert',
          icone: <CheckCircle size={20} />
        },
        {
          id: 'rejetes',
          titre: '❌ Rejetés',
          compteur: dossiersFiltres.rejetes.length,
          dossiers: getFilteredDossiersForSection('rejetes'),
          couleur: 'orange',
          icone: <AlertOctagon size={20} />
        }
      ];
    }
  };

  const sections = getSectionsConfig();

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
            {isDREN && 'Direction Régionale - Historique complet des dossiers'}
            {isMEN && 'Ministère - Historique complet des dossiers'}
            {isFOP && 'Formation Professionnelle - Historique complet des dossiers'}
            {isFINANCE && 'Direction des Finances - Historique complet des dossiers'}
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
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par n°, titre, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option value="tous">Tous les statuts</option>
                <option value={STATUTS.BROUILLON}>Brouillon</option>
                <option value={STATUTS.EN_ATTENTE_DREN}>En attente DREN</option>
                <option value={STATUTS.EN_ATTENTE_MEN}>En attente MEN</option>
                <option value={STATUTS.EN_ATTENTE_FOP}>En attente FOP</option>
                <option value={STATUTS.EN_ATTENTE_FINANCE}>En attente Finance</option>
                <option value={STATUTS.EN_COURS}>En cours</option>
                <option value={STATUTS.TERMINE}>Terminé</option>
                <option value="REJETES">Rejetés</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Sections de dossiers */}
      {activeSection === 'total' ? (
        // Vue complète avec toutes les sections
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section) => (
            <SectionDossiers
              key={section.id}
              titre={section.titre}
              compteur={section.compteur}
              dossiers={section.dossiers}
              couleur={section.couleur}
              icone={section.icone}
              type={section.id}
              limit={5}
            />
          ))}
        </div>
      ) : (
        // Vue détaillée d'une section spécifique
        <div className="space-y-4">
          <button
            onClick={() => {
              setActiveSection('total');
              navigate('/dossiers');
            }}
            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium"
          >
            ← Retour à toutes les sections
          </button>
          
          {sections.find(s => s.id === activeSection) && (
            <SectionDossiers
              titre={sections.find(s => s.id === activeSection)!.titre}
              compteur={sections.find(s => s.id === activeSection)!.compteur}
              dossiers={sections.find(s => s.id === activeSection)!.dossiers}
              couleur={sections.find(s => s.id === activeSection)!.couleur}
              icone={sections.find(s => s.id === activeSection)!.icone}
              type={activeSection}
              limit={100} // Afficher tous les dossiers
            />
          )}
        </div>
      )}

      {/* Message si aucun dossier */}
      {dossiersFiltres.total.length === 0 && (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 mb-2">Aucun dossier trouvé</h3>
          <p className="text-neutral-500 mb-6">
            {isInteresse 
              ? 'Vous n\'avez pas encore créé de dossier.'
              : 'Aucun dossier à afficher pour le moment.'}
          </p>
          {isInteresse && (
            <button
              onClick={() => navigate('/dossiers/creer')}
              className="btn-primary"
            >
              Créer un dossier
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DossiersList;