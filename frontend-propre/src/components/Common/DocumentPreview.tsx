// src/components/Common/DocumentPreview.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image as ImageIcon, AlertCircle, ExternalLink, Eye } from 'lucide-react';
import { Document } from '../../types';
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
      
      const fileName = document.nom?.toLowerCase() || '';
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        setFileType('image');
      } else if (fileName.endsWith('.pdf')) {
        setFileType('pdf');
      } else {
        setFileType('other');
      }
      
      let fileUrl = null;
      if (document.url && document.url.startsWith('http')) {
        fileUrl = document.url;
      } else if (document.fichier) {
        let cleanPath = document.fichier;
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        fileUrl = `http://localhost:8000/media/${cleanPath}`;
      }
      
      if (!fileUrl) {
        setError('URL du document non disponible');
        setLoading(false);
        return;
      }
      
      setPreviewUrl(fileUrl);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
      toast.success('Téléchargement démarré');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-dark-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dark-200 p-4 dark:border-dark-800">
            <div className="flex items-center gap-3">
              {fileType === 'image' && <ImageIcon size={20} className="text-accent-500" />}
              {fileType === 'pdf' && <FileText size={20} className="text-rose-500" />}
              <div>
                <h3 className="font-medium text-dark-900 dark:text-dark-100">{document.nom}</h3>
                <p className="text-xs text-dark-500">
                  {document.type_document || 'Document'} • {document.taille ? Math.round(document.taille / 1024) : '?'} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="rounded-xl p-2 text-dark-500 transition-colors hover:bg-dark-100 dark:hover:bg-dark-800"
                title="Télécharger"
              >
                <Download size={18} />
              </button>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-dark-500 transition-colors hover:bg-dark-100 dark:hover:bg-dark-800"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <AlertCircle size={48} className="text-rose-500" />
                <h3 className="mt-4 text-lg font-medium text-dark-900 dark:text-dark-100">Erreur</h3>
                <p className="mt-2 text-sm text-dark-500">{error}</p>
                <button
                  onClick={loadDocument}
                  className="mt-4 rounded-xl bg-accent-600 px-4 py-2 text-sm text-white"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                {fileType === 'image' && previewUrl && (
                  <img src={previewUrl} alt={document.nom} className="mx-auto max-h-full max-w-full object-contain" />
                )}
                {fileType === 'pdf' && previewUrl && (
                  <iframe src={previewUrl} title={document.nom} className="h-full w-full rounded-xl" />
                )}
                {fileType === 'other' && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <FileText size={64} className="text-dark-300" />
                    <p className="mt-4 text-dark-500">Aperçu non disponible</p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 rounded-xl bg-accent-600 px-4 py-2 text-sm text-white"
                    >
                      Télécharger le fichier
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DocumentPreview;