import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GlucoseLog } from '@/types/logs';
import { useLogUtils } from './useLogUtils';

export const useLogAPI = () => {
  const [logs, setLogs] = useState<GlucoseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateMealContext } = useLogUtils(logs);

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
        const glucoseLogs: GlucoseLog[] = data.map(row => ({
          id: row.id,
          timestamp: new Date(row.timestamp),
          glucoseLevel: row.glucose_level !== null ? row.glucose_level : undefined,
          food: row.food,
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
      
      const logData = {
        timestamp: log.timestamp.toISOString(),
        glucose_level: log.glucoseLevel,
        meal_context: log.mealContext,
        food: log.food,
        notes: log.notes
      };

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
        const updatedLog: GlucoseLog = {
          id: data.id,
          timestamp: new Date(data.timestamp),
          glucoseLevel: data.glucose_level !== null ? data.glucose_level : undefined,
          food: data.food,
          mealContext: validateMealContext(data.meal_context),
          notes: data.notes
        };
        
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

  const deleteLog = async (logId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete logs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

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
      } else {
        setLogs(prev => prev.filter(log => log.id !== logId));
        
        toast({
          title: "Log deleted successfully",
          description: "The log entry has been removed",
        });
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error deleting log",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
