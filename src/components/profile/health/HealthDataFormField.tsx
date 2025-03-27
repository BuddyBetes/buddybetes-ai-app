
import React from 'react';
import { Label } from '@/components/ui/label';

interface HealthDataFormFieldProps {
  label: string;
  children: React.ReactNode;
}

const HealthDataFormField: React.FC<HealthDataFormFieldProps> = ({ 
  label, 
  children 
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
      {children}
    </div>
  );
};

export default HealthDataFormField;
