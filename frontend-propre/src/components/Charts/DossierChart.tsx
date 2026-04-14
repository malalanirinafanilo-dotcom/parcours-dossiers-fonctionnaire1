// src/components/Charts/DossierChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Dossier } from '../../types';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DossierChartProps {
  dossiers: Dossier[];
}

const DossierChart: React.FC<DossierChartProps> = ({ dossiers }) => {
  // Générer les 30 derniers jours
  const generateChartData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Compter les dossiers créés ce jour
      const crees = dossiers.filter(d => 
        format(new Date(d.date_depot), 'yyyy-MM-dd') === dateStr
      ).length;
      
      // Compter les dossiers terminés ce jour
      const termines = dossiers.filter(d => 
        d.date_cloture && format(new Date(d.date_cloture), 'yyyy-MM-dd') === dateStr
      ).length;
      
      data.push({
        date: format(date, 'dd MMM', { locale: fr }),
        crees,
        termines,
      });
    }
    return data;
  };

  const data = generateChartData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
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
        <Legend />
        <Line
          type="monotone"
          dataKey="crees"
          name="Créés"
          stroke="#0056e0"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="termines"
          name="Terminés"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DossierChart;