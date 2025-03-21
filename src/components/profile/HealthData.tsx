
import React, { useState, useEffect } from 'react';
import HealthDataDisplay from './HealthDataDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface HealthDataType {
  gender: string;
  birthdate: Date | undefined;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  diabetesType: string;
}

const HealthData = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthDataType>({
    gender: '',
    birthdate: undefined,
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'lbs',
    diabetesType: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching health data for user:", user.id);
        
        const { data, error } = await supabase
          .from('health_data')
          .select('gender, birthdate, height, height_unit, weight, weight_unit, diabetes_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching health data:', error);
          setError('Failed to load health data');
        } else {
          console.log("Health data received:", data);
          if (data) {
            setHealthData({
              gender: data.gender || '',
              birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
              height: data.height || '',
              heightUnit: data.height_unit || 'cm',
              weight: data.weight || '',
              weightUnit: data.weight_unit || 'lbs',
              diabetesType: data.diabetes_type || ''
            });
          } else {
            // No health data found, initialize with empty data
            setError('No health data found. Please complete onboarding or update your health information.');
          }
        }
      } catch (error) {
        console.error('Error fetching health data:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user]);

  const updateHealthData = async (newData: HealthDataType) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Check if health data record exists for this user
      const { data: existingData, error: checkError } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing health data:', checkError);
        throw checkError;
      }
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('health_data')
          .update({
            gender: newData.gender,
            birthdate: newData.birthdate?.toISOString(),
            height: newData.height,
            height_unit: newData.heightUnit,
            weight: newData.weight,
            weight_unit: newData.weightUnit,
            diabetes_type: newData.diabetesType,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating health data:', error);
          setError('Failed to update health data');
        } else {
          setHealthData(newData);
        }
      } else {
        // Create new record if none exists
        const { error } = await supabase
          .from('health_data')
          .insert({
            user_id: user.id,
            gender: newData.gender,
            birthdate: newData.birthdate?.toISOString(),
            height: newData.height,
            height_unit: newData.heightUnit,
            weight: newData.weight,
            weight_unit: newData.weightUnit,
            diabetes_type: newData.diabetesType,
            completed_onboarding: true
          });

        if (error) {
          console.error('Error creating health data:', error);
          setError('Failed to create health data');
        } else {
          setHealthData(newData);
        }
      }
    } catch (error) {
      console.error('Error updating health data:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-500">Health Data</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-500">Health Data</h3>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => updateHealthData(healthData)}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
          >
            Initialize Health Data
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <HealthDataDisplay 
      healthData={healthData}
      setHealthData={updateHealthData}
    />
  );
};

export default HealthData;
