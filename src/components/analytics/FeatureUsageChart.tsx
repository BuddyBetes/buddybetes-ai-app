
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
}

const FeatureUsageChart: React.FC<FeatureUsageChartProps> = ({ data, startDate, endDate }) => {
  const getDateRangeText = () => {
    return `(${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Features {getDateRangeText()}</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default FeatureUsageChart;
