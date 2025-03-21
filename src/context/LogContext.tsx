
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GlucoseLog {
  id: string;
  timestamp: Date;
  glucoseLevel: number | undefined;
  food?: string;
  mealContext?: 'before' | 'after' | 'fasting';
  medication?: string;
  weight?: number;
  notes?: string;
}

interface LogContextType {
  logs: GlucoseLog[];
  addLog: (log: Omit<GlucoseLog, 'id'>) => Promise<void>;
  getRecentLogs: (count: number) => GlucoseLog[];
  getGlucoseLogsOnly: (count: number) => GlucoseLog[];
  getLogsForToday: () => GlucoseLog[];
  getAverageGlucose: () => number;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch logs from Supabase
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        setLogs([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('glucose_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error fetching glucose logs:', error);
          toast({
            title: "Error fetching logs",
            description: error.message,
            variant: "destructive",
          });
        } else if (data) {
          // Convert Supabase data to GlucoseLog objects
          const glucoseLogs: GlucoseLog[] = data.map(row => ({
            id: row.id,
            timestamp: new Date(row.timestamp),
            glucoseLevel: row.glucose_level !== null ? row.glucose_level : undefined,
            food: row.food,
            // Make sure to validate the meal_context type
            mealContext: validateMealContext(row.meal_context),
            notes: row.notes
          }));
          setLogs(glucoseLogs);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, toast]);

  // Helper function to validate meal_context values
  const validateMealContext = (mealContext: string | null): 'before' | 'after' | 'fasting' | undefined => {
    if (mealContext === 'before' || mealContext === 'after' || mealContext === 'fasting') {
      return mealContext;
    }
    return undefined;
  };

  const addLog = async (log: Omit<GlucoseLog, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add logs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare data for Supabase
      const logData = {
        user_id: user.id,
        timestamp: log.timestamp.toISOString(),
        glucose_level: log.glucoseLevel,
        meal_context: log.mealContext,
        food: log.food,
        notes: log.notes
      };

      const { data, error } = await supabase
        .from('glucose_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('Error adding log:', error);
        toast({
          title: "Error adding log",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        // Convert back to GlucoseLog and add to state
        const newLog: GlucoseLog = {
          id: data.id,
          timestamp: new Date(data.timestamp),
          glucoseLevel: data.glucose_level !== null ? data.glucose_level : undefined,
          food: data.food,
          mealContext: validateMealContext(data.meal_context),
          notes: data.notes
        };
        
        setLogs(prev => [newLog, ...prev]);
        
        toast({
          title: "Log added successfully",
          description: log.glucoseLevel ? `Glucose level: ${log.glucoseLevel} added to your logs` : `Food log added successfully`,
        });
      }
    } catch (error) {
      console.error('Error adding log:', error);
      toast({
        title: "Error adding log",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentLogs = (count: number) => {
    return [...logs].slice(0, count);
  };

  // New method to get only logs with glucose readings
  const getGlucoseLogsOnly = (count: number) => {
    return [...logs]
      .filter(log => log.glucoseLevel !== undefined)
      .slice(0, count);
  };

  // New method to get all logs from today only
  const getLogsForToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  const getAverageGlucose = () => {
    const glucoseLogs = logs.filter(log => log.glucoseLevel !== undefined);
    if (glucoseLogs.length === 0) return 0;
    
    const sum = glucoseLogs.reduce((total, log) => {
      // TypeScript knows glucoseLevel is defined thanks to the filter above
      return total + (log.glucoseLevel as number);
    }, 0);
    
    return Math.round(sum / glucoseLogs.length);
  };

  return (
    <LogContext.Provider value={{ 
      logs, 
      addLog, 
      getRecentLogs, 
      getGlucoseLogsOnly,
      getLogsForToday,
      getAverageGlucose, 
      isLoading 
    }}>
      {children}
    </LogContext.Provider>
  );
};
