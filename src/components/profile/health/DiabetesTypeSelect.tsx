
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HealthDataFormField from './HealthDataFormField';

interface DiabetesTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const DiabetesTypeSelect: React.FC<DiabetesTypeSelectProps> = ({ value, onChange }) => {
  const diabetesTypes = [
    { value: 'type1', label: 'Type 1' },
    { value: 'type2', label: 'Type 2' },
    { value: 'gestational', label: 'Gestational' },
    { value: 'prediabetes', label: 'Prediabetes' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <HealthDataFormField label="Diabetes Type">
      <Select 
        value={value || ""} 
        onValueChange={onChange}
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
    </HealthDataFormField>
  );
};

export default DiabetesTypeSelect;
