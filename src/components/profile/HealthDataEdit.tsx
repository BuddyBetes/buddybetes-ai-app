
import React from 'react';
import { useHealthDataForm } from '@/hooks/useHealthDataForm';
import { GlucoseUnit } from '@/types/global';
import GenderSelect from './health/GenderSelect';
import DateField from './health/DateField';
import MeasurementField from './health/MeasurementField';
import DiabetesTypeSelect from './health/DiabetesTypeSelect';
import GlucoseUnitSelect from './health/GlucoseUnitSelect';
import FormActions from './health/FormActions';

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
  const { formData, loading, handleInputChange, handleSubmit } = useHealthDataForm(
    healthData,
    onUpdate,
    onCancel
  );
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <GenderSelect 
          value={formData.gender} 
          onChange={(value) => handleInputChange('gender', value)} 
        />
        
        <DateField 
          value={formData.birthdate_input} 
          onChange={(value) => handleInputChange('birthdate_input', value)} 
        />
        
        <MeasurementField 
          label="Height" 
          value={formData.height} 
          unit={formData.height_unit}
          units={[
            { value: 'cm', label: 'cm' },
            { value: 'ft', label: 'ft' }
          ]}
          onValueChange={(value) => handleInputChange('height', value)}
          onUnitChange={(value) => handleInputChange('height_unit', value)}
          id="height"
        />
        
        <MeasurementField 
          label="Weight" 
          value={formData.weight} 
          unit={formData.weight_unit}
          units={[
            { value: 'kg', label: 'kg' },
            { value: 'lbs', label: 'lbs' }
          ]}
          onValueChange={(value) => handleInputChange('weight', value)}
          onUnitChange={(value) => handleInputChange('weight_unit', value)}
          id="weight"
        />
        
        <DiabetesTypeSelect 
          value={formData.diabetes_type} 
          onChange={(value) => handleInputChange('diabetes_type', value)} 
        />
        
        <GlucoseUnitSelect 
          value={formData.glucose_unit} 
          onChange={(value) => handleInputChange('glucose_unit', value as GlucoseUnit)} 
        />
      </div>
      
      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
};

export default HealthDataEdit;
