
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
    console.log('Refreshing all data...');
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
    console.log('Data refresh completed');
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      console.log('🎯 useEffect triggered - Selected date changed, fetching data for:', selectedDate.toISOString().split('T')[0]);
      console.log('🎯 Current selectedDayData before fetch:', selectedDayData);
      console.log('🎯 Current previousDayData before fetch:', previousDayData);
      
      fetchSpecificDateData(selectedDate).then(({ selectedDayData: dayData, previousDayData: prevData }) => {
        setSelectedDayData(dayData);
        setPreviousDayData(prevData);
        console.log('🎯 fetchSpecificDateData completed');
      });
    }
  }, [selectedDate]);

  // Add logging whenever state changes
  useEffect(() => {
    console.log('🔄 selectedDayData state changed to:', selectedDayData);
    if (selectedDayData) {
      console.log('🔄 selectedDayData.new_users is now:', selectedDayData.new_users);
    }
  }, [selectedDayData]);

  useEffect(() => {
    console.log('🔄 previousDayData state changed to:', previousDayData);
    if (previousDayData) {
      console.log('🔄 previousDayData.new_users is now:', previousDayData.new_users);
    }
  }, [previousDayData]);

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
