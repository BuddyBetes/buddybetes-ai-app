
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlucoseChart from '../GlucoseChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlucoseLog } from '@/context/LogContext';

interface GlucoseChartSectionProps {
  glucoseLogs: GlucoseLog[];
}

type TimeRange = '24h' | '7d' | '30d' | '3m' | '6m';

const timeRangeOptions = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '3m': 'Last 3 Months',
  '6m': 'Last 6 Months'
};

const GlucoseChartSection: React.FC<GlucoseChartSectionProps> = ({ glucoseLogs }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const navigate = useNavigate();
  
  const navigateToLogs = () => {
    navigate('/logs');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Glucose Trend</h3>
        <button 
          className="text-buddy-600 text-sm font-medium flex items-center"
          onClick={navigateToLogs}
        >
          View All <ArrowUpRight size={14} className="ml-1" />
        </button>
      </div>
      
      <div className="flex justify-center sm:justify-end mb-4">
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg">
            {Object.entries(timeRangeOptions).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-sm">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <GlucoseChart data={glucoseLogs} showControls={false} timeRange={timeRange} />
    </motion.div>
  );
};

export default GlucoseChartSection;
