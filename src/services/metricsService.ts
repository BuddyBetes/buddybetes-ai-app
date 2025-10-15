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

export const fetchAvailableDates = async (): Promise<string[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_active_users')
    .select('date')
    .neq('date', today) // Exclude today
    .order('date', { ascending: false });

  if (!error && data) {
    // Return date strings directly - no timezone conversion issues
    return data.map(item => item.date);
  } else {
    console.error('Error fetching available dates:', error);
    return [];
  }
};

export const fetchSpecificDateData = async (dateString: string): Promise<{
  selectedDayData: DailyActiveUser | null;
  previousDayData: DailyActiveUser | null;
}> => {
  console.log('🔍 fetchSpecificDateData called for:', dateString);
  
  // Get data for selected date
  const { data: dayData, error: dayError } = await supabase
    .from('daily_active_users')
    .select('*')
    .eq('date', dateString)
    .single();

  let selectedDayData: DailyActiveUser | null = null;
  if (!dayError && dayData) {
    console.log('✅ Found selected day data:', dayData);
    selectedDayData = dayData;
  } else {
    console.log('❌ No data found for selected date or error:', dayError);
  }

  // Get data for previous day - calculate previous date as string
  const date = new Date(dateString + 'T12:00:00.000Z'); // Use noon UTC to avoid timezone issues
  date.setUTCDate(date.getUTCDate() - 1);
  const previousDateString = date.toISOString().split('T')[0];

  const { data: prevData, error: prevError } = await supabase
    .from('daily_active_users')
    .select('*')
    .eq('date', previousDateString)
    .single();

  let previousDayData: DailyActiveUser | null = null;
  if (!prevError && prevData) {
    console.log('✅ Found previous day data:', prevData);
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

export const fetchEngagementData = async (selectedDateString?: string): Promise<EngagementData[]> => {
  console.log('🔍 fetchEngagementData called for date:', selectedDateString);
  
  if (!selectedDateString) {
    console.log('❌ No date provided for engagement data');
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity_count: 0
    }));
  }

  // Query activity logs for the specific date
  const startOfDay = `${selectedDateString}T00:00:00.000Z`;
  const endOfDay = `${selectedDateString}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('timestamp')
    .gte('timestamp', startOfDay)
    .lte('timestamp', endOfDay);

  if (error) {
    console.error('Error fetching engagement data:', error);
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity_count: 0
    }));
  }

  if (!data || data.length === 0) {
    console.log('📊 No activity data found for date:', selectedDateString);
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity_count: 0
    }));
  }

  console.log('✅ Found activity data:', data.length, 'activities for', selectedDateString);

  // Count activities by Asia/Manila hour (UTC+8)
  const hourlyData: { [key: number]: number } = {};
  
  data.forEach(log => {
    // Convert UTC timestamp to Asia/Manila time
    const utcDate = new Date(log.timestamp);
    const manilaDate = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
    const manilaHour = manilaDate.getUTCHours(); // Get hour in Manila timezone
    hourlyData[manilaHour] = (hourlyData[manilaHour] || 0) + 1;
  });

  // Return complete 24-hour array
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    activity_count: hourlyData[hour] || 0
  }));
};

export const fetchFeatureUsage = async (): Promise<FeatureUsage[]> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('user_activity_logs')
    .select('action_target')
    .eq('action_type', 'feature_click')
    .gte('timestamp', thirtyDaysAgo.toISOString());

  if (error || !data || data.length === 0) {
    console.log('No feature usage data found');
    return [];
  }

  const featureCount: { [key: string]: number } = {};
  data.forEach(log => {
    if (log.action_target) {
      featureCount[log.action_target] = (featureCount[log.action_target] || 0) + 1;
    }
  });

  return Object.entries(featureCount)
    .map(([feature, count]) => ({ 
      feature: feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
      usage_count: count 
    }))
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 10);
};

export const fetchMonthlyActiveUsers = async () => {
  const { data, error } = await supabase.rpc('get_monthly_active_users');
  if (error) {
    console.error('Error fetching monthly active users:', error);
    return [];
  }
  return data || [];
};
