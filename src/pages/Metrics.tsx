
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import MetricsPasswordProtection from '@/components/analytics/MetricsPasswordProtection';
import MetricCard from '@/components/analytics/MetricCard';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import DateFilter from '@/components/analytics/DateFilter';
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

  // Get min and max dates from historical data
  const minDate = dailyActiveUsers.length > 0 
    ? new Date(dailyActiveUsers[dailyActiveUsers.length - 1].date) 
    : new Date('2024-05-20');
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-lg text-gray-600 mt-1">
              Viewing data for {selectedDate.toLocaleDateString()}
            </p>
            {hasBackfilled && dailyActiveUsers.length > 1 && (
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                ✅ Historical data loaded: {dailyActiveUsers.length} days from health data logs
              </p>
            )}
            {hasBackfilled && dailyActiveUsers.length <= 1 && (
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                <Database className="h-4 w-4 mr-1" />
                Backfill completed - refresh to see historical data
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <DateFilter 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
            />
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Daily Metrics (Date Filtered) */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Daily Metrics - {selectedDate.toLocaleDateString()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Daily Active Users"
              value={currentDayData?.total_active_users || 0}
              description={`Active users ${formatDateDescription(selectedDate)}`}
              trend={currentDayData && previousDayData ? getTrend(currentDayData.total_active_users, previousDayData.total_active_users) : undefined}
            />
            <MetricCard
              title="New Users"
              value={currentDayData?.new_users || 0}
              description={`New signups ${formatDateDescription(selectedDate)}`}
              trend={currentDayData && previousDayData ? getTrend(currentDayData.new_users, previousDayData.new_users) : undefined}
            />
            <MetricCard
              title="Total Sessions"
              value={currentDayData?.total_sessions || 0}
              description={`Sessions ${formatDateDescription(selectedDate)}`}
              trend={currentDayData && previousDayData ? getTrend(currentDayData.total_sessions, previousDayData.total_sessions) : undefined}
            />
            <MetricCard
              title="Returning Users"
              value={currentDayData?.returning_users || 0}
              description={`Users who came back ${formatDateDescription(selectedDate)}`}
              trend={currentDayData && previousDayData ? getTrend(currentDayData.returning_users, previousDayData.returning_users) : undefined}
            />
          </div>
        </div>

        {/* Overall Metrics (Not Date Filtered) */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Overall Platform Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Registered Users"
              value={retentionData?.total_registered_users || 0}
              description="All users who signed up"
            />
            <MetricCard
              title="Active Users with Health Data"
              value={retentionData?.total_users || 0}
              description="Users who logged any health data"
            />
            <MetricCard
              title="Engagement Rate"
              value={retentionData ? `${retentionData.engagement_rate.toFixed(1)}%` : '0%'}
              description="Users actively using health features"
            />
            <MetricCard
              title="Day 1 Retention"
              value={retentionData ? `${retentionData.day_1_retention.toFixed(1)}%` : '0%'}
              description="Users returning after 1 day"
            />
          </div>
        </div>

        {/* Retention Metrics */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Retention Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Day 1 Retention"
              value={retentionData ? `${retentionData.day_1_retention.toFixed(1)}%` : '0%'}
              description="Users returning after 1 day"
            />
            <MetricCard
              title="Day 7 Retention"
              value={retentionData ? `${retentionData.day_7_retention.toFixed(1)}%` : '0%'}
              description="Users returning after 7 days"
            />
            <MetricCard
              title="Day 30 Retention"
              value={retentionData ? `${retentionData.day_30_retention.toFixed(1)}%` : '0%'}
              description="Users returning after 30 days"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementHeatmap data={engagementData} />
          <FeatureUsageChart data={featureUsage} />
        </div>

        {/* Historical Data Summary */}
        {dailyActiveUsers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Historical Overview (From Health Data Logs)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dailyActiveUsers.length}
                </div>
                <div className="text-sm text-gray-600">Days of data</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...dailyActiveUsers.map(d => d.total_active_users))}
                </div>
                <div className="text-sm text-gray-600">Peak daily users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dailyActiveUsers.reduce((sum, d) => sum + d.total_sessions, 0)}
                </div>
                <div className="text-sm text-gray-600">Total sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {retentionData ? `${retentionData.engagement_rate.toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Overall engagement</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Metrics;
