
import { useState, useEffect } from 'react';
import type { DailyActiveUser, RetentionData, EngagementData, FeatureUsage, MonthlyActiveUser } from '@/types/metrics';
import {
  fetchDailyActiveUsers,
  fetchSpecificDateData,
  fetchRetentionData,
  fetchEngagementData,
  fetchFeatureUsage,
  fetchAvailableDates,
  fetchMonthlyActiveUsers
} from '@/services/metricsService';

export const useMetricsData = (selectedDateString?: string) => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DailyActiveUser | null>(null);
  const [previousDayData, setPreviousDayData] = useState<DailyActiveUser | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [monthlyActiveUsers, setMonthlyActiveUsers] = useState<MonthlyActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    
    const [dailyUsers, retention, features, dates, monthlyUsers] = await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchFeatureUsage(),
      fetchAvailableDates(),
      fetchMonthlyActiveUsers()
    ]);

    setDailyActiveUsers(dailyUsers);
    setRetentionData(retention);
    setFeatureUsage(features);
    setAvailableDates(dates);
    setMonthlyActiveUsers(monthlyUsers);

    // Fetch engagement data for selected date
    const engagement = await fetchEngagementData(selectedDateString);
    setEngagementData(engagement);

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
      // Fetch specific date data
      fetchSpecificDateData(selectedDateString).then(({ selectedDayData: dayData, previousDayData: prevData }) => {
        setSelectedDayData(dayData);
        setPreviousDayData(prevData);
      });

      // Fetch engagement data for the selected date
      fetchEngagementData(selectedDateString).then(engagement => {
        setEngagementData(engagement);
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
    monthlyActiveUsers,
    loading,
    refreshData
  };
};
