// src/pages/Documents/DocumentsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  X,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FolderOpen,
  Calendar,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  ExternalLink
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
  
  // États principaux
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
  
  // États pour la prévisualisation
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
      console.log('📥 Chargement des documents...');
      
      const userDossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      console.log(`📁 ${userDossiers.length} dossiers trouvés`);
      
      setDossiers(userDossiers);
      
      const allDocs: DocumentWithDossier[] = [];
      
      userDossiers.forEach(dossier => {
        if (dossier.documents && Array.isArray(dossier.documents) && dossier.documents.length > 0) {
          dossier.documents.forEach(doc => {
            allDocs.push({
              document: doc,
              dossier: dossier
            });
          });
        }
      });
      
      console.log(`📄 ${allDocs.length} documents trouvés`);
      setDocuments(allDocs);
      setFilteredDocuments(allDocs);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des documents:', error);
      toast.error('Erreur lors du chargement des documents');
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

  // ⭐ FONCTION CORRIGÉE POUR LA PRÉVISUALISATION
  const handlePreview = (item: DocumentWithDossier) => {
    console.log('🔍 Tentative de prévisualisation:', item.document);
    
    // Vérifier si le document a une URL ou un fichier
    if (item.document.url || item.document.fichier) {
      setPreviewDocument(item.document);
      setShowPreview(true);
    } else {
      toast.error('URL du document non disponible');
    }
  };

  // Fonction pour télécharger directement
  const handleDirectDownload = (item: DocumentWithDossier) => {
    let url = '';
    
    if (item.document.url) {
      url = item.document.url;
    } else if (item.document.fichier) {
      const baseUrl = 'http://localhost:8000';
      url = `${baseUrl}${item.document.fichier}`;
    }
    
    if (url) {
      window.open(url, '_blank');
      toast.success('Téléchargement démarré');
    } else {
      toast.error('URL du document non disponible');
    }
  };

  const handleDownload = (item: DocumentWithDossier) => {
    handleDirectDownload(item);
  };

  const getFileIcon = (doc: Document) => {
    const fileName = doc.nom.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <ImageIcon className="w-8 h-8 text-purple-500" />;
    }
    if (fileName.endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (fileName.match(/\.(doc|docx)$/)) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    if (fileName.match(/\.(xls|xlsx)$/)) {
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    }
    if (fileName.match(/\.(zip|rar|7z)$/)) {
      return <FileArchive className="w-8 h-8 text-yellow-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    if (bytes === 0) return '0 B';
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
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'bg-purple-100 text-purple-700';
    if (fileName.endsWith('.pdf')) return 'bg-red-100 text-red-700';
    if (fileName.match(/\.(doc|docx)$/)) return 'bg-blue-100 text-blue-700';
    if (fileName.match(/\.(xls|xlsx)$/)) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid3x3 size={20} />}
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Inverser le tri"
            >
              {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter size={18} />
              Filtres
              {(selectedType !== 'tous' || selectedDossier !== 'tous') && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="label">Type de document</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input"
                >
                  <option value="tous">Tous les types</option>
                  <option value="image">Images</option>
                  <option value="pdf">PDF</option>
                  <option value="word">Word</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
              <div>
                <label className="label">Dossier associé</label>
                <select
                  value={selectedDossier}
                  onChange={(e) => setSelectedDossier(e.target.value)}
                  className="input"
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
                <label className="label">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input"
                >
                  <option value="date">Date</option>
                  <option value="nom">Nom</option>
                  <option value="taille">Taille</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Total documents</p>
            <p className="text-2xl font-bold text-gray-900">{filteredDocuments.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Images</p>
            <p className="text-2xl font-bold text-purple-600">
              {filteredDocuments.filter(d => d.document.nom.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">PDF</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredDocuments.filter(d => d.document.nom.toLowerCase().endsWith('.pdf')).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <p className="text-sm text-gray-500">Taille totale</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatFileSize(filteredDocuments.reduce((acc, d) => acc + (d.document.taille || 0), 0))}
            </p>
          </div>
        </div>

        {/* Liste des documents */}
        {filteredDocuments.length > 0 ? (
          viewMode === 'grid' ? (
            // Vue grille
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((item, index) => (
                <div
                  key={`${item.dossier.id}-${item.document.id}-${index}`}
                  className="bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col h-full">
                    {/* Icône et aperçu */}
                    <div className="relative mb-3">
                      {item.document.nom.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={item.document.url || ''}
                          alt={item.document.nom}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+non+disponible';
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(item.document)}
                        </div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(item.document)}`}>
                        {getDocumentTypeLabel(item.document)}
                      </span>
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate" title={item.document.nom}>
                        {item.document.nom}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(item.document.taille)} • {formatDate(item.document.created_at)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <FolderOpen size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-600 truncate">
                          {item.dossier.numero_dossier}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
                      {/* Bouton œil pour prévisualiser */}
                      <button
                        onClick={() => handlePreview(item)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Aperçu"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      
                      {/* Bouton de téléchargement */}
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download size={16} className="text-gray-600" />
                      </button>
                      
                      {/* Bouton pour ouvrir directement */}
                      <button
                        onClick={() => handleDirectDownload(item)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ouvrir directement"
                      >
                        <ExternalLink size={16} className="text-gray-600" />
                      </button>
                      
                      {/* Bouton pour voir le dossier */}
                      <button
                        onClick={() => navigate(`/dossiers/${item.dossier.id}`)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir le dossier"
                      >
                        <FolderOpen size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vue liste
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Taille</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Dossier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((item, index) => (
                    <tr key={`${item.dossier.id}-${item.document.id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(item.document)}
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {item.document.nom}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(item.document)}`}>
                          {getDocumentTypeLabel(item.document)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(item.document.taille)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(item.document.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-green-600">
                          {item.dossier.numero_dossier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePreview(item)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Aperçu"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDownload(item)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Télécharger"
                          >
                            <Download size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDirectDownload(item)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Ouvrir directement"
                          >
                            <ExternalLink size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => navigate(`/dossiers/${item.dossier.id}`)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Voir le dossier"
                          >
                            <FolderOpen size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType !== 'tous' || selectedDossier !== 'tous'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Vous n\'avez pas encore de documents. Créez un dossier pour ajouter des fichiers.'}
            </p>
            <button
              onClick={() => navigate('/dossiers/creer')}
              className="btn-primary mt-4"
            >
              Créer un dossier
            </button>
          </div>
        )}
      </div>

      {/* ⭐ MODAL DE PRÉVISUALISATION - AJOUTÉ ICI */}
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