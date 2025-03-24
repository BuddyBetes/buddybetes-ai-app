
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLogContext, GlucoseLog } from '../context/LogContext';
import { motion } from 'framer-motion';
import { ChevronRight, Dot, Loader2, Utensils } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import LogDetailView from '@/components/log/LogDetailView';
import { useToast } from '@/hooks/use-toast';

const Logs = () => {
  const { logs, isLoading } = useLogContext();
  const { toast } = useToast();
  const [selectedLog, setSelectedLog] = useState<GlucoseLog | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Format date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

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

  // Group logs by date
  const groupedLogs: Record<string, GlucoseLog[]> = {};
  logs.forEach(log => {
    const dateStr = formatDate(log.timestamp);
    if (!groupedLogs[dateStr]) {
      groupedLogs[dateStr] = [];
    }
    groupedLogs[dateStr].push(log);
  });

  const handleLogClick = (log: GlucoseLog) => {
    setSelectedLog(log);
    setDetailViewOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailViewOpen(false);
  };

  const handleEditLog = (log: GlucoseLog) => {
    toast({
      title: "Edit functionality",
      description: "Edit functionality is not implemented yet",
    });
    setDetailViewOpen(false);
  };

  const handleDeleteLog = (logId: string) => {
    toast({
      title: "Delete functionality",
      description: "Delete functionality is not implemented yet",
    });
    setDetailViewOpen(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <AppHeader />
        <div className="flex flex-col items-center justify-center h-full py-12">
          <Loader2 className="h-8 w-8 animate-spin text-buddy-500" />
          <p className="mt-4 text-gray-500">Loading your glucose logs...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28 pt-4">
        {Object.entries(groupedLogs).map(([dateStr, logsForDate], dateIndex) => (
          <motion.div 
            key={dateStr}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-md font-medium text-gray-500 px-1">{dateStr}</h3>
            
            {logsForDate.map((log, logIndex) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (logIndex * 0.05) }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                onClick={() => handleLogClick(log)}
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
            ))}
          </motion.div>
        ))}
        
        {Object.keys(groupedLogs).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="text-gray-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No logs yet</h3>
            <p className="text-gray-500 mt-2">Start tracking your glucose by adding a new log</p>
          </motion.div>
        )}
      </div>

      <LogDetailView 
        log={selectedLog}
        isOpen={detailViewOpen}
        onClose={handleCloseDetail}
        onEdit={handleEditLog}
        onDelete={handleDeleteLog}
      />
    </Layout>
  );
};

export default Logs;
