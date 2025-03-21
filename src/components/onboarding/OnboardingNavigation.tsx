
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  handleBack: () => void;
  handleNext: () => void;
  handleSubmit: () => void;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  loading,
  handleBack,
  handleNext,
  handleSubmit
}) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={currentStep === 0 || loading}
        className="h-12 px-5 flex items-center gap-2 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      
      {currentStep < totalSteps - 1 ? (
        <Button
          onClick={handleNext}
          className="h-12 px-5 bg-buddy-500 hover:bg-buddy-600 rounded-xl flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          className="h-12 px-5 bg-buddy-500 hover:bg-buddy-600 rounded-xl flex items-center gap-2"
          disabled={loading}
        >
          {loading ? "Saving..." : "Complete Setup"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
