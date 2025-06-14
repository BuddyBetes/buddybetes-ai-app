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
import { LineChart as LineChartIcon, AlertCircle } from 'lucide-react';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';

interface GlucoseChartProps {
  data: GlucoseLog[];
  title?: string;
  showControls?: boolean;
  timeRange?: '24h' | '7d' | '30d' | '3m' | '6m';
}

const timeRanges = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '3m': 'Last 3 Months',
  '6m': 'Last 6 Months'
};

const formatDate = (timestamp: Date, timeRange: string) => {
  if (timeRange === '24h') {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (timeRange === '7d' || timeRange === '30d') {
    return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else {
    // For 3m and 6m, show month/year format
    return timestamp.toLocaleDateString([], { month: 'short', year: '2-digit' });
  }
};

const getTimeRangeHours = (timeRange: string) => {
  switch (timeRange) {
    case '24h': return 24;
    case '7d': return 168; // 7 days
    case '30d': return 720; // 30 days
    case '3m': return 2160; // 90 days
    case '6m': return 4320; // 180 days
    default: return 24;
  }
};

const GlucoseChart: React.FC<GlucoseChartProps> = ({ 
  data, 
  title, 
  showControls = false, 
  timeRange: propTimeRange 
}) => {
  const [localTimeRange, setLocalTimeRange] = useState<'24h' | '7d' | '30d' | '3m' | '6m'>('24h');
  const { glucoseUnit } = useGlucoseUnit();
  
  // Use prop timeRange if provided, otherwise use local state
  const activeTimeRange = propTimeRange || localTimeRange;
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = new Date();
    const timeRangeHours = getTimeRangeHours(activeTimeRange);
    const cutoff = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);
    
    return data
      .filter(log => log.timestamp > cutoff && log.glucoseLevel !== undefined)
      .map(log => {
        // Convert the glucose value to the user's preferred unit
        const convertedValue = glucoseUnit === 'mg/dL' 
          ? log.glucoseLevel 
          : convertGlucoseValue(log.glucoseLevel as number, 'mg/dL', 'mmol/L');
          
        return {
          time: formatDate(log.timestamp, activeTimeRange),
          value: convertedValue,
          originalValue: log.glucoseLevel,
          timestamp: log.timestamp.getTime(),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = getFilteredData();
  
  // Calculate target range values based on unit
  const getLowerTarget = () => glucoseUnit === 'mg/dL' ? 80 : convertGlucoseValue(80, 'mg/dL', 'mmol/L');
  const getUpperTarget = () => glucoseUnit === 'mg/dL' ? 140 : convertGlucoseValue(140, 'mg/dL', 'mmol/L');
  
  const calculateStats = () => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const values = chartData.map(d => d.value as number).filter(Boolean);
    if (values.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      avg: glucoseUnit === 'mg/dL' ? Math.round(sum / values.length) : parseFloat((sum / values.length).toFixed(1)),
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
          <Tabs defaultValue="24h" value={localTimeRange} onValueChange={(value) => setLocalTimeRange(value as '24h' | '7d' | '30d' | '3m' | '6m')}>
            <TabsList className="bg-gray-100 h-6">
              {Object.entries(timeRanges).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs px-2 py-0.5 h-5">{label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      
      {chartData.length > 0 ? (
        <>
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
                domain={[
                  glucoseUnit === 'mg/dL' ? 60 : 3.3,
                  glucoseUnit === 'mg/dL' ? 200 : 11.1
                ]} 
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
                formatter={(value) => [`${value} ${glucoseUnit}`, 'Glucose']}
              />
              <ReferenceLine y={getLowerTarget()} stroke="#5ECFB9" strokeDasharray="3 3" />
              <ReferenceLine y={getUpperTarget()} stroke="#5ECFB9" strokeDasharray="3 3" />
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
          
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
            <div className="px-2 py-0.5 bg-gray-100 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-500">Min: </span>
              <span className="text-xs sm:text-sm font-medium">{stats.min} {glucoseUnit}</span>
            </div>
            <div className="px-2 py-0.5 bg-gray-100 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-500">Max: </span>
              <span className="text-xs sm:text-sm font-medium">{stats.max} {glucoseUnit}</span>
            </div>
            <div className="px-2 py-0.5 bg-gray-100 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-500">Avg: </span>
              <span className="text-xs sm:text-sm font-medium">{stats.avg} {glucoseUnit}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="bg-gray-100 p-3 rounded-full mb-4">
            <LineChartIcon size={32} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600 mb-2">No glucose data available</p>
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <AlertCircle size={14} className="mr-1 text-gray-400" />
            <p>Log your readings to see trends over time</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlucoseChart;
