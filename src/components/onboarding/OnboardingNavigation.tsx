
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  handleBack: () => void;
  handleNext: () => void;
  handleSubmit: () => void;
  isFormValid?: boolean;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  loading,
  handleBack,
  handleNext,
  handleSubmit,
  isFormValid = true
}) => {
  return (
    <motion.div 
      className="flex justify-between mt-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={currentStep === 0 || loading}
        className="h-12 px-5 flex items-center gap-2 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      
      {currentStep < totalSteps - 1 ? (
        <Button
          onClick={handleNext}
          className="h-12 px-6 bg-buddy-500 hover:bg-buddy-600 rounded-full flex items-center gap-2 shadow-md shadow-buddy-100/50 transition-all"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          className="h-12 px-6 bg-buddy-500 hover:bg-buddy-600 rounded-full flex items-center gap-2 shadow-md shadow-buddy-100/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <>
              <span className="animate-pulse mr-2">•••</span>
              Saving
            </>
          ) : (
            <>
              Complete Setup
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default OnboardingNavigation;
