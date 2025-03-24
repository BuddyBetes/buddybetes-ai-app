
import { GlucoseLog } from '@/types/logs';

export const useLogUtils = (logs: GlucoseLog[]) => {
  // Helper function to validate meal_context values
  const validateMealContext = (mealContext: string | null): 'before' | 'after' | 'fasting' | undefined => {
    if (mealContext === 'before' || mealContext === 'after' || mealContext === 'fasting') {
      return mealContext;
    }
    return undefined;
  };

  const getRecentLogs = (count: number) => {
    return [...logs].slice(0, count);
  };

  const getGlucoseLogsOnly = (count: number) => {
    return [...logs]
      .filter(log => log.glucoseLevel !== undefined)
      .slice(0, count);
  };

  const getLogsForToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  const getAverageGlucose = () => {
    const glucoseLogs = logs.filter(log => log.glucoseLevel !== undefined);
    if (glucoseLogs.length === 0) return 0;
    
    const sum = glucoseLogs.reduce((total, log) => {
      return total + (log.glucoseLevel as number);
    }, 0);
    
    return Math.round(sum / glucoseLogs.length);
  };

  return {
    validateMealContext,
    getRecentLogs,
    getGlucoseLogsOnly,
    getLogsForToday,
    getAverageGlucose
  };
};
