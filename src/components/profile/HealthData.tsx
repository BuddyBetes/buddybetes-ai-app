
import React, { useState, useEffect } from 'react';
import HealthDataDisplay from './HealthDataDisplay';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface HealthDataType {
  gender: string;
  age: string;
  height: string;
  weight: string;
  weightUnit: string;
  diabetesType: string;
}

const HealthData = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthDataType>({
    gender: '',
    age: '',
    height: '',
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
        // Updated the query to handle the renamed database field (weight_unit)
        const { data, error } = await supabase
          .from('health_data')
          .select('gender, age, height, weight, weight_unit, diabetes_type')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching health data:', error);
        } else if (data) {
          setHealthData({
            gender: data.gender || '',
            age: data.age || '',
            height: data.height || '',
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
          age: newData.age,
          height: newData.height,
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
