
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Registered Users"
          value={retentionData?.total_registered_users || 0}
          description="All users who created profiles"
        />
        <MetricCard
          title="Active Users"
          value={retentionData?.total_users || 0}
          description="Users who have logged any health data"
        />
        <MetricCard
          title="Engagement Rate"
          value={retentionData ? `${retentionData.engagement_rate.toFixed(1)}%` : '0%'}
          description="Percentage of registered users who are active"
        />
      </div>
    </div>
  );
};

export default OverallMetricsSection;
