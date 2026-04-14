// src/components/Charts/DelaisChart.tsx
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Dossier } from '../../types';

interface DelaisChartProps {
  dossiers: Dossier[];
}

const DelaisChart: React.FC<DelaisChartProps> = ({ dossiers }) => {
  // Simuler des données de délais par étape
  const generateData = () => {
    const etapes = ['Intéressé', 'DREN', 'MEN', 'FOP', 'Finance'];
    return etapes.map((etape, index) => ({
      etape,
      reel: Math.floor(Math.random() * 8) + 3,
      cible: 5,
    }));
  };

  const data = generateData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="etape" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Jours', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Area
          type="monotone"
          dataKey="cible"
          name="Objectif"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.1}
        />
        <Area
          type="monotone"
          dataKey="reel"
          name="Réel"
          stroke="#0056e0"
          fill="#0056e0"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default DelaisChart;