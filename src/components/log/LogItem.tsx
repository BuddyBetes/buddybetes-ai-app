
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLogContext } from '@/context/LogContext';
import LogDetailView from './LogDetailView';
import { useToast } from '@/hooks/use-toast';
import LogDisplay from './LogDisplay';
import NutritionSection from './NutritionSection';
import FoodSection from './FoodSection';
import GlucoseSection from './GlucoseSection';
import NotesSection from './NotesSection';
import { formatDistanceToNow } from 'date-fns';

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

  const formatTimestamp = (timestamp: Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return 'Invalid date';
    }
  };

  return (
    <>
      <div 
        className="p-4 rounded-lg bg-white shadow-sm mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleOpenDetail}
      >
        {/* Two-row header */}
        <div className="space-y-2 mb-4">
          {/* Row 1: Badges + Chevron */}
          <div className="flex items-center justify-between">
            <LogDisplay log={log} />
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
          
          {/* Row 2: Timestamp + Time */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
            <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
          </div>
        </div>

        {/* Glucose section at full width */}
        <GlucoseSection log={log} />

        {/* Food section at full width */}
        <FoodSection log={log} />

        {/* Nutrition section at full width */}
        <NutritionSection log={log} />

        {/* Notes section at full width */}
        <NotesSection log={log} />
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
