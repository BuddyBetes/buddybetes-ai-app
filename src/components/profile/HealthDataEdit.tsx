
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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

interface HealthDataEditProps {
  healthData: HealthData;
  onUpdate: () => void;
  onCancel: () => void;
}

const HealthDataEdit: React.FC<HealthDataEditProps> = ({ healthData, onUpdate, onCancel }) => {
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
  
  const [formData, setFormData] = useState({
    height: healthData.height || '',
    height_unit: healthData.height_unit || 'cm',
    weight: healthData.weight || '',
    weight_unit: healthData.weight_unit || 'kg',
    birthdate_input: formatDateForInput(healthData.birthdate),
    gender: healthData.gender || '',
    diabetes_type: healthData.diabetes_type || '',
    glucose_unit: healthData.glucose_unit || 'mg/dL' as GlucoseUnit,
  });
  
  // Debug logging
  useEffect(() => {
    console.log('HealthDataEdit initialized with:', healthData);
    console.log('FormData initialized as:', formData);
  }, []);
  
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const diabetesTypes = [
    { value: 'type1', label: 'Type 1' },
    { value: 'type2', label: 'Type 2' },
    { value: 'gestational', label: 'Gestational' },
    { value: 'prediabetes', label: 'Prediabetes' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    console.log(`Changing ${name} to ${value}`);
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
      
      // Format the date for database
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender || ""} 
            onValueChange={value => handleSelectChange('gender', value)}
          >
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {genders.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="birthdate_input">Birthdate</Label>
          <Input
            id="birthdate_input"
            name="birthdate_input"
            type="date"
            value={formData.birthdate_input}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="height">Height</Label>
          <div className="flex">
            <Input
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              className="rounded-r-none"
            />
            <Select 
              value={formData.height_unit}
              onValueChange={value => handleSelectChange('height_unit', value)}
            >
              <SelectTrigger className="w-24 rounded-l-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="ft">ft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight</Label>
          <div className="flex">
            <Input
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="rounded-r-none"
            />
            <Select 
              value={formData.weight_unit}
              onValueChange={value => handleSelectChange('weight_unit', value)}
            >
              <SelectTrigger className="w-24 rounded-l-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="diabetes_type">Diabetes Type</Label>
          <Select 
            value={formData.diabetes_type || ""} 
            onValueChange={value => handleSelectChange('diabetes_type', value)}
          >
            <SelectTrigger id="diabetes_type" className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {diabetesTypes.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="glucose_unit">Glucose Unit</Label>
          <Select 
            value={formData.glucose_unit} 
            onValueChange={value => handleSelectChange('glucose_unit', value as GlucoseUnit)}
          >
            <SelectTrigger id="glucose_unit" className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mg/dL">mg/dL</SelectItem>
              <SelectItem value="mmol/L">mmol/L</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
};

export default HealthDataEdit;
