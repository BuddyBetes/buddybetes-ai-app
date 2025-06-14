
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { GlucoseLog } from '@/types/logs';
import { convertGlucoseValue, formatGlucoseValue } from '@/utils/glucoseUtils';
import { Droplet, Utensils, Activity, Zap, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogDisplayProps {
  log: GlucoseLog;
  showNutrition?: boolean;
}

const LogDisplay: React.FC<LogDisplayProps> = ({ log, showNutrition = true }) => {
  const { glucoseUnit } = useGlucoseUnit();
  
  const formatTimestamp = (timestamp: Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return 'Invalid date';
    }
  };
  
  // Format the glucose value in the user's preferred unit
  const displayGlucoseValue = () => {
    if (log.glucoseLevel === undefined) return null;
    
    // We store all values as mg/dL in the database
    // Convert to the user's preferred unit for display
    const valueInPreferredUnit = glucoseUnit === 'mg/dL' 
      ? log.glucoseLevel 
      : convertGlucoseValue(log.glucoseLevel, 'mg/dL', 'mmol/L');
    
    return formatGlucoseValue(valueInPreferredUnit, glucoseUnit);
  };

  // Get measurement method display text and icon
  const getMeasurementMethodDisplay = () => {
    if (!log.glucoseMeasurementMethod) return null;
    
    switch (log.glucoseMeasurementMethod) {
      case 'finger_prick':
        return { text: 'Finger prick', icon: Droplet };
      case 'cgm':
        return { text: 'CGM', icon: Zap };
      default:
        return null;
    }
  };

  // Check if nutritional data exists
  const hasNutritionData = log.calories !== undefined || log.protein !== undefined || log.carbs !== undefined || log.fat !== undefined;

  // Determine if this is a glucose entry, food entry, or both
  const hasGlucose = log.glucoseLevel !== undefined;
  const hasFood = !!log.food;
  const measurementMethod = getMeasurementMethodDisplay();

  return (
    <div className="log-display-container">
      {/* Main content section */}
      <div className="log-main-content">
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
          {hasNutritionData && showNutrition && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 py-1">
              <Target className="h-3 w-3" />
              <span>Nutrition</span>
            </Badge>
          )}
        </div>
        
        <div className="timestamp text-sm text-gray-500 mb-1">
          {formatTimestamp(log.timestamp)}
        </div>
        
        {hasGlucose && (
          <div className="glucose-value font-medium flex items-center">
            <Droplet className="h-4 w-4 mr-1 text-blue-500" />
            <span>{displayGlucoseValue()}</span>
            {measurementMethod && (
              <div className="ml-2 flex items-center text-xs text-gray-500">
                <measurementMethod.icon className="h-3 w-3 mr-1" />
                <span>({measurementMethod.text})</span>
              </div>
            )}
          </div>
        )}
        
        {hasFood && (
          <div className="food-info mt-1 flex items-center">
            <Utensils className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-gray-600 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{log.food}</span>
          </div>
        )}
        
        {log.mealContext && (
          <div className="meal-context text-xs text-gray-500 mt-1">
            {log.mealContext === 'before' ? 'Before meal' : 
             log.mealContext === 'after' ? 'After meal' : 'Fasting'}
          </div>
        )}
        
        {log.notes && (
          <div className="notes text-sm mt-1 text-gray-700">
            {log.notes}
          </div>
        )}
      </div>

      {/* Nutrition section - only show if showNutrition is true */}
      {showNutrition && hasNutritionData && (
        <div className="log-nutrition-section w-full mt-3">
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
      )}
    </div>
  );
};

export default LogDisplay;
