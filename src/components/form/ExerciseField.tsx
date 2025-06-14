
import React from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ExerciseFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ExerciseField: React.FC<ExerciseFieldProps> = ({ value, onChange, disabled }) => {
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="exercise" className="text-sm">
        Exercise (optional)
      </Label>
      <motion.div whileFocus="focus" variants={inputVariants}>
        <Textarea
          id="exercise"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe any exercise or physical activity"
          className="min-h-20 text-base"
          disabled={disabled}
        />
      </motion.div>
    </div>
  );
};

export default ExerciseField;
