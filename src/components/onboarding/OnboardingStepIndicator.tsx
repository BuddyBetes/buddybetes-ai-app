
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
    <div className="flex items-center justify-between mb-10 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step with label */}
          <div className="flex flex-col items-center relative">
            {/* Circle with number */}
            <div 
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold",
                currentStep > index 
                  ? "bg-buddy-500 text-white" 
                  : currentStep === index 
                    ? "bg-buddy-500 text-white" 
                    : "bg-gray-200 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            
            {/* Step label */}
            <div 
              className={cn(
                "absolute top-16 text-center w-36 text-sm font-medium",
                currentStep >= index ? "text-buddy-500" : "text-gray-400"
              )}
            >
              {step}
            </div>
          </div>
          
          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "h-0.5 flex-grow mx-2",
                currentStep > index ? "bg-buddy-500" : "bg-gray-200"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default OnboardingStepIndicator;
