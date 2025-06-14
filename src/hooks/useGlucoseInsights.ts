
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';

interface GlucoseStats {
  average: number;
  min: number;
  max: number;
  inRangePercent: number;
  totalReadings?: number;
  mealsLogged?: number;
  exerciseEntries?: number;
}

interface InsightAnalysis {
  mealImpact?: string;
  exerciseImpact?: string;
  timePatterns?: string;
}

interface EnhancedInsight {
  text: string;
  category?: 'diet' | 'timing' | 'exercise' | 'general';
  priority?: 'high' | 'medium' | 'low';
}

export const useGlucoseInsights = (timeRange: '24h' | '7d' | '30d' | '3m' | '6m' = '7d') => {
  const [insights, setInsights] = useState<string[]>([]);
  const [stats, setStats] = useState<GlucoseStats | null>(null);
  const [analysis, setAnalysis] = useState<InsightAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getGlucoseLogsOnly, logs } = useLogContext();
  const { toast } = useToast();

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get data count based on time range - for longer periods, get more data for context
      const dataCount = timeRange === '6m' ? 180 : timeRange === '3m' ? 90 : 30;
      const recentLogs = getGlucoseLogsOnly(dataCount);
      
      if (recentLogs.length === 0) {
        setInsights([]);
        setStats(null);
        setAnalysis(null);
        return;
      }

      // Check if Tagalog is enabled from localStorage
      const preferTagalog = localStorage.getItem('preferTagalog') === 'true';

      // Enhance logs with additional context from all logs
      const enhancedLogs = recentLogs.map(glucoseLog => {
        // Find related logs (same timestamp or close by) that might have meal/exercise info
        const relatedLogs = logs.filter(log => 
          Math.abs(new Date(log.timestamp).getTime() - new Date(glucoseLog.timestamp).getTime()) < 30 * 60 * 1000 // within 30 minutes
        );
        
        const mealInfo = relatedLogs.find(log => log.food && log.food.trim().length > 0);
        const exerciseInfo = relatedLogs.find(log => 
          log.notes && (
            log.notes.toLowerCase().includes('exercise') ||
            log.notes.toLowerCase().includes('walk') ||
            log.notes.toLowerCase().includes('gym') ||
            log.notes.toLowerCase().includes('run')
          )
        );

        return {
          ...glucoseLog,
          food: mealInfo?.food || glucoseLog.food,
          mealContext: mealInfo?.mealContext || glucoseLog.mealContext,
          notes: exerciseInfo?.notes || glucoseLog.notes
        };
      });

      // Call the Supabase Edge Function with enhanced data
      const { data, error } = await supabase.functions.invoke('glucose-insights', {
        body: { 
          glucoseHistory: enhancedLogs,
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
        setInsights([]);
        setStats(null);
        setAnalysis(null);
        return;
      }

      if (data?.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
        
        if (data.stats) {
          setStats(data.stats);
        }

        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      } else {
        setInsights([]);
        setStats(null);
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Error in useGlucoseInsights:', err);
      setInsights([]);
      setStats(null);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [getGlucoseLogsOnly, logs, toast, timeRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { 
    insights, 
    stats,
    analysis,
    isLoading,
    refreshInsights: fetchInsights 
  };
};
