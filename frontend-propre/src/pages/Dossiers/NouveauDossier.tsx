// src/pages/Dossiers/NouveauDossier.tsx - VERSION COMPLÈTE CORRIGÉE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, ChevronRight, ChevronLeft, FileText, AlertCircle, CheckCircle2,
  X, Upload, Eye, Send, Trash2, ImageIcon, User, Calendar, Briefcase, Database, Hash
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { getCodeInfo, getCodesByCategorie, CATEGORIES, CodeMouvementInfo, NOTES_MANUSCRITES } from '../../utils/codesMouvementComplet';
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
  
  // États - Champs spécifiques du code mouvement
  const [specificFields, setSpecificFields] = useState<Record<string, any>>({});
  
  // États - Fonctionnaire (avec matricule auto)
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

  // Mettre à jour la liste des codes quand la catégorie change
  useEffect(() => {
    if (selectedCategorie) {
      const codes = getCodesByCategorie(selectedCategorie);
      setCodesDisponibles(codes);
    }
  }, [selectedCategorie]);

  // Réinitialiser les champs spécifiques quand le code change
  useEffect(() => {
    if (selectedCode) {
      // Initialiser les champs spécifiques avec les valeurs par défaut
      const initialFields: Record<string, any> = {};
      selectedCode.champs.forEach(champ => {
        initialFields[champ.nom] = '';
      });
      setSpecificFields(initialFields);
      
      // Initialiser les statuts des documents
      const status: { [key: string]: boolean } = {};
      selectedCode.documentsObligatoires.forEach(doc => { status[doc] = false; });
      selectedCode.documentsFacultatifs.forEach(doc => { status[doc] = false; });
      setDocumentsStatus(status);
    }
  }, [selectedCode]);

  // Générer un matricule automatiquement basé sur l'utilisateur
  useEffect(() => {
    if (user?.email) {
      // Générer un matricule à partir de l'email ou du nom
      const emailPrefix = user.email.split('@')[0].substring(0, 8);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Format: MAT-YYYYMM-XXXX (ex: MAT-202512-jsmith)
      const generatedMatricule = `MAT-${year}${month}-${emailPrefix.toUpperCase()}`;
      setFonctionnaireData(prev => ({ ...prev, matricule: generatedMatricule }));
    }
  }, [user]);

  // Gestion des fichiers
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
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
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
        // Vérifier si le fichier correspond à un document requis
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
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    if (file.name.toLowerCase().endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) 
      return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // Navigation
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
    // Vérifier les documents obligatoires
    const missingDocs = (selectedCode?.documentsObligatoires || []).filter(doc => !documentsStatus[doc]);
    if (missingDocs.length > 0) {
      toast.error(`Documents obligatoires manquants: ${missingDocs.length} sur ${selectedCode?.documentsObligatoires.length}`);
      return;
    }

    setLoading(true);
    try {
      // Fusionner les données générales avec les champs spécifiques
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

  // Rendu des champs spécifiques du code mouvement
  const renderSpecificFields = () => {
    if (!selectedCode || !selectedCode.champs.length) return null;
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Informations spécifiques</h3>
        <div className="space-y-4">
          {selectedCode.champs.map((champ, idx) => {
            const value = specificFields[champ.nom] || '';
            
            switch (champ.type) {
              case 'select':
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {champ.label} {champ.obligatoire && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sélectionner...</option>
                      {champ.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                );
              
              case 'multiselect':
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {champ.label} {champ.obligatoire && <span className="text-red-500">*</span>}
                    </label>
                    <div className="space-y-2">
                      {champ.options?.map(opt => (
                        <label key={opt} className="flex items-center gap-2">
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
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              
              case 'textarea':
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {champ.label} {champ.obligatoire && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={value}
                      onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      rows={3}
                      readOnly={champ.readOnly}
                    />
                  </div>
                );
              
              case 'checkbox':
                return (
                  <div key={idx}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{champ.label}</span>
                    </label>
                  </div>
                );
              
              default:
                return (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {champ.label} {champ.obligatoire && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={champ.type}
                      value={value}
                      onChange={(e) => setSpecificFields({ ...specificFields, [champ.nom]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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

  // ==================== ÉTAPE 1 : CATÉGORIE ====================
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center gap-4">
            <button onClick={() => navigate('/dossiers')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Nouveau dossier - Étape 1/4</h1>
          </div>
        </div>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-semibold mb-4">Choisissez la catégorie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorie(cat.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCategorie === cat.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <h3 className="font-semibold">{cat.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cat.codes.length} types disponibles</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={nextStep} className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ÉTAPE 2 : CODE MOUVEMENT ====================
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center gap-4">
            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Nouveau dossier - Étape 2/4</h1>
          </div>
        </div>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-semibold mb-4">Choisissez le type de dossier</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {codesDisponibles.map(code => (
                <button
                  key={code.code}
                  onClick={() => setSelectedCode(code)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCode?.code === code.code ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-green-600">{code.code}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{code.delaiTraitement} jours</span>
                  </div>
                  <h3 className="font-semibold">{code.libelle}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{code.description}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="text-xs text-red-600">📄 {code.documentsObligatoires.length} obligatoire(s)</span>
                    <span className="text-xs text-gray-500">📎 {code.documentsFacultatifs.length} facultatif(s)</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 border rounded-lg flex items-center gap-2">
                <ChevronLeft size={18} /> Précédent
              </button>
              <button onClick={nextStep} className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ÉTAPE 3 : FORMULAIRE ====================
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center gap-4">
            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Nouveau dossier - Étape 3/4</h1>
          </div>
        </div>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-semibold mb-4">Informations du dossier</h2>
            
            {/* Code sélectionné */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm"><span className="font-semibold">Code sélectionné :</span> {selectedCode?.code} - {selectedCode?.libelle}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedCode?.description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Titre de la demande"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Détails complémentaires..."
                />
              </div>
              
              {/* Section fonctionnaire avec matricule automatique */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <User size={18} /> Informations du fonctionnaire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={fonctionnaireData.nom}
                      onChange={(e) => setFonctionnaireData({...fonctionnaireData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={fonctionnaireData.prenom}
                      onChange={(e) => setFonctionnaireData({...fonctionnaireData, prenom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Hash size={14} /> Matricule
                      <span className="text-xs text-gray-400 font-normal">(généré automatiquement)</span>
                    </label>
                    <input
                      type="text"
                      value={fonctionnaireData.matricule}
                      onChange={(e) => setFonctionnaireData({...fonctionnaireData, matricule: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Généré automatiquement"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Le matricule est généré à partir de votre email. Format: MAT-YYYYMM-pseudo
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={fonctionnaireData.email}
                      onChange={(e) => setFonctionnaireData({...fonctionnaireData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea
                  value={formData.motif}
                  onChange={(e) => setFormData({...formData, motif: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Motif de la demande..."
                />
              </div>
              
              {/* Champs spécifiques au code mouvement */}
              {renderSpecificFields()}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 border rounded-lg flex items-center gap-2">
                <ChevronLeft size={18} /> Précédent
              </button>
              <button onClick={nextStep} className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ÉTAPE 4 : DOCUMENTS ====================
  const allDocuments = [
    ...(selectedCode?.documentsObligatoires || []).map(doc => ({ name: doc, required: true })),
    ...(selectedCode?.documentsFacultatifs || []).map(doc => ({ name: doc, required: false })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Nouveau dossier - Étape 4/4</h1>
        </div>
      </div>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Documents joints</h2>
          
          {/* Message d'information */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Formats acceptés : PDF, Word (DOC/DOCX), JPG, PNG - Max 10MB
            </p>
          </div>
          
          {/* Liste des documents requis */}
          {allDocuments.length > 0 && (
            <div className="mb-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Documents attendus :</h3>
              {allDocuments.map(doc => (
                <div key={doc.name} className={`flex items-center gap-2 p-2 rounded-lg ${documentsStatus[doc.name] ? 'bg-green-50' : 'bg-gray-50'}`}>
                  {documentsStatus[doc.name] ? 
                    <CheckCircle2 size={16} className="text-green-500" /> : 
                    <AlertCircle size={16} className={doc.required ? 'text-red-500' : 'text-gray-400'} />
                  }
                  <span className="text-sm flex-1">{doc.name}</span>
                  {doc.required && <span className="text-xs text-red-500">Obligatoire</span>}
                  {!doc.required && <span className="text-xs text-gray-400">Facultatif</span>}
                </div>
              ))}
            </div>
          )}

          {/* Zone d'upload */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
          >
            <input 
              id="file-upload" 
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
              onChange={handleFileInput} 
              className="hidden" 
            />
            <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Cliquez ou glissez-déposez</p>
            <p className="text-xs text-gray-500 mt-1">PDF, Word, JPG, PNG - Max 10MB</p>
          </div>

          {/* Fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Fichiers ({uploadedFiles.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    {getFileIcon(file)}
                    <span className="flex-1 text-sm truncate">{file.name}</span>
                    <button onClick={() => removeFile(idx)} className="p-1 hover:bg-red-100 rounded">
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes manuscrites */}
          {selectedCode?.code && NOTES_MANUSCRITES.HAUT_EMPLOI_ETAT && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs text-gray-600">
              <p className="font-medium">Notes manuscrites:</p>
              <p>HEE - Fonc: 0, Non fonc: 1, Fonc non permanent: A à J, Non fonc non permanent: K à T</p>
              <p>542: Indemnité de Fonction d'encadrement | 543: Indemnité de Fonction Spéciale</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <button onClick={prevStep} className="px-4 py-2 border rounded-lg flex items-center gap-2">
              <ChevronLeft size={18} /> Précédent
            </button>
            <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
              {loading ? 'Création...' : 'Créer le dossier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouveauDossier;