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
  Activity,
  Zap,
  Sparkles,
  Target,
  Gauge,
  Search,
  X,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
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
  confiance: number;
}

interface StatsIA {
  scoreMoyen: number;
  dossiersConformes: number;
  dossiersRisque: number;
  dossiersCritiques: number;
  totalAnalyses: number;
}

// ==================== COULEURS ====================
const COLORS = {
  conforme: '#22c55e',
  risque: '#eab308',
  critique: '#ef4444'
};

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
    dossiersCritiques: 0,
    totalAnalyses: 0
  });
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  // Données pour les graphiques
  const [evolutionData, setEvolutionData] = useState<{ date: string; score: number }[]>([]);
  const [repartitionData, setRepartitionData] = useState([
    { name: 'Conforme', value: 0, color: COLORS.conforme },
    { name: 'À risque', value: 0, color: COLORS.risque },
    { name: 'Critique', value: 0, color: COLORS.critique }
  ]);

  // ==================== SIMULATION D'ANALYSE IA ====================
  const genererAnalyse = (dossier: Dossier): IAAnalyse => {
    // Simulation d'un score basé sur le statut et l'étape
    let scoreRisque = 0;
    let anomalies: string[] = [];
    
    if (dossier.statut === 'REJETE') {
      scoreRisque = 85 + Math.floor(Math.random() * 15);
      anomalies.push('Document(s) manquant(s)');
    } else if (dossier.statut === 'BLOQUE') {
      scoreRisque = 70 + Math.floor(Math.random() * 20);
      anomalies.push('Validation en attente');
    } else if (dossier.statut === 'TERMINE') {
      scoreRisque = 10 + Math.floor(Math.random() * 15);
    } else if (dossier.etape_actuelle === 'INTERESSE') {
      scoreRisque = 25 + Math.floor(Math.random() * 25);
    } else if (dossier.etape_actuelle === 'DREN') {
      scoreRisque = 40 + Math.floor(Math.random() * 20);
      anomalies.push('Vérification en cours');
    } else if (dossier.etape_actuelle === 'MEN') {
      scoreRisque = 50 + Math.floor(Math.random() * 20);
    } else if (dossier.etape_actuelle === 'FOP') {
      scoreRisque = 55 + Math.floor(Math.random() * 20);
    } else if (dossier.etape_actuelle === 'FINANCE') {
      scoreRisque = 60 + Math.floor(Math.random() * 20);
    } else {
      scoreRisque = 30 + Math.floor(Math.random() * 40);
    }

    // Limiter le score entre 0 et 100
    scoreRisque = Math.min(100, Math.max(0, scoreRisque));
    
    let classification = '';
    if (scoreRisque < 30) classification = 'Conforme';
    else if (scoreRisque < 60) classification = 'À risque modéré';
    else classification = 'Critique';

    return {
      dossierId: dossier.id,
      numeroDossier: dossier.numero_dossier,
      titre: dossier.titre,
      etape: dossier.etape_actuelle,
      statut: dossier.statut,
      scoreRisque,
      classification,
      anomalies,
      confiance: 75 + Math.floor(Math.random() * 20)
    };
  };

  // ==================== CHARGEMENT DES DONNÉES ====================
  const loadData = async () => {
    setLoading(true);
    try {
      const dossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      
      // Générer les analyses
      const analysesGenerees = dossiers.map(genererAnalyse);
      setAnalyses(analysesGenerees);
      setFilteredAnalyses(analysesGenerees);
      
      // Calculer les stats
      const conformes = analysesGenerees.filter(a => a.scoreRisque < 30).length;
      const risque = analysesGenerees.filter(a => a.scoreRisque >= 30 && a.scoreRisque < 60).length;
      const critiques = analysesGenerees.filter(a => a.scoreRisque >= 60).length;
      const scoreMoyen = analysesGenerees.reduce((acc, a) => acc + a.scoreRisque, 0) / (analysesGenerees.length || 1);
      
      setStats({
        scoreMoyen: Math.round(scoreMoyen),
        dossiersConformes: conformes,
        dossiersRisque: risque,
        dossiersCritiques: critiques,
        totalAnalyses: analysesGenerees.length
      });
      
      setRepartitionData([
        { name: 'Conforme', value: conformes, color: COLORS.conforme },
        { name: 'À risque', value: risque, color: COLORS.risque },
        { name: 'Critique', value: critiques, color: COLORS.critique }
      ]);
      
      // Générer des données d'évolution simulées
      const evolution = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        evolution.push({
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          score: 30 + Math.floor(Math.random() * 50)
        });
      }
      setEvolutionData(evolution);
      
    } catch (error) {
      console.error('❌ Erreur chargement analyses:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTRES ====================
  useEffect(() => {
    let filtered = [...analyses];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.numeroDossier.toLowerCase().includes(term) ||
        a.titre.toLowerCase().includes(term)
      );
    }
    
    if (selectedNiveau !== 'tous') {
      if (selectedNiveau === 'conforme') {
        filtered = filtered.filter(a => a.scoreRisque < 30);
      } else if (selectedNiveau === 'risque') {
        filtered = filtered.filter(a => a.scoreRisque >= 30 && a.scoreRisque < 60);
      } else if (selectedNiveau === 'critique') {
        filtered = filtered.filter(a => a.scoreRisque >= 60);
      }
    }
    
    setFilteredAnalyses(filtered);
  }, [analyses, searchTerm, selectedNiveau]);

  // ==================== ACTIONS ====================
  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  // ==================== INITIALISATION ====================
  useEffect(() => {
    loadData();
  }, []);

  // ==================== COMPOSANTS D'AFFICHAGE ====================
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50';
    if (score < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score < 30) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (score < 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  // ==================== RENDU ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== EN-TÊTE ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-600" />
            Analyses IA
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            Analyse prédictive et évaluation des risques
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 px-4 py-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-soft border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">Score moyen</span>
            <Gauge className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.scoreMoyen}</p>
          <p className="text-xs text-neutral-500 mt-1">sur 100</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-soft border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">Conformes</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.dossiersConformes}</p>
          <p className="text-xs text-neutral-500 mt-1">Score &lt; 30</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-soft border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">À risque</span>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.dossiersRisque}</p>
          <p className="text-xs text-neutral-500 mt-1">Score 30-59</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-soft border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">Critiques</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.dossiersCritiques}</p>
          <p className="text-xs text-neutral-500 mt-1">Score &gt; 60</p>
        </div>
      </div>

      {/* ===== GRAPHIQUES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique d'évolution */}
        <div className="bg-white rounded-xl p-5 shadow-soft border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Évolution des scores</h3>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique de répartition */}
        <div className="bg-white rounded-xl p-5 shadow-soft border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Répartition des risques</h3>
            <Target className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {repartitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-neutral-100">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-green-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Filter size={14} />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Niveau de risque</label>
              <select
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg"
              >
                <option value="tous">Tous</option>
                <option value="conforme">Conforme (score &lt; 30)</option>
                <option value="risque">À risque (30-59)</option>
                <option value="critique">Critique (&gt; 60)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ===== LISTE DES ANALYSES ===== */}
      <div className="bg-white rounded-xl shadow-soft border border-neutral-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">
            Résultats détaillés
            <span className="ml-2 text-sm font-normal text-neutral-500">
              ({filteredAnalyses.length} dossier{filteredAnalyses.length > 1 ? 's' : ''})
            </span>
          </h3>
        </div>

        {filteredAnalyses.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredAnalyses.slice(0, 10).map((analyse) => (
              <div
                key={analyse.dossierId}
                onClick={() => navigate(`/dossiers/${analyse.dossierId}`)}
                className="px-5 py-4 hover:bg-neutral-50 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      {analyse.numeroDossier}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(analyse.scoreRisque)}`}>
                      {analyse.classification}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 mt-1 truncate">{analyse.titre}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Étape: {analyse.etape}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {getScoreIcon(analyse.scoreRisque)}
                      <span className="text-lg font-bold text-neutral-900">{analyse.scoreRisque}</span>
                    </div>
                    <p className="text-xs text-neutral-500">score</p>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Brain size={40} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500">Aucune analyse trouvée</p>
          </div>
        )}

        {filteredAnalyses.length > 10 && (
          <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-center">
            <button 
              onClick={() => navigate('/dossiers')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Voir tous les dossiers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IAAnalyses;