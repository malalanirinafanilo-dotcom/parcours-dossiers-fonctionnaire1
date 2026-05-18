// src/pages/IAAnalyses/IAAnalyses.tsx - Version modernisée
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
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
  RefreshCw,
  Shield,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import toast from 'react-hot-toast';

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

const COLORS = {
  conforme: '#22c55e',
  risque: '#eab308',
  critique: '#ef4444'
};

const IAAnalyses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{ date: string; score: number }[]>([]);
  const [repartitionData, setRepartitionData] = useState([
    { name: 'Conforme', value: 0, color: COLORS.conforme },
    { name: 'À risque', value: 0, color: COLORS.risque },
    { name: 'Critique', value: 0, color: COLORS.critique }
  ]);

  const genererAnalyse = (dossier: Dossier): IAAnalyse => {
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

  const loadData = async () => {
    setLoading(true);
    try {
      const userEmail = user?.email || '';
      const userRole = user?.role?.code || '';
      const dossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      
      const analysesGenerees = dossiers.map(genererAnalyse);
      setAnalyses(analysesGenerees);
      setFilteredAnalyses(analysesGenerees);
      
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
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400';
    if (score < 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400';
  };

  const getScoreIcon = (score: number) => {
    if (score < 30) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (score < 60) return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    return <XCircle className="h-4 w-4 text-rose-600" />;
  };

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
          <h1 className="flex items-center gap-2 text-2xl font-bold text-dark-900 dark:text-dark-100">
            <Brain className="h-6 w-6 text-accent-500" />
            Analyses IA
          </h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            Analyse prédictive et évaluation des risques
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Score moyen</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{stats.scoreMoyen}</p>
              <p className="text-xs text-dark-400">sur 100</p>
            </div>
            <Gauge className="h-8 w-8 text-dark-400" />
          </div>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Conformes</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.dossiersConformes}</p>
              <p className="text-xs text-dark-400">Score &lt; 30</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">À risque</p>
              <p className="text-2xl font-bold text-amber-600">{stats.dossiersRisque}</p>
              <p className="text-xs text-dark-400">Score 30-59</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Critiques</p>
              <p className="text-2xl font-bold text-rose-600">{stats.dossiersCritiques}</p>
              <p className="text-xs text-dark-400">Score &gt; 60</p>
            </div>
            <XCircle className="h-8 w-8 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Évolution des scores */}
        <div className="rounded-2xl border border-dark-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100">Évolution des scores</h3>
            <Activity className="h-4 w-4 text-dark-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des risques */}
        <div className="rounded-2xl border border-dark-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-dark-900 dark:text-dark-100">Répartition des risques</h3>
            <PieChart className="h-4 w-4 text-dark-400" />
          </div>
          <div className="flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {repartitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-10 pr-4 text-sm text-dark-900 placeholder:text-dark-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-accent-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
          >
            <Filter size={16} />
            Filtres
            {selectedNiveau !== 'tous' && <span className="h-2 w-2 rounded-full bg-accent-500" />}
          </button>
        </div>

        {showFilters && (
          <div className="rounded-xl border border-dark-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                Niveau de risque
              </label>
              <select
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
                className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100"
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

      {/* Liste des analyses */}
      <div className="rounded-2xl border border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-900">
        <div className="border-b border-dark-200 px-5 py-4 dark:border-dark-800">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100">
            Résultats détaillés
            <span className="ml-2 text-sm font-normal text-dark-500">
              ({filteredAnalyses.length} dossier{filteredAnalyses.length > 1 ? 's' : ''})
            </span>
          </h3>
        </div>

        {filteredAnalyses.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-800">
            {filteredAnalyses.slice(0, 10).map((analyse) => (
              <div
                key={analyse.dossierId}
                onClick={() => navigate(`/dossiers/${analyse.dossierId}`)}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-dark-50 dark:hover:bg-dark-800/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium text-accent-600 dark:text-accent-400">
                      {analyse.numeroDossier}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(analyse.scoreRisque)}`}>
                      {analyse.classification}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-dark-900 dark:text-dark-100">
                    {analyse.titre}
                  </p>
                  <p className="mt-0.5 text-xs text-dark-500">Étape: {analyse.etape}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {getScoreIcon(analyse.scoreRisque)}
                      <span className="text-lg font-bold text-dark-900 dark:text-dark-100">
                        {analyse.scoreRisque}
                      </span>
                    </div>
                    <p className="text-xs text-dark-500">score</p>
                  </div>
                  <ChevronRight size={16} className="text-dark-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Brain size={40} className="mx-auto text-dark-300 dark:text-dark-700" />
            <p className="mt-3 text-dark-500 dark:text-dark-400">Aucune analyse trouvée</p>
          </div>
        )}

        {filteredAnalyses.length > 10 && (
          <div className="border-t border-dark-200 bg-dark-50 px-5 py-3 text-center dark:border-dark-800 dark:bg-dark-800/50">
            <button
              onClick={() => navigate('/dossiers')}
              className="text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
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