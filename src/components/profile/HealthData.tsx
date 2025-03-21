
import React, { useState, useEffect } from 'react';
import HealthDataDisplay from './HealthDataDisplay';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
          .maybeSingle(); // Use maybeSingle instead of single to handle multiple rows

        if (error) {
          console.error('Error fetching health data:', error);
          toast({
            title: "Error",
            description: "Could not load your health data. Please try again later.",
            variant: "destructive",
          });
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
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user, toast]);

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
        toast({
          title: "Error",
          description: "Failed to update your health data. Please try again.",
          variant: "destructive",
        });
      } else {
        setHealthData(newData);
        toast({
          title: "Success",
          description: "Your health data has been updated.",
        });
      }
    } catch (error) {
      console.error('Error updating health data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
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
