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
import { GlucoseUnit } from '@/types/global';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';

const steps = [
  "Personal Information",
  "Health Information"
];

const Onboarding = () => {
  const { user, isAuthenticated, hasCompletedOnboarding, setHasCompletedOnboarding } = useAuth();
  const { setGlucoseUnit } = useGlucoseUnit();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // If already completed onboarding, redirect to dashboard immediately
  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasCompletedOnboarding, navigate]);

  // Form data state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
  });
  
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  
  const [healthData, setHealthData] = useState({
    gender: '',
    birthdate: undefined as Date | undefined,
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    diabetesType: '',
    glucoseUnit: 'mg/dL' as GlucoseUnit,
  });

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If already completed onboarding, show loading until the useEffect redirects
  if (hasCompletedOnboarding) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting to dashboard...</div>;
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
    if (!user || !healthData.birthdate) return;
    
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
      
      // First check if health_data entry already exists
      const { data: existingData } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingData) {
        // Update existing health data
        await supabase
          .from('health_data')
          .update({
            gender: healthData.gender,
            birthdate: healthData.birthdate.toISOString(),
            height: healthData.height,
            height_unit: healthData.heightUnit,
            weight: healthData.weight,
            weight_unit: healthData.weightUnit,
            diabetes_type: healthData.diabetesType,
            glucose_unit: healthData.glucoseUnit,
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
            birthdate: healthData.birthdate.toISOString(),
            height: healthData.height,
            height_unit: healthData.heightUnit,
            weight: healthData.weight,
            weight_unit: healthData.weightUnit,
            diabetes_type: healthData.diabetesType,
            glucose_unit: healthData.glucoseUnit,
            completed_onboarding: true,
          });
      }
      
      // Update context state
      setHasCompletedOnboarding(true);
      
      // Update glucose unit in context
      await setGlucoseUnit(healthData.glucoseUnit);
      
      // Submit to Mailchimp if user opted in for marketing emails
      if (marketingOptIn && user.email && personalInfo.firstName) {
        try {
          await submitToMailchimp(user.email, personalInfo.firstName);
        } catch (error) {
          console.error('Failed to subscribe to marketing emails:', error);
          // Don't show error to user as this shouldn't block onboarding completion
        }
      }
      
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

  // Function to submit to Mailchimp using hidden form
  const submitToMailchimp = async (email: string, firstName: string): Promise<void> => {
    console.log('Attempting newsletter subscription for:', email);
    
    return new Promise((resolve, reject) => {
      try {
        // Create hidden iframe to handle the form submission
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'hidden_iframe';
        document.body.appendChild(iframe);

        // Create hidden form
        const form = document.createElement('form');
        form.action = 'https://buddybetes.us22.list-manage.com/subscribe/post';
        form.method = 'POST';
        form.target = 'hidden_iframe';
        form.style.display = 'none';

        // Add form fields
        const fields = [
          { name: 'u', value: 'cfbc83a07a3542e2559bace72' },
          { name: 'id', value: 'c81e3803c2' },
          { name: 'EMAIL', value: email },
          { name: 'FNAME', value: firstName },
          { name: 'b_cfbc83a07a3542e2559bace72_c81e3803c2', value: '' } // honeypot
        ];

        fields.forEach(field => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = field.name;
          input.value = field.value;
          form.appendChild(input);
        });

        document.body.appendChild(form);

        // Handle iframe load event
        const handleLoad = () => {
          console.log('Newsletter subscription form submitted successfully');
          toast({
            title: "Newsletter subscription sent!",
            description: "Thanks for subscribing to our newsletter.",
          });
          
          // Cleanup
          document.body.removeChild(form);
          document.body.removeChild(iframe);
          resolve();
        };

        const handleError = () => {
          console.log('Newsletter subscription completed (assuming success)');
          toast({
            title: "Newsletter subscription sent!", 
            description: "Thanks for subscribing to our newsletter.",
          });
          
          // Cleanup
          document.body.removeChild(form);
          document.body.removeChild(iframe);
          resolve();
        };

        // Set up event handlers
        iframe.onload = handleLoad;
        iframe.onerror = handleError;

        // Submit the form
        form.submit();

        // Timeout fallback
        setTimeout(() => {
          if (document.body.contains(form)) {
            console.log('Newsletter subscription timeout - assuming success');
            handleError();
          }
        }, 5000);

      } catch (error) {
        console.error('Newsletter subscription failed:', error);
        // Don't show error to user, just resolve silently
        resolve();
      }
    });
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
          marketingOptIn={marketingOptIn}
          setMarketingOptIn={setMarketingOptIn}
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
