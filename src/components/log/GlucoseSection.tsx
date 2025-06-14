import React from 'react';
import { Droplet, Zap } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue, formatGlucoseValue } from '@/utils/glucoseUtils';

interface GlucoseSectionProps {
  log: GlucoseLog;
}

const GlucoseSection: React.FC<GlucoseSectionProps> = ({ log }) => {
  const { glucoseUnit } = useGlucoseUnit();
  const hasGlucose = log.glucoseLevel !== undefined;

  if (!hasGlucose) {
    return null;
  }

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

  // Get meal context display text
  const getMealContextDisplay = () => {
    if (!log.mealContext) return null;
    
    switch (log.mealContext) {
      case 'before':
        return 'Before meal';
      case 'after':
        return 'After meal';
      case 'fasting':
        return 'Fasting';
      default:
        return null;
    }
  };

  const measurementMethod = getMeasurementMethodDisplay();
  const mealContext = getMealContextDisplay();

  return (
    <div className="w-full mt-3">
      <div className="glucose-info p-2 bg-blue-50 rounded-md">
        <div className="flex items-center">
          <Droplet className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-gray-700 font-medium text-base">{displayGlucoseValue()}</span>
          {measurementMethod && (
            <div className="ml-2 flex items-center text-sm text-gray-500">
              <span>({measurementMethod.text})</span>
            </div>
          )}
          {mealContext && (
            <div className="ml-2 text-sm text-gray-500">
              <span>({mealContext})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlucoseSection;
