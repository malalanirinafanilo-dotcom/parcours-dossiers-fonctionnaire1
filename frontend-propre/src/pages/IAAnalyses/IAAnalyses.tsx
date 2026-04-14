// src/pages/IAAnalyses/IAAnalyses.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Eye,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Download,
  RefreshCw,
  ChevronRight,
  Info,
  Users,
  FolderOpen,
  AlertCircle,
  Sparkles,
  Target,
  Gauge,
  Award,
  Search,  // ⭐ IMPORTANT: Search était manquant
  X        // ⭐ Ajout de X pour le bouton d'effacement
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import { CODES_MOUVEMENT } from '../../utils/codesMouvement';
import ScoreIA from '../../components/Common/ScoreIA';
import StatusChip from '../../components/Common/StatusChip';
import KpiCard from '../../components/Common/KpiCard';
import toast from 'react-hot-toast';

// ==================== TYPES ====================
interface IAAnalyse {
  dossierId: string;
  numeroDossier: string;
  titre: string;
  etape: string;
  statut: string;
  scoreRisque: number;
  classification: string;
  anomalies: string[];
  delaiPrevu: number;
  delaiEcoule: number;
  confiance: number;
  recommandations: string[];
}

interface StatsIA {
  scoreMoyen: number;
  dossiersConformes: number;
  dossiersRisque: number;
  dossiersBloques: number;
  dossiersRetardPrevu: number;
  precisionMoyenne: number;
  totalAnalyses: number;
}

interface AnomalieFrequente {
  type: string;
  count: number;
  criticite: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
}

interface PerformanceCategorie {
  categorie: string;
  scoreMoyen: number;
  count: number;
  tendance: 'hausse' | 'baisse' | 'stable';
}

// ==================== COULEURS ====================
const COLORS = {
  conforme: '#22c55e',
  risque: '#eab308',
  bloque: '#ef4444',
  info: '#3b82f6',
  violet: '#8b5cf6',
  rose: '#ec4899',
  orange: '#f97316',
  cyan: '#06b6d4'
};

const GRADIENT_COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

