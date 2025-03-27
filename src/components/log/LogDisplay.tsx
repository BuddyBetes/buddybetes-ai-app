
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { GlucoseLog } from '@/types/logs';
import { convertGlucoseValue, formatGlucoseValue } from '@/utils/glucoseUtils';

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

  return (
    <div className="log-display">
      <div className="timestamp text-sm text-gray-500 mb-1">
        {formatTimestamp(log.timestamp)}
      </div>
      
      {log.glucoseLevel !== undefined && (
        <div className="glucose-value font-medium">
          {displayGlucoseValue()}
        </div>
      )}
      
      {log.food && (
        <div className="food-info mt-1">
          <span className="text-gray-600">{log.food}</span>
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
