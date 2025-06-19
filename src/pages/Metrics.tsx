
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MetricsPasswordProtection from '@/components/analytics/MetricsPasswordProtection';
import MetricCard from '@/components/analytics/MetricCard';
import EngagementHeatmap from '@/components/analytics/EngagementHeatmap';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import { useMetricsData } from '@/hooks/useMetricsData';

const Metrics = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { 
    dailyActiveUsers, 
    retentionData, 
    engagementData, 
    featureUsage, 
    loading, 
    refreshData 
  } = useMetricsData();

  if (!isAuthenticated) {
    return <MetricsPasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const todayData = dailyActiveUsers[0];
  const yesterdayData = dailyActiveUsers[1];

  const getTrend = (today: number, yesterday: number) => {
    if (!yesterday) return null;
    const change = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Daily Active Users"
            value={todayData?.total_active_users || 0}
            description="Active users today"
            trend={todayData && yesterdayData ? getTrend(todayData.total_active_users, yesterdayData.total_active_users) : undefined}
          />
          <MetricCard
            title="New Users"
            value={todayData?.new_users || 0}
            description="New signups today"
            trend={todayData && yesterdayData ? getTrend(todayData.new_users, yesterdayData.new_users) : undefined}
          />
          <MetricCard
            title="Total Sessions"
            value={todayData?.total_sessions || 0}
            description="Sessions today"
            trend={todayData && yesterdayData ? getTrend(todayData.total_sessions, yesterdayData.total_sessions) : undefined}
          />
          <MetricCard
            title="Day 1 Retention"
            value={retentionData ? `${retentionData.day_1_retention.toFixed(1)}%` : '0%'}
            description="Users returning after 1 day"
          />
        </div>

        {/* Retention Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <MetricCard
            title="Total Users"
            value={retentionData?.total_users || 0}
            description="All registered users"
          />
        </div>

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
