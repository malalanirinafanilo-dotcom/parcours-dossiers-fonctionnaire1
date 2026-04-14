import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Image as ImageIcon,
  FileWarning
} from 'lucide-react';
import { ValidationService } from '../../services/validationService';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  uploadedFiles: File[];
  requiredDocuments?: string[];
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onFileRemove,
  uploadedFiles,
  requiredDocuments = [],
  accept = "*/*",
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  maxFiles = 20,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    missing: string[];
    found: string[];
    suggestions: { required: string; found: string }[];
  } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Valider les documents à chaque changement
  React.useEffect(() => {
    if (requiredDocuments.length > 0) {
      const result = ValidationService.validateRequiredDocuments(
        requiredDocuments,
        uploadedFiles
      );
      setValidationResult(result);
    }
  }, [uploadedFiles, requiredDocuments]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} fichiers autorisés`);
      return [];
    }

    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`"${file.name}" dépasse ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    return validFiles;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
    }
  }, [uploadedFiles, onFilesSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
        toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
      }
      
      e.target.value = '';
    }
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
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (file.name.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone d'upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-marine-500 bg-marine-50 scale-105' 
            : 'border-gray-300 hover:border-marine-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <Upload className={`w-12 h-12 ${dragActive ? 'text-marine-500' : 'text-gray-400'}`} />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? 'Déposez les fichiers' : 'Cliquez ou glissez-déposez'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tous les formats acceptés (max {maxSize / (1024 * 1024)}MB)
            </p>
          </div>
        </div>
      </div>

      {/* Validation des documents requis */}
      {validationResult && requiredDocuments.length > 0 && (
        <div className={`p-4 rounded-lg ${
          validationResult.valid ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <div className="flex items-start gap-2">
            {validationResult.valid ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <FileWarning className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                validationResult.valid ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {validationResult.valid 
                  ? '✅ Tous les documents requis sont présents'
                  : `⚠️ Documents manquants : ${validationResult.missing.join(', ')}`
                }
              </p>
              
              {validationResult.suggestions.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="text-gray-600">Correspondances trouvées :</p>
                  <ul className="mt-1 space-y-1">
                    {validationResult.suggestions.map((s, i) => (
                      <li key={i} className="text-green-600">
                        ✓ {s.required} → {s.found}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liste des fichiers */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Fichiers ({uploadedFiles.length}/{maxFiles})
            </h3>
            <button
              onClick={() => {
                if (window.confirm('Supprimer tous les fichiers ?')) {
                  for (let i = uploadedFiles.length - 1; i >= 0; i--) {
                    onFileRemove(i);
                  }
                }
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Tout supprimer
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {uploadedFiles.map((file, index) => {
              const isImage = file.type.startsWith('image/');
              const isPdf = file.name.toLowerCase().endsWith('.pdf');
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      {isImage && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Image
                        </span>
                      )}
                      {isPdf && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          PDF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handlePreview(file)}
                      className="p-1.5 hover:bg-white rounded-lg"
                      title="Aperçu"
                    >
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button
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
                      onClick={() => onFileRemove(index)}
                      className="p-1.5 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export default FileUpload;