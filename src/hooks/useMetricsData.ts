
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
    try {
      // Get total users from profiles table (all-time)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (profilesError) throw profilesError;

      const totalUsers = profilesData?.length || 0;

      if (totalUsers === 0) {
        setRetentionData({
          day_1_retention: 0,
          day_7_retention: 0,
          day_30_retention: 0,
          total_users: 0
        });
        return;
      }

      // Calculate all-time retention rates
      const today = new Date();
      let day1ReturnUsers = 0;
      let day7ReturnUsers = 0;
      let day30ReturnUsers = 0;
      let day1EligibleUsers = 0;
      let day7EligibleUsers = 0;
      let day30EligibleUsers = 0;

      for (const profile of profilesData) {
        const signupDate = new Date(profile.created_at);
        const daysSinceSignup = Math.floor((today.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

        // Check if user is eligible for each retention period
        if (daysSinceSignup >= 1) {
          day1EligibleUsers++;
          
          // Check if user had activity within 1 day of signup
          const { data: day1Activity } = await supabase
            .from('glucose_logs')
            .select('created_at')
            .eq('user_id', profile.id)
            .gte('created_at', signupDate.toISOString())
            .lte('created_at', new Date(signupDate.getTime() + 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          const { data: day1AssistantActivity } = await supabase
            .from('assistant_conversations')
            .select('created_at')
            .eq('user_id', profile.id)
            .gte('created_at', signupDate.toISOString())
            .lte('created_at', new Date(signupDate.getTime() + 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          if ((day1Activity && day1Activity.length > 0) || (day1AssistantActivity && day1AssistantActivity.length > 0)) {
            day1ReturnUsers++;
          }
        }

        if (daysSinceSignup >= 7) {
          day7EligibleUsers++;
          
          // Check if user had activity within 7 days of signup
          const { data: day7Activity } = await supabase
            .from('glucose_logs')
            .select('created_at')
            .eq('user_id', profile.id)
            .gte('created_at', signupDate.toISOString())
            .lte('created_at', new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          const { data: day7AssistantActivity } = await supabase
            .from('assistant_conversations')
            .select('created_at')
            .eq('user_id', profile.id)
            .gte('created_at', signupDate.toISOString())
            .lte('created_at', new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          if ((day7Activity && day7Activity.length > 0) || (day7AssistantActivity && day7AssistantActivity.length > 0)) {
            day7ReturnUsers++;
          }
        }

        if (daysSinceSignup >= 30) {
          day30EligibleUsers++;
          
          // Check if user had activity within 30 days of signup
          const { data: day30Activity } = await supabase
            .from('glucose_logs')
            .select('created_at')
            .eq('user_id', profile.id)
            .gte('created_at', signupDate.toISOString())
            .lte('created_at', new Date(signupDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          const { data: day30AssistantActivity } = await supabase
            .from('assistant_conversations')
            .select('created_at')
            .eq('user_id', profile.id)
            .gte('created_at', signupDate.toISOString())
            .lte('created_at', new Date(signupDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          if ((day30Activity && day30Activity.length > 0) || (day30AssistantActivity && day30AssistantActivity.length > 0)) {
            day30ReturnUsers++;
          }
        }
      }

      setRetentionData({
        day_1_retention: day1EligibleUsers > 0 ? (day1ReturnUsers / day1EligibleUsers) * 100 : 0,
        day_7_retention: day7EligibleUsers > 0 ? (day7ReturnUsers / day7EligibleUsers) * 100 : 0,
        day_30_retention: day30EligibleUsers > 0 ? (day30ReturnUsers / day30EligibleUsers) * 100 : 0,
        total_users: totalUsers
      });

    } catch (error) {
      console.error('Error fetching retention data:', error);
      setRetentionData({
        day_1_retention: 0,
        day_7_retention: 0,
        day_30_retention: 0,
        total_users: 0
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
