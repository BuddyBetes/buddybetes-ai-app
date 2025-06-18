
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EngagementData {
  hour: number;
  activity_count: number;
}

interface EngagementHeatmapProps {
  data: EngagementData[];
}

const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ data }) => {
  const maxActivity = Math.max(...data.map(d => d.activity_count));

  const getIntensity = (count: number) => {
    if (maxActivity === 0) return 0;
    return count / maxActivity;
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 0.25) return 'bg-blue-200';
    if (intensity < 0.5) return 'bg-blue-300';
    if (intensity < 0.75) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Heatmap (24 Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {data.map((item) => (
            <div
              key={item.hour}
              className={`aspect-square rounded ${getColor(getIntensity(item.activity_count))} flex items-center justify-center text-xs font-medium`}
              title={`${item.hour}:00 - ${item.activity_count} activities`}
            >
              {item.hour}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Less active</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
          </div>
          <span>More active</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementHeatmap;
