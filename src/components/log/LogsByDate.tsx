
import React from 'react';
import { format } from 'date-fns';
import { GlucoseLog } from '@/context/LogContext';
import LogItem from './LogItem';

interface LogsByDateProps {
  date: string;
  logs: GlucoseLog[];
  onLogSelect: (log: GlucoseLog) => void;
}

const LogsByDate: React.FC<LogsByDateProps> = ({ date, logs, onLogSelect }) => {
  // Format the date to a more readable form
  const formattedDate = () => {
    const logDate = new Date(date);
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
