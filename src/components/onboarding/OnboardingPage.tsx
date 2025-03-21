
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import OnboardingStepIndicator from '@/components/onboarding/OnboardingStepIndicator';
import OnboardingContent from '@/components/onboarding/OnboardingContent';
import OnboardingNavigation from '@/components/onboarding/OnboardingNavigation';
import { useOnboardingData } from '@/hooks/useOnboardingData';

const steps = [
  "Personal Information",
  "Health Information"
];

const OnboardingPage = () => {
  const { isAuthenticated, hasCompletedOnboarding, isCheckingData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  const { 
    loading, 
    personalInfo, 
    setPersonalInfo, 
    healthData, 
    setHealthData,
    handleSubmit 
  } = useOnboardingData();

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If already completed onboarding, redirect to dashboard
  if (hasCompletedOnboarding && !isCheckingData) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading screen while checking data
  if (isCheckingData || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-buddy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="w-full max-w-md"
      >
        <OnboardingHeader />
        
        <OnboardingStepIndicator 
          steps={steps} 
          currentStep={currentStep}
        />

        <OnboardingContent
          currentStep={currentStep}
          personalInfo={personalInfo}
          healthData={healthData}
          setPersonalInfo={setPersonalInfo}
          setHealthData={setHealthData}
        />

        <OnboardingNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          loading={loading}
          handleBack={handleBack}
          handleNext={handleNext}
          handleSubmit={handleSubmit}
        />
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
