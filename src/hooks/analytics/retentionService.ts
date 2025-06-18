
import { supabase } from '@/integrations/supabase/client';
import type { RetentionData } from './types';

export const fetchRetentionData = async (): Promise<RetentionData | null> => {
  try {
    // Get total registered users directly from profiles table
    const { count: totalRegisteredUsers, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total registered users:', totalError);
    }

    // Get active users (those with glucose logs from June 1, 2025 onwards)
    const { data: activeUsersData, error: activeError } = await supabase
      .from('glucose_logs')
      .select('user_id')
      .gte('created_at', '2025-06-01T00:00:00.000Z');

    if (activeError) {
      console.error('Error fetching active users:', activeError);
    }

    // Get unique active users count
    const uniqueActiveUsers = activeUsersData ? 
      [...new Set(activeUsersData.map(log => log.user_id))].length : 0;

    // Calculate retention rates using user_retention_cohorts
    const { data: day1Data, error: day1Error } = await supabase
      .from('user_retention_cohorts')
      .select('user_id')
      .eq('day_1_return', true)
      .gte('signup_date', '2025-06-01');

    const { data: day7Data, error: day7Error } = await supabase
      .from('user_retention_cohorts')
      .select('user_id')
      .eq('day_7_return', true)
      .gte('signup_date', '2025-06-01');

    const { data: day30Data, error: day30Error } = await supabase
      .from('user_retention_cohorts')
      .select('user_id')
      .eq('day_30_return', true)
      .gte('signup_date', '2025-06-01');

    const totalUsers = uniqueActiveUsers;
    const day1Returns = day1Data?.length || 0;
    const day7Returns = day7Data?.length || 0;
    const day30Returns = day30Data?.length || 0;
    const registeredUsersCount = totalRegisteredUsers || 0;

    // Calculate percentages using the correct active user count as base
    const day1Retention = totalUsers > 0 ? (day1Returns / totalUsers) * 100 : 0;
    const day7Retention = totalUsers > 0 ? (day7Returns / totalUsers) * 100 : 0;
    const day30Retention = totalUsers > 0 ? (day30Returns / totalUsers) * 100 : 0;
    const engagementRate = registeredUsersCount > 0 ? (totalUsers / registeredUsersCount) * 100 : 0;

    console.log('✅ Fetched retention data:', {
      totalRegisteredUsers: registeredUsersCount,
      totalUsers,
      day1Returns,
      day7Returns,
      day30Returns,
      engagementRate
    });

    return {
      day_1_retention: day1Retention,
      day_7_retention: day7Retention,
      day_30_retention: day30Retention,
      total_users: totalUsers,
      total_registered_users: registeredUsersCount,
      engagement_rate: engagementRate
    };
  } catch (error) {
    console.error('Error in fetchRetentionData:', error);
    return null;
  }
};
