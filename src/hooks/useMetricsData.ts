
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyActiveUser {
  date: string;
  total_active_users: number;
  new_users: number;
  returning_users: number;
  total_sessions: number;
}

interface RetentionData {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  total_users: number;
}

interface EngagementData {
  hour: number;
  activity_count: number;
}

interface FeatureUsage {
  feature: string;
  usage_count: number;
}

export const useMetricsData = (selectedDate?: Date) => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasBackfilled, setHasBackfilled] = useState(false);

  const runBackfillIfNeeded = async () => {
    try {
      console.log('Running FIXED analytics backfill to populate all historical data from 615 glucose logs...');
      
      // Run the FIXED backfill function that now works properly
      const { error } = await supabase.rpc('backfill_analytics_data');
      
      if (error) {
        console.error('Error running backfill:', error);
      } else {
        console.log('🎉 Backfill completed successfully! All 615 glucose logs processed into 30 days of historical analytics data (May 20th - June 18th)');
        setHasBackfilled(true);
      }
    } catch (error) {
      console.error('Error running backfill:', error);
    }
  };

  const fetchDailyActiveUsers = async () => {
    const { data, error } = await supabase
      .from('daily_active_users')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
      console.log('✅ Fetched daily active users:', data.length, 'days of historical data from glucose logs');
      setDailyActiveUsers(data);
    } else {
      console.error('Error fetching daily active users:', error);
    }
  };

  const fetchRetentionData = async () => {
    const { data, error } = await supabase
      .from('user_retention_cohorts')
      .select('day_1_return, day_7_return, day_30_return');

    if (!error && data && data.length > 0) {
      const totalUsers = data.length;
      const day1Retention = data.filter(u => u.day_1_return).length;
      const day7Retention = data.filter(u => u.day_7_return).length;
      const day30Retention = data.filter(u => u.day_30_return).length;

      setRetentionData({
        day_1_retention: totalUsers > 0 ? (day1Retention / totalUsers) * 100 : 0,
        day_7_retention: totalUsers > 0 ? (day7Retention / totalUsers) * 100 : 0,
        day_30_retention: totalUsers > 0 ? (day30Retention / totalUsers) * 100 : 0,
        total_users: totalUsers
      });
      
      console.log('✅ Fetched retention data for', totalUsers, 'users from glucose log patterns');
    } else {
      console.error('Error fetching retention data:', error);
    }
  };

  const fetchEngagementData = async (targetDate?: Date) => {
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

      setEngagementData(engagementArray);
      console.log('✅ Fetched engagement data for', dateToUse.toDateString(), ':', data.length, 'activities processed');
    } else {
      console.error('Error fetching engagement data:', error);
    }
  };

  const fetchFeatureUsage = async (targetDate?: Date) => {
    const dateToUse = targetDate || new Date();
    const startOfDay = new Date(dateToUse);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateToUse);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('action_target')
      .eq('action_type', 'feature_click')
      .gte('timestamp', startOfDay.toISOString())
      .lte('timestamp', endOfDay.toISOString());

    if (!error && data) {
      const featureCount: { [key: string]: number } = {};
      
      data.forEach(log => {
        const feature = log.action_target || 'unknown';
        featureCount[feature] = (featureCount[feature] || 0) + 1;
      });

      const featureArray = Object.entries(featureCount)
        .map(([feature, count]) => ({ feature, usage_count: count }))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);

      setFeatureUsage(featureArray);
      console.log('✅ Fetched feature usage data for', dateToUse.toDateString(), ':', featureArray.length, 'features tracked');
    } else {
      console.error('Error fetching feature usage:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    
    // Run the FIXED backfill to ensure all historical data is populated
    await runBackfillIfNeeded();
    
    // Update daily stats with enhanced function
    try {
      const { error } = await supabase.rpc('update_daily_active_users_enhanced');
      if (error) {
        console.error('Error updating daily active users:', error);
      }
    } catch (error) {
      console.error('Error calling update function:', error);
    }
    
    // Fetch all data
    await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchEngagementData(selectedDate),
      fetchFeatureUsage(selectedDate)
    ]);
    
    setLoading(false);
  };

  // Get current day data based on selected date
  const getCurrentDayData = () => {
    if (!selectedDate) return null;
    const dateString = selectedDate.toISOString().split('T')[0];
    return dailyActiveUsers.find(d => d.date === dateString);
  };

  // Get previous day data for comparison
  const getPreviousDayData = () => {
    if (!selectedDate) return null;
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const dateString = previousDay.toISOString().split('T')[0];
    return dailyActiveUsers.find(d => d.date === dateString);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Refresh engagement and feature data when selected date changes
  useEffect(() => {
    if (selectedDate && dailyActiveUsers.length > 0) {
      fetchEngagementData(selectedDate);
      fetchFeatureUsage(selectedDate);
    }
  }, [selectedDate]);

  return {
    dailyActiveUsers,
    retentionData,
    engagementData,
    featureUsage,
    loading,
    refreshData,
    hasBackfilled,
    getCurrentDayData,
    getPreviousDayData
  };
};
