// src/pages/Dossiers/NouveauDossier.tsx - Version modernisée complète
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ChevronLeft, FileText, AlertCircle, CheckCircle2,
  X, Upload, Eye, Send, Trash2, ImageIcon, User, Calendar, Briefcase, Database, Hash,
  Check, AlertTriangle, Info, Loader, Save, FileWarning
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { getCodeInfo, getCodesByCategorie, CATEGORIES, CodeMouvementInfo } from '../../utils/codesMouvementComplet';
import toast from 'react-hot-toast';

const NouveauDossier: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // États - Étape
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // États - Sélection
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<CodeMouvementInfo | null>(null);
  const [codesDisponibles, setCodesDisponibles] = useState<CodeMouvementInfo[]>([]);
  
  // États - Formulaire général
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    motif: '',
  });
  
  // États - Champs spécifiques
  const [specificFields, setSpecificFields] = useState<Record<string, any>>({});
  
  // États - Fonctionnaire
  const [fonctionnaireData, setFonctionnaireData] = useState({
    nom: user?.first_name || '',
    prenom: user?.last_name || '',
    matricule: '',
    email: user?.email || '',
    telephone: user?.phone_number || '',
  });
  
  // États - Documents
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [documentsStatus, setDocumentsStatus] = useState<{ [key: string]: boolean }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedCategorie) {
      const codes = getCodesByCategorie(selectedCategorie);
      setCodesDisponibles(codes);
    }
  }, [selectedCategorie]);

  useEffect(() => {
    if (selectedCode) {
      const initialFields: Record<string, any> = {};
      selectedCode.champs.forEach(champ => {
        initialFields[champ.nom] = '';
      });
      setSpecificFields(initialFields);
      
      const status: { [key: string]: boolean } = {};
      selectedCode.documentsObligatoires.forEach(doc => { status[doc] = false; });
      selectedCode.documentsFacultatifs.forEach(doc => { status[doc] = false; });
      setDocumentsStatus(status);
    }
  }, [selectedCode]);

  useEffect(() => {
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0].substring(0, 8);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const generatedMatricule = `MAT-${year}${month}-${emailPrefix.toUpperCase()}`;
      setFonctionnaireData(prev => ({ ...prev, matricule: generatedMatricule }));
    }
  }, [user]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" dépasse 10MB`);
      } else {
        validFiles.push(file);
        const fileName = file.name.toLowerCase();
        for (const doc of (selectedCode?.documentsObligatoires || [])) {
          const docName = doc.replace('.pdf', '').replace('.doc', '').replace('.docx', '').replace('.jpg', '').replace('.jpeg', '').replace('.png', '').toLowerCase();
          if (fileName.includes(docName)) {
            setDocumentsStatus(prev => ({ ...prev, [doc]: true }));
          }
        }
        for (const doc of (selectedCode?.documentsFacultatifs || [])) {
          const docName = doc.replace('.pdf', '').replace('.doc', '').replace('.docx', '').replace('.jpg', '').replace('.jpeg', '').replace('.png', '').toLowerCase();
          if (fileName.includes(docName)) {
            setDocumentsStatus(prev => ({ ...prev, [doc]: true }));
          }
        }
      }
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length > 0) toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Fichier supprimé');
  };

  const handlePreview = (file: File) => {
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
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-purple-500" />;
    if (file.name.toLowerCase().endsWith('.pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) 
      return <FileText className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const nextStep = () => {
    if (step === 1 && !selectedCategorie) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }
    if (step === 2 && !selectedCode) {
      toast.error('Veuillez sélectionner un type de dossier');
      return;
    }
    if (step === 3 && !formData.titre) {
      toast.error('Veuillez saisir un titre');
      return;
    }
    if (step === 3 && (!fonctionnaireData.nom || !fonctionnaireData.prenom)) {
      toast.error('Veuillez saisir le nom et prénom du fonctionnaire');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    const missingDocs = (selectedCode?.documentsObligatoires || []).filter(doc => !documentsStatus[doc]);
    if (missingDocs.length > 0) {
      toast.error(`Documents obligatoires manquants: ${missingDocs.length} sur ${selectedCode?.documentsObligatoires.length}`);
      return;
    }

    setLoading(true);
    try {
      const completeData = {
        titre: formData.titre,
        description: formData.description,
        motif: formData.motif,
        code_mouvement: selectedCode?.code,
        type_dossier: selectedCode?.categorie || 'AUTRE',
        fonctionnaire_nom: fonctionnaireData.nom,
        fonctionnaire_prenom: fonctionnaireData.prenom,
        fonctionnaire_matricule: fonctionnaireData.matricule,
        fonctionnaire_email: fonctionnaireData.email,
        fonctionnaire_telephone: fonctionnaireData.telephone,
        ...specificFields
      };
      
      await dossierService.createDossier(completeData, user?.email || '', uploadedFiles);
      toast.success('✅ Dossier créé avec succès !');
      setTimeout(() => navigate('/dossiers'), 2000);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  const renderSpecificFields = () => {
    if (!selectedCode || !selectedCode.champs.length) return null;
    
    return (
      <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-800">
        <h3 className="text-md font-semibold text-dark-900 dark:text-dark-100 mb-4">Informations spécifiques</h3>
        <div className="space-y-4">
          {selectedCode.champs.map((champ, idx) => {
            const value = specificFields[champ.nom] || '';
            
            switch (champ.type) {
              case 'select':
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                      {champ.label} {champ.obligatoire && <span className="text-rose-500">*</span>}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.value })}
                      className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                    >
                      <option value="">Sélectionner...</option>
                      {champ.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                );
              
              case 'multiselect':
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                      {champ.label} {champ.obligatoire && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="space-y-2 rounded-xl border border-dark-200 p-3 dark:border-dark-800">
                      {champ.options?.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={Array.isArray(value) && value.includes(opt)}
                            onChange={(e) => {
                              const current = Array.isArray(value) ? value : [];
                              if (e.target.checked) {
                                setSpecificFields({ ...specificFields, [champ.nom]: [...current, opt] });
                              } else {
                                setSpecificFields({ ...specificFields, [champ.nom]: current.filter(v => v !== opt) });
                              }
                            }}
                            className="h-4 w-4 rounded border-dark-300 text-accent-600 focus:ring-accent-500"
                          />
                          <span className="text-sm text-dark-700 dark:text-dark-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              
              case 'textarea':
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                      {champ.label} {champ.obligatoire && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      value={value}
                      onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.value })}
                      className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                      rows={3}
                      readOnly={champ.readOnly}
                    />
                  </div>
                );
              
              case 'checkbox':
                return (
                  <div key={idx}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.checked })}
                        className="h-4 w-4 rounded border-dark-300 text-accent-600 focus:ring-accent-500"
                      />
                      <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{champ.label}</span>
                    </label>
                  </div>
                );
              
              default:
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                      {champ.label} {champ.obligatoire && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type={champ.type}
                      value={value}
                      onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.value })}
                      className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                      readOnly={champ.readOnly}
                    />
                  </div>
                );
            }
          })}
        </div>
      </div>
    );
  };

  const allDocuments = [
    ...(selectedCode?.documentsObligatoires || []).map(doc => ({ name: doc, required: true })),
    ...(selectedCode?.documentsFacultatifs || []).map(doc => ({ name: doc, required: false })),
  ];

  // ÉTAPE 1: CATÉGORIE
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Nouveau dossier</h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">Étape 1 sur 4 - Choisissez une catégorie</p>
        </div>

        <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <h2 className="mb-4 text-lg font-semibold text-dark-900 dark:text-dark-100">Choisissez la catégorie</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorie(cat.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedCategorie === cat.id
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30'
                    : 'border-dark-200 hover:border-accent-300 dark:border-dark-800'
                }`}
              >
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">{cat.label}</h3>
                <p className="mt-1 text-sm text-dark-500">{cat.codes.length} types disponibles</p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-700"
            >
              Suivant <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE 2: CODE MOUVEMENT
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Nouveau dossier</h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">Étape 2 sur 4 - Choisissez le type de dossier</p>
        </div>

        <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center gap-2">
            <button onClick={prevStep} className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Choisissez le type de dossier</h2>
          </div>
          
          <div className="grid max-h-[500px] gap-4 overflow-y-auto sm:grid-cols-2">
            {codesDisponibles.map(code => (
              <button
                key={code.code}
                onClick={() => setSelectedCode(code)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedCode?.code === code.code
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30'
                    : 'border-dark-200 hover:border-accent-300 dark:border-dark-800'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-accent-600">{code.code}</span>
                  <span className="rounded-full bg-dark-100 px-2 py-0.5 text-xs text-dark-600 dark:bg-dark-800 dark:text-dark-400">
                    {code.delaiTraitement} jours
                  </span>
                </div>
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">{code.libelle}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-dark-500">{code.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-rose-500">📄 {code.documentsObligatoires.length} obligatoire(s)</span>
                  <span className="text-xs text-dark-500">📎 {code.documentsFacultatifs.length} facultatif(s)</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button onClick={prevStep} className="inline-flex items-center gap-2 rounded-xl border border-dark-200 px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:text-dark-400">
              <ChevronLeft size={18} /> Précédent
            </button>
            <button onClick={nextStep} className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-700">
              Suivant <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE 3: FORMULAIRE
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Nouveau dossier</h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">Étape 3 sur 4 - Informations du dossier</p>
        </div>

        <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center gap-2">
            <button onClick={prevStep} className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Informations du dossier</h2>
          </div>
          
          {/* Code sélectionné */}
          <div className="mb-6 rounded-xl bg-accent-50 p-4 dark:bg-accent-950/30">
            <p className="text-sm">
              <span className="font-semibold text-accent-700 dark:text-accent-400">Code sélectionné :</span>{' '}
              {selectedCode?.code} - {selectedCode?.libelle}
            </p>
            <p className="mt-1 text-xs text-accent-600 dark:text-accent-500">{selectedCode?.description}</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Titre *</label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                placeholder="Titre de la demande"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                rows={3}
                placeholder="Détails complémentaires..."
              />
            </div>
            
            {/* Section fonctionnaire */}
            <div className="rounded-xl bg-dark-50 p-5 dark:bg-dark-800/50">
              <h3 className="mb-3 flex items-center gap-2 text-md font-semibold text-dark-900 dark:text-dark-100">
                <User size={18} className="text-accent-500" /> Informations du fonctionnaire
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Nom *</label>
                  <input
                    type="text"
                    value={fonctionnaireData.nom}
                    onChange={(e) => setFonctionnaireData({...fonctionnaireData, nom: e.target.value})}
                    className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Prénom *</label>
                  <input
                    type="text"
                    value={fonctionnaireData.prenom}
                    onChange={(e) => setFonctionnaireData({...fonctionnaireData, prenom: e.target.value})}
                    className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-dark-700 dark:text-dark-300">
                    <Hash size={14} /> Matricule
                  </label>
                  <input
                    type="text"
                    value={fonctionnaireData.matricule}
                    onChange={(e) => setFonctionnaireData({...fonctionnaireData, matricule: e.target.value})}
                    className="w-full rounded-xl border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-dark-500 dark:border-dark-800 dark:bg-dark-800/50 dark:text-dark-400"
                    readOnly
                  />
                  <p className="mt-1 text-xs text-dark-400">Généré automatiquement</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Email</label>
                  <input
                    type="email"
                    value={fonctionnaireData.email}
                    className="w-full rounded-xl border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-dark-500 dark:border-dark-800 dark:bg-dark-800/50 dark:text-dark-400"
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Motif</label>
              <textarea
                value={formData.motif}
                onChange={(e) => setFormData({...formData, motif: e.target.value})}
                className="w-full rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                rows={2}
                placeholder="Motif de la demande..."
              />
            </div>
            
            {renderSpecificFields()}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button onClick={prevStep} className="inline-flex items-center gap-2 rounded-xl border border-dark-200 px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:text-dark-400">
              <ChevronLeft size={18} /> Précédent
            </button>
            <button onClick={nextStep} className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-700">
              Suivant <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE 4: DOCUMENTS
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Nouveau dossier</h1>
        <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">Étape 4 sur 4 - Documents joints</p>
      </div>

      <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
        <div className="mb-4 flex items-center gap-2">
          <button onClick={prevStep} className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Documents joints</h2>
        </div>
        
        {/* Message d'information */}
        <div className="mb-6 rounded-xl bg-accent-50 p-4 dark:bg-accent-950/30">
          <p className="flex items-center gap-2 text-sm text-accent-700 dark:text-accent-400">
            <AlertCircle size={16} />
            Formats acceptés : PDF, Word (DOC/DOCX), JPG, PNG - Max 10MB
          </p>
        </div>
        
        {/* Liste des documents requis */}
        {allDocuments.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-medium text-dark-700 dark:text-dark-300">Documents attendus :</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {allDocuments.map(doc => (
                <div key={doc.name} className={`flex items-center gap-2 rounded-xl p-2 ${
                  documentsStatus[doc.name] ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-dark-50 dark:bg-dark-800/50'
                }`}>
                  {documentsStatus[doc.name] ? 
                    <CheckCircle2 size={16} className="text-emerald-500" /> : 
                    <AlertCircle size={16} className={doc.required ? 'text-rose-500' : 'text-dark-400'} />
                  }
                  <span className="flex-1 text-sm text-dark-700 dark:text-dark-300">{doc.name}</span>
                  {doc.required && <span className="text-xs text-rose-500">Obligatoire</span>}
                  {!doc.required && <span className="text-xs text-dark-400">Facultatif</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone d'upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30' : 'border-dark-300 hover:border-accent-400 dark:border-dark-700'
          }`}
        >
          <input id="file-upload" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileInput} className="hidden" />
          <Upload className="mx-auto mb-3 h-10 w-10 text-dark-400" />
          <p className="text-sm font-medium text-dark-700 dark:text-dark-300">Cliquez ou glissez-déposez</p>
          <p className="mt-1 text-xs text-dark-500">PDF, Word, JPG, PNG - Max 10MB</p>
        </div>

        {/* Fichiers uploadés */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-dark-700 dark:text-dark-300">Fichiers ({uploadedFiles.length})</h3>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl bg-dark-50 p-3 dark:bg-dark-800/50">
                  {getFileIcon(file)}
                  <span className="flex-1 truncate text-sm text-dark-700 dark:text-dark-300">{file.name}</span>
                  <button
                    onClick={() => handlePreview(file)}
                    className="rounded-lg p-1.5 text-dark-500 transition-colors hover:bg-white dark:hover:bg-dark-700"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-white dark:hover:bg-dark-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="inline-flex items-center gap-2 rounded-xl border border-dark-200 px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:text-dark-400">
            <ChevronLeft size={18} /> Précédent
          </button>
          <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-700 disabled:opacity-50">
            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? 'Création...' : 'Créer le dossier'}
          </button>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {previewUrl && previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setPreviewFile(null);
        }}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              setPreviewFile(null);
            }} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X size={24} />
            </button>
            <img src={previewUrl} alt={previewFile.name} className="max-w-full max-h-[90vh] rounded-xl object-contain" />
            <p className="mt-2 text-center text-white">{previewFile.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NouveauDossier;