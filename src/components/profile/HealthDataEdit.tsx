
import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { GlucoseUnit } from '@/types/global';

interface HealthData {
  height: string;
  height_unit: string;
  weight: string;
  weight_unit: string;
  birthdate: string;
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
  const [formData, setFormData] = useState({
    height: healthData.height || '',
    height_unit: healthData.height_unit || 'cm',
    weight: healthData.weight || '',
    weight_unit: healthData.weight_unit || 'kg',
    birthdate: healthData.birthdate ? new Date(healthData.birthdate) : undefined,
    gender: healthData.gender || '',
    diabetes_type: healthData.diabetes_type || '',
    glucose_unit: healthData.glucose_unit || 'mg/dL' as GlucoseUnit,
  });
  
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Format the date for database
      const formattedData = {
        ...formData,
        birthdate: formData.birthdate ? formData.birthdate.toISOString() : null,
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={value => handleSelectChange('gender', value)}
          >
            <SelectTrigger id="gender">
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
        
        <div className="space-y-2">
          <Label htmlFor="birthdate">Birthdate</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="birthdate"
                className="w-full justify-start text-left font-normal"
              >
                {formData.birthdate ? (
                  format(formData.birthdate, "PP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.birthdate}
                onSelect={date => setFormData(prev => ({ ...prev, birthdate: date }))}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
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
        
        <div className="space-y-2">
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
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diabetes_type">Diabetes Type</Label>
          <Select 
            value={formData.diabetes_type} 
            onValueChange={value => handleSelectChange('diabetes_type', value)}
          >
            <SelectTrigger id="diabetes_type">
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
        
        <div className="space-y-2">
          <Label htmlFor="glucose_unit">Glucose Unit</Label>
          <Select 
            value={formData.glucose_unit} 
            onValueChange={value => handleSelectChange('glucose_unit', value as GlucoseUnit)}
          >
            <SelectTrigger id="glucose_unit">
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
