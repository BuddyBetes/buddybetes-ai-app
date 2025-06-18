
import React from 'react';
import { TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import type { RetentionData } from '@/hooks/analytics/types';

interface OverallMetricsSectionProps {
  retentionData: RetentionData | null;
}

const OverallMetricsSection: React.FC<OverallMetricsSectionProps> = ({
  retentionData
}) => {
  return (
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
          title="Active Users (Since June 1)"
          value={retentionData?.total_users || 0}
          description="Users who logged health data from June 1, 2025"
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
  );
};

export default OverallMetricsSection;
