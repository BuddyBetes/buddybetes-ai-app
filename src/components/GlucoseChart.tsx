
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { GlucoseLog } from '../context/LogContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

interface GlucoseChartProps {
  data: GlucoseLog[];
  title?: string;
  showControls?: boolean;
}

const timeRanges = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days'
};

const formatDate = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDay = (timestamp: Date) => {
  return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const GlucoseChart: React.FC<GlucoseChartProps> = ({ data, title, showControls = false }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = new Date();
    const timeRangeHours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const cutoff = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);
    
    return data
      .filter(log => log.timestamp > cutoff && log.glucoseLevel !== undefined)
      .map(log => ({
        time: timeRange === '24h' ? formatDate(log.timestamp) : formatDay(log.timestamp),
        value: log.glucoseLevel,
        timestamp: log.timestamp.getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = getFilteredData();
  
  const calculateStats = () => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const values = chartData.map(d => d.value as number).filter(Boolean);
    if (values.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      avg: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };
  
  const stats = calculateStats();

  return (
    <div className="w-full p-4 rounded-xl bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        {title && <div className="text-lg font-semibold">{title}</div>}
        
        {showControls && (
          <Tabs defaultValue="24h" value={timeRange} onValueChange={(value) => setTimeRange(value as '24h' | '7d' | '30d')}>
            <TabsList className="bg-gray-100">
              {Object.entries(timeRanges).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs">{label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      
      {chartData.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <div className="flex space-x-2">
              <div className="px-2 py-0.5 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500">Avg: </span>
                <span className="text-xs font-medium">{stats.avg} mg/dL</span>
              </div>
              <div className="px-2 py-0.5 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500">Min: </span>
                <span className="text-xs font-medium">{stats.min} mg/dL</span>
              </div>
              <div className="px-2 py-0.5 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500">Max: </span>
                <span className="text-xs font-medium">{stats.max} mg/dL</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
              />
              <YAxis 
                domain={[60, 200]} 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <ReferenceLine y={80} stroke="#5ECFB9" strokeDasharray="3 3" />
              <ReferenceLine y={140} stroke="#5ECFB9" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#5ECFB9"
                strokeWidth={3}
                dot={{ stroke: '#5ECFB9', strokeWidth: 2, r: 4, fill: 'white' }}
                activeDot={{ stroke: '#5ECFB9', strokeWidth: 2, r: 6, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p>No glucose data available for this time period</p>
          <p className="text-sm mt-2">Log your readings to see trends</p>
        </div>
      )}
    </div>
  );
};

export default GlucoseChart;
