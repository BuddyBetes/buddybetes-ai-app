
import { GlucoseLog } from '@/types/logs';

/**
 * Utility functions for data transformation
 */
export const useLogTransformers = () => {
  // Helper function to validate meal_context values
  const validateMealContext = (mealContext: string | null): 'before' | 'after' | 'fasting' | undefined => {
    if (mealContext === 'before' || mealContext === 'after' || mealContext === 'fasting') {
      return mealContext;
    }
    return undefined;
  };

  // Helper function to round numbers in notes
  const roundNumbersInText = (text: string | undefined): string | undefined => {
    if (!text) return text;
    
    // Regex to find numbers with decimal points (e.g., 50.4, 12.7)
    return text.replace(/(\d+)\.(\d+)/g, (match, p1, p2) => {
      // Convert to number and round
      return Math.round(parseFloat(`${p1}.${p2}`)).toString();
    });
  };

  // Transform database row to GlucoseLog object
  const transformDbRowToLog = (row: any): GlucoseLog => ({
    id: row.id,
    timestamp: new Date(row.timestamp),
    glucoseLevel: row.glucose_level !== null ? row.glucose_level : undefined,
    food: row.food,
    mealContext: validateMealContext(row.meal_context),
    notes: roundNumbersInText(row.notes)
  });

  // Transform GlucoseLog to database row format
  const transformLogToDbRow = (log: GlucoseLog | Omit<GlucoseLog, 'id'>, userId: string) => ({
    user_id: userId,
    timestamp: log.timestamp.toISOString(),
    glucose_level: log.glucoseLevel,
    meal_context: log.mealContext,
    food: log.food,
    notes: roundNumbersInText(log.notes)
  });

  return {
    validateMealContext,
    roundNumbersInText,
    transformDbRowToLog,
    transformLogToDbRow
  };
};
