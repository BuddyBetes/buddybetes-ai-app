
import { supabase } from '@/integrations/supabase/client';
import type { DailyActiveUser } from './types';

export const fetchDailyActiveUsers = async (): Promise<DailyActiveUser[]> => {
  const { data, error } = await supabase
    .from('daily_active_users')
    .select('*')
    .gte('date', '2025-06-01')
    .order('date', { ascending: false })
    .limit(50);

  if (!error && data) {
    console.log('✅ Fetched daily active users from June 1, 2025:', data.length, 'days of data');
    return data;
  } else {
    console.error('Error fetching daily active users:', error);
    return [];
  }
};

export const updateDailyActiveUsers = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_daily_active_users_enhanced');
    if (error) {
      console.error('Error updating daily active users:', error);
    }
  } catch (error) {
    console.error('Error calling update function:', error);
  }
};
