
import { supabase } from '@/integrations/supabase/client';
import type { RetentionData } from './types';

export const fetchRetentionData = async (): Promise<RetentionData | null> => {
  try {
    // Call the admin-only database function that bypasses RLS
    const { data, error } = await supabase.rpc('get_analytics_retention_data');

    if (error) {
      console.error('Error fetching retention data:', error);
      return null;
    }

    if (!data) {
      console.log('No retention data returned');
      return null;
    }

    console.log('✅ Fetched retention data via admin function:', data);

    return {
      day_1_retention: data.day_1_retention,
      day_7_retention: data.day_7_retention,
      day_30_retention: data.day_30_retention,
      total_users: data.total_users,
      total_registered_users: data.total_registered_users,
      engagement_rate: data.engagement_rate
    };
  } catch (error) {
    console.error('Error in fetchRetentionData:', error);
    return null;
  }
};
