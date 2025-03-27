
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLogContext } from '@/context/LogContext';
import LogDetailView from './LogDetailView';
import { useToast } from '@/hooks/use-toast';
import LogDisplay from './LogDisplay';

interface LogItemProps {
  log: GlucoseLog;
  onClick?: (log: GlucoseLog) => void;
}

const LogItem: React.FC<LogItemProps> = ({ log, onClick }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenDetail = () => {
    if (onClick) {
      onClick(log);
    } else {
      setIsDetailOpen(true);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div 
        className="p-4 rounded-lg bg-white shadow-sm mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleOpenDetail}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <LogDisplay log={log} />
          </div>
          
          <div className="flex flex-col items-end ml-4">
            <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
            <span className="text-xs text-gray-500 mt-2">{formatTime(log.timestamp)}</span>
          </div>
        </div>
      </div>

      <LogDetailView 
        log={log} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </>
  );
};

export default LogItem;
