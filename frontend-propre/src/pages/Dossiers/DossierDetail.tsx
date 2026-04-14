// src/pages/Dossiers/DossierDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
  FileWarning,
  X,
  CheckCircle,
  XCircle,
  Send,
  RotateCcw,
  AlertCircle,
  Info,
  FolderOpen,
  Hash,
  Paperclip,
  DownloadCloud,
  Trash2,
  Brain
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { DossierDetail as DossierDetailType, Document } from '../../types';
import { getCodeInfo } from '../../utils/codesMouvementComplet';
import StatusChip from '../../components/Common/StatusChip';
import WorkflowVisualization from '../../components/Workflow/WorkflowVisualization';
import ScoreIA from '../../components/Common/ScoreIA';
import DocumentPreview from '../../components/Common/DocumentPreview';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ==================== CONSTANTES ====================
const STATUTS = {
  BROUILLON: 'BROUILLON',
  EN_ATTENTE_DREN: 'EN_ATTENTE_DREN',
  EN_ATTENTE_MEN: 'EN_ATTENTE_MEN',
  EN_ATTENTE_FOP: 'EN_ATTENTE_FOP',
  EN_ATTENTE_FINANCE: 'EN_ATTENTE_FINANCE',
  EN_COURS: 'EN_COURS',
  BLOQUE: 'BLOQUE',
  TERMINE: 'TERMINE',
  REJETE: 'REJETE'
} as const;

// ==================== COMPOSANT PRINCIPAL ====================
const DossierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dossier, setDossier] = useState<DossierDetailType | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'informations' | 'documents' | 'historique' | 'ia'>('informations');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  const isInteresse = userRole === 'UTILISATEUR' || userEmail?.includes('interesse');
  const isDREN = userRole === 'DREN' || userEmail?.includes('dren');
  const isMEN = userRole === 'MEN' || userEmail?.includes('men');
  const isFOP = userRole === 'FOP' || userEmail?.includes('fop');
  const isFINANCE = userRole === 'FINANCE' || userEmail?.includes('finance');

  // ==================== CHARGEMENT DES DONNÉES ====================
  useEffect(() => {
    if (id) {
      loadDossier();
    }
  }, [id]);

  const loadDossier = async () => {
    setLoading(true);
    try {
      console.log('🔍 Chargement du dossier détaillé:', id);
      const data = await dossierService.getDossierById(id!);
      
      if (data) {
        console.log('✅ Dossier chargé:', data);
        setDossier(data);
        
        if (data.documents && Array.isArray(data.documents)) {
          setDocuments(data.documents);
          console.log(`📎 ${data.documents.length} documents trouvés`);
        }
      } else {
        toast.error('Dossier non trouvé');
        navigate('/dossiers');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement dossier:', error);
      
      if (error.response?.status === 404) {
        toast.error('Ce dossier n\'est plus accessible (il a probablement été transféré)');
        navigate('/dossiers');
      } else {
        toast.error('Erreur lors du chargement du dossier');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== GESTION DES DOCUMENTS ====================
  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (doc.url) {
        window.open(doc.url, '_blank');
      } else {
        toast.error('URL du document non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    
    try {
      const success = await dossierService.deleteDocument(docId);
      if (success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        toast.success('Document supprimé');
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // ==================== ACTIONS SUR LE DOSSIER ====================
  const handleEnvoyer = async () => {
    if (!dossier) return;
    
    const message = dossier.motif_rejet 
      ? 'Confirmer le renvoi du dossier corrigé à la DREN ?'
      : 'Confirmer l\'envoi du dossier à la DREN ?';
    
    if (!window.confirm(message)) return;
    
    setActionInProgress('envoyer');
    try {
      const updated = await dossierService.envoyerDossier(dossier.id, userEmail);
      if (updated) {
        toast.success('✅ Dossier envoyé à la DREN avec succès !');
        setTimeout(() => navigate('/dossiers'), 1500);
      }
    } catch (error) {
      console.error('❌ Erreur envoi:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleValider = async () => {
    if (!dossier) return;
    
    const message = isFINANCE 
      ? 'Confirmer la finalisation du dossier ?' 
      : 'Confirmer la validation et la transmission ?';
    
    if (!window.confirm(message)) return;
    
    setActionInProgress('valider');
    try {
      console.log('✅ Validation du dossier:', dossier.id);
      const updated = await dossierService.validerEtape(dossier.id, userRole);
      
      if (updated) {
        if (isFINANCE) toast.success('✅ Dossier terminé avec succès !');
        else if (isDREN) toast.success('✅ Dossier validé - transmis au MEN');
        else if (isMEN) toast.success('✅ Dossier validé - transmis à la FOP');
        else if (isFOP) toast.success('✅ Dossier validé - transmis à la Finance');
        
        setTimeout(() => {
          navigate('/dossiers');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erreur validation:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejeter = async () => {
    if (!dossier) return;
    
    const motif = window.prompt('Motif du rejet :');
    if (!motif) return;
    
    setActionInProgress('rejeter');
    try {
      console.log('❌ Rejet du dossier:', dossier.id);
      const updated = await dossierService.rejeterDossier(dossier.id, userRole, motif);
      
      if (updated) {
        toast.success('❌ Dossier rejeté et retourné à l\'intéressé');
        setTimeout(() => {
          navigate('/dossiers');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  // ==================== FONCTION ANALYSE IA ====================
  const handleAnalyseIA = async () => {
    if (!dossier) return;
    
    setAnalyzing(true);
    try {
      const response = await api.post(`/dossiers/${dossier.id}/analyser_ia/`);
      
      if (response.data.success) {
        toast.success('✅ Analyse IA effectuée avec succès');
        
        // Mettre à jour l'analyse dans le state
        setDossier({
          ...dossier,
          derniere_analyse_ia: response.data.analyse
        });
        
        console.log('📊 Résultats analyse:', response.data.analyse);
      } else {
        toast.error(`❌ ${response.data.error}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur analyse IA:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'analyse IA');
    } finally {
      setAnalyzing(false);
    }
  };

  // ==================== FONCTIONS UTILITAIRES ====================
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (doc: Document) => {
    const fileName = doc.nom.toLowerCase();
    if (fileName.endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <ImageIcon className="w-8 h-8 text-purple-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const peutValider = (): boolean => {
    if (!dossier) return false;
    if (dossier.statut === STATUTS.TERMINE) return false;
    
    if (isDREN && dossier.statut === STATUTS.EN_ATTENTE_DREN) return true;
    if (isMEN && dossier.statut === STATUTS.EN_ATTENTE_MEN) return true;
    if (isFOP && dossier.statut === STATUTS.EN_ATTENTE_FOP) return true;
    if (isFINANCE && dossier.statut === STATUTS.EN_ATTENTE_FINANCE) return true;
    
    return false;
  };

  const peutEnvoyer = (): boolean => {
    if (!dossier) return false;
    return isInteresse && 
           dossier.etape_actuelle === 'INTERESSE' && 
           (dossier.statut === STATUTS.BROUILLON || dossier.motif_rejet);
  };

  // ==================== RENDU ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="text-center py-12">
        <FileWarning className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Dossier non trouvé</h2>
        <button
          onClick={() => navigate('/dossiers')}
          className="btn-primary mt-4"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const codeInfo = getCodeInfo(dossier.code_mouvement || '');
  const estRejete = dossier.motif_rejet !== null && dossier.motif_rejet !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dossiers')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Détail du dossier
                  </h1>
                  <StatusChip status={dossier.statut} />
                  {estRejete && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <RotateCcw size={14} />
                      À corriger
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {dossier.numero_dossier} • Créé le {formatDate(dossier.created_at)}
                </p>
              </div>
            </div>
            
            {/* ACTIONS RAPIDES - TOUS LES BOUTONS EN VERT */}
            <div className="flex items-center gap-2">
              {peutEnvoyer() && (
                <button
                  onClick={handleEnvoyer}
                  disabled={actionInProgress === 'envoyer'}
                  className={`${
                    estRejete ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
                  } text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
                >
                  {actionInProgress === 'envoyer' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{estRejete ? 'Renvoyer' : 'Envoyer à la DREN'}</span>
                    </>
                  )}
                </button>
              )}
              
              {peutValider() && (
                <>
                  <button
                    onClick={handleValider}
                    disabled={actionInProgress === 'valider'}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {actionInProgress === 'valider' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Traitement...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        <span>Valider</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleRejeter}
                    disabled={actionInProgress === 'rejeter'}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {actionInProgress === 'rejeter' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Traitement...</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        <span>Rejeter</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-6 mt-4 border-t border-gray-200 pt-2">
            <button
              onClick={() => setActiveTab('informations')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'informations'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'documents'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={16} />
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('historique')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'historique'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historique
            </button>
            <button
              onClick={() => setActiveTab('ia')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'ia'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analyse IA
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="p-8 max-w-6xl mx-auto">
        {/* Message de rejet */}
        {estRejete && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800">Dossier rejeté</h3>
                <p className="text-sm text-orange-700 mt-1">{dossier.motif_rejet}</p>
                <p className="text-xs text-orange-600 mt-2">
                  Veuillez corriger les points mentionnés et renvoyer le dossier.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== ONGLET INFORMATIONS ===== */}
        {activeTab === 'informations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info size={20} className="text-green-600" />
                Informations générales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Code mouvement</p>
                  <div className="flex items-center gap-2">
                    <Hash size={16} className="text-green-600" />
                    <p className="font-medium">{dossier.code_mouvement || 'Non spécifié'}</p>
                    {codeInfo && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {codeInfo.libelle}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Type de dossier</p>
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-green-600" />
                    <p className="font-medium">{dossier.type_dossier || 'Non spécifié'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Statut</p>
                  <StatusChip status={dossier.statut} />
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Étape actuelle</p>
                  <p className="font-medium">{dossier.etape_actuelle}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Date de dépôt</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-green-600" />
                    <p className="font-medium">{formatDate(dossier.date_depot)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Date de clôture</p>
                  <p className="font-medium">{dossier.date_cloture ? formatDate(dossier.date_cloture) : 'En cours'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-green-600" />
                Informations du fonctionnaire
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Nom</p>
                  <p className="font-medium text-lg">{dossier.fonctionnaire_nom || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Prénom</p>
                  <p className="font-medium text-lg">{dossier.fonctionnaire_prenom || ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Matricule</p>
                  <p className="font-medium">{dossier.fonctionnaire_matricule || 'Non spécifié'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow</h2>
              <WorkflowVisualization currentStep={dossier.etape_actuelle} />
            </div>
          </div>
        )}

        {/* ===== ONGLET DOCUMENTS ===== */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-green-600" />
                Documents joints ({documents.length})
              </h2>
            </div>
            
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    {getFileIcon(doc)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.nom}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(doc.taille)}</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="p-2 hover:bg-white rounded-lg"
                        title="Aperçu"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 hover:bg-white rounded-lg"
                        title="Télécharger"
                      >
                        <DownloadCloud size={16} className="text-gray-600" />
                      </button>
                      {isInteresse && dossier.statut === STATUTS.BROUILLON && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun document joint</p>
              </div>
            )}
          </div>
        )}

        {/* ===== ONGLET HISTORIQUE ===== */}
        {activeTab === 'historique' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Historique des actions</h2>
            
            {dossier.historique && dossier.historique.length > 0 ? (
              <div className="space-y-4">
                {dossier.historique.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    {action.action === 'VALIDATION' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {action.action === 'REJET' && <XCircle className="w-5 h-5 text-red-500" />}
                    {action.action === 'TRANSFERT' && <Send className="w-5 h-5 text-blue-500" />}
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{action.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{action.commentaire || 'Aucun commentaire'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(action.created_at)} • Par: {action.user_nom || 'Système'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucun historique disponible</p>
            )}
          </div>
        )}

        {/* ===== ONGLET IA AVEC BOUTON D'ANALYSE ===== */}
        {activeTab === 'ia' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Analyse IA
              </h2>
              
              {/* Bouton pour lancer l'analyse - en vert aussi */}
              <button
                onClick={handleAnalyseIA}
                disabled={analyzing}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyse en cours...</span>
                  </>
                ) : (
                  <>
                    <Brain size={18} />
                    <span>Analyser avec IA</span>
                  </>
                )}
              </button>
            </div>
            
            {dossier.derniere_analyse_ia ? (
              <div className="space-y-6">
                {/* Score de risque */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Score de risque</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dossier.derniere_analyse_ia.score_risque < 30 ? 'bg-green-500' :
                          dossier.derniere_analyse_ia.score_risque < 60 ? 'bg-yellow-500' :
                          dossier.derniere_analyse_ia.score_risque < 80 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${dossier.derniere_analyse_ia.score_risque}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      {dossier.derniere_analyse_ia.score_risque}
                    </span>
                  </div>
                </div>
                
                {/* Classification */}
                <div className={`p-4 rounded-lg ${
                  dossier.derniere_analyse_ia.score_risque < 30 ? 'bg-green-50' :
                  dossier.derniere_analyse_ia.score_risque < 60 ? 'bg-yellow-50' :
                  dossier.derniere_analyse_ia.score_risque < 80 ? 'bg-orange-50' :
                  'bg-red-50'
                }`}>
                  <p className="font-medium">Classification</p>
                  <p className="text-lg">{dossier.derniere_analyse_ia.classification || 'Non classifié'}</p>
                </div>
                
                {/* Anomalies */}
                {dossier.derniere_analyse_ia.resultats?.anomalies?.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Anomalies détectées</p>
                    <ul className="space-y-2">
                      {dossier.derniere_analyse_ia.resultats.anomalies.map((anomalie: any, idx: number) => (
                        <li key={idx} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {anomalie.message || JSON.stringify(anomalie)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Date de l'analyse */}
                <p className="text-xs text-gray-400">
                  Analyse du {new Date(dossier.derniere_analyse_ia.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucune analyse IA disponible</p>
                <p className="text-sm text-gray-400 mt-2">
                  Cliquez sur le bouton "Analyser avec IA" pour générer une analyse
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== MODAL DE PRÉVISUALISATION ===== */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};

export default DossierDetail;