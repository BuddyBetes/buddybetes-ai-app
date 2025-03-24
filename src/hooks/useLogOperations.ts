
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GlucoseLog } from '@/types/logs';
import { useLogTransformers } from './useLogTransformers';
import { useLogState } from './useLogState';

/**
 * Hook for log CRUD operations
 */
export const useLogOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { transformDbRowToLog, transformLogToDbRow } = useLogTransformers();
  const { logs, setLogs, isLoading, setIsLoading } = useLogState();

  const fetchLogs = useCallback(async () => {
    if (!user) {
      console.log('No authenticated user found, clearing logs');
      setLogs([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching logs for user:', user.id);
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
        console.log('Received logs from Supabase:', data.length);
        const glucoseLogs: GlucoseLog[] = data.map(row => transformDbRowToLog(row));
        setLogs(glucoseLogs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, setLogs, setIsLoading, transformDbRowToLog]);

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
      
      const logData = transformLogToDbRow(log, user.id);

      console.log('Adding new log to Supabase:', logData);
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
        const newLog = transformDbRowToLog(data);
        
        setLogs(prev => [newLog, ...prev]);
        console.log('Log added successfully:', newLog);
        
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

  const updateLog = async (log: GlucoseLog) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update logs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const logData = transformLogToDbRow(log, user.id);

      const { data, error } = await supabase
        .from('glucose_logs')
        .update(logData)
        .eq('id', log.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating log:', error);
        toast({
          title: "Error updating log",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        const updatedLog = transformDbRowToLog(data);
        
        setLogs(prev => prev.map(item => item.id === updatedLog.id ? updatedLog : item));
        
        toast({
          title: "Log updated successfully",
          description: log.glucoseLevel ? `Glucose level: ${log.glucoseLevel} updated` : `Food log updated successfully`,
        });
      }
    } catch (error) {
      console.error('Error updating log:', error);
      toast({
        title: "Error updating log",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLog = async (logId: string): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete logs",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      // Don't set global loading state to avoid UI freezing
      
      const { error } = await supabase
        .from('glucose_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting log:', error);
        toast({
          title: "Error deleting log",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } else {
        // Update local state immediately
        setLogs(prev => prev.filter(log => log.id !== logId));
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error deleting log",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    logs,
    isLoading,
    fetchLogs,
    addLog,
    updateLog,
    deleteLog
  };
};
