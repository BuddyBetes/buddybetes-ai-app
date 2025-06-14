
import { GlucoseLog, GlucoseStats } from './types.ts';

export function calculateGlucoseStats(filteredHistory: GlucoseLog[]): GlucoseStats {
  const glucoseValues = filteredHistory
    .map(log => log.glucoseLevel)
    .filter(value => value !== undefined && value !== null) as number[];
  
  return {
    count: glucoseValues.length,
    average: Math.round(glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length),
    min: Math.min(...glucoseValues),
    max: Math.max(...glucoseValues),
    inRange: glucoseValues.filter(val => val >= 70 && val <= 140).length,
    inRangePercent: Math.round((glucoseValues.filter(val => val >= 70 && val <= 140).length / glucoseValues.length) * 100)
  };
}

export function filterGlucoseHistory(glucoseHistory: GlucoseLog[], timeRange: string): GlucoseLog[] {
  let filteredHistory = [...glucoseHistory];
  if (timeRange !== 'all' && glucoseHistory.length > 0) {
    const now = new Date();
    let cutoffHours = 24;
    
    if (timeRange === '7d') cutoffHours = 168; // 7 days
    else if (timeRange === '30d') cutoffHours = 720; // 30 days
    
    const cutoffTime = new Date(now.getTime() - cutoffHours * 60 * 60 * 1000);
    filteredHistory = glucoseHistory.filter(log => new Date(log.timestamp) > cutoffTime);
  }
  
  return filteredHistory;
}
