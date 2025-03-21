
import React, { useState, useEffect } from 'react';
import HealthDataDisplay from './HealthDataDisplay';
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

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('health_data')
          .select('gender, birthdate, height, height_unit, weight, weight_unit, diabetes_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching health data:', error);
        } else if (data) {
          setHealthData({
            gender: data.gender || '',
            birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
            height: data.height || '',
            heightUnit: data.height_unit || 'cm',
            weight: data.weight || '',
            weightUnit: data.weight_unit || 'lbs',
            diabetesType: data.diabetes_type || ''
          });
        }
      } catch (error) {
        console.error('Error fetching health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user]);

  const updateHealthData = async (newData: HealthDataType) => {
    if (!user) return;

    try {
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
      } else {
        setHealthData(newData);
      }
    } catch (error) {
      console.error('Error updating health data:', error);
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading health data...</div>;
  }
  
  return (
    <HealthDataDisplay 
      healthData={healthData}
      setHealthData={updateHealthData}
    />
  );
};

export default HealthData;
