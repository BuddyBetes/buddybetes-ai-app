
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GlucoseLog {
  id: string;
  timestamp: Date;
  glucoseLevel: number;
  food?: string;
  mealContext?: 'before' | 'after' | 'fasting';
  medication?: string;
  weight?: number;
  notes?: string;
}

interface LogContextType {
  logs: GlucoseLog[];
  addLog: (log: Omit<GlucoseLog, 'id'>) => void;
  getRecentLogs: (count: number) => GlucoseLog[];
  getAverageGlucose: () => number;
}

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
  const [logs, setLogs] = useState<GlucoseLog[]>([]);

  // Load sample data on first render
  useEffect(() => {
    // Sample data
    const sampleLogs: GlucoseLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        glucoseLevel: 120,
        food: 'Oatmeal with berries',
        mealContext: 'after',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        glucoseLevel: 95,
        food: 'Chicken salad',
        mealContext: 'before',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        glucoseLevel: 145,
        food: 'Turkey sandwich',
        mealContext: 'after',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        glucoseLevel: 110,
        food: 'Apple with almond butter',
        mealContext: 'before',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        glucoseLevel: 130,
        food: 'Grilled salmon with vegetables',
        mealContext: 'after',
      },
    ];
    
    setLogs(sampleLogs);
  }, []);

  const addLog = (log: Omit<GlucoseLog, 'id'>) => {
    const newLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9), // Simple ID generation
    };
    setLogs([...logs, newLog]);
  };

  const getRecentLogs = (count: number) => {
    return [...logs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  };

  const getAverageGlucose = () => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((total, log) => total + log.glucoseLevel, 0);
    return Math.round(sum / logs.length);
  };

  return (
    <LogContext.Provider value={{ logs, addLog, getRecentLogs, getAverageGlucose }}>
      {children}
    </LogContext.Provider>
  );
};
