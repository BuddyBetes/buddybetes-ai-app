
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MedicationFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MedicationField: React.FC<MedicationFieldProps> = ({ value, onChange, disabled }) => {
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="medication" className="text-sm">
        Medication (optional)
      </Label>
      <motion.div whileFocus="focus" variants={inputVariants}>
        <Input
          id="medication"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter medication name and dosage"
          className="h-11 text-base"
          disabled={disabled}
        />
      </motion.div>
    </div>
  );
};

export default MedicationField;
