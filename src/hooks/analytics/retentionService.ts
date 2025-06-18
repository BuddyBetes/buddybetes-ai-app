
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

    // Cast the JSON response to our expected structure
    const retentionData = data as {
      day_1_retention: number;
      day_7_retention: number;
      day_30_retention: number;
      total_users: number;
      total_registered_users: number;
      total_active_users: number;
      health_data_users: number;
      ai_assistant_users: number;
      engagement_rate: number;
    };

    return {
      day_1_retention: retentionData.day_1_retention,
      day_7_retention: retentionData.day_7_retention,
      day_30_retention: retentionData.day_30_retention,
      total_users: retentionData.total_users,
      total_registered_users: retentionData.total_registered_users,
      total_active_users: retentionData.total_active_users,
      health_data_users: retentionData.health_data_users,
      ai_assistant_users: retentionData.ai_assistant_users,
      engagement_rate: retentionData.engagement_rate
    };
  } catch (error) {
    console.error('Error in fetchRetentionData:', error);
    return null;
  }
};
