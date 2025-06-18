
import { useState, useEffect } from 'react';
import { runBackfillIfNeeded } from './analytics/backfillService';
import { fetchDailyActiveUsers, updateDailyActiveUsers } from './analytics/dailyActiveUsersService';
import { fetchRetentionData } from './analytics/retentionService';
import { fetchEngagementData } from './analytics/engagementService';
import { fetchFeatureUsage } from './analytics/featureUsageService';
import { getCurrentDayData, getPreviousDayData } from './analytics/utils';
import type { DailyActiveUser, RetentionData, EngagementData, FeatureUsage } from './analytics/types';

export const useMetricsData = (selectedDate?: Date) => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureUsageLoading, setFeatureUsageLoading] = useState(false);
  const [hasBackfilled, setHasBackfilled] = useState(false);

  // Initialize feature usage date range (last 30 days)
  const [featureUsageStartDate, setFeatureUsageStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [featureUsageEndDate, setFeatureUsageEndDate] = useState(() => new Date());

  const refreshData = async () => {
    setLoading(true);
    console.log('🔄 Refreshing analytics data...');
    
    // Run the backfill to ensure data is up to date with improved logic
    const backfillSuccess = await runBackfillIfNeeded();
    setHasBackfilled(backfillSuccess);
    
    // Update daily stats with enhanced function (now uses real account creation dates)
    await updateDailyActiveUsers();
    
    // Fetch core data
    const [dailyUsers, retention, engagement] = await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchEngagementData(selectedDate)
    ]);
    
    setDailyActiveUsers(dailyUsers);
    setRetentionData(retention);
    setEngagementData(engagement);
    
    // Fetch feature usage with current date range
    await refreshFeatureUsage();
    
    console.log('✅ Analytics data refresh completed');
    setLoading(false);
  };

  const refreshFeatureUsage = async () => {
    setFeatureUsageLoading(true);
    try {
      const features = await fetchFeatureUsage(featureUsageStartDate, featureUsageEndDate);
      setFeatureUsage(features);
    } finally {
      setFeatureUsageLoading(false);
    }
  };

  const handleFeatureUsageStartDateChange = (date: Date) => {
    setFeatureUsageStartDate(date);
  };

  const handleFeatureUsageEndDateChange = (date: Date) => {
    setFeatureUsageEndDate(date);
  };

  const resetFeatureUsageToLast30Days = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    setFeatureUsageStartDate(startDate);
    setFeatureUsageEndDate(endDate);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Refresh engagement data when selected date changes
  useEffect(() => {
    if (selectedDate && dailyActiveUsers.length > 0) {
      const refreshDateSpecificData = async () => {
        console.log('🔄 Refreshing date-specific engagement data for:', selectedDate.toDateString());
        const engagement = await fetchEngagementData(selectedDate);
        setEngagementData(engagement);
      };
      refreshDateSpecificData();
    }
  }, [selectedDate, dailyActiveUsers.length]);

  // Refresh feature usage when date range changes
  useEffect(() => {
    if (dailyActiveUsers.length > 0) {
      refreshFeatureUsage();
    }
  }, [featureUsageStartDate, featureUsageEndDate, dailyActiveUsers.length]);

  return {
    dailyActiveUsers,
    retentionData,
    engagementData,
    featureUsage,
    featureUsageStartDate,
    featureUsageEndDate,
    loading,
    featureUsageLoading,
    refreshData,
    hasBackfilled,
    handleFeatureUsageStartDateChange,
    handleFeatureUsageEndDateChange,
    resetFeatureUsageToLast30Days,
    getCurrentDayData: () => getCurrentDayData(dailyActiveUsers, selectedDate),
    getPreviousDayData: () => getPreviousDayData(dailyActiveUsers, selectedDate)
  };
};
