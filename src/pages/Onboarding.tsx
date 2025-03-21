
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import OnboardingPersonalInfo from '@/components/onboarding/OnboardingPersonalInfo';
import OnboardingHealthData from '@/components/onboarding/OnboardingHealthData';

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
      
      // Insert health data
      await supabase
        .from('health_data')
        .insert({
          user_id: user.id,
          gender: healthData.gender,
          age: healthData.age,
          height: healthData.height,
          weight: healthData.weight,
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
    <div className="min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto pt-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to BuddyBetes</h1>
          <p className="text-muted-foreground">
            Let's set up your profile to get started
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    index < currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index === currentStep 
                      ? 'border-2 border-primary' 
                      : 'border-2 border-muted'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-xs">{step}</span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-muted mt-4">
            <div 
              className="absolute h-1 bg-primary transition-all"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
          >
            Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-buddy-500 hover:bg-buddy-600"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-buddy-500 hover:bg-buddy-600"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
