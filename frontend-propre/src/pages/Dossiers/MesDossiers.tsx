// src/pages/Dossiers/MesDossiers.tsx - Version modernisée pour TOUS les rôles
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, CheckCircle, Clock, Search, Filter, Plus, Eye, FileText, X,
  Send, RefreshCw, User, Calendar, RotateCcw, Sparkles, Loader,
  ChevronDown, ChevronUp, Grid3X3, List, ArrowUpDown, MoreHorizontal,
  AlertCircle, ShieldCheck, Zap, Inbox, Check, XCircle, AlertTriangle
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
};

// Composant de carte dossier modernisé
const DossierCard: React.FC<{
  dossier: Dossier;
  onClick: () => void;
  onAction?: (action: string, e: React.MouseEvent) => void;
  showActions?: boolean;
  userRole: string;
}> = ({ dossier, onClick, onAction, showActions = true, userRole }) => {
  const [isHovered, setIsHovered] = useState(false);
  const estRejete = dossier.motif_rejet !== null && dossier.motif_rejet !== '';
  
  const isDREN = userRole === 'DREN';
  const isMEN = userRole === 'MEN';
  const isFOP = userRole === 'FOP';
  const isFINANCE = userRole === 'FINANCE';
  const isInteresse = userRole === 'UTILISATEUR';
  
  const peutValider = () => {
    if (dossier.statut === STATUTS.TERMINE) return false;
    if (isDREN && dossier.etape_actuelle === 'DREN') return true;
    if (isMEN && dossier.etape_actuelle === 'MEN') return true;
    if (isFOP && dossier.etape_actuelle === 'FOP') return true;
    if (isFINANCE && dossier.etape_actuelle === 'FINANCE') return true;
    return false;
  };
  
  const peutEnvoyer = () => {
    return isInteresse && dossier.etape_actuelle === 'INTERESSE' && 
      (dossier.statut === STATUTS.BROUILLON || estRejete);
  };
  
  const getStatusIcon = () => {
    if (dossier.statut === STATUTS.TERMINE) return <CheckCircle size={16} className="text-emerald-500" />;
    if (dossier.statut === STATUTS.EN_ATTENTE_DREN || dossier.statut === STATUTS.EN_ATTENTE_MEN) return <Clock size={16} className="text-amber-500" />;
    if (estRejete) return <AlertCircle size={16} className="text-rose-500" />;
    return <FileText size={16} className="text-accent-500" />;
  };

  const getValidationLabel = () => {
    if (isDREN) return 'Valider → MEN';
    if (isMEN) return 'Valider → FOP';
    if (isFOP) return 'Valider → Finance';
    if (isFINANCE) return 'Terminer';
    return 'Valider';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative cursor-pointer rounded-2xl border border-dark-200 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-dark-800 dark:bg-dark-900"
      onClick={onClick}
    >
      <div className="absolute right-4 top-4">
        <StatusChip status={dossier.statut} size="sm" />
      </div>

      <div className="pr-24">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-mono text-xs font-medium text-dark-500 dark:text-dark-400">
            {dossier.numero_dossier}
          </span>
          {estRejete && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              <RotateCcw size={10} />
              Rejeté
            </span>
          )}
        </div>
        
        <h3 className="mt-2 text-lg font-semibold text-dark-900 dark:text-dark-100">
          {dossier.titre}
        </h3>
        
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-dark-500 dark:text-dark-400">
          <span className="flex items-center gap-1">
            <User size={12} />
            {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(dossier.date_depot).toLocaleDateString('fr-FR')}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {dossier.etape_actuelle}
          </span>
        </div>

        {estRejete && dossier.motif_rejet && (
          <div className="mt-3 rounded-xl bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
            <span className="font-medium">Motif :</span> {dossier.motif_rejet}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isHovered && showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-4 right-4 flex gap-1"
          >
            {peutEnvoyer() && (
              <button
                onClick={(e) => onAction?.('send', e)}
                className="rounded-xl bg-accent-600 p-2 text-white transition-all hover:bg-accent-700"
                title="Envoyer"
              >
                <Send size={14} />
              </button>
            )}
            {peutValider() && (
              <>
                <button
                  onClick={(e) => onAction?.('validate', e)}
                  className="rounded-xl bg-emerald-600 p-2 text-white transition-all hover:bg-emerald-700"
                  title={getValidationLabel()}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={(e) => onAction?.('reject', e)}
                  className="rounded-xl bg-rose-600 p-2 text-white transition-all hover:bg-rose-700"
                  title="Rejeter"
                >
                  <XCircle size={14} />
                </button>
              </>
            )}
            <button
              onClick={(e) => onAction?.('view', e)}
              className="rounded-xl bg-dark-100 p-2 text-dark-600 transition-all hover:bg-dark-200 dark:bg-dark-800 dark:text-dark-400"
              title="Voir"
            >
              <Eye size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Composant principal
const MesDossiers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [filteredDossiers, setFilteredDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || 'UTILISATEUR';
  const isInteresse = userRole === 'UTILISATEUR' || userEmail?.includes('interesse');

  const loadDossiers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dossierService.getDossiersForUser(userEmail, userRole);
      setDossiers(data);
      setFilteredDossiers(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [userEmail, userRole]);

  useEffect(() => {
    loadDossiers();
  }, [loadDossiers]);

  useEffect(() => {
    let filtered = [...dossiers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.numero_dossier?.toLowerCase().includes(term) ||
        d.titre?.toLowerCase().includes(term) ||
        `${d.fonctionnaire_nom} ${d.fonctionnaire_prenom}`.toLowerCase().includes(term)
      );
    }

    if (selectedStatut !== 'tous') {
      if (selectedStatut === 'REJETE') {
        filtered = filtered.filter(d => d.motif_rejet);
      } else {
        filtered = filtered.filter(d => d.statut === selectedStatut);
      }
    }

    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'titre_asc':
        filtered.sort((a, b) => a.titre.localeCompare(b.titre));
        break;
      case 'titre_desc':
        filtered.sort((a, b) => b.titre.localeCompare(a.titre));
        break;
    }

    setFilteredDossiers(filtered);
  }, [dossiers, searchTerm, selectedStatut, sortBy]);

  const handleEnvoyer = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Envoyer ce dossier à la DREN ?')) return;
    
    setActionInProgress(dossierId);
    try {
      await dossierService.envoyerDossier(dossierId, userEmail);
      toast.success('Dossier envoyé avec succès');
      await loadDossiers();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleValider = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Confirmer la validation ?')) return;
    
    setActionInProgress(dossierId);
    try {
      await dossierService.validerEtape(dossierId, userRole);
      toast.success('Validation réussie');
      await loadDossiers();
    } catch (error) {
      toast.error('Erreur lors de la validation');
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
      await dossierService.rejeterDossier(dossierId, userRole, motif);
      toast.success('Dossier rejeté');
      await loadDossiers();
    } catch (error) {
      toast.error('Erreur lors du rejet');
    } finally {
      setActionInProgress(null);
    }
  };

  const stats = {
    total: dossiers.length,
    enCours: dossiers.filter(d => 
      [STATUTS.EN_ATTENTE_DREN, STATUTS.EN_ATTENTE_MEN, STATUTS.EN_ATTENTE_FOP, STATUTS.EN_ATTENTE_FINANCE, STATUTS.EN_COURS].includes(d.statut as any)
    ).length,
    termines: dossiers.filter(d => d.statut === STATUTS.TERMINE).length,
    brouillons: dossiers.filter(d => d.statut === STATUTS.BROUILLON).length,
    rejetes: dossiers.filter(d => d.motif_rejet).length,
    aTraiter: dossiers.filter(d => 
      (userRole === 'DREN' && d.etape_actuelle === 'DREN') ||
      (userRole === 'MEN' && d.etape_actuelle === 'MEN') ||
      (userRole === 'FOP' && d.etape_actuelle === 'FOP') ||
      (userRole === 'FINANCE' && d.etape_actuelle === 'FINANCE')
    ).length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">
            {isInteresse ? 'Mes dossiers' : 'Gestion des dossiers'}
          </h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            {isInteresse ? 'Gérez vos demandes administratives' : 'Consultez et traitez les dossiers'}
          </p>
        </div>
        {isInteresse && (
          <button
            onClick={() => navigate('/dossiers/creer')}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-700 hover:shadow-md"
          >
            <Plus size={18} />
            Nouveau dossier
          </button>
        )}
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">Total</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{stats.total}</p>
        </div>
        {!isInteresse && (
          <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
            <p className="text-sm text-dark-500">À traiter</p>
            <p className="text-2xl font-bold text-accent-600">{stats.aTraiter}</p>
          </div>
        )}
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">En cours</p>
          <p className="text-2xl font-bold text-amber-600">{stats.enCours}</p>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">Terminés</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.termines}</p>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">Rejetés</p>
          <p className="text-2xl font-bold text-rose-600">{stats.rejetes}</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-10 pr-4 text-sm text-dark-900 placeholder:text-dark-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-accent-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
            >
              <Filter size={16} />
              Filtres
              {selectedStatut !== 'tous' && <span className="h-2 w-2 rounded-full bg-accent-500" />}
            </button>
            <div className="flex rounded-xl border border-dark-200 dark:border-dark-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-l-xl px-3 py-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-accent-600 text-white'
                    : 'bg-white text-dark-600 hover:bg-dark-50 dark:bg-dark-900 dark:text-dark-400'
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-r-xl px-3 py-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-accent-600 text-white'
                    : 'bg-white text-dark-600 hover:bg-dark-50 dark:bg-dark-900 dark:text-dark-400'
                }`}
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={loadDossiers}
              className="rounded-xl border border-dark-200 bg-white p-2.5 text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Statut</label>
                    <select
                      value={selectedStatut}
                      onChange={(e) => setSelectedStatut(e.target.value)}
                      className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                    >
                      <option value="tous">Tous les statuts</option>
                      <option value={STATUTS.BROUILLON}>Brouillon</option>
                      <option value={STATUTS.EN_ATTENTE_DREN}>En attente DREN</option>
                      <option value={STATUTS.EN_ATTENTE_MEN}>En attente MEN</option>
                      <option value={STATUTS.EN_ATTENTE_FOP}>En attente FOP</option>
                      <option value={STATUTS.EN_ATTENTE_FINANCE}>En attente Finance</option>
                      <option value={STATUTS.TERMINE}>Terminé</option>
                      <option value="REJETE">Rejetés</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                    >
                      <option value="date_desc">Date récent → ancien</option>
                      <option value="date_asc">Date ancien → récent</option>
                      <option value="titre_asc">Titre A → Z</option>
                      <option value="titre_desc">Titre Z → A</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des dossiers */}
      {filteredDossiers.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDossiers.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                userRole={userRole}
                onClick={() => navigate(`/dossiers/${dossier.id}`)}
                onAction={(action, e) => {
                  if (action === 'send') handleEnvoyer(dossier.id, e);
                  if (action === 'validate') handleValider(dossier.id, e);
                  if (action === 'reject') handleRejeter(dossier.id, e);
                  if (action === 'view') navigate(`/dossiers/${dossier.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-200 bg-dark-50 dark:border-dark-800 dark:bg-dark-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">N° Dossier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Titre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Demandeur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Étape</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-800">
                  {filteredDossiers.map((dossier) => (
                    <tr
                      key={dossier.id}
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      className="cursor-pointer transition-colors hover:bg-dark-50 dark:hover:bg-dark-800/50"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-accent-600 dark:text-accent-400">
                        {dossier.numero_dossier}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-700 dark:text-dark-300">
                        {dossier.titre}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {dossier.etape_actuelle}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={dossier.statut} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500">
                        {new Date(dossier.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <Eye size={16} className="text-dark-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dark-200 bg-white py-12 text-center dark:border-dark-800 dark:bg-dark-900">
          <FolderOpen size={48} className="mx-auto text-dark-300 dark:text-dark-700" />
          <h3 className="mt-3 text-lg font-medium text-dark-900 dark:text-dark-100">Aucun dossier trouvé</h3>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            {searchTerm || selectedStatut !== 'tous'
              ? 'Essayez de modifier vos filtres'
              : 'Aucun dossier à afficher pour le moment'}
          </p>
          {isInteresse && (
            <button
              onClick={() => navigate('/dossiers/creer')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Créer un dossier
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MesDossiers;