
import React from 'react';
import { Input } from '@/components/ui/input';
import HealthDataFormField from './HealthDataFormField';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DateField: React.FC<DateFieldProps> = ({ value, onChange }) => {
  return (
    <HealthDataFormField label="Birthdate">
      <Input
        id="birthdate_input"
        name="birthdate_input"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </HealthDataFormField>
  );
};

export default DateField;
