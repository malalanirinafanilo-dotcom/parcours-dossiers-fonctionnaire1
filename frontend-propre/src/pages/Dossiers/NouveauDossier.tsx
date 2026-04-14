// src/pages/Dossiers/NouveauDossier.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getFileIcon } from '../../utils/fileUtils';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Eye,
  Download,
  Image as ImageIcon,
  User,
  Calendar,
  Briefcase,
  DollarSign,
  GraduationCap,
  HelpCircle,
  Send
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { getCodeInfo, CODES_MOUVEMENT_COMPLET, CATEGORIES } from '../../utils/codesMouvementComplet';
import toast from 'react-hot-toast';

// ==================== TYPES ====================
interface FormData {
  // Informations générales
  titre: string;
  description: string;
  fonctionnaire_nom: string;
  fonctionnaire_prenom: string;
  fonctionnaire_matricule: string;
  
  // Champs dynamiques selon le code
  [key: string]: any;
}

interface DocumentRequis {
  nom: string;
  description: string;
  obligatoire: boolean;
  type: 'pdf' | 'image' | 'any';
  file?: File;
  uploaded: boolean;
}

// ==================== COMPOSANT PRINCIPAL ====================
const NouveauDossier: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // États
  const [step, setStep] = useState(1);
  const [categorie, setCategorie] = useState<string>('');
  const [codeSelectionne, setCodeSelectionne] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    titre: '',
    description: '',
    fonctionnaire_nom: user?.first_name || '',
    fonctionnaire_prenom: user?.last_name || '',
    fonctionnaire_matricule: '',
  });
  const [documentsRequis, setDocumentsRequis] = useState<DocumentRequis[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const codeInfo = codeSelectionne ? getCodeInfo(codeSelectionne) : null;

  // ==================== INITIALISATION DES DOCUMENTS REQUIS ====================
  useEffect(() => {
    if (codeInfo) {
      const docs: DocumentRequis[] = codeInfo.documentsRequis.map((doc: string) => ({
        nom: doc,
        description: getDocumentDescription(doc, codeInfo.code),
        obligatoire: true,
        type: getDocumentType(doc),
        uploaded: false
      }));
      setDocumentsRequis(docs);
    }
  }, [codeInfo]);

  // ==================== FONCTIONS UTILITAIRES ====================
  const getDocumentDescription = (doc: string, code: string): string => {
    const descriptions: Record<string, string> = {
      'demande_nomination.pdf': 'Demande de nomination signée',
      'diplomes.pdf': 'Copies certifiées des diplômes',
      'casier_judiciaire.pdf': 'Bulletin n°3 du casier judiciaire',
      'certificat_medical.pdf': 'Certificat de visite médicale',
      'photo_identite.jpg': "Photo d'identité récente",
      'arrete_nomination.pdf': "Arrêté de nomination",
      'cv.pdf': 'Curriculum Vitae',
      'contrat.pdf': 'Contrat de travail',
    };
    return descriptions[doc] || `Document requis: ${doc}`;
  };

  const getDocumentType = (doc: string): 'pdf' | 'image' | 'any' => {
    if (doc.includes('.jpg') || doc.includes('.jpeg') || doc.includes('.png')) {
      return 'image';
    }
    if (doc.includes('.pdf')) {
      return 'pdf';
    }
    return 'any';
  };

  // ==================== GESTION DES FICHIERS ====================
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
    
    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`"${file.name}" dépasse la limite de 10MB`);
      } else {
        validFiles.push(file);
        
        // Marquer les documents correspondants comme uploadés
        const docCorrespondant = documentsRequis.find(d => 
          file.name.toLowerCase().includes(d.nom.split('.')[0].toLowerCase())
        );
        
        if (docCorrespondant) {
          setDocumentsRequis(prev => 
            prev.map(d => 
              d.nom === docCorrespondant.nom ? { ...d, uploaded: true, file } : d
            )
          );
        }
      }
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // Mettre à jour les documents
    setDocumentsRequis(prev => 
      prev.map(d => 
        d.file === fileToRemove ? { ...d, uploaded: false, file: undefined } : d
      )
    );
    
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    if (file.name.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  // ==================== GESTIONNAIRE DE SOUMISSION ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codeSelectionne) {
      toast.error('Veuillez sélectionner un code mouvement');
      return;
    }

    // Vérifier les documents obligatoires
    const manquants = documentsRequis.filter(d => d.obligatoire && !d.uploaded);
    if (manquants.length > 0) {
      toast.error(`${manquants.length} document(s) obligatoire(s) manquant(s)`);
      return;
    }

    setLoading(true);
    
    try {
      // Créer le dossier
      const newDossier = await dossierService.createDossier({
        code_mouvement: codeSelectionne,
        titre: formData.titre || `${codeInfo?.libelle} - ${new Date().toLocaleDateString()}`,
        type_dossier: codeInfo?.categorie || 'AUTRE',
        fonctionnaire_nom: formData.fonctionnaire_nom,
        fonctionnaire_prenom: formData.fonctionnaire_prenom,
        fonctionnaire_matricule: formData.fonctionnaire_matricule || 'À compléter',
        donnees_specifiques: formData
      }, user?.email || '', uploadedFiles);
      
      if (newDossier) {
        toast.success('✅ Dossier créé avec succès !');
        // Rediriger vers la liste des dossiers
        setTimeout(() => navigate('/dossiers'), 2000);
      }
    } catch (error) {
      console.error('❌ Erreur création dossier:', error);
      toast.error('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDU DES ÉTAPES ====================
  
  // Étape 1: Choix de la catégorie
  const renderEtape1 = () => (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Étape 1/3 - Choisissez une catégorie
      </h2>
      <div className="space-y-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setCategorie(cat.id);
              setStep(2);
            }}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-marine-300 hover:bg-gray-50 transition-all"
          >
            <h3 className="font-bold text-marine-700">{cat.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{cat.codes.length} codes disponibles</p>
          </button>
        ))}
      </div>
    </div>
  );

  // Étape 2: Choix du code mouvement
  const renderEtape2 = () => {
    const codesDisponibles = CATEGORIES.find(c => c.id === categorie)?.codes || [];
    
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Étape 2/3 - Choisissez le type de dossier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
          {codesDisponibles.map(code => {
            const info = getCodeInfo(code);
            if (!info) return null;
            
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setCodeSelectionne(code);
                  setStep(3);
                }}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-marine-300 hover:bg-gray-50 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-marine-600">{info.code}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {info.delaiTraitement} jours
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">{info.libelle}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{info.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Étape 3: Formulaire et documents
  const renderEtape3 = () => {
    if (!codeInfo) return null;
    
    return (
      <div className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Étape 3/3 - Informations du dossier
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">Titre de la demande *</label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="input"
                placeholder={codeInfo.libelle}
                required
              />
            </div>
            
            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Détails complémentaires..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nom</label>
                <input
                  type="text"
                  value={formData.fonctionnaire_nom}
                  onChange={(e) => setFormData({ ...formData, fonctionnaire_nom: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Prénom</label>
                <input
                  type="text"
                  value={formData.fonctionnaire_prenom}
                  onChange={(e) => setFormData({ ...formData, fonctionnaire_prenom: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="label">Matricule</label>
              <input
                type="text"
                value={formData.fonctionnaire_matricule}
                onChange={(e) => setFormData({ ...formData, fonctionnaire_matricule: e.target.value })}
                className="input"
                placeholder="Ex: MAT001"
              />
            </div>
          </div>
        </div>

        {/* Documents requis */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Documents requis ({documentsRequis.filter(d => d.uploaded).length}/{documentsRequis.length})
          </h2>
          
          {/* Liste des documents requis */}
          <div className="space-y-3 mb-6">
            {documentsRequis.map((doc, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 ${
                  doc.uploaded
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {doc.uploaded ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.nom}</p>
                    <p className="text-xs text-gray-600">{doc.description}</p>
                  </div>
                  {doc.uploaded && doc.file && (
                    <button
                      onClick={() => handlePreview(doc.file!)}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Zone d'upload */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
              transition-all duration-200
              ${dragActive 
                ? 'border-marine-500 bg-marine-50' 
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
            <Upload className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-marine-500' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700">
              {dragActive ? 'Déposez les fichiers' : 'Cliquez ou glissez-déposez'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, PNG - Max 10MB
            </p>
          </div>

          {/* Liste des fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Fichiers uploadés</h3>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  {getFileIcon(file)}
                  <div className="flex-1 text-sm truncate">{file.name}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreview(file)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Résumé */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Code:</span> {codeInfo.code} - {codeInfo.libelle}</p>
            <p><span className="font-medium">Documents requis:</span> {documentsRequis.length}</p>
            <p><span className="font-medium">Documents uploadés:</span> {documentsRequis.filter(d => d.uploaded).length}</p>
            <p><span className="font-medium">Délai de traitement estimé:</span> {codeInfo.delaiTraitement} jours</p>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDU PRINCIPAL ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/dossiers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau dossier</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-marine-500' : 'bg-gray-300'}`} />
            <span className={step >= 1 ? 'text-gray-900' : 'text-gray-500'}>Catégorie</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-marine-500' : 'bg-gray-300'}`} />
            <span className={step >= 2 ? 'text-gray-900' : 'text-gray-500'}>Code</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-marine-500' : 'bg-gray-300'}`} />
            <span className={step >= 3 ? 'text-gray-900' : 'text-gray-500'}>Documents</span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && renderEtape1()}
          {step === 2 && renderEtape2()}
          {step === 3 && renderEtape3()}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-xl shadow-card p-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Précédent
              </button>
            )}
            
            <div className="flex-1"></div>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-primary flex items-center gap-2"
                disabled={step === 1 && !categorie}
              >
                Suivant
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Créer le dossier</span>
                  </>
                )}
              </button>
            )}
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
              <img
                src={previewUrl}
                alt={previewFile.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <iframe
                src={previewUrl}
                title={previewFile.name}
                className="w-full h-[80vh] rounded-lg"
              />
            )}
            <p className="text-white text-center mt-2">{previewFile.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NouveauDossier;