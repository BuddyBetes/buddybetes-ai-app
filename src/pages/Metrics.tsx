
import React, { useState } from 'react';
import MetricsPasswordProtection from '@/components/analytics/MetricsPasswordProtection';
import MetricsHeader from '@/components/analytics/MetricsHeader';
import DailyMetricsSection from '@/components/analytics/DailyMetricsSection';
import OverallMetricsSection from '@/components/analytics/OverallMetricsSection';
import RetentionMetricsSection from '@/components/analytics/RetentionMetricsSection';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import HistoricalOverviewSection from '@/components/analytics/HistoricalOverviewSection';
import { useMetricsData } from '@/hooks/useMetricsData';

const Metrics = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { 
    dailyActiveUsers, 
    retentionData, 
    engagementData, 
    featureUsage, 
    loading, 
    refreshData,
    hasBackfilled,
    getCurrentDayData,
    getPreviousDayData
  } = useMetricsData(selectedDate);

  if (!isAuthenticated) {
    return <MetricsPasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const currentDayData = getCurrentDayData();
  const previousDayData = getPreviousDayData();

  const getTrend = (today: number, yesterday: number) => {
    if (!yesterday) return null;
    const change = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  // Set date range from June 1, 2025 onwards
  const minDate = new Date('2025-06-01');
  const maxDate = dailyActiveUsers.length > 0 
    ? new Date(dailyActiveUsers[0].date) 
    : new Date();

  const formatDateDescription = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'yesterday';
    } else {
      return `on ${date.toLocaleDateString()}`;
    }
  };

  // Calculate actual date range for display
  const getDateRangeMessage = () => {
    if (dailyActiveUsers.length === 0) return 'No data available';
    
    const earliest = dailyActiveUsers[dailyActiveUsers.length - 1].date;
    const latest = dailyActiveUsers[0].date;
    const dayCount = dailyActiveUsers.length;
    
    return `${dayCount} days from ${new Date(earliest).toLocaleDateString()} to ${new Date(latest).toLocaleDateString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <MetricsHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          minDate={minDate}
          maxDate={maxDate}
          onRefresh={refreshData}
          loading={loading}
          hasBackfilled={hasBackfilled}
          dailyActiveUsersLength={dailyActiveUsers.length}
          getDateRangeMessage={getDateRangeMessage}
        />

        <DailyMetricsSection
          selectedDate={selectedDate}
          currentDayData={currentDayData}
          previousDayData={previousDayData}
          formatDateDescription={formatDateDescription}
          getTrend={getTrend}
        />

        <OverallMetricsSection retentionData={retentionData} />

        <RetentionMetricsSection retentionData={retentionData} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementHeatmap data={engagementData} />
          <FeatureUsageChart data={featureUsage} />
        </div>

        <HistoricalOverviewSection 
          dailyActiveUsers={dailyActiveUsers}
          retentionData={retentionData}
        />
      </div>
    </div>
  );
};

export default Metrics;
