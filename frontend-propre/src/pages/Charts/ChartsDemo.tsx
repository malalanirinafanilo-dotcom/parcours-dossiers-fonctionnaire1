import React, { useState } from 'react';
import BarChart from '../../components/Charts/BarChart';
import LineChart from '../../components/Charts/LineChart';
import PieChart from '../../components/Charts/PieChart';
import AreaChart from '../../components/Charts/AreaChart';

const ChartsDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Données d'exemple
  const monthlyData = [
    { categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], values: [65, 59, 80, 81, 56, 55], name: '2024' },
    { categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], values: [45, 72, 68, 74, 85, 62], name: '2025' },
  ];

  const lineData = [
    { x: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'], 
      y: [65, 72, 80, 81, 75, 68, 72, 78, 82, 79, 71, 69], 
      name: 'Dossiers créés', 
      color: '#22C55E' },
    { x: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'], 
      y: [45, 52, 58, 62, 55, 48, 52, 58, 62, 59, 51, 48], 
      name: 'Dossiers terminés', 
      color: '#16A34A' },
  ];

  const pieData = [
    { 
      labels: ['DREN', 'MEN', 'FOP', 'FINANCE', 'Intéressé'], 
      values: [35, 25, 20, 15, 5],
      name: 'Répartition des dossiers'
    }
  ];

  const areaData = [
    { x: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], y: [120, 145, 168, 192], name: 'Dossiers reçus', color: '#22C55E' },
    { x: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], y: [98, 112, 135, 156], name: 'Dossiers traités', color: '#16A34A' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-neutral-900">Démonstration des graphiques Plotly</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphiques en barres */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dossiers par mois (Barres)</h2>
          <BarChart
            title="Évolution mensuelle"
            xAxisTitle="Mois"
            yAxisTitle="Nombre de dossiers"
            data={monthlyData}
            height={350}
            loading={loading}
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dossiers par mois (Barres empilées)</h2>
          <BarChart
            title="Comparaison annuelle"
            xAxisTitle="Mois"
            yAxisTitle="Nombre de dossiers"
            data={monthlyData}
            stacked={true}
            height={350}
            loading={loading}
          />
        </div>

        {/* Graphiques linéaires */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Tendance annuelle (Lignes)</h2>
          <LineChart
            title="Création vs Traitement"
            xAxisTitle="Mois"
            yAxisTitle="Nombre de dossiers"
            data={lineData}
            height={350}
            showLegend={true}
            loading={loading}
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Tendance avec marqueurs</h2>
          <LineChart
            title="Évolution avec points"
            xAxisTitle="Mois"
            yAxisTitle="Nombre de dossiers"
            data={lineData.map(d => ({ ...d, markers: true }))}
            height={350}
            loading={loading}
          />
        </div>

        {/* Graphiques circulaires */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Répartition (Camembert)</h2>
          <PieChart
            title="Distribution des dossiers"
            data={pieData}
            height={350}
            showLegend={true}
            loading={loading}
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Répartition (Donut)</h2>
          <PieChart
            title="Distribution (Donut)"
            data={pieData}
            height={350}
            showLegend={true}
            donut={true}
            loading={loading}
          />
        </div>

        {/* Graphiques en aires */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Évolution en aires</h2>
          <AreaChart
            title="Progression hebdomadaire"
            xAxisTitle="Semaines"
            yAxisTitle="Nombre de dossiers"
            data={areaData}
            height={350}
            stacked={true}
            loading={loading}
          />
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setLoading(!loading)}
          className="btn-secondary"
        >
          Toggle chargement
        </button>
      </div>
    </div>
  );
};

export default ChartsDemo;