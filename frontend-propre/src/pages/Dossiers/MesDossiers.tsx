import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FolderOpen, CheckCircle, Clock, Search, Filter, Plus, Eye, FileText, X,
  Send, Check, XCircle, RefreshCw, User, Calendar, RotateCcw, Sparkles, Loader
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import StatusChip from '../../components/Common/StatusChip';
import toast from 'react-hot-toast';

const MesDossiers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const hasLoaded = useRef(false);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';
  const isInteresse = userRole === 'UTILISATEUR' || userEmail?.includes('interesse');

  const loadDossiers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dossierService.getDossiersForUser(userEmail, userRole);
      setDossiers(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [userEmail, userRole]);

  useEffect(() => {
    if (!hasLoaded.current && userEmail) {
      hasLoaded.current = true;
      loadDossiers();
    }
  }, [userEmail, userRole, loadDossiers]);

  const filteredDossiers = dossiers.filter(d => {
    const matchSearch = searchTerm === '' || 
      d.numero_dossier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.titre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatut = selectedStatut === 'tous' || d.statut === selectedStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: dossiers.length,
    enCours: dossiers.filter(d => d.statut === 'EN_COURS' || d.statut?.startsWith('EN_ATTENTE')).length,
    termines: dossiers.filter(d => d.statut === 'TERMINE').length,
    brouillons: dossiers.filter(d => d.statut === 'BROUILLON').length,
    rejetes: dossiers.filter(d => d.motif_rejet).length,
  };

  const handleEnvoyer = async (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Envoyer ce dossier à la DREN ?')) return;
    
    setActionInProgress(dossierId);
    try {
      await dossierService.envoyerDossier(dossierId, userEmail);
      toast.success('Dossier envoyé !');
      await loadDossiers();
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes dossiers</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Sparkles size={16} className="text-green-500" />
            {isInteresse ? 'Gérez vos demandes' : 'Consultez les dossiers'}
          </p>
        </div>
        {isInteresse && (
          <button
            onClick={() => navigate('/dossiers/creer')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Nouveau dossier
          </button>
        )}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-4">
          <p className="text-sm text-gray-500">En cours</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enCours}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-4">
          <p className="text-sm text-gray-500">Terminés</p>
          <p className="text-2xl font-bold text-green-600">{stats.termines}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-4">
          <p className="text-sm text-gray-500">Brouillons</p>
          <p className="text-2xl font-bold text-orange-600">{stats.brouillons}</p>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par n° ou titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Filter size={18} />
            Filtres
          </button>
          <button onClick={loadDossiers} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="tous">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
            </select>
          </div>
        )}
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-3">
        {filteredDossiers.length > 0 ? (
          filteredDossiers.map((dossier) => {
            const estRejete = dossier.motif_rejet !== null;
            const peutEnvoyerDossier = isInteresse && dossier.etape_actuelle === 'INTERESSE' && 
              (dossier.statut === 'BROUILLON' || estRejete);

            return (
              <div
                key={dossier.id}
                onClick={() => navigate(`/dossiers/${dossier.id}`)}
                className="bg-white rounded-xl shadow-soft p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        {dossier.numero_dossier}
                      </span>
                      <StatusChip status={dossier.statut} size="sm" />
                      {estRejete && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                          <RotateCcw size={10} className="inline mr-1" />
                          Rejeté
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{dossier.titre}</h3>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
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
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <span className="font-medium">Motif :</span> {dossier.motif_rejet}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {peutEnvoyerDossier && (
                      <button
                        onClick={(e) => handleEnvoyer(dossier.id, e)}
                        disabled={actionInProgress === dossier.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                      >
                        {actionInProgress === dossier.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span>{estRejete ? 'Renvoyer' : 'Envoyer'}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {dossier.documents && dossier.documents.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-green-500" />
                      <span className="text-xs text-gray-500">{dossier.documents.length} document(s)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun dossier trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun résultat pour votre recherche' : 'Vous n\'avez pas encore de dossiers'}
            </p>
            {isInteresse && (
              <button
                onClick={() => navigate('/dossiers/creer')}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Créer un dossier
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesDossiers;