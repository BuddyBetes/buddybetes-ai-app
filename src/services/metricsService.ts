import { supabase } from '@/integrations/supabase/client';
import type { DailyActiveUser, RetentionData, EngagementData, FeatureUsage, AnalyticsResponse } from '@/types/metrics';

export const fetchDailyActiveUsers = async (): Promise<DailyActiveUser[]> => {
  console.log('Fetching daily active users...');
  const { data, error } = await supabase
    .from('daily_active_users')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  if (!error && data) {
    console.log('Daily active users data:', data);
    return data;
  } else {
    console.error('Error fetching daily active users:', error);
    return [];
  }
};

export const fetchSpecificDateData = async (date: Date): Promise<{
  selectedDayData: DailyActiveUser | null;
  previousDayData: DailyActiveUser | null;
}> => {
  // Fix date formatting to ensure consistent timezone handling
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day
  const dateString = selectedDate.toISOString().split('T')[0];
  
  console.log('🔍 fetchSpecificDateData called for:', dateString);
  console.log('🔍 Original date object:', date);
  console.log('🔍 Normalized date object:', selectedDate);
  
  // Get data for selected date
  const { data: dayData, error: dayError } = await supabase
    .from('daily_active_users')
    .select('*')
    .eq('date', dateString)
    .single();

  let selectedDayData: DailyActiveUser | null = null;
  if (!dayError && dayData) {
    console.log('✅ Found selected day data:', dayData);
    console.log('✅ Selected day new_users:', dayData.new_users);
    selectedDayData = dayData;
  } else {
    console.log('❌ No data found for selected date or error:', dayError);
  }

  // Get data for previous day for comparison
  const previousDate = new Date(selectedDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateString = previousDate.toISOString().split('T')[0];

  const { data: prevData, error: prevError } = await supabase
    .from('daily_active_users')
    .select('*')
    .eq('date', previousDateString)
    .single();

  let previousDayData: DailyActiveUser | null = null;
  if (!prevError && prevData) {
    console.log('✅ Found previous day data:', prevData);
    console.log('✅ Previous day new_users:', prevData.new_users);
    previousDayData = prevData;
  } else {
    console.log('❌ No previous day data found or error:', prevError);
  }

  return { selectedDayData, previousDayData };
};

export const fetchRetentionData = async (): Promise<RetentionData | null> => {
  try {
    console.log('Fetching retention data...');
    // Use the existing database function which has SECURITY DEFINER privileges
    const { data, error } = await supabase.rpc('get_analytics_retention_data');

    if (error) {
      console.error('Error fetching retention data:', error);
      throw error;
    }

    if (data) {
      console.log('Raw retention data from RPC:', data);
      // Type cast the response using unknown first to fix TypeScript error
      const analyticsData = data as unknown as AnalyticsResponse;
      
      return {
        day_1_retention: analyticsData.day_1_retention || 0,
        day_7_retention: analyticsData.day_7_retention || 0,
        day_30_retention: analyticsData.day_30_retention || 0,
        total_users: analyticsData.total_users || 0,
        total_registered_users: analyticsData.total_registered_users || 0,
        total_active_users: analyticsData.total_active_users || 0,
        health_data_users: analyticsData.health_data_users || 0,
        ai_assistant_users: analyticsData.ai_assistant_users || 0,
        engagement_rate: analyticsData.engagement_rate || 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching retention data:', error);
    return {
      day_1_retention: 0,
      day_7_retention: 0,
      day_30_retention: 0,
      total_users: 0,
      total_registered_users: 0,
      total_active_users: 0,
      health_data_users: 0,
      ai_assistant_users: 0,
      engagement_rate: 0
    };
  }
};

export const fetchEngagementData = async (): Promise<EngagementData[]> => {
  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('timestamp')
    .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (!error && data) {
    const hourlyData: { [key: number]: number } = {};
    
    data.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity_count: hourlyData[hour] || 0
    }));
  }
  return [];
};

export const fetchFeatureUsage = async (): Promise<FeatureUsage[]> => {
  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('action_target')
    .eq('action_type', 'feature_click')
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!error && data) {
    const featureCount: { [key: string]: number } = {};
    
    data.forEach(log => {
      featureCount[log.action_target] = (featureCount[log.action_target] || 0) + 1;
    });

    return Object.entries(featureCount)
      .map(([feature, count]) => ({ feature, usage_count: count }))
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10);
  }
  return [];
};
