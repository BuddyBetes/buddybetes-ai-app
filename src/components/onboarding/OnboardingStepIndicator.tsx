
import React from 'react';

interface OnboardingStepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({ 
  steps,
  currentStep 
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div 
              className={`flex flex-col items-center ${index <= currentStep ? 'text-buddy-500' : 'text-gray-400'}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index < currentStep 
                    ? 'bg-buddy-500 text-white' 
                    : index === currentStep 
                    ? 'border-2 border-buddy-500 text-buddy-500' 
                    : 'border-2 border-gray-300 text-gray-400'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-sm font-medium">{step}</span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-full mx-2 h-0.5 bg-gray-200 relative">
                <div 
                  className="absolute h-0.5 bg-buddy-500 transition-all duration-300"
                  style={{ width: currentStep > index ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
