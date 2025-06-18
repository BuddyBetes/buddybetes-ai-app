
import React from 'react';
import { TrendingUp } from 'lucide-react';
import FeatureUsageChart from './FeatureUsageChart';
import type { FeatureUsage } from '@/hooks/analytics/types';

interface FeatureUsageSectionProps {
  featureUsage: FeatureUsage[];
  startDate: Date;
  endDate: Date;
}

const FeatureUsageSection: React.FC<FeatureUsageSectionProps> = ({
  featureUsage,
  startDate,
  endDate
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
        Feature Usage Analysis
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Most popular features used by your users over the selected time period.
      </p>
      
      <FeatureUsageChart 
        data={featureUsage} 
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default FeatureUsageSection;
