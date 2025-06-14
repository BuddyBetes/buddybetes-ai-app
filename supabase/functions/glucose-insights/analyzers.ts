
import { GlucoseLog } from './types.ts';

export function analyzeMealImpact(mealsWithGlucose: GlucoseLog[]) {
  if (mealsWithGlucose.length === 0) return "No meal data available for analysis";
  
  const highGlucoseMeals = mealsWithGlucose.filter(log => log.glucoseLevel > 140);
  const mealTypes = mealsWithGlucose.reduce((acc, log) => {
    const food = log.food?.toLowerCase() || '';
    if (food.includes('rice') || food.includes('bread') || food.includes('pasta')) {
      acc.carbs++;
    }
    if (food.includes('sweet') || food.includes('dessert') || food.includes('cake')) {
      acc.sweets++;
    }
    return acc;
  }, { carbs: 0, sweets: 0 });

  return `${highGlucoseMeals.length}/${mealsWithGlucose.length} meals caused glucose >140mg/dL. Carb-heavy meals: ${mealTypes.carbs}, Sweet foods: ${mealTypes.sweets}`;
}

export function analyzeExerciseImpact(logs: GlucoseLog[]) {
  const exerciseLogs = logs.filter(log => 
    log.notes && (
      log.notes.toLowerCase().includes('exercise') ||
      log.notes.toLowerCase().includes('walk') ||
      log.notes.toLowerCase().includes('gym') ||
      log.notes.toLowerCase().includes('run')
    )
  );
  
  if (exerciseLogs.length === 0) return "No exercise data logged";
  
  const avgGlucoseAfterExercise = exerciseLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / exerciseLogs.length;
  return `${exerciseLogs.length} exercise entries logged. Average glucose after exercise: ${Math.round(avgGlucoseAfterExercise)}mg/dL`;
}

export function analyzeTimePatterns(logs: GlucoseLog[]) {
  const morningLogs = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 6 && hour < 12;
  });
  
  const afternoonLogs = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 12 && hour < 18;
  });
  
  const eveningLogs = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 18 || hour < 6;
  });

  const morningAvg = morningLogs.length > 0 ? Math.round(morningLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / morningLogs.length) : 0;
  const afternoonAvg = afternoonLogs.length > 0 ? Math.round(afternoonLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / afternoonLogs.length) : 0;
  const eveningAvg = eveningLogs.length > 0 ? Math.round(eveningLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / eveningLogs.length) : 0;

  return `Morning avg: ${morningAvg}mg/dL (${morningLogs.length} readings), Afternoon avg: ${afternoonAvg}mg/dL (${afternoonLogs.length} readings), Evening avg: ${eveningAvg}mg/dL (${eveningLogs.length} readings)`;
}
