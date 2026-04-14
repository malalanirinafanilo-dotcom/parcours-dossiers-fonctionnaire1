// src/components/Common/DocumentPreview.tsx
import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, AlertCircle, ExternalLink, Eye } from 'lucide-react';
import { Document } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'other'>('other');
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    loadDocument();
    
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setUseFallback(false);
      
      console.log('📄 Document reçu:', document);
      
      // Déterminer le type de fichier
      const fileName = document.nom?.toLowerCase() || '';
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        setFileType('image');
      } else if (fileName.endsWith('.pdf')) {
        setFileType('pdf');
      } else {
        setFileType('other');
      }
      
      // Construire l'URL complète
      let fileUrl = document.url;
      const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
      
      if (!fileUrl && document.fichier) {
        // Si le fichier est stocké avec un chemin relatif
        fileUrl = `${baseUrl}${document.fichier.startsWith('/') ? '' : '/'}${document.fichier}`;
      } else if (!fileUrl) {
        // Fallback: construire l'URL à partir du nom
        fileUrl = `${baseUrl}/media/documents/${encodeURIComponent(document.nom)}`;
      } else if (!fileUrl.startsWith('http')) {
        fileUrl = `${baseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      }
      
      console.log('📄 URL finale:', fileUrl);
      
      // Vérifier si le fichier est accessible
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`⚠️ Fichier non accessible: HTTP ${response.status}`);
          setError(`Fichier non trouvé (HTTP ${response.status})`);
        } else {
          console.log('✅ Fichier accessible');
          setPreviewUrl(fileUrl);
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors de la vérification:', err);
        // On essaie quand même d'afficher l'URL
        setPreviewUrl(fileUrl);
      }
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
      toast.success('Téléchargement démarré');
    } else {
      toast.error('URL du document non disponible');
    }
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      toast.error('URL du document non disponible');
    }
  };

  const openWithGoogleDocs = () => {
    if (previewUrl) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
      window.open(googleDocsUrl, '_blank');
    }
  };

  const retryLoad = () => {
    loadDocument();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Chargement du document...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {fileType === 'image' && <ImageIcon className="w-5 h-5 text-purple-500" />}
            {fileType === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
            <div>
              <h3 className="font-medium text-gray-900 truncate max-w-md" title={document.nom}>
                {document.nom || 'Document sans nom'}
              </h3>
              <p className="text-xs text-gray-500">
                {document.type_document || 'Document'} • {document.taille ? Math.round(document.taille / 1024) : '?'} KB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fileType === 'pdf' && (
              <button
                onClick={() => setUseFallback(!useFallback)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mode d'affichage alternatif"
              >
                <Eye size={20} className="text-gray-600" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download size={20} className="text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
              <p className="text-gray-600 max-w-md mb-4">{error}</p>
              <div className="flex gap-4">
                <button
                  onClick={retryLoad}
                  className="btn-primary flex items-center gap-2"
                >
                  Réessayer
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download size={18} />
                  Télécharger
                </button>
                <button
                  onClick={openInNewTab}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  Ouvrir
                </button>
              </div>
            </div>
          ) : (
            <>
              {fileType === 'image' && previewUrl && (
                <img
                  src={previewUrl}
                  alt={document.nom}
                  className="max-w-full max-h-full mx-auto object-contain"
                  onError={() => setError("Impossible de charger l'image")}
                />
              )}
              
              {fileType === 'pdf' && previewUrl && (
                <div className="h-full flex flex-col">
                  {useFallback ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <FileText className="w-24 h-24 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {document.nom}
                      </h3>
                      <p className="text-gray-600 mb-6 text-center max-w-md">
                        Choisissez comment afficher ce document :
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        <button
                          onClick={openInNewTab}
                          className="btn-primary flex items-center gap-2"
                        >
                          <ExternalLink size={18} />
                          Ouvrir dans un nouvel onglet
                        </button>
                        <button
                          onClick={openWithGoogleDocs}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Eye size={18} />
                          Visualiser avec Google Docs
                        </button>
                        <button
                          onClick={handleDownload}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Download size={18} />
                          Télécharger
                        </button>
                      </div>
                      <button
                        onClick={() => setUseFallback(false)}
                        className="mt-4 text-sm text-green-600 hover:text-green-700"
                      >
                        ← Retour à l'affichage normal
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-blue-700">
                              <strong>Information :</strong> Si le document ne s'affiche pas, 
                              <button 
                                onClick={() => setUseFallback(true)} 
                                className="text-blue-800 underline ml-1 font-medium"
                              >
                                cliquez ici pour les options d'affichage
                              </button>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <iframe
                        src={`${previewUrl}#toolbar=1&navpanes=1`}
                        title={document.nom}
                        className="w-full h-full rounded-lg"
                        onError={() => {
                          console.error('❌ Erreur chargement iframe');
                          setUseFallback(true);
                        }}
                      />
                    </>
                  )}
                </div>
              )}
              
              {fileType === 'other' && (
                <div className="h-full flex flex-col items-center justify-center">
                  <FileText className="w-24 h-24 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">Ce type de fichier ne peut pas être prévisualisé</p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDownload}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Download size={18} />
                      Télécharger
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Ouvrir dans un nouvel onglet
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;