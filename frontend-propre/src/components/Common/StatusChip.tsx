// src/components/Common/StatusChip.tsx
import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, FileText, Send } from 'lucide-react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md', showIcon = true }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      TERMINE: { 
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', 
        label: 'Terminé', 
        icon: CheckCircle 
      },
      EN_COURS: { 
        color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400', 
        label: 'En cours', 
        icon: Clock 
      },
      EN_ATTENTE_DREN: { 
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
        label: 'Attente DREN', 
        icon: Send 
      },
      EN_ATTENTE_MEN: { 
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
        label: 'Attente MEN', 
        icon: Send 
      },
      EN_ATTENTE_FOP: { 
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
        label: 'Attente FOP', 
        icon: Send 
      },
      EN_ATTENTE_FINANCE: { 
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
        label: 'Attente Finance', 
        icon: Send 
      },
      BLOQUE: { 
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', 
        label: 'Bloqué', 
        icon: AlertTriangle 
      },
      REJETE: { 
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', 
        label: 'Rejeté', 
        icon: XCircle 
      },
      BROUILLON: { 
        color: 'bg-dark-100 text-dark-700 dark:bg-dark-800 dark:text-dark-400', 
        label: 'Brouillon', 
        icon: FileText 
      },
    };

    const config = configs[status] || { 
      color: 'bg-dark-100 text-dark-700 dark:bg-dark-800 dark:text-dark-400', 
      label: status,
      icon: Clock 
    };

    const Icon = config.icon;
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16,
    };

    return (
      <span className={`inline-flex items-center rounded-full ${config.color} ${sizeClasses[size]} font-medium`}>
        {showIcon && <Icon size={iconSizes[size]} />}
        {config.label}
      </span>
    );
  };

  return getStatusConfig(status);
};

export default StatusChip;