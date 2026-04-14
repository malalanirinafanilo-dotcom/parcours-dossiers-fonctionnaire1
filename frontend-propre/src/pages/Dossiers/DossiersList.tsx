import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import { getCodeInfo } from '../../utils/codesMouvementComplet';
import StatusChip from '../../components/Common/StatusChip';
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
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [filteredDossiers, setFilteredDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [stats, setStats] = useState({
    enCours: 0,
    termines: 0,
    enAttente: 0,
    rejetes: 0,
    total: 0
  });

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
    
    // DREN peut valider les dossiers en attente DREN
    if (isDREN && dossier.etape_actuelle === ETAPES.DREN) return true;
    
    // MEN peut valider les dossiers en attente MEN
    if (isMEN && dossier.etape_actuelle === ETAPES.MEN) return true;
    
    // FOP peut valider les dossiers en attente FOP
    if (isFOP && dossier.etape_actuelle === ETAPES.FOP) return true;
    
    // FINANCE peut valider les dossiers en attente FINANCE
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
        await loadDossiers(); // Recharger pour voir le statut mis à jour
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
        await loadDossiers(); // Recharger pour voir le statut mis à jour
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
        await loadDossiers(); // Recharger pour voir le statut mis à jour
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
      setFilteredDossiers(userDossiers);
      
      const stats = {
        enCours: userDossiers.filter(d => 
          [STATUTS.EN_ATTENTE_DREN, STATUTS.EN_ATTENTE_MEN, STATUTS.EN_ATTENTE_FOP, STATUTS.EN_ATTENTE_FINANCE].includes(d.statut as any)
        ).length,
        termines: userDossiers.filter(d => d.statut === STATUTS.TERMINE).length,
        enAttente: userDossiers.filter(d => 
          d.statut === STATUTS.BROUILLON || aEteRejete(d)
        ).length,
        rejetes: userDossiers.filter(d => aEteRejete(d)).length,
        total: userDossiers.length
      };
      setStats(stats);
      
    } catch (error) {
      console.error('Erreur chargement dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  const filterDossiers = () => {
    let filtered = [...dossiers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.numero_dossier?.toLowerCase().includes(term) ||
        d.titre?.toLowerCase().includes(term) ||
        d.fonctionnaire_nom?.toLowerCase().includes(term) ||
        d.fonctionnaire_prenom?.toLowerCase().includes(term)
      );
    }

    if (selectedStatut !== 'tous') {
      if (selectedStatut === 'REJETES') {
        filtered = filtered.filter(d => aEteRejete(d));
      } else {
        filtered = filtered.filter(d => d.statut === selectedStatut);
      }
    }

    setFilteredDossiers(filtered);
  };

  useEffect(() => {
    loadDossiers();
  }, [userEmail, userRole]);

  useEffect(() => {
    filterDossiers();
  }, [dossiers, searchTerm, selectedStatut]);

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
            {isInteresse && 'Gérez et suivez vos demandes'}
            {isDREN && 'Direction Régionale - Tous les dossiers traités'}
            {isMEN && 'Ministère - Tous les dossiers traités'}
            {isFOP && 'Formation Professionnelle - Tous les dossiers traités'}
            {isFINANCE && 'Direction des Finances - Tous les dossiers traités'}
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-xs text-neutral-500 mb-1">Total dossiers</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-white">
          <p className="text-xs text-green-600 mb-1">En attente</p>
          <p className="text-2xl font-bold text-green-700">{stats.enAttente}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-white">
          <p className="text-xs text-green-600 mb-1">En cours</p>
          <p className="text-2xl font-bold text-green-700">{stats.enCours}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-white">
          <p className="text-xs text-green-600 mb-1">Terminés</p>
          <p className="text-2xl font-bold text-green-700">{stats.termines}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-white">
          <p className="text-xs text-orange-600 mb-1">Rejetés</p>
          <p className="text-2xl font-bold text-orange-700">{stats.rejetes}</p>
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

      {/* Liste des dossiers */}
      {filteredDossiers.length > 0 ? (
        <div className="space-y-4">
          {filteredDossiers.map((dossier) => {
            const codeInfo = getCodeInfo(dossier.code_mouvement || '');
            const estRejete = aEteRejete(dossier);
            
            return (
              <div
                key={dossier.id}
                className={`card cursor-pointer hover:scale-[1.01] transition-all ${
                  estRejete ? 'border-l-4 border-l-orange-500' : ''
                }`}
                onClick={() => navigate(`/dossiers/${dossier.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                        {dossier.numero_dossier}
                      </span>
                      <StatusChip status={dossier.statut} />
                      {estRejete && (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1">
                          <RotateCcw size={12} />
                          À corriger
                        </span>
                      )}
                      {codeInfo && (
                        <span className="text-xs bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-xl">
                          {codeInfo.code} - {codeInfo.libelle.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-neutral-900 text-lg mb-1">{dossier.titre}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mt-2">
                      <span className="flex items-center gap-1">
                        <User size={14} className="text-green-500" />
                        {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-green-500" />
                        {new Date(dossier.date_depot).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {estRejete && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-sm text-orange-700">
                          <span className="font-medium">Motif :</span> {dossier.motif_rejet}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    
                    {peutCorriger(dossier) && (
                      <button
                        onClick={() => handleCorriger(dossier.id)}
                        className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                      >
                        <FileText size={16} />
                        <span>Corriger</span>
                      </button>
                    )}

                    {peutEnvoyer(dossier) && (
                      <button
                        onClick={() => handleEnvoyer(dossier.id)}
                        disabled={actionInProgress === dossier.id}
                        className={`bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg ${
                          actionInProgress === dossier.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {actionInProgress === dossier.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Envoi...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>{estRejete ? 'Renvoyer' : 'Envoyer'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {peutValider(dossier) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleValider(dossier.id)}
                          disabled={actionInProgress === dossier.id}
                          className={`bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg ${
                            actionInProgress === dossier.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {actionInProgress === dossier.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Traitement...</span>
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              <span>{getValidationButtonLabel()}</span>
                            </>
                          )}
                        </button>

                        {peutRejeter(dossier) && (
                          <button
                            onClick={() => handleRejeter(dossier.id)}
                            disabled={actionInProgress === dossier.id}
                            className="bg-gradient-to-r from-error-500 to-error-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={16} />
                            <span>Rejeter</span>
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      className="p-2 hover:bg-green-50 rounded-xl transition-colors group"
                      title="Voir les détails"
                    >
                      <Eye size={18} className="text-neutral-400 group-hover:text-green-600" />
                    </button>
                  </div>
                </div>

                {dossier.documents && dossier.documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-neutral-700">
                        {dossier.documents.length} document(s) joint(s)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 mb-2">Aucun dossier trouvé</h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm || selectedStatut !== 'tous'
              ? 'Essayez de modifier vos filtres'
              : isInteresse
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