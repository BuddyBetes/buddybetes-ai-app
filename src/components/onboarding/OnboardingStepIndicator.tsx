
import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({ 
  steps, 
  currentStep 
}) => {
  return (
    <div className="flex justify-between mb-8 relative">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center relative z-10">
          <div 
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
              index <= currentStep 
                ? "bg-buddy-500 text-white" 
                : "bg-gray-200 text-gray-500"
            )}
          >
            {index + 1}
          </div>
          <p className="text-xs mt-2 text-center">{step}</p>
        </div>
      ))}
      
      {/* Connecting lines */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
        <div 
          className="h-full bg-buddy-500 transition-all" 
          style={{ 
            width: `${currentStep === 0 ? 0 : (currentStep === steps.length - 1 ? 100 : (100 / (steps.length - 1)) * currentStep)}%` 
          }}
        />
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
