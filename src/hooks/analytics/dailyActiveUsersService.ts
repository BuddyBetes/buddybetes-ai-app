
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
    console.log('✅ Fetched daily active users with improved analytics (using real account creation dates):', data.length, 'days of data');
    console.log('Daily active users data:', data);
    return data;
  } else {
    console.error('Error fetching daily active users:', error);
    return [];
  }
};

export const updateDailyActiveUsers = async (): Promise<void> => {
  try {
    console.log('🔄 Updating daily active users with enhanced function (now uses real account creation dates)...');
    const { error } = await supabase.rpc('update_daily_active_users_enhanced');
    if (error) {
      console.error('Error updating daily active users:', error);
    } else {
      console.log('✅ Daily active users updated successfully with improved new user detection');
    }
  } catch (error) {
    console.error('Error calling update function:', error);
  }
};
