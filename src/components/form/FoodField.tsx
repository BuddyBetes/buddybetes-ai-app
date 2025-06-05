
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FoodFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const FoodField: React.FC<FoodFieldProps> = ({ value, onChange, disabled }) => {
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="food" className="text-sm font-medium">
        Food (optional)
      </Label>
      <motion.div whileFocus="focus" variants={inputVariants}>
        <Input
          id="food"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What did you eat?"
          className="h-11 text-base"
          disabled={disabled}
        />
      </motion.div>
    </div>
  );
};

export default FoodField;
