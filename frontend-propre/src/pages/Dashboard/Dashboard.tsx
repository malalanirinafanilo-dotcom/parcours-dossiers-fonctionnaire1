// src/pages/Dashboard/Dashboard.tsx - Version modernisée pour TOUS les comptes
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FolderOpen, CheckCircle, Clock, AlertTriangle, TrendingUp, FileText, Eye,
  Plus, RefreshCw, ChevronRight, User, Calendar, ArrowUpRight, ArrowDownRight,
  Activity, Shield, Zap, BarChart3, PieChart, Sparkles, Inbox, Send, XCircle
} from 'lucide-react';
import { RootState } from '../../store';
import { dossierService } from '../../services/dossierService';
import { Dossier } from '../../types';
import StatusChip from '../../components/Common/StatusChip';
import toast from 'react-hot-toast';

// Composant KPI Card modernisé
const KpiCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}> = ({ title, value, icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-dark-200 bg-white p-6 transition-all duration-200 hover:shadow-md dark:border-dark-800 dark:bg-dark-900"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-dark-900 dark:text-dark-100">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <ArrowUpRight size={14} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={14} className="text-rose-500" />
              )}
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}%
              </span>
              <span className="text-xs text-dark-400">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Composant DossierCard modernisé
const DossierCard: React.FC<{ dossier: Dossier; onClick: () => void }> = ({ dossier, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 4 }}
    onClick={onClick}
    className="cursor-pointer rounded-xl border border-dark-200 bg-white p-4 transition-all hover:shadow-md dark:border-dark-800 dark:bg-dark-900"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-primary-600 dark:text-primary-400">
            {dossier.numero_dossier}
          </span>
          <StatusChip status={dossier.statut} size="sm" />
        </div>
        <p className="mt-1 font-medium text-dark-900 dark:text-dark-100">{dossier.titre}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-dark-500">
          <span className="flex items-center gap-1">
            <User size={12} className="text-primary-500" />
            {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} className="text-primary-500" />
            {new Date(dossier.date_depot).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
      <Eye size={16} className="text-dark-400" />
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    termines: 0,
    enRetard: 0,
    aTraiter: 0,
  });

  const userEmail = user?.email || '';
  const userRole = user?.role?.code || '';
  const isInteresse = userRole === 'UTILISATEUR' || userEmail.includes('interesse');
  const isDREN = userRole === 'DREN' || userEmail.includes('dren');
  const isMEN = userRole === 'MEN' || userEmail.includes('men');
  const isFOP = userRole === 'FOP' || userEmail.includes('fop');
  const isFINANCE = userRole === 'FINANCE' || userEmail.includes('finance');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dossiersData = await dossierService.getDossiersForUser(userEmail, userRole);
      setDossiers(dossiersData);
      
      const enCours = dossiersData.filter(d => 
        ['EN_ATTENTE_DREN', 'EN_ATTENTE_MEN', 'EN_ATTENTE_FOP', 'EN_ATTENTE_FINANCE', 'EN_COURS'].includes(d.statut)
      ).length;
      
      const termines = dossiersData.filter(d => d.statut === 'TERMINE').length;
      
      const enRetard = dossiersData.filter(d => {
        if (d.date_limite && d.statut !== 'TERMINE') {
          return new Date(d.date_limite) < new Date();
        }
        return false;
      }).length;
      
      let aTraiter = 0;
      if (isDREN) aTraiter = dossiersData.filter(d => d.etape_actuelle === 'DREN').length;
      else if (isMEN) aTraiter = dossiersData.filter(d => d.etape_actuelle === 'MEN').length;
      else if (isFOP) aTraiter = dossiersData.filter(d => d.etape_actuelle === 'FOP').length;
      else if (isFINANCE) aTraiter = dossiersData.filter(d => d.etape_actuelle === 'FINANCE').length;
      
      setStats({
        total: dossiersData.length,
        enCours,
        termines,
        enRetard,
        aTraiter,
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userEmail, userRole]);

  const dossiersRecents = [...dossiers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            Bienvenue, {user?.first_name || user?.email?.split('@')[0]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isInteresse && (
            <button
              onClick={() => navigate('/dossiers/creer')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
            >
              <Plus size={18} />
              Nouveau dossier
            </button>
          )}
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-600 transition-all hover:bg-dark-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-400"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total dossiers"
          value={stats.total}
          icon={<FolderOpen size={22} />}
          color="primary"
        />
        <KpiCard
          title="En cours"
          value={stats.enCours}
          icon={<Activity size={22} />}
          color="blue"
        />
        <KpiCard
          title="Terminés"
          value={stats.termines}
          icon={<CheckCircle size={22} />}
          color="emerald"
        />
        <KpiCard
          title="En retard"
          value={stats.enRetard}
          icon={<AlertTriangle size={22} />}
          color="amber"
        />
        {!isInteresse && (
          <KpiCard
            title="À traiter"
            value={stats.aTraiter}
            icon={<Inbox size={22} />}
            color="primary"
          />
        )}
      </div>

      {/* Graphiques et répartition */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activité récente simplifiée */}
        <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-dark-900 dark:text-dark-100">Activité récente</h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">Derniers mouvements</p>
            </div>
            <BarChart3 size={18} className="text-dark-400" />
          </div>
          <div className="space-y-3">
            {dossiersRecents.slice(0, 3).map((dossier) => (
              <div key={dossier.id} className="flex items-center justify-between border-b border-dark-100 pb-3 dark:border-dark-800">
                <div>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{dossier.numero_dossier}</p>
                  <p className="text-xs text-dark-500">{dossier.titre}</p>
                </div>
                <StatusChip status={dossier.statut} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="rounded-2xl border border-dark-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-dark-900 dark:text-dark-100">Répartition</h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">Par statut</p>
            </div>
            <PieChart size={18} className="text-dark-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-600 dark:text-dark-400">En cours</span>
                <span className="font-medium text-dark-900 dark:text-dark-100">{stats.enCours}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-dark-100 dark:bg-dark-800">
                <div
                  className="h-2 rounded-full bg-primary-500"
                  style={{ width: `${(stats.enCours / stats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-600 dark:text-dark-400">Terminés</span>
                <span className="font-medium text-dark-900 dark:text-dark-100">{stats.termines}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-dark-100 dark:bg-dark-800">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${(stats.termines / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dossiers récents */}
      <div className="rounded-2xl border border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-900">
        <div className="flex items-center justify-between border-b border-dark-200 px-6 py-4 dark:border-dark-800">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100">Dossiers récents</h3>
          <button
            onClick={() => navigate('/dossiers')}
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Voir tous
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="divide-y divide-dark-200 dark:divide-dark-800">
          {dossiersRecents.length > 0 ? (
            dossiersRecents.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                onClick={() => navigate(`/dossiers/${dossier.id}`)}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <FileText size={48} className="mx-auto text-dark-300 dark:text-dark-700" />
              <p className="mt-3 text-dark-500 dark:text-dark-400">Aucun dossier récent</p>
              {isInteresse && (
                <button
                  onClick={() => navigate('/dossiers/creer')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white"
                >
                  <Plus size={16} />
                  Créer un dossier
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;