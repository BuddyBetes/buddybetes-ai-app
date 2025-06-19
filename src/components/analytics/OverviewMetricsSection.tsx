
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import MetricCard from '@/components/analytics/MetricCard';

interface RetentionData {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  total_users: number;
  total_registered_users: number;
  total_active_users: number;
  health_data_users: number;
  ai_assistant_users: number;
  engagement_rate: number;
}

interface OverviewMetricsSectionProps {
  retentionData: RetentionData | null;
}

const OverviewMetricsSection: React.FC<OverviewMetricsSectionProps> = ({ retentionData }) => {
  return (
    <TooltipProvider>
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Overview Metrics</h2>
          <p className="text-sm text-gray-600">All-time retention and user metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Day 1 Retention"
            value={retentionData ? `${retentionData.day_1_retention.toFixed(1)}%` : '0%'}
            description="Users returning on/after day 1"
            tooltip="All-time: Percentage of users who used the app on or after day 1 of account creation. Calculated from all users who signed up at least 1 day ago."
          />
          <MetricCard
            title="Day 7 Retention"
            value={retentionData ? `${retentionData.day_7_retention.toFixed(1)}%` : '0%'}
            description="Users returning on/after day 7"
            tooltip="All-time: Percentage of users who used the app on or after day 7 of account creation. Calculated from all users who signed up at least 7 days ago."
          />
          <MetricCard
            title="Day 30 Retention"
            value={retentionData ? `${retentionData.day_30_retention.toFixed(1)}%` : '0%'}
            description="Users returning on/after day 30"
            tooltip="All-time: Percentage of users who used the app on or after day 30 of account creation. Calculated from all users who signed up at least 30 days ago."
          />
          <MetricCard
            title="Total Users"
            value={retentionData?.total_registered_users || 0}
            description="All registered users"
            tooltip="Total number of registered user accounts in the system from all time (from profiles table)."
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default OverviewMetricsSection;
