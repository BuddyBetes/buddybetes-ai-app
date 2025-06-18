
import type { DailyActiveUser } from './types';

export const getCurrentDayData = (dailyActiveUsers: DailyActiveUser[], selectedDate?: Date) => {
  if (!selectedDate) return null;
  const dateString = selectedDate.toISOString().split('T')[0];
  return dailyActiveUsers.find(d => d.date === dateString);
};

export const getPreviousDayData = (dailyActiveUsers: DailyActiveUser[], selectedDate?: Date) => {
  if (!selectedDate) return null;
  const previousDay = new Date(selectedDate);
  previousDay.setDate(previousDay.getDate() - 1);
  const dateString = previousDay.toISOString().split('T')[0];
  return dailyActiveUsers.find(d => d.date === dateString);
};
