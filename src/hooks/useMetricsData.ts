
import { useState, useEffect } from 'react';
import type { DailyActiveUser, RetentionData, EngagementData, FeatureUsage } from '@/types/metrics';
import {
  fetchDailyActiveUsers,
  fetchSpecificDateData,
  fetchRetentionData,
  fetchEngagementData,
  fetchFeatureUsage
} from '@/services/metricsService';

export const useMetricsData = (selectedDate?: Date) => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DailyActiveUser | null>(null);
  const [previousDayData, setPreviousDayData] = useState<DailyActiveUser | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    
    const [dailyUsers, retention, engagement, features] = await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchEngagementData(),
      fetchFeatureUsage()
    ]);

    setDailyActiveUsers(dailyUsers);
    setRetentionData(retention);
    setEngagementData(engagement);
    setFeatureUsage(features);

    if (selectedDate) {
      const { selectedDayData: dayData, previousDayData: prevData } = await fetchSpecificDateData(selectedDate);
      setSelectedDayData(dayData);
      setPreviousDayData(prevData);
    }

    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      console.log('🎯 useMetricsData: Selected date changed to:', selectedDate.toISOString().split('T')[0]);
      fetchSpecificDateData(selectedDate).then(({ selectedDayData: dayData, previousDayData: prevData }) => {
        console.log('🎯 useMetricsData: Setting selectedDayData:', dayData);
        console.log('🎯 useMetricsData: Setting previousDayData:', prevData);
        setSelectedDayData(dayData);
        setPreviousDayData(prevData);
      });
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
