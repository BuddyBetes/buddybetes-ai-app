
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NutritionFieldsProps {
  calories: string;
  protein: string;
  carbs: string;
  onCaloriesChange: (value: string) => void;
  onProteinChange: (value: string) => void;
  onCarbsChange: (value: string) => void;
  disabled?: boolean;
}

const NutritionFields: React.FC<NutritionFieldsProps> = ({
  calories,
  protein,
  carbs,
  onCaloriesChange,
  onProteinChange,
  onCarbsChange,
  disabled
}) => {
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="calories" className="text-sm font-medium">
            Calories
          </Label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => onCaloriesChange(e.target.value)}
              placeholder="kcal"
              className="h-10 text-sm"
              disabled={disabled}
              min="0"
              step="1"
            />
          </motion.div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="protein" className="text-sm font-medium">
            Protein
          </Label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => onProteinChange(e.target.value)}
              placeholder="g"
              className="h-10 text-sm"
              disabled={disabled}
              min="0"
              step="0.1"
            />
          </motion.div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="carbs" className="text-sm font-medium">
            Carbs
          </Label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              id="carbs"
              type="number"
              value={carbs}
              onChange={(e) => onCarbsChange(e.target.value)}
              placeholder="g"
              className="h-10 text-sm"
              disabled={disabled}
              min="0"
              step="0.1"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NutritionFields;
