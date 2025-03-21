
import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [isCheckingData, setIsCheckingData] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
  });
  
  const [healthData, setHealthData] = useState({
    gender: '',
    birthdate: undefined as Date | undefined,
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'lbs',
    diabetesType: '',
  });

  // Check if user's data is already filled in
  useEffect(() => {
    const checkExistingData = async () => {
      if (!user) {
        setIsCheckingData(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check profile data - use limit(1) and maybeSingle() to avoid multiple row errors
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
        // Check health data - use limit(1) and maybeSingle() to avoid multiple row errors
        const { data: userHealthData, error: healthError } = await supabase
          .from('health_data')
          .select('gender, birthdate, height, height_unit, weight, weight_unit, diabetes_type')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
          
        if (healthError) throw healthError;

        // If we have both profile and essential health data, we can mark onboarding as complete
        const hasProfileData = profileData?.first_name && profileData?.last_name;
        const hasEssentialHealthData = userHealthData?.gender && userHealthData?.birthdate && 
                                      userHealthData?.height && userHealthData?.weight && 
                                      userHealthData?.diabetes_type;
        
        if (hasProfileData && hasEssentialHealthData) {
          // User has already completed onboarding with all essential data
          await setHasCompletedOnboarding(true);
          navigate('/dashboard');
        } else {
          // Pre-fill whatever data we have
          if (profileData) {
            setPersonalInfo({
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
            });
          }
          
          if (userHealthData) {
            // Make sure height is stored as a valid numeric string, not with units
            let height = userHealthData.height || '';
            if (height && !isNaN(Number(height))) {
              height = height.toString();
            } else {
              // If height contains units or is not numeric, reset it
              height = '';
            }
            
            setHealthData({
              gender: userHealthData.gender || '',
              birthdate: userHealthData.birthdate ? new Date(userHealthData.birthdate) : undefined,
              height: height,
              heightUnit: userHealthData.height_unit || 'cm',
              weight: userHealthData.weight || '',
              weightUnit: userHealthData.weight_unit || 'lbs',
              diabetesType: userHealthData.diabetes_type || '',
            });
          }
        }
      } catch (error) {
        console.error('Error checking existing data:', error);
      } finally {
        setLoading(false);
        setIsCheckingData(false);
      }
    };

    checkExistingData();
  }, [user, navigate, setHasCompletedOnboarding]);

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

  const calculateAge = (birthdate: Date | undefined): string => {
    if (!birthdate) return '';
    
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleSubmit = async () => {
    if (!user || !healthData.birthdate) return;
    
    setLoading(true);
    
    try {
      // Calculate age from birthdate
      const age = calculateAge(healthData.birthdate);
      
      // Update profile information
      await supabase
        .from('profiles')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      // Check if health data already exists
      const { data: existingHealthData, error: checkError } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingHealthData) {
        // Update existing health data
        await supabase
          .from('health_data')
          .update({
            gender: healthData.gender,
            age: age,
            birthdate: healthData.birthdate ? healthData.birthdate.toISOString() : null,
            height: healthData.height,
            height_unit: healthData.heightUnit,
            weight: healthData.weight,
            weight_unit: healthData.weightUnit,
            diabetes_type: healthData.diabetesType,
            completed_onboarding: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new health data
        await supabase
          .from('health_data')
          .insert({
            user_id: user.id,
            gender: healthData.gender,
            age: age,
            birthdate: healthData.birthdate ? healthData.birthdate.toISOString() : null,
            height: healthData.height,
            height_unit: healthData.heightUnit,
            weight: healthData.weight,
            weight_unit: healthData.weightUnit,
            diabetes_type: healthData.diabetesType,
            completed_onboarding: true,
          });
      }
      
      // Use the auth context to update the state and ensure it's in sync
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
