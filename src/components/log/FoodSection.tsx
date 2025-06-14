
import React from 'react';
import { Utensils } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';

interface FoodSectionProps {
  log: GlucoseLog;
}

const FoodSection: React.FC<FoodSectionProps> = ({ log }) => {
  const hasFood = !!log.food;

  if (!hasFood) {
    return null;
  }

  return (
    <div className="w-full mt-3">
      <div className="food-info p-2 bg-green-50 rounded-md">
        <div className="flex items-center">
          <Utensils className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-gray-700 font-medium text-base">{log.food}</span>
        </div>
      </div>
    </div>
  );
};

export default FoodSection;
