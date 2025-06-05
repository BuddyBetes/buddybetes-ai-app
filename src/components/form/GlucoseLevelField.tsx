
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';

interface GlucoseLevelFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const GlucoseLevelField: React.FC<GlucoseLevelFieldProps> = ({ value, onChange, disabled }) => {
  const { glucoseUnit } = useGlucoseUnit();

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="glucoseLevel" className="text-sm">
        Glucose Level ({glucoseUnit}) (optional)
      </Label>
      <motion.div whileFocus="focus" variants={inputVariants}>
        <Input
          id="glucoseLevel"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter your glucose reading (${glucoseUnit})`}
          className="h-11 text-base"
          disabled={disabled}
        />
      </motion.div>
    </div>
  );
};

export default GlucoseLevelField;
