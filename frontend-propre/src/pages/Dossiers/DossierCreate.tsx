import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  FileWarning,
  HelpCircle,
  User,
  Calendar,
  Briefcase,
  DollarSign,
  GraduationCap,
  Award,
  FileCheck,
  Paperclip,
  Mail,
  MapPin,
  Building2,
  BookOpen,
  ScrollText,
  CreditCard,
  Receipt
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { notificationService } from '../../services/notificationService';
import { CODES_MOUVEMENT, CATEGORIES, getDocumentsRequis } from '../../utils/codesMouvement';
import { CodeMouvement } from '../../types';
import { ValidationService } from '../../services/validationService';
import toast from 'react-hot-toast';

const DossierCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // État pour le mode de création
  const [mode, setMode] = useState<'complet' | 'upload'>('complet');
  
  // État pour l'étape
  const [step, setStep] = useState(1);
  
  // État pour le type de dossier
  const [typeDossier, setTypeDossier] = useState<string>('contrat');
  
  // État pour les fichiers uploadés
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // État pour les données du formulaire
  const [formData, setFormData] = useState({
    // Informations générales
    titre: '',
    description: '',
    fonctionnaire_nom: user?.first_name || '',
    fonctionnaire_prenom: user?.last_name || '',
    fonctionnaire_matricule: '',
    
    // Contrat
    numeroContrat: '',
    dateDebut: '',
    dateFin: '',
    poste: '',
    grade: '',
    categorie: '',
    indice: '',
    salaireBase: '',
    primes: '',
    avantages: '',
    lieuAffectation: '',
    signatures: {
      interesse: false,
      dren: false,
      men: false,
      fop: false
    },
    commentaire: '',
    
    // Avenant
    typeModification: 'salaire',
    ancienPoste: '',
    nouveauPoste: '',
    ancienSalaire: '',
    nouveauSalaire: '',
    motifAvenant: '',
    dateAvenant: '',
    
    // BIN
    numeroBIN: '',
    emailBIN: '',
    statutBIN: '',
    observationsBIN: '',
    
    // Diplôme
    typeDiplome: '',
    specialite: '',
    etablissement: '',
    pays: '',
    anneeObtention: '',
    numeroCertificat: '',
    statutDiplome: '',
    
    // Équivalence FOP
    organismeEquivalence: '',
    numeroReference: '',
    dateDelivrance: '',
    statutEquivalence: '',
    
    // Certificats
    typeCertificat: 'travail',
    organismeCertificat: '',
    dateDelivranceCertificat: '',
    dateExpirationCertificat: '',
    statutCertificat: '',
    
    // Documents financiers
    rib: '',
    banque: '',
    montantTotal: '',
    statutFinancier: '',
    
    // Annexes
    typeDocument: 'lettre',
    descriptionAnnexe: '',
    statutAnnexe: '',
    
    // Option upload
    dossierExistant: '',
    descriptionUpload: ''
  });

  const [selectedCode, setSelectedCode] = useState<CodeMouvement>('02');
  const [selectedCategory, setSelectedCategory] = useState<string>('CREATION');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  
  // État pour l'IA prédictive
  const [iaScore, setIaScore] = useState<number>(0);
  const [iaStatus, setIaStatus] = useState<'conforme' | 'risque' | 'bloque'>('conforme');
  const [iaAnomalies, setIaAnomalies] = useState<string[]>([]);
  const [iaRecommandations, setIaRecommandations] = useState<string[]>([]);
  const [iaDelai, setIaDelai] = useState<number>(5);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    missing: string[];
    found: Array<{ required: string; file: File }>;
    suggestions: Array<{ required: string; possibleFiles: string[] }>;
  } | null>(null);

  // Types de dossiers disponibles
  const typesDossiers = [
    { value: 'contrat', label: 'Contrat', icon: '📄' },
    { value: 'avenant', label: 'Avenant', icon: '📝' },
    { value: 'bin', label: 'BIN', icon: '📦' },
    { value: 'diplome', label: 'Diplôme Certifié', icon: '🎓' },
    { value: 'equivalence', label: 'Équivalence FOP', icon: '🔄' },
    { value: 'certificat', label: 'Certificat professionnel', icon: '📜' },
    { value: 'financier', label: 'Documents financiers', icon: '💰' },
    { value: 'annexe', label: 'Annexes & correspondances', icon: '📎' }
  ];

  // Simulation de l'analyse IA
  useEffect(() => {
    const analyserFormulaire = () => {
      let score = 0;
      const anomalies: string[] = [];
      const recommandations: string[] = [];

      if (mode === 'complet') {
        switch (typeDossier) {
          case 'contrat':
            if (!formData.numeroContrat) {
              anomalies.push('Numéro de contrat manquant');
              score += 10;
            }
            if (!formData.dateDebut) {
              anomalies.push('Date de début manquante');
              score += 5;
            }
            if (!formData.dateFin) {
              anomalies.push('Date de fin manquante');
              score += 5;
            }
            if (!formData.poste) {
              anomalies.push('Poste manquant');
              score += 10;
            }
            if (!formData.grade) {
              anomalies.push('Grade manquant');
              score += 5;
            }
            if (!formData.salaireBase) {
              anomalies.push('Salaire de base manquant');
              score += 15;
            }
            break;

          case 'avenant':
            if (!formData.dateAvenant) {
              anomalies.push("Date d'avenant manquante");
              score += 10;
            }
            if (!formData.motifAvenant) {
              anomalies.push('Motif manquant');
              score += 15;
            }
            break;

          case 'diplome':
            if (!formData.typeDiplome) {
              anomalies.push('Type de diplôme manquant');
              score += 10;
            }
            if (!formData.etablissement) {
              anomalies.push('Établissement manquant');
              score += 10;
            }
            break;

          case 'financier':
            if (!formData.rib) {
              anomalies.push('RIB manquant');
              score += 15;
            }
            if (!formData.banque) {
              anomalies.push('Banque manquante');
              score += 10;
            }
            break;
        }
      }

      if (score < 30) setIaStatus('conforme');
      else if (score < 70) setIaStatus('risque');
      else setIaStatus('bloque');

      setIaScore(score);
      setIaAnomalies(anomalies);
      setIaRecommandations([
        'Vérifiez que tous les documents sont complets',
        'Assurez-vous que les signatures sont apposées',
        'Les délais de traitement peuvent varier selon le type de dossier'
      ]);
      setIaDelai(Math.max(5, Math.min(15, 5 + Math.floor(score / 10))));
    };

    analyserFormulaire();
  }, [formData, typeDossier, mode]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success('Dossier créé avec succès !');
    setTimeout(() => navigate('/documents'), 2000);
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

  const renderContratFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations du contrat</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Numéro de contrat *</label>
          <input
            type="text"
            value={formData.numeroContrat}
            onChange={(e) => setFormData({ ...formData, numeroContrat: e.target.value })}
            className="input"
            placeholder="CON-2024-001"
          />
        </div>
        <div>
          <label className="label">Date début *</label>
          <input
            type="date"
            value={formData.dateDebut}
            onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Date fin *</label>
          <input
            type="date"
            value={formData.dateFin}
            onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Poste *</label>
          <input
            type="text"
            value={formData.poste}
            onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
            className="input"
            placeholder="Inspecteur"
          />
        </div>
        <div>
          <label className="label">Grade</label>
          <input
            type="text"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            className="input"
            placeholder="A1"
          />
        </div>
        <div>
          <label className="label">Catégorie</label>
          <input
            type="text"
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
            className="input"
            placeholder="Catégorie A"
          />
        </div>
        <div>
          <label className="label">Indice</label>
          <input
            type="text"
            value={formData.indice}
            onChange={(e) => setFormData({ ...formData, indice: e.target.value })}
            className="input"
            placeholder="300"
          />
        </div>
        <div>
          <label className="label">Salaire de base *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="number"
              value={formData.salaireBase}
              onChange={(e) => setFormData({ ...formData, salaireBase: e.target.value })}
              className="input pl-10"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="label">Primes</label>
          <input
            type="text"
            value={formData.primes}
            onChange={(e) => setFormData({ ...formData, primes: e.target.value })}
            className="input"
            placeholder="Transport, logement..."
          />
        </div>
        <div>
          <label className="label">Avantages</label>
          <input
            type="text"
            value={formData.avantages}
            onChange={(e) => setFormData({ ...formData, avantages: e.target.value })}
            className="input"
            placeholder="Véhicule, téléphone..."
          />
        </div>
        <div className="col-span-2">
          <label className="label">Lieu d'affectation</label>
          <input
            type="text"
            value={formData.lieuAffectation}
            onChange={(e) => setFormData({ ...formData, lieuAffectation: e.target.value })}
            className="input"
            placeholder="DREN Analamanga"
          />
        </div>
      </div>

      <div>
        <label className="label">Signatures</label>
        <div className="grid grid-cols-4 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.signatures.interesse}
              onChange={(e) => setFormData({
                ...formData,
                signatures: { ...formData.signatures, interesse: e.target.checked }
              })}
              className="w-4 h-4 text-marine-500 rounded"
            />
            <span>Intéressé</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.signatures.dren}
              onChange={(e) => setFormData({
                ...formData,
                signatures: { ...formData.signatures, dren: e.target.checked }
              })}
              className="w-4 h-4 text-marine-500 rounded"
            />
            <span>DREN</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.signatures.men}
              onChange={(e) => setFormData({
                ...formData,
                signatures: { ...formData.signatures, men: e.target.checked }
              })}
              className="w-4 h-4 text-marine-500 rounded"
            />
            <span>MEN</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.signatures.fop}
              onChange={(e) => setFormData({
                ...formData,
                signatures: { ...formData.signatures, fop: e.target.checked }
              })}
              className="w-4 h-4 text-marine-500 rounded"
            />
            <span>FOP</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAvenantFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations de l'avenant</h3>
      <div>
        <label className="label">Type de modification *</label>
        <select
          value={formData.typeModification}
          onChange={(e) => setFormData({ ...formData, typeModification: e.target.value })}
          className="input"
        >
          <option value="salaire">Salaire</option>
          <option value="poste">Poste</option>
          <option value="duree">Durée</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {formData.typeModification === 'poste' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ancien poste</label>
            <input
              type="text"
              value={formData.ancienPoste}
              onChange={(e) => setFormData({ ...formData, ancienPoste: e.target.value })}
              className="input"
              placeholder="Poste actuel"
            />
          </div>
          <div>
            <label className="label">Nouveau poste *</label>
            <input
              type="text"
              value={formData.nouveauPoste}
              onChange={(e) => setFormData({ ...formData, nouveauPoste: e.target.value })}
              className="input"
              placeholder="Nouveau poste"
            />
          </div>
        </div>
      )}

      {formData.typeModification === 'salaire' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ancien salaire</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                value={formData.ancienSalaire}
                onChange={(e) => setFormData({ ...formData, ancienSalaire: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">Nouveau salaire *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                value={formData.nouveauSalaire}
                onChange={(e) => setFormData({ ...formData, nouveauSalaire: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="label">Motif *</label>
        <textarea
          value={formData.motifAvenant}
          onChange={(e) => setFormData({ ...formData, motifAvenant: e.target.value })}
          className="input"
          rows={3}
          placeholder="Raison de l'avenant"
        />
      </div>

      <div>
        <label className="label">Date avenant *</label>
        <input
          type="date"
          value={formData.dateAvenant}
          onChange={(e) => setFormData({ ...formData, dateAvenant: e.target.value })}
          className="input"
        />
      </div>
    </div>
  );

  const renderBINFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations BIN</h3>
      <div>
        <label className="label">Numéro BIN *</label>
        <input
          type="text"
          value={formData.numeroBIN}
          onChange={(e) => setFormData({ ...formData, numeroBIN: e.target.value })}
          className="input"
          placeholder="BIN-2024-001"
        />
      </div>
      <div>
        <label className="label">Email associé *</label>
        <input
          type="email"
          value={formData.emailBIN}
          onChange={(e) => setFormData({ ...formData, emailBIN: e.target.value })}
          className="input"
          placeholder="exemple@education.mg"
        />
      </div>
      <div>
        <label className="label">Statut BIN</label>
        <select
          value={formData.statutBIN}
          onChange={(e) => setFormData({ ...formData, statutBIN: e.target.value })}
          className="input"
        >
          <option value="">Sélectionner</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
        </select>
      </div>
      <div>
        <label className="label">Observations</label>
        <textarea
          value={formData.observationsBIN}
          onChange={(e) => setFormData({ ...formData, observationsBIN: e.target.value })}
          className="input"
          rows={3}
          placeholder="Observations..."
        />
      </div>
    </div>
  );

  const renderDiplomeFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations du diplôme</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type de diplôme *</label>
          <input
            type="text"
            value={formData.typeDiplome}
            onChange={(e) => setFormData({ ...formData, typeDiplome: e.target.value })}
            className="input"
            placeholder="Master, Licence..."
          />
        </div>
        <div>
          <label className="label">Spécialité</label>
          <input
            type="text"
            value={formData.specialite}
            onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
            className="input"
            placeholder="Informatique, Gestion..."
          />
        </div>
        <div>
          <label className="label">Établissement *</label>
          <input
            type="text"
            value={formData.etablissement}
            onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
            className="input"
            placeholder="Université d'Antananarivo"
          />
        </div>
        <div>
          <label className="label">Pays</label>
          <input
            type="text"
            value={formData.pays}
            onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
            className="input"
            placeholder="Madagascar"
          />
        </div>
        <div>
          <label className="label">Année obtention</label>
          <input
            type="number"
            value={formData.anneeObtention}
            onChange={(e) => setFormData({ ...formData, anneeObtention: e.target.value })}
            className="input"
            placeholder="2024"
          />
        </div>
        <div>
          <label className="label">Numéro certificat</label>
          <input
            type="text"
            value={formData.numeroCertificat}
            onChange={(e) => setFormData({ ...formData, numeroCertificat: e.target.value })}
            className="input"
            placeholder="DIP-2024-001"
          />
        </div>
        <div>
          <label className="label">Statut diplôme</label>
          <select
            value={formData.statutDiplome}
            onChange={(e) => setFormData({ ...formData, statutDiplome: e.target.value })}
            className="input"
          >
            <option value="">Sélectionner</option>
            <option value="valide">Validé</option>
            <option value="en_attente">En attente</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderEquivalenceFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations d'équivalence FOP</h3>
      <div>
        <label className="label">Organisme délivrance *</label>
        <input
          type="text"
          value={formData.organismeEquivalence}
          onChange={(e) => setFormData({ ...formData, organismeEquivalence: e.target.value })}
          className="input"
          placeholder="FOP Madagascar"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Numéro référence *</label>
          <input
            type="text"
            value={formData.numeroReference}
            onChange={(e) => setFormData({ ...formData, numeroReference: e.target.value })}
            className="input"
            placeholder="EQ-2024-001"
          />
        </div>
        <div>
          <label className="label">Date délivrance *</label>
          <input
            type="date"
            value={formData.dateDelivrance}
            onChange={(e) => setFormData({ ...formData, dateDelivrance: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Statut équivalence</label>
          <select
            value={formData.statutEquivalence}
            onChange={(e) => setFormData({ ...formData, statutEquivalence: e.target.value })}
            className="input"
          >
            <option value="">Sélectionner</option>
            <option value="valide">Validé</option>
            <option value="en_cours">En cours</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCertificatFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations du certificat</h3>
      <div>
        <label className="label">Type certificat *</label>
        <select
          value={formData.typeCertificat}
          onChange={(e) => setFormData({ ...formData, typeCertificat: e.target.value })}
          className="input"
        >
          <option value="travail">Certificat de travail</option>
          <option value="performance">Certificat de performance</option>
          <option value="moralite">Certificat de moralité</option>
          <option value="medical">Certificat médical</option>
        </select>
      </div>
      <div>
        <label className="label">Organisme *</label>
        <input
          type="text"
          value={formData.organismeCertificat}
          onChange={(e) => setFormData({ ...formData, organismeCertificat: e.target.value })}
          className="input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date délivrance *</label>
          <input
            type="date"
            value={formData.dateDelivranceCertificat}
            onChange={(e) => setFormData({ ...formData, dateDelivranceCertificat: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Date expiration</label>
          <input
            type="date"
            value={formData.dateExpirationCertificat}
            onChange={(e) => setFormData({ ...formData, dateExpirationCertificat: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Statut certificat</label>
          <select
            value={formData.statutCertificat}
            onChange={(e) => setFormData({ ...formData, statutCertificat: e.target.value })}
            className="input"
          >
            <option value="">Sélectionner</option>
            <option value="valide">Valide</option>
            <option value="expire">Expiré</option>
            <option value="en_attente">En attente</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFinancierFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations financières</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">RIB *</label>
          <input
            type="text"
            value={formData.rib}
            onChange={(e) => setFormData({ ...formData, rib: e.target.value })}
            className="input"
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          />
        </div>
        <div>
          <label className="label">Banque *</label>
          <input
            type="text"
            value={formData.banque}
            onChange={(e) => setFormData({ ...formData, banque: e.target.value })}
            className="input"
            placeholder="BNI Madagascar"
          />
        </div>
        <div>
          <label className="label">Montant total</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="number"
              value={formData.montantTotal}
              onChange={(e) => setFormData({ ...formData, montantTotal: e.target.value })}
              className="input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="label">Statut financier</label>
          <select
            value={formData.statutFinancier}
            onChange={(e) => setFormData({ ...formData, statutFinancier: e.target.value })}
            className="input"
          >
            <option value="">Sélectionner</option>
            <option value="valide">Validé</option>
            <option value="en_attente">En attente</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAnnexeFields = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Informations de l'annexe</h3>
      <div>
        <label className="label">Type document *</label>
        <select
          value={formData.typeDocument}
          onChange={(e) => setFormData({ ...formData, typeDocument: e.target.value })}
          className="input"
        >
          <option value="lettre">Lettre de motivation</option>
          <option value="correspondance">Correspondance</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      <div>
        <label className="label">Description *</label>
        <textarea
          value={formData.descriptionAnnexe}
          onChange={(e) => setFormData({ ...formData, descriptionAnnexe: e.target.value })}
          className="input"
          rows={3}
          placeholder="Description du document"
        />
      </div>
      <div>
        <label className="label">Statut annexe</label>
        <select
          value={formData.statutAnnexe}
          onChange={(e) => setFormData({ ...formData, statutAnnexe: e.target.value })}
          className="input"
        >
          <option value="">Sélectionner</option>
          <option value="joint">Joint</option>
          <option value="a_joint">À joindre</option>
          <option value="non_requis">Non requis</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dossiers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-marine-500' : 'bg-gray-300'}`} />
            <span className={step >= 1 ? 'text-gray-900' : 'text-gray-500'}>Type</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-marine-500' : 'bg-gray-300'}`} />
            <span className={step >= 2 ? 'text-gray-900' : 'text-gray-500'}>Infos</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-marine-500' : 'bg-gray-300'}`} />
            <span className={step >= 3 ? 'text-gray-900' : 'text-gray-500'}>Documents</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* A. Choix du mode de création */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode de création</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="complet"
                  checked={mode === 'complet'}
                  onChange={() => setMode('complet')}
                  className="w-4 h-4 text-marine-500"
                />
                <span>Création complète du dossier</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="upload"
                  checked={mode === 'upload'}
                  onChange={() => setMode('upload')}
                  className="w-4 h-4 text-marine-500"
                />
                <span>Upload de pièces jointes</span>
              </label>
            </div>
          </div>

          {/* Étape 1: Choix du type (pour mode complet) */}
          {step === 1 && mode === 'complet' && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de dossier</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {typesDossiers.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setTypeDossier(type.value);
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      typeDossier === type.value
                        ? 'border-marine-500 bg-marine-50'
                        : 'border-gray-200 hover:border-marine-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{type.icon}</span>
                    <h3 className="font-medium text-gray-900 text-sm">{type.label}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 2: Informations générales et spécifiques (mode complet) */}
          {step === 2 && mode === 'complet' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Titre de la demande *</label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className="input"
                      placeholder="Titre de la demande"
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
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Champs dynamiques selon le type */}
              <div className="bg-white rounded-xl shadow-card p-6">
                {typeDossier === 'contrat' && renderContratFields()}
                {typeDossier === 'avenant' && renderAvenantFields()}
                {typeDossier === 'bin' && renderBINFields()}
                {typeDossier === 'diplome' && renderDiplomeFields()}
                {typeDossier === 'equivalence' && renderEquivalenceFields()}
                {typeDossier === 'certificat' && renderCertificatFields()}
                {typeDossier === 'financier' && renderFinancierFields()}
                {typeDossier === 'annexe' && renderAnnexeFields()}
              </div>
            </div>
          )}

          {/* Option 2 – Upload pièces jointes */}
          {mode === 'upload' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload de pièces jointes</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Dossier existant *</label>
                    <select
                      value={formData.dossierExistant}
                      onChange={(e) => setFormData({ ...formData, dossierExistant: e.target.value })}
                      className="input"
                    >
                      <option value="">Sélectionner un dossier</option>
                      <option value="DOS-2024-001">DOS-2024-001 - Rakoto Jean</option>
                      <option value="DOS-2024-002">DOS-2024-002 - Rabe Paul</option>
                      <option value="DOS-2024-003">DOS-2024-003 - Randria Faly</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Description / commentaire</label>
                    <textarea
                      value={formData.descriptionUpload}
                      onChange={(e) => setFormData({ ...formData, descriptionUpload: e.target.value })}
                      className="input"
                      rows={3}
                      placeholder="Informations sur les fichiers joints..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Documents (pour tous les modes) */}
          {(step === 3 || mode === 'upload') && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pièces jointes</h2>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Formats acceptés : PDF, JPG, PNG (max 10MB)
                    </span>
                  </p>
                </div>

                {/* Zone d'upload */}
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
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-marine-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium text-gray-700">
                    {dragActive ? 'Déposez les fichiers ici' : 'Cliquez ou glissez-déposez'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, JPG, PNG - Taille max: 10MB
                  </p>
                </div>

                {/* Liste des fichiers uploadés */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Fichiers ajoutés ({uploadedFiles.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          {getFileIcon(file)}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handlePreview(file)}
                              className="p-1.5 hover:bg-white rounded-lg"
                              title="Aperçu"
                            >
                              <Eye size={16} className="text-gray-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const url = URL.createObjectURL(file);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = file.name;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="p-1.5 hover:bg-white rounded-lg"
                              title="Télécharger"
                            >
                              <Download size={16} className="text-gray-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1.5 hover:bg-red-50 rounded-lg"
                              title="Supprimer"
                            >
                              <X size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E. IA Prédictive */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-marine-500" />
              <h2 className="text-lg font-semibold text-gray-900">Analyse prédictive</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Score de risque</span>
                    <span className="text-lg font-bold text-marine-600">{iaScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        iaStatus === 'conforme' ? 'bg-success-500' :
                        iaStatus === 'risque' ? 'bg-warning-500' : 'bg-error-500'
                      }`}
                      style={{ width: `${iaScore}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  iaStatus === 'conforme' ? 'bg-success-50' :
                  iaStatus === 'risque' ? 'bg-warning-50' : 'bg-error-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {iaStatus === 'conforme' && <CheckCircle2 className="w-5 h-5 text-success-500" />}
                    {iaStatus === 'risque' && <AlertCircle className="w-5 h-5 text-warning-500" />}
                    {iaStatus === 'bloque' && <XCircle className="w-5 h-5 text-error-500" />}
                    <span className={`font-semibold ${
                      iaStatus === 'conforme' ? 'text-success-700' :
                      iaStatus === 'risque' ? 'text-warning-700' : 'text-error-700'
                    }`}>
                      Statut prédictif : {iaStatus === 'conforme' && '✅ Conforme'}
                      {iaStatus === 'risque' && '⚠️ À risque'}
                      {iaStatus === 'bloque' && '❌ Bloqué'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Délai de validation estimé : <strong>{iaDelai} jours</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {iaAnomalies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-error-500" />
                      Anomalies détectées
                    </h3>
                    <ul className="space-y-2">
                      {iaAnomalies.map((anomalie, index) => (
                        <li key={index} className="text-sm text-error-600 bg-error-50 p-2 rounded">
                          {anomalie}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recommandations</h3>
                  <ul className="space-y-2">
                    {iaRecommandations.map((rec, index) => (
                      <li key={index} className="text-sm text-marine-600 bg-marine-50 p-2 rounded">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-xl shadow-card p-4">
            {mode === 'complet' && step > 1 && (
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
            {mode === 'complet' && step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-primary flex items-center gap-2"
              >
                Suivant
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                Soumettre
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
            <img
              src={previewUrl}
              alt={previewFile.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-2">{previewFile.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DossierCreate;