import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'green' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'green', 
  trend 
}) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    info: 'bg-info-50 text-info-600',
    primary: 'bg-green-50 text-green-600',
  };

  return (
    <div className="card hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-3">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error-500" />
              )}
              <span className={`text-sm ml-1 ${trend.isPositive ? 'text-green-500' : 'text-error-500'}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;