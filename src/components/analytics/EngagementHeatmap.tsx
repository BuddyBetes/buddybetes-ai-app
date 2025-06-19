
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface EngagementData {
  hour: number;
  activity_count: number;
}

interface EngagementHeatmapProps {
  data: EngagementData[];
  selectedDateString?: string;
}

const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ data, selectedDateString }) => {
  const maxActivity = Math.max(...data.map(d => d.activity_count));
  const totalActivity = data.reduce((sum, d) => sum + d.activity_count, 0);

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

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Format the selected date for display
  const getDateDisplay = () => {
    if (!selectedDateString) return '';
    const date = new Date(selectedDateString + 'T12:00:00.000Z');
    return ` - ${format(date, 'MMM d, yyyy')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Engagement Heatmap (24 Hours){getDateDisplay()}
        </CardTitle>
        <div className="text-sm text-gray-600">
          {totalActivity > 0 ? (
            <>
              {totalActivity} total activities • Hours shown in UTC
            </>
          ) : (
            selectedDateString ? 'No activity recorded for this date' : 'Select a date to view hourly activity'
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {data.map((item) => (
            <div
              key={item.hour}
              className={`aspect-square rounded ${getColor(getIntensity(item.activity_count))} flex items-center justify-center text-xs font-medium transition-colors duration-200 hover:ring-2 hover:ring-blue-300`}
              title={`${formatHour(item.hour)} UTC - ${item.activity_count} activities`}
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
        {maxActivity > 0 && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Peak activity: {maxActivity} activities in one hour
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EngagementHeatmap;
