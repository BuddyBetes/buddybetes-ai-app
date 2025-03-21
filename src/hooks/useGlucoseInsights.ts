
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';

interface GlucoseStats {
  average: number;
  min: number;
  max: number;
  inRangePercent: number;
}

export const useGlucoseInsights = (timeRange: '24h' | '7d' | '30d' = '7d') => {
  const [insights, setInsights] = useState<string[]>([]);
  const [stats, setStats] = useState<GlucoseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getGlucoseLogsOnly } = useLogContext();
  const { toast } = useToast();

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get recent glucose logs - only include logs with glucose readings
      const recentLogs = getGlucoseLogsOnly(30);
      
      if (recentLogs.length === 0) {
        setInsights([
          "Start logging your glucose readings to receive personalized insights.",
          "Regular tracking helps identify patterns in your glucose levels."
        ]);
        setStats(null);
        return;
      }

      // Check if Tagalog is enabled from localStorage
      const preferTagalog = localStorage.getItem('preferTagalog') === 'true';

      // Call the Supabase Edge Function with language preference
      const { data, error } = await supabase.functions.invoke('glucose-insights', {
        body: { 
          glucoseHistory: recentLogs,
          language: preferTagalog ? 'tagalog' : 'english',
          timeRange: timeRange
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
        setStats(null);
        return;
      }

      if (data?.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
        
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setInsights([
          "Keep logging your glucose to receive more personalized insights.",
          "The more data you provide, the better the insights will be."
        ]);
        setStats(null);
      }
    } catch (err) {
      console.error('Error in useGlucoseInsights:', err);
      setInsights([
        "Something went wrong when generating insights.",
        "Please try refreshing the page."
      ]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [getGlucoseLogsOnly, toast, timeRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { 
    insights, 
    stats,
    isLoading,
    refreshInsights: fetchInsights 
  };
};
