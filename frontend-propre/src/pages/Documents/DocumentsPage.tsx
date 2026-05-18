// src/pages/Documents/DocumentsPage.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  X,
  Image as ImageIcon,
  FolderOpen,
  Calendar,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader,
  FileSpreadsheet,
  FileArchive,
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Document, Dossier } from '../../types';
import DocumentPreview from '../../components/Common/DocumentPreview';
import toast from 'react-hot-toast';

interface DocumentWithDossier {
  document: Document;
  dossier: Dossier;
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [documents, setDocuments] = useState<DocumentWithDossier[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('tous');
  const [selectedDossier, setSelectedDossier] = useState<string>('tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'nom' | 'taille'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  useEffect(() => {
    loadDocuments();
  }, [userEmail, userRole]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedType, selectedDossier, sortBy, sortOrder]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const userDossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      setDossiers(userDossiers);
      
      const allDocs: DocumentWithDossier[] = [];
      userDossiers.forEach(dossier => {
        if (dossier.documents && Array.isArray(dossier.documents) && dossier.documents.length > 0) {
          dossier.documents.forEach(doc => {
            allDocs.push({ document: doc, dossier });
          });
        }
      });
      
      setDocuments(allDocs);
      setFilteredDocuments(allDocs);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.document.nom.toLowerCase().includes(term) ||
        item.dossier.numero_dossier.toLowerCase().includes(term) ||
        item.dossier.titre.toLowerCase().includes(term)
      );
    }

    if (selectedType !== 'tous') {
      filtered = filtered.filter(item => {
        const fileName = item.document.nom.toLowerCase();
        if (selectedType === 'image') return fileName.match(/\.(jpg|jpeg|png|gif|webp)$/);
        if (selectedType === 'pdf') return fileName.endsWith('.pdf');
        if (selectedType === 'word') return fileName.match(/\.(doc|docx)$/);
        if (selectedType === 'excel') return fileName.match(/\.(xls|xlsx)$/);
        return true;
      });
    }

    if (selectedDossier !== 'tous') {
      filtered = filtered.filter(item => item.dossier.id === selectedDossier);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.document.created_at).getTime() - new Date(b.document.created_at).getTime();
      } else if (sortBy === 'nom') {
        comparison = a.document.nom.localeCompare(b.document.nom);
      } else if (sortBy === 'taille') {
        comparison = (a.document.taille || 0) - (b.document.taille || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
  };

  const handlePreview = (item: DocumentWithDossier) => {
    if (item.document.url || item.document.fichier) {
      setPreviewDocument(item.document);
      setShowPreview(true);
    } else {
      toast.error('Aperçu non disponible');
    }
  };

  const handleDownload = (item: DocumentWithDossier) => {
    let url = '';
    if (item.document.url) {
      url = item.document.url;
    } else if (item.document.fichier) {
      url = `http://localhost:8000${item.document.fichier}`;
    }
    if (url) {
      window.open(url, '_blank');
      toast.success('Téléchargement démarré');
    } else {
      toast.error('URL non disponible');
    }
  };

  const getFileIcon = (doc: Document) => {
    const fileName = doc.nom.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <ImageIcon className="h-8 w-8 text-purple-500" />;
    }
    if (fileName.endsWith('.pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (fileName.match(/\.(doc|docx)$/)) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    if (fileName.match(/\.(xls|xlsx)$/)) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    if (fileName.match(/\.(zip|rar|7z)$/)) {
      return <FileArchive className="h-8 w-8 text-yellow-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getDocumentTypeLabel = (doc: Document) => {
    const fileName = doc.nom.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'Image';
    if (fileName.endsWith('.pdf')) return 'PDF';
    if (fileName.match(/\.(doc|docx)$/)) return 'Word';
    if (fileName.match(/\.(xls|xlsx)$/)) return 'Excel';
    return 'Document';
  };

  const getDocumentTypeColor = (doc: Document) => {
    const fileName = doc.nom.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    if (fileName.endsWith('.pdf')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (fileName.match(/\.(doc|docx)$/)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (fileName.match(/\.(xls|xlsx)$/)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const totalSize = filteredDocuments.reduce((acc, d) => acc + (d.document.taille || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">
            Documents
          </h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            Gérez tous vos documents administratifs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="rounded-xl border border-dark-200 bg-white p-2 text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
            title={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid3x3 size={18} />}
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded-xl border border-dark-200 bg-white p-2 text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
            title="Inverser le tri"
          >
            {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">Total documents</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{filteredDocuments.length}</p>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">Images</p>
          <p className="text-2xl font-bold text-purple-600">
            {filteredDocuments.filter(d => d.document.nom.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length}
          </p>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">PDF</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredDocuments.filter(d => d.document.nom.toLowerCase().endsWith('.pdf')).length}
          </p>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <p className="text-sm text-dark-500">Taille totale</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{formatFileSize(totalSize)}</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-10 pr-4 text-sm text-dark-900 placeholder:text-dark-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-accent-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
          >
            <Filter size={16} />
            Filtres
            {(selectedType !== 'tous' || selectedDossier !== 'tous') && (
              <span className="h-2 w-2 rounded-full bg-accent-500" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                      Type de document
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                    >
                      <option value="tous">Tous les types</option>
                      <option value="image">Images</option>
                      <option value="pdf">PDF</option>
                      <option value="word">Word</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                      Dossier associé
                    </label>
                    <select
                      value={selectedDossier}
                      onChange={(e) => setSelectedDossier(e.target.value)}
                      className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                    >
                      <option value="tous">Tous les dossiers</option>
                      {dossiers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.numero_dossier} - {d.titre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
                    >
                      <option value="date">Date</option>
                      <option value="nom">Nom</option>
                      <option value="taille">Taille</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des documents */}
      {filteredDocuments.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((item, index) => (
              <motion.div
                key={`${item.dossier.id}-${item.document.id}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="group rounded-2xl border border-dark-200 bg-white p-4 transition-all hover:shadow-md dark:border-dark-800 dark:bg-dark-900"
              >
                {/* Aperçu */}
                <div className="relative mb-3">
                  {item.document.nom.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={item.document.url || ''}
                      alt={item.document.nom}
                      className="h-32 w-full rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/e2e8f0/64748b?text=Image';
                      }}
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center rounded-xl bg-dark-50 dark:bg-dark-800">
                      {getFileIcon(item.document)}
                    </div>
                  )}
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${getDocumentTypeColor(item.document)}`}>
                    {getDocumentTypeLabel(item.document)}
                  </span>
                </div>

                {/* Infos */}
                <div>
                  <h3 className="truncate font-medium text-dark-900 dark:text-dark-100" title={item.document.nom}>
                    {item.document.nom}
                  </h3>
                  <p className="mt-1 text-xs text-dark-500">
                    {formatFileSize(item.document.taille)} • {formatDate(item.document.created_at)}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <FolderOpen size={12} className="text-dark-400" />
                    <span className="truncate text-xs text-dark-500">
                      {item.dossier.numero_dossier}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-dark-100 pt-2 dark:border-dark-800">
                  <button
                    onClick={() => handlePreview(item)}
                    className="rounded-lg p-1.5 text-dark-500 transition-colors hover:bg-dark-100 dark:hover:bg-dark-800"
                    title="Aperçu"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="rounded-lg p-1.5 text-dark-500 transition-colors hover:bg-dark-100 dark:hover:bg-dark-800"
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/dossiers/${item.dossier.id}`)}
                    className="rounded-lg p-1.5 text-dark-500 transition-colors hover:bg-dark-100 dark:hover:bg-dark-800"
                    title="Voir le dossier"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-200 bg-dark-50 dark:border-dark-800 dark:bg-dark-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Taille</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Dossier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-800">
                  {filteredDocuments.map((item, index) => (
                    <tr key={`${item.dossier.id}-${item.document.id}-${index}`} className="transition-colors hover:bg-dark-50 dark:hover:bg-dark-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(item.document)}
                          <span className="font-medium text-dark-900 dark:text-dark-100">{item.document.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDocumentTypeColor(item.document)}`}>
                          {getDocumentTypeLabel(item.document)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500">{formatFileSize(item.document.taille)}</td>
                      <td className="px-6 py-4 text-sm text-dark-500">{formatDate(item.document.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-accent-600">{item.dossier.numero_dossier}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handlePreview(item)} className="rounded-lg p-1 text-dark-500 hover:bg-dark-100" title="Aperçu">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDownload(item)} className="rounded-lg p-1 text-dark-500 hover:bg-dark-100" title="Télécharger">
                            <Download size={16} />
                          </button>
                          <button onClick={() => navigate(`/dossiers/${item.dossier.id}`)} className="rounded-lg p-1 text-dark-500 hover:bg-dark-100" title="Voir le dossier">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dark-200 bg-white py-12 text-center dark:border-dark-800 dark:bg-dark-900">
          <FileText size={48} className="mx-auto text-dark-300 dark:text-dark-700" />
          <h3 className="mt-3 text-lg font-medium text-dark-900 dark:text-dark-100">Aucun document trouvé</h3>
          <p className="mt-1 text-sm text-dark-500">
            {searchTerm || selectedType !== 'tous' || selectedDossier !== 'tous'
              ? 'Essayez de modifier vos filtres'
              : 'Vous n\'avez pas encore de documents'}
          </p>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreview && previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={() => {
            setShowPreview(false);
            setPreviewDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentsPage;