
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { GlucoseUnit } from '@/types/global';

interface HealthData {
  height: string;
  height_unit: string;
  weight: string;
  weight_unit: string;
  birthdate: Date | string | undefined;
  gender: string;
  diabetes_type: string;
  glucose_unit: GlucoseUnit;
}

interface FormData {
  height: string;
  height_unit: string;
  weight: string;
  weight_unit: string;
  birthdate_input: string;
  gender: string;
  diabetes_type: string;
  glucose_unit: GlucoseUnit;
}

export const useHealthDataForm = (healthData: HealthData, onUpdate: () => void, onCancel: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setGlucoseUnit } = useGlucoseUnit();
  const [loading, setLoading] = useState(false);
  
  // Format initial date for the date input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValidDate(dateObj) ? format(dateObj, 'yyyy-MM-dd') : '';
  };
  
  const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  const [formData, setFormData] = useState<FormData>({
    height: healthData.height || '',
    height_unit: healthData.height_unit || 'cm',
    weight: healthData.weight || '',
    weight_unit: healthData.weight_unit || 'kg',
    birthdate_input: formatDateForInput(healthData.birthdate),
    gender: healthData.gender || '',
    diabetes_type: healthData.diabetes_type || '',
    glucose_unit: healthData.glucose_unit || 'mg/dL',
  });
  
  // Debug logging
  useEffect(() => {
    console.log('HealthDataForm initialized with:', healthData);
    console.log('FormData initialized as:', formData);
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Parse the date from the input
      let birthdateObj: Date | null = null;
      if (formData.birthdate_input) {
        birthdateObj = new Date(formData.birthdate_input);
        // Check if date is valid
        if (!isValidDate(birthdateObj)) {
          throw new Error("Invalid date format");
        }
      }
      
      // Format the data for database
      const formattedData = {
        height: formData.height,
        height_unit: formData.height_unit,
        weight: formData.weight,
        weight_unit: formData.weight_unit,
        birthdate: birthdateObj ? birthdateObj.toISOString() : null,
        gender: formData.gender,
        diabetes_type: formData.diabetes_type,
        glucose_unit: formData.glucose_unit,
      };
      
      const { error } = await supabase
        .from('health_data')
        .update(formattedData)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update the glucose unit in the context
      if (formData.glucose_unit !== healthData.glucose_unit) {
        await setGlucoseUnit(formData.glucose_unit);
      }
      
      toast({
        title: "Health data updated",
        description: "Your health information has been saved."
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating health data:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your health data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit
  };
};
