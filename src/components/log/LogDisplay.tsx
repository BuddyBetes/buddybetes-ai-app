import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { GlucoseLog } from '@/types/logs';
import { convertGlucoseValue, formatGlucoseValue } from '@/utils/glucoseUtils';
import { Droplet, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogDisplayProps {
  log: GlucoseLog;
}

const LogDisplay: React.FC<LogDisplayProps> = ({ log }) => {
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

  // Determine if this is a glucose entry, food entry, or both
  const hasGlucose = log.glucoseLevel !== undefined;
  const hasFood = !!log.food;

  return (
    <div className="log-display">
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
      </div>
      
      <div className="timestamp text-sm text-gray-500 mb-1">
        {formatTimestamp(log.timestamp)}
      </div>
      
      {hasGlucose && (
        <div className="glucose-value font-medium flex items-center">
          <Droplet className="h-4 w-4 mr-1 text-blue-500" />
          {displayGlucoseValue()}
        </div>
      )}
      
      {hasFood && (
        <div className="food-info mt-1 flex items-center">
          <Utensils className="h-4 w-4 mr-1 text-green-500" />
          <span className="text-gray-600 flex-1">{log.food}</span>
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
  );
};

export default LogDisplay;
