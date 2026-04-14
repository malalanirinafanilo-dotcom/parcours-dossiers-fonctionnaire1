import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface WorkflowVisualizationProps {
  currentStep?: string;
  showAllSteps?: boolean;
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ 
  currentStep = 'INTERESSE',
  showAllSteps = true 
}) => {
  const steps = [
    { id: 'INTERESSE', label: 'Intéressé', description: 'Création et soumission', color: 'gray' },
    { id: 'DREN', label: 'DREN', description: 'Direction Régionale', color: 'blue' },
    { id: 'MEN', label: 'MEN', description: 'Ministère', color: 'green' },
    { id: 'FOP', label: 'FOP', description: 'Formation Professionnelle', color: 'yellow' },
    { id: 'FINANCE', label: 'FINANCE', description: 'Direction Financière', color: 'purple' },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string, color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-500'
    };
    
    if (status === 'completed') return colors[color as keyof typeof colors];
    if (status === 'current') return colors[color as keyof typeof colors];
    return 'bg-gray-300';
  };

  return (
    <div className="w-full">
      {/* Version horizontale pour écran large */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed' ? getStepColor(status, step.color) :
                  status === 'current' ? getStepColor(status, step.color) :
                  'bg-gray-200'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 size={20} className="text-white" />
                  ) : status === 'current' ? (
                    <Clock size={20} className="text-white" />
                  ) : (
                    <Circle size={20} className="text-gray-400" />
                  )}
                </div>
                <p className={`text-sm font-medium mt-2 ${
                  status === 'completed' ? 'text-gray-900' :
                  status === 'current' ? 'text-blue-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Version verticale pour mobile */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === 'completed' ? getStepColor(status, step.color) :
                status === 'current' ? getStepColor(status, step.color) :
                'bg-gray-200'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : status === 'current' ? (
                  <Clock size={16} className="text-white" />
                ) : (
                  <span className="text-xs text-gray-500">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'completed' ? 'text-gray-900' :
                  status === 'current' ? 'text-blue-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowVisualization;