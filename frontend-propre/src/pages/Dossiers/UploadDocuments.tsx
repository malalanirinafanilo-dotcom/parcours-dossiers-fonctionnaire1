import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Save,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Eye,
  Download,
  Image as ImageIcon,
  FileWarning,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { getCodeInfo } from '../../utils/codesMouvementComplet';
import toast from 'react-hot-toast';

interface DocumentRequis {
  nom: string;
  description: string;
  obligatoire: boolean;
  type: 'pdf' | 'image' | 'any';
  uploaded?: boolean;
  file?: File;
}

const UploadDocuments: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Récupérer le code mouvement passé en paramètre
  const codeMouvement = location.state?.code || '02';
  const codeInfo = getCodeInfo(codeMouvement);
  
  const [documents, setDocuments] = useState<DocumentRequis[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Initialiser les documents requis selon le code
  useEffect(() => {
    if (codeInfo) {
      const docsRequis: DocumentRequis[] = codeInfo.documentsRequis.map(doc => ({
        nom: doc,
        description: getDocumentDescription(doc, codeInfo.code),
        obligatoire: true,
        type: getDocumentType(doc),
        uploaded: false
      }));
      setDocuments(docsRequis);
    }
  }, [codeInfo]);

  // Fonction pour obtenir la description d'un document
  const getDocumentDescription = (doc: string, code: string): string => {
    const descriptions: Record<string, string> = {
      // Pour le code 02 (Nomination fonctionnaire)
      'demande_nomination.pdf': 'Demande de nomination signée par l\'intéressé',
      'diplomes.pdf': 'Copies certifiées conformes des diplômes',
      'casier_judiciaire.pdf': 'Bulletin n°3 du casier judiciaire (moins de 3 mois)',
      'certificat_medical.pdf': 'Certificat de visite médicale (médecin agréé)',
      'photo_identite.jpg': 'Photo d\'identité récente',
      'arrete_nomination.pdf': 'Arrêté de nomination',
      'cv.pdf': 'Curriculum Vitae détaillé',
      'contrat.pdf': 'Contrat de travail signé',
      
      // Pour le code 01 (HEE)
      'arrete_affectation_hee.pdf': 'Arrêté d\'affectation (HEE)',
      'certificat_prise_service_hee.pdf': 'Certificat de prise de service (HEE)',
      'engagement_non_liquidateur.pdf': 'Engagement de non-liquidateur de pension',
      'fiche_renseignements.pdf': 'Fiche de renseignements',
      
      // Pour le code 03 (EFA)
      'contrat_travail_efa.pdf': 'Contrat de travail / Décision d\'engagement',
      'certificat_qualification.pdf': 'Certificat de qualification',
      
      // Pour le code 04 (ELD)
      'acte_engagement_eld.pdf': 'Acte d\'engagement',
      'avis_vacance.pdf': 'Avis de vacance de poste',
      'cin.pdf': 'Copie certifiée conforme du CIN',
      'acte_naissance.pdf': 'Extrait d\'acte de naissance (moins de 3 mois)',
      'releve_notes.pdf': 'Relevés de notes',
      'attestation_formation.pdf': 'Attestation de formation pédagogique',
      'carnet_vaccination.pdf': 'Carnet de vaccination',
      'certificat_cessation.pdf': 'Certificat de cessation de service',
      
      // Pour le code 05 (HEE fonctionnaire)
      'dernier_arrete.pdf': 'Dernier arrêté de situation',
      
      // Pour le code 08 (Rapatriement)
      'decision_rapatriement.pdf': 'Décision de rapatriement sanitaire ou administratif',
      'arrete_reintegration.pdf': 'Arrêté de réintégration',
      'justificatifs_frais.pdf': 'Justificatifs des frais de transport',
      
      // Pour le code 10 (Intégration)
      'demande_integration.pdf': 'Demande de l\'intéressé',
      'arrete_integration.pdf': 'Arrêté portant intégration',
      'dernier_arrete_situation.pdf': 'Dernier arrêté de situation (détachement, disponibilité)',
      'tableau_service.pdf': 'Tableau de service effectué',
      
      // Pour le code 11 (Titularisation)
      'decision_titularisation.pdf': 'Décision ou Arrêté de titularisation',
      'rapport_stage.pdf': 'Copie du rapport de stage',
      'attestation_fin_stage.pdf': 'Copie de l’attestation de fin de stage',
      
      // Pour le code 12 (Avancement de classe)
      'avenant.pdf': 'Avenant au contrat',
      'tableau_avancement.pdf': 'Tableau d’avancement',
      'decision_autorite.pdf': 'Décision de l’autorité compétente',
      
      // Pour le code 20 (Affectation)
      'arrete_affectation_nouveau.pdf': 'Arrêté d’affectation (nouveau)',
      'certificat_cessation_service.pdf': 'Certificat de cessation de service',
      'certificat_prise_service_nouveau.pdf': 'Certificat de prise de service (nouveau)',
      
      // Pour le code 40 (Décès)
      'acte_deces.pdf': 'Acte de décès',
      'certificat_deces.pdf': 'Certificat de décès',
      'arrete_constat_deces.pdf': 'Arrêté constatant le décès',
      
      // Pour le code 41 (Démission)
      'lettre_demission.pdf': 'Lettre de démission',
      'arrete_demission.pdf': 'Arrêté acceptant la démission',
      
      // Pour le code 42 (Retraite)
      'demande_retraite.pdf': 'Demande de retraite',
      'releve_carriere.pdf': 'Relevé de carrière',
      
      // Pour le code 60 (Allocations familiales)
      'actes_naissance_enfants.pdf': 'Actes de naissance des enfants',
      'certificat_scolarite.pdf': 'Certificat de scolarité',
      
      // Pour le code 63 (Avance sur solde)
      'demande_avance.pdf': 'Demande de l’agent',
      'decision_octroi.pdf': 'Décision d’octroi',
      
      // Pour le code 84 (Radiation)
      'decision_radiation.pdf': 'Décision de radiation',
      'motif_radiation.pdf': 'Motif de radiation'
    };
    
    return descriptions[doc] || `Document requis: ${doc}`;
  };

  // Fonction pour déterminer le type de document
  const getDocumentType = (doc: string): 'pdf' | 'image' | 'any' => {
    if (doc.includes('.jpg') || doc.includes('.jpeg') || doc.includes('.png')) {
      return 'image';
    }
    if (doc.includes('.pdf')) {
      return 'pdf';
    }
    return 'any';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
      e.target.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`"${file.name}" dépasse la limite de 10MB`);
      } else {
        validFiles.push(file);
        
        // Marquer les documents correspondants comme uploadés
        const docCorrespondant = documents.find(d => 
          file.name.toLowerCase().includes(d.nom.split('.')[0].toLowerCase())
        );
        
        if (docCorrespondant) {
          const updatedDocs = documents.map(d => 
            d.nom === docCorrespondant.nom ? { ...d, uploaded: true, file } : d
          );
          setDocuments(updatedDocs);
        }
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // Mettre à jour les documents
    const updatedDocs = documents.map(d => 
      d.file === fileToRemove ? { ...d, uploaded: false, file: undefined } : d
    );
    setDocuments(updatedDocs);
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Fichier supprimé');
  };

  const handlePreview = async (file: File) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(url);
      setPreviewFile(file);
    } else {
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  // ⭐ VERSION CORRIGÉE DE HANDLESUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les documents obligatoires
    const manquants = documents.filter(d => d.obligatoire && !d.uploaded);
    
    if (manquants.length > 0) {
      toast.error(`${manquants.length} document(s) obligatoire(s) manquant(s)`);
      return;
    }
    
    // Créer le dossier
    const newDossier = dossierService.createDossier({
      code_mouvement: codeMouvement,
      titre: `${codeInfo.libelle} - ${new Date().toLocaleDateString()}`,
      fonctionnaire_nom: user?.first_name || '',
      fonctionnaire_prenom: user?.last_name || '',
      fonctionnaire_matricule: 'À compléter',
      donnees_specifiques: {}
    }, user?.email || '', uploadedFiles);
    
    console.log('Dossier créé:', newDossier); // Pour déboguer
    toast.success('Dossier créé avec succès !');
    
    // Rediriger vers la liste des dossiers
    setTimeout(() => navigate('/dossiers'), 2000);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    if (file.name.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const categories = [
    { id: 'tous', label: 'Tous les documents' },
    { id: 'obligatoires', label: 'Obligatoires' },
    { id: 'optionnels', label: 'Optionnels' },
    { id: 'uploades', label: 'Déjà uploadés' }
  ];

  const documentsFiltres = documents.filter(doc => {
    if (selectedCategory === 'tous') return true;
    if (selectedCategory === 'obligatoires') return doc.obligatoire;
    if (selectedCategory === 'optionnels') return !doc.obligatoire;
    if (selectedCategory === 'uploades') return doc.uploaded;
    return true;
  });

  if (!codeInfo) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Code mouvement non trouvé</p>
        <button
          onClick={() => navigate('/dossiers/creer')}
          className="btn-primary mt-4"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Code {codeInfo.code} - {codeInfo.libelle}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{codeInfo.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-marine-100 text-marine-700 px-3 py-1 rounded-full">
              {documents.filter(d => d.uploaded).length}/{documents.length} documents
            </span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-8 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Barre de progression */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression du dossier</span>
              <span className="text-sm font-medium text-marine-600">
                {Math.round((documents.filter(d => d.uploaded).length / documents.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-marine-500 rounded-full transition-all duration-500"
                style={{ width: `${(documents.filter(d => d.uploaded).length / documents.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-marine-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des documents requis */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents requis</h2>
            
            <div className="space-y-3">
              {documentsFiltres.map((doc, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    doc.uploaded
                      ? 'border-green-200 bg-green-50'
                      : doc.obligatoire
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{doc.nom}</h3>
                        {doc.obligatoire && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Obligatoire
                          </span>
                        )}
                        {doc.uploaded && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Uploadé
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      
                      {doc.uploaded && doc.file && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">{doc.file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(doc.file.size / 1024).toFixed(2)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePreview(doc.file!)}
                            className="p-1 hover:bg-white rounded"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {!doc.uploaded && (
                      <button
                        type="button"
                        onClick={() => setShowUploadZone(true)}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <Upload size={16} />
                        Uploader
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone d'upload */}
          {showUploadZone && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploader des documents</h2>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center
                  transition-all duration-200 cursor-pointer
                  ${dragActive 
                    ? 'border-marine-500 bg-marine-50 scale-105' 
                    : 'border-gray-300 hover:border-marine-400 hover:bg-gray-50'
                  }
                `}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-marine-500' : 'text-gray-400'}`} />
                <p className="text-lg font-medium text-gray-700">
                  {dragActive ? 'Déposez les fichiers ici' : 'Cliquez ou glissez-déposez'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, JPG, PNG, DOC - Taille max: 10MB
                </p>
              </div>

              {/* Liste des fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Fichiers uploadés</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getFileIcon(file)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreview(file)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-xl shadow-card p-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Retour
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowUploadZone(!showUploadZone)}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus size={18} />
                Ajouter des fichiers
              </button>
              
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                Valider le dossier
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
            <p className="font-medium mb-1">Documents requis pour le code {codeInfo.code} :</p>
            <ul className="list-disc list-inside space-y-1">
              {codeInfo.documentsRequis.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>
        </form>
      </div>

      {/* Modal de prévisualisation */}
      {previewUrl && previewFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewFile(null);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setPreviewFile(null);
              }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
            {previewFile.type.startsWith('image/') ? (
              <img src={previewUrl} alt={previewFile.name} className="max-w-full max-h-[90vh] object-contain" />
            ) : (
              <iframe src={previewUrl} title={previewFile.name} className="w-full h-[80vh]" />
            )}
            <p className="text-white text-center mt-2">{previewFile.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocuments;