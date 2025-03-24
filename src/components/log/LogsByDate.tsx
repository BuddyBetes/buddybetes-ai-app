
import React from 'react';
import { motion } from 'framer-motion';
import { GlucoseLog } from '@/types/logs';
import LogItem from './LogItem';

interface LogsByDateProps {
  dateStr: string;
  logs: GlucoseLog[];
  dateIndex: number;
  onLogClick: (log: GlucoseLog) => void;
}

const LogsByDate: React.FC<LogsByDateProps> = ({ dateStr, logs, dateIndex, onLogClick }) => {
  // If no logs for this date, don't render anything
  if (logs.length === 0) return null;
  
  return (
    <motion.div 
      key={dateStr}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dateIndex * 0.1 }}
      className="space-y-3"
    >
      <h3 className="text-md font-medium text-gray-500 px-1">{dateStr}</h3>
      
      {logs.map((log, logIndex) => (
        <LogItem 
          key={log.id} 
          log={log} 
          index={logIndex} 
          onClick={onLogClick} 
        />
      ))}
    </motion.div>
  );
};

export default LogsByDate;
