
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HealthDataFormField from './HealthDataFormField';

interface MeasurementFieldProps {
  label: string;
  value: string;
  unit: string;
  units: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  id: string;
}

const MeasurementField: React.FC<MeasurementFieldProps> = ({
  label,
  value,
  unit,
  units,
  onValueChange,
  onUnitChange,
  id
}) => {
  return (
    <HealthDataFormField label={label}>
      <div className="flex">
        <Input
          id={id}
          name={id}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="rounded-r-none"
        />
        <Select 
          value={unit}
          onValueChange={onUnitChange}
        >
          <SelectTrigger className="w-24 rounded-l-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </HealthDataFormField>
  );
};

export default MeasurementField;
