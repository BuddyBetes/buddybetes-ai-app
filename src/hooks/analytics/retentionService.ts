
import { supabase } from '@/integrations/supabase/client';
import type { RetentionData } from './types';

export const fetchRetentionData = async (): Promise<RetentionData | null> => {
  // Fetch retention cohort data (users with health data from June 1, 2025 onwards)
  const { data: cohortData, error: cohortError } = await supabase
    .from('user_retention_cohorts')
    .select('day_1_return, day_7_return, day_30_return')
    .gte('signup_date', '2025-06-01');

  // Use count query to get total registered users accurately
  const { count: totalRegistered, error: profilesCountError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log('🔍 Debug - Profiles count query:', { 
    totalRegistered, 
    profilesCountError,
    cohortData: cohortData?.length,
    cohortError 
  });

  if (!cohortError && cohortData && !profilesCountError && totalRegistered !== null) {
    const totalUsers = cohortData.length; // Users with health data from June 1, 2025
    const day1Retention = cohortData.filter(u => u.day_1_return).length;
    const day7Retention = cohortData.filter(u => u.day_7_return).length;
    const day30Retention = cohortData.filter(u => u.day_30_return).length;
    const engagementRate = totalRegistered > 0 ? (totalUsers / totalRegistered) * 100 : 0;

    const retentionData = {
      day_1_retention: totalUsers > 0 ? (day1Retention / totalUsers) * 100 : 0,
      day_7_retention: totalUsers > 0 ? (day7Retention / totalUsers) * 100 : 0,
      day_30_retention: totalUsers > 0 ? (day30Retention / totalUsers) * 100 : 0,
      total_users: totalUsers,
      total_registered_users: totalRegistered,
      engagement_rate: engagementRate
    };
    
    console.log('✅ Fetched retention data:', {
      activeUsersFromJune1: totalUsers,
      totalRegisteredUsers: totalRegistered,
      engagementRate: engagementRate.toFixed(1) + '%'
    });

    return retentionData;
  } else {
    console.error('Error fetching retention data:', { cohortError, profilesCountError });
    return null;
  }
};
