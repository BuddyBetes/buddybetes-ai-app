
import React from 'react';
import { Target } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';

interface NutritionSectionProps {
  log: GlucoseLog;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({ log }) => {
  // Check if nutritional data exists
  const hasNutritionData = log.calories !== undefined || log.protein !== undefined || log.carbs !== undefined || log.fat !== undefined;

  if (!hasNutritionData) {
    return null;
  }

  return (
    <div className="w-full mt-3">
      <div className="nutrition-info p-2 bg-orange-50 rounded-md">
        <div className="flex items-center mb-1">
          <Target className="h-3 w-3 mr-1 text-orange-500" />
          <span className="text-xs font-medium text-orange-700">Nutrition</span>
        </div>
        <div className="flex gap-3 text-xs text-orange-600">
          {log.calories !== undefined && (
            <span>{Math.round(log.calories)} kcal</span>
          )}
          {log.protein !== undefined && (
            <span>{Math.round(log.protein)}g protein</span>
          )}
          {log.carbs !== undefined && (
            <span>{Math.round(log.carbs)}g carbs</span>
          )}
          {log.fat !== undefined && (
            <span>{Math.round(log.fat)}g fat</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionSection;
