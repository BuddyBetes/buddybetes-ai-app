
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MetricsPasswordProtection from '@/components/analytics/MetricsPasswordProtection';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import DayNavigator from '@/components/analytics/DayNavigator';
import OverviewMetricsSection from '@/components/analytics/OverviewMetricsSection';
import DailyMetricsSection from '@/components/analytics/DailyMetricsSection';
import { useMetricsData } from '@/hooks/useMetricsData';

const Metrics = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { 
    selectedDayData,
    previousDayData,
    retentionData, 
    engagementData, 
    featureUsage, 
    loading, 
    refreshData 
  } = useMetricsData(selectedDate);

  // Enhanced debug logging with timestamps in main Metrics component
  const timestamp = new Date().toISOString();
  const dateString = selectedDate.toISOString().split('T')[0];
  
  console.log(`[${timestamp}] 🎯 Metrics component RENDER:`, {
    selectedDate: dateString,
    selectedDateObject: selectedDate,
    selectedDayData,
    previousDayData,
    selectedDayDataNewUsers: selectedDayData?.new_users,
    previousDayDataNewUsers: previousDayData?.new_users,
    renderTime: timestamp
  });

  if (!isAuthenticated) {
    return <MetricsPasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // Analytics data started on June 1, 2025
  const minDate = new Date('2025-06-01');
  const maxDate = new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overview Metrics */}
        <OverviewMetricsSection retentionData={retentionData} />

        {/* Day Navigation */}
        <DayNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          minDate={minDate}
          maxDate={maxDate}
        />

        {/* Daily Metrics */}
        <DailyMetricsSection
          selectedDate={selectedDate}
          dailyData={selectedDayData}
          previousDayData={previousDayData}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementHeatmap data={engagementData} />
          <FeatureUsageChart data={featureUsage} />
        </div>
      </div>
    </div>
  );
};

export default Metrics;
