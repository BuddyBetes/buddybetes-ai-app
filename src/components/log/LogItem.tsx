
import React from 'react';
import { motion } from 'framer-motion';
import { GlucoseLog } from '@/types/logs';
import { ChevronRight, Dot, Utensils } from 'lucide-react';

interface LogItemProps {
  log: GlucoseLog;
  index: number;
  onClick: (log: GlucoseLog) => void;
}

const LogItem: React.FC<LogItemProps> = ({ log, index, onClick }) => {
  
  const getStatusColor = (glucoseLevel: number | undefined) => {
    if (!glucoseLevel) return 'text-gray-600';
    if (glucoseLevel < 70) return 'text-red-600';
    if (glucoseLevel > 180) return 'text-orange-600';
    return 'text-green-600';
  };

  const getMealContextLabel = (mealContext?: 'before' | 'after' | 'fasting') => {
    switch (mealContext) {
      case 'before': return 'Before Meal';
      case 'after': return 'After Meal';
      case 'fasting': return 'Fasting';
      default: return '';
    }
  };

  const mealContextColors = {
    before: 'bg-blue-100 text-blue-800',
    after: 'bg-purple-100 text-purple-800',
    fasting: 'bg-amber-100 text-amber-800',
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + (index * 0.05) }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      onClick={() => onClick(log)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              {log.glucoseLevel !== undefined ? (
                <>
                  <span className="text-xl font-bold">{log.glucoseLevel}</span>
                  <span className="text-sm text-gray-500">mg/dL</span>
                  <Dot size={20} className={getStatusColor(log.glucoseLevel)} />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Utensils size={18} className="text-buddy-500" />
                  <span className="text-lg font-medium">Food Entry</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <span>{formatTime(log.timestamp)}</span>
              {log.mealContext && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${mealContextColors[log.mealContext]}`}>
                  {getMealContextLabel(log.mealContext)}
                </span>
              )}
            </div>
          </div>
          
          <ChevronRight size={20} className="text-gray-400" />
        </div>
        
        {log.food && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Food:</span> {log.food}
          </div>
        )}
        
        {log.notes && (
          <div className="mt-1 text-sm text-gray-700">
            <span className="font-medium">Notes:</span> {log.notes}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LogItem;
