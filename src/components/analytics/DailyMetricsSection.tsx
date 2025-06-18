
import React from 'react';
import { Calendar } from 'lucide-react';
import MetricCard from './MetricCard';
import EngagementHeatmap from './EngagementHeatmap';
import type { DailyActiveUser, EngagementData } from '@/hooks/analytics/types';

interface DailyMetricsSectionProps {
  selectedDate: Date;
  currentDayData: DailyActiveUser | null;
  previousDayData: DailyActiveUser | null;
  engagementData: EngagementData[];
  formatDateDescription: (date: Date) => string;
  getTrend: (today: number, yesterday: number) => { value: number; isPositive: boolean } | null;
}

const DailyMetricsSection: React.FC<DailyMetricsSectionProps> = ({
  selectedDate,
  currentDayData,
  previousDayData,
  engagementData,
  formatDateDescription,
  getTrend
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
        Daily Metrics - {selectedDate.toLocaleDateString()}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Daily Active Users"
          value={currentDayData?.total_active_users || 0}
          description={`Users who used the app ${formatDateDescription(selectedDate)}`}
          trend={currentDayData && previousDayData ? getTrend(currentDayData.total_active_users, previousDayData.total_active_users) : undefined}
        />
        <MetricCard
          title="New Users"
          value={currentDayData?.new_users || 0}
          description={`All account signups ${formatDateDescription(selectedDate)} (regardless of activity)`}
          trend={currentDayData && previousDayData ? getTrend(currentDayData.new_users, previousDayData.new_users) : undefined}
        />
        <MetricCard
          title="Total Sessions"
          value={currentDayData?.total_sessions || 0}
          description={`App sessions ${formatDateDescription(selectedDate)}`}
          trend={currentDayData && previousDayData ? getTrend(currentDayData.total_sessions, previousDayData.total_sessions) : undefined}
        />
        <MetricCard
          title="Returning Users"
          value={currentDayData?.returning_users || 0}
          description={`Existing users who were active ${formatDateDescription(selectedDate)}`}
          trend={currentDayData && previousDayData ? getTrend(currentDayData.returning_users, previousDayData.returning_users) : undefined}
        />
      </div>
      
      {/* Engagement Heatmap */}
      <div className="mb-6">
        <EngagementHeatmap data={engagementData} />
      </div>
    </div>
  );
};

export default DailyMetricsSection;
