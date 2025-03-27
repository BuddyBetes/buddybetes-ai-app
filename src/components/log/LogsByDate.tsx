
import React from 'react';
import { format, isValid } from 'date-fns';
import { GlucoseLog } from '@/types/logs';
import LogItem from './LogItem';

interface LogsByDateProps {
  date: string;
  logs: GlucoseLog[];
  onLogSelect: (log: GlucoseLog) => void;
}

const LogsByDate: React.FC<LogsByDateProps> = ({ date, logs, onLogSelect }) => {
  // Format the date to a more readable form
  const formattedDate = () => {
    try {
      const logDate = new Date(date);
      
      // Check if the date is valid before formatting
      if (!isValid(logDate)) {
        return 'Invalid date';
      }
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (format(logDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return 'Today';
      } else if (format(logDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        return 'Yesterday';
      } else {
        return format(logDate, 'EEEE, MMMM d, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Invalid date';
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-3">{formattedDate()}</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <LogItem 
            key={log.id} 
            log={log} 
            onClick={onLogSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default LogsByDate;
