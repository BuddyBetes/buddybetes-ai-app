
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HealthDataFormField from './HealthDataFormField';

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ value, onChange }) => {
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  return (
    <HealthDataFormField label="Gender">
      <Select 
        value={value || ""} 
        onValueChange={onChange}
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
    </HealthDataFormField>
  );
};

export default GenderSelect;
