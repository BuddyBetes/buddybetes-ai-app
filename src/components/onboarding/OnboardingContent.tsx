
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingPersonalInfo from './OnboardingPersonalInfo';
import OnboardingHealthData from './OnboardingHealthData';

interface OnboardingContentProps {
  currentStep: number;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
  healthData: {
    gender: string;
    age: string;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    diabetesType: string;
  };
  setPersonalInfo: React.Dispatch<React.SetStateAction<{
    firstName: string;
    lastName: string;
  }>>;
  setHealthData: React.Dispatch<React.SetStateAction<{
    gender: string;
    age: string;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    diabetesType: string;
  }>>;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({
  currentStep,
  personalInfo,
  healthData,
  setPersonalInfo,
  setHealthData
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingPersonalInfo 
            personalInfo={personalInfo} 
            setPersonalInfo={setPersonalInfo} 
          />
        );
      case 1:
        return (
          <OnboardingHealthData 
            healthData={healthData} 
            setHealthData={setHealthData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      key={currentStep}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-8 rounded-2xl shadow-sm mb-6"
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingContent;
