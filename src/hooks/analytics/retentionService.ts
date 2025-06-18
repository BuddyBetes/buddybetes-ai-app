
import { supabase } from '@/integrations/supabase/client';
import type { RetentionData } from './types';

export const fetchRetentionData = async (): Promise<RetentionData | null> => {
  try {
    // Get total registered users from auth.users via edge function or alternative method
    // For now, let's try a different approach by counting user_retention_cohorts
    const { data: totalRegisteredData, error: totalError } = await supabase
      .from('user_retention_cohorts')
      .select('user_id', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total registered users:', totalError);
    }

    // Get active users (those with activity from June 1, 2025 onwards)
    const { data: activeUsersData, error: activeError } = await supabase
      .from('user_retention_cohorts')
      .select('user_id', { count: 'exact', head: true })
      .gte('signup_date', '2025-06-01');

    if (activeError) {
      console.error('Error fetching active users:', activeError);
    }

    // Calculate retention rates
    const { data: day1Data, error: day1Error } = await supabase
      .from('user_retention_cohorts')
      .select('user_id', { count: 'exact', head: true })
      .eq('day_1_return', true)
      .gte('signup_date', '2025-06-01');

    const { data: day7Data, error: day7Error } = await supabase
      .from('user_retention_cohorts')
      .select('user_id', { count: 'exact', head: true })
      .eq('day_7_return', true)
      .gte('signup_date', '2025-06-01');

    const { data: day30Data, error: day30Error } = await supabase
      .from('user_retention_cohorts')
      .select('user_id', { count: 'exact', head: true })
      .eq('day_30_return', true)
      .gte('signup_date', '2025-06-01');

    // If we can't get the proper count from user_retention_cohorts, try profiles table
    let totalRegisteredUsers = totalRegisteredData?.length || 0;
    
    if (totalRegisteredUsers === 0) {
      // Try counting from profiles table directly
      const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (!profilesError && profilesCount !== null) {
        totalRegisteredUsers = profilesCount;
      }
    }

    const totalUsers = activeUsersData?.length || 0;
    const day1Returns = day1Data?.length || 0;
    const day7Returns = day7Data?.length || 0;
    const day30Returns = day30Data?.length || 0;

    // Calculate percentages
    const day1Retention = totalUsers > 0 ? (day1Returns / totalUsers) * 100 : 0;
    const day7Retention = totalUsers > 0 ? (day7Returns / totalUsers) * 100 : 0;
    const day30Retention = totalUsers > 0 ? (day30Returns / totalUsers) * 100 : 0;
    const engagementRate = totalRegisteredUsers > 0 ? (totalUsers / totalRegisteredUsers) * 100 : 0;

    console.log('✅ Fetched retention data:', {
      totalRegisteredUsers,
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
      total_registered_users: totalRegisteredUsers,
      engagement_rate: engagementRate
    };
  } catch (error) {
    console.error('Error in fetchRetentionData:', error);
    return null;
  }
};
