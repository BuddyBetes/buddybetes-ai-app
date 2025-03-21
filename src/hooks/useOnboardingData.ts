
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type PersonalInfo = {
  firstName: string;
  lastName: string;
};

export type HealthData = {
  gender: string;
  birthdate: Date | undefined;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  diabetesType: string;
};

export const useOnboardingData = () => {
  const { user, setHasCompletedOnboarding } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
  });
  
  const [healthData, setHealthData] = useState<HealthData>({
    gender: '',
    birthdate: undefined,
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
        setLoading(false);
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
      }
    };

    checkExistingData();
  }, [user]);

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

  return {
    loading,
    personalInfo,
    setPersonalInfo,
    healthData,
    setHealthData,
    handleSubmit
  };
};