// ==================== COMPOSANT PRINCIPAL ====================
const IAAnalyses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // États
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<IAAnalyse[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<IAAnalyse[]>([]);
  const [stats, setStats] = useState<StatsIA>({
    scoreMoyen: 0,
    dossiersConformes: 0,
    dossiersRisque: 0,
    dossiersBloques: 0,
    dossiersRetardPrevu: 0,
    precisionMoyenne: 0,
    totalAnalyses: 0
  });
  
  // États pour les graphiques
  const [anomaliesFrequentes, setAnomaliesFrequentes] = useState<AnomalieFrequente[]>([]);
  const [performanceParCategorie, setPerformanceParCategorie] = useState<PerformanceCategorie[]>([]);
  const [evolutionScore, setEvolutionScore] = useState<{ date: string; score: number }[]>([]);
  const [repartitionRisque, setRepartitionRisque] = useState([
    { name: 'Conforme', value: 0, color: COLORS.conforme },
    { name: 'À risque', value: 0, color: COLORS.risque },
    { name: 'Bloqué', value: 0, color: COLORS.bloque }
  ]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('30');
  const [selectedCategorie, setSelectedCategorie] = useState('tous');
  const [selectedRisque, setSelectedRisque] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  // ==================== CHARGEMENT DES DONNÉES ====================
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🧠 Chargement des analyses IA...');
      
      // Récupérer les dossiers
      const dossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      console.log(`📁 ${dossiers.length} dossiers trouvés`);
      
      // Générer des analyses simulées (à remplacer par de vraies données API)
      const analysesGenerees = genererAnalysesSimulees(dossiers);
      
      setAnalyses(analysesGenerees);
      setFilteredAnalyses(analysesGenerees);
      
      // Calculer les statistiques
      calculerStatistiques(analysesGenerees);
      
      // Générer les données pour les graphiques
      genererDonneesGraphiques(analysesGenerees);
      
    } catch (error) {
      console.error('❌ Erreur chargement analyses IA:', error);
      toast.error('Erreur lors du chargement des analyses');
    } finally {
      setLoading(false);
    }
  };

  // ==================== GÉNÉRATION DE DONNÉES SIMULÉES ====================
  const genererAnalysesSimulees = (dossiers: Dossier[]): IAAnalyse[] => {
    const analyses: IAAnalyse[] = [];
    
    dossiers.forEach(dossier => {
      // Générer un score aléatoire entre 0 et 100
      const scoreRisque = Math.floor(Math.random() * 100);
      
      // Déterminer la classification
      let classification = '';
      if (scoreRisque < 30) classification = 'Conforme';
      else if (scoreRisque < 60) classification = 'À risque modéré';
      else if (scoreRisque < 80) classification = 'À risque élevé';
      else classification = 'Critique';
      
      // Générer des anomalies aléatoires
      const anomalies = [];
      if (scoreRisque > 30) {
        const anomaliesPossibles = [
          'Document manquant',
          'Signature manquante',
          'Date incohérente',
          'Champ obligatoire vide',
          'Format de fichier incorrect',
          'Taille de fichier trop grande',
          'Information incomplète',
          'Doublon détecté'
        ];
        const nbAnomalies = Math.floor(scoreRisque / 20) + 1;
        for (let i = 0; i < nbAnomalies; i++) {
          const index = Math.floor(Math.random() * anomaliesPossibles.length);
          if (!anomalies.includes(anomaliesPossibles[index])) {
            anomalies.push(anomaliesPossibles[index]);
          }
        }
      }
      
      // Générer des recommandations
      const recommandations = [];
      if (scoreRisque > 50) {
        recommandations.push('Vérifier les documents manquants');
        recommandations.push('Compléter les informations obligatoires');
      }
      if (scoreRisque > 75) {
        recommandations.push('Contacter le service RH pour assistance');
      }
      
      analyses.push({
        dossierId: dossier.id,
        numeroDossier: dossier.numero_dossier,
        titre: dossier.titre,
        etape: dossier.etape_actuelle,
        statut: dossier.statut,
        scoreRisque,
        classification,
        anomalies,
        delaiPrevu: 5 + Math.floor(Math.random() * 15),
        delaiEcoule: Math.floor(Math.random() * 20),
        confiance: 70 + Math.floor(Math.random() * 25),
        recommandations
      });
    });
    
    return analyses;
  };

  // ==================== CALCUL DES STATISTIQUES ====================
  const calculerStatistiques = (analysesList: IAAnalyse[]) => {
    if (analysesList.length === 0) return;
    
    const conformes = analysesList.filter(a => a.scoreRisque < 30).length;
    const risque = analysesList.filter(a => a.scoreRisque >= 30 && a.scoreRisque < 70).length;
    const bloques = analysesList.filter(a => a.scoreRisque >= 70).length;
    const scoreMoyen = analysesList.reduce((acc, a) => acc + a.scoreRisque, 0) / analysesList.length;
    const precisionMoyenne = analysesList.reduce((acc, a) => acc + a.confiance, 0) / analysesList.length;
    
    // Compter les dossiers en retard prévu
    const retardPrevu = analysesList.filter(a => 
      a.delaiPrevu < a.delaiEcoule && a.scoreRisque > 50
    ).length;
    
    setStats({
      scoreMoyen: Math.round(scoreMoyen * 10) / 10,
      dossiersConformes: conformes,
      dossiersRisque: risque,
      dossiersBloques: bloques,
      dossiersRetardPrevu: retardPrevu,
      precisionMoyenne: Math.round(precisionMoyenne * 10) / 10,
      totalAnalyses: analysesList.length
    });
    
    // Mettre à jour la répartition des risques
    setRepartitionRisque([
      { name: 'Conforme', value: conformes, color: COLORS.conforme },
      { name: 'À risque', value: risque, color: COLORS.risque },
      { name: 'Bloqué', value: bloques, color: COLORS.bloque }
    ]);
  };

  // ==================== GÉNÉRATION DES DONNÉES GRAPHIQUES ====================
  const genererDonneesGraphiques = (analysesList: IAAnalyse[]) => {
    // Compter les anomalies fréquentes
    const anomaliesMap = new Map<string, number>();
    analysesList.forEach(analyse => {
      analyse.anomalies.forEach(anomalie => {
        const count = anomaliesMap.get(anomalie) || 0;
        anomaliesMap.set(anomalie, count + 1);
      });
    });
    
    const anomaliesArray: AnomalieFrequente[] = Array.from(anomaliesMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        criticite: count > 10 ? 'ELEVEE' : count > 5 ? 'MOYENNE' : 'FAIBLE'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    setAnomaliesFrequentes(anomaliesArray);
    
    // Performance par catégorie (simulée)
    const categories = ['Création', 'Modification', 'Position', 'Sanction', 'Annulation', 'Régularisation'];
    const perfParCategorie: PerformanceCategorie[] = categories.map(cat => ({
      categorie: cat,
      scoreMoyen: 20 + Math.floor(Math.random() * 60),
      count: 5 + Math.floor(Math.random() * 20),
      tendance: Math.random() > 0.5 ? 'hausse' : Math.random() > 0.5 ? 'baisse' : 'stable'
    }));
    
    setPerformanceParCategorie(perfParCategorie);
    
    // Évolution des scores (30 derniers jours simulés)
    const evolution = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      evolution.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        score: 30 + Math.floor(Math.random() * 50)
      });
    }
    setEvolutionScore(evolution);
  };

  // ==================== FILTRES ====================
  useEffect(() => {
    if (analyses.length === 0) return;
    
    let filtered = [...analyses];
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.numeroDossier.toLowerCase().includes(term) ||
        a.titre.toLowerCase().includes(term)
      );
    }
    
    // Filtre par catégorie de risque
    if (selectedRisque !== 'tous') {
      if (selectedRisque === 'conforme') {
        filtered = filtered.filter(a => a.scoreRisque < 30);
      } else if (selectedRisque === 'risque') {
        filtered = filtered.filter(a => a.scoreRisque >= 30 && a.scoreRisque < 70);
      } else if (selectedRisque === 'bloque') {
        filtered = filtered.filter(a => a.scoreRisque >= 70);
      }
    }
    
    // Filtre par période (simulé)
    if (selectedPeriode !== 'tous') {
      // Logique de filtre par période à implémenter selon vos besoins
    }
    
    setFilteredAnalyses(filtered);
  }, [analyses, searchTerm, selectedRisque, selectedPeriode]);

  // ==================== ACTIONS ====================
  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const handleViewDetails = (dossierId: string) => {
    navigate(`/dossiers/${dossierId}`);
  };

  const handleExportData = () => {
    toast.success('Export des données démarré');
  };

  // ==================== CHARGEMENT INITIAL ====================
  useEffect(() => {
    loadData();
  }, []);

  // ==================== RENDU ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== EN-TÊTE ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="w-8 h-8 text-green-600" />
            Analyses IA
          </h1>
          <p className="text-neutral-600 mt-1">
            Visualisez les analyses prédictives et les recommandations pour vos dossiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={handleExportData}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* ===== STATISTIQUES GLOBALES ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-green-600" />
            <h3 className="text-xs font-medium text-neutral-500">Score moyen</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.scoreMoyen}</p>
          <p className="text-xs text-neutral-500 mt-1">sur 100</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <h3 className="text-xs font-medium text-neutral-500">Conformes</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.dossiersConformes}</p>
          <p className="text-xs text-green-600 mt-1">Score &lt; 30</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="text-xs font-medium text-neutral-500">À risque</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.dossiersRisque}</p>
          <p className="text-xs text-yellow-600 mt-1">Score 30-70</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-medium text-neutral-500">Bloqués</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.dossiersBloques}</p>
          <p className="text-xs text-red-600 mt-1">Score &gt; 70</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-medium text-neutral-500">Retard prévu</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.dossiersRetardPrevu}</p>
          <p className="text-xs text-orange-600 mt-1">dossiers</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-medium text-neutral-500">Précision</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.precisionMoyenne}%</p>
          <p className="text-xs text-purple-600 mt-1">moyenne</p>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="bg-white rounded-xl shadow-soft p-4 border border-neutral-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par n° dossier ou titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-green-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 px-4 py-2"
          >
            <Filter size={18} />
            Filtres avancés
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-200 animate-slide-down">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Niveau de risque
              </label>
              <select
                value={selectedRisque}
                onChange={(e) => setSelectedRisque(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="tous">Tous les risques</option>
                <option value="conforme">Conforme (score &lt; 30)</option>
                <option value="risque">À risque (30-70)</option>
                <option value="bloque">Bloqué (&gt; 70)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Période
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
                <option value="tous">Toute l'histoire</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Catégorie
              </label>
              <select
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="tous">Toutes les catégories</option>
                <option value="creation">Création</option>
                <option value="modification">Modification</option>
                <option value="position">Position</option>
                <option value="sanction">Sanction</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ===== GRAPHIQUES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des scores */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Évolution des scores IA</h2>
            <Activity className="w-5 h-5 text-neutral-400" />
          </div>
          
          {evolutionScore.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionScore}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-500">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-2 text-neutral-300" />
                <p>Pas assez de données</p>
              </div>
            </div>
          )}
        </div>

        {/* Répartition des risques */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Répartition des risques</h2>
            <PieChart className="w-5 h-5 text-neutral-400" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={repartitionRisque.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {repartitionRisque.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== ANOMALIES FRÉQUENTES ET RECOMMANDATIONS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies fréquentes */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-neutral-900">Anomalies fréquentes</h2>
          </div>
          
          {anomaliesFrequentes.length > 0 ? (
            <div className="space-y-4">
              {anomaliesFrequentes.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-neutral-700 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        item.criticite === 'CRITIQUE' ? 'bg-red-500' :
                        item.criticite === 'ELEVEE' ? 'bg-orange-500' :
                        item.criticite === 'MOYENNE' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      <span className="truncate max-w-[200px]">{item.type}</span>
                    </span>
                    <span className="font-medium text-neutral-900">{item.count}x</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.criticite === 'CRITIQUE' ? 'bg-red-500' :
                        item.criticite === 'ELEVEE' ? 'bg-orange-500' :
                        item.criticite === 'MOYENNE' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.count / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <Activity size={48} className="mx-auto mb-2 text-neutral-300" />
              <p>Aucune anomalie détectée</p>
            </div>
          )}
        </div>

        {/* Recommandations IA */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-neutral-900">Recommandations IA</h2>
          </div>
          
          <div className="space-y-3">
            {stats.dossiersRetardPrevu > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                <Clock size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  <span className="font-medium">{stats.dossiersRetardPrevu} dossier(s)</span> risquent d'être en retard. 
                  Priorisez leur traitement.
                </p>
              </div>
            )}
            
            {anomaliesFrequentes.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  <span className="font-medium">Anomalie fréquente :</span> "{anomaliesFrequentes[0].type}" - 
                  Vérifiez ce point dans vos dossiers.
                </p>
              </div>
            )}
            
            {stats.scoreMoyen > 50 && (
              <div className="p-3 bg-orange-50 rounded-lg flex items-start gap-2">
                <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  Le score de risque moyen est élevé ({stats.scoreMoyen}). 
                  Améliorez la qualité des dossiers avant soumission.
                </p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 rounded-lg flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-700">
                Utilisez la liste de contrôle des documents avant chaque soumission.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg flex items-start gap-2">
              <Sparkles size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-700">
                Les dossiers avec photos sont traités 30% plus rapidement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PERFORMANCE PAR CATÉGORIE ===== */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-neutral-900">Performance par catégorie</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceParCategorie.map((item, index) => (
            <div key={index} className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-900">{item.categorie}</h3>
                <span className="text-xs bg-white px-2 py-1 rounded-full">
                  {item.count} dossiers
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.scoreMoyen < 30 ? 'bg-green-500' :
                      item.scoreMoyen < 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.scoreMoyen}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{item.scoreMoyen}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <span className="text-neutral-500">Tendance:</span>
                {item.tendance === 'hausse' && <TrendingUp size={14} className="text-red-500" />}
                {item.tendance === 'baisse' && <TrendingDown size={14} className="text-green-500" />}
                {item.tendance === 'stable' && <span className="text-neutral-400">→</span>}
                <span className="text-neutral-600">
                  {item.tendance === 'hausse' ? 'Risque en hausse' : 
                   item.tendance === 'baisse' ? 'Amélioration' : 'Stable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LISTE DES ANALYSES DÉTAILLÉES ===== */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Analyses détaillées</h2>
          <span className="text-sm text-neutral-500">
            {filteredAnalyses.length} résultat(s)
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">N° Dossier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Titre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Score IA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Classification</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Anomalies</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Délai prévu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Confiance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredAnalyses.slice(0, 10).map((analyse, index) => (
                <tr key={index} className="hover:bg-neutral-50 cursor-pointer" onClick={() => handleViewDetails(analyse.dossierId)}>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    {analyse.numeroDossier}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900 max-w-xs truncate">
                    {analyse.titre}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            analyse.scoreRisque < 30 ? 'bg-green-500' :
                            analyse.scoreRisque < 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${analyse.scoreRisque}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{analyse.scoreRisque}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analyse.scoreRisque < 30 ? 'bg-green-100 text-green-700' :
                      analyse.scoreRisque < 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {analyse.classification}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {analyse.anomalies.length} anomalie(s)
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {analyse.delaiPrevu} jours
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${
                        analyse.confiance > 80 ? 'text-green-600' :
                        analyse.confiance > 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {analyse.confiance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAnalyses.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center justify-center gap-1">
              Voir tous les résultats
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ===== NOTES MANUSCRITES ===== */}
      <div className="bg-neutral-50 rounded-lg p-4 text-xs text-neutral-500 border border-neutral-200">
        <p className="font-medium mb-1 flex items-center gap-1">
          <Info size={12} />
          Notes manuscrites:
        </p>
        <p>HAUT EMPLOI DE L'ETAT (majoration) - Fonc: 0, Non fonc: 1, Fonc non permanent: A à J, Non fonc non permanent: K à T</p>
        <p className="mt-1">542: Indemnité de Fonction d'encadrement | 543: Indemnité de Fonction Spéciale</p>
      </div>
    </div>
  );
};

export default IAAnalyses;