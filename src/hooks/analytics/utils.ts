
import type { DailyActiveUser } from './types';

export const getCurrentDayData = (
  dailyActiveUsers: DailyActiveUser[], 
  selectedDate?: Date
): DailyActiveUser | null => {
  if (!selectedDate || dailyActiveUsers.length === 0) return null;
  
  const dateString = selectedDate.toISOString().split('T')[0];
  const currentData = dailyActiveUsers.find(d => d.date === dateString);
  
  console.log('getCurrentDayData:', { 
    selectedDate: dateString, 
    found: !!currentData, 
    data: currentData,
    allDates: dailyActiveUsers.map(d => d.date)
  });
  
  return currentData || null;
};

export const getPreviousDayData = (
  dailyActiveUsers: DailyActiveUser[], 
  selectedDate?: Date
): DailyActiveUser | null => {
  if (!selectedDate || dailyActiveUsers.length === 0) return null;
  
  const previousDate = new Date(selectedDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateString = previousDate.toISOString().split('T')[0];
  
  const previousData = dailyActiveUsers.find(d => d.date === previousDateString);
  
  console.log('getPreviousDayData:', { 
    selectedDate: selectedDate.toISOString().split('T')[0],
    previousDate: previousDateString, 
    found: !!previousData, 
    data: previousData,
    allDates: dailyActiveUsers.map(d => d.date)
  });
  
  return previousData || null;
};
