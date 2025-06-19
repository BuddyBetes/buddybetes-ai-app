
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import MetricCard from '@/components/analytics/MetricCard';
import { format } from 'date-fns';

interface DailyActiveUser {
  date: string;
  total_active_users: number;
  new_users: number;
  returning_users: number;
  total_sessions: number;
}

interface DailyMetricsSectionProps {
  selectedDate: Date;
  dailyData: DailyActiveUser | null;
  previousDayData: DailyActiveUser | null;
}

const DailyMetricsSection: React.FC<DailyMetricsSectionProps> = ({
  selectedDate,
  dailyData,
  previousDayData
}) => {
  const getTrend = (today: number, yesterday: number) => {
    if (!yesterday) return null;
    const change = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  console.log('🎯 DailyMetricsSection render - selectedDate:', format(selectedDate, 'yyyy-MM-dd'));
  console.log('🎯 DailyMetricsSection render - dailyData:', dailyData);
  console.log('🎯 DailyMetricsSection render - dailyData new_users:', dailyData?.new_users);

  return (
    <TooltipProvider>
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Daily Metrics - {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <p className="text-sm text-gray-600">Activity metrics for the selected date</p>
        </div>

        {dailyData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Daily Active Users"
              value={dailyData.total_active_users}
              description="Active users on this date"
              tooltip="Users who had any activity on this specific date (glucose logging or AI assistant usage)."
              trend={previousDayData ? getTrend(dailyData.total_active_users, previousDayData.total_active_users) : undefined}
            />
            <MetricCard
              title="New Users"
              value={dailyData.new_users}
              description="New signups on this date"
              tooltip="Number of new user accounts created on this specific date."
              trend={previousDayData ? getTrend(dailyData.new_users, previousDayData.new_users) : undefined}
            />
            <MetricCard
              title="Total Sessions"
              value={dailyData.total_sessions}
              description="Sessions on this date"
              tooltip="Number of user sessions recorded on this specific date. Sessions are grouped by user activity within 30-minute windows."
              trend={previousDayData ? getTrend(dailyData.total_sessions, previousDayData.total_sessions) : undefined}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No data available for {format(selectedDate, 'MMMM d, yyyy')}</p>
            <p className="text-sm">Try selecting a different date with recorded activity.</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default DailyMetricsSection;
