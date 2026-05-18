// src/components/Workflow/WorkflowVisualization.tsx
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
    { id: 'MEN', label: 'MEN', description: 'Ministère', color: 'primary' },
    { id: 'FOP', label: 'FOP', description: 'Formation Professionnelle', color: 'amber' },
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
    const colors: Record<string, string> = {
      blue: 'bg-primary-500',
      primary: 'bg-primary-600',
      amber: 'bg-amber-500',
      purple: 'bg-purple-500',
      gray: 'bg-dark-500'
    };
    
    if (status === 'completed') return colors[color] || 'bg-primary-500';
    if (status === 'current') return colors[color] || 'bg-primary-600';
    return 'bg-dark-300';
  };

  return (
    <div className="w-full">
      {/* Version horizontale */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed' ? getStepColor(status, step.color) :
                  status === 'current' ? getStepColor(status, step.color) :
                  'bg-dark-200'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 size={20} className="text-white" />
                  ) : status === 'current' ? (
                    <Clock size={20} className="text-white" />
                  ) : (
                    <Circle size={20} className="text-dark-400" />
                  )}
                </div>
                <p className={`text-sm font-medium mt-2 ${
                  status === 'completed' ? 'text-dark-900 dark:text-dark-100' :
                  status === 'current' ? 'text-primary-600' :
                  'text-dark-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-dark-400 text-center mt-1">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-dark-200 mx-2" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Version verticale */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === 'completed' ? getStepColor(status, step.color) :
                status === 'current' ? getStepColor(status, step.color) :
                'bg-dark-200'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : status === 'current' ? (
                  <Clock size={16} className="text-white" />
                ) : (
                  <span className="text-xs text-dark-500">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'completed' ? 'text-dark-900 dark:text-dark-100' :
                  status === 'current' ? 'text-primary-600' :
                  'text-dark-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-dark-400">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowVisualization;