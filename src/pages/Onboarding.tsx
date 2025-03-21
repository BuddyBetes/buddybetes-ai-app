
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import OnboardingStepIndicator from '@/components/onboarding/OnboardingStepIndicator';
import OnboardingContent from '@/components/onboarding/OnboardingContent';
import OnboardingNavigation from '@/components/onboarding/OnboardingNavigation';

const steps = [
  "Personal Information",
  "Health Information"
];

const Onboarding = () => {
  const { user, isAuthenticated, hasCompletedOnboarding, setHasCompletedOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
  });
  
  const [healthData, setHealthData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    weightUnit: 'lbs',
    diabetesType: '',
  });

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If already completed onboarding, redirect to dashboard
  if (hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
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

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update profile information
      await supabase
        .from('profiles')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      // Insert health data with weightUnit
      await supabase
        .from('health_data')
        .insert({
          user_id: user.id,
          gender: healthData.gender,
          age: healthData.age,
          height: healthData.height,
          weight: healthData.weight,
          weight_unit: healthData.weightUnit,
          diabetes_type: healthData.diabetesType,
          completed_onboarding: true,
        });
      
      setHasCompletedOnboarding(true);
      
      toast({
        title: "Onboarding completed!",
        description: "Your profile has been set up successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

export default Onboarding;
