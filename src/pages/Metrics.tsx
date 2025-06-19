
import React, { useState, useEffect } from 'react';
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
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);

  const { 
    selectedDayData,
    previousDayData,
    retentionData, 
    engagementData, 
    featureUsage,
    availableDates,
    loading, 
    refreshData 
  } = useMetricsData(selectedDateString || undefined);

  // Set initial date to the most recent available date
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDateString) {
      const mostRecentDate = [...availableDates].sort().reverse()[0];
      setSelectedDateString(mostRecentDate);
    }
  }, [availableDates, selectedDateString]);

  if (!isAuthenticated) {
    return <MetricsPasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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

        {/* Day Navigation - only show when we have available dates and a selected date */}
        {availableDates.length > 0 && selectedDateString && (
          <>
            <DayNavigator
              selectedDateString={selectedDateString}
              onDateChange={setSelectedDateString}
              availableDates={availableDates}
            />

            {/* Daily Metrics */}
            <DailyMetricsSection
              selectedDateString={selectedDateString}
              dailyData={selectedDayData}
              previousDayData={previousDayData}
            />
          </>
        )}

        {/* Show message when no dates available */}
        {availableDates.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>No historical data available yet.</p>
            <p className="text-sm">Daily metrics will appear here once users start using the app.</p>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementHeatmap 
            data={engagementData} 
            selectedDateString={selectedDateString || undefined}
          />
          <FeatureUsageChart data={featureUsage} />
        </div>
      </div>
    </div>
  );
};

export default Metrics;
