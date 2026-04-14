import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Zap, Shield } from 'lucide-react';

interface ScoreIAProps {
  score: number;
  classification: string;
  details?: string[];
  showDetails?: boolean;
}

const ScoreIA: React.FC<ScoreIAProps> = ({ score, classification, details, showDetails = false }) => {
  const getScoreConfig = (score: number) => {
    if (score < 30) {
      return {
        color: 'success',
        bg: 'bg-success-50',
        border: 'border-success-200',
        text: 'text-success-700',
        icon: CheckCircle,
        label: 'Risque faible',
        gradient: 'from-success-500 to-vert-600'
      };
    }
    if (score < 60) {
      return {
        color: 'warning',
        bg: 'bg-warning-50',
        border: 'border-warning-200',
        text: 'text-warning-700',
        icon: AlertTriangle,
        label: 'Risque modéré',
        gradient: 'from-warning-500 to-orange-600'
      };
    }
    if (score < 80) {
      return {
        color: 'error',
        bg: 'bg-error-50',
        border: 'border-error-200',
        text: 'text-error-700',
        icon: Zap,
        label: 'Risque élevé',
        gradient: 'from-error-500 to-red-600'
      };
    }
    return {
      color: 'error',
      bg: 'bg-error-100',
      border: 'border-error-300',
      text: 'text-error-800',
      icon: XCircle,
      label: 'Risque critique',
      gradient: 'from-error-600 to-red-700'
    };
  };

  const config = getScoreConfig(score);
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl p-6 
                    shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${config.text}`} />
          <span className={`font-semibold ${config.text}`}>Score IA</span>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold 
                        bg-white border ${config.border} ${config.text}`}>
          {config.label}
        </span>
      </div>

      <div className="space-y-4">
        {/* Score circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - score / 100)}`}
                className={`text-${config.color}-500 transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={`text-3xl font-bold ${config.text}`}>{score}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className={`text-center font-medium ${config.text}`}>
          {classification || config.label}
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Niveau de risque</span>
            <span className={`font-semibold ${config.text}`}>{score}%</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden 
                        border border-gray-200">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} 
                        rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Détails */}
        {showDetails && details && details.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Détails :</p>
            <ul className="space-y-2">
              {details.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-vert-500 mt-1.5"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreIA;