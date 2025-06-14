
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, Utensils } from 'lucide-react';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';
import { GlucoseLog } from '@/context/LogContext';

interface DashboardStatsProps {
  lastFoodEntry: any;
  lastReading: number;
  displayLastReading: number;
  isInRange: boolean;
  glucoseLogs: GlucoseLog[];
  displayAverage: number;
  logsToday: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  lastFoodEntry,
  lastReading,
  displayLastReading,
  isInRange,
  glucoseLogs,
  displayAverage,
  logsToday
}) => {
  const { glucoseUnit } = useGlucoseUnit();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.div 
      className="grid grid-cols-2 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.div 
        custom={0}
        variants={cardVariants}
        className="col-span-2 p-6 rounded-xl bg-white shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {lastFoodEntry ? "Latest Food Entry" : "Current Glucose"}
            </h3>
            <div className="flex items-baseline">
              {lastFoodEntry ? (
                <span className="text-xl font-bold text-gray-800 flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-buddy-600" />
                  {lastFoodEntry.food}
                </span>
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {displayLastReading}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">{glucoseUnit}</span>
                </>
              )}
            </div>
          </div>
          {!lastFoodEntry && lastReading > 0 && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isInRange ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {isInRange ? 'In Range' : 'Out of Range'}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <Clock size={12} className="mr-1" />
          Last updated: {
            lastFoodEntry ? 
              new Date(lastFoodEntry.timestamp).toLocaleTimeString() : 
              glucoseLogs[0]?.timestamp.toLocaleTimeString() || 'No readings'
          }
        </div>
      </motion.div>

      <motion.div 
        custom={1}
        variants={cardVariants}
        className="p-4 rounded-xl bg-white shadow-sm flex flex-col items-start"
      >
        <div className="p-2 rounded-lg bg-gray-100 mb-2">
          <Activity size={18} className="text-buddy-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">Average</h3>
        <div className="flex items-baseline">
          <span className="text-xl font-bold text-gray-800">
            {displayAverage}
          </span>
          <span className="ml-1 text-xs text-gray-500">{glucoseUnit}</span>
        </div>
      </motion.div>

      <motion.div 
        custom={2}
        variants={cardVariants}
        className="p-4 rounded-xl bg-white shadow-sm flex flex-col items-start"
      >
        <div className="p-2 rounded-lg bg-gray-100 mb-2">
          <Calendar size={18} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">Logs Today</h3>
        <div className="flex items-baseline">
          <span className="text-xl font-bold text-gray-800">
            {logsToday}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardStats;
