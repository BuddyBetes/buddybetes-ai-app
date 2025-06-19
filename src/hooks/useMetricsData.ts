
import { useState, useEffect } from 'react';
import type { DailyActiveUser, RetentionData, EngagementData, FeatureUsage } from '@/types/metrics';
import {
  fetchDailyActiveUsers,
  fetchSpecificDateData,
  fetchRetentionData,
  fetchEngagementData,
  fetchFeatureUsage,
  fetchAvailableDates
} from '@/services/metricsService';

export const useMetricsData = (selectedDateString?: string) => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DailyActiveUser | null>(null);
  const [previousDayData, setPreviousDayData] = useState<DailyActiveUser | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    
    const [dailyUsers, retention, engagement, features, dates] = await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchEngagementData(),
      fetchFeatureUsage(),
      fetchAvailableDates()
    ]);

    setDailyActiveUsers(dailyUsers);
    setRetentionData(retention);
    setEngagementData(engagement);
    setFeatureUsage(features);
    setAvailableDates(dates);

    if (selectedDateString) {
      const { selectedDayData: dayData, previousDayData: prevData } = await fetchSpecificDateData(selectedDateString);
      setSelectedDayData(dayData);
      setPreviousDayData(prevData);
    }

    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedDateString) {
      fetchSpecificDateData(selectedDateString).then(({ selectedDayData: dayData, previousDayData: prevData }) => {
        setSelectedDayData(dayData);
        setPreviousDayData(prevData);
      });
    }
  }, [selectedDateString]);

  return {
    dailyActiveUsers,
    selectedDayData,
    previousDayData,
    retentionData,
    engagementData,
    featureUsage,
    availableDates,
    loading,
    refreshData
  };
};
