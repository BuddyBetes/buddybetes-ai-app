
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLogAPI } from '@/hooks/useLogAPI';
import { useLogUtils } from '@/hooks/useLogUtils';
import { GlucoseLog, LogContextType } from '@/types/logs';
import { useAuth } from '@/context/AuthContext';

const LogContext = createContext<LogContextType | undefined>(undefined);

export const useLogContext = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogProvider');
  }
  return context;
};

interface LogProviderProps {
  children: ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { logs, isLoading, fetchLogs, addLog, updateLog, deleteLog } = useLogAPI();
  const { getRecentLogs, getGlucoseLogsOnly, getLogsForToday, getAverageGlucose } = useLogUtils(logs);

  // Refetch logs when the user changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching logs');
      fetchLogs();
    }
  }, [user, fetchLogs]);

  const contextValue: LogContextType = {
    logs,
    addLog,
    updateLog, 
    deleteLog,
    getRecentLogs,
    getGlucoseLogsOnly,
    getLogsForToday,
    getAverageGlucose,
    isLoading
  };

  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  );
};

// Re-export GlucoseLog type for backward compatibility
export type { GlucoseLog } from '@/types/logs';
