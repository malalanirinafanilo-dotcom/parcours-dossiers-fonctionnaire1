// src/components/Charts/RepartitionChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Dossier } from '../../types';

interface RepartitionChartProps {
  dossiers: Dossier[];
}

const RepartitionChart: React.FC<RepartitionChartProps> = ({ dossiers }) => {
  // Compter par type de dossier
  const getRepartition = () => {
    const types = ['PROMOTION', 'MUTATION', 'CONGE', 'RETRAITE', 'AUTRE'];
    const counts: Record<string, number> = {};
    
    types.forEach(type => counts[type] = 0);
    
    dossiers.forEach(dossier => {
      const type = dossier.type_dossier || 'AUTRE';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    })).filter(item => item.value > 0);
  };

  const data = getRepartition();
  
  const COLORS = ['#0056e0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RepartitionChart;