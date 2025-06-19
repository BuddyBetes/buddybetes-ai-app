
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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Refreshing all data...`);
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
      console.log(`[${timestamp}] 🔄 refreshData - Setting selectedDayData:`, dayData);
      console.log(`[${timestamp}] 🔄 refreshData - Setting previousDayData:`, prevData);
      setSelectedDayData(dayData);
      setPreviousDayData(prevData);
    }

    setLoading(false);
    console.log(`[${timestamp}] 🔄 Data refresh completed`);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const timestamp = new Date().toISOString();
      const dateString = selectedDate.toISOString().split('T')[0];
      console.log(`[${timestamp}] 🎯 useEffect triggered - Selected date changed:`, {
        selectedDate: dateString,
        selectedDateObject: selectedDate,
        currentSelectedDayData: selectedDayData,
        currentPreviousDayData: previousDayData
      });
      
      fetchSpecificDateData(selectedDate).then(({ selectedDayData: dayData, previousDayData: prevData }) => {
        const updateTimestamp = new Date().toISOString();
        console.log(`[${updateTimestamp}] 🎯 useEffect - About to update state:`, {
          dayData,
          prevData,
          dayDataNewUsers: dayData?.new_users,
          prevDataNewUsers: prevData?.new_users
        });
        
        setSelectedDayData(dayData);
        setPreviousDayData(prevData);
        
        console.log(`[${updateTimestamp}] 🎯 useEffect - State update completed`);
      });
    }
  }, [selectedDate]);

  // Enhanced logging with timestamps for state changes
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 selectedDayData state changed:`, {
      selectedDayData,
      newUsers: selectedDayData?.new_users,
      stateChangeTime: timestamp
    });
  }, [selectedDayData]);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 previousDayData state changed:`, {
      previousDayData,
      newUsers: previousDayData?.new_users,
      stateChangeTime: timestamp
    });
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
