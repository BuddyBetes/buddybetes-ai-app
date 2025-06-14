
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GlucoseLog } from '@/types/logs';
import { Droplet, Utensils, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogDisplayProps {
  log: GlucoseLog;
  showNutrition?: boolean;
  showFood?: boolean;
  showGlucose?: boolean;
}

const LogDisplay: React.FC<LogDisplayProps> = ({ 
  log, 
  showNutrition = true, 
  showFood = true, 
  showGlucose = true 
}) => {
  
  const formatTimestamp = (timestamp: Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return 'Invalid date';
    }
  };

  // Check if nutritional data exists
  const hasNutritionData = log.calories !== undefined || log.protein !== undefined || log.carbs !== undefined || log.fat !== undefined;

  // Determine if this is a glucose entry, food entry, or both
  const hasGlucose = log.glucoseLevel !== undefined;
  const hasFood = !!log.food;

  return (
    <div className="log-display-container">
      {/* Badges section */}
      <div className="flex items-center gap-2 mb-2">
        {hasGlucose && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 py-1">
            <Droplet className="h-3 w-3" />
            <span>Glucose</span>
          </Badge>
        )}
        {hasFood && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 py-1">
            <Utensils className="h-3 w-3" />
            <span>Food</span>
          </Badge>
        )}
        {hasNutritionData && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 py-1">
            <Target className="h-3 w-3" />
            <span>Nutrition</span>
          </Badge>
        )}
      </div>
      
      {/* Timestamp section */}
      <div className="timestamp text-xs text-gray-500">
        {formatTimestamp(log.timestamp)}
      </div>
    </div>
  );
};

export default LogDisplay;
