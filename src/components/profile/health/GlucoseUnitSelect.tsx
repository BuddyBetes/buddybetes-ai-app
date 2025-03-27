
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HealthDataFormField from './HealthDataFormField';
import { GlucoseUnit } from '@/types/global';

interface GlucoseUnitSelectProps {
  value: GlucoseUnit;
  onChange: (value: GlucoseUnit) => void;
}

const GlucoseUnitSelect: React.FC<GlucoseUnitSelectProps> = ({ value, onChange }) => {
  return (
    <HealthDataFormField label="Glucose Unit">
      <Select 
        value={value} 
        onValueChange={(value) => onChange(value as GlucoseUnit)}
      >
        <SelectTrigger id="glucose_unit" className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mg/dL">mg/dL</SelectItem>
          <SelectItem value="mmol/L">mmol/L</SelectItem>
        </SelectContent>
      </Select>
    </HealthDataFormField>
  );
};

export default GlucoseUnitSelect;
