
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
      <h2 className="text-xl font-semibold mb-3">Retention Analysis (From June 1, 2025)</h2>
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
  );
};

export default RetentionMetricsSection;
