import React, { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, BookOpen, Calculator, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  formula?: string;
  example?: string;
  tips?: string[];
}

interface StepByStepGuideProps {
  title: string;
  steps: Step[];
  currentStep?: string;
  onStepComplete?: (stepId: string) => void;
}

const StepByStepGuide: React.FC<StepByStepGuideProps> = ({
  title,
  steps,
  currentStep,
  onStepComplete
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set([steps[0]?.id]));
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (expandedSteps.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const markStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    onStepComplete?.(stepId);
  };

  const getStepIcon = (step: Step) => {
    if (completedSteps.has(step.id)) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (currentStep === step.id) {
      return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
    
    // Default icons based on content
    if (step.formula) {
      return <Calculator className="h-5 w-5 text-purple-600" />;
    }
    if (step.example) {
      return <BarChart3 className="h-5 w-5 text-orange-600" />;
    }
    return <BookOpen className="h-5 w-5 text-gray-600" />;
  };

  const getStepStatus = (step: Step) => {
    if (completedSteps.has(step.id)) return 'completed';
    if (currentStep === step.id) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          {title}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{completedSteps.size} of {steps.length} completed</span>
          <div className="w-16 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          const status = getStepStatus(step);
          
          return (
            <div
              key={step.id}
              className={`border rounded-lg transition-all duration-200 ${
                status === 'completed' ? 'border-green-200 bg-green-50' :
                status === 'current' ? 'border-blue-200 bg-blue-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    status === 'completed' ? 'bg-green-100 text-green-700' :
                    status === 'current' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {getStepIcon(step)}
                  <div>
                    <h4 className={`font-medium ${
                      status === 'completed' ? 'text-green-900' :
                      status === 'current' ? 'text-blue-900' :
                      'text-gray-900'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      status === 'completed' ? 'text-green-700' :
                      status === 'current' ? 'text-blue-700' :
                      'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!completedSteps.has(step.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markStepComplete(step.id);
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {step.formula && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h5 className="font-medium text-purple-900 mb-2 flex items-center">
                        <Calculator className="h-4 w-4 mr-2" />
                        Formula:
                      </h5>
                      <div className="font-mono bg-white p-3 rounded border text-purple-800">
                        {step.formula}
                      </div>
                    </div>
                  )}

                  {step.example && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h5 className="font-medium text-orange-900 mb-2 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Example:
                      </h5>
                      <div className="bg-white p-3 rounded border text-orange-800">
                        {step.example}
                      </div>
                    </div>
                  )}

                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2">Tips:</h5>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-blue-800 flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {completedSteps.size === steps.length && (
        <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
          <h4 className="font-semibold">Congratulations!</h4>
          <p className="text-sm text-green-100">You've completed all steps for {title}</p>
        </div>
      )}
    </div>
  );
};

export default StepByStepGuide;