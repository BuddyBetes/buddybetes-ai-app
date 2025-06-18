
import { supabase } from '@/integrations/supabase/client';
import type { EngagementData } from './types';

export const fetchEngagementData = async (targetDate?: Date): Promise<EngagementData[]> => {
  const dateToUse = targetDate || new Date();
  const startOfDay = new Date(dateToUse);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateToUse);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('timestamp')
    .gte('timestamp', startOfDay.toISOString())
    .lte('timestamp', endOfDay.toISOString());

  if (!error && data) {
    const hourlyData: { [key: number]: number } = {};
    
    data.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    const engagementArray = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity_count: hourlyData[hour] || 0
    }));

    console.log('✅ Fetched engagement data for', dateToUse.toDateString(), ':', data.length, 'activities processed');
    return engagementArray;
  } else {
    console.error('Error fetching engagement data:', error);
    return [];
  }
};
