
import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GlucoseMeasurementMethodFieldProps {
  value: 'finger_prick' | 'cgm' | '';
  onChange: (value: 'finger_prick' | 'cgm') => void;
  disabled?: boolean;
}

const GlucoseMeasurementMethodField: React.FC<GlucoseMeasurementMethodFieldProps> = ({ 
  value, 
  onChange, 
  disabled 
}) => {
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        How was this glucose level measured? (optional)
      </Label>
      <motion.div whileFocus="focus" variants={inputVariants}>
        <RadioGroup
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="finger_prick" id="finger_prick" />
            <Label htmlFor="finger_prick" className="text-sm cursor-pointer">
              Finger prick glucometer
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cgm" id="cgm" />
            <Label htmlFor="cgm" className="text-sm cursor-pointer">
              CGM (Continuous Glucose Monitor)
            </Label>
          </div>
        </RadioGroup>
      </motion.div>
    </div>
  );
};

export default GlucoseMeasurementMethodField;
