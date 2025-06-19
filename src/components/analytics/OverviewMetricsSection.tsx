
import React from 'react';
import MetricCard from '@/components/analytics/MetricCard';

interface RetentionData {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  total_users: number;
}

interface OverviewMetricsSectionProps {
  retentionData: RetentionData | null;
}

const OverviewMetricsSection: React.FC<OverviewMetricsSectionProps> = ({ retentionData }) => {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Overview Metrics</h2>
        <p className="text-sm text-gray-600">Data calculated from June 1, 2025 onwards</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <MetricCard
          title="Total Users"
          value={retentionData?.total_users || 0}
          description="All registered users"
        />
      </div>
    </div>
  );
};

export default OverviewMetricsSection;
