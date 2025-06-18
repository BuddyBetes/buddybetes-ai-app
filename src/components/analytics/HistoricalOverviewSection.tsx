
import React from 'react';
import type { DailyActiveUser, RetentionData } from '@/hooks/analytics/types';

interface HistoricalOverviewSectionProps {
  dailyActiveUsers: DailyActiveUser[];
  retentionData: RetentionData | null;
}

const HistoricalOverviewSection: React.FC<HistoricalOverviewSectionProps> = ({
  dailyActiveUsers,
  retentionData
}) => {
  if (dailyActiveUsers.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Historical Overview</h2>
      <p className="text-sm text-gray-600 mb-4">
        Retention metrics are calculated based on profile creation dates and first health data activity.
      </p>
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
  );
};

export default HistoricalOverviewSection;
