
import React from 'react';
import MetricCard from './MetricCard';
import type { RetentionData } from '@/hooks/analytics/types';

interface RetentionMetricsSectionProps {
  retentionData: RetentionData | null;
}

const RetentionMetricsSection: React.FC<RetentionMetricsSectionProps> = ({
  retentionData
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">User Retention Analysis</h2>
      <p className="text-sm text-gray-600 mb-4">
        Retention is calculated based on profile creation date. Shows the percentage of users who logged health data within X days of signing up.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Day 1 Retention"
          value={retentionData ? `${retentionData.day_1_retention.toFixed(1)}%` : '0%'}
          description="Users who logged health data within 1 day of profile creation"
        />
        <MetricCard
          title="Day 7 Retention"
          value={retentionData ? `${retentionData.day_7_retention.toFixed(1)}%` : '0%'}
          description="Users who logged health data within 7 days of profile creation"
        />
        <MetricCard
          title="Day 30 Retention"
          value={retentionData ? `${retentionData.day_30_retention.toFixed(1)}%` : '0%'}
          description="Users who logged health data within 30 days of profile creation"
        />
      </div>
    </div>
  );
};

export default RetentionMetricsSection;
