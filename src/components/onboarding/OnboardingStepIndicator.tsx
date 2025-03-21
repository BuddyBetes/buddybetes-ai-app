
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
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div 
            className={cn(
              "flex flex-col items-center",
              index < steps.length - 1 && "flex-1"
            )}
          >
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1",
                currentStep > index 
                  ? "bg-buddy-500 text-white" 
                  : currentStep === index 
                    ? "bg-buddy-500 text-white" 
                    : "bg-gray-200 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            <div className={cn(
              "text-xs font-medium",
              currentStep >= index ? "text-buddy-500" : "text-gray-400"
            )}>
              {step}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "h-0.5 flex-1 mx-2",
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
