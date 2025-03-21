
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';

export const useGlucoseInsights = () => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getRecentLogs } = useLogContext();
  const { toast } = useToast();

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get recent glucose logs
      const recentLogs = getRecentLogs(10);
      
      if (recentLogs.length === 0) {
        setInsights([
          "Start logging your glucose readings to receive personalized insights.",
          "Regular tracking helps identify patterns in your glucose levels."
        ]);
        return;
      }

      // Check if Tagalog is enabled from localStorage
      const preferTagalog = localStorage.getItem('preferTagalog') === 'true';

      // Call the Supabase Edge Function with language preference
      const { data, error } = await supabase.functions.invoke('glucose-insights', {
        body: { 
          glucoseHistory: recentLogs,
          language: preferTagalog ? 'tagalog' : 'english'
        }
      });

      if (error) {
        console.error('Error fetching glucose insights:', error);
        toast({
          title: "Error",
          description: "Failed to load AI insights. Please try again later.",
          variant: "destructive"
        });
        setInsights([
          "Unable to generate insights right now.",
          "Please check your connection and try again."
        ]);
        return;
      }

      if (data?.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
      } else {
        setInsights([
          "Keep logging your glucose to receive more personalized insights.",
          "The more data you provide, the better the insights will be."
        ]);
      }
    } catch (err) {
      console.error('Error in useGlucoseInsights:', err);
      setInsights([
        "Something went wrong when generating insights.",
        "Please try refreshing the page."
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [getRecentLogs, toast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { 
    insights, 
    isLoading,
    refreshInsights: fetchInsights 
  };
};
