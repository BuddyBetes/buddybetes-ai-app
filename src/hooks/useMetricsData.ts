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
  const [selectedDayData, setSelectedDayData] = useState<DailyActiveUser | null>(null);
  const [previousDayData, setPreviousDayData] = useState<DailyActiveUser | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyActiveUsers = async () => {
    const { data, error } = await supabase
      .from('daily_active_users')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
      setDailyActiveUsers(data);
    }
  };

  const fetchSpecificDateData = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Get data for selected date
    const { data: dayData, error: dayError } = await supabase
      .from('daily_active_users')
      .select('*')
      .eq('date', dateString)
      .single();

    if (!dayError && dayData) {
      setSelectedDayData(dayData);
    } else {
      setSelectedDayData(null);
    }

    // Get data for previous day for comparison
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateString = previousDate.toISOString().split('T')[0];

    const { data: prevData, error: prevError } = await supabase
      .from('daily_active_users')
      .select('*')
      .eq('date', previousDateString)
      .single();

    if (!prevError && prevData) {
      setPreviousDayData(prevData);
    } else {
      setPreviousDayData(null);
    }
  };

  const fetchRetentionData = async () => {
    const { data, error } = await supabase
      .from('user_retention_cohorts')
      .select('day_1_return, day_7_return, day_30_return');

    if (!error && data) {
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
        featureCount[log.action_target] = (featureCount[log.action_target] || 0) + 1;
      });

      const featureArray = Object.entries(featureCount)
        .map(([feature, count]) => ({ feature, usage_count: count }))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);

      setFeatureUsage(featureArray);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchEngagementData(),
      fetchFeatureUsage(),
      selectedDate ? fetchSpecificDateData(selectedDate) : Promise.resolve()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSpecificDateData(selectedDate);
    }
  }, [selectedDate]);

  return {
    dailyActiveUsers,
    selectedDayData,
    previousDayData,
    retentionData,
    engagementData,
    featureUsage,
    loading,
    refreshData
  };
};
