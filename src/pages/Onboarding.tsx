
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
        console.log("Checking existing data for user:", user.id);
        
        // Check profile data - get the most recent record
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .limit(1)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile data:", profileError);
          if (profileError.code !== 'PGRST116') { // Don't throw for "no rows" error
            throw profileError;
          }
        }
        
        // Check health data - get the most recent record
        const { data: healthDataList, error: healthListError } = await supabase
          .from('health_data')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
          
        if (healthListError) {
          console.error("Error listing health data:", healthListError);
          throw healthListError;
        }
        
        let userHealthData = null;
        
        if (healthDataList && healthDataList.length > 0) {
          // Get the most recent health data record
          const { data: latestHealthData, error: healthError } = await supabase
            .from('health_data')
            .select('gender, birthdate, height, height_unit, weight, weight_unit, diabetes_type, completed_onboarding')
            .eq('id', healthDataList[0].id)
            .single();
            
          if (healthError) {
            console.error("Error fetching latest health data:", healthError);
            throw healthError;
          }
          
          userHealthData = latestHealthData;
        }

        // If we have both profile and essential health data, we can mark onboarding as complete
        const hasProfileData = profileData?.first_name && profileData?.last_name;
        const hasEssentialHealthData = userHealthData?.gender && userHealthData?.birthdate && 
                                      userHealthData?.height && userHealthData?.weight && 
                                      userHealthData?.diabetes_type;
        
        if (hasProfileData && hasEssentialHealthData && userHealthData?.completed_onboarding) {
          // User has already completed onboarding with all essential data
          console.log("User has completed onboarding with all essential data");
          await setHasCompletedOnboarding(true);
          navigate('/dashboard');
          return;
        }
        
        // Pre-fill whatever data we have
        if (profileData) {
          console.log("Pre-filling profile data:", profileData);
          setPersonalInfo({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
          });
        }
        
        if (userHealthData) {
          console.log("Pre-filling health data:", userHealthData);
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
      console.log("Submitting onboarding data");
      
      // Calculate age from birthdate
      const age = calculateAge(healthData.birthdate);
      
      // Ensure height and weight are numeric values
      const height = healthData.height ? healthData.height.toString() : '';
      const weight = healthData.weight ? healthData.weight.toString() : '';
      
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Check if health data already exists
      const { data: healthDataList, error: listError } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (listError) throw listError;
      
      if (healthDataList && healthDataList.length > 0) {
        // Update the most recent health data record
        const { error: updateError } = await supabase
          .from('health_data')
          .update({
            gender: healthData.gender,
            age: age,
            birthdate: healthData.birthdate ? healthData.birthdate.toISOString() : null,
            height: height,
            height_unit: healthData.heightUnit,
            weight: weight,
            weight_unit: healthData.weightUnit,
            diabetes_type: healthData.diabetesType,
            completed_onboarding: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', healthDataList[0].id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new health data
        const { error: insertError } = await supabase
          .from('health_data')
          .insert({
            user_id: user.id,
            gender: healthData.gender,
            age: age,
            birthdate: healthData.birthdate ? healthData.birthdate.toISOString() : null,
            height: height,
            height_unit: healthData.heightUnit,
            weight: weight,
            weight_unit: healthData.weightUnit,
            diabetes_type: healthData.diabetesType,
            completed_onboarding: true,
          });
          
        if (insertError) throw insertError;
      }
      
      // Use the auth context to update the state and ensure it's in sync
      await setHasCompletedOnboarding(true);
      
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
