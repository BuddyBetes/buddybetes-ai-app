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
  const [hasBackfilled, setHasBackfilled] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    
    // Run the backfill to ensure data from June 1, 2025 onwards is populated
    const backfillSuccess = await runBackfillIfNeeded();
    setHasBackfilled(backfillSuccess);
    
    // Update daily stats with enhanced function
    await updateDailyActiveUsers();
    
    // Calculate 30 days back from current date for feature usage
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Fetch all data
    const [dailyUsers, retention, engagement, features] = await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchEngagementData(selectedDate),
      fetchFeatureUsage(startDate, endDate)
    ]);
    
    setDailyActiveUsers(dailyUsers);
    setRetentionData(retention);
    setEngagementData(engagement);
    setFeatureUsage(features);
    
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Refresh engagement data when selected date changes (but keep feature usage as last 30 days)
  useEffect(() => {
    if (selectedDate && dailyActiveUsers.length > 0) {
      const refreshDateSpecificData = async () => {
        const engagement = await fetchEngagementData(selectedDate);
        setEngagementData(engagement);
      };
      refreshDateSpecificData();
    }
  }, [selectedDate, dailyActiveUsers.length]);

  return {
    dailyActiveUsers,
    retentionData,
    engagementData,
    featureUsage,
    loading,
    refreshData,
    hasBackfilled,
    getCurrentDayData: () => getCurrentDayData(dailyActiveUsers, selectedDate),
    getPreviousDayData: () => getPreviousDayData(dailyActiveUsers, selectedDate)
  };
};
