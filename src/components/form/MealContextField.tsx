
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MealContextFieldProps {
  value: 'before' | 'after' | 'fasting';
  onChange: (value: 'before' | 'after' | 'fasting') => void;
  disabled?: boolean;
}

const MealContextField: React.FC<MealContextFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="mealContext" className="text-sm">
        When was this glucose level taken?
      </Label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as 'before' | 'after' | 'fasting')}
        className="flex space-x-3"
        disabled={disabled}
      >
        <div className="flex items-center space-x-1.5">
          <RadioGroupItem value="before" id="before" />
          <Label htmlFor="before" className="text-sm">Before meal</Label>
        </div>
        <div className="flex items-center space-x-1.5">
          <RadioGroupItem value="after" id="after" />
          <Label htmlFor="after" className="text-sm">After meal</Label>
        </div>
        <div className="flex items-center space-x-1.5">
          <RadioGroupItem value="fasting" id="fasting" />
          <Label htmlFor="fasting" className="text-sm">Fasting</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default MealContextField;
