import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileText,
  Send,
  Check
} from 'lucide-react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md', showIcon = true }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      TERMINE: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'Terminé', 
        icon: CheckCircle 
      },
      EN_COURS: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'En cours', 
        icon: Clock 
      },
      EN_ATTENTE: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'En attente', 
        icon: Clock 
      },
      EN_ATTENTE_DREN: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'En attente DREN', 
        icon: Send 
      },
      EN_ATTENTE_MEN: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'En attente MEN', 
        icon: Send 
      },
      EN_ATTENTE_FOP: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'En attente FOP', 
        icon: Send 
      },
      EN_ATTENTE_FINANCE: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        label: 'En attente Finance', 
        icon: Send 
      },
      BLOQUE: { 
        color: 'bg-error-100 text-error-700 border-error-200', 
        label: 'Bloqué', 
        icon: AlertTriangle 
      },
      REJETE: { 
        color: 'bg-error-100 text-error-700 border-error-200', 
        label: 'Rejeté', 
        icon: XCircle 
      },
      BROUILLON: { 
        color: 'bg-warning-100 text-warning-700 border-warning-200', 
        label: 'Brouillon', 
        icon: FileText 
      },
    };

    const config = configs[status] || { 
      color: 'bg-green-100 text-green-700 border-green-200', 
      label: status,
      icon: Check 
    };

    const Icon = config.icon;
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-3 py-1.5 text-sm gap-1.5',
      lg: 'px-4 py-2 text-base gap-2',
    };

    return (
      <span className={`inline-flex items-center rounded-full border ${config.color} 
                      ${sizeClasses[size]} font-medium transition-all duration-200
                      hover:shadow-md hover:scale-105`}>
        {showIcon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
        {config.label}
      </span>
    );
  };

  return getStatusConfig(status);
};

export default StatusChip;