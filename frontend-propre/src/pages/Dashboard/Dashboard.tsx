// src/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Eye,
  Plus,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Download,
  ChevronRight,
  Info,
  User,
  Calendar,
  DollarSign,
  Briefcase,
  GraduationCap
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
import KpiCard from '../../components/Common/KpiCard';
import StatusChip from '../../components/Common/StatusChip';
import ScoreIA from '../../components/Common/ScoreIA';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import toast from 'react-hot-toast';

// ==================== TYPES ====================
interface Statistiques {
  total: number;
  enCours: number;
  termines: number;
  enRetard: number;
  bloques: number;
  parEtape: Record<string, number>;
  parType: Record<string, number>;
  evolutionHebdo: Array<{ jour: string; crees: number; termines: number }>;
}

// ==================== COULEURS ====================
const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#86efac', '#4ade80', '#f97316'];

// ==================== COMPOSANT PRINCIPAL ====================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [dossiersRecents, setDossiersRecents] = useState<Dossier[]>([]);
  const [stats, setStats] = useState<Statistiques>({
    total: 0,
    enCours: 0,
    termines: 0,
    enRetard: 0,
    bloques: 0,
    parEtape: {},
    parType: {},
    evolutionHebdo: []
  });

  // Données pour les graphiques
  const [donneesEtapes, setDonneesEtapes] = useState([
    { étape: 'Intéressé', count: 0 },
    { étape: 'DREN', count: 0 },
    { étape: 'MEN', count: 0 },
    { étape: 'FOP', count: 0 },
    { étape: 'Finance', count: 0 },
  ]);

  const [donneesTypes, setDonneesTypes] = useState([
    { name: 'Promotion', value: 0 },
    { name: 'Mutation', value: 0 },
    { name: 'Congé', value: 0 },
    { name: 'Retraite', value: 0 },
    { name: 'Autre', value: 0 },
  ]);

  const [donneesEvolution, setDonneesEvolution] = useState([
    { jour: 'Lun', crees: 0, termines: 0 },
    { jour: 'Mar', crees: 0, termines: 0 },
    { jour: 'Mer', crees: 0, termines: 0 },
    { jour: 'Jeu', crees: 0, termines: 0 },
    { jour: 'Ven', crees: 0, termines: 0 },
    { jour: 'Sam', crees: 0, termines: 0 },
    { jour: 'Dim', crees: 0, termines: 0 },
  ]);

  const [donneesDuree, setDonneesDuree] = useState([
    { etape: 'Intéressé', duree: 0, objectif: 5 },
    { etape: 'DREN', duree: 0, objectif: 7 },
    { etape: 'MEN', duree: 0, objectif: 5 },
    { etape: 'FOP', duree: 0, objectif: 7 },
    { etape: 'Finance', duree: 0, objectif: 5 },
  ]);

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';

  // ==================== CHARGEMENT DES DONNÉES ====================
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement des données du dashboard...');
      
      // Récupérer les dossiers
      const dossiers = await dossierService.getDossiersForUser(userEmail, userRole);
      console.log('📥 Dossiers reçus:', dossiers.length);
      
      // Trier par date et prendre les 5 plus récents
      const recents = [...dossiers]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setDossiersRecents(recents);
      
      // Calculer les statistiques
      const enCours = dossiers.filter(d => 
        ['BROUILLON', 'EN_ATTENTE_DREN', 'EN_ATTENTE_MEN', 'EN_ATTENTE_FOP', 'EN_ATTENTE_FINANCE'].includes(d.statut)
      ).length;
      
      const termines = dossiers.filter(d => d.statut === 'TERMINE').length;
      
      const enRetard = dossiers.filter(d => {
        if (d.date_limite && d.statut !== 'TERMINE') {
          return new Date(d.date_limite) < new Date();
        }
        return false;
      }).length;
      
      const bloques = dossiers.filter(d => d.statut === 'BLOQUE' || d.statut === 'REJETE').length;
      
      // Compter par étape
      const parEtape: Record<string, number> = {};
      dossiers.forEach(d => {
        const etape = d.etape_actuelle || 'INCONNU';
        parEtape[etape] = (parEtape[etape] || 0) + 1;
      });
      
      // Compter par type
      const parType: Record<string, number> = {};
      dossiers.forEach(d => {
        const type = d.type_dossier || 'AUTRE';
        parType[type] = (parType[type] || 0) + 1;
      });
      
      setStats({
        total: dossiers.length,
        enCours,
        termines,
        enRetard,
        bloques,
        parEtape,
        parType,
        evolutionHebdo: []
      });
      
      // Mettre à jour les données des graphiques
      const nouvellesDonneesEtapes = donneesEtapes.map(item => ({
        ...item,
        count: parEtape[item.étape.toUpperCase()] || 0
      }));
      setDonneesEtapes(nouvellesDonneesEtapes);
      
      const nouvellesDonneesTypes = [
        { name: 'Promotion', value: parType['PROMOTION'] || 0 },
        { name: 'Mutation', value: parType['MUTATION'] || 0 },
        { name: 'Congé', value: parType['CONGE'] || 0 },
        { name: 'Retraite', value: parType['RETRAITE'] || 0 },
        { name: 'Autre', value: parType['AUTRE'] || 0 },
      ];
      setDonneesTypes(nouvellesDonneesTypes);
      
      console.log('✅ Données du dashboard chargées');
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userEmail, userRole]);

  // ==================== GESTIONNAIRES ====================
  const refreshData = () => {
    loadDashboardData();
    toast.success('Données actualisées');
  };

  const handleVoirTous = () => {
    navigate('/dossiers');
  };

  // ==================== RENDU ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== EN-TÊTE ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">
            Bienvenue, {user?.first_name} {user?.last_name} ({user?.role?.name || userRole})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userRole === 'UTILISATEUR' && (
            <button
              onClick={() => navigate('/dossiers/creer')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nouveau dossier</span>
            </button>
          )}
          <button
            onClick={refreshData}
            className="btn-secondary p-2.5"
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Dossiers en cours"
          value={stats.enCours}
          icon={<FolderOpen className="w-6 h-6" />}
          color="info"
          trend={{ value: Math.round((stats.enCours / (stats.total || 1)) * 100), isPositive: true }}
        />
        <KpiCard
          title="Dossiers terminés"
          value={stats.termines}
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
          trend={{ value: Math.round((stats.termines / (stats.total || 1)) * 100), isPositive: true }}
        />
        <KpiCard
          title="En retard"
          value={stats.enRetard}
          icon={<Clock className="w-6 h-6" />}
          color="warning"
          trend={{ value: Math.round((stats.enRetard / (stats.total || 1)) * 100), isPositive: false }}
        />
        <KpiCard
          title="Dossiers bloqués"
          value={stats.bloques}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="error"
          trend={{ value: Math.round((stats.bloques / (stats.total || 1)) * 100), isPositive: false }}
        />
      </div>

      {/* ===== GRAPHIQUES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPHIQUE 1: Dossiers par étape */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dossiers par étape</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donneesEtapes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="étape" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                    label={{ position: 'top', fill: '#6b7280', fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deux petits graphiques en dessous */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Graphique Délais */}
            <div className="card">
              <h3 className="font-medium text-gray-700 mb-3">Délais moyens (jours)</h3>
              <div className="space-y-3">
                {donneesDuree.map((item, idx) => (
                  <div key={item.etape}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.etape}</span>
                      <span className="font-medium">{item.duree}j / {item.objectif}j</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.duree <= item.objectif ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.duree / item.objectif) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique Répartition par type */}
            <div className="card">
              <h3 className="font-medium text-gray-700 mb-3">Répartition par type</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={donneesTypes.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {donneesTypes.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Alertes et statistiques rapides */}
        <div className="lg:col-span-1 space-y-6">
          {/* Alertes IA */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Alertes</h2>
            </div>
            
            <div className="space-y-3">
              {stats.enRetard > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.enRetard} dossier(s) en retard</p>
                    <p className="text-xs text-gray-600 mt-1">Délai de traitement dépassé</p>
                  </div>
                </div>
              )}
              
              {stats.bloques > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.bloques} dossier(s) bloqué(s)</p>
                    <p className="text-xs text-gray-600 mt-1">Nécessitent une action</p>
                  </div>
                </div>
              )}
              
              {stats.enRetard === 0 && stats.bloques === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aucune alerte</p>
                    <p className="text-xs text-gray-600 mt-1">Tous les dossiers sont à jour</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taux de complétion</span>
                <span className="text-sm font-medium">
                  {Math.round((stats.termines / (stats.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(stats.termines / (stats.total || 1)) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-600">Dossiers actifs</span>
                <span className="text-sm font-medium">{stats.enCours}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Délai moyen</span>
                <span className="text-sm font-medium">5.5 jours</span>
              </div>
            </div>
          </div>

          {/* Derniers dossiers */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Derniers dossiers</h2>
              <button
                onClick={handleVoirTous}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                Voir tous
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {dossiersRecents.length > 0 ? (
                dossiersRecents.map((dossier) => (
                  <div
                    key={dossier.id}
                    onClick={() => navigate(`/dossiers/${dossier.id}`)}
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {dossier.numero_dossier}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{dossier.titre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusChip status={dossier.statut} />
                        <span className="text-xs text-gray-400">
                          {new Date(dossier.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucun dossier récent</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION ÉVOLUTION ===== */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Évolution hebdomadaire</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={donneesEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="crees" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="termines" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== LISTE COMPLÈTE DES DOSSIERS RÉCENTS ===== */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Dossiers récents</h2>
          <button
            onClick={handleVoirTous}
            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
          >
            Voir tous
            <Eye size={16} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Dossier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étape</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dossiersRecents.map((dossier) => (
                <tr
                  key={dossier.id}
                  onClick={() => navigate(`/dossiers/${dossier.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    {dossier.numero_dossier}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {dossier.titre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dossier.etape_actuelle}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={dossier.statut} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(dossier.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dossiers/${dossier.id}`);
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {dossiersRecents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Aucun dossier trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;