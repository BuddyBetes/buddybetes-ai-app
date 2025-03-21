
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import OnboardingPersonalInfo from '@/components/onboarding/OnboardingPersonalInfo';
import OnboardingHealthData from '@/components/onboarding/OnboardingHealthData';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome to BuddyBetes</h1>
          <p className="text-gray-500 text-lg">
            Let's set up your profile to get started
          </p>
        </div>

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
          
          {currentStep < steps.length - 1 ? (
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
      </motion.div>
    </div>
  );
};

export default Onboarding;
