import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import DayNavigator from '@/components/analytics/DayNavigator';
import OverviewMetricsSection from '@/components/analytics/OverviewMetricsSection';
import DailyMetricsSection from '@/components/analytics/DailyMetricsSection';
import { useMetricsData } from '@/hooks/useMetricsData';

const Analytics = () => {
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

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDateString) {
      const mostRecentDate = [...availableDates].sort().reverse()[0];
      setSelectedDateString(mostRecentDate);
    }
  }, [availableDates, selectedDateString]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track app usage and user engagement</p>
          </div>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <OverviewMetricsSection retentionData={retentionData} />

        {availableDates.length > 0 && selectedDateString && (
          <>
            <DayNavigator
              selectedDateString={selectedDateString}
              onDateChange={setSelectedDateString}
              availableDates={availableDates}
            />

            <DailyMetricsSection
              selectedDateString={selectedDateString}
              dailyData={selectedDayData}
              previousDayData={previousDayData}
            />
          </>
        )}

        {availableDates.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No historical data available yet</p>
            <p className="text-sm">Daily metrics will appear here once users start using the app</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementHeatmap 
            data={engagementData} 
            selectedDateString={selectedDateString || undefined}
          />
          <FeatureUsageChart data={featureUsage} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
