
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

export const useMetricsData = () => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasBackfilled, setHasBackfilled] = useState(false);

  const runBackfillIfNeeded = async () => {
    try {
      // Check if we have any analytics data
      const { data: existingData } = await supabase
        .from('daily_active_users')
        .select('*')
        .limit(1);

      if (!existingData || existingData.length === 0) {
        console.log('No analytics data found, running backfill...');
        
        // Run the backfill function
        const { error } = await supabase.rpc('backfill_analytics_data');
        
        if (error) {
          console.error('Error running backfill:', error);
        } else {
          console.log('Backfill completed successfully');
          setHasBackfilled(true);
        }
      }
    } catch (error) {
      console.error('Error checking/running backfill:', error);
    }
  };

  const fetchDailyActiveUsers = async () => {
    const { data, error } = await supabase
      .from('daily_active_users')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
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
    } else {
      console.error('Error fetching retention data:', error);
    }
  };

  const fetchEngagementData = async () => {
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

      const engagementArray = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activity_count: hourlyData[hour] || 0
      }));

      setEngagementData(engagementArray);
    } else {
      console.error('Error fetching engagement data:', error);
    }
  };

  const fetchFeatureUsage = async () => {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('action_target')
      .eq('action_type', 'feature_click')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

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
    } else {
      console.error('Error fetching feature usage:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    
    // Run backfill if needed first
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
      fetchEngagementData(),
      fetchFeatureUsage()
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    dailyActiveUsers,
    retentionData,
    engagementData,
    featureUsage,
    loading,
    refreshData,
    hasBackfilled
  };
};
