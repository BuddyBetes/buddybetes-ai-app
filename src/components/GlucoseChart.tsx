
import React from 'react';
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

interface GlucoseChartProps {
  data: GlucoseLog[];
}

const formatDate = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const GlucoseChart: React.FC<GlucoseChartProps> = ({ data }) => {
  const chartData = data.map(log => ({
    time: formatDate(log.timestamp),
    value: log.glucoseLevel,
    timestamp: log.timestamp.getTime(),
  })).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="w-full h-64 p-4 rounded-xl bg-white shadow-sm">
      <div className="text-lg font-semibold mb-2">Glucose Trends</div>
      <ResponsiveContainer width="100%" height="90%">
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
    </div>
  );
};

export default GlucoseChart;
