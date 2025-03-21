
import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingStepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({ 
  steps,
  currentStep 
}) => {
  return (
    <div className="my-10">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div 
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-buddy-500' : 'text-gray-300'
              }`}
            >
              <motion.div 
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  index < currentStep 
                    ? 'bg-buddy-500 shadow-md shadow-buddy-100' 
                    : index === currentStep 
                    ? 'border-2 border-buddy-500 text-buddy-500' 
                    : 'border-2 border-gray-200 text-gray-300'
                }`}
                initial={{ scale: 0.9 }}
                animate={{ scale: index === currentStep ? 1 : 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {index < currentStep ? (
                  <Check className="h-6 w-6 text-white" strokeWidth={3} />
                ) : (
                  <span className="text-base font-medium">{index + 1}</span>
                )}
              </motion.div>
              
              <motion.span 
                className="text-sm font-medium"
                initial={{ opacity: 0.7 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.7,
                  y: index === currentStep ? -2 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {step}
              </motion.span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-full mx-2 h-0.5 bg-gray-100 relative">
                <motion.div 
                  className="absolute h-0.5 bg-buddy-500"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: currentStep > index ? '100%' : '0%' 
                  }}
                  transition={{ 
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
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
