
import React from 'react';
import { TrendingUp } from 'lucide-react';
import FeatureUsageChart from './FeatureUsageChart';
import FeatureDateRangeFilter from './FeatureDateRangeFilter';
import type { FeatureUsage } from '@/hooks/analytics/types';

interface FeatureUsageSectionProps {
  featureUsage: FeatureUsage[];
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onResetToLast30Days: () => void;
  loading?: boolean;
}

const FeatureUsageSection: React.FC<FeatureUsageSectionProps> = ({
  featureUsage,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onResetToLast30Days,
  loading = false
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Feature Usage Analysis
          </h2>
          <p className="text-sm text-gray-600">
            Most popular features used by your users over the selected time period.
          </p>
        </div>
        
        <FeatureDateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onResetToLast30Days={onResetToLast30Days}
        />
      </div>
      
      <FeatureUsageChart 
        data={featureUsage} 
        startDate={startDate}
        endDate={endDate}
        loading={loading}
      />
    </div>
  );
};

export default FeatureUsageSection;
