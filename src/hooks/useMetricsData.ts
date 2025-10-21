
import { useState, useEffect } from 'react';
import type { DailyActiveUser, RetentionData, EngagementData } from '@/types/metrics';
import {
  fetchDailyActiveUsers,
  fetchSpecificDateData,
  fetchRetentionData,
  fetchEngagementData,
  fetchAvailableDates,
  fetchCohortRetentionData,
  fetchUserLifecycleDistribution
} from '@/services/metricsService';

interface CohortData {
  cohort_week: string;
  signup_count: number;
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
}

interface LifecycleData {
  new_users: number;
  active_users: number;
  at_risk_users: number;
  churned_users: number;
}

export const useMetricsData = (selectedDateString?: string) => {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DailyActiveUser | null>(null);
  const [previousDayData, setPreviousDayData] = useState<DailyActiveUser | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [cohortRetentionData, setCohortRetentionData] = useState<CohortData[]>([]);
  const [lifecycleData, setLifecycleData] = useState<LifecycleData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    
    const [dailyUsers, retention, dates, cohortData, lifecycle] = await Promise.all([
      fetchDailyActiveUsers(),
      fetchRetentionData(),
      fetchAvailableDates(),
      fetchCohortRetentionData(),
      fetchUserLifecycleDistribution()
    ]);

    setDailyActiveUsers(dailyUsers);
    setRetentionData(retention);
    setAvailableDates(dates);
    setCohortRetentionData(cohortData);
    setLifecycleData(lifecycle);

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
    availableDates,
    cohortRetentionData,
    lifecycleData,
    loading,
    refreshData
  };
};
