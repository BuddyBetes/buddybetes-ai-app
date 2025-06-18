
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FeatureUsage {
  feature: string;
  usage_count: number;
}

interface FeatureUsageChartProps {
  data: FeatureUsage[];
  startDate: Date;
  endDate: Date;
  loading?: boolean;
}

const FeatureUsageChart: React.FC<FeatureUsageChartProps> = ({ 
  data, 
  startDate, 
  endDate, 
  loading = false 
}) => {
  const getDateRangeText = () => {
    return `(${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Features {getDateRangeText()}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading feature usage data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">No feature usage data available for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="feature" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage_count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureUsageChart;
